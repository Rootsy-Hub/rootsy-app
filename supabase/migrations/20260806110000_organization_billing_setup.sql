-- Fase 2: medios de pago por organización, plan post-trial y activación explícita de subscripción.
-- El trial ya no se crea automáticamente al insertar un POP.

-- 1) Medios de pago de plataforma (Rootsy billing, no tesorería del POP)
CREATE TABLE IF NOT EXISTS public._organization_payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  provider text NOT NULL DEFAULT 'stripe'
    CHECK (provider IN ('stripe', 'manual')),
  external_payment_method_id text NOT NULL,
  card_brand text,
  card_last4 text,
  card_exp_month integer,
  card_exp_year integer,
  is_default boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, external_payment_method_id)
);

CREATE INDEX IF NOT EXISTS idx__organization_payment_methods_org_id
  ON public._organization_payment_methods (organization_id)
  WHERE is_active = true;

CREATE TRIGGER update__organization_payment_methods_updated_at
  BEFORE UPDATE ON public._organization_payment_methods
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS stripe_customer_id text,
  ADD COLUMN IF NOT EXISTS default_payment_method_id uuid
    REFERENCES public._organization_payment_methods (id) ON DELETE SET NULL;

-- 2) Subscripción: plan post-trial y medio de pago asociado
ALTER TABLE public._pop_subscriptions
  ADD COLUMN IF NOT EXISTS scheduled_plan_id uuid
    REFERENCES public._subscription_plans (id) ON DELETE RESTRICT,
  ADD COLUMN IF NOT EXISTS scheduled_billing_cycle text
    CHECK (
      scheduled_billing_cycle IS NULL
      OR scheduled_billing_cycle = ANY (ARRAY['monthly'::text, 'yearly'::text])
    ),
  ADD COLUMN IF NOT EXISTS organization_payment_method_id uuid
    REFERENCES public._organization_payment_methods (id) ON DELETE SET NULL;

ALTER TABLE public._pop_subscriptions
  DROP CONSTRAINT IF EXISTS pop_subscriptions_status_check;

ALTER TABLE public._pop_subscriptions
  ADD CONSTRAINT pop_subscriptions_status_check
  CHECK (
    status = ANY (
      ARRAY[
        'pending_setup'::text,
        'trial'::text,
        'pending_payment'::text,
        'active'::text,
        'past_due'::text,
        'canceled'::text,
        'expired'::text
      ]
    )
  );

-- Backfill: plan actual como scheduled cuando ya es un plan pago
UPDATE public._pop_subscriptions ps
SET
  scheduled_plan_id = ps.plan_id,
  scheduled_billing_cycle = ps.billing_cycle
FROM public._subscription_plans sp
WHERE sp.id = ps.plan_id
  AND sp.name <> 'free_trial'
  AND ps.scheduled_plan_id IS NULL;

UPDATE public._pop_subscriptions ps
SET
  scheduled_plan_id = sp_paid.id,
  scheduled_billing_cycle = ps.billing_cycle
FROM public._subscription_plans sp_trial
JOIN public._subscription_plans sp_paid ON sp_paid.name = 'starter'
WHERE ps.plan_id = sp_trial.id
  AND sp_trial.name = 'free_trial'
  AND ps.scheduled_plan_id IS NULL
  AND ps.status IN ('trial', 'active', 'past_due');

