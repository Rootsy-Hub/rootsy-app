-- Plataforma Rootsy: tablas prefijadas con _ + límites por plan/tipo + historial.

DROP FUNCTION IF EXISTS public.get_pop_subscription_info(uuid);

-- 1) Renombrar tablas existentes
ALTER TABLE public.business_types RENAME TO _business_types;
ALTER TABLE public.subscription_plans RENAME TO _subscription_plans;
ALTER TABLE public.pop_subscriptions RENAME TO _pop_subscriptions;

-- 2) Ajustes en planes
ALTER TABLE public._subscription_plans
  ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0;

ALTER TABLE public._subscription_plans
  DROP COLUMN IF EXISTS limits;

UPDATE public._subscription_plans SET sort_order = 0 WHERE name = 'free_trial';
UPDATE public._subscription_plans SET sort_order = 1 WHERE name = 'starter';
UPDATE public._subscription_plans SET sort_order = 2 WHERE name = 'professional';
UPDATE public._subscription_plans SET sort_order = 3 WHERE name = 'enterprise';

UPDATE public._subscription_plans
SET
  display_name = 'Prueba gratis',
  description = 'Starter por 7 días sin cargo.',
  trial_days = 7,
  base_price_monthly = 0,
  base_price_yearly = 0
WHERE name = 'free_trial';

UPDATE public._subscription_plans
SET
  display_name = 'Starter',
  description = 'Plan inicial según tipo de negocio.'
WHERE name = 'starter';

UPDATE public._subscription_plans
SET
  display_name = 'Enterprise',
  description = 'Todos los módulos y consumos ilimitados.'
WHERE name = 'enterprise';

UPDATE public._subscription_plans
SET
  display_name = 'Professional',
  description = 'Límites ampliados según tipo de negocio.'
WHERE name = 'professional';

-- 3) Tipos de negocio activos (3 verticales)
UPDATE public._business_types SET is_active = false WHERE name NOT IN ('comercio', 'restaurant', 'fabrica', 'retail', 'factory');

UPDATE public._business_types
SET
  name = 'comercio',
  display_name = 'Comercio',
  description = 'Retail y comercio minorista.',
  addon_price_monthly = 0,
  addon_price_yearly = 0,
  is_active = true
WHERE name IN ('retail', 'comercio');

UPDATE public._business_types
SET
  name = 'restaurant',
  display_name = 'Bar/Restaurantes',
  description = 'Bares, restaurantes y gastronomía.',
  addon_price_monthly = 0,
  addon_price_yearly = 0,
  is_active = true
WHERE name = 'restaurant';

UPDATE public._business_types
SET
  name = 'fabrica',
  display_name = 'Fábrica',
  description = 'Producción y manufactura.',
  addon_price_monthly = 0,
  addon_price_yearly = 0,
  is_active = true
WHERE name IN ('factory', 'fabrica');

ALTER TABLE public._business_types DROP COLUMN IF EXISTS features;

-- 4) Límites plan × tipo de negocio
CREATE TABLE IF NOT EXISTS public._subscription_plan_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid NOT NULL REFERENCES public._subscription_plans(id) ON DELETE CASCADE,
  business_type_id uuid NOT NULL REFERENCES public._business_types(id) ON DELETE CASCADE,
  max_users integer NOT NULL,
  max_articles integer NOT NULL,
  max_operations_per_month integer NOT NULL,
  price_monthly numeric NOT NULL DEFAULT 0,
  price_yearly numeric NOT NULL DEFAULT 0,
  all_modules boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (plan_id, business_type_id)
);

CREATE TRIGGER update__subscription_plan_limits_updated_at
  BEFORE UPDATE ON public._subscription_plan_limits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5) Facturas / pagos de subscripción
CREATE TABLE IF NOT EXISTS public._subscription_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pop_id uuid NOT NULL REFERENCES public.pops(id) ON DELETE CASCADE,
  subscription_id uuid NOT NULL REFERENCES public._pop_subscriptions(id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES public._subscription_plans(id),
  business_type_id uuid NOT NULL REFERENCES public._business_types(id),
  period_start timestamptz NOT NULL,
  period_end timestamptz NOT NULL,
  amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'ARS',
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'paid', 'failed', 'void')),
  payment_method text NOT NULL DEFAULT 'manual'
    CHECK (payment_method IN ('manual', 'stripe')),
  paid_at timestamptz,
  due_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx__subscription_invoices_pop_id
  ON public._subscription_invoices(pop_id, created_at DESC);

CREATE TRIGGER update__subscription_invoices_updated_at
  BEFORE UPDATE ON public._subscription_invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6) Eventos / historial de subscripción
CREATE TABLE IF NOT EXISTS public._subscription_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pop_id uuid NOT NULL REFERENCES public.pops(id) ON DELETE CASCADE,
  subscription_id uuid REFERENCES public._pop_subscriptions(id) ON DELETE SET NULL,
  event_type text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx__subscription_events_pop_id
  ON public._subscription_events(pop_id, created_at DESC);

