-- Periodicidad por hora en catálogo de servicios

ALTER TABLE public.service_types
  DROP CONSTRAINT IF EXISTS service_types_billing_period_check;

ALTER TABLE public.service_types
  ADD CONSTRAINT service_types_billing_period_check
  CHECK (billing_period IN ('none', 'hourly', 'weekly', 'monthly', 'yearly', 'custom'));

COMMENT ON COLUMN public.service_types.billing_period IS
  'Periodicidad de referencia del tipo de servicio (catálogo): none, hourly, weekly, monthly, yearly, custom.';