-- 3) Helpers de billing
CREATE OR REPLACE FUNCTION public.user_can_manage_organization_billing (
  p_user_id uuid,
  p_organization_id uuid
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT public.user_is_organization_member(
    p_organization_id,
    p_user_id,
    ARRAY['owner', 'admin', 'billing']::text[]
  );
$function$;

CREATE OR REPLACE FUNCTION public.organization_trial_is_available (p_organization_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT NOT EXISTS (
    SELECT 1
    FROM public.organizations o
    WHERE o.id = p_organization_id
      AND o.trial_consumed_at IS NOT NULL
  );
$function$;

CREATE OR REPLACE FUNCTION public.assert_user_can_manage_pop_billing (
  p_pop_id uuid,
  p_user_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_org_id uuid;
BEGIN
  SELECT p.organization_id
  INTO v_org_id
  FROM public.pops p
  WHERE p.id = p_pop_id;

  IF v_org_id IS NULL THEN
    RAISE EXCEPTION 'POP no encontrado';
  END IF;

  IF NOT public.user_can_manage_organization_billing(p_user_id, v_org_id) THEN
    RAISE EXCEPTION 'No tenés permiso de billing para este POP';
  END IF;

  RETURN v_org_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.resolve_pop_business_type_id (p_pop_id uuid)
RETURNS uuid
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_business_type_id uuid;
BEGIN
  SELECT p.business_type_id
  INTO v_business_type_id
  FROM public.pops p
  WHERE p.id = p_pop_id;

  IF v_business_type_id IS NOT NULL THEN
    RETURN v_business_type_id;
  END IF;

  SELECT id
  INTO v_business_type_id
  FROM public._business_types
  WHERE name = 'comercio'
    AND is_active = true
  LIMIT 1;

  IF v_business_type_id IS NULL THEN
    SELECT id
    INTO v_business_type_id
    FROM public._business_types
    WHERE is_active = true
    ORDER BY created_at
    LIMIT 1;
  END IF;

  RETURN v_business_type_id;
END;
$function$;

-- 4) Registrar / actualizar medio de pago tokenizado
CREATE OR REPLACE FUNCTION public.upsert_organization_payment_method (
  p_organization_id uuid,
  p_provider text,
  p_external_payment_method_id text,
  p_stripe_customer_id text DEFAULT NULL,
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

  IF p_provider NOT IN ('stripe', 'manual') THEN
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

  IF p_stripe_customer_id IS NOT NULL THEN
    UPDATE public.organizations
    SET
      stripe_customer_id = p_stripe_customer_id,
      default_payment_method_id = CASE
        WHEN p_set_default THEN v_method_id
        ELSE default_payment_method_id
      END,
      updated_at = now()
    WHERE id = p_organization_id;
  ELSIF p_set_default THEN
    UPDATE public.organizations
    SET
      default_payment_method_id = v_method_id,
      updated_at = now()
    WHERE id = p_organization_id;
  END IF;

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

-- 5) Activar trial explícitamente (tarjeta + plan post-trial obligatorios)
CREATE OR REPLACE FUNCTION public.start_pop_trial (
  p_pop_id uuid,
  p_scheduled_plan_id uuid,
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
  v_trial_plan_id uuid;
  v_business_type_id uuid;
  v_payment_method_id uuid;
  v_subscription_id uuid;
  v_scheduled_plan_name text;
  v_scheduled_plan_id uuid;
  v_price_monthly numeric;
  v_price_yearly numeric;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuario no autenticado';
  END IF;

  v_org_id := public.assert_user_can_manage_pop_billing(p_pop_id, v_user_id);

  IF NOT public.organization_trial_is_available(v_org_id) THEN
    RAISE EXCEPTION 'La organización ya consumió la prueba gratis';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.pops p WHERE p.id = p_pop_id AND p.subscription_id IS NOT NULL
  ) THEN
    RAISE EXCEPTION 'El POP ya tiene una subscripción configurada';
  END IF;

  IF p_billing_cycle NOT IN ('monthly', 'yearly') THEN
    RAISE EXCEPTION 'Ciclo de facturación inválido';
  END IF;

  SELECT sp.id, sp.name
  INTO v_scheduled_plan_id, v_scheduled_plan_name
  FROM public._subscription_plans sp
  WHERE sp.id = p_scheduled_plan_id
    AND sp.is_active = true
    AND sp.name <> 'free_trial';

  IF v_scheduled_plan_id IS NULL THEN
    RAISE EXCEPTION 'Plan post-trial inválido';
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
    RAISE EXCEPTION 'Se requiere un medio de pago para iniciar la prueba gratis';
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

  SELECT
    l.price_monthly,
    l.price_yearly
  INTO v_price_monthly, v_price_yearly
  FROM public._subscription_plan_limits l
  WHERE l.plan_id = p_scheduled_plan_id
    AND l.business_type_id = v_business_type_id;

  IF v_price_monthly IS NULL THEN
    RAISE EXCEPTION 'No hay precios configurados para el plan seleccionado';
  END IF;

  SELECT id
  INTO v_trial_plan_id
  FROM public._subscription_plans
  WHERE name = 'free_trial'
    AND is_active = true
  LIMIT 1;

  IF v_trial_plan_id IS NULL THEN
    RAISE EXCEPTION 'Plan free_trial no disponible';
  END IF;

  INSERT INTO public._pop_subscriptions (
    pop_id,
    plan_id,
    scheduled_plan_id,
    scheduled_billing_cycle,
    business_type_id,
    status,
    billing_cycle,
    trial_started_at,
    trial_ends_at,
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
    v_trial_plan_id,
    p_scheduled_plan_id,
    p_billing_cycle,
    v_business_type_id,
    'trial',
    'monthly',
    now(),
    now() + INTERVAL '7 days',
    now(),
    now() + INTERVAL '7 days',
    v_price_monthly,
    v_price_yearly,
    COALESCE(p_extra_modules, '[]'::jsonb),
    v_payment_method_id,
    jsonb_build_object(
      'scheduled_plan_name', v_scheduled_plan_name,
      'billing_setup_at', now()
    )
  )
  RETURNING id INTO v_subscription_id;

  UPDATE public.pops
  SET
    subscription_id = v_subscription_id,
    business_type_id = v_business_type_id,
    updated_at = now()
  WHERE id = p_pop_id;

  UPDATE public.organizations
  SET
    trial_consumed_at = now(),
    updated_at = now()
  WHERE id = v_org_id
    AND trial_consumed_at IS NULL;

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
    'trial_started',
    jsonb_build_object(
      'plan_name', 'free_trial',
      'scheduled_plan_id', p_scheduled_plan_id,
      'scheduled_plan_name', v_scheduled_plan_name,
      'scheduled_billing_cycle', p_billing_cycle,
      'payment_method_id', v_payment_method_id,
      'period_end', (now() + INTERVAL '7 days')
    ),
    v_user_id
  );

  RETURN v_subscription_id;
END;
$function$;

-- 6) Activar subscripción paga (POP adicional sin trial)
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
      'payment_method_id', v_payment_method_id
    ),
    v_user_id
  );

  RETURN v_subscription_id;
