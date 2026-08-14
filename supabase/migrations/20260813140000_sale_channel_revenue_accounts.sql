-- Cuentas de ingreso por canal de venta + reasignación histórica + ledger de servicios.

-- ---------------------------------------------------------------------------
-- Nuevas cuentas de ingreso (mesas / mostrador) en POPs existentes
-- ---------------------------------------------------------------------------

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
  v.code,
  v.name,
  'ingresos',
  'acreedora',
  4,
  true,
  NULL,
  jsonb_build_object('seed', 'sale_channel_revenue')
FROM public.pops p
CROSS JOIN (
  VALUES
    ('4.1.1.03', 'Ventas — mesas'),
    ('4.1.1.04', 'Ventas — mostrador')
) AS v (code, name)
WHERE NOT EXISTS (
  SELECT 1
  FROM public.accounting_chart_of_accounts a
  WHERE a.pop_id = p.id
    AND a.code = v.code
);

UPDATE public.accounting_chart_of_accounts
SET name = 'Ventas — comercio'
WHERE code = '4.1.1.01'
  AND name = 'Ventas';

UPDATE public.accounting_chart_of_accounts
SET name = 'Ventas — servicios'
WHERE code = '4.1.1.02'
  AND name = 'Ventas de servicios';

-- ---------------------------------------------------------------------------
-- Reasignar líneas de ingreso en ventas históricas (mesas / mostrador)
-- ---------------------------------------------------------------------------

UPDATE public.accounting_entry_lines ael
SET account_id = target_acct.id
FROM public.accounting_entries ae
JOIN public.sales s
  ON s.id = ae.source_id
 AND ae.source_type = 'sale'
JOIN public.accounting_chart_of_accounts legacy_acct
  ON legacy_acct.pop_id = s.pop_id
 AND legacy_acct.code = '4.1.1.01'
JOIN public.accounting_chart_of_accounts target_acct
  ON target_acct.pop_id = s.pop_id
 AND target_acct.code = CASE s.sale_channel
   WHEN 'table' THEN '4.1.1.03'
   WHEN 'counter' THEN '4.1.1.04'
   ELSE '4.1.1.01'
 END
WHERE ael.entry_id = ae.id
  AND ael.account_id = legacy_acct.id
  AND ae.status = 'posted'
  AND s.status = 'completed'
  AND s.sale_channel IN ('table', 'counter')
  AND ael.credit_amount > 0
  AND ael.debit_amount = 0
  AND target_acct.id IS DISTINCT FROM ael.account_id;

-- ---------------------------------------------------------------------------
-- Ledger en cobros de servicios
-- ---------------------------------------------------------------------------

ALTER TABLE public.service_charge_payments
  ADD COLUMN IF NOT EXISTS accounting_entry_id uuid
    REFERENCES public.accounting_entries (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_service_charge_payments_accounting_entry
  ON public.service_charge_payments (accounting_entry_id)
  WHERE accounting_entry_id IS NOT NULL;

COMMENT ON COLUMN public.service_charge_payments.accounting_entry_id IS
  'Asiento contable generado al registrar el cobro (ingreso 4.1.1.02).';
