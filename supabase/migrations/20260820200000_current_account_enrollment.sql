-- Alta explícita en cuenta corriente: no todo cliente/proveedor opera a crédito.
-- Quien ya tiene movimientos a cuenta queda habilitado para no cortar el flujo.

ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS current_account_enabled BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE public.suppliers
  ADD COLUMN IF NOT EXISTS current_account_enabled BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN public.clients.current_account_enabled IS
  'Si es true, se puede vender a cuenta corriente de este cliente.';

COMMENT ON COLUMN public.suppliers.current_account_enabled IS
  'Si es true, se puede comprar a cuenta corriente de este proveedor.';

CREATE INDEX IF NOT EXISTS idx_clients_pop_current_account
  ON public.clients (pop_id)
  WHERE current_account_enabled = TRUE;

CREATE INDEX IF NOT EXISTS idx_suppliers_pop_current_account
  ON public.suppliers (pop_id)
  WHERE current_account_enabled = TRUE;

UPDATE public.clients
SET current_account_enabled = TRUE
WHERE id IN (
  SELECT DISTINCT client_id
  FROM public.sales
  WHERE on_account = TRUE
    AND client_id IS NOT NULL
);

UPDATE public.suppliers
SET current_account_enabled = TRUE
WHERE id IN (
  SELECT DISTINCT supplier_id
  FROM public.purchases
  WHERE on_account = TRUE
    AND supplier_id IS NOT NULL
);

UPDATE public.clients
SET current_account_enabled = TRUE
WHERE id IN (
  SELECT DISTINCT client_id
  FROM public.current_account_receipts
  WHERE client_id IS NOT NULL
);

UPDATE public.suppliers
SET current_account_enabled = TRUE
WHERE id IN (
  SELECT DISTINCT supplier_id
  FROM public.current_account_receipts
  WHERE supplier_id IS NOT NULL
);
