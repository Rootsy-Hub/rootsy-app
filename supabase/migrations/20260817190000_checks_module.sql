-- Cheques: documento con ciclo de vida + medio de pago/cobro `check`.
-- Cuentas de tesorería de sistema apuntan a 1.1.2.02 / 2.1.1.02 (sin subcuenta)
-- para que Estadísticas siga leyendo esos códigos.

-- 1) Tesorería: kinds de cheques
ALTER TABLE public.treasury_accounts
  DROP CONSTRAINT IF EXISTS treasury_accounts_kind_check;

ALTER TABLE public.treasury_accounts
  ADD CONSTRAINT treasury_accounts_kind_check CHECK (
    kind IN (
      'cash',
      'bank',
      'wallet',
      'card_payable',
      'check_receivable',
      'check_payable',
      'other'
    )
  );

-- 2) payment_kind = check
ALTER TABLE public.sale_payments
  DROP CONSTRAINT IF EXISTS sale_payments_kind_check;
ALTER TABLE public.sale_payments
  ADD CONSTRAINT sale_payments_kind_check CHECK (
    payment_kind IS NULL OR payment_kind IN (
      'cash', 'transfer', 'card_debit', 'card_credit', 'check', 'other'
    )
  );

ALTER TABLE public.purchase_payments
  DROP CONSTRAINT IF EXISTS purchase_payments_kind_check;
ALTER TABLE public.purchase_payments
  ADD CONSTRAINT purchase_payments_kind_check CHECK (
    payment_kind IS NULL OR payment_kind IN (
      'cash', 'transfer', 'card_debit', 'card_credit', 'check', 'other'
    )
  );

ALTER TABLE public.expense_payments
  DROP CONSTRAINT IF EXISTS expense_payments_kind_check;
ALTER TABLE public.expense_payments
  ADD CONSTRAINT expense_payments_kind_check CHECK (
    payment_kind IS NULL OR payment_kind IN (
      'cash', 'transfer', 'card_debit', 'card_credit', 'check', 'other'
    )
  );

ALTER TABLE public.service_charge_payments
  DROP CONSTRAINT IF EXISTS service_charge_payments_kind_check;
ALTER TABLE public.service_charge_payments
  ADD CONSTRAINT service_charge_payments_kind_check CHECK (
    payment_kind IS NULL OR payment_kind IN (
      'cash', 'transfer', 'card_debit', 'card_credit', 'check', 'other'
    )
  );

-- 3) Documento cheque
CREATE TABLE IF NOT EXISTS public.checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pop_id UUID NOT NULL REFERENCES public.pops (id) ON DELETE CASCADE,
  direction TEXT NOT NULL,
  check_number TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  amount NUMERIC(15, 2) NOT NULL,
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'in_portfolio',
  client_id UUID REFERENCES public.clients (id) ON DELETE SET NULL,
  supplier_id UUID REFERENCES public.suppliers (id) ON DELETE SET NULL,
  drawer_name TEXT,
  payee_name TEXT,
  source_kind TEXT NOT NULL DEFAULT 'manual',
  source_id UUID,
  deposit_treasury_account_id UUID
    REFERENCES public.treasury_accounts (id) ON DELETE SET NULL,
  deposited_at DATE,
  cleared_at DATE,
  rejected_at DATE,
  rejection_reason TEXT,
  received_accounting_entry_id UUID
    REFERENCES public.accounting_entries (id) ON DELETE SET NULL,
  settlement_accounting_entry_id UUID
    REFERENCES public.accounting_entries (id) ON DELETE SET NULL,
  notes TEXT,
  created_by UUID NOT NULL REFERENCES auth.users (id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT checks_direction_check
    CHECK (direction IN ('received', 'issued')),
  CONSTRAINT checks_status_check
    CHECK (status IN (
      'in_portfolio', 'deposited', 'cleared', 'rejected', 'voided'
    )),
  CONSTRAINT checks_source_kind_check
    CHECK (source_kind IN (
      'sale', 'purchase', 'expense', 'service_charge', 'manual'
    )),
  CONSTRAINT checks_number_nonempty
    CHECK (char_length(trim(check_number)) > 0),
  CONSTRAINT checks_bank_nonempty
    CHECK (char_length(trim(bank_name)) > 0),
  CONSTRAINT checks_amount_positive
    CHECK (amount > 0)
);

CREATE INDEX IF NOT EXISTS idx_checks_pop_due
  ON public.checks (pop_id, due_date DESC);

CREATE INDEX IF NOT EXISTS idx_checks_pop_status
  ON public.checks (pop_id, status, due_date DESC);

