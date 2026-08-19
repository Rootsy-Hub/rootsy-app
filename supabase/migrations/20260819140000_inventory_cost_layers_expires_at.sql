-- Vencimiento del lote en la capa FIFO. El consumo pasa a FEFO
-- (expires_at ASC NULLS LAST, received_at ASC). NULL = sin fecha.

ALTER TABLE public.inventory_cost_layers
  ADD COLUMN IF NOT EXISTS expires_at date;

COMMENT ON COLUMN public.inventory_cost_layers.expires_at IS
  'Vencimiento del lote. Viaja con la capa en traslados. NULL = sin fecha.';

CREATE INDEX IF NOT EXISTS idx_inventory_cost_layers_location_fefo
  ON public.inventory_cost_layers (
    pop_id,
    location_id,
    article_id,
    expires_at,
    received_at
  )
  WHERE quantity_remaining > 0;
