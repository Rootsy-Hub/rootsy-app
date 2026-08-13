-- Adicionales opcionales del tipo de servicio (nombre + precio) y artículos por adicional

CREATE TABLE IF NOT EXISTS public.service_type_addons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pop_id uuid NOT NULL REFERENCES public.pops (id) ON DELETE CASCADE,
  service_type_id uuid NOT NULL REFERENCES public.service_types (id) ON DELETE CASCADE,
  name text NOT NULL,
  price numeric(15, 2) NOT NULL DEFAULT 0 CHECK (price >= 0),
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT service_type_addons_name_not_empty CHECK (char_length(trim(name)) > 0)
);

CREATE INDEX IF NOT EXISTS idx_service_type_addons_service
  ON public.service_type_addons (service_type_id, sort_order);

CREATE INDEX IF NOT EXISTS idx_service_type_addons_pop
  ON public.service_type_addons (pop_id);

CREATE TABLE IF NOT EXISTS public.service_type_addon_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pop_id uuid NOT NULL REFERENCES public.pops (id) ON DELETE CASCADE,
  addon_id uuid NOT NULL REFERENCES public.service_type_addons (id) ON DELETE CASCADE,
  article_id uuid NOT NULL REFERENCES public.articles (id) ON DELETE RESTRICT,
  quantity numeric(15, 4) NOT NULL DEFAULT 1 CHECK (quantity > 0),
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT service_type_addon_articles_unique_article UNIQUE (addon_id, article_id)
);

CREATE INDEX IF NOT EXISTS idx_service_type_addon_articles_addon
  ON public.service_type_addon_articles (addon_id, sort_order);

CREATE INDEX IF NOT EXISTS idx_service_type_addon_articles_pop
  ON public.service_type_addon_articles (pop_id);

ALTER TABLE public.service_type_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_type_addon_articles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS service_type_addons_select_pop ON public.service_type_addons;
CREATE POLICY service_type_addons_select_pop ON public.service_type_addons
  FOR SELECT TO authenticated
  USING (public.user_is_member_of_active_pop(pop_id));

DROP POLICY IF EXISTS service_type_addons_insert_pop ON public.service_type_addons;
CREATE POLICY service_type_addons_insert_pop ON public.service_type_addons
  FOR INSERT TO authenticated
  WITH CHECK (public.user_is_member_of_active_pop(pop_id));

DROP POLICY IF EXISTS service_type_addons_update_pop ON public.service_type_addons;
CREATE POLICY service_type_addons_update_pop ON public.service_type_addons
  FOR UPDATE TO authenticated
  USING (public.user_is_member_of_active_pop(pop_id))
  WITH CHECK (public.user_is_member_of_active_pop(pop_id));

DROP POLICY IF EXISTS service_type_addons_delete_pop ON public.service_type_addons;
CREATE POLICY service_type_addons_delete_pop ON public.service_type_addons
  FOR DELETE TO authenticated
  USING (public.user_is_member_of_active_pop(pop_id));

DROP POLICY IF EXISTS service_type_addon_articles_select_pop ON public.service_type_addon_articles;
CREATE POLICY service_type_addon_articles_select_pop ON public.service_type_addon_articles
  FOR SELECT TO authenticated
  USING (public.user_is_member_of_active_pop(pop_id));

DROP POLICY IF EXISTS service_type_addon_articles_insert_pop ON public.service_type_addon_articles;
CREATE POLICY service_type_addon_articles_insert_pop ON public.service_type_addon_articles
  FOR INSERT TO authenticated
  WITH CHECK (public.user_is_member_of_active_pop(pop_id));

DROP POLICY IF EXISTS service_type_addon_articles_update_pop ON public.service_type_addon_articles;
CREATE POLICY service_type_addon_articles_update_pop ON public.service_type_addon_articles
  FOR UPDATE TO authenticated
  USING (public.user_is_member_of_active_pop(pop_id))
  WITH CHECK (public.user_is_member_of_active_pop(pop_id));

DROP POLICY IF EXISTS service_type_addon_articles_delete_pop ON public.service_type_addon_articles;
CREATE POLICY service_type_addon_articles_delete_pop ON public.service_type_addon_articles
  FOR DELETE TO authenticated
  USING (public.user_is_member_of_active_pop(pop_id));

COMMENT ON TABLE public.service_type_addons IS
  'Adicionales opcionales contratables sobre un tipo de servicio (ej. módulo facturación).';

COMMENT ON TABLE public.service_type_addon_articles IS
  'Artículos de stock consumidos cuando se aplica un adicional al contratar.';
