-- PIN de la tablet de fichaje. Distinto del PIN de cada persona.
-- Sirve para salir de la estación, no para marcar llegada.

ALTER TABLE public.pops
  ADD COLUMN IF NOT EXISTS clock_station_pin TEXT;

ALTER TABLE public.pops
  DROP CONSTRAINT IF EXISTS pops_clock_station_pin_format;

ALTER TABLE public.pops
  ADD CONSTRAINT pops_clock_station_pin_format
  CHECK (clock_station_pin IS NULL OR clock_station_pin ~ '^[0-9]{4}$');

COMMENT ON COLUMN public.pops.clock_station_pin IS
  'PIN de estación de fichaje. Lo usa el encargado para destrabar la tablet.';

DO $$
DECLARE
  rec RECORD;
  candidate TEXT;
BEGIN
  FOR rec IN
    SELECT id FROM public.pops WHERE clock_station_pin IS NULL
  LOOP
    candidate := lpad((floor(random() * 9000) + 1000)::int::text, 4, '0');
    UPDATE public.pops
    SET clock_station_pin = candidate
    WHERE id = rec.id;
  END LOOP;
END $$;
