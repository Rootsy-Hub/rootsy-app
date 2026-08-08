-- Plan y rubro internos (ocultos al público) con acceso total a módulos.

ALTER TABLE public._subscription_plans
  ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT true;

ALTER TABLE public._business_types
  ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT true;

UPDATE public._subscription_plans SET is_public = true WHERE is_public IS DISTINCT FROM true;
UPDATE public._business_types SET is_public = true WHERE is_public IS DISTINCT FROM true;

INSERT INTO public._business_types (
  name,
  display_name,
  description,
  addon_price_monthly,
  addon_price_yearly,
  modules,
  is_active,
  is_public
)
VALUES (
  'platform_full',
  'Plataforma completa',
  'Uso interno Rootsy: todos los módulos de todos los rubros.',
  0,
  0,
  '{"shared":{},"specific":{},"extras":[]}'::jsonb,
  true,
  false
)
ON CONFLICT (name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  is_active = true,
  is_public = false,
  updated_at = now();

INSERT INTO public._subscription_plans (
  name,
  display_name,
  description,
  base_price_monthly,
  base_price_yearly,
  trial_days,
  sort_order,
  is_active,
  is_public
)
VALUES (
  'rootsy_internal',
  'Rootsy Internal',
  'Plan interno con acceso total. No visible para clientes.',
  0,
  0,
  0,
  99,
  true,
  false
)
ON CONFLICT (name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order,
  is_active = true,
  is_public = false,
  updated_at = now();

INSERT INTO public._subscription_plan_limits (
  plan_id,
  business_type_id,
  max_users,
  max_articles,
  max_operations_per_month,
  price_monthly,
  price_yearly,
  all_modules
)
SELECT
  p.id,
  b.id,
  -1,
  -1,
  -1,
  0,
  0,
  true
FROM public._subscription_plans p
CROSS JOIN public._business_types b
WHERE p.name = 'rootsy_internal'
  AND b.name = 'platform_full'
ON CONFLICT (plan_id, business_type_id) DO UPDATE SET
  max_users = EXCLUDED.max_users,
  max_articles = EXCLUDED.max_articles,
  max_operations_per_month = EXCLUDED.max_operations_per_month,
  price_monthly = EXCLUDED.price_monthly,
  price_yearly = EXCLUDED.price_yearly,
  all_modules = EXCLUDED.all_modules,
  updated_at = now();

-- Rootsy Market → plan interno + rubro plataforma completa
UPDATE public._pop_subscriptions ps
SET
  plan_id = p.id,
  business_type_id = b.id,
  status = 'active',
  extra_modules = '[]'::jsonb,
  price_monthly = 0,
  price_yearly = 0,
  current_period_end = GREATEST(
    COALESCE(ps.current_period_end, now()),
    now() + interval '10 years'
  ),
  updated_at = now()
FROM public._subscription_plans p,
     public._business_types b
WHERE ps.pop_id = '32851b60-7fc4-4a00-87b5-27dab1739a4a'
  AND p.name = 'rootsy_internal'
  AND b.name = 'platform_full';

UPDATE public.pops pop
SET
  business_type_id = b.id,
  updated_at = now()
FROM public._business_types b
WHERE pop.id = '32851b60-7fc4-4a00-87b5-27dab1739a4a'
  AND b.name = 'platform_full';
