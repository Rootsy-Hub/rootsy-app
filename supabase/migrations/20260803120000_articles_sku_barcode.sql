-- SKU interno (todos los tipos) y código de barras (solo productos de venta).
ALTER TABLE public.articles
  ADD COLUMN IF NOT EXISTS sku TEXT,
  ADD COLUMN IF NOT EXISTS barcode TEXT;

COMMENT ON COLUMN public.articles.sku IS
  'Código interno de stock (Stock Keeping Unit). Opcional; útil en inventario y compras.';

COMMENT ON COLUMN public.articles.barcode IS
  'Código de barras EAN/UPC impreso en ticket. Solo aplica a item_kind = merchandise.';

CREATE INDEX IF NOT EXISTS articles_pop_sku_idx
  ON public.articles (pop_id, sku)
  WHERE sku IS NOT NULL AND sku <> '';

CREATE INDEX IF NOT EXISTS articles_pop_barcode_idx
  ON public.articles (pop_id, barcode)
  WHERE barcode IS NOT NULL AND barcode <> '';
