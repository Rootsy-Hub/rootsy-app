-- Sesiones de mesa: mozo, mesas unidas, validación y realtime.

ALTER TABLE public.table_sessions
  ADD COLUMN IF NOT EXISTS waiter_user_id UUID REFERENCES auth.users (id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS public.table_session_tables (
  table_session_id UUID NOT NULL REFERENCES public.table_sessions (id) ON DELETE CASCADE,
  dining_table_id UUID NOT NULL REFERENCES public.dining_tables (id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (table_session_id, dining_table_id)
);

CREATE INDEX IF NOT EXISTS idx_table_session_tables_dining_table
  ON public.table_session_tables (dining_table_id);

CREATE OR REPLACE FUNCTION public.table_session_occupied_table_ids (p_pop_id UUID)
RETURNS SETOF UUID
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT ts.dining_table_id
  FROM public.table_sessions ts
  WHERE ts.pop_id = p_pop_id
    AND ts.status = 'open'
  UNION
  SELECT tst.dining_table_id
  FROM public.table_session_tables tst
  INNER JOIN public.table_sessions ts ON ts.id = tst.table_session_id
  WHERE ts.pop_id = p_pop_id
    AND ts.status = 'open';
$$;

CREATE OR REPLACE FUNCTION public.table_sessions_assert_tables_available (
  p_pop_id UUID,
  p_session_id UUID,
  p_primary_table_id UUID,
  p_extra_table_ids UUID[]
)
RETURNS VOID
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  tid UUID;
  occupied UUID;
BEGIN
  FOR tid IN
    SELECT p_primary_table_id
    UNION
    SELECT unnest(COALESCE(p_extra_table_ids, ARRAY[]::UUID[]))
  LOOP
    IF tid IS NULL THEN
      CONTINUE;
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM public.dining_tables dt
      WHERE dt.id = tid
        AND dt.pop_id = p_pop_id
        AND dt.deleted_at IS NULL
        AND dt.is_active = TRUE
    ) THEN
      RAISE EXCEPTION 'table_sessions: mesa % inválida o inactiva', tid;
    END IF;

    SELECT o INTO occupied
    FROM public.table_session_occupied_table_ids (p_pop_id) o
    WHERE o = tid
      AND NOT EXISTS (
        SELECT 1
        FROM public.table_sessions ts
        WHERE ts.id = p_session_id
          AND ts.status = 'open'
          AND (
            ts.dining_table_id = tid
            OR EXISTS (
              SELECT 1
              FROM public.table_session_tables tst
              WHERE tst.table_session_id = ts.id
                AND tst.dining_table_id = tid
            )
          )
      )
    LIMIT 1;

    IF occupied IS NOT NULL THEN
      RAISE EXCEPTION 'table_sessions: la mesa % ya tiene una sesión abierta', tid;
    END IF;
  END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION public.table_sessions_validate_open_tables ()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  extras UUID[];
BEGIN
  IF NEW.status <> 'open' THEN
    RETURN NEW;
  END IF;

  SELECT COALESCE(array_agg(tst.dining_table_id), ARRAY[]::UUID[])
  INTO extras
  FROM public.table_session_tables tst
  WHERE tst.table_session_id = NEW.id;

  PERFORM public.table_sessions_assert_tables_available (
    NEW.pop_id,
    NEW.id,
    NEW.dining_table_id,
    extras
  );

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.table_session_tables_validate_open ()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  sess public.table_sessions%ROWTYPE;
  extras UUID[];
BEGIN
  SELECT * INTO sess
  FROM public.table_sessions
  WHERE id = NEW.table_session_id;

  IF NOT FOUND OR sess.status <> 'open' THEN
    RETURN NEW;
  END IF;

  SELECT COALESCE(array_agg(tst.dining_table_id), ARRAY[]::UUID[])
  INTO extras
  FROM public.table_session_tables tst
  WHERE tst.table_session_id = NEW.table_session_id;

  PERFORM public.table_sessions_assert_tables_available (
    sess.pop_id,
    sess.id,
    sess.dining_table_id,
    extras
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS table_sessions_validate_open_tables ON public.table_sessions;
CREATE TRIGGER table_sessions_validate_open_tables
  AFTER INSERT OR UPDATE OF status, dining_table_id, pop_id
  ON public.table_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.table_sessions_validate_open_tables ();

DROP TRIGGER IF EXISTS table_session_tables_validate_open ON public.table_session_tables;
CREATE TRIGGER table_session_tables_validate_open
  AFTER INSERT OR UPDATE
  ON public.table_session_tables
  FOR EACH ROW
  EXECUTE FUNCTION public.table_session_tables_validate_open ();

ALTER TABLE public.table_session_tables ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS table_session_tables_select_pop ON public.table_session_tables;
CREATE POLICY table_session_tables_select_pop ON public.table_session_tables
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.table_sessions ts
      WHERE ts.id = table_session_id
        AND public.user_is_member_of_active_pop (ts.pop_id)
    )
  );

DROP POLICY IF EXISTS table_session_tables_insert_pop ON public.table_session_tables;
CREATE POLICY table_session_tables_insert_pop ON public.table_session_tables
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.table_sessions ts
      WHERE ts.id = table_session_id
        AND public.user_is_member_of_active_pop (ts.pop_id)
    )
  );

DROP POLICY IF EXISTS table_session_tables_update_pop ON public.table_session_tables;
CREATE POLICY table_session_tables_update_pop ON public.table_session_tables
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.table_sessions ts
      WHERE ts.id = table_session_id
        AND public.user_is_member_of_active_pop (ts.pop_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.table_sessions ts
      WHERE ts.id = table_session_id
        AND public.user_is_member_of_active_pop (ts.pop_id)
    )
  );

DROP POLICY IF EXISTS table_session_tables_delete_pop ON public.table_session_tables;
CREATE POLICY table_session_tables_delete_pop ON public.table_session_tables
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.table_sessions ts
      WHERE ts.id = table_session_id
        AND public.user_is_member_of_active_pop (ts.pop_id)
    )
  );

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.table_sessions;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.table_session_tables;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END $$;

COMMENT ON TABLE public.table_session_tables IS
  'Mesas adicionales unidas a una sesión (la mesa principal está en table_sessions.dining_table_id).';

COMMENT ON COLUMN public.table_sessions.waiter_user_id IS
  'Mozo asignado a la sesión (rol Mozo en RRHH).';
