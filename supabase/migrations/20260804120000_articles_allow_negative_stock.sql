-- Permite vender mercadería aunque el stock quede por debajo de cero.
ALTER TABLE public.articles
  ADD COLUMN IF NOT EXISTS allow_negative_stock BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN public.articles.allow_negative_stock IS
  'Si es true, las ventas pueden descontar stock por debajo de cero para este artículo.';
