-- Revert agregados diarios de ventas (stats se implementarán en pantalla dedicada).

DROP TABLE IF EXISTS public.sales_daily_article_in_promo;
DROP TABLE IF EXISTS public.sales_daily_discounts;
DROP TABLE IF EXISTS public.sales_daily_recipes;
DROP TABLE IF EXISTS public.sales_daily_articles;
DROP TABLE IF EXISTS public.sales_daily_promotions;
DROP TABLE IF EXISTS public.sales_daily_totals;
