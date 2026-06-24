-- Compras: mercaderías, materias primas e insumos.
-- Documento operativo + pagos + vínculo a inventario (inventory_movements.purchase_id).
-- RLS: user_is_member_of_active_pop(pop_id).

-- ---------------------------------------------------------------------------
-- Compras (cabecera)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pop_id UUID NOT NULL REFERENCES public.pops (id) ON DELETE CASCADE,
  supplier_id UUID REFERENCES public.suppliers (id) ON DELETE SET NULL,
  supplier_name TEXT,
  supplier_tax_id TEXT,
  purchase_kind TEXT NOT NULL DEFAULT 'merchandise',
  document_number TEXT,
  document_date DATE,
  due_date DATE,
  received_at TIMESTAMPTZ,
  line_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal NUMERIC(15, 2) NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
  tax_total NUMERIC(15, 2) NOT NULL DEFAULT 0 CHECK (tax_total >= 0),
  discount_total NUMERIC(15, 2) NOT NULL DEFAULT 0 CHECK (discount_total >= 0),
  total NUMERIC(15, 2) NOT NULL CHECK (total > 0),
  currency TEXT NOT NULL DEFAULT 'ARS',
  status TEXT NOT NULL DEFAULT 'draft',
  voided_at TIMESTAMPTZ,
  void_reason TEXT,
  notes TEXT NOT NULL DEFAULT '',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by UUID NOT NULL REFERENCES auth.users (id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT purchases_kind_check
    CHECK (purchase_kind IN ('merchandise', 'raw_material', 'supply')),
  CONSTRAINT purchases_status_check
    CHECK (status IN ('draft', 'pending', 'partial', 'paid', 'cancelled', 'voided')),
  CONSTRAINT purchases_line_items_is_array
    CHECK (jsonb_typeof(line_items) = 'array'),
  CONSTRAINT purchases_received_at_check
    CHECK (
      status = 'draft'
      OR received_at IS NOT NULL
    )
);

