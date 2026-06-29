-- Visibilidad y orden de categorías en la pantalla de ventas.

ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;

ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS show_in_sale BOOLEAN NOT NULL DEFAULT true;

WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (PARTITION BY pop_id ORDER BY name) - 1 AS rn
  FROM public.categories
)
UPDATE public.categories c
SET sort_order = ranked.rn
FROM ranked
WHERE c.id = ranked.id;

CREATE INDEX IF NOT EXISTS idx_categories_pop_sale_order
  ON public.categories (pop_id, show_in_sale, sort_order, name);

COMMENT ON COLUMN public.categories.sort_order IS
  'Orden de la categoría dentro de su columna (visible u oculta en ventas).';
COMMENT ON COLUMN public.categories.show_in_sale IS
  'Si true, la categoría aparece en el catálogo de ventas.';
