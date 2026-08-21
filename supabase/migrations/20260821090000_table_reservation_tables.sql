-- Mesas extra de una reserva (mismo patrón que table_session_tables).

CREATE TABLE IF NOT EXISTS public.table_reservation_tables (
  table_reservation_id UUID NOT NULL REFERENCES public.table_reservations (id) ON DELETE CASCADE,
  dining_table_id UUID NOT NULL REFERENCES public.dining_tables (id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (table_reservation_id, dining_table_id)
);

CREATE INDEX IF NOT EXISTS idx_table_reservation_tables_dining_table
  ON public.table_reservation_tables (dining_table_id);

CREATE OR REPLACE FUNCTION public.table_reservation_tables_same_pop ()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  reservation_pop UUID;
  table_pop UUID;
  primary_table UUID;
BEGIN
  SELECT pop_id, dining_table_id
    INTO reservation_pop, primary_table
  FROM public.table_reservations
  WHERE id = NEW.table_reservation_id;

  IF reservation_pop IS NULL THEN
    RAISE EXCEPTION 'table_reservation_tables: reserva inexistente';
  END IF;

  IF primary_table IS NULL THEN
    RAISE EXCEPTION 'table_reservation_tables: la reserva no tiene mesa principal';
  END IF;

  IF NEW.dining_table_id = primary_table THEN
    RAISE EXCEPTION 'table_reservation_tables: la mesa extra no puede ser la principal';
  END IF;

  SELECT pop_id INTO table_pop
  FROM public.dining_tables
  WHERE id = NEW.dining_table_id;

  IF table_pop IS NULL THEN
    RAISE EXCEPTION 'table_reservation_tables: mesa inexistente';
  END IF;

  IF table_pop <> reservation_pop THEN
    RAISE EXCEPTION 'table_reservation_tables: pop_id debe coincidir con la reserva';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS table_reservation_tables_same_pop ON public.table_reservation_tables;
CREATE TRIGGER table_reservation_tables_same_pop
  BEFORE INSERT OR UPDATE OF table_reservation_id, dining_table_id
  ON public.table_reservation_tables
  FOR EACH ROW
  EXECUTE FUNCTION public.table_reservation_tables_same_pop ();

ALTER TABLE public.table_reservation_tables ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS table_reservation_tables_select_pop ON public.table_reservation_tables;
CREATE POLICY table_reservation_tables_select_pop ON public.table_reservation_tables
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.table_reservations tr
      WHERE tr.id = table_reservation_id
        AND public.user_is_member_of_active_pop (tr.pop_id)
    )
  );

DROP POLICY IF EXISTS table_reservation_tables_insert_pop ON public.table_reservation_tables;
CREATE POLICY table_reservation_tables_insert_pop ON public.table_reservation_tables
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.table_reservations tr
      WHERE tr.id = table_reservation_id
        AND public.user_is_member_of_active_pop (tr.pop_id)
    )
  );

DROP POLICY IF EXISTS table_reservation_tables_update_pop ON public.table_reservation_tables;
CREATE POLICY table_reservation_tables_update_pop ON public.table_reservation_tables
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.table_reservations tr
      WHERE tr.id = table_reservation_id
        AND public.user_is_member_of_active_pop (tr.pop_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.table_reservations tr
      WHERE tr.id = table_reservation_id
        AND public.user_is_member_of_active_pop (tr.pop_id)
    )
  );

DROP POLICY IF EXISTS table_reservation_tables_delete_pop ON public.table_reservation_tables;
CREATE POLICY table_reservation_tables_delete_pop ON public.table_reservation_tables
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.table_reservations tr
      WHERE tr.id = table_reservation_id
        AND public.user_is_member_of_active_pop (tr.pop_id)
    )
  );

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.table_reservation_tables;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END $$;

COMMENT ON TABLE public.table_reservation_tables IS
  'Mesas extra unidas a una reserva. La principal sigue en table_reservations.dining_table_id.';
