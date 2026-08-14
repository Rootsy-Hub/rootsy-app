-- Backfill: asientos contables para cobros de servicios registrados antes del ledger.

DO $$
DECLARE
  pay RECORD;
  v_entry_id uuid;
  v_entry_num integer;
  v_debit_acct uuid;
  v_credit_acct uuid;
  v_entry_date date;
  v_desc text;
BEGIN
  FOR pay IN
    SELECT
      scp.id AS payment_id,
      scp.pop_id,
      scp.amount,
      scp.paid_at,
      scp.payment_kind,
      scp.treasury_account_id,
      scp.created_by,
      COALESCE(NULLIF(trim(st.name), ''), 'Servicio') AS service_name
    FROM public.service_charge_payments scp
    JOIN public.service_charges sc
      ON sc.id = scp.service_charge_id
     AND sc.pop_id = scp.pop_id
    JOIN public.service_types st
      ON st.id = sc.service_type_id
     AND st.pop_id = scp.pop_id
    WHERE scp.accounting_entry_id IS NULL
      AND scp.payment_kind IS NOT NULL
      AND trim(scp.payment_kind) <> ''
      AND scp.treasury_account_id IS NOT NULL
      AND sc.cancelled_at IS NULL
      AND sc.status <> 'cancelled'
      AND scp.amount > 0
  LOOP
    SELECT ta.accounting_chart_account_id
    INTO v_debit_acct
    FROM public.treasury_accounts ta
    WHERE ta.id = pay.treasury_account_id
      AND ta.pop_id = pay.pop_id
    LIMIT 1;

    IF v_debit_acct IS NULL THEN
      SELECT ac.id
      INTO v_debit_acct
      FROM public.accounting_chart_of_accounts ac
      WHERE ac.pop_id = pay.pop_id
        AND ac.code = CASE pay.payment_kind
          WHEN 'cash' THEN '1.1.1.01'
          WHEN 'card_debit' THEN '1.1.1.03'
          WHEN 'card_credit' THEN '1.1.1.03'
          ELSE '1.1.1.02'
        END
      LIMIT 1;
    END IF;

    SELECT ac.id
    INTO v_credit_acct
    FROM public.accounting_chart_of_accounts ac
    WHERE ac.pop_id = pay.pop_id
      AND ac.code IN ('4.1.1.02', '4.1.1.01')
    ORDER BY CASE ac.code WHEN '4.1.1.02' THEN 0 ELSE 1 END
    LIMIT 1;

    IF v_debit_acct IS NULL OR v_credit_acct IS NULL THEN
      CONTINUE;
    END IF;

    v_entry_date := pay.paid_at;
    v_desc := 'Cobro de servicio — ' || pay.service_name;

    SELECT COALESCE(max(entry_number), 0) + 1
    INTO v_entry_num
    FROM public.accounting_entries
    WHERE pop_id = pay.pop_id;

    INSERT INTO public.accounting_entries (
      pop_id,
      entry_number,
      entry_date,
      source_type,
      source_id,
      description,
      status,
      created_by,
      posted_at,
      posted_by
    )
    VALUES (
      pay.pop_id,
      v_entry_num,
      v_entry_date,
      'service_charge_payment',
      pay.payment_id,
      v_desc,
      'posted',
      pay.created_by,
      now(),
      pay.created_by
    )
    RETURNING id INTO v_entry_id;

    INSERT INTO public.accounting_entry_lines (
      entry_id,
      account_id,
      debit_amount,
      credit_amount,
      description,
      line_order
    )
    VALUES
      (v_entry_id, v_debit_acct, pay.amount, 0, v_desc, 1),
      (v_entry_id, v_credit_acct, 0, pay.amount, v_desc, 2);

    UPDATE public.service_charge_payments
    SET accounting_entry_id = v_entry_id
    WHERE id = pay.payment_id;
  END LOOP;
END;
$$;
