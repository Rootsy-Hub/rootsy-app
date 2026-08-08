-- Recetas: platos/tragos con composición (BOM) para Mesas/Mostrador.

CREATE TABLE IF NOT EXISTS public.recipe_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pop_id UUID NOT NULL REFERENCES public.pops (id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  show_in_menu BOOLEAN NOT NULL DEFAULT TRUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT recipe_categories_name_nonempty CHECK (char_length(trim(name)) > 0)
);

CREATE INDEX IF NOT EXISTS idx_recipe_categories_pop_sort
  ON public.recipe_categories (pop_id, sort_order, name);

CREATE TABLE IF NOT EXISTS public.recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pop_id UUID NOT NULL REFERENCES public.pops (id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.recipe_categories (id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  sale_price NUMERIC(14, 2) NOT NULL DEFAULT 0,
  cost_price NUMERIC(14, 4) NOT NULL DEFAULT 0,
  iva NUMERIC(5, 2) NOT NULL DEFAULT 21,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT recipes_name_nonempty CHECK (char_length(trim(name)) > 0),
  CONSTRAINT recipes_sale_price_nonneg CHECK (sale_price >= 0),
  CONSTRAINT recipes_cost_price_nonneg CHECK (cost_price >= 0),
  CONSTRAINT recipes_iva_range CHECK (iva >= 0 AND iva <= 100)
);

CREATE INDEX IF NOT EXISTS idx_recipes_pop_active
  ON public.recipes (pop_id, is_active, name);

CREATE INDEX IF NOT EXISTS idx_recipes_pop_category
  ON public.recipes (pop_id, category_id);

CREATE TABLE IF NOT EXISTS public.recipe_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES public.recipes (id) ON DELETE CASCADE,
  pop_id UUID NOT NULL REFERENCES public.pops (id) ON DELETE CASCADE,
  article_id UUID NOT NULL REFERENCES public.articles (id) ON DELETE RESTRICT,
  quantity NUMERIC(14, 6) NOT NULL,
  waste_pct NUMERIC(5, 2),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT recipe_ingredients_quantity_pos CHECK (quantity > 0),
  CONSTRAINT recipe_ingredients_waste_range
    CHECK (waste_pct IS NULL OR (waste_pct >= 0 AND waste_pct <= 100)),
  CONSTRAINT recipe_ingredients_recipe_article_unique UNIQUE (recipe_id, article_id)
);

CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_recipe
  ON public.recipe_ingredients (recipe_id, sort_order);

CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_article
  ON public.recipe_ingredients (pop_id, article_id);

-- Menú de productos en Mesas/Mostrador (fase 2; columna preparada).
ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS show_in_menu BOOLEAN NOT NULL DEFAULT TRUE;

COMMENT ON COLUMN public.categories.show_in_menu IS
  'Si la categoría de producto aparece en el menú de Mesas/Mostrador.';

DROP TRIGGER IF EXISTS recipe_categories_set_updated_at ON public.recipe_categories;
CREATE TRIGGER recipe_categories_set_updated_at
  BEFORE UPDATE ON public.recipe_categories
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at ();

DROP TRIGGER IF EXISTS recipes_set_updated_at ON public.recipes;
CREATE TRIGGER recipes_set_updated_at
  BEFORE UPDATE ON public.recipes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at ();

-- RLS
ALTER TABLE public.recipe_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_ingredients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS recipe_categories_select ON public.recipe_categories;
CREATE POLICY recipe_categories_select ON public.recipe_categories
  FOR SELECT TO authenticated
  USING (public.user_is_member_of_active_pop(pop_id));

DROP POLICY IF EXISTS recipe_categories_insert ON public.recipe_categories;
CREATE POLICY recipe_categories_insert ON public.recipe_categories
  FOR INSERT TO authenticated
  WITH CHECK (public.user_is_member_of_active_pop(pop_id));

