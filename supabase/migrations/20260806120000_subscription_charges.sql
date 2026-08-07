-- Fase 3: cargos de subscripción + líneas detalladas. Migra _subscription_invoices.

-- 1) Cargos
CREATE TABLE IF NOT EXISTS public._subscription_charges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pop_id uuid NOT NULL REFERENCES public.pops (id) ON DELETE CASCADE,
  subscription_id uuid NOT NULL REFERENCES public._pop_subscriptions (id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES public._subscription_plans (id) ON DELETE RESTRICT,
  business_type_id uuid NOT NULL REFERENCES public._business_types (id) ON DELETE RESTRICT,
  billing_cycle text NOT NULL
    CHECK (billing_cycle IN ('monthly', 'yearly')),
  period_start timestamptz NOT NULL,
  period_end timestamptz NOT NULL,
  due_at timestamptz NOT NULL,
  currency text NOT NULL DEFAULT 'ARS',
  subtotal numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  amount_paid numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'open'
    CHECK (
      status IN (
        'draft',
        'open',
        'partial',
        'paid',
        'overdue',
        'void',
        'paused'
      )
    ),
  organization_payment_method_id uuid
    REFERENCES public._organization_payment_methods (id) ON DELETE SET NULL,
  source text NOT NULL DEFAULT 'system'
    CHECK (source IN ('manual', 'stripe', 'system')),
  paid_at timestamptz,
  voided_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT _subscription_charges_amount_paid_non_negative
    CHECK (amount_paid >= 0),
  CONSTRAINT _subscription_charges_total_non_negative
    CHECK (total >= 0)
);

CREATE INDEX IF NOT EXISTS idx__subscription_charges_pop_due
  ON public._subscription_charges (pop_id, due_at ASC, created_at ASC);

CREATE INDEX IF NOT EXISTS idx__subscription_charges_pop_status
  ON public._subscription_charges (pop_id, status, created_at DESC);

CREATE TRIGGER update__subscription_charges_updated_at
  BEFORE UPDATE ON public._subscription_charges
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 2) Líneas de cargo
CREATE TABLE IF NOT EXISTS public._subscription_charge_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  charge_id uuid NOT NULL REFERENCES public._subscription_charges (id) ON DELETE CASCADE,
  line_type text NOT NULL
    CHECK (
      line_type IN (
        'plan_base',
        'extra_module',
        'discount',
        'interest',
        'tax',
        'fee',
        'credit',
        'proration',
        'other'
      )
    ),
  label text NOT NULL,
  amount numeric NOT NULL,
  quantity numeric NOT NULL DEFAULT 1,
  unit_amount numeric,
  sort_order integer NOT NULL DEFAULT 0,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx__subscription_charge_lines_charge_id
  ON public._subscription_charge_lines (charge_id, sort_order ASC);

