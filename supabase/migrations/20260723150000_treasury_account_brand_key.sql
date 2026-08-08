-- Identidad visual de cuentas madre (banco / billetera preset).

ALTER TABLE public.treasury_accounts
  ADD COLUMN IF NOT EXISTS brand_key TEXT;

COMMENT ON COLUMN public.treasury_accounts.brand_key IS
  'Clave de preset visual (ej. galicia, mercadopago). NULL = genérico u Otro.';
