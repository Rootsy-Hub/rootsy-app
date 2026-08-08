-- Fase 1: organizaciones implícitas (empresa), membresía y vínculo con POPs.
-- 1 trial por organización; fiscal sigue en pops.

-- 1) Tablas base
CREATE TABLE IF NOT EXISTS public.organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  trial_consumed_at timestamptz,
  created_by uuid NOT NULL REFERENCES auth.users (id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_organizations_created_by
  ON public.organizations (created_by);

CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.organization_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('owner', 'admin', 'billing', 'viewer')),
  is_active boolean NOT NULL DEFAULT true,
  invited_by uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_organization_members_user_id
  ON public.organization_members (user_id)
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_organization_members_org_id
  ON public.organization_members (organization_id)
  WHERE is_active = true;

CREATE TRIGGER update_organization_members_updated_at
  BEFORE UPDATE ON public.organization_members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE public.pops
  ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations (id) ON DELETE RESTRICT;

CREATE INDEX IF NOT EXISTS idx_pops_organization_id
  ON public.pops (organization_id);

-- 2) Helpers de acceso
CREATE OR REPLACE FUNCTION public.user_is_organization_member (
  p_organization_id uuid,
  p_user_id uuid,
  p_roles text[] DEFAULT NULL
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_members om
    WHERE om.organization_id = p_organization_id
      AND om.user_id = p_user_id
      AND om.is_active = true
      AND (
        p_roles IS NULL
        OR om.role = ANY (p_roles)
      )
  );
$function$;

CREATE OR REPLACE FUNCTION public.get_user_primary_organization_id (p_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT om.organization_id
  FROM public.organization_members om
  WHERE om.user_id = p_user_id
    AND om.is_active = true
    AND om.role = 'owner'
  ORDER BY om.created_at ASC
  LIMIT 1;
$function$;

CREATE OR REPLACE FUNCTION public.user_can_manage_organization_pops (
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
    ARRAY['owner', 'admin']::text[]
  );
$function$;

-- 3) Backfill: una org por owner, nombre = primer POP
DO $$
DECLARE
  v_owner uuid;
  v_org_id uuid;
  r RECORD;
BEGIN
  FOR v_owner IN
    SELECT DISTINCT p.owner_user_id
    FROM public.pops p
    WHERE p.organization_id IS NULL
  LOOP
    v_org_id := NULL;

    FOR r IN
      SELECT
        p.id,
        p.name,
        p.owner_user_id,
        p.created_at,
        ps.trial_started_at
      FROM public.pops p
      LEFT JOIN public._pop_subscriptions ps ON ps.id = p.subscription_id
      WHERE p.owner_user_id = v_owner
        AND p.organization_id IS NULL
      ORDER BY p.created_at ASC
    LOOP
      IF v_org_id IS NULL THEN
        INSERT INTO public.organizations (name, created_by, trial_consumed_at)
        VALUES (
          r.name,
          r.owner_user_id,
          r.trial_started_at
        )
        RETURNING id INTO v_org_id;

        INSERT INTO public.organization_members (organization_id, user_id, role)
        VALUES (v_org_id, r.owner_user_id, 'owner')
        ON CONFLICT (organization_id, user_id) DO NOTHING;
      END IF;

      UPDATE public.pops
      SET organization_id = v_org_id
      WHERE id = r.id;

      IF r.trial_started_at IS NOT NULL THEN
        UPDATE public.organizations
        SET trial_consumed_at = LEAST(
          COALESCE(trial_consumed_at, r.trial_started_at),
          r.trial_started_at
        )
        WHERE id = v_org_id;
      END IF;
    END LOOP;
  END LOOP;
END $$;

ALTER TABLE public.pops
  ALTER COLUMN organization_id SET NOT NULL;

-- 4) Asignar org al insertar POP (primera org = nombre del POP)
CREATE OR REPLACE FUNCTION public.pops_before_insert_assign_organization ()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_org_id uuid;
BEGIN
  IF NEW.organization_id IS NOT NULL THEN
    IF NOT public.user_can_manage_organization_pops(NEW.owner_user_id, NEW.organization_id) THEN
      RAISE EXCEPTION 'El usuario no puede crear POPs en esta organización';
    END IF;
    RETURN NEW;
  END IF;

  v_org_id := public.get_user_primary_organization_id(NEW.owner_user_id);

  IF v_org_id IS NULL THEN
    INSERT INTO public.organizations (name, created_by)
    VALUES (NEW.name, NEW.owner_user_id)
    RETURNING id INTO v_org_id;

    INSERT INTO public.organization_members (organization_id, user_id, role)
    VALUES (v_org_id, NEW.owner_user_id, 'owner');
  END IF;

  NEW.organization_id := v_org_id;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS pops_before_insert_assign_organization ON public.pops;