-- 3) Recalcular totales y status del cargo
CREATE OR REPLACE FUNCTION public.sync_subscription_charge_totals (p_charge_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_subtotal numeric;
  v_total numeric;
  v_amount_paid numeric;
  v_due_at timestamptz;
  v_status text;
  v_voided_at timestamptz;
BEGIN
  SELECT
    COALESCE(SUM(CASE WHEN l.amount > 0 THEN l.amount ELSE 0 END), 0),
    COALESCE(SUM(l.amount), 0)
  INTO v_subtotal, v_total
  FROM public._subscription_charge_lines l
  WHERE l.charge_id = p_charge_id;

  SELECT c.amount_paid, c.due_at, c.status, c.voided_at
  INTO v_amount_paid, v_due_at, v_status, v_voided_at
  FROM public._subscription_charges c
  WHERE c.id = p_charge_id
  FOR UPDATE;

  IF v_voided_at IS NOT NULL OR v_status = 'void' THEN
    v_status := 'void';
  ELSIF v_status = 'paused' THEN
    v_status := 'paused';
  ELSIF v_status = 'draft' THEN
    v_status := 'draft';
  ELSIF v_total <= 0 OR v_amount_paid >= v_total THEN
    v_status := 'paid';
  ELSIF v_amount_paid > 0 THEN
    v_status := 'partial';
  ELSIF v_due_at < now() THEN
    v_status := 'overdue';
  ELSE
    v_status := 'open';
  END IF;

  UPDATE public._subscription_charges
  SET
    subtotal = v_subtotal,
    total = GREATEST(v_total, 0),
    status = v_status,
    paid_at = CASE
      WHEN v_status = 'paid' THEN COALESCE(paid_at, now())
      ELSE paid_at
    END,
    updated_at = now()
  WHERE id = p_charge_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.trg_sync_subscription_charge_totals ()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  PERFORM public.sync_subscription_charge_totals(
    COALESCE(NEW.charge_id, OLD.charge_id)
  );
  RETURN COALESCE(NEW, OLD);
END;
$function$;

DROP TRIGGER IF EXISTS sync_subscription_charge_totals_on_lines ON public._subscription_charge_lines;
CREATE TRIGGER sync_subscription_charge_totals_on_lines
  AFTER INSERT OR UPDATE OR DELETE ON public._subscription_charge_lines
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_sync_subscription_charge_totals();

-- 4) Construir líneas desde subscripción
CREATE OR REPLACE FUNCTION public.build_subscription_charge_lines_json (
  p_subscription_id uuid,
  p_use_scheduled_plan boolean DEFAULT false
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_plan_id uuid;
  v_plan_display_name text;
  v_business_type_id uuid;
  v_billing_cycle text;
  v_base_amount numeric;
  v_lines jsonb := '[]'::jsonb;
  v_extra record;
  v_sort integer := 0;
BEGIN
  SELECT
    CASE
      WHEN p_use_scheduled_plan THEN COALESCE(ps.scheduled_plan_id, ps.plan_id)
      ELSE ps.plan_id
    END,
    CASE
      WHEN p_use_scheduled_plan THEN sp_sched.display_name
      ELSE sp.display_name
    END,
    ps.business_type_id,
    CASE
      WHEN p_use_scheduled_plan THEN COALESCE(ps.scheduled_billing_cycle, ps.billing_cycle)
      ELSE ps.billing_cycle
    END
  INTO v_plan_id, v_plan_display_name, v_business_type_id, v_billing_cycle
  FROM public._pop_subscriptions ps
  JOIN public._subscription_plans sp ON sp.id = ps.plan_id
  LEFT JOIN public._subscription_plans sp_sched ON sp_sched.id = ps.scheduled_plan_id
  WHERE ps.id = p_subscription_id;

  IF v_plan_id IS NULL THEN
    RAISE EXCEPTION 'Subscripción no encontrada';
  END IF;

  SELECT
    CASE
      WHEN v_billing_cycle = 'yearly' THEN l.price_yearly
      ELSE l.price_monthly
    END
  INTO v_base_amount
  FROM public._subscription_plan_limits l
  WHERE l.plan_id = v_plan_id
    AND l.business_type_id = v_business_type_id;

  v_sort := v_sort + 1;
  v_lines := v_lines || jsonb_build_array(
    jsonb_build_object(
      'line_type', 'plan_base',
      'label', 'Plan ' || v_plan_display_name,
      'amount', COALESCE(v_base_amount, 0),
      'sort_order', v_sort
    )
  );

  FOR v_extra IN
    SELECT
      elem.value AS item
    FROM public._pop_subscriptions ps
    CROSS JOIN LATERAL jsonb_array_elements(ps.extra_modules) AS elem(value)
    WHERE ps.id = p_subscription_id
  LOOP
    v_sort := v_sort + 1;
    v_lines := v_lines || jsonb_build_array(
      jsonb_build_object(
        'line_type', 'extra_module',
        'label', 'Extra ' || COALESCE(v_extra.item ->> 'label', v_extra.item ->> 'key', 'Módulo'),
        'amount', COALESCE((v_extra.item ->> 'price_monthly')::numeric, 0),
        'sort_order', v_sort,
        'metadata', jsonb_build_object('module_key', v_extra.item ->> 'key')
      )
    );
  END LOOP;

  RETURN v_lines;
END;
$function$;

-- 5) Crear cargo + líneas
CREATE OR REPLACE FUNCTION public.create_subscription_charge (
  p_pop_id uuid,
  p_subscription_id uuid,
  p_period_start timestamptz,
  p_period_end timestamptz,
  p_due_at timestamptz,
  p_lines jsonb,
  p_billing_cycle text DEFAULT 'monthly',
  p_plan_id uuid DEFAULT NULL,
  p_organization_payment_method_id uuid DEFAULT NULL,
  p_source text DEFAULT 'system',
  p_metadata jsonb DEFAULT '{}'::jsonb,
  p_amount_paid numeric DEFAULT 0,
  p_paid_at timestamptz DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_charge_id uuid;
  v_plan_id uuid;
  v_business_type_id uuid;
  v_line jsonb;
  v_sort integer := 0;
BEGIN
  SELECT
    COALESCE(p_plan_id, ps.plan_id),
    ps.business_type_id,
    ps.organization_payment_method_id
  INTO v_plan_id, v_business_type_id, p_organization_payment_method_id
  FROM public._pop_subscriptions ps
  WHERE ps.id = p_subscription_id
    AND ps.pop_id = p_pop_id;

  IF v_plan_id IS NULL THEN
    RAISE EXCEPTION 'Subscripción inválida para el POP';
  END IF;

  IF p_billing_cycle NOT IN ('monthly', 'yearly') THEN
    RAISE EXCEPTION 'Ciclo de facturación inválido';
  END IF;

  IF p_source NOT IN ('manual', 'stripe', 'system') THEN
    RAISE EXCEPTION 'Origen de cargo inválido';
  END IF;

  INSERT INTO public._subscription_charges (
    pop_id,
    subscription_id,
    plan_id,
    business_type_id,
    billing_cycle,
    period_start,
    period_end,
    due_at,
    organization_payment_method_id,
    source,
    amount_paid,
    paid_at,
    metadata,
    status
  )
  VALUES (
    p_pop_id,
    p_subscription_id,
    v_plan_id,
    v_business_type_id,
    p_billing_cycle,
    p_period_start,
    p_period_end,
    p_due_at,
    p_organization_payment_method_id,
    p_source,
    GREATEST(COALESCE(p_amount_paid, 0), 0),
    p_paid_at,
    COALESCE(p_metadata, '{}'::jsonb),
    CASE
      WHEN COALESCE(p_amount_paid, 0) > 0 THEN 'partial'
      ELSE 'open'
    END
  )
  RETURNING id INTO v_charge_id;

  FOR v_line IN
    SELECT value
    FROM jsonb_array_elements(COALESCE(p_lines, '[]'::jsonb))
  LOOP
    v_sort := v_sort + 1;
    INSERT INTO public._subscription_charge_lines (
      charge_id,
      line_type,
      label,
      amount,
      quantity,
      unit_amount,
      sort_order,
      metadata
    )
    VALUES (
      v_charge_id,
      COALESCE(v_line ->> 'line_type', 'other'),
      COALESCE(v_line ->> 'label', 'Concepto'),
      COALESCE((v_line ->> 'amount')::numeric, 0),
      COALESCE((v_line ->> 'quantity')::numeric, 1),
      NULLIF(v_line ->> 'unit_amount', '')::numeric,
      COALESCE((v_line ->> 'sort_order')::integer, v_sort),
      COALESCE(v_line -> 'metadata', '{}'::jsonb)
    );
  END LOOP;

  PERFORM public.sync_subscription_charge_totals(v_charge_id);

  INSERT INTO public._subscription_events (
    pop_id,
    subscription_id,
    event_type,
    payload
  )
  VALUES (
    p_pop_id,
    p_subscription_id,
    'charge_created',
    jsonb_build_object(
      'charge_id', v_charge_id,
      'period_start', p_period_start,
      'period_end', p_period_end,
      'due_at', p_due_at,
      'billing_cycle', p_billing_cycle
    )
  );

  RETURN v_charge_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.create_subscription_charge_from_subscription (
  p_subscription_id uuid,
  p_period_start timestamptz DEFAULT now(),
  p_period_end timestamptz DEFAULT NULL,
  p_due_at timestamptz DEFAULT now(),
  p_use_scheduled_plan boolean DEFAULT false,
  p_extra_lines jsonb DEFAULT '[]'::jsonb,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_pop_id uuid;
  v_billing_cycle text;
  v_lines jsonb;
  v_period_end timestamptz;
BEGIN
  SELECT ps.pop_id, COALESCE(ps.scheduled_billing_cycle, ps.billing_cycle)
  INTO v_pop_id, v_billing_cycle
  FROM public._pop_subscriptions ps
  WHERE ps.id = p_subscription_id;

  IF v_pop_id IS NULL THEN
    RAISE EXCEPTION 'Subscripción no encontrada';
  END IF;

  v_period_end := COALESCE(
    p_period_end,
    CASE
      WHEN v_billing_cycle = 'yearly' THEN p_period_start + INTERVAL '1 year'
      ELSE p_period_start + INTERVAL '1 month'
    END
  );

  v_lines := public.build_subscription_charge_lines_json(
    p_subscription_id,
    p_use_scheduled_plan
  ) || COALESCE(p_extra_lines, '[]'::jsonb);

  RETURN public.create_subscription_charge(
    v_pop_id,
    p_subscription_id,
    p_period_start,
    v_period_end,
    p_due_at,
    v_lines,
    v_billing_cycle,
    NULL,
    NULL,
    'system',
    p_metadata,
    0,
    NULL
  );
END;
$function$;

-- 6) Marcar cargo pagado (puente hasta Fase 4 pagos FIFO)
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
  v_user_id uuid := auth.uid();
  v_pop_id uuid;
  v_subscription_id uuid;
  v_total numeric;
  v_new_paid numeric;
BEGIN
  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'Importe de pago inválido';
  END IF;

  SELECT c.pop_id, c.subscription_id, c.total, c.amount_paid
  INTO v_pop_id, v_subscription_id, v_total, v_new_paid
  FROM public._subscription_charges c
  WHERE c.id = p_charge_id
    AND c.status <> 'void'
  FOR UPDATE;

  IF v_pop_id IS NULL THEN
    RAISE EXCEPTION 'Cargo no encontrado';
  END IF;

  IF v_user_id IS NOT NULL THEN
    PERFORM public.assert_user_can_manage_pop_billing(v_pop_id, v_user_id);
  END IF;

  v_new_paid := COALESCE(v_new_paid, 0) + p_amount;

  UPDATE public._subscription_charges
  SET
    amount_paid = v_new_paid,
    paid_at = CASE
      WHEN v_new_paid >= total THEN COALESCE(p_paid_at, now())
      ELSE paid_at
    END,
    source = CASE
      WHEN p_source IN ('manual', 'stripe', 'system') THEN p_source
      ELSE source
    END,
    metadata = metadata || COALESCE(p_metadata, '{}'::jsonb),
    updated_at = now()
  WHERE id = p_charge_id;

  PERFORM public.sync_subscription_charge_totals(p_charge_id);

  UPDATE public._pop_subscriptions ps
  SET
    status = 'active',
    plan_id = COALESCE(ps.scheduled_plan_id, ps.plan_id),
    billing_cycle = COALESCE(ps.scheduled_billing_cycle, ps.billing_cycle),
    current_period_start = c.period_start,
    current_period_end = c.period_end,
    updated_at = now()
  FROM public._subscription_charges c
  WHERE c.id = p_charge_id
    AND ps.id = c.subscription_id
    AND ps.status IN ('pending_payment', 'trial', 'past_due');

  INSERT INTO public._subscription_events (
    pop_id,
    subscription_id,
    event_type,
    payload,
    created_by
  )
  VALUES (
    v_pop_id,
    v_subscription_id,
    'payment_received',
    jsonb_build_object(
      'charge_id', p_charge_id,
      'amount', p_amount,
      'amount_paid_total', v_new_paid,
      'charge_total', v_total,
      'payment_source', p_source,
      'metadata', COALESCE(p_metadata, '{}'::jsonb)
    ),
    v_user_id
  );

  RETURN p_charge_id;
END;
$function$;

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
    COUNT(*)::integer AS open_charges_count,
    COALESCE(SUM(c.total), 0) AS total_due,
    COALESCE(SUM(c.amount_paid), 0) AS total_paid,
    COALESCE(SUM(GREATEST(c.total - c.amount_paid, 0)), 0) AS balance_due
  FROM public._subscription_charges c
  WHERE c.pop_id = p_pop_id
    AND c.status IN ('open', 'partial', 'overdue');
$function$;

-- 7) Migrar invoices existentes → cargos + líneas
DO $$
DECLARE
  inv RECORD;
  v_charge_id uuid;
  v_line jsonb;
  v_sort integer;
  v_line_type text;
  v_status text;
  v_amount_paid numeric;
