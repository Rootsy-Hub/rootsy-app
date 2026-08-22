-- Tickets de comanda: recetas pedidas en mesa/mostrador, por estación y estado.
-- pending = sin comandar (no se arrastra). sent / ready / delivered sí.

CREATE TABLE IF NOT EXISTS public.comandas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pop_id UUID NOT NULL REFERENCES public.pops (id) ON DELETE CASCADE,
  station_id UUID NOT NULL REFERENCES public.comanda_stations (id) ON DELETE RESTRICT,
  status TEXT NOT NULL DEFAULT 'pending',
  source_kind TEXT NOT NULL,
  source_id UUID NOT NULL,
  table_session_id UUID REFERENCES public.table_sessions (id) ON DELETE CASCADE,
  counter_order_id UUID REFERENCES public.counter_orders (id) ON DELETE CASCADE,
  cart_line_id TEXT NOT NULL,
  recipe_id UUID REFERENCES public.recipes (id) ON DELETE SET NULL,
  recipe_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  comment TEXT NOT NULL DEFAULT '',
  origin_label TEXT NOT NULL,
  customer_name TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status_changed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  sent_at TIMESTAMPTZ,
  ready_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  CONSTRAINT comandas_status_check
    CHECK (status IN ('pending', 'sent', 'ready', 'delivered')),
  CONSTRAINT comandas_source_kind_check
    CHECK (source_kind IN ('table', 'counter')),
  CONSTRAINT comandas_quantity_pos CHECK (quantity > 0),
  CONSTRAINT comandas_recipe_name_nonempty CHECK (char_length(trim(recipe_name)) > 0),
  CONSTRAINT comandas_origin_label_nonempty CHECK (char_length(trim(origin_label)) > 0),
  CONSTRAINT comandas_source_consistency CHECK (
    (source_kind = 'table' AND table_session_id IS NOT NULL AND table_session_id = source_id AND counter_order_id IS NULL)
    OR
    (source_kind = 'counter' AND counter_order_id IS NOT NULL AND counter_order_id = source_id AND table_session_id IS NULL)
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS comandas_source_line_unique
  ON public.comandas (source_kind, source_id, cart_line_id);

CREATE INDEX IF NOT EXISTS idx_comandas_pop_station_status
  ON public.comandas (pop_id, station_id, status, created_at);

CREATE INDEX IF NOT EXISTS idx_comandas_pop_status_changed
  ON public.comandas (pop_id, status, status_changed_at DESC);

CREATE INDEX IF NOT EXISTS idx_comandas_table_session
  ON public.comandas (table_session_id)
  WHERE table_session_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_comandas_counter_order
  ON public.comandas (counter_order_id)
  WHERE counter_order_id IS NOT NULL;

DROP TRIGGER IF EXISTS comandas_set_updated_at ON public.comandas;
CREATE TRIGGER comandas_set_updated_at
  BEFORE UPDATE ON public.comandas
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at ();

ALTER TABLE public.comandas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS comandas_select ON public.comandas;
CREATE POLICY comandas_select ON public.comandas
  FOR SELECT TO authenticated
  USING (public.user_is_member_of_active_pop(pop_id));

DROP POLICY IF EXISTS comandas_insert ON public.comandas;
CREATE POLICY comandas_insert ON public.comandas
  FOR INSERT TO authenticated
  WITH CHECK (public.user_is_member_of_active_pop(pop_id));

DROP POLICY IF EXISTS comandas_update ON public.comandas;
CREATE POLICY comandas_update ON public.comandas
  FOR UPDATE TO authenticated
  USING (public.user_is_member_of_active_pop(pop_id))
  WITH CHECK (public.user_is_member_of_active_pop(pop_id));

DROP POLICY IF EXISTS comandas_delete ON public.comandas;
CREATE POLICY comandas_delete ON public.comandas
  FOR DELETE TO authenticated
  USING (public.user_is_member_of_active_pop(pop_id));

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'comandas'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.comandas;
  END IF;
END $$;

COMMENT ON TABLE public.comandas IS
  'Tickets de cocina/barra: una fila por línea de receta en mesa o mostrador.';
COMMENT ON COLUMN public.comandas.status IS
  'pending (sin comandar), sent (comandado), ready (listo), delivered (entregado).';
COMMENT ON COLUMN public.comandas.sent_at IS
  'Primera vez que pasó a comandado. Para medir tiempo de cocina.';
COMMENT ON COLUMN public.comandas.ready_at IS
  'Primera vez que quedó listo. Para medir tiempo hasta entregar.';
COMMENT ON COLUMN public.comandas.delivered_at IS
  'Primera vez que se entregó.';
