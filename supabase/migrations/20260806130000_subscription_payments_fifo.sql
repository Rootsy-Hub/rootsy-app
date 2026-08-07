-- Fase 4: pagos de plataforma + asignación FIFO a cargos + saldo a favor del POP.

ALTER TABLE public.pops
  ADD COLUMN IF NOT EXISTS billing_credit_balance numeric NOT NULL DEFAULT 0
    CHECK (billing_credit_balance >= 0);

COMMENT ON COLUMN public.pops.billing_credit_balance IS
  'Saldo a favor del POP para aplicar automáticamente en futuros cargos (FIFO).';

-- 1) Pagos (sin vínculo directo al cargo)
CREATE TABLE IF NOT EXISTS public._subscription_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pop_id uuid NOT NULL REFERENCES public.pops (id) ON DELETE CASCADE,
  amount numeric NOT NULL CHECK (amount > 0),
  currency text NOT NULL DEFAULT 'ARS',
  source text NOT NULL DEFAULT 'manual'
    CHECK (source IN ('manual', 'stripe', 'system')),
  organization_payment_method_id uuid
    REFERENCES public._organization_payment_methods (id) ON DELETE SET NULL,
  external_payment_id text,
  paid_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx__subscription_payments_pop_paid_at
  ON public._subscription_payments (pop_id, paid_at DESC);

CREATE TRIGGER update__subscription_payments_updated_at
  BEFORE UPDATE ON public._subscription_payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 2) Asignaciones FIFO pago → cargo
CREATE TABLE IF NOT EXISTS public._subscription_payment_allocations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id uuid NOT NULL REFERENCES public._subscription_payments (id) ON DELETE CASCADE,
  charge_id uuid NOT NULL REFERENCES public._subscription_charges (id) ON DELETE CASCADE,
  amount_allocated numeric NOT NULL CHECK (amount_allocated > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (payment_id, charge_id)
);

CREATE INDEX IF NOT EXISTS idx__subscription_payment_allocations_charge_id
  ON public._subscription_payment_allocations (charge_id);

CREATE INDEX IF NOT EXISTS idx__subscription_payment_allocations_payment_id
  ON public._subscription_payment_allocations (payment_id);

-- 3) amount_paid del cargo = suma de allocations
CREATE OR REPLACE FUNCTION public.refresh_subscription_charge_amount_paid (
  p_charge_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_amount_paid numeric;
  v_paid_at timestamptz;
BEGIN
  SELECT
    COALESCE(SUM(a.amount_allocated), 0),
    MAX(p.paid_at)
  INTO v_amount_paid, v_paid_at
  FROM public._subscription_payment_allocations a
  JOIN public._subscription_payments p ON p.id = a.payment_id
  WHERE a.charge_id = p_charge_id;

  UPDATE public._subscription_charges
  SET
    amount_paid = v_amount_paid,
    paid_at = CASE
      WHEN v_amount_paid >= total THEN v_paid_at
      ELSE NULL
    END,
    updated_at = now()
  WHERE id = p_charge_id;

  PERFORM public.sync_subscription_charge_totals(p_charge_id);
END;
$function$;

CREATE OR REPLACE FUNCTION public.trg_refresh_charge_amount_paid_from_allocations ()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  PERFORM public.refresh_subscription_charge_amount_paid(
    COALESCE(NEW.charge_id, OLD.charge_id)
  );
  RETURN COALESCE(NEW, OLD);
END;
$function$;

DROP TRIGGER IF EXISTS refresh_charge_amount_paid_on_allocations
  ON public._subscription_payment_allocations;
CREATE TRIGGER refresh_charge_amount_paid_on_allocations
  AFTER INSERT OR UPDATE OR DELETE ON public._subscription_payment_allocations
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_refresh_charge_amount_paid_from_allocations();

-- 4) Activar subscripción cuando el cargo del período queda pagado
CREATE OR REPLACE FUNCTION public.activate_pop_subscriptions_after_billing (
  p_pop_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public._pop_subscriptions ps
  SET
    status = 'active',
    plan_id = COALESCE(ps.scheduled_plan_id, ps.plan_id),
    billing_cycle = COALESCE(ps.scheduled_billing_cycle, ps.billing_cycle),
    current_period_start = c.period_start,
    current_period_end = c.period_end,
    updated_at = now()
  FROM public._subscription_charges c
  WHERE c.pop_id = p_pop_id
    AND c.subscription_id = ps.id
    AND c.status = 'paid'
    AND ps.status IN ('pending_payment', 'trial', 'past_due')
    AND c.id = (
      SELECT c2.id
      FROM public._subscription_charges c2
      WHERE c2.subscription_id = ps.id
        AND c2.status = 'paid'
      ORDER BY c2.period_end DESC
      LIMIT 1
    );
END;
$function$;

-- 5) FIFO: aplicar monto disponible a cargos abiertos (due_at ASC)
CREATE OR REPLACE FUNCTION public.allocate_pop_billing_fifo (
  p_pop_id uuid,
  p_payment_id uuid,
  p_available_amount numeric
)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_remaining numeric := GREATEST(COALESCE(p_available_amount, 0), 0);
  v_charge record;
  v_due numeric;
  v_alloc numeric;