BEGIN
  IF EXISTS (SELECT 1 FROM public._subscription_charges LIMIT 1) THEN
    RAISE NOTICE 'Cargos ya migrados, omitiendo.';
    RETURN;
  END IF;

  FOR inv IN
    SELECT *
    FROM public._subscription_invoices
    ORDER BY created_at ASC
  LOOP
    v_status := CASE inv.status
      WHEN 'paid' THEN 'paid'
      WHEN 'void' THEN 'void'
      WHEN 'failed' THEN 'overdue'
      ELSE 'open'
    END;

    v_amount_paid := CASE
      WHEN inv.status = 'paid' THEN inv.amount
      ELSE 0
    END;

    INSERT INTO public._subscription_charges (
      id,
      pop_id,
      subscription_id,
      plan_id,
      business_type_id,
      billing_cycle,
      period_start,
      period_end,
      due_at,
      currency,
      subtotal,
      total,
      amount_paid,
      status,
      source,
      paid_at,
      metadata,
      created_at,
      updated_at
    )
    VALUES (
      inv.id,
      inv.pop_id,
      inv.subscription_id,
      inv.plan_id,
      inv.business_type_id,
      'monthly',
      inv.period_start,
      inv.period_end,
      COALESCE(inv.due_at, inv.period_start),
      inv.currency,
      COALESCE((inv.metadata ->> 'gross_amount')::numeric, inv.amount),
      inv.amount,
      v_amount_paid,
      v_status,
      CASE inv.payment_method
        WHEN 'stripe' THEN 'stripe'
        ELSE 'manual'
      END,
      inv.paid_at,
      inv.metadata,
      inv.created_at,
      inv.updated_at
    )
    RETURNING id INTO v_charge_id;

    v_sort := 0;

    IF jsonb_typeof(inv.metadata -> 'line_items') = 'array' THEN
      FOR v_line IN
        SELECT value
        FROM jsonb_array_elements(inv.metadata -> 'line_items')
      LOOP
        v_sort := v_sort + 1;
        v_line_type := CASE
          WHEN COALESCE(v_line ->> 'label', '') ILIKE 'plan %' THEN 'plan_base'
          WHEN COALESCE(v_line ->> 'label', '') ILIKE 'extra %' THEN 'extra_module'
          ELSE 'other'
        END;

        INSERT INTO public._subscription_charge_lines (
          charge_id,
          line_type,
          label,
          amount,
          sort_order
        )
        VALUES (
          v_charge_id,
          v_line_type,
          COALESCE(v_line ->> 'label', 'Concepto'),
          COALESCE((v_line ->> 'amount')::numeric, 0),
          v_sort
        );
      END LOOP;
    END IF;

    IF inv.metadata ? 'proration' THEN
      v_sort := v_sort + 1;
      INSERT INTO public._subscription_charge_lines (
        charge_id,
        line_type,
        label,
        amount,
        sort_order,
        metadata
      )
      VALUES (
        v_charge_id,
        'proration',
        'Crédito por prorrateo',
        -ABS(COALESCE((inv.metadata -> 'proration' ->> 'credit_amount')::numeric, 0)),
        v_sort,
        inv.metadata -> 'proration'
      );
    END IF;

    IF v_sort = 0 THEN
      INSERT INTO public._subscription_charge_lines (
        charge_id,
        line_type,
        label,
        amount,
        sort_order
      )
      VALUES (
        v_charge_id,
        'other',
        'Cargo de subscripción',
        inv.amount,
        1
      );
    END IF;

    PERFORM public.sync_subscription_charge_totals(v_charge_id);
  END LOOP;
