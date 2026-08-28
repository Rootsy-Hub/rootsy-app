-- Revierte categorías de promociones: el rail vuelve a una sola sección sintética.

ALTER TABLE public.promotions DROP COLUMN IF EXISTS category_id;

DROP INDEX IF EXISTS public.idx_promotions_pop_category;
DROP INDEX IF EXISTS public.idx_promotion_categories_pop_sale;

DROP TRIGGER IF EXISTS promotion_categories_set_updated_at ON public.promotion_categories;

DROP POLICY IF EXISTS promotion_categories_select ON public.promotion_categories;
DROP POLICY IF EXISTS promotion_categories_insert ON public.promotion_categories;
DROP POLICY IF EXISTS promotion_categories_update ON public.promotion_categories;
DROP POLICY IF EXISTS promotion_categories_delete ON public.promotion_categories;

DROP TABLE IF EXISTS public.promotion_categories;