BEGIN
  IF v_remaining <= 0 THEN
    RETURN 0;
  END IF;

  FOR v_charge IN
    SELECT
      c.id,
      c.total,
      c.amount_paid
    FROM public._subscription_charges c
    WHERE c.pop_id = p_pop_id
      AND c.status IN ('open', 'partial', 'overdue')
    ORDER BY c.due_at ASC, c.created_at ASC
    FOR UPDATE
  LOOP
    EXIT WHEN v_remaining <= 0;

    v_due := GREATEST(COALESCE(v_charge.total, 0) - COALESCE(v_charge.amount_paid, 0), 0);
    IF v_due <= 0 THEN
      CONTINUE;
    END IF;

    v_alloc := LEAST(v_remaining, v_due);

    INSERT INTO public._subscription_payment_allocations (
      payment_id,
      charge_id,
      amount_allocated
    )
    VALUES (
      p_payment_id,
      v_charge.id,
      v_alloc
    )
    ON CONFLICT (payment_id, charge_id)
    DO UPDATE SET
      amount_allocated = _subscription_payment_allocations.amount_allocated + EXCLUDED.amount_allocated;

    v_remaining := v_remaining - v_alloc;
  END LOOP;

  RETURN v_remaining;
END;
$function$;

-- 6) Registrar pago en POP y asignar FIFO (+ saldo a favor)
CREATE OR REPLACE FUNCTION public.register_pop_subscription_payment (
  p_pop_id uuid,
  p_amount numeric,
  p_paid_at timestamptz DEFAULT now(),
  p_source text DEFAULT 'manual',
  p_payment_method_id uuid DEFAULT NULL,
  p_external_payment_id text DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id uuid := auth.uid();
  v_payment_id uuid;
  v_credit numeric;
  v_available numeric;
  v_remaining numeric;
  v_allocations jsonb := '[]'::jsonb;
BEGIN
  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'Importe de pago inválido';
  END IF;

  IF p_source NOT IN ('manual', 'stripe', 'system') THEN
    RAISE EXCEPTION 'Origen de pago inválido';
  END IF;

  IF v_user_id IS NOT NULL THEN
    PERFORM public.assert_user_can_manage_pop_billing(p_pop_id, v_user_id);
  END IF;

  SELECT p.billing_credit_balance
  INTO v_credit
  FROM public.pops p
  WHERE p.id = p_pop_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'POP no encontrado';
  END IF;

  v_available := p_amount + COALESCE(v_credit, 0);

  INSERT INTO public._subscription_payments (
    pop_id,
    amount,
    source,
    organization_payment_method_id,
    external_payment_id,
    paid_at,
    metadata,
    created_by
  )
  VALUES (
    p_pop_id,
    p_amount,
    p_source,
    p_payment_method_id,
    p_external_payment_id,
    COALESCE(p_paid_at, now()),
    COALESCE(p_metadata, '{}'::jsonb),
    v_user_id
  )
  RETURNING id INTO v_payment_id;

  IF v_credit > 0 THEN
    UPDATE public.pops
    SET billing_credit_balance = 0, updated_at = now()
    WHERE id = p_pop_id;
  END IF;

  v_remaining := public.allocate_pop_billing_fifo(
    p_pop_id,
    v_payment_id,
    v_available
  );

  UPDATE public.pops
  SET
    billing_credit_balance = v_remaining,
    updated_at = now()
  WHERE id = p_pop_id;

  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'charge_id', a.charge_id,
        'amount_allocated', a.amount_allocated
      )
      ORDER BY a.created_at
    ),
    '[]'::jsonb
  )
  INTO v_allocations
  FROM public._subscription_payment_allocations a
  WHERE a.payment_id = v_payment_id;

  PERFORM public.activate_pop_subscriptions_after_billing(p_pop_id);

  INSERT INTO public._subscription_events (
    pop_id,
    subscription_id,
    event_type,
    payload,
    created_by
  )
  SELECT
    p_pop_id,
    p.subscription_id,
    'payment_received',
    jsonb_build_object(
      'payment_id', v_payment_id,
      'amount', p_amount,
      'credit_applied', COALESCE(v_credit, 0),
      'credit_remaining', v_remaining,
      'allocations', v_allocations,
      'payment_source', p_source,
      'external_payment_id', p_external_payment_id,
      'metadata', COALESCE(p_metadata, '{}'::jsonb)
    ),
    v_user_id
  FROM public.pops p
  WHERE p.id = p_pop_id;

  RETURN v_payment_id;
END;
$function$;

