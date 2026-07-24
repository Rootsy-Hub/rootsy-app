-- Tesorería y formas de pago por defecto al crear un POP.
-- Rubros contables (1.1.1.01, etc.) agrupan; las cuentas operativas son subcuentas (.01).

ALTER TABLE public.payment_methods
  ADD COLUMN IF NOT EXISTS is_system_default BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN public.payment_methods.is_system_default IS
  'Medio/forma de pago creado con el POP; no se elimina, solo se edita.';

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.treasury_next_chart_child_code (
  p_pop_id UUID,
  p_parent_code TEXT
)
RETURNS TEXT
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
DECLARE
  v_max INT := 0;
  v_tail TEXT;
  v_n INT;
  r RECORD;
BEGIN
  FOR r IN
    SELECT code
    FROM public.accounting_chart_of_accounts
    WHERE pop_id = p_pop_id
      AND code LIKE p_parent_code || '.%'
  LOOP
    v_tail := substring(r.code FROM length(p_parent_code) + 2);
    v_n := NULLIF(split_part(v_tail, '.', 1), '')::INT;
    IF v_n IS NOT NULL AND v_n > v_max THEN
      v_max := v_n;
    END IF;
  END LOOP;
  RETURN p_parent_code || '.' || lpad((v_max + 1)::TEXT, 2, '0');
END;
$$;

