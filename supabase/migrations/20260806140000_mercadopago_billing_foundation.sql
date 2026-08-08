-- Fase 5 (base): Mercado Pago como proveedor de billing de plataforma.
-- Credenciales, webhooks, UI y jobs se integran en pasos siguientes.

-- 1) Organizaciones: payer de Mercado Pago
ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS mp_payer_id text;

COMMENT ON COLUMN public.organizations.mp_payer_id IS
  'Identificador de pagador en Mercado Pago (payer_id).';

COMMENT ON COLUMN public.organizations.stripe_customer_id IS
  'Legacy/opcional: customer id de Stripe si se usa en el futuro.';

-- 2) Proveedores permitidos
ALTER TABLE public._organization_payment_methods
  DROP CONSTRAINT IF EXISTS _organization_payment_methods_provider_check;

ALTER TABLE public._organization_payment_methods
  ALTER COLUMN provider SET DEFAULT 'mercadopago';

ALTER TABLE public._organization_payment_methods
  ADD CONSTRAINT _organization_payment_methods_provider_check
  CHECK (provider IN ('mercadopago', 'stripe', 'manual'));

ALTER TABLE public._subscription_charges
  DROP CONSTRAINT IF EXISTS _subscription_charges_source_check;

ALTER TABLE public._subscription_charges
  ADD CONSTRAINT _subscription_charges_source_check
  CHECK (source IN ('manual', 'mercadopago', 'stripe', 'system'));

ALTER TABLE public._subscription_payments
  DROP CONSTRAINT IF EXISTS _subscription_payments_source_check;

ALTER TABLE public._subscription_payments
  ADD CONSTRAINT _subscription_payments_source_check
  CHECK (source IN ('manual', 'mercadopago', 'stripe', 'system'));

-- 3) Eventos de proveedor (idempotencia de webhooks)
CREATE TABLE IF NOT EXISTS public._billing_provider_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL
    CHECK (provider IN ('mercadopago', 'stripe', 'manual')),
  external_event_id text NOT NULL,
  event_type text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  processed_at timestamptz,
  processing_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (provider, external_event_id)
);

CREATE INDEX IF NOT EXISTS idx__billing_provider_events_unprocessed
  ON public._billing_provider_events (provider, created_at ASC)
  WHERE processed_at IS NULL;

-- 4) Medio de pago: soportar Mercado Pago
CREATE OR REPLACE FUNCTION public.upsert_organization_payment_method (
  p_organization_id uuid,
  p_provider text,
  p_external_payment_method_id text,
  p_stripe_customer_id text DEFAULT NULL,
  p_mp_payer_id text DEFAULT NULL,
  p_card_brand text DEFAULT NULL,
  p_card_last4 text DEFAULT NULL,
  p_card_exp_month integer DEFAULT NULL,
  p_card_exp_year integer DEFAULT NULL,
  p_set_default boolean DEFAULT true,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id uuid := auth.uid();
  v_method_id uuid;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuario no autenticado';
  END IF;

  IF NOT public.user_can_manage_organization_billing(v_user_id, p_organization_id) THEN
    RAISE EXCEPTION 'No tenés permiso para administrar medios de pago';
  END IF;

  IF p_provider NOT IN ('mercadopago', 'stripe', 'manual') THEN
    RAISE EXCEPTION 'Proveedor de pago inválido';
  END IF;

  INSERT INTO public._organization_payment_methods (
    organization_id,
    provider,
    external_payment_method_id,
    card_brand,
    card_last4,
    card_exp_month,
    card_exp_year,
    is_default,
    is_active,
    created_by,
    metadata
  )
  VALUES (
    p_organization_id,
    p_provider,
    p_external_payment_method_id,
    p_card_brand,
    p_card_last4,
    p_card_exp_month,
    p_card_exp_year,
    p_set_default,
    true,
    v_user_id,
    COALESCE(p_metadata, '{}'::jsonb)
  )
  ON CONFLICT (organization_id, external_payment_method_id)
  DO UPDATE SET
    provider = EXCLUDED.provider,
    card_brand = EXCLUDED.card_brand,
    card_last4 = EXCLUDED.card_last4,
    card_exp_month = EXCLUDED.card_exp_month,
    card_exp_year = EXCLUDED.card_exp_year,
    is_active = true,
    metadata = EXCLUDED.metadata,
    updated_at = now()
  RETURNING id INTO v_method_id;

  IF p_set_default THEN
    UPDATE public._organization_payment_methods
    SET is_default = false, updated_at = now()
    WHERE organization_id = p_organization_id
      AND id <> v_method_id
      AND is_default = true;

    UPDATE public._organization_payment_methods
    SET is_default = true, updated_at = now()
    WHERE id = v_method_id;
  END IF;

  UPDATE public.organizations
  SET
    stripe_customer_id = CASE
      WHEN p_stripe_customer_id IS NOT NULL THEN p_stripe_customer_id
      ELSE stripe_customer_id
    END,
    mp_payer_id = CASE
      WHEN p_mp_payer_id IS NOT NULL THEN p_mp_payer_id
      ELSE mp_payer_id
    END,
    default_payment_method_id = CASE
      WHEN p_set_default THEN v_method_id
      ELSE default_payment_method_id
    END,
    updated_at = now()
  WHERE id = p_organization_id;

  INSERT INTO public._subscription_events (
    pop_id,
    subscription_id,
    event_type,
    payload,
    created_by
  )
  SELECT
    p.id,
    p.subscription_id,
    'payment_method_saved',
    jsonb_build_object(
      'organization_id', p_organization_id,
      'payment_method_id', v_method_id,
      'provider', p_provider,
      'card_brand', p_card_brand,
      'card_last4', p_card_last4,
      'is_default', p_set_default
    ),
    v_user_id
  FROM public.pops p
  WHERE p.organization_id = p_organization_id
  ORDER BY p.created_at ASC
  LIMIT 1;

  RETURN v_method_id;
END;
$function$;

-- 5) Contexto de billing enriquecido
CREATE OR REPLACE FUNCTION public.get_organization_billing_context (
  p_user_id uuid DEFAULT auth.uid()
)
RETURNS TABLE (
  organization_id uuid,
  organization_name text,
  trial_available boolean,
  billing_provider text,
  stripe_customer_id text,
  mp_payer_id text,
  default_payment_method_id uuid,
  default_payment_provider text,
  default_card_brand text,
  default_card_last4 text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT
    o.id AS organization_id,
    o.name AS organization_name,
    public.organization_trial_is_available(o.id) AS trial_available,
    COALESCE(pm.provider, 'mercadopago') AS billing_provider,
    o.stripe_customer_id,
    o.mp_payer_id,
    pm.id AS default_payment_method_id,
    pm.provider AS default_payment_provider,
    pm.card_brand AS default_card_brand,
    pm.card_last4 AS default_card_last4
  FROM public.organizations o
  LEFT JOIN public._organization_payment_methods pm
    ON pm.id = o.default_payment_method_id
    AND pm.is_active = true
  WHERE o.id = public.get_user_primary_organization_id(p_user_id)
    AND public.user_is_organization_member(o.id, p_user_id);
$function$;

-- 6) Vista invoices: incluir mercadopago
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
    WHEN c.source IN ('stripe', 'mercadopago') THEN c.source
    ELSE 'manual'
  END AS payment_method,
  c.paid_at,
  c.due_at,
  c.metadata,
  c.created_at,
  c.updated_at
