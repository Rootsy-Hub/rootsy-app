-- Wizard de servicios: imagen, grilla de detalles, contrato texto, precio/cobro y artículos

ALTER TABLE public.service_types
  ADD COLUMN IF NOT EXISTS image_url text,
  ADD COLUMN IF NOT EXISTS details_grid jsonb NOT NULL DEFAULT '{"columns":[],"rows":[]}'::jsonb,
  ADD COLUMN IF NOT EXISTS contract_text text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS payment_mode text NOT NULL DEFAULT 'subscription',
  ADD COLUMN IF NOT EXISTS due_day smallint,
  ADD COLUMN IF NOT EXISTS late_interest_type text NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS late_interest_value numeric(8, 4),
  ADD COLUMN IF NOT EXISTS discount_mode text NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS discount_value numeric(15, 2);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'service_types_payment_mode_check'
  ) THEN
    ALTER TABLE public.service_types
      ADD CONSTRAINT service_types_payment_mode_check
      CHECK (payment_mode IN ('subscription', 'one_time'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'service_types_due_day_check'
  ) THEN
    ALTER TABLE public.service_types
      ADD CONSTRAINT service_types_due_day_check
      CHECK (due_day IS NULL OR (due_day >= 1 AND due_day <= 31));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'service_types_late_interest_type_check'
  ) THEN
    ALTER TABLE public.service_types
      ADD CONSTRAINT service_types_late_interest_type_check
      CHECK (late_interest_type IN ('none', 'simple_percent'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'service_types_discount_mode_check'
  ) THEN
    ALTER TABLE public.service_types
      ADD CONSTRAINT service_types_discount_mode_check
      CHECK (discount_mode IN ('none', 'porcentaje', 'fijo'));
  END IF;
END $$;

COMMENT ON COLUMN public.service_types.details_grid IS
  'Grilla de detalles: { "columns": string[], "rows": string[][] } (máx. 5 columnas, 44 filas).';

COMMENT ON COLUMN public.service_types.contract_text IS
  'Texto plano del contrato/plantilla asociada al tipo de servicio.';

CREATE TABLE IF NOT EXISTS public.service_type_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pop_id uuid NOT NULL REFERENCES public.pops (id) ON DELETE CASCADE,
  service_type_id uuid NOT NULL REFERENCES public.service_types (id) ON DELETE CASCADE,
  article_id uuid NOT NULL REFERENCES public.articles (id) ON DELETE RESTRICT,
  quantity numeric(15, 4) NOT NULL DEFAULT 1 CHECK (quantity > 0),
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT service_type_articles_unique_article UNIQUE (service_type_id, article_id)
);

CREATE INDEX IF NOT EXISTS idx_service_type_articles_service
  ON public.service_type_articles (service_type_id, sort_order);

CREATE INDEX IF NOT EXISTS idx_service_type_articles_pop
  ON public.service_type_articles (pop_id);

ALTER TABLE public.service_type_articles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS service_type_articles_select_pop ON public.service_type_articles;
CREATE POLICY service_type_articles_select_pop ON public.service_type_articles
  FOR SELECT TO authenticated
  USING (public.user_is_member_of_active_pop(pop_id));

DROP POLICY IF EXISTS service_type_articles_insert_pop ON public.service_type_articles;
CREATE POLICY service_type_articles_insert_pop ON public.service_type_articles
  FOR INSERT TO authenticated
  WITH CHECK (public.user_is_member_of_active_pop(pop_id));

DROP POLICY IF EXISTS service_type_articles_update_pop ON public.service_type_articles;
CREATE POLICY service_type_articles_update_pop ON public.service_type_articles
  FOR UPDATE TO authenticated
  USING (public.user_is_member_of_active_pop(pop_id))
  WITH CHECK (public.user_is_member_of_active_pop(pop_id));

DROP POLICY IF EXISTS service_type_articles_delete_pop ON public.service_type_articles;
CREATE POLICY service_type_articles_delete_pop ON public.service_type_articles
  FOR DELETE TO authenticated
  USING (public.user_is_member_of_active_pop(pop_id));
