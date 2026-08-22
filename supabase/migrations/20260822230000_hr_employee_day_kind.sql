-- Un día de la persona: franco (previsto) o falta (tenía que venir).
-- Sigue siendo una sola marca por día.

ALTER TABLE public.pop_employee_francos
  ADD COLUMN IF NOT EXISTS kind TEXT NOT NULL DEFAULT 'franco';

ALTER TABLE public.pop_employee_francos
  DROP CONSTRAINT IF EXISTS pop_employee_francos_kind_check;

ALTER TABLE public.pop_employee_francos
  ADD CONSTRAINT pop_employee_francos_kind_check
  CHECK (kind IN ('franco', 'falta'));

COMMENT ON COLUMN public.pop_employee_francos.kind IS
  'franco = día libre previsto. falta = tenía que venir y no vino.';
