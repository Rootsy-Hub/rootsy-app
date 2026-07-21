-- Agregados diarios de ventas para estadísticas por período (snapshot v2).
-- RLS: user_is_member_of_active_pop(pop_id).

CREATE TABLE IF NOT EXISTS public.sales_daily_totals (
  pop_id UUID NOT NULL REFERENCES public.pops (id) ON DELETE CASCADE,
  stat_date DATE NOT NULL,
  list_subtotal NUMERIC(14, 2) NOT NULL DEFAULT 0,
  discount_promotions NUMERIC(14, 2) NOT NULL DEFAULT 0,
  discount_items_catalog NUMERIC(14, 2) NOT NULL DEFAULT 0,
  discount_items_manual NUMERIC(14, 2) NOT NULL DEFAULT 0,
  discount_general NUMERIC(14, 2) NOT NULL DEFAULT 0,
  tax_total NUMERIC(14, 2) NOT NULL DEFAULT 0,
  total NUMERIC(14, 2) NOT NULL DEFAULT 0,
  sale_count INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (pop_id, stat_date)
);

CREATE TABLE IF NOT EXISTS public.sales_daily_promotions (
  pop_id UUID NOT NULL REFERENCES public.pops (id) ON DELETE CASCADE,
  stat_date DATE NOT NULL,
  promotion_key TEXT NOT NULL,
  promotion_name TEXT NOT NULL DEFAULT '',
  promotion_kind TEXT NOT NULL DEFAULT 'quantity_deal',
  applications INTEGER NOT NULL DEFAULT 0,
  discount_amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
  revenue_amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (pop_id, stat_date, promotion_key),
  CONSTRAINT sales_daily_promotions_kind_check
    CHECK (promotion_kind IN ('combo', 'quantity_deal'))
);

CREATE TABLE IF NOT EXISTS public.sales_daily_articles (
  pop_id UUID NOT NULL REFERENCES public.pops (id) ON DELETE CASCADE,
  stat_date DATE NOT NULL,
  article_id UUID NOT NULL,
  name_snapshot TEXT NOT NULL DEFAULT '',
  quantity NUMERIC(18, 6) NOT NULL DEFAULT 0,
  list_amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
  discount_amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
  revenue_amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (pop_id, stat_date, article_id)
);

CREATE TABLE IF NOT EXISTS public.sales_daily_article_in_promo (
  pop_id UUID NOT NULL REFERENCES public.pops (id) ON DELETE CASCADE,
  stat_date DATE NOT NULL,
  article_id UUID NOT NULL,
  promotion_key TEXT NOT NULL,
  name_snapshot TEXT NOT NULL DEFAULT '',
  quantity NUMERIC(18, 6) NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (pop_id, stat_date, article_id, promotion_key)
);

CREATE TABLE IF NOT EXISTS public.sales_daily_recipes (
  pop_id UUID NOT NULL REFERENCES public.pops (id) ON DELETE CASCADE,
  stat_date DATE NOT NULL,
  recipe_id UUID NOT NULL,
  name_snapshot TEXT NOT NULL DEFAULT '',
  quantity NUMERIC(18, 6) NOT NULL DEFAULT 0,
  list_amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
  discount_amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
  revenue_amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (pop_id, stat_date, recipe_id)
);

CREATE TABLE IF NOT EXISTS public.sales_daily_discounts (
  pop_id UUID NOT NULL REFERENCES public.pops (id) ON DELETE CASCADE,
  stat_date DATE NOT NULL,
  discount_kind TEXT NOT NULL,
  discount_label TEXT NOT NULL DEFAULT '',
  applications INTEGER NOT NULL DEFAULT 0,
  discount_amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (pop_id, stat_date, discount_kind, discount_label),
  CONSTRAINT sales_daily_discounts_kind_check
    CHECK (discount_kind IN ('catalog', 'manual', 'general'))
);

CREATE INDEX IF NOT EXISTS idx_sales_daily_totals_pop_date
  ON public.sales_daily_totals (pop_id, stat_date DESC);

ALTER TABLE public.sales_daily_totals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_daily_promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_daily_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_daily_article_in_promo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_daily_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_daily_discounts ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'sales_daily_totals',
    'sales_daily_promotions',
    'sales_daily_articles',
    'sales_daily_article_in_promo',
    'sales_daily_recipes',
    'sales_daily_discounts'
  ]
  LOOP
    EXECUTE format(
      'DROP POLICY IF EXISTS %I_select ON public.%I',
      tbl,
      tbl
    );
    EXECUTE format(
      'CREATE POLICY %I_select ON public.%I FOR SELECT USING (public.user_is_member_of_active_pop(pop_id))',
      tbl,
      tbl
    );
    EXECUTE format(
      'DROP POLICY IF EXISTS %I_insert ON public.%I',
      tbl,
      tbl
    );
    EXECUTE format(
      'CREATE POLICY %I_insert ON public.%I FOR INSERT WITH CHECK (public.user_is_member_of_active_pop(pop_id))',
      tbl,
      tbl
    );
    EXECUTE format(
      'DROP POLICY IF EXISTS %I_update ON public.%I',
      tbl,
      tbl
    );
    EXECUTE format(
      'CREATE POLICY %I_update ON public.%I FOR UPDATE USING (public.user_is_member_of_active_pop(pop_id)) WITH CHECK (public.user_is_member_of_active_pop(pop_id))',
      tbl,
      tbl
    );
    EXECUTE format(
      'DROP POLICY IF EXISTS %I_delete ON public.%I',
      tbl,
      tbl
    );
    EXECUTE format(
      'CREATE POLICY %I_delete ON public.%I FOR DELETE USING (public.user_is_member_of_active_pop(pop_id))',
      tbl,
      tbl
    );
  END LOOP;
END;
$$;
