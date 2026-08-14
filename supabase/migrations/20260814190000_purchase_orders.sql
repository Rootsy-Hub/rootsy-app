-- Órdenes de compra (POS compras): snapshot de checkout reutilizable en Comprar.

CREATE TABLE IF NOT EXISTS public.purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pop_id UUID NOT NULL REFERENCES public.pops (id) ON DELETE CASCADE,
  order_number INTEGER NOT NULL CHECK (order_number > 0),
  supplier_id UUID REFERENCES public.suppliers (id) ON DELETE SET NULL,
  supplier_name TEXT NOT NULL DEFAULT '',
  supplier_tax_id TEXT,
  subtotal NUMERIC(15, 2) NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
  discount_total NUMERIC(15, 2) NOT NULL DEFAULT 0 CHECK (discount_total >= 0),
  total NUMERIC(15, 2) NOT NULL DEFAULT 0 CHECK (total >= 0),
  currency TEXT NOT NULL DEFAULT 'ARS',
  checkout_snapshot JSONB NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'active',
  converted_purchase_id UUID REFERENCES public.purchases (id) ON DELETE SET NULL,
  created_by UUID NOT NULL REFERENCES auth.users (id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT purchase_orders_status_check
    CHECK (status IN ('active', 'converted', 'cancelled')),
  CONSTRAINT purchase_orders_checkout_snapshot_is_object
    CHECK (jsonb_typeof(checkout_snapshot) = 'object'),
  CONSTRAINT purchase_orders_pop_number_unique
    UNIQUE (pop_id, order_number)
);

CREATE INDEX IF NOT EXISTS idx_purchase_orders_pop_created
  ON public.purchase_orders (pop_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_purchase_orders_pop_status
  ON public.purchase_orders (pop_id, status, created_at DESC);

DROP TRIGGER IF EXISTS purchase_orders_set_updated_at ON public.purchase_orders;
CREATE TRIGGER purchase_orders_set_updated_at
  BEFORE UPDATE ON public.purchase_orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at ();

ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS purchase_orders_select ON public.purchase_orders;
CREATE POLICY purchase_orders_select ON public.purchase_orders
  FOR SELECT TO authenticated
  USING (public.user_is_member_of_active_pop(pop_id));

DROP POLICY IF EXISTS purchase_orders_insert ON public.purchase_orders;
CREATE POLICY purchase_orders_insert ON public.purchase_orders
  FOR INSERT TO authenticated
  WITH CHECK (public.user_is_member_of_active_pop(pop_id));

DROP POLICY IF EXISTS purchase_orders_update ON public.purchase_orders;
CREATE POLICY purchase_orders_update ON public.purchase_orders
  FOR UPDATE TO authenticated
  USING (public.user_is_member_of_active_pop(pop_id))
  WITH CHECK (public.user_is_member_of_active_pop(pop_id));

DROP POLICY IF EXISTS purchase_orders_delete ON public.purchase_orders;
CREATE POLICY purchase_orders_delete ON public.purchase_orders
  FOR DELETE TO authenticated
  USING (public.user_is_member_of_active_pop(pop_id));

COMMENT ON TABLE public.purchase_orders IS
  'Órdenes de compra generadas desde Comprar. checkout_snapshot reutilizable al confirmar compra.';
