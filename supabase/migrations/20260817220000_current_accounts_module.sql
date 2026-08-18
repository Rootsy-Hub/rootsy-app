-- Cuentas corrientes: submayor por cliente/proveedor.
-- El ítem abierto es la venta o la compra. El cobro/pago posterior
-- vive en current_account_receipts + imputaciones.
-- Contado sigue en *_payments; un cheque rechazado marca reversed_at
-- para reabrir el comprobante.

-- 1) Flag consultable (hoy está solo en metadata)
ALTER TABLE public.sales
  ADD COLUMN IF NOT EXISTS on_account BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE public.purchases
  ADD COLUMN IF NOT EXISTS on_account BOOLEAN NOT NULL DEFAULT FALSE;

UPDATE public.sales
SET on_account = TRUE
WHERE COALESCE(metadata->>'pay_on_client_account', '') IN ('true', 't', '1');

UPDATE public.purchases
SET on_account = TRUE
WHERE COALESCE(metadata->>'pay_on_supplier_account', '') IN ('true', 't', '1');

CREATE INDEX IF NOT EXISTS idx_sales_pop_on_account
  ON public.sales (pop_id, client_id, sold_at DESC)
  WHERE on_account = TRUE;

CREATE INDEX IF NOT EXISTS idx_purchases_pop_on_account
  ON public.purchases (pop_id, supplier_id, created_at DESC)
  WHERE on_account = TRUE;

COMMENT ON COLUMN public.sales.on_account IS
  'Venta a cuenta corriente del cliente. El saldo abierto = total − pagos no revertidos − imputaciones.';

COMMENT ON COLUMN public.purchases.on_account IS
  'Compra a cuenta corriente del proveedor. El saldo abierto = total − pagos no revertidos − imputaciones.';

-- 2) Pagos de checkout que dejan de cancelar el comprobante (cheque rechazado/anulado)
ALTER TABLE public.sale_payments
  ADD COLUMN IF NOT EXISTS reversed_at TIMESTAMPTZ;

ALTER TABLE public.purchase_payments
  ADD COLUMN IF NOT EXISTS reversed_at TIMESTAMPTZ;

ALTER TABLE public.expense_payments
  ADD COLUMN IF NOT EXISTS reversed_at TIMESTAMPTZ;

ALTER TABLE public.service_charge_payments
  ADD COLUMN IF NOT EXISTS reversed_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_sale_payments_sale_open
  ON public.sale_payments (sale_id)
  WHERE reversed_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_purchase_payments_purchase_open
  ON public.purchase_payments (purchase_id)
  WHERE reversed_at IS NULL;

-- 3) Recibo de cobranza / orden de pago (desde el módulo, etapa 3)
CREATE TABLE IF NOT EXISTS public.current_account_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pop_id UUID NOT NULL REFERENCES public.pops (id) ON DELETE CASCADE,
  direction TEXT NOT NULL,
  client_id UUID REFERENCES public.clients (id) ON DELETE RESTRICT,
  supplier_id UUID REFERENCES public.suppliers (id) ON DELETE RESTRICT,
  amount NUMERIC(15, 2) NOT NULL,
  paid_at DATE NOT NULL,
  payment_kind TEXT,
  treasury_account_id UUID
    REFERENCES public.treasury_accounts (id) ON DELETE SET NULL,
  check_id UUID REFERENCES public.checks (id) ON DELETE RESTRICT,
  accounting_entry_id UUID
    REFERENCES public.accounting_entries (id) ON DELETE SET NULL,
  notes TEXT,
  created_by UUID NOT NULL REFERENCES auth.users (id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT current_account_receipts_direction_check
    CHECK (direction IN ('receivable', 'payable')),
  CONSTRAINT current_account_receipts_amount_positive
    CHECK (amount > 0),
  CONSTRAINT current_account_receipts_party_check
    CHECK (
      (direction = 'receivable' AND client_id IS NOT NULL AND supplier_id IS NULL)
      OR
      (direction = 'payable' AND supplier_id IS NOT NULL AND client_id IS NULL)
    )
);

CREATE INDEX IF NOT EXISTS idx_ca_receipts_pop_client
  ON public.current_account_receipts (pop_id, client_id, paid_at DESC)
  WHERE client_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_ca_receipts_pop_supplier
  ON public.current_account_receipts (pop_id, supplier_id, paid_at DESC)
  WHERE supplier_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_ca_receipts_check
  ON public.current_account_receipts (check_id)
  WHERE check_id IS NOT NULL;

DROP TRIGGER IF EXISTS current_account_receipts_set_updated_at
  ON public.current_account_receipts;
CREATE TRIGGER current_account_receipts_set_updated_at
  BEFORE UPDATE ON public.current_account_receipts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at ();

