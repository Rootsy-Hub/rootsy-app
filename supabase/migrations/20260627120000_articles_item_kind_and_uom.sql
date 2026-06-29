-- Tipos de ítem en catálogo/stock (alineado con purchases.purchase_kind)
ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS item_kind TEXT NOT NULL DEFAULT 'merchandise';

ALTER TABLE public.categories
  DROP CONSTRAINT IF EXISTS categories_item_kind_check;

ALTER TABLE public.categories
  ADD CONSTRAINT categories_item_kind_check
  CHECK (item_kind IN ('merchandise', 'raw_material', 'supply'));

CREATE INDEX IF NOT EXISTS idx_categories_pop_item_kind
  ON public.categories (pop_id, item_kind, name);

ALTER TABLE public.articles
  ADD COLUMN IF NOT EXISTS item_kind TEXT NOT NULL DEFAULT 'merchandise';

ALTER TABLE public.articles
  DROP CONSTRAINT IF EXISTS articles_item_kind_check;

ALTER TABLE public.articles
  ADD CONSTRAINT articles_item_kind_check
  CHECK (item_kind IN ('merchandise', 'raw_material', 'supply'));

ALTER TABLE public.articles
  ADD COLUMN IF NOT EXISTS unit_of_measure TEXT NOT NULL DEFAULT 'unidad';

ALTER TABLE public.articles
  ADD COLUMN IF NOT EXISTS is_sellable BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE public.articles
  ADD COLUMN IF NOT EXISTS default_waste_pct NUMERIC;

ALTER TABLE public.articles
  ADD COLUMN IF NOT EXISTS min_stock_level NUMERIC;

ALTER TABLE public.articles
  ADD COLUMN IF NOT EXISTS purchase_uom TEXT;

ALTER TABLE public.articles
  ADD COLUMN IF NOT EXISTS purchase_to_stock_factor NUMERIC;

-- Datos existentes: mercadería vendible por unidad
UPDATE public.articles
SET
  item_kind = COALESCE(item_kind, 'merchandise'),
  unit_of_measure = COALESCE(NULLIF(trim(unit_of_measure), ''), 'unidad'),
  is_sellable = COALESCE(is_sellable, true),
  track_stock = COALESCE(track_stock, true)
WHERE item_kind IS NULL OR unit_of_measure IS NULL OR is_sellable IS NULL;

UPDATE public.categories
SET item_kind = COALESCE(item_kind, 'merchandise')
WHERE item_kind IS NULL;

CREATE INDEX IF NOT EXISTS idx_articles_pop_item_kind_active
  ON public.articles (pop_id, item_kind, is_active, name);

COMMENT ON COLUMN public.articles.item_kind IS
  'merchandise = vendible (incl. por kg/lt); raw_material = insumo productivo; supply = insumo operativo (cajas, packaging).';
COMMENT ON COLUMN public.articles.unit_of_measure IS
  'unidad | kg | g | lt | ml | m | cm | caja';
COMMENT ON COLUMN public.categories.item_kind IS
  'Las categorías pertenecen a un tipo de ítem; filtran catálogo en Stock y Compras.';