CREATE OR REPLACE FUNCTION public.ensure_treasury_chart_subaccount (
  p_pop_id UUID,
  p_parent_code TEXT,
  p_preferred_code TEXT,
  p_name TEXT,
  p_account_type TEXT,
  p_nature TEXT,
  p_treasury_kind TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_parent_id UUID;
  v_parent_level INT;
  v_chart_id UUID;
  v_code TEXT;
BEGIN
  SELECT id, level
  INTO v_parent_id, v_parent_level
  FROM public.accounting_chart_of_accounts
  WHERE pop_id = p_pop_id
    AND code = p_parent_code
  LIMIT 1;

  IF v_parent_id IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT id
  INTO v_chart_id
  FROM public.accounting_chart_of_accounts
  WHERE pop_id = p_pop_id
    AND code = p_preferred_code
  LIMIT 1;

  IF v_chart_id IS NOT NULL THEN
    UPDATE public.accounting_chart_of_accounts
    SET name = p_name
    WHERE id = v_chart_id;
    RETURN v_chart_id;
  END IF;

  v_code := public.treasury_next_chart_child_code(p_pop_id, p_parent_code);

  INSERT INTO public.accounting_chart_of_accounts (
    pop_id,
    parent_id,
    code,
    name,
    account_type,
    nature,
    level,
    is_movement_account,
    metadata
  )
  VALUES (
    p_pop_id,
    v_parent_id,
    v_code,
    p_name,
    p_account_type,
    p_nature,
    GREATEST(1, COALESCE(v_parent_level, 4) + 1),
    TRUE,
    CASE
      WHEN p_treasury_kind IS NOT NULL THEN
        jsonb_build_object('user_created', TRUE, 'treasury_kind', p_treasury_kind, 'system_default', TRUE)
      ELSE
        jsonb_build_object('user_created', TRUE, 'system_default', TRUE)
    END
  )
  RETURNING id INTO v_chart_id;

  RETURN v_chart_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.ensure_treasury_account (
  p_pop_id UUID,
  p_name TEXT,
  p_kind TEXT,
  p_chart_id UUID,
  p_sort_order INT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_ta_id UUID;
BEGIN
  IF p_chart_id IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT id
  INTO v_ta_id
  FROM public.treasury_accounts
  WHERE pop_id = p_pop_id
    AND accounting_chart_account_id = p_chart_id
  LIMIT 1;

  IF v_ta_id IS NOT NULL THEN
    UPDATE public.treasury_accounts
    SET
      name = p_name,
      kind = p_kind,
      is_system_default = TRUE,
      is_active = TRUE,
      sort_order = p_sort_order
    WHERE id = v_ta_id;
    RETURN v_ta_id;
  END IF;

  INSERT INTO public.treasury_accounts (
    pop_id,
    name,
    kind,
    accounting_chart_account_id,
    is_system_default,
    is_active,
    sort_order
  )
  VALUES (
    p_pop_id,
    p_name,
    p_kind,
    p_chart_id,
    TRUE,
    TRUE,
    p_sort_order
  )
  RETURNING id INTO v_ta_id;

  RETURN v_ta_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.ensure_default_payment_method (
  p_pop_id UUID,
  p_name TEXT,
  p_kind TEXT,
  p_usage TEXT,
  p_sort_order INT,
  p_treasury_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_chart_id UUID;
BEGIN
  IF p_treasury_id IS NULL THEN
    RETURN;
  END IF;

  SELECT accounting_chart_account_id
  INTO v_chart_id
  FROM public.treasury_accounts
  WHERE id = p_treasury_id;

  IF v_chart_id IS NULL THEN
    RETURN;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.payment_methods pm
    WHERE pm.pop_id = p_pop_id
      AND pm.is_system_default = TRUE
      AND pm.usage = p_usage
      AND pm.kind = p_kind
  ) THEN
    UPDATE public.payment_methods pm
    SET
      name = p_name,
      sort_order = p_sort_order,
      treasury_account_id = p_treasury_id,
      accounting_account_id = v_chart_id,
      is_active = TRUE
    WHERE pm.pop_id = p_pop_id
      AND pm.is_system_default = TRUE
      AND pm.usage = p_usage
      AND pm.kind = p_kind;
    RETURN;
  END IF;

  INSERT INTO public.payment_methods (
    pop_id,
    name,
    kind,
    usage,
    is_active,
    sort_order,
    accounting_account_id,
    treasury_account_id,
    is_system_default
  )
  VALUES (
    p_pop_id,
    p_name,
    p_kind,
    p_usage,
    TRUE,
    p_sort_order,
    v_chart_id,
    p_treasury_id,
    TRUE
  );
END;
$$;

-- ---------------------------------------------------------------------------
-- Seed principal
-- ---------------------------------------------------------------------------

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
  -- Rubros: solo agrupan, no reciben movimientos directos.
  UPDATE public.accounting_chart_of_accounts
  SET is_movement_account = FALSE
  WHERE pop_id = p_pop_id
    AND code IN ('1.1.1.01', '1.1.1.02', '1.1.1.03', '1.1.1.04', '2.1.1.03');

  -- Subcuentas operativas por defecto.
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

  -- Reapuntar tesorería default que aún usa el rubro padre.
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

  -- Sincronizar accounting_account_id en PM vinculados a tesorería default migrada.
  UPDATE public.payment_methods pm
  SET accounting_account_id = ta.accounting_chart_account_id
  FROM public.treasury_accounts ta
  WHERE pm.treasury_account_id = ta.id
    AND pm.pop_id = p_pop_id
    AND pm.accounting_account_id IS DISTINCT FROM ta.accounting_chart_account_id;

  -- Medios de cobro (ventas).
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

  -- Formas de pago (compras / gastos).
  PERFORM public.ensure_default_payment_method(
    p_pop_id, 'Efectivo', 'cash', 'pay', 10, v_caja_ta
  );
  PERFORM public.ensure_default_payment_method(
    p_pop_id, 'Transferencia', 'transfer', 'pay', 20, v_banco_ta
  );
END;
$$;

COMMENT ON FUNCTION public.seed_pop_treasury_defaults IS
  'Crea subcuentas contables, cuentas de tesorería y formas de pago por defecto para un POP.';

-- Trigger al crear POP (idempotente; requiere plan contable ya seedeado).
CREATE OR REPLACE FUNCTION public.pops_after_insert_treasury_defaults ()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.seed_pop_treasury_defaults(NEW.id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS pops_after_insert_treasury_defaults ON public.pops;
CREATE TRIGGER pops_after_insert_treasury_defaults
  AFTER INSERT ON public.pops
  FOR EACH ROW
  EXECUTE FUNCTION public.pops_after_insert_treasury_defaults ();

-- Backfill POPs existentes.
DO $$
DECLARE
  pid UUID;
BEGIN
  FOR pid IN SELECT id FROM public.pops
  LOOP
    PERFORM public.seed_pop_treasury_defaults(pid);
  END LOOP;
END $$;