CREATE INDEX IF NOT EXISTS idx_purchases_pop_status
  ON public.purchases (pop_id, status, document_date DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS idx_purchases_pop_supplier
  ON public.purchases (pop_id, supplier_id)
  WHERE supplier_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_purchases_pop_kind
  ON public.purchases (pop_id, purchase_kind, created_at DESC);

-- ---------------------------------------------------------------------------
-- Pagos a proveedor
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.purchase_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pop_id UUID NOT NULL REFERENCES public.pops (id) ON DELETE CASCADE,
  purchase_id UUID NOT NULL REFERENCES public.purchases (id) ON DELETE RESTRICT,
  amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
  paid_at DATE NOT NULL,
  payment_method_id UUID REFERENCES public.payment_methods (id) ON DELETE SET NULL,
  accounting_entry_id UUID REFERENCES public.accounting_entries (id) ON DELETE SET NULL,
  reversal_accounting_entry_id UUID REFERENCES public.accounting_entries (id) ON DELETE SET NULL,
  notes TEXT,
  created_by UUID NOT NULL REFERENCES auth.users (id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_purchase_payments_purchase
  ON public.purchase_payments (purchase_id, paid_at DESC);

CREATE INDEX IF NOT EXISTS idx_purchase_payments_pop
  ON public.purchase_payments (pop_id);

-- ---------------------------------------------------------------------------
-- Comprobantes / adjuntos
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.purchase_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pop_id UUID NOT NULL REFERENCES public.pops (id) ON DELETE CASCADE,
  purchase_id UUID NOT NULL REFERENCES public.purchases (id) ON DELETE CASCADE,
  storage_path TEXT,
  doc_kind TEXT,
  invoice_number TEXT,
  invoice_date DATE,
  amount NUMERIC(15, 2),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_purchase_documents_purchase
  ON public.purchase_documents (purchase_id);

-- ---------------------------------------------------------------------------
-- Inventario: vínculo con compra
-- ---------------------------------------------------------------------------

ALTER TABLE public.inventory_movements
  ADD COLUMN IF NOT EXISTS purchase_id UUID
  REFERENCES public.purchases (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_inventory_movements_purchase
  ON public.inventory_movements (pop_id, purchase_id)
  WHERE purchase_id IS NOT NULL;

-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.purchases_same_pop_as_supplier ()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  p UUID;
BEGIN
  IF NEW.supplier_id IS NULL THEN
    RETURN NEW;
  END IF;
  SELECT pop_id INTO p FROM public.suppliers WHERE id = NEW.supplier_id;
  IF p IS NULL THEN
    RAISE EXCEPTION 'purchases: proveedor inexistente';
  END IF;
  IF p <> NEW.pop_id THEN
    RAISE EXCEPTION 'purchases: pop_id debe coincidir con el proveedor';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS purchases_same_pop_as_supplier ON public.purchases;
CREATE TRIGGER purchases_same_pop_as_supplier
  BEFORE INSERT OR UPDATE OF pop_id, supplier_id
  ON public.purchases
  FOR EACH ROW
  EXECUTE FUNCTION public.purchases_same_pop_as_supplier ();

CREATE OR REPLACE FUNCTION public.purchase_payments_same_pop_as_purchase ()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  p UUID;
  st TEXT;
BEGIN
  SELECT pop_id, status INTO p, st FROM public.purchases WHERE id = NEW.purchase_id;
  IF p IS NULL THEN
    RAISE EXCEPTION 'purchase_payments: compra inexistente';
  END IF;
  IF p <> NEW.pop_id THEN
    RAISE EXCEPTION 'purchase_payments: pop_id debe coincidir con la compra';
  END IF;
  IF st IN ('voided', 'cancelled', 'draft') THEN
    RAISE EXCEPTION 'purchase_payments: la compra no admite pagos en este estado';
  END IF;
  IF NEW.payment_method_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.payment_methods pm
      WHERE pm.id = NEW.payment_method_id AND pm.pop_id = NEW.pop_id
    ) THEN
      RAISE EXCEPTION 'purchase_payments: medio de pago inválido para este POP';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS purchase_payments_same_pop_as_purchase ON public.purchase_payments;
CREATE TRIGGER purchase_payments_same_pop_as_purchase
  BEFORE INSERT OR UPDATE OF pop_id, purchase_id, payment_method_id
  ON public.purchase_payments
  FOR EACH ROW
  EXECUTE FUNCTION public.purchase_payments_same_pop_as_purchase ();

CREATE OR REPLACE FUNCTION public.purchase_payments_cap_total ()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  pid UUID;
  cap NUMERIC(15, 2);
  prev NUMERIC(15, 2);
BEGIN
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  pid := NEW.purchase_id;
  SELECT total INTO cap FROM public.purchases WHERE id = pid FOR SHARE;
  IF cap IS NULL THEN
    RAISE EXCEPTION 'purchase_payments_cap_total: compra inexistente';
  END IF;
  SELECT COALESCE(SUM(amount), 0) INTO prev
  FROM public.purchase_payments
  WHERE purchase_id = pid
    AND NOT (TG_OP = 'UPDATE' AND id = NEW.id);
  IF prev + NEW.amount > cap + 0.0001 THEN
    RAISE EXCEPTION 'purchase_payments: la suma de pagos no puede superar el total de la compra';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS purchase_payments_cap_total ON public.purchase_payments;
CREATE TRIGGER purchase_payments_cap_total
  BEFORE INSERT OR UPDATE OF amount, purchase_id
  ON public.purchase_payments
  FOR EACH ROW
  EXECUTE FUNCTION public.purchase_payments_cap_total ();

CREATE OR REPLACE FUNCTION public.purchases_recompute_status_from_payments ()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  pid UUID;
  cap NUMERIC(15, 2);
  tot NUMERIC(15, 2);
  st TEXT;
BEGIN
  pid := COALESCE(NEW.purchase_id, OLD.purchase_id);
  SELECT total, status INTO cap, st FROM public.purchases WHERE id = pid FOR UPDATE;
  IF st IN ('voided', 'cancelled', 'draft') THEN
    RETURN COALESCE(NEW, OLD);
  END IF;
  SELECT COALESCE(SUM(amount), 0) INTO tot FROM public.purchase_payments WHERE purchase_id = pid;
  IF tot <= 0 THEN
    UPDATE public.purchases SET status = 'pending', updated_at = now() WHERE id = pid;
  ELSIF tot + 0.0001 >= cap THEN
    UPDATE public.purchases SET status = 'paid', updated_at = now() WHERE id = pid;
  ELSE
    UPDATE public.purchases SET status = 'partial', updated_at = now() WHERE id = pid;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS purchases_recompute_status_from_payments ON public.purchase_payments;
CREATE TRIGGER purchases_recompute_status_from_payments
  AFTER INSERT OR UPDATE OR DELETE
  ON public.purchase_payments
  FOR EACH ROW
  EXECUTE FUNCTION public.purchases_recompute_status_from_payments ();

CREATE OR REPLACE FUNCTION public.purchases_amount_covers_payments ()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  tot NUMERIC(15, 2);
BEGIN
  IF NEW.total IS DISTINCT FROM OLD.total THEN
    SELECT COALESCE(SUM(amount), 0) INTO tot
    FROM public.purchase_payments
    WHERE purchase_id = NEW.id;
    IF tot > NEW.total + 0.0001 THEN
      RAISE EXCEPTION 'purchases: el total no puede ser menor que la suma de pagos';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS purchases_amount_covers_payments ON public.purchases;
CREATE TRIGGER purchases_amount_covers_payments
  BEFORE UPDATE OF total
  ON public.purchases
  FOR EACH ROW
  EXECUTE FUNCTION public.purchases_amount_covers_payments ();

CREATE OR REPLACE FUNCTION public.purchase_documents_same_pop_as_purchase ()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  p UUID;
BEGIN
  SELECT pop_id INTO p FROM public.purchases WHERE id = NEW.purchase_id;
  IF p IS NULL THEN
    RAISE EXCEPTION 'purchase_documents: compra inexistente';
  END IF;
  IF p <> NEW.pop_id THEN
    RAISE EXCEPTION 'purchase_documents: pop_id debe coincidir con la compra';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS purchase_documents_same_pop_as_purchase ON public.purchase_documents;
CREATE TRIGGER purchase_documents_same_pop_as_purchase
  BEFORE INSERT OR UPDATE OF pop_id, purchase_id
  ON public.purchase_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.purchase_documents_same_pop_as_purchase ();

DROP TRIGGER IF EXISTS purchases_set_updated_at ON public.purchases;
CREATE TRIGGER purchases_set_updated_at
  BEFORE UPDATE ON public.purchases
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at ();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

DO $$
DECLARE
  t TEXT;
  tables text[] := ARRAY[
    'purchases',
    'purchase_payments',
    'purchase_documents'
  ];
BEGIN
  FOREACH t IN ARRAY tables
  LOOP
    EXECUTE format(
      'ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;
       DROP POLICY IF EXISTS %I ON public.%I;
       CREATE POLICY %I ON public.%I FOR SELECT TO authenticated
         USING (public.user_is_member_of_active_pop(pop_id));
       DROP POLICY IF EXISTS %I ON public.%I;
       CREATE POLICY %I ON public.%I FOR INSERT TO authenticated
         WITH CHECK (public.user_is_member_of_active_pop(pop_id));
       DROP POLICY IF EXISTS %I ON public.%I;
       CREATE POLICY %I ON public.%I FOR UPDATE TO authenticated
         USING (public.user_is_member_of_active_pop(pop_id))
         WITH CHECK (public.user_is_member_of_active_pop(pop_id));
       DROP POLICY IF EXISTS %I ON public.%I;
       CREATE POLICY %I ON public.%I FOR DELETE TO authenticated
         USING (public.user_is_member_of_active_pop(pop_id));',
      t,
      t || '_select_pop', t, t || '_select_pop', t,
      t || '_insert_pop', t, t || '_insert_pop', t,
      t || '_update_pop', t, t || '_update_pop', t,
      t || '_delete_pop', t, t || '_delete_pop', t
    );
  END LOOP;
END $$;

COMMENT ON TABLE public.purchases IS
  'Compra a proveedor (mercaderías, materias primas o insumos). Ingreso de stock vía inventory_movements.purchase_id.';

COMMENT ON COLUMN public.purchases.purchase_kind IS
  'merchandise = mercaderías; raw_material = materias primas; supply = insumos.';

COMMENT ON COLUMN public.purchases.status IS
  'draft sin recibir; pending recibida sin pagos; partial/paid según purchase_payments.';

COMMENT ON TABLE public.purchase_payments IS
  'Pagos al proveedor por una compra. Genera accounting_entries (source_type purchase_payment).';

COMMENT ON TABLE public.purchase_documents IS
  'Facturas y adjuntos de una compra.';

COMMENT ON COLUMN public.inventory_movements.purchase_id IS
  'Compra que originó un movimiento purchase_receipt.';