DROP POLICY IF EXISTS recipe_categories_update ON public.recipe_categories;
CREATE POLICY recipe_categories_update ON public.recipe_categories
  FOR UPDATE TO authenticated
  USING (public.user_is_member_of_active_pop(pop_id))
  WITH CHECK (public.user_is_member_of_active_pop(pop_id));

DROP POLICY IF EXISTS recipe_categories_delete ON public.recipe_categories;
CREATE POLICY recipe_categories_delete ON public.recipe_categories
  FOR DELETE TO authenticated
  USING (public.user_is_member_of_active_pop(pop_id));

DROP POLICY IF EXISTS recipes_select ON public.recipes;
CREATE POLICY recipes_select ON public.recipes
  FOR SELECT TO authenticated
  USING (public.user_is_member_of_active_pop(pop_id));

DROP POLICY IF EXISTS recipes_insert ON public.recipes;
CREATE POLICY recipes_insert ON public.recipes
  FOR INSERT TO authenticated
  WITH CHECK (public.user_is_member_of_active_pop(pop_id));

DROP POLICY IF EXISTS recipes_update ON public.recipes;
CREATE POLICY recipes_update ON public.recipes
  FOR UPDATE TO authenticated
  USING (public.user_is_member_of_active_pop(pop_id))
  WITH CHECK (public.user_is_member_of_active_pop(pop_id));

DROP POLICY IF EXISTS recipes_delete ON public.recipes;
CREATE POLICY recipes_delete ON public.recipes
  FOR DELETE TO authenticated
  USING (public.user_is_member_of_active_pop(pop_id));

DROP POLICY IF EXISTS recipe_ingredients_select ON public.recipe_ingredients;
CREATE POLICY recipe_ingredients_select ON public.recipe_ingredients
  FOR SELECT TO authenticated
  USING (public.user_is_member_of_active_pop(pop_id));

DROP POLICY IF EXISTS recipe_ingredients_insert ON public.recipe_ingredients;
CREATE POLICY recipe_ingredients_insert ON public.recipe_ingredients
  FOR INSERT TO authenticated
  WITH CHECK (public.user_is_member_of_active_pop(pop_id));

DROP POLICY IF EXISTS recipe_ingredients_update ON public.recipe_ingredients;
CREATE POLICY recipe_ingredients_update ON public.recipe_ingredients
  FOR UPDATE TO authenticated
  USING (public.user_is_member_of_active_pop(pop_id))
  WITH CHECK (public.user_is_member_of_active_pop(pop_id));

DROP POLICY IF EXISTS recipe_ingredients_delete ON public.recipe_ingredients;
CREATE POLICY recipe_ingredients_delete ON public.recipe_ingredients
  FOR DELETE TO authenticated
  USING (public.user_is_member_of_active_pop(pop_id));

COMMENT ON TABLE public.recipe_categories IS
  'Categorías del menú de recetas (Mesas/Mostrador).';
COMMENT ON TABLE public.recipes IS
  'Platos o tragos vendibles por unidad; costo calculado desde ingredientes.';
COMMENT ON TABLE public.recipe_ingredients IS
  'Composición de receta: materias primas e insumos con cantidad y merma.';

-- Permisos recipes en roles owner/administrator
DO $$
DECLARE
  r RECORD;
  grants JSONB;
  new_perms JSONB := '["recipes:read","recipes:create","recipes:update","recipes:delete"]'::jsonb;
  p TEXT;
BEGIN
  FOR r IN
    SELECT id, permission_grants
    FROM public.roles
    WHERE lower(name) IN ('administrator', 'owner', 'administrador', 'dueño', 'dueno')
  LOOP
    grants := COALESCE(r.permission_grants, '[]'::jsonb);
    FOR p IN SELECT jsonb_array_elements_text(new_perms)
    LOOP
      IF NOT grants @> to_jsonb(p) THEN
        grants := grants || to_jsonb(p);
      END IF;
    END LOOP;
    UPDATE public.roles SET permission_grants = grants WHERE id = r.id;
  END LOOP;
END $$;