-- 7) Wrapper legacy: pago contra POP del cargo (FIFO, no dirigido)
CREATE OR REPLACE FUNCTION public.apply_subscription_charge_payment (
  p_charge_id uuid,
  p_amount numeric,
  p_paid_at timestamptz DEFAULT now(),
  p_source text DEFAULT 'manual',
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_pop_id uuid;
  v_payment_id uuid;
BEGIN
  SELECT c.pop_id
  INTO v_pop_id
  FROM public._subscription_charges c
  WHERE c.id = p_charge_id
    AND c.status <> 'void';

  IF v_pop_id IS NULL THEN
    RAISE EXCEPTION 'Cargo no encontrado';
  END IF;

  v_payment_id := public.register_pop_subscription_payment(
    v_pop_id,
    p_amount,
    p_paid_at,
    p_source,
    NULL,
    NULL,
    COALESCE(p_metadata, '{}'::jsonb) || jsonb_build_object('requested_charge_id', p_charge_id)
  );

  RETURN v_payment_id;
END;
$function$;

-- 8) Resumen de saldo del POP
CREATE OR REPLACE FUNCTION public.get_pop_billing_summary (p_pop_id uuid)
RETURNS TABLE (
  open_charges_count integer,
  total_due numeric,
  total_paid_on_charges numeric,
  balance_due numeric,
  billing_credit_balance numeric,
  payments_count integer,
  payments_total numeric
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT
    (
      SELECT COUNT(*)::integer
      FROM public._subscription_charges c
      WHERE c.pop_id = p_pop_id
        AND c.status IN ('open', 'partial', 'overdue')
    ) AS open_charges_count,
    (
      SELECT COALESCE(SUM(c.total), 0)
      FROM public._subscription_charges c
      WHERE c.pop_id = p_pop_id
        AND c.status IN ('open', 'partial', 'overdue')
    ) AS total_due,
    (
      SELECT COALESCE(SUM(c.amount_paid), 0)
      FROM public._subscription_charges c
      WHERE c.pop_id = p_pop_id
    ) AS total_paid_on_charges,
    (
      SELECT COALESCE(SUM(GREATEST(c.total - c.amount_paid, 0)), 0)
      FROM public._subscription_charges c
      WHERE c.pop_id = p_pop_id
        AND c.status IN ('open', 'partial', 'overdue')
    ) AS balance_due,
    (
      SELECT COALESCE(p.billing_credit_balance, 0)
      FROM public.pops p
      WHERE p.id = p_pop_id
    ) AS billing_credit_balance,
    (
      SELECT COUNT(*)::integer
      FROM public._subscription_payments pay
      WHERE pay.pop_id = p_pop_id
    ) AS payments_count,
    (
      SELECT COALESCE(SUM(pay.amount), 0)
      FROM public._subscription_payments pay
      WHERE pay.pop_id = p_pop_id
    ) AS payments_total;
$function$;

-- Mantener alias de Fase 3
CREATE OR REPLACE FUNCTION public.get_pop_open_charge_balance (p_pop_id uuid)
RETURNS TABLE (
  open_charges_count integer,
  total_due numeric,
  total_paid numeric,
  balance_due numeric
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT
    s.open_charges_count,
    s.total_due,
    s.total_paid_on_charges AS total_paid,
    s.balance_due
  FROM public.get_pop_billing_summary(p_pop_id) s;
$function$;

-- 9) Backfill: pagos sintéticos para cargos ya pagados
DO $$
DECLARE
  c RECORD;
  v_payment_id uuid;
BEGIN
  IF EXISTS (SELECT 1 FROM public._subscription_payments LIMIT 1) THEN
    RAISE NOTICE 'Pagos ya migrados, omitiendo.';
    RETURN;
  END IF;

  FOR c IN
    SELECT *
    FROM public._subscription_charges
    WHERE amount_paid > 0
    ORDER BY paid_at ASC NULLS LAST, created_at ASC
  LOOP
    INSERT INTO public._subscription_payments (
      pop_id,
      amount,
      source,
      paid_at,
      metadata,
      created_at,
      updated_at
    )
    VALUES (
      c.pop_id,
      c.amount_paid,
      c.source,
      COALESCE(c.paid_at, c.created_at),
      jsonb_build_object(
        'migrated_from_charge_id', c.id,
        'legacy', true
      ),
      COALESCE(c.paid_at, c.created_at),
      COALESCE(c.paid_at, c.created_at)
    )
    RETURNING id INTO v_payment_id;

    INSERT INTO public._subscription_payment_allocations (
      payment_id,
      charge_id,
      amount_allocated
    )
    VALUES (
      v_payment_id,
      c.id,
      c.amount_paid
    )
    ON CONFLICT (payment_id, charge_id) DO NOTHING;

    PERFORM public.refresh_subscription_charge_amount_paid(c.id);
  END LOOP;
END $$;

-- 10) RLS
ALTER TABLE public._subscription_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public._subscription_payment_allocations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can view pop subscription payments"
  ON public._subscription_payments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.pops p
      WHERE p.id = pop_id
        AND (
          p.owner_user_id = auth.uid()
          OR public.user_has_pop_access(pop_id, auth.uid())
        )
    )
  );

CREATE POLICY "Owners can view pop payment allocations"
  ON public._subscription_payment_allocations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public._subscription_payments pay
      JOIN public.pops p ON p.id = pay.pop_id
      WHERE pay.id = payment_id
        AND (
          p.owner_user_id = auth.uid()
          OR public.user_has_pop_access(pay.pop_id, auth.uid())
        )
    )
  );
