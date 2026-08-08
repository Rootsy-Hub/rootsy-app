-- Marca, descuento de catálogo (productos) y vínculo artículo ↔ proveedores.

ALTER TABLE public.articles
  ADD COLUMN IF NOT EXISTS brand TEXT NOT NULL DEFAULT '';

ALTER TABLE public.articles
  ADD COLUMN IF NOT EXISTS discount_mode TEXT;

ALTER TABLE public.articles
  ADD COLUMN IF NOT EXISTS discount_value NUMERIC(15, 2);

ALTER TABLE public.articles
  DROP CONSTRAINT IF EXISTS articles_discount_mode_check;

ALTER TABLE public.articles
  ADD CONSTRAINT articles_discount_mode_check
    CHECK (discount_mode IS NULL OR discount_mode IN ('porcentaje', 'fijo'));

ALTER TABLE public.articles
  DROP CONSTRAINT IF EXISTS articles_discount_value_check;

ALTER TABLE public.articles
  ADD CONSTRAINT articles_discount_value_check
    CHECK (discount_value IS NULL OR discount_value >= 0);

COMMENT ON COLUMN public.articles.brand IS 'Marca comercial del ítem (opcional).';
COMMENT ON COLUMN public.articles.discount_mode IS
  'Descuento de catálogo para productos: porcentaje o monto fijo sobre precio de venta.';
COMMENT ON COLUMN public.articles.discount_value IS
  'Valor del descuento según discount_mode (% o ARS).';

CREATE TABLE IF NOT EXISTS public.article_suppliers (
  article_id UUID NOT NULL REFERENCES public.articles (id) ON DELETE CASCADE,
  supplier_id UUID NOT NULL REFERENCES public.suppliers (id) ON DELETE CASCADE,
  pop_id UUID NOT NULL REFERENCES public.pops (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (article_id, supplier_id)
);

CREATE INDEX IF NOT EXISTS idx_article_suppliers_pop_article
  ON public.article_suppliers (pop_id, article_id);

CREATE INDEX IF NOT EXISTS idx_article_suppliers_supplier
  ON public.article_suppliers (pop_id, supplier_id);

ALTER TABLE public.article_suppliers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS article_suppliers_select ON public.article_suppliers;
CREATE POLICY article_suppliers_select ON public.article_suppliers
  FOR SELECT
  USING (public.user_is_member_of_active_pop (pop_id));

DROP POLICY IF EXISTS article_suppliers_insert ON public.article_suppliers;
CREATE POLICY article_suppliers_insert ON public.article_suppliers
  FOR INSERT
  WITH CHECK (public.user_is_member_of_active_pop (pop_id));

DROP POLICY IF EXISTS article_suppliers_delete ON public.article_suppliers;
CREATE POLICY article_suppliers_delete ON public.article_suppliers
  FOR DELETE
  USING (public.user_is_member_of_active_pop (pop_id));
