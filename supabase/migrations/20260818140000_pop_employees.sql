-- Personas del negocio: trabajan acá aunque no entren a Rootsy.
-- Sueldo, datos legales mínimos y entrada/salida del local.

CREATE TABLE IF NOT EXISTS public.pop_employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pop_id UUID NOT NULL REFERENCES public.pops (id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users (id) ON DELETE SET NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL DEFAULT '',
  job_title TEXT,
  document_number TEXT,
  email TEXT,
  phone TEXT,
  monthly_salary NUMERIC(15, 2),
  hired_at DATE,
  left_at DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT pop_employees_name_nonempty
    CHECK (char_length(trim(first_name)) > 0),
  CONSTRAINT pop_employees_salary_nonneg
    CHECK (monthly_salary IS NULL OR monthly_salary >= 0)
);

CREATE INDEX IF NOT EXISTS idx_pop_employees_pop
  ON public.pop_employees (pop_id, left_at, last_name, first_name);

CREATE UNIQUE INDEX IF NOT EXISTS idx_pop_employees_pop_user
  ON public.pop_employees (pop_id, user_id)
  WHERE user_id IS NOT NULL;

DROP TRIGGER IF EXISTS pop_employees_set_updated_at ON public.pop_employees;
CREATE TRIGGER pop_employees_set_updated_at
  BEFORE UPDATE ON public.pop_employees
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at ();

ALTER TABLE public.pop_employees ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS pop_employees_select_pop ON public.pop_employees;
CREATE POLICY pop_employees_select_pop ON public.pop_employees
  FOR SELECT TO authenticated
  USING (public.user_is_member_of_active_pop(pop_id));

DROP POLICY IF EXISTS pop_employees_insert_pop ON public.pop_employees;
CREATE POLICY pop_employees_insert_pop ON public.pop_employees
  FOR INSERT TO authenticated
  WITH CHECK (public.user_is_member_of_active_pop(pop_id));

DROP POLICY IF EXISTS pop_employees_update_pop ON public.pop_employees;
CREATE POLICY pop_employees_update_pop ON public.pop_employees
  FOR UPDATE TO authenticated
  USING (public.user_is_member_of_active_pop(pop_id))
  WITH CHECK (public.user_is_member_of_active_pop(pop_id));

DROP POLICY IF EXISTS pop_employees_delete_pop ON public.pop_employees;
CREATE POLICY pop_employees_delete_pop ON public.pop_employees
  FOR DELETE TO authenticated
  USING (public.user_is_member_of_active_pop(pop_id));

CREATE TABLE IF NOT EXISTS public.pop_employee_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pop_id UUID NOT NULL REFERENCES public.pops (id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.pop_employees (id) ON DELETE CASCADE,
  clocked_in_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  clocked_out_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT pop_employee_attendance_out_after_in
    CHECK (clocked_out_at IS NULL OR clocked_out_at >= clocked_in_at)
);

CREATE INDEX IF NOT EXISTS idx_pop_employee_attendance_pop
  ON public.pop_employee_attendance (pop_id, clocked_in_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS idx_pop_employee_attendance_open
  ON public.pop_employee_attendance (employee_id)
  WHERE clocked_out_at IS NULL;

ALTER TABLE public.pop_employee_attendance ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS pop_employee_attendance_select_pop ON public.pop_employee_attendance;
CREATE POLICY pop_employee_attendance_select_pop ON public.pop_employee_attendance
  FOR SELECT TO authenticated
  USING (public.user_is_member_of_active_pop(pop_id));

DROP POLICY IF EXISTS pop_employee_attendance_insert_pop ON public.pop_employee_attendance;
CREATE POLICY pop_employee_attendance_insert_pop ON public.pop_employee_attendance
  FOR INSERT TO authenticated
  WITH CHECK (public.user_is_member_of_active_pop(pop_id));

DROP POLICY IF EXISTS pop_employee_attendance_update_pop ON public.pop_employee_attendance;
CREATE POLICY pop_employee_attendance_update_pop ON public.pop_employee_attendance
  FOR UPDATE TO authenticated
  USING (public.user_is_member_of_active_pop(pop_id))
  WITH CHECK (public.user_is_member_of_active_pop(pop_id));