CREATE INDEX IF NOT EXISTS idx_checks_pop_direction
  ON public.checks (pop_id, direction, status);

CREATE INDEX IF NOT EXISTS idx_checks_pop_number
  ON public.checks (pop_id, check_number);

CREATE INDEX IF NOT EXISTS idx_checks_client
  ON public.checks (client_id)
  WHERE client_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_checks_supplier
  ON public.checks (supplier_id)
  WHERE supplier_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_checks_source
  ON public.checks (pop_id, source_kind, source_id)
  WHERE source_id IS NOT NULL;

DROP TRIGGER IF EXISTS checks_set_updated_at ON public.checks;
CREATE TRIGGER checks_set_updated_at
  BEFORE UPDATE ON public.checks
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at ();

ALTER TABLE public.checks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS checks_select_pop ON public.checks;
CREATE POLICY checks_select_pop ON public.checks
  FOR SELECT TO authenticated
  USING (public.user_is_member_of_active_pop(pop_id));

DROP POLICY IF EXISTS checks_insert_pop ON public.checks;
CREATE POLICY checks_insert_pop ON public.checks
  FOR INSERT TO authenticated
  WITH CHECK (public.user_is_member_of_active_pop(pop_id));

DROP POLICY IF EXISTS checks_update_pop ON public.checks;
CREATE POLICY checks_update_pop ON public.checks
  FOR UPDATE TO authenticated
  USING (public.user_is_member_of_active_pop(pop_id))
  WITH CHECK (public.user_is_member_of_active_pop(pop_id));

DROP POLICY IF EXISTS checks_delete_pop ON public.checks;
CREATE POLICY checks_delete_pop ON public.checks
  FOR DELETE TO authenticated
  USING (public.user_is_member_of_active_pop(pop_id));

COMMENT ON TABLE public.checks IS
  'Cheques recibidos (cobro) o emitidos (pago). El detalle vive acá; las filas *_payments solo apuntan al documento.';

COMMENT ON COLUMN public.checks.direction IS
  'received = cheque de tercero en cartera; issued = cheque propio a pagar.';

COMMENT ON COLUMN public.checks.due_date IS
  'Fecha de cobro / vencimiento (cheques diferidos).';

COMMENT ON COLUMN public.checks.source_kind IS
  'Origen operativo: sale, purchase, expense, service_charge o alta manual.';

COMMENT ON COLUMN public.checks.deposit_treasury_account_id IS
  'Banco donde se deposita (recibido) o se debita (emitido).';

-- 4) Pagos apuntan al cheque
ALTER TABLE public.sale_payments
  ADD COLUMN IF NOT EXISTS check_id UUID
    REFERENCES public.checks (id) ON DELETE RESTRICT;

ALTER TABLE public.purchase_payments
  ADD COLUMN IF NOT EXISTS check_id UUID
    REFERENCES public.checks (id) ON DELETE RESTRICT;

ALTER TABLE public.expense_payments
  ADD COLUMN IF NOT EXISTS check_id UUID
    REFERENCES public.checks (id) ON DELETE RESTRICT;

ALTER TABLE public.service_charge_payments
  ADD COLUMN IF NOT EXISTS check_id UUID
    REFERENCES public.checks (id) ON DELETE RESTRICT;

CREATE INDEX IF NOT EXISTS idx_sale_payments_check
  ON public.sale_payments (check_id)
  WHERE check_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_purchase_payments_check
  ON public.purchase_payments (check_id)
  WHERE check_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_expense_payments_check
  ON public.expense_payments (check_id)
  WHERE check_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_service_charge_payments_check
  ON public.service_charge_payments (check_id)
  WHERE check_id IS NOT NULL;