CREATE TRIGGER pops_before_insert_assign_organization
  BEFORE INSERT ON public.pops
  FOR EACH ROW
  EXECUTE FUNCTION public.pops_before_insert_assign_organization();

-- 5) Trial: solo si la organización aún no consumió el beneficio
CREATE OR REPLACE FUNCTION public.create_trial_subscription ()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  trial_plan_id uuid;
  default_business_type_id uuid;
  new_subscription_id uuid;
  v_trial_consumed timestamptz;
BEGIN
  IF NEW.organization_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT o.trial_consumed_at
  INTO v_trial_consumed
  FROM public.organizations o
  WHERE o.id = NEW.organization_id;

  IF v_trial_consumed IS NOT NULL THEN
    INSERT INTO public._subscription_events (pop_id, subscription_id, event_type, payload)
    VALUES (
      NEW.id,
      NULL,
      'pop_created',
      jsonb_build_object(
        'pop_name', NEW.name,
        'trial_skipped', true,
        'reason', 'organization_trial_already_consumed'
      )
    );
    RETURN NEW;
  END IF;

  SELECT id
  INTO trial_plan_id
  FROM public._subscription_plans
  WHERE name = 'free_trial'
    AND is_active = true
  LIMIT 1;

  IF trial_plan_id IS NULL THEN
    RETURN NEW;
  END IF;

  IF NEW.business_type_id IS NOT NULL THEN
    default_business_type_id := NEW.business_type_id;
  ELSE
    SELECT id
    INTO default_business_type_id
    FROM public._business_types
    WHERE name = 'comercio'
      AND is_active = true
    LIMIT 1;
  END IF;

  IF default_business_type_id IS NULL THEN
    SELECT id
    INTO default_business_type_id
    FROM public._business_types
    WHERE is_active = true
    ORDER BY created_at
    LIMIT 1;
  END IF;

  INSERT INTO public._pop_subscriptions (
    pop_id,
    plan_id,
    business_type_id,
    status,
    billing_cycle,
    trial_started_at,
    trial_ends_at,
    current_period_start,
    current_period_end,
    price_monthly,
    price_yearly
  )
  SELECT
    NEW.id,
    trial_plan_id,
    default_business_type_id,
    'trial',
    'monthly',
    now(),
    now() + INTERVAL '7 days',
    now(),
    now() + INTERVAL '7 days',
    COALESCE(l.price_monthly, 0),
    COALESCE(l.price_yearly, 0)
  FROM public._subscription_plan_limits l
  WHERE l.plan_id = trial_plan_id
    AND l.business_type_id = default_business_type_id
  RETURNING id INTO new_subscription_id;

  UPDATE public.pops
  SET
    subscription_id = new_subscription_id,
    business_type_id = default_business_type_id
  WHERE id = NEW.id;

  UPDATE public.organizations
  SET
    trial_consumed_at = now(),
    updated_at = now()
  WHERE id = NEW.organization_id
    AND trial_consumed_at IS NULL;

  INSERT INTO public._subscription_events (pop_id, subscription_id, event_type, payload)
  VALUES (
    NEW.id,
    new_subscription_id,
    'trial_started',
    jsonb_build_object('plan_name', 'free_trial')
  );

  RETURN NEW;
END;
$function$;

-- 6) Crear POP: permitir varios por org si sos owner/admin
CREATE OR REPLACE FUNCTION public.can_user_create_pop (user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_org_id uuid;
BEGIN
  v_org_id := public.get_user_primary_organization_id(can_user_create_pop.user_id);

  IF v_org_id IS NULL THEN
    RETURN TRUE;
  END IF;

  RETURN public.user_can_manage_organization_pops(can_user_create_pop.user_id, v_org_id);
END;
$function$;

-- 7) RLS
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view their organizations"
  ON public.organizations
  FOR SELECT
  USING (
    public.user_is_organization_member(id, auth.uid())
  );

CREATE POLICY "Owners and admins can update their organizations"
  ON public.organizations
  FOR UPDATE
  USING (
    public.user_is_organization_member(
      id,
      auth.uid(),
      ARRAY['owner', 'admin']::text[]
    )
  );

CREATE POLICY "Members can view organization members"
  ON public.organization_members
  FOR SELECT
  USING (
    public.user_is_organization_member(organization_id, auth.uid())
  );