ALTER TABLE public.current_account_receipts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS current_account_receipts_select_pop
  ON public.current_account_receipts;
CREATE POLICY current_account_receipts_select_pop
  ON public.current_account_receipts
  FOR SELECT TO authenticated
  USING (public.user_is_member_of_active_pop(pop_id));

DROP POLICY IF EXISTS current_account_receipts_insert_pop
  ON public.current_account_receipts;
CREATE POLICY current_account_receipts_insert_pop
  ON public.current_account_receipts
  FOR INSERT TO authenticated
  WITH CHECK (public.user_is_member_of_active_pop(pop_id));

DROP POLICY IF EXISTS current_account_receipts_update_pop
  ON public.current_account_receipts;
CREATE POLICY current_account_receipts_update_pop
  ON public.current_account_receipts
  FOR UPDATE TO authenticated
  USING (public.user_is_member_of_active_pop(pop_id))
  WITH CHECK (public.user_is_member_of_active_pop(pop_id));

DROP POLICY IF EXISTS current_account_receipts_delete_pop
  ON public.current_account_receipts;
CREATE POLICY current_account_receipts_delete_pop
  ON public.current_account_receipts
  FOR DELETE TO authenticated
  USING (public.user_is_member_of_active_pop(pop_id));

COMMENT ON TABLE public.current_account_receipts IS
  'Cobranza a cliente (receivable) o pago a proveedor (payable). Lo no imputado queda a cuenta.';

-- 4) Imputación recibo → venta/compra
CREATE TABLE IF NOT EXISTS public.current_account_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pop_id UUID NOT NULL REFERENCES public.pops (id) ON DELETE CASCADE,
  receipt_id UUID NOT NULL
    REFERENCES public.current_account_receipts (id) ON DELETE CASCADE,
  document_kind TEXT NOT NULL,
  document_id UUID NOT NULL,
  amount NUMERIC(15, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT current_account_applications_kind_check
    CHECK (document_kind IN ('sale', 'purchase')),
  CONSTRAINT current_account_applications_amount_positive
    CHECK (amount > 0),
  CONSTRAINT current_account_applications_unique_doc
    UNIQUE (receipt_id, document_kind, document_id)
);

CREATE INDEX IF NOT EXISTS idx_ca_applications_document
  ON public.current_account_applications (pop_id, document_kind, document_id);

CREATE INDEX IF NOT EXISTS idx_ca_applications_receipt
  ON public.current_account_applications (receipt_id);

ALTER TABLE public.current_account_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS current_account_applications_select_pop
  ON public.current_account_applications;
CREATE POLICY current_account_applications_select_pop
  ON public.current_account_applications
  FOR SELECT TO authenticated
  USING (public.user_is_member_of_active_pop(pop_id));

DROP POLICY IF EXISTS current_account_applications_insert_pop
  ON public.current_account_applications;
CREATE POLICY current_account_applications_insert_pop
  ON public.current_account_applications
  FOR INSERT TO authenticated
  WITH CHECK (public.user_is_member_of_active_pop(pop_id));

DROP POLICY IF EXISTS current_account_applications_update_pop
  ON public.current_account_applications;
CREATE POLICY current_account_applications_update_pop
  ON public.current_account_applications
  FOR UPDATE TO authenticated
  USING (public.user_is_member_of_active_pop(pop_id))
  WITH CHECK (public.user_is_member_of_active_pop(pop_id));

DROP POLICY IF EXISTS current_account_applications_delete_pop
  ON public.current_account_applications;
CREATE POLICY current_account_applications_delete_pop
  ON public.current_account_applications
  FOR DELETE TO authenticated
  USING (public.user_is_member_of_active_pop(pop_id));

COMMENT ON TABLE public.current_account_applications IS
  'Cuánto de un recibo cancela una venta o compra. El resto del recibo queda a cuenta.';

-- 5) Permisos owner / administrator
DO $$
DECLARE
  r RECORD;
  grants JSONB;
  new_perms JSONB := '[
    "current_accounts:read",
    "current_accounts:create",
    "current_accounts:update",
    "current_accounts:delete"
  ]'::jsonb;
  p TEXT;
BEGIN
  FOR r IN
    SELECT id, permission_grants
    FROM public.roles
    WHERE lower(name) IN ('administrator', 'owner', 'administrador', 'dueño', 'dueno')
  LOOP
    grants := COALESCE(r.permission_grants, '[]'::jsonb);
    FOR p IN SELECT jsonb_array_elements_text(new_perms)
    LOOP
      IF NOT grants @> to_jsonb(p) THEN
        grants := grants || to_jsonb(p);
      END IF;
    END LOOP;
    UPDATE public.roles SET permission_grants = grants WHERE id = r.id;
  END LOOP;
END $$;
