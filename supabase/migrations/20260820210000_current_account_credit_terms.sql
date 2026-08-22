-- Condiciones de cuenta corriente: límite de crédito y plazo.

ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS current_account_credit_limit NUMERIC(15, 2);

ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS current_account_term_days INTEGER NOT NULL DEFAULT 30;

ALTER TABLE public.suppliers
  ADD COLUMN IF NOT EXISTS current_account_credit_limit NUMERIC(15, 2);

ALTER TABLE public.suppliers
  ADD COLUMN IF NOT EXISTS current_account_term_days INTEGER NOT NULL DEFAULT 30;

ALTER TABLE public.clients
  DROP CONSTRAINT IF EXISTS clients_current_account_credit_limit_check;
ALTER TABLE public.clients
  ADD CONSTRAINT clients_current_account_credit_limit_check
  CHECK (
    current_account_credit_limit IS NULL
    OR current_account_credit_limit >= 0
  );

ALTER TABLE public.clients
  DROP CONSTRAINT IF EXISTS clients_current_account_term_days_check;
ALTER TABLE public.clients
  ADD CONSTRAINT clients_current_account_term_days_check
  CHECK (
    current_account_term_days >= 1
    AND current_account_term_days <= 365
  );

ALTER TABLE public.suppliers
  DROP CONSTRAINT IF EXISTS suppliers_current_account_credit_limit_check;
ALTER TABLE public.suppliers
  ADD CONSTRAINT suppliers_current_account_credit_limit_check
  CHECK (
    current_account_credit_limit IS NULL
    OR current_account_credit_limit >= 0
  );

ALTER TABLE public.suppliers
  DROP CONSTRAINT IF EXISTS suppliers_current_account_term_days_check;
ALTER TABLE public.suppliers
  ADD CONSTRAINT suppliers_current_account_term_days_check
  CHECK (
    current_account_term_days >= 1
    AND current_account_term_days <= 365
  );

COMMENT ON COLUMN public.clients.current_account_credit_limit IS
  'Tope de saldo a cuenta. NULL = sin límite.';

COMMENT ON COLUMN public.clients.current_account_term_days IS
  'Días de plazo para el vencimiento de ventas a cuenta.';

COMMENT ON COLUMN public.suppliers.current_account_credit_limit IS
  'Tope de saldo a cuenta. NULL = sin límite.';

COMMENT ON COLUMN public.suppliers.current_account_term_days IS
  'Días de plazo para el vencimiento de compras a cuenta.';