-- 5) Seed tesorería: cartera + a pagar
CREATE OR REPLACE FUNCTION public.seed_pop_treasury_defaults (p_pop_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caja_chart UUID;
  v_banco_chart UUID;
  v_tarjetas_chart UUID;
  v_cheques_cobrar_chart UUID;
  v_cheques_pagar_chart UUID;
  v_caja_ta UUID;
  v_banco_ta UUID;
  v_tarjetas_ta UUID;
  v_old_ta RECORD;
BEGIN
  UPDATE public.accounting_chart_of_accounts
  SET is_movement_account = FALSE
  WHERE pop_id = p_pop_id
    AND code IN ('1.1.1.01', '1.1.1.02', '1.1.1.03', '1.1.1.04', '2.1.1.03');

  v_caja_chart := public.ensure_treasury_chart_subaccount(
    p_pop_id, '1.1.1.01', '1.1.1.01.01', 'Caja',
    'activo_corriente', 'deudora', 'cash'
  );
  v_banco_chart := public.ensure_treasury_chart_subaccount(
    p_pop_id, '1.1.1.02', '1.1.1.02.01', 'Banco',
    'activo_corriente', 'deudora', 'bank'
  );
  v_tarjetas_chart := public.ensure_treasury_chart_subaccount(
    p_pop_id, '1.1.1.03', '1.1.1.03.01', 'Tarjetas POS',
    'activo_corriente', 'deudora', 'other'
  );

  SELECT id
  INTO v_cheques_cobrar_chart
  FROM public.accounting_chart_of_accounts
  WHERE pop_id = p_pop_id
    AND code = '1.1.2.02'
  LIMIT 1;

  SELECT id
  INTO v_cheques_pagar_chart
  FROM public.accounting_chart_of_accounts
  WHERE pop_id = p_pop_id
    AND code = '2.1.1.02'
  LIMIT 1;

  FOR v_old_ta IN
    SELECT ta.id, ta.kind, ac.code AS chart_code
    FROM public.treasury_accounts ta
    JOIN public.accounting_chart_of_accounts ac
      ON ac.id = ta.accounting_chart_account_id
    WHERE ta.pop_id = p_pop_id
      AND ta.is_system_default = TRUE
      AND ac.code IN ('1.1.1.01', '1.1.1.02', '2.1.1.03')
  LOOP
    IF v_old_ta.kind = 'cash' AND v_old_ta.chart_code = '1.1.1.01' AND v_caja_chart IS NOT NULL THEN
      UPDATE public.treasury_accounts
      SET name = 'Caja', kind = 'cash', accounting_chart_account_id = v_caja_chart
      WHERE id = v_old_ta.id;
    ELSIF v_old_ta.kind = 'bank' AND v_old_ta.chart_code = '1.1.1.02' AND v_banco_chart IS NOT NULL THEN
      UPDATE public.treasury_accounts
      SET name = 'Banco', kind = 'bank', accounting_chart_account_id = v_banco_chart
      WHERE id = v_old_ta.id;
    ELSIF v_old_ta.kind = 'card_payable' AND v_old_ta.chart_code = '2.1.1.03' THEN
      IF NOT EXISTS (
        SELECT 1 FROM public.treasury_settlements ts
        WHERE ts.card_treasury_account_id = v_old_ta.id
      ) THEN
        DELETE FROM public.treasury_accounts WHERE id = v_old_ta.id;
      END IF;
    END IF;
  END LOOP;

  v_caja_ta := public.ensure_treasury_account(p_pop_id, 'Caja', 'cash', v_caja_chart, 10);
  v_banco_ta := public.ensure_treasury_account(p_pop_id, 'Banco', 'bank', v_banco_chart, 20);
  v_tarjetas_ta := public.ensure_treasury_account(
    p_pop_id, 'Tarjetas POS', 'other', v_tarjetas_chart, 30
  );
  PERFORM public.ensure_treasury_account(
    p_pop_id, 'Cheques en cartera', 'check_receivable', v_cheques_cobrar_chart, 40
  );
  PERFORM public.ensure_treasury_account(
    p_pop_id, 'Cheques a pagar', 'check_payable', v_cheques_pagar_chart, 50
  );

  UPDATE public.treasury_accounts
  SET parent_treasury_account_id = v_banco_ta
  WHERE id = v_tarjetas_ta
    AND v_banco_ta IS NOT NULL;
END;
$$;

COMMENT ON FUNCTION public.seed_pop_treasury_defaults IS
  'Crea subcuentas contables y cuentas de tesorería por defecto (caja, banco, POS, cheques).';

DO $$
DECLARE
  pid UUID;
BEGIN
  FOR pid IN SELECT id FROM public.pops
  LOOP
    PERFORM public.seed_pop_treasury_defaults(pid);
  END LOOP;
END $$;

-- 6) Permisos owner / administrator
DO $$
DECLARE
  r RECORD;
  grants JSONB;
  new_perms JSONB := '["checks:read","checks:create","checks:update","checks:delete"]'::jsonb;
  p TEXT;
BEGIN
  FOR r IN
    SELECT id, permission_grants
    FROM public.roles
    WHERE lower(name) IN ('administrator', 'owner', 'administrador', 'dueño', 'dueno')
  LOOP
    grants := COALESCE(r.permission_grants, '[]'::jsonb);
    FOR p IN SELECT jsonb_array_elements_text(new_perms)
    LOOP
      IF NOT grants @> to_jsonb(p) THEN
        grants := grants || to_jsonb(p);
      END IF;
    END LOOP;
    UPDATE public.roles SET permission_grants = grants WHERE id = r.id;
  END LOOP;
END $$;
