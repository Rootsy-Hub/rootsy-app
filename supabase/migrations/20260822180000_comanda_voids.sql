-- Anulación de ítems ya comandados: el original queda voided y
-- cocina recibe un envío kind=void (ticket de cancelación).

ALTER TABLE public.comandas
  ADD COLUMN IF NOT EXISTS voided_at TIMESTAMPTZ;

ALTER TABLE public.comandas
  DROP CONSTRAINT IF EXISTS comandas_status_check;

ALTER TABLE public.comandas
  ADD CONSTRAINT comandas_status_check
  CHECK (status IN ('pending', 'sent', 'preparing', 'ready', 'delivered', 'voided'));

COMMENT ON COLUMN public.comandas.status IS
  'pending, sent, preparing, ready, delivered, voided (anulado; no se cobra).';
COMMENT ON COLUMN public.comandas.voided_at IS
  'Primera vez que se anuló el ítem. Cocina recibe otro envío kind=void.';

ALTER TABLE public.comanda_sends
  ADD COLUMN IF NOT EXISTS kind TEXT NOT NULL DEFAULT 'order';

ALTER TABLE public.comanda_sends
  DROP CONSTRAINT IF EXISTS comanda_sends_kind_check;

ALTER TABLE public.comanda_sends
  ADD CONSTRAINT comanda_sends_kind_check
  CHECK (kind IN ('order', 'void'));

COMMENT ON COLUMN public.comanda_sends.kind IS
  'order = comanda a preparar. void = anulación para que cocina pare.';
