-- Cuentas hijas (POS, tarjetas) cuelgan de una cuenta madre (banco / billetera).

ALTER TABLE public.treasury_accounts
  ADD COLUMN IF NOT EXISTS parent_treasury_account_id UUID
  REFERENCES public.treasury_accounts (id) ON DELETE RESTRICT;

CREATE INDEX IF NOT EXISTS idx_treasury_accounts_parent
  ON public.treasury_accounts (parent_treasury_account_id)
  WHERE parent_treasury_account_id IS NOT NULL;

COMMENT ON COLUMN public.treasury_accounts.parent_treasury_account_id IS
  'Cuenta madre operativa (caja/banco/billetera) a la que pertenece un terminal POS o tarjeta corporativa.';

-- Validar mismo POP entre madre e hija.
CREATE OR REPLACE FUNCTION public.treasury_accounts_validate_parent_pop ()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_parent_pop UUID;
BEGIN
  IF NEW.parent_treasury_account_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT pop_id INTO v_parent_pop
  FROM public.treasury_accounts
  WHERE id = NEW.parent_treasury_account_id;

  IF v_parent_pop IS NULL THEN
    RAISE EXCEPTION 'treasury_accounts: cuenta madre inexistente';
  END IF;

  IF v_parent_pop IS DISTINCT FROM NEW.pop_id THEN
    RAISE EXCEPTION 'treasury_accounts: madre e hija deben pertenecer al mismo POP';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS treasury_accounts_validate_parent_pop ON public.treasury_accounts;
CREATE TRIGGER treasury_accounts_validate_parent_pop
  BEFORE INSERT OR UPDATE OF parent_treasury_account_id, pop_id
  ON public.treasury_accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.treasury_accounts_validate_parent_pop ();

-- Backfill: hijos huérfanos → banco o billetera principal del POP.
UPDATE public.treasury_accounts AS child
SET parent_treasury_account_id = (
  SELECT b2.id
  FROM public.treasury_accounts b2
  JOIN public.accounting_chart_of_accounts ac2
    ON ac2.id = b2.accounting_chart_account_id
  WHERE b2.pop_id = child.pop_id
    AND b2.id <> child.id
    AND b2.kind IN ('bank', 'wallet')
    AND ac2.code ~ '^1\.1\.1\.0[24]\.'
  ORDER BY
    CASE WHEN b2.kind = 'bank' THEN 0 ELSE 1 END,
    b2.is_system_default DESC,
    b2.sort_order,
    b2.name
  LIMIT 1
)
FROM public.accounting_chart_of_accounts AS ac_child
WHERE ac_child.id = child.accounting_chart_account_id
  AND child.parent_treasury_account_id IS NULL
  AND (
    ac_child.code LIKE '1.1.1.03.%'
    OR (ac_child.code LIKE '2.1.1.03.%' AND child.kind = 'card_payable')
  );

-- Seed: Tarjetas POS default cuelga del banco default.
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
        SELECT 1 FROM public.payment_methods pm WHERE pm.treasury_account_id = v_old_ta.id
      ) AND NOT EXISTS (
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

  UPDATE public.payment_methods pm
  SET accounting_account_id = ta.accounting_chart_account_id
  FROM public.treasury_accounts ta
  WHERE pm.treasury_account_id = ta.id
    AND pm.pop_id = p_pop_id
    AND pm.accounting_account_id IS DISTINCT FROM ta.accounting_chart_account_id;

  PERFORM public.ensure_default_payment_method(
    p_pop_id, 'Efectivo', 'cash', 'receive', 10, v_caja_ta
  );
  PERFORM public.ensure_default_payment_method(
    p_pop_id, 'Tarjeta débito', 'card_debit', 'receive', 20, v_tarjetas_ta
  );
  PERFORM public.ensure_default_payment_method(
    p_pop_id, 'Tarjeta crédito', 'card_credit', 'receive', 30, v_tarjetas_ta
  );
  PERFORM public.ensure_default_payment_method(
    p_pop_id, 'Transferencia', 'transfer', 'receive', 40, v_banco_ta
  );

  PERFORM public.ensure_default_payment_method(
    p_pop_id, 'Efectivo', 'cash', 'pay', 10, v_caja_ta
  );
  PERFORM public.ensure_default_payment_method(
    p_pop_id, 'Transferencia', 'transfer', 'pay', 20, v_banco_ta
  );
END;
$$;
