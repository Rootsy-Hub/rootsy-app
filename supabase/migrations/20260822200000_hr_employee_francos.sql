-- Un franco = un día libre de esa persona. No liquida sueldo.

CREATE TABLE IF NOT EXISTS public.pop_employee_francos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pop_id UUID NOT NULL REFERENCES public.pops (id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.pop_employees (id) ON DELETE CASCADE,
  day DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS pop_employee_francos_one_day
  ON public.pop_employee_francos (employee_id, day);

CREATE INDEX IF NOT EXISTS idx_pop_employee_francos_pop
  ON public.pop_employee_francos (pop_id, day DESC);

COMMENT ON TABLE public.pop_employee_francos IS
  'Día franco de una persona del local. Un día por fila; no implica pago ni descuento.';

ALTER TABLE public.pop_employee_francos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS pop_employee_francos_select_pop ON public.pop_employee_francos;
CREATE POLICY pop_employee_francos_select_pop ON public.pop_employee_francos
  FOR SELECT TO authenticated
  USING (public.user_is_member_of_active_pop(pop_id));

DROP POLICY IF EXISTS pop_employee_francos_insert_pop ON public.pop_employee_francos;
CREATE POLICY pop_employee_francos_insert_pop ON public.pop_employee_francos
  FOR INSERT TO authenticated
  WITH CHECK (public.user_is_member_of_active_pop(pop_id));

DROP POLICY IF EXISTS pop_employee_francos_delete_pop ON public.pop_employee_francos;
CREATE POLICY pop_employee_francos_delete_pop ON public.pop_employee_francos
  FOR DELETE TO authenticated
  USING (public.user_is_member_of_active_pop(pop_id));
