-- Receta: qué artículo deja en stock al fabricar. Vacío = se descuenta al vender.

ALTER TABLE public.recipes
  ADD COLUMN IF NOT EXISTS output_article_id UUID REFERENCES public.articles (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_recipes_output_article
  ON public.recipes (pop_id, output_article_id)
  WHERE output_article_id IS NOT NULL;

COMMENT ON COLUMN public.recipes.output_article_id IS
  'Artículo que entra al depósito al confirmar Fabricar. Vacío: la receta se consume al vender.';

CREATE TABLE IF NOT EXISTS public.pop_manufacturing_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pop_id UUID NOT NULL REFERENCES public.pops (id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES public.recipes (id) ON DELETE RESTRICT,
  output_article_id UUID NOT NULL REFERENCES public.articles (id) ON DELETE RESTRICT,
  location_id UUID NOT NULL REFERENCES public.inventory_locations (id) ON DELETE RESTRICT,
  quantity NUMERIC(15, 6) NOT NULL,
  unit_cost NUMERIC(15, 4) NOT NULL,
  total_cost NUMERIC(15, 2) NOT NULL,
  expires_at DATE,
  notes TEXT,
  produced_at DATE NOT NULL,
  produced_by UUID REFERENCES public.users (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT pop_manufacturing_runs_qty_pos CHECK (quantity > 0)
);

CREATE INDEX IF NOT EXISTS idx_pop_manufacturing_runs_pop_day
  ON public.pop_manufacturing_runs (pop_id, produced_at DESC);

COMMENT ON TABLE public.pop_manufacturing_runs IS
  'Una producción: una receta × una cantidad, un día. Baja insumos FEFO y entra una capa del artículo producido.';

ALTER TABLE public.pop_manufacturing_runs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS pop_manufacturing_runs_select_pop ON public.pop_manufacturing_runs;
CREATE POLICY pop_manufacturing_runs_select_pop ON public.pop_manufacturing_runs
  FOR SELECT TO authenticated
  USING (public.user_is_member_of_active_pop(pop_id));

DROP POLICY IF EXISTS pop_manufacturing_runs_insert_pop ON public.pop_manufacturing_runs;
CREATE POLICY pop_manufacturing_runs_insert_pop ON public.pop_manufacturing_runs
  FOR INSERT TO authenticated
  WITH CHECK (public.user_is_member_of_active_pop(pop_id));
