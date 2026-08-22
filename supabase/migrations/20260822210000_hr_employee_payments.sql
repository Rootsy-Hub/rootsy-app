-- Pagos a una persona del local. Sale de tesorería; no es liquidación AFIP.

CREATE TABLE IF NOT EXISTS public.pop_employee_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pop_id UUID NOT NULL REFERENCES public.pops (id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.pop_employees (id) ON DELETE CASCADE,
  amount NUMERIC(15, 2) NOT NULL,
  paid_at DATE NOT NULL,
  payment_kind TEXT NOT NULL,
  treasury_account_id UUID NOT NULL REFERENCES public.treasury_accounts (id) ON DELETE RESTRICT,
  notes TEXT,
  accounting_entry_id UUID REFERENCES public.accounting_entries (id) ON DELETE SET NULL,
  created_by UUID REFERENCES public.users (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT pop_employee_payments_amount_pos CHECK (amount > 0)
);

CREATE INDEX IF NOT EXISTS idx_pop_employee_payments_employee
  ON public.pop_employee_payments (pop_id, employee_id, paid_at DESC);

CREATE INDEX IF NOT EXISTS idx_pop_employee_payments_treasury
  ON public.pop_employee_payments (pop_id, treasury_account_id, paid_at DESC);

COMMENT ON TABLE public.pop_employee_payments IS
  'Pago a una persona del local (le pagué). Genera asiento y sale de tesorería.';

ALTER TABLE public.pop_employee_payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS pop_employee_payments_select_pop ON public.pop_employee_payments;
CREATE POLICY pop_employee_payments_select_pop ON public.pop_employee_payments
  FOR SELECT TO authenticated
  USING (public.user_is_member_of_active_pop(pop_id));

DROP POLICY IF EXISTS pop_employee_payments_insert_pop ON public.pop_employee_payments;
CREATE POLICY pop_employee_payments_insert_pop ON public.pop_employee_payments
  FOR INSERT TO authenticated
  WITH CHECK (public.user_is_member_of_active_pop(pop_id));

DROP POLICY IF EXISTS pop_employee_payments_update_pop ON public.pop_employee_payments;
CREATE POLICY pop_employee_payments_update_pop ON public.pop_employee_payments
  FOR UPDATE TO authenticated
  USING (public.user_is_member_of_active_pop(pop_id))
  WITH CHECK (public.user_is_member_of_active_pop(pop_id));