END $$;

-- 8) Compatibilidad backoffice: vista sobre cargos con forma de invoices
ALTER TABLE public._subscription_invoices RENAME TO _subscription_invoices_legacy;

DROP TRIGGER IF EXISTS update__subscription_invoices_updated_at
  ON public._subscription_invoices_legacy;

DROP POLICY IF EXISTS "Owners can view their subscription invoices"
  ON public._subscription_invoices_legacy;

CREATE OR REPLACE VIEW public._subscription_invoices
WITH (security_invoker = true)
AS
SELECT
  c.id,
  c.pop_id,
  c.subscription_id,
  c.plan_id,
  c.business_type_id,
  c.period_start,
  c.period_end,
  c.total AS amount,
  c.currency,
  CASE
    WHEN c.status = 'paid' THEN 'paid'
    WHEN c.status = 'void' THEN 'void'
    WHEN c.status = 'overdue' THEN 'failed'
    ELSE 'pending'
  END AS status,
  CASE
    WHEN c.source = 'stripe' THEN 'stripe'
    ELSE 'manual'
  END AS payment_method,
  c.paid_at,
  c.due_at,
  c.metadata,
  c.created_at,
  c.updated_at
FROM public._subscription_charges c;

COMMENT ON VIEW public._subscription_invoices IS
  'Compatibilidad temporal: proyección de _subscription_charges al esquema legacy.';