-- 7) Seed módulos JSON (estructura compartida + específica + extras)
UPDATE public._business_types SET modules = '{
  "shared": {
    "operar": [{"key":"clients","label":"Clientes"},{"key":"current_accounts","label":"Cuentas corrientes"},{"key":"checks","label":"Cheques"}],
    "administrar": [{"key":"summary","label":"Resumen"},{"key":"statistics","label":"Estadísticas"},{"key":"reports","label":"Reportes"},{"key":"operations","label":"Operaciones"},{"key":"expenses","label":"Gastos"}],
    "configurar": [{"key":"alerts","label":"Alertas"},{"key":"accounts","label":"Cuentas"},{"key":"hr","label":"Recursos Humanos"},{"key":"settings","label":"Ajustes"}]
  },
  "specific": {
    "operar": [{"key":"sale","label":"Vender"},{"key":"purchases","label":"Comprar"},{"key":"promotions","label":"Promociones"},{"key":"stock","label":"Stock"},{"key":"suppliers","label":"Proveedores"}],
    "administrar": [{"key":"quotes","label":"Presupuestos"},{"key":"purchase_orders","label":"Órdenes de compra"},{"key":"inventory","label":"Inventario"}],
    "configurar": [{"key":"cash_registers","label":"Cajas"}]
  },
  "extras": [{"key":"manufacturing","label":"Fabricación"},{"key":"invoices","label":"Facturas"},{"key":"printers","label":"Impresoras"},{"key":"chat","label":"Chat"}]
}'::jsonb WHERE name = 'comercio';

UPDATE public._business_types SET modules = '{
  "shared": {
    "operar": [{"key":"clients","label":"Clientes"},{"key":"current_accounts","label":"Cuentas corrientes"},{"key":"checks","label":"Cheques"}],
    "administrar": [{"key":"summary","label":"Resumen"},{"key":"statistics","label":"Estadísticas"},{"key":"reports","label":"Reportes"},{"key":"operations","label":"Operaciones"},{"key":"expenses","label":"Gastos"}],
    "configurar": [{"key":"alerts","label":"Alertas"},{"key":"accounts","label":"Cuentas"},{"key":"hr","label":"Recursos Humanos"},{"key":"settings","label":"Ajustes"}]
  },
  "specific": {
    "operar": [{"key":"mesas","label":"Mesas"},{"key":"mostrador","label":"Mostrador"},{"key":"recipes","label":"Recetas"},{"key":"promotions","label":"Promociones"},{"key":"stock","label":"Stock"},{"key":"suppliers","label":"Proveedores"}],
    "administrar": [{"key":"quotes","label":"Presupuestos"},{"key":"purchase_orders","label":"Órdenes de compra"},{"key":"inventory","label":"Inventario"}],
    "configurar": [{"key":"cash_registers","label":"Cajas"}]
  },
  "extras": [{"key":"manufacturing","label":"Fabricación"},{"key":"invoices","label":"Facturas"},{"key":"printers","label":"Impresoras"},{"key":"chat","label":"Chat"}]
}'::jsonb WHERE name = 'restaurant';

UPDATE public._business_types SET modules = '{
  "shared": {
    "operar": [{"key":"clients","label":"Clientes"},{"key":"current_accounts","label":"Cuentas corrientes"},{"key":"checks","label":"Cheques"}],
    "administrar": [{"key":"summary","label":"Resumen"},{"key":"statistics","label":"Estadísticas"},{"key":"reports","label":"Reportes"},{"key":"operations","label":"Operaciones"},{"key":"expenses","label":"Gastos"}],
    "configurar": [{"key":"alerts","label":"Alertas"},{"key":"accounts","label":"Cuentas"},{"key":"hr","label":"Recursos Humanos"},{"key":"settings","label":"Ajustes"}]
  },
  "specific": {
    "operar": [{"key":"sale","label":"Vender"},{"key":"manufacturing","label":"Fabricar"},{"key":"recipes","label":"Recetas"},{"key":"promotions","label":"Promociones"},{"key":"stock","label":"Stock"},{"key":"suppliers","label":"Proveedores"}],
    "administrar": [{"key":"quotes","label":"Presupuestos"},{"key":"purchase_orders","label":"Órdenes de compra"},{"key":"inventory","label":"Inventario"}],
    "configurar": [{"key":"cash_registers","label":"Cajas"}]
  },
  "extras": [{"key":"invoices","label":"Facturas"},{"key":"printers","label":"Impresoras"},{"key":"chat","label":"Chat"}]
}'::jsonb WHERE name = 'fabrica';

-- 8) Seed límites (free_trial = starter con precio 0)
DELETE FROM public._subscription_plan_limits;

