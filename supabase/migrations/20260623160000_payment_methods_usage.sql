-- Medios de pago: alcance cobro / pago / ambos (tesorería Fase 1)
ALTER TABLE public.payment_methods
  ADD COLUMN IF NOT EXISTS usage TEXT NOT NULL DEFAULT 'both';

ALTER TABLE public.payment_methods
  DROP CONSTRAINT IF EXISTS payment_methods_usage_check;

ALTER TABLE public.payment_methods
  ADD CONSTRAINT payment_methods_usage_check
  CHECK (usage IN ('receive', 'pay', 'both'));

COMMENT ON COLUMN public.payment_methods.usage IS
  'receive=solo cobros (ventas); pay=solo pagos (compras/gastos); both=ambos.';

UPDATE public.payment_methods
SET usage = 'both'
WHERE usage IS NULL OR usage = '';
