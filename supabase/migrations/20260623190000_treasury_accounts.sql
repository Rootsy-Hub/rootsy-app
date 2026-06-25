-- Cuentas de tesorería (1:1 con subcuenta del plan contable)

CREATE TABLE IF NOT EXISTS public.treasury_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pop_id UUID NOT NULL REFERENCES public.pops (id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'other',
  accounting_chart_account_id UUID NOT NULL
    REFERENCES public.accounting_chart_of_accounts (id) ON DELETE RESTRICT,
  is_system_default BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT treasury_accounts_name_nonempty CHECK (char_length(trim(name)) > 0),
  CONSTRAINT treasury_accounts_kind_check CHECK (
    kind IN ('cash', 'bank', 'wallet', 'card_payable', 'other')
  ),
  CONSTRAINT treasury_accounts_pop_chart_unique UNIQUE (pop_id, accounting_chart_account_id)
);

CREATE INDEX IF NOT EXISTS idx_treasury_accounts_pop
  ON public.treasury_accounts (pop_id, sort_order, name);

ALTER TABLE public.payment_methods
  ADD COLUMN IF NOT EXISTS treasury_account_id UUID
  REFERENCES public.treasury_accounts (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_payment_methods_treasury_account
  ON public.payment_methods (treasury_account_id)
  WHERE treasury_account_id IS NOT NULL;

ALTER TABLE public.bank_statement_lines
  ADD COLUMN IF NOT EXISTS treasury_account_id UUID
  REFERENCES public.treasury_accounts (id) ON DELETE CASCADE;

ALTER TABLE public.treasury_reconciliation_marks
  ADD COLUMN IF NOT EXISTS treasury_account_id UUID
  REFERENCES public.treasury_accounts (id) ON DELETE CASCADE;

ALTER TABLE public.treasury_settlements
  ADD COLUMN IF NOT EXISTS card_treasury_account_id UUID
  REFERENCES public.treasury_accounts (id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS funding_treasury_account_id UUID
  REFERENCES public.treasury_accounts (id) ON DELETE SET NULL;

-- Defaults por POP (Caja, Banco, Tarjetas a pagar)
INSERT INTO public.treasury_accounts (
  pop_id,
  name,
  kind,
  accounting_chart_account_id,
  is_system_default,
  sort_order
)
SELECT
  p.id,
  v.name,
  v.kind,
  ac.id,
  TRUE,
  v.sort_order
FROM public.pops p
CROSS JOIN (
  VALUES
    ('Caja', 'cash', '1.1.1.01', 10),
    ('Banco', 'bank', '1.1.1.02', 20),
    ('Tarjetas corporativas', 'card_payable', '2.1.1.03', 30)
) AS v(name, kind, code, sort_order)
JOIN public.accounting_chart_of_accounts ac
  ON ac.pop_id = p.id AND ac.code = v.code
WHERE NOT EXISTS (
  SELECT 1
  FROM public.treasury_accounts ta
  WHERE ta.pop_id = p.id
    AND ta.accounting_chart_account_id = ac.id
);

-- Vincular medios de pago existentes por cuenta contable explícita (una fila por subcuenta)
INSERT INTO public.treasury_accounts (
  pop_id,
  name,
  kind,
  accounting_chart_account_id,
  is_system_default,
  sort_order
)
SELECT DISTINCT ON (pm.pop_id, pm.accounting_account_id)
  pm.pop_id,
  pm.name,
  CASE pm.kind
    WHEN 'cash' THEN 'cash'
    WHEN 'transfer' THEN 'bank'
    WHEN 'card_credit' THEN
      CASE WHEN pm.usage IN ('pay', 'both') THEN 'card_payable' ELSE 'other' END
    ELSE 'other'
  END,
  pm.accounting_account_id,
  FALSE,
  pm.sort_order + 100
FROM public.payment_methods pm
WHERE pm.accounting_account_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM public.treasury_accounts ta
    WHERE ta.pop_id = pm.pop_id
      AND ta.accounting_chart_account_id = pm.accounting_account_id
  )
ORDER BY pm.pop_id, pm.accounting_account_id, pm.sort_order, pm.name;

UPDATE public.payment_methods pm
SET treasury_account_id = ta.id
FROM public.treasury_accounts ta
WHERE pm.treasury_account_id IS NULL
  AND pm.accounting_account_id IS NOT NULL
  AND ta.pop_id = pm.pop_id
  AND ta.accounting_chart_account_id = pm.accounting_account_id;

-- Fallback por tipo → default del POP
UPDATE public.payment_methods pm
SET treasury_account_id = ta.id
FROM public.treasury_accounts ta
WHERE pm.treasury_account_id IS NULL
  AND ta.pop_id = pm.pop_id
  AND ta.is_system_default = TRUE
  AND (
    (pm.kind = 'cash' AND ta.kind = 'cash')
    OR (pm.kind IN ('transfer', 'card_debit') AND ta.kind = 'bank')
    OR (pm.kind = 'card_credit' AND pm.usage IN ('pay', 'both') AND ta.kind = 'card_payable')
    OR (pm.kind = 'card_credit' AND pm.usage = 'receive' AND ta.kind = 'bank')
    OR (pm.kind = 'other' AND ta.kind = 'bank')
  );

UPDATE public.payment_methods pm
SET treasury_account_id = (
  SELECT ta.id
  FROM public.treasury_accounts ta
  WHERE ta.pop_id = pm.pop_id AND ta.kind = 'bank'
  ORDER BY ta.is_system_default DESC, ta.sort_order
  LIMIT 1
)
WHERE pm.treasury_account_id IS NULL;

UPDATE public.bank_statement_lines bsl
SET treasury_account_id = pm.treasury_account_id
FROM public.payment_methods pm
WHERE bsl.treasury_account_id IS NULL
  AND pm.id = bsl.payment_method_id
  AND pm.treasury_account_id IS NOT NULL;

UPDATE public.treasury_reconciliation_marks trm
SET treasury_account_id = pm.treasury_account_id
FROM public.payment_methods pm
WHERE trm.treasury_account_id IS NULL
  AND pm.id = trm.payment_method_id
  AND pm.treasury_account_id IS NOT NULL;

UPDATE public.treasury_settlements ts
SET
  card_treasury_account_id = pm_card.treasury_account_id,
  funding_treasury_account_id = pm_fund.treasury_account_id
FROM public.payment_methods pm_card,
  public.payment_methods pm_fund
WHERE ts.card_treasury_account_id IS NULL
  AND pm_card.id = ts.card_payment_method_id
  AND pm_fund.id = ts.funding_payment_method_id;

COMMENT ON TABLE public.treasury_accounts IS
  'Cuentas operativas de tesorería; cada fila apunta a una subcuenta del plan contable.';

COMMENT ON COLUMN public.payment_methods.treasury_account_id IS
  'Cuenta de tesorería donde se acredita el cobro (formas de pago en ventas).';
