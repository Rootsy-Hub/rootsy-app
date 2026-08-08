-- Mostrador: pedidos en counter_orders, FK en sales, permisos y realtime.

CREATE TABLE IF NOT EXISTS public.counter_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pop_id UUID NOT NULL REFERENCES public.pops (id) ON DELETE CASCADE,
  order_day DATE NOT NULL DEFAULT (CURRENT_DATE),
  order_number INTEGER NOT NULL CHECK (order_number > 0),
  status TEXT NOT NULL DEFAULT 'preparing',
  fulfillment_type TEXT NOT NULL,
  delivery_address TEXT,
  phone TEXT,
  driver_name TEXT,
  estimated_minutes INTEGER NOT NULL,
  notes TEXT NOT NULL DEFAULT '',
  immediate_fulfillment BOOLEAN NOT NULL DEFAULT FALSE,
  sale_id UUID REFERENCES public.sales (id) ON DELETE SET NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  opened_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  delivered_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  opened_by UUID REFERENCES auth.users (id) ON DELETE SET NULL,
  cancelled_by UUID REFERENCES auth.users (id) ON DELETE SET NULL,
  CONSTRAINT counter_orders_status_check
    CHECK (status IN ('preparing', 'dispatched', 'delivered', 'cancelled')),
  CONSTRAINT counter_orders_fulfillment_type_check
    CHECK (fulfillment_type IN ('pickup', 'delivery')),
  CONSTRAINT counter_orders_estimated_minutes_check
    CHECK (estimated_minutes >= 15 AND estimated_minutes <= 60),
  CONSTRAINT counter_orders_pop_day_number_unique
    UNIQUE (pop_id, order_day, order_number)
);

CREATE INDEX IF NOT EXISTS idx_counter_orders_pop_status
  ON public.counter_orders (pop_id, status, opened_at DESC);

CREATE INDEX IF NOT EXISTS idx_counter_orders_pop_delivered
  ON public.counter_orders (pop_id, status, delivered_at DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS idx_counter_orders_pop_sale
  ON public.counter_orders (pop_id, sale_id)
  WHERE sale_id IS NOT NULL;

ALTER TABLE public.sales
  ADD COLUMN IF NOT EXISTS counter_order_id UUID
  REFERENCES public.counter_orders (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_sales_counter_order
  ON public.sales (counter_order_id)
  WHERE counter_order_id IS NOT NULL;

DROP TRIGGER IF EXISTS counter_orders_set_updated_at ON public.counter_orders;
CREATE TRIGGER counter_orders_set_updated_at
  BEFORE UPDATE ON public.counter_orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at ();

-- RLS
ALTER TABLE public.counter_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS counter_orders_select ON public.counter_orders;
CREATE POLICY counter_orders_select ON public.counter_orders
  FOR SELECT TO authenticated
  USING (public.user_is_member_of_active_pop(pop_id));

DROP POLICY IF EXISTS counter_orders_insert ON public.counter_orders;
CREATE POLICY counter_orders_insert ON public.counter_orders
  FOR INSERT TO authenticated
  WITH CHECK (public.user_is_member_of_active_pop(pop_id));

DROP POLICY IF EXISTS counter_orders_update ON public.counter_orders;
CREATE POLICY counter_orders_update ON public.counter_orders
  FOR UPDATE TO authenticated
  USING (public.user_is_member_of_active_pop(pop_id))
  WITH CHECK (public.user_is_member_of_active_pop(pop_id));

DROP POLICY IF EXISTS counter_orders_delete ON public.counter_orders;
CREATE POLICY counter_orders_delete ON public.counter_orders
  FOR DELETE TO authenticated
  USING (public.user_is_member_of_active_pop(pop_id));

-- Realtime
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.counter_orders;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END $$;

COMMENT ON TABLE public.counter_orders IS
  'Pedidos de mostrador / delivery (restaurante). Checkout en metadata.checkout.';

-- Permisos mostrador: agregar a roles owner/administrator existentes
DO $$
DECLARE
  r RECORD;
  grants JSONB;
  new_perms JSONB := '["mostrador:read","mostrador:create","mostrador:update","mostrador:delete"]'::jsonb;
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
