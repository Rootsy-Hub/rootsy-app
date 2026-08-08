-- Fase C: eliminar payment_methods; pagos apuntan a tesorería + tipo hardcodeado.
-- Trunca operaciones de dev (sin retrocompatibilidad).

TRUNCATE TABLE public.treasury_reconciliation_marks RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.bank_statement_lines RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.treasury_settlements RESTART IDENTITY CASCADE;

TRUNCATE TABLE public.sale_payments RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.purchase_payments RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.expense_payments RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.service_payments RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.rental_payments RESTART IDENTITY CASCADE;

TRUNCATE TABLE public.sales RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.purchases RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.expenses RESTART IDENTITY CASCADE;

-- Quitar triggers / validaciones legacy (referencias a payment_method_id)
DROP TRIGGER IF EXISTS sale_payments_same_pop_as_sale ON public.sale_payments;
DROP TRIGGER IF EXISTS sale_payments_sum_matches_sale_total ON public.sale_payments;
DROP TRIGGER IF EXISTS purchase_payments_same_pop_method ON public.purchase_payments;
DROP TRIGGER IF EXISTS purchase_payments_same_pop_as_purchase ON public.purchase_payments;
DROP TRIGGER IF EXISTS expense_payments_same_pop_as_expense ON public.expense_payments;
DROP TRIGGER IF EXISTS service_payments_same_pop_method ON public.service_payments;
DROP TRIGGER IF EXISTS service_payments_same_pop_as_order ON public.service_payments;
DROP TRIGGER IF EXISTS rental_payments_same_pop_method ON public.rental_payments;
DROP TRIGGER IF EXISTS rental_payments_same_pop_as_rental ON public.rental_payments;
DROP TRIGGER IF EXISTS bank_statement_lines_same_pop_method ON public.bank_statement_lines;
DROP TRIGGER IF EXISTS treasury_settlements_same_pop_methods ON public.treasury_settlements;

DROP FUNCTION IF EXISTS public.sale_payments_same_pop_as_sale () CASCADE;
DROP FUNCTION IF EXISTS public.sale_payments_sum_matches_sale_total () CASCADE;
DROP FUNCTION IF EXISTS public.purchase_payments_same_pop_method () CASCADE;
DROP FUNCTION IF EXISTS public.purchase_payments_same_pop_as_purchase () CASCADE;
DROP FUNCTION IF EXISTS public.expense_payments_same_pop_as_expense () CASCADE;
DROP FUNCTION IF EXISTS public.service_payments_same_pop_method () CASCADE;
DROP FUNCTION IF EXISTS public.service_payments_same_pop_as_order () CASCADE;
DROP FUNCTION IF EXISTS public.rental_payments_same_pop_method () CASCADE;
DROP FUNCTION IF EXISTS public.rental_payments_same_pop_as_rental () CASCADE;
DROP FUNCTION IF EXISTS public.bank_statement_lines_same_pop_method () CASCADE;
DROP FUNCTION IF EXISTS public.treasury_settlements_same_pop_methods () CASCADE;

-- Nuevo modelo en tablas de pago
ALTER TABLE public.sale_payments
  ADD COLUMN IF NOT EXISTS payment_kind TEXT,
  ADD COLUMN IF NOT EXISTS treasury_account_id UUID
    REFERENCES public.treasury_accounts (id) ON DELETE SET NULL;

ALTER TABLE public.purchase_payments
  ADD COLUMN IF NOT EXISTS payment_kind TEXT,
  ADD COLUMN IF NOT EXISTS treasury_account_id UUID
    REFERENCES public.treasury_accounts (id) ON DELETE SET NULL;

ALTER TABLE public.expense_payments
  ADD COLUMN IF NOT EXISTS payment_kind TEXT,
  ADD COLUMN IF NOT EXISTS treasury_account_id UUID
    REFERENCES public.treasury_accounts (id) ON DELETE SET NULL;

ALTER TABLE public.service_payments
  ADD COLUMN IF NOT EXISTS payment_kind TEXT,
  ADD COLUMN IF NOT EXISTS treasury_account_id UUID
    REFERENCES public.treasury_accounts (id) ON DELETE SET NULL;

ALTER TABLE public.rental_payments
  ADD COLUMN IF NOT EXISTS payment_kind TEXT,
  ADD COLUMN IF NOT EXISTS treasury_account_id UUID
    REFERENCES public.treasury_accounts (id) ON DELETE SET NULL;

