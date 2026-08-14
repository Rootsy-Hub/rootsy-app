-- Cuenta de patrimonio para stock inicial + reclasificación histórica desde Otros ingresos.

INSERT INTO public.accounting_chart_of_accounts (
  pop_id,
  code,
  name,
  account_type,
  nature,
  level,
  is_movement_account,
  parent_id,
  metadata
)
SELECT
  p.id,
  '3.2.1.02',
  'Ajuste por inventario inicial',
  'patrimonio_neto',
  'acreedora',
  4,
  true,
  NULL,
  jsonb_build_object('seed', 'initial_stock_patrimonio')
FROM public.pops p
WHERE NOT EXISTS (
  SELECT 1
  FROM public.accounting_chart_of_accounts a
  WHERE a.pop_id = p.id
    AND a.code = '3.2.1.02'
);

-- Reclasificar contrapartidas de asientos de stock inicial (Otros ingresos → patrimonio).
UPDATE public.accounting_entry_lines ael
SET account_id = patrimonio_acct.id
FROM public.accounting_entries ae
JOIN public.accounting_chart_of_accounts legacy_acct
  ON legacy_acct.pop_id = ae.pop_id
 AND legacy_acct.code IN ('4.2.1.01', '4.1.1.01')
JOIN public.accounting_chart_of_accounts patrimonio_acct
  ON patrimonio_acct.pop_id = ae.pop_id
 AND patrimonio_acct.code = '3.2.1.02'
WHERE ael.entry_id = ae.id
  AND ae.source_type = 'inventory_initial'
  AND ae.status = 'posted'
  AND ael.account_id = legacy_acct.id
  AND ael.credit_amount > 0
  AND ael.debit_amount = 0
  AND patrimonio_acct.id IS DISTINCT FROM ael.account_id;
