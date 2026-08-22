-- Comandas: comandado → preparando → listo → entregado.
ALTER TABLE public.comandas
  ADD COLUMN IF NOT EXISTS preparing_at TIMESTAMPTZ;

ALTER TABLE public.comandas
  DROP CONSTRAINT IF EXISTS comandas_status_check;

ALTER TABLE public.comandas
  ADD CONSTRAINT comandas_status_check
    CHECK (status IN ('pending', 'sent', 'preparing', 'ready', 'delivered'));

COMMENT ON COLUMN public.comandas.status IS
  'pending (legacy), sent (comandado), preparing (preparando), ready (listo), delivered (entregado).';
COMMENT ON COLUMN public.comandas.preparing_at IS
  'Primera vez que pasó a preparando.';