END;
$function$;

-- 7) Resumen de billing para el flujo de creación de POP
CREATE OR REPLACE FUNCTION public.get_organization_billing_context (p_user_id uuid DEFAULT auth.uid())
RETURNS TABLE (
  organization_id uuid,
  organization_name text,
  trial_available boolean,
  stripe_customer_id text,
  default_payment_method_id uuid,
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
    o.stripe_customer_id,
    pm.id AS default_payment_method_id,
    pm.card_brand AS default_card_brand,
    pm.card_last4 AS default_card_last4
  FROM public.organizations o
  LEFT JOIN public._organization_payment_methods pm
    ON pm.id = o.default_payment_method_id
    AND pm.is_active = true
  WHERE o.id = public.get_user_primary_organization_id(p_user_id)
    AND public.user_is_organization_member(o.id, p_user_id);
$function$;

-- 8) POP creado: solo evento, sin trial automático
CREATE OR REPLACE FUNCTION public.on_pop_created_log_event ()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public._subscription_events (pop_id, subscription_id, event_type, payload)
  VALUES (
    NEW.id,
    NULL,
    'pop_created',
    jsonb_build_object(
      'pop_name', NEW.name,
      'organization_id', NEW.organization_id,
      'trial_available', public.organization_trial_is_available(NEW.organization_id)
    )
  );

  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS on_pop_created_create_trial ON public.pops;
DROP TRIGGER IF EXISTS on_pop_created_log_event ON public.pops;

CREATE TRIGGER on_pop_created_log_event
  AFTER INSERT ON public.pops
  FOR EACH ROW
  EXECUTE FUNCTION public.on_pop_created_log_event();

-- 9) is_pop_active: pending_payment no habilita acceso operativo
CREATE OR REPLACE FUNCTION public.is_pop_active (pop_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.pops p
    JOIN public._pop_subscriptions ps ON ps.pop_id = p.id
    WHERE p.id = is_pop_active.pop_id
      AND p.is_active = true
      AND ps.status IN ('trial', 'active')
      AND (
        (ps.status = 'trial' AND ps.trial_ends_at > now())
        OR (ps.status = 'active' AND ps.current_period_end > now())
      )
  );
$function$;

-- 10) RLS medios de pago
ALTER TABLE public._organization_payment_methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Billing members can view organization payment methods"
  ON public._organization_payment_methods
  FOR SELECT
  USING (
    public.user_can_manage_organization_billing(auth.uid(), organization_id)
  );

CREATE POLICY "Billing members can insert organization payment methods"
  ON public._organization_payment_methods
  FOR INSERT
  WITH CHECK (
    public.user_can_manage_organization_billing(auth.uid(), organization_id)
  );

CREATE POLICY "Billing members can update organization payment methods"
  ON public._organization_payment_methods
  FOR UPDATE
  USING (
    public.user_can_manage_organization_billing(auth.uid(), organization_id)
  );