INSERT INTO public._subscription_plan_limits (
  plan_id, business_type_id, max_users, max_articles, max_operations_per_month,
  price_monthly, price_yearly, all_modules
)
SELECT p.id, b.id, v.max_users, v.max_articles, v.max_ops, v.price_m, v.price_y, v.all_modules
FROM (VALUES
  ('starter', 'comercio', 2, 100, 500, 29, 290, false),
  ('starter', 'restaurant', 5, 300, 1000, 49, 490, false),
  ('starter', 'fabrica', 3, 150, 600, 59, 590, false),
  ('enterprise', 'comercio', -1, -1, -1, 199, 1990, true),
  ('enterprise', 'restaurant', -1, -1, -1, 229, 2290, true),
  ('enterprise', 'fabrica', -1, -1, -1, 249, 2490, true),
  ('professional', 'comercio', 15, 5000, 10000, 79, 790, false),
  ('professional', 'restaurant', 20, 8000, 15000, 99, 990, false),
  ('professional', 'fabrica', 25, 10000, 20000, 109, 1090, false),
  ('free_trial', 'comercio', 2, 100, 500, 0, 0, false),
  ('free_trial', 'restaurant', 5, 300, 1000, 0, 0, false),
  ('free_trial', 'fabrica', 3, 150, 600, 0, 0, false)
) AS v(plan_name, bt_name, max_users, max_articles, max_ops, price_m, price_y, all_modules)
JOIN public._subscription_plans p ON p.name = v.plan_name
JOIN public._business_types b ON b.name = v.bt_name AND b.is_active = true;

-- 9) Funciones actualizadas
CREATE OR REPLACE FUNCTION public.create_trial_subscription()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  trial_plan_id UUID;
  default_business_type_id UUID;
  new_subscription_id UUID;
BEGIN
  SELECT id INTO trial_plan_id
  FROM public._subscription_plans
  WHERE name = 'free_trial' AND is_active = true
  LIMIT 1;

  IF NEW.business_type_id IS NOT NULL THEN
    default_business_type_id := NEW.business_type_id;
  ELSE
    SELECT id INTO default_business_type_id
    FROM public._business_types
    WHERE name = 'comercio' AND is_active = true
    LIMIT 1;
  END IF;

  IF default_business_type_id IS NULL THEN
    SELECT id INTO default_business_type_id
    FROM public._business_types
    WHERE is_active = true
    ORDER BY created_at
    LIMIT 1;
  END IF;

  INSERT INTO public._pop_subscriptions (
    pop_id, plan_id, business_type_id, status, billing_cycle,
    trial_started_at, trial_ends_at, current_period_start, current_period_end,
    price_monthly, price_yearly
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
  SET subscription_id = new_subscription_id,
      business_type_id = default_business_type_id
  WHERE id = NEW.id;

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

CREATE OR REPLACE FUNCTION public.get_pop_subscription_info(pop_id uuid)
RETURNS TABLE(
  subscription_id uuid,
  plan_name text,
  plan_display_name text,
  business_type_name text,
  business_type_display_name text,
  status text,
  billing_cycle text,
  trial_ends_at timestamp with time zone,
  current_period_end timestamp with time zone,
  days_remaining integer,
  is_active boolean,
  max_users integer,
  max_articles integer,
  max_operations_per_month integer,
  price_monthly numeric,
  all_modules boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT
    ps.id AS subscription_id,
    sp.name AS plan_name,
    sp.display_name AS plan_display_name,
    bt.name AS business_type_name,
    bt.display_name AS business_type_display_name,
    ps.status,
    ps.billing_cycle,
    ps.trial_ends_at,
    ps.current_period_end,
    CASE
      WHEN ps.status = 'trial' THEN GREATEST(0, EXTRACT(DAY FROM (ps.trial_ends_at - now()))::INTEGER)
      WHEN ps.status = 'active' THEN GREATEST(0, EXTRACT(DAY FROM (ps.current_period_end - now()))::INTEGER)
      ELSE 0
    END AS days_remaining,
    public.is_pop_active(pop_id) AS is_active,
    l.max_users,
    l.max_articles,
    l.max_operations_per_month,
    ps.price_monthly,
    l.all_modules
  FROM public._pop_subscriptions ps
  JOIN public._subscription_plans sp ON sp.id = ps.plan_id
  JOIN public._business_types bt ON bt.id = ps.business_type_id
  LEFT JOIN public._subscription_plan_limits l
    ON l.plan_id = ps.plan_id AND l.business_type_id = ps.business_type_id
  WHERE ps.pop_id = get_pop_subscription_info.pop_id
  LIMIT 1;
$function$;

CREATE OR REPLACE FUNCTION public.is_pop_active(pop_id uuid)
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

-- 10) RLS básico en tablas nuevas
ALTER TABLE public._subscription_plan_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public._subscription_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public._subscription_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view active plan limits"
  ON public._subscription_plan_limits FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public._subscription_plans sp
      WHERE sp.id = plan_id AND sp.is_active = true
    )
  );

CREATE POLICY "Owners can view their subscription invoices"
  ON public._subscription_invoices FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.pops p
      WHERE p.id = pop_id
        AND (p.owner_user_id = auth.uid() OR user_has_pop_access(pop_id, auth.uid()))
    )
  );

CREATE POLICY "Owners can view their subscription events"
  ON public._subscription_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.pops p
      WHERE p.id = pop_id
        AND (p.owner_user_id = auth.uid() OR user_has_pop_access(pop_id, auth.uid()))
    )
  );
