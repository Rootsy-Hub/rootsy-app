-- Features de suscripción: se eliminan la tabla catálogo y la columna JSON del plan.
ALTER TABLE public.subscription_plans
  DROP COLUMN IF EXISTS features;

DROP TABLE IF EXISTS public.subscription_features;
