-- Reservas de mesa en tabla aparte (soporta múltiples fechas por mesa).

CREATE TABLE IF NOT EXISTS public.table_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pop_id UUID NOT NULL REFERENCES public.pops (id) ON DELETE CASCADE,
  dining_table_id UUID NOT NULL REFERENCES public.dining_tables (id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients (id) ON DELETE SET NULL,
  client_name TEXT NOT NULL DEFAULT '',
  arrival_at TIMESTAMPTZ NOT NULL,
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT table_reservations_client_required CHECK (
    client_id IS NOT NULL OR char_length(trim(client_name)) > 0
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS table_reservations_table_arrival_idx
  ON public.table_reservations (dining_table_id, arrival_at);

CREATE INDEX IF NOT EXISTS idx_table_reservations_pop_arrival
  ON public.table_reservations (pop_id, arrival_at);

CREATE INDEX IF NOT EXISTS idx_table_reservations_table_arrival
  ON public.table_reservations (dining_table_id, arrival_at);

CREATE OR REPLACE FUNCTION public.table_reservations_same_pop_as_table ()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  p UUID;
BEGIN
  SELECT pop_id INTO p FROM public.dining_tables WHERE id = NEW.dining_table_id;
  IF p IS NULL THEN
    RAISE EXCEPTION 'table_reservations: mesa inexistente';
  END IF;
  IF p <> NEW.pop_id THEN
    RAISE EXCEPTION 'table_reservations: pop_id debe coincidir con la mesa';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS table_reservations_same_pop_as_table ON public.table_reservations;
CREATE TRIGGER table_reservations_same_pop_as_table
  BEFORE INSERT OR UPDATE OF pop_id, dining_table_id
  ON public.table_reservations
  FOR EACH ROW
  EXECUTE FUNCTION public.table_reservations_same_pop_as_table ();

CREATE OR REPLACE FUNCTION public.table_reservations_validate_table ()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM public.table_session_occupied_table_ids (NEW.pop_id) o
    WHERE o = NEW.dining_table_id
  ) THEN
    RAISE EXCEPTION 'table_reservations: la mesa tiene una sesión abierta';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS table_reservations_validate_table ON public.table_reservations;
CREATE TRIGGER table_reservations_validate_table
  BEFORE INSERT OR UPDATE OF dining_table_id, pop_id
  ON public.table_reservations
  FOR EACH ROW
  EXECUTE FUNCTION public.table_reservations_validate_table ();

DROP TRIGGER IF EXISTS table_reservations_set_updated_at ON public.table_reservations;
CREATE TRIGGER table_reservations_set_updated_at
  BEFORE UPDATE ON public.table_reservations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at ();

ALTER TABLE public.table_reservations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS table_reservations_select_pop ON public.table_reservations;
CREATE POLICY table_reservations_select_pop ON public.table_reservations
  FOR SELECT TO authenticated
  USING (public.user_is_member_of_active_pop (pop_id));

DROP POLICY IF EXISTS table_reservations_insert_pop ON public.table_reservations;
CREATE POLICY table_reservations_insert_pop ON public.table_reservations
  FOR INSERT TO authenticated
  WITH CHECK (public.user_is_member_of_active_pop (pop_id));

DROP POLICY IF EXISTS table_reservations_update_pop ON public.table_reservations;
CREATE POLICY table_reservations_update_pop ON public.table_reservations
  FOR UPDATE TO authenticated
  USING (public.user_is_member_of_active_pop (pop_id))
  WITH CHECK (public.user_is_member_of_active_pop (pop_id));

DROP POLICY IF EXISTS table_reservations_delete_pop ON public.table_reservations;
CREATE POLICY table_reservations_delete_pop ON public.table_reservations
  FOR DELETE TO authenticated
  USING (public.user_is_member_of_active_pop (pop_id));

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.table_reservations;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END $$;

COMMENT ON TABLE public.table_reservations IS
  'Reservas de mesa por fecha/hora. Una mesa puede tener varias reservas en distintos días.';
