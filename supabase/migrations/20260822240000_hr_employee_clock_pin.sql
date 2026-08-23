-- PIN de 4 dígitos para fichar en el local. Único entre personas activas del POP.

ALTER TABLE public.pop_employees
  ADD COLUMN IF NOT EXISTS clock_pin TEXT;

ALTER TABLE public.pop_employees
  DROP CONSTRAINT IF EXISTS pop_employees_clock_pin_format;

ALTER TABLE public.pop_employees
  ADD CONSTRAINT pop_employees_clock_pin_format
  CHECK (clock_pin IS NULL OR clock_pin ~ '^[0-9]{4}$');

COMMENT ON COLUMN public.pop_employees.clock_pin IS
  'PIN de fichaje (4 dígitos). Lo usa la persona en la pantalla Fichar; no es acceso a Rootsy.';

CREATE UNIQUE INDEX IF NOT EXISTS idx_pop_employees_active_clock_pin
  ON public.pop_employees (pop_id, clock_pin)
  WHERE left_at IS NULL AND clock_pin IS NOT NULL;

DO $$
DECLARE
  rec RECORD;
  candidate TEXT;
BEGIN
  FOR rec IN
    SELECT id, pop_id
    FROM public.pop_employees
    WHERE clock_pin IS NULL
  LOOP
    LOOP
      candidate := lpad((floor(random() * 9000) + 1000)::int::text, 4, '0');
      EXIT WHEN NOT EXISTS (
        SELECT 1
        FROM public.pop_employees
        WHERE pop_id = rec.pop_id
          AND left_at IS NULL
          AND clock_pin = candidate
          AND id <> rec.id
      );
    END LOOP;
    UPDATE public.pop_employees
    SET clock_pin = candidate
    WHERE id = rec.id;
  END LOOP;
END $$;
