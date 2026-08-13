-- Reservas sin mesa asignada (se asigna al sentar / abrir).

ALTER TABLE public.table_reservations
  ALTER COLUMN dining_table_id DROP NOT NULL;

DROP INDEX IF EXISTS table_reservations_table_arrival_idx;

CREATE UNIQUE INDEX table_reservations_table_arrival_idx
  ON public.table_reservations (dining_table_id, arrival_at)
  WHERE dining_table_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.table_reservations_same_pop_as_table ()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  p UUID;
BEGIN
  IF NEW.dining_table_id IS NULL THEN
    RETURN NEW;
  END IF;

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

CREATE OR REPLACE FUNCTION public.table_reservations_validate_table ()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.dining_table_id IS NULL THEN
    RETURN NEW;
  END IF;

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

COMMENT ON COLUMN public.table_reservations.dining_table_id IS
  'Mesa asignada; NULL si la reserva entra sin mesa y se asigna al sentar.';
