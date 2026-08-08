-- Costos de compra por artículo (formas de adquirir stock) y UOM de venta fija en artículos.
-- El artículo ya no guarda cost_price ni factores de compra; eso vive en article_costs.

-- ---------------------------------------------------------------------------
-- Costos de compra (catálogo por artículo)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.article_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pop_id UUID NOT NULL REFERENCES public.pops (id) ON DELETE CASCADE,
  article_id UUID NOT NULL REFERENCES public.articles (id) ON DELETE CASCADE,
  supplier_id UUID REFERENCES public.suppliers (id) ON DELETE SET NULL,
  name TEXT NOT NULL DEFAULT '',
  cost_unit_label TEXT NOT NULL,
  sale_units_per_cost_unit NUMERIC(14, 4) NOT NULL,
  unit_price NUMERIC(15, 2) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT article_costs_sale_units_per_cost_unit_positive
    CHECK (sale_units_per_cost_unit > 0),
  CONSTRAINT article_costs_unit_price_nonneg
    CHECK (unit_price >= 0),
  CONSTRAINT article_costs_cost_unit_label_nonempty
    CHECK (length(trim(cost_unit_label)) > 0)
);

CREATE INDEX IF NOT EXISTS idx_article_costs_pop_article
  ON public.article_costs (pop_id, article_id, is_active, sort_order);

CREATE INDEX IF NOT EXISTS idx_article_costs_article
  ON public.article_costs (article_id);

CREATE INDEX IF NOT EXISTS idx_article_costs_supplier
  ON public.article_costs (pop_id, supplier_id)
  WHERE supplier_id IS NOT NULL;

-- ---------------------------------------------------------------------------
-- Integridad pop_id ↔ artículo / proveedor
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.article_costs_same_pop_as_article ()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  article_pop UUID;
  supplier_pop UUID;
BEGIN
  SELECT pop_id INTO article_pop
  FROM public.articles
  WHERE id = NEW.article_id;

  IF article_pop IS NULL THEN
    RAISE EXCEPTION 'article_costs: artículo inexistente';
  END IF;

  IF article_pop <> NEW.pop_id THEN
    RAISE EXCEPTION 'article_costs: pop_id debe coincidir con el artículo';
  END IF;

  IF NEW.supplier_id IS NOT NULL THEN
    SELECT pop_id INTO supplier_pop
    FROM public.suppliers
    WHERE id = NEW.supplier_id;

    IF supplier_pop IS NULL THEN
      RAISE EXCEPTION 'article_costs: proveedor inexistente';
    END IF;

    IF supplier_pop <> NEW.pop_id THEN
      RAISE EXCEPTION 'article_costs: pop_id debe coincidir con el proveedor';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS article_costs_same_pop_as_article ON public.article_costs;
CREATE TRIGGER article_costs_same_pop_as_article
  BEFORE INSERT OR UPDATE OF pop_id, article_id, supplier_id
  ON public.article_costs
  FOR EACH ROW
  EXECUTE FUNCTION public.article_costs_same_pop_as_article ();

DROP TRIGGER IF EXISTS article_costs_set_updated_at ON public.article_costs;
CREATE TRIGGER article_costs_set_updated_at
  BEFORE UPDATE ON public.article_costs
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at ();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

ALTER TABLE public.article_costs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS article_costs_select_pop ON public.article_costs;
CREATE POLICY article_costs_select_pop ON public.article_costs
  FOR SELECT TO authenticated
  USING (public.user_is_member_of_active_pop (pop_id));

DROP POLICY IF EXISTS article_costs_insert_pop ON public.article_costs;
CREATE POLICY article_costs_insert_pop ON public.article_costs
  FOR INSERT TO authenticated
  WITH CHECK (public.user_is_member_of_active_pop (pop_id));

DROP POLICY IF EXISTS article_costs_update_pop ON public.article_costs;
CREATE POLICY article_costs_update_pop ON public.article_costs
  FOR UPDATE TO authenticated
  USING (public.user_is_member_of_active_pop (pop_id))
  WITH CHECK (public.user_is_member_of_active_pop (pop_id));

DROP POLICY IF EXISTS article_costs_delete_pop ON public.article_costs;
CREATE POLICY article_costs_delete_pop ON public.article_costs
  FOR DELETE TO authenticated
  USING (public.user_is_member_of_active_pop (pop_id));

COMMENT ON TABLE public.article_costs IS
  'Formas de compra de un artículo: unidad de costo libre, equivalencia a UOM de venta y precio por unidad de costo.';

COMMENT ON COLUMN public.article_costs.name IS
  'Etiqueta opcional del costo (ej. Maple 32 huevos). Puede usarse sin proveedor vinculado.';

COMMENT ON COLUMN public.article_costs.cost_unit_label IS
  'Nombre libre de la unidad de compra (ej. maple de 32, bolsa 25 kg).';

COMMENT ON COLUMN public.article_costs.sale_units_per_cost_unit IS
  'Cuántas unidades de venta del artículo trae 1 unidad de costo.';

COMMENT ON COLUMN public.article_costs.unit_price IS
  'Precio de 1 unidad de costo (referencia de catálogo; la compra puede snapshotear otro valor).';

-- ---------------------------------------------------------------------------
-- Artículos: UOM de venta fija y sin costo embebido
-- ---------------------------------------------------------------------------

UPDATE public.articles
SET unit_of_measure = 'unidad'
WHERE unit_of_measure IS NULL
   OR trim(unit_of_measure) = ''
   OR unit_of_measure NOT IN (
     'unidad',
     'kg',
     'g',
     'lt',
     'ml',
     'm',
     'cm',
     'caja'
   );

ALTER TABLE public.articles
  DROP CONSTRAINT IF EXISTS articles_unit_of_measure_check;

ALTER TABLE public.articles
  ADD CONSTRAINT articles_unit_of_measure_check
  CHECK (
    unit_of_measure IN (
      'unidad',
      'kg',
      'g',
      'lt',
      'ml',
      'm',
      'cm',
      'caja'
    )
  );

COMMENT ON COLUMN public.articles.unit_of_measure IS
  'Unidad de medida de venta y stock (lista fija). El costo de compra vive en article_costs.';

ALTER TABLE public.articles
  DROP COLUMN IF EXISTS cost_price;

ALTER TABLE public.articles
  DROP COLUMN IF EXISTS purchase_uom;

ALTER TABLE public.articles
  DROP COLUMN IF EXISTS purchase_to_stock_factor;