FROM public._subscription_charges c;

-- 7) Cola de trials listos para facturar (job futuro)
CREATE OR REPLACE FUNCTION public.list_pops_pending_trial_billing ()
RETURNS TABLE (
  pop_id uuid,
  subscription_id uuid,
  organization_id uuid,
  trial_ends_at timestamptz,
  scheduled_plan_id uuid,
  scheduled_billing_cycle text,
  organization_payment_method_id uuid,
  mp_payer_id text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT
    p.id AS pop_id,
    ps.id AS subscription_id,
    p.organization_id,
    ps.trial_ends_at,
    ps.scheduled_plan_id,
    ps.scheduled_billing_cycle,
    ps.organization_payment_method_id,
    o.mp_payer_id
  FROM public._pop_subscriptions ps
  JOIN public.pops p ON p.id = ps.pop_id
  JOIN public.organizations o ON o.id = p.organization_id
  WHERE ps.status = 'trial'
    AND ps.trial_ends_at IS NOT NULL
    AND ps.trial_ends_at <= now()
    AND ps.scheduled_plan_id IS NOT NULL
    AND ps.organization_payment_method_id IS NOT NULL
    AND NOT EXISTS (
      SELECT 1
      FROM public._subscription_charges c
      WHERE c.subscription_id = ps.id
        AND c.period_start >= ps.trial_ends_at
        AND c.status <> 'void'
    );
$function$;

-- 8) Registrar evento de proveedor (webhook futuro)
CREATE OR REPLACE FUNCTION public.record_billing_provider_event (
  p_provider text,
  p_external_event_id text,
  p_event_type text,
  p_payload jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_event_id uuid;
BEGIN
  IF p_provider NOT IN ('mercadopago', 'stripe', 'manual') THEN
    RAISE EXCEPTION 'Proveedor inválido';
  END IF;

  INSERT INTO public._billing_provider_events (
    provider,
    external_event_id,
    event_type,
    payload
  )
  VALUES (
    p_provider,
    p_external_event_id,
    p_event_type,
    COALESCE(p_payload, '{}'::jsonb)
  )
  ON CONFLICT (provider, external_event_id) DO UPDATE SET
    event_type = EXCLUDED.event_type,
    payload = EXCLUDED.payload
  RETURNING id INTO v_event_id;

  RETURN v_event_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.mark_billing_provider_event_processed (
  p_event_id uuid,
  p_error text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public._billing_provider_events
  SET
    processed_at = CASE WHEN p_error IS NULL THEN now() ELSE processed_at END,
    processing_error = p_error
  WHERE id = p_event_id;
END;
$function$;

-- 9) Validación de source en RPCs de pago/cargo
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

  IF p_source NOT IN ('manual', 'mercadopago', 'stripe', 'system') THEN
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

ALTER TABLE public._billing_provider_events ENABLE ROW LEVEL SECURITY;
