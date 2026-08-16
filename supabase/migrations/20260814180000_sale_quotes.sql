-- Presupuestos de venta (POS): snapshot de checkout reutilizable en Vender.

CREATE TABLE IF NOT EXISTS public.sale_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pop_id UUID NOT NULL REFERENCES public.pops (id) ON DELETE CASCADE,
  quote_number INTEGER NOT NULL CHECK (quote_number > 0),
  client_id UUID REFERENCES public.clients (id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL DEFAULT '',
  customer_tax_id TEXT,
  subtotal NUMERIC(15, 2) NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
  discount_total NUMERIC(15, 2) NOT NULL DEFAULT 0 CHECK (discount_total >= 0),
  total NUMERIC(15, 2) NOT NULL DEFAULT 0 CHECK (total >= 0),
  currency TEXT NOT NULL DEFAULT 'ARS',
  checkout_snapshot JSONB NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'active',
  converted_sale_id UUID REFERENCES public.sales (id) ON DELETE SET NULL,
  created_by UUID NOT NULL REFERENCES auth.users (id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT sale_quotes_status_check
    CHECK (status IN ('active', 'converted', 'cancelled')),
  CONSTRAINT sale_quotes_checkout_snapshot_is_object
    CHECK (jsonb_typeof(checkout_snapshot) = 'object'),
  CONSTRAINT sale_quotes_pop_number_unique
    UNIQUE (pop_id, quote_number)
);

CREATE INDEX IF NOT EXISTS idx_sale_quotes_pop_created
  ON public.sale_quotes (pop_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_sale_quotes_pop_status
  ON public.sale_quotes (pop_id, status, created_at DESC);

DROP TRIGGER IF EXISTS sale_quotes_set_updated_at ON public.sale_quotes;
CREATE TRIGGER sale_quotes_set_updated_at
  BEFORE UPDATE ON public.sale_quotes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at ();

ALTER TABLE public.sale_quotes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS sale_quotes_select ON public.sale_quotes;
CREATE POLICY sale_quotes_select ON public.sale_quotes
  FOR SELECT TO authenticated
  USING (public.user_is_member_of_active_pop(pop_id));

DROP POLICY IF EXISTS sale_quotes_insert ON public.sale_quotes;
CREATE POLICY sale_quotes_insert ON public.sale_quotes
  FOR INSERT TO authenticated
  WITH CHECK (public.user_is_member_of_active_pop(pop_id));

DROP POLICY IF EXISTS sale_quotes_update ON public.sale_quotes;
CREATE POLICY sale_quotes_update ON public.sale_quotes
  FOR UPDATE TO authenticated
  USING (public.user_is_member_of_active_pop(pop_id))
  WITH CHECK (public.user_is_member_of_active_pop(pop_id));

DROP POLICY IF EXISTS sale_quotes_delete ON public.sale_quotes;
CREATE POLICY sale_quotes_delete ON public.sale_quotes
  FOR DELETE TO authenticated
  USING (public.user_is_member_of_active_pop(pop_id));

COMMENT ON TABLE public.sale_quotes IS
  'Presupuestos generados desde Vender. checkout_snapshot compatible con mesas/mostrador.';