ALTER TABLE public.sale_payments DROP CONSTRAINT IF EXISTS sale_payments_payment_method_id_fkey;
ALTER TABLE public.purchase_payments DROP CONSTRAINT IF EXISTS purchase_payments_payment_method_id_fkey;
ALTER TABLE public.expense_payments DROP CONSTRAINT IF EXISTS expense_payments_payment_method_id_fkey;
ALTER TABLE public.service_payments DROP CONSTRAINT IF EXISTS service_payments_payment_method_id_fkey;
ALTER TABLE public.rental_payments DROP CONSTRAINT IF EXISTS rental_payments_payment_method_id_fkey;

ALTER TABLE public.sale_payments DROP COLUMN IF EXISTS payment_method_id;
ALTER TABLE public.purchase_payments DROP COLUMN IF EXISTS payment_method_id;
ALTER TABLE public.expense_payments DROP COLUMN IF EXISTS payment_method_id;
ALTER TABLE public.service_payments DROP COLUMN IF EXISTS payment_method_id;
ALTER TABLE public.rental_payments DROP COLUMN IF EXISTS payment_method_id;

ALTER TABLE public.sale_payments
  DROP CONSTRAINT IF EXISTS sale_payments_kind_check;
ALTER TABLE public.sale_payments
  ADD CONSTRAINT sale_payments_kind_check CHECK (
    payment_kind IS NULL OR payment_kind IN (
      'cash', 'transfer', 'card_debit', 'card_credit', 'other'
    )
  );

ALTER TABLE public.purchase_payments
  DROP CONSTRAINT IF EXISTS purchase_payments_kind_check;
ALTER TABLE public.purchase_payments
  ADD CONSTRAINT purchase_payments_kind_check CHECK (
    payment_kind IS NULL OR payment_kind IN (
      'cash', 'transfer', 'card_debit', 'card_credit', 'other'
    )
  );

ALTER TABLE public.expense_payments
  DROP CONSTRAINT IF EXISTS expense_payments_kind_check;
ALTER TABLE public.expense_payments
  ADD CONSTRAINT expense_payments_kind_check CHECK (
    payment_kind IS NULL OR payment_kind IN (
      'cash', 'transfer', 'card_debit', 'card_credit', 'other'
    )
  );

CREATE INDEX IF NOT EXISTS idx_sale_payments_treasury
  ON public.sale_payments (pop_id, treasury_account_id);
CREATE INDEX IF NOT EXISTS idx_purchase_payments_treasury
  ON public.purchase_payments (pop_id, treasury_account_id);
CREATE INDEX IF NOT EXISTS idx_expense_payments_treasury
  ON public.expense_payments (pop_id, treasury_account_id);

-- Conciliación y liquidaciones solo por tesorería
ALTER TABLE public.bank_statement_lines
  DROP CONSTRAINT IF EXISTS bank_statement_lines_payment_method_id_fkey;
ALTER TABLE public.bank_statement_lines DROP COLUMN IF EXISTS payment_method_id;

ALTER TABLE public.treasury_reconciliation_marks
  DROP CONSTRAINT IF EXISTS treasury_reconciliation_marks_payment_method_id_fkey;
ALTER TABLE public.treasury_reconciliation_marks DROP COLUMN IF EXISTS payment_method_id;

ALTER TABLE public.treasury_settlements
  DROP CONSTRAINT IF EXISTS treasury_settlements_card_payment_method_id_fkey;
ALTER TABLE public.treasury_settlements
  DROP CONSTRAINT IF EXISTS treasury_settlements_funding_payment_method_id_fkey;
ALTER TABLE public.treasury_settlements DROP COLUMN IF EXISTS card_payment_method_id;
ALTER TABLE public.treasury_settlements DROP COLUMN IF EXISTS funding_payment_method_id;

-- Eliminar tabla legacy
DROP TABLE IF EXISTS public.payment_methods CASCADE;

DROP FUNCTION IF EXISTS public.ensure_default_payment_method (UUID, TEXT, TEXT, TEXT, INT, UUID);

-- Seed sin formas de pago
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

  UPDATE public.treasury_accounts
  SET parent_treasury_account_id = v_banco_ta
  WHERE id = v_tarjetas_ta
    AND v_banco_ta IS NOT NULL;
END;
$$;