-- 9) start_pop_paid_subscription crea el primer cargo
CREATE OR REPLACE FUNCTION public.start_pop_paid_subscription (
  p_pop_id uuid,
  p_plan_id uuid,
  p_billing_cycle text DEFAULT 'monthly',
  p_payment_method_id uuid DEFAULT NULL,
  p_extra_modules jsonb DEFAULT '[]'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id uuid := auth.uid();
  v_org_id uuid;
  v_business_type_id uuid;
  v_payment_method_id uuid;
  v_subscription_id uuid;
  v_plan_name text;
  v_price_monthly numeric;
  v_price_yearly numeric;
  v_period_end timestamptz;
  v_charge_id uuid;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuario no autenticado';
  END IF;

  v_org_id := public.assert_user_can_manage_pop_billing(p_pop_id, v_user_id);

  IF public.organization_trial_is_available(v_org_id) THEN
    RAISE EXCEPTION 'Este POP debe iniciar con prueba gratis antes de contratar un plan pago';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.pops p WHERE p.id = p_pop_id AND p.subscription_id IS NOT NULL
  ) THEN
    RAISE EXCEPTION 'El POP ya tiene una subscripción configurada';
  END IF;

  IF p_billing_cycle NOT IN ('monthly', 'yearly') THEN
    RAISE EXCEPTION 'Ciclo de facturación inválido';
  END IF;

  SELECT sp.name
  INTO v_plan_name
  FROM public._subscription_plans sp
  WHERE sp.id = p_plan_id
    AND sp.is_active = true
    AND sp.name <> 'free_trial';

  IF v_plan_name IS NULL THEN
    RAISE EXCEPTION 'Plan inválido';
  END IF;

  v_payment_method_id := COALESCE(
    p_payment_method_id,
    (
      SELECT o.default_payment_method_id
      FROM public.organizations o
      WHERE o.id = v_org_id
    )
  );

  IF v_payment_method_id IS NULL THEN
    RAISE EXCEPTION 'Se requiere un medio de pago';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public._organization_payment_methods pm
    WHERE pm.id = v_payment_method_id
      AND pm.organization_id = v_org_id
      AND pm.is_active = true
  ) THEN
    RAISE EXCEPTION 'Medio de pago inválido para la organización';
  END IF;

  v_business_type_id := public.resolve_pop_business_type_id(p_pop_id);

  SELECT l.price_monthly, l.price_yearly
  INTO v_price_monthly, v_price_yearly
  FROM public._subscription_plan_limits l
  WHERE l.plan_id = p_plan_id
    AND l.business_type_id = v_business_type_id;

  IF v_price_monthly IS NULL THEN
    RAISE EXCEPTION 'No hay precios configurados para el plan seleccionado';
  END IF;

  v_period_end := CASE
    WHEN p_billing_cycle = 'yearly' THEN now() + INTERVAL '1 year'
    ELSE now() + INTERVAL '1 month'
  END;

  INSERT INTO public._pop_subscriptions (
    pop_id,
    plan_id,
    scheduled_plan_id,
    scheduled_billing_cycle,
    business_type_id,
    status,
    billing_cycle,
    current_period_start,
    current_period_end,
    price_monthly,
    price_yearly,
    extra_modules,
    organization_payment_method_id,
    metadata
  )
  VALUES (
    p_pop_id,
    p_plan_id,
    p_plan_id,
    p_billing_cycle,
    v_business_type_id,
    'pending_payment',
    p_billing_cycle,
    now(),
    v_period_end,
    v_price_monthly,
    v_price_yearly,
    COALESCE(p_extra_modules, '[]'::jsonb),
    v_payment_method_id,
    jsonb_build_object(
      'plan_name', v_plan_name,
      'billing_setup_at', now(),
      'awaiting_first_charge', true
    )
  )
  RETURNING id INTO v_subscription_id;

  UPDATE public.pops
  SET
    subscription_id = v_subscription_id,
    business_type_id = v_business_type_id,
    updated_at = now()
  WHERE id = p_pop_id;

  v_charge_id := public.create_subscription_charge_from_subscription(
    v_subscription_id,
    now(),
    v_period_end,
    now(),
    false,
    '[]'::jsonb,
    jsonb_build_object('initial_charge', true)
  );

  INSERT INTO public._subscription_events (
    pop_id,
    subscription_id,
    event_type,
    payload,
    created_by
  )
  VALUES (
    p_pop_id,
    v_subscription_id,
    'subscription_pending_payment',
    jsonb_build_object(
      'plan_id', p_plan_id,
      'plan_name', v_plan_name,
      'billing_cycle', p_billing_cycle,
      'payment_method_id', v_payment_method_id,
      'charge_id', v_charge_id
    ),
    v_user_id
  );

  RETURN v_subscription_id;
END;
$function$;

-- 10) RLS cargos
ALTER TABLE public._subscription_charges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public._subscription_charge_lines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can view their subscription charges"
  ON public._subscription_charges
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

CREATE POLICY "Owners can view their subscription charge lines"
  ON public._subscription_charge_lines
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public._subscription_charges c
      JOIN public.pops p ON p.id = c.pop_id
      WHERE c.id = charge_id
        AND (
          p.owner_user_id = auth.uid()
          OR public.user_has_pop_access(c.pop_id, auth.uid())
        )
    )
  );
