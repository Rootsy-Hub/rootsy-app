-- Envío de comanda: un ticket por estación, con varios ítems.
CREATE TABLE IF NOT EXISTS public.comanda_sends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pop_id UUID NOT NULL REFERENCES public.pops (id) ON DELETE CASCADE,
  station_id UUID NOT NULL REFERENCES public.comanda_stations (id) ON DELETE RESTRICT,
  status TEXT NOT NULL DEFAULT 'sent',
  source_kind TEXT NOT NULL,
  source_id UUID NOT NULL,
  table_session_id UUID REFERENCES public.table_sessions (id) ON DELETE CASCADE,
  counter_order_id UUID REFERENCES public.counter_orders (id) ON DELETE CASCADE,
  comment TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status_changed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  preparing_at TIMESTAMPTZ,
  ready_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  CONSTRAINT comanda_sends_status_check
    CHECK (status IN ('sent', 'preparing', 'ready', 'delivered')),
  CONSTRAINT comanda_sends_source_kind_check
    CHECK (source_kind IN ('table', 'counter')),
  CONSTRAINT comanda_sends_source_consistency CHECK (
    (source_kind = 'table' AND table_session_id IS NOT NULL AND table_session_id = source_id AND counter_order_id IS NULL)
    OR
    (source_kind = 'counter' AND counter_order_id IS NOT NULL AND counter_order_id = source_id AND table_session_id IS NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_comanda_sends_pop_station_status
  ON public.comanda_sends (pop_id, station_id, status, created_at);

CREATE INDEX IF NOT EXISTS idx_comanda_sends_source
  ON public.comanda_sends (pop_id, source_kind, source_id);

DROP TRIGGER IF EXISTS comanda_sends_set_updated_at ON public.comanda_sends;
CREATE TRIGGER comanda_sends_set_updated_at
  BEFORE UPDATE ON public.comanda_sends
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at ();

ALTER TABLE public.comanda_sends ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS comanda_sends_select ON public.comanda_sends;
CREATE POLICY comanda_sends_select ON public.comanda_sends
  FOR SELECT TO authenticated
  USING (public.user_is_member_of_active_pop(pop_id));

DROP POLICY IF EXISTS comanda_sends_insert ON public.comanda_sends;
CREATE POLICY comanda_sends_insert ON public.comanda_sends
  FOR INSERT TO authenticated
  WITH CHECK (public.user_is_member_of_active_pop(pop_id));

DROP POLICY IF EXISTS comanda_sends_update ON public.comanda_sends;
CREATE POLICY comanda_sends_update ON public.comanda_sends
  FOR UPDATE TO authenticated
  USING (public.user_is_member_of_active_pop(pop_id))
  WITH CHECK (public.user_is_member_of_active_pop(pop_id));

ALTER TABLE public.comandas
  ADD COLUMN IF NOT EXISTS send_id UUID REFERENCES public.comanda_sends (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_comandas_send_id
  ON public.comandas (send_id)
  WHERE send_id IS NOT NULL;

COMMENT ON TABLE public.comanda_sends IS
  'Envío de comanda a una estación: varios ítems, un comentario general.';
COMMENT ON COLUMN public.comandas.send_id IS
  'Envío al que pertenece el ítem. Null = sin comandar.';
