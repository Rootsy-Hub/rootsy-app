-- Operaciones: mesas, mostrador, alquileres y servicios.
-- Modelo híbrido (documento operativo + _payments + accounting_entries).
-- RLS: user_is_member_of_active_pop(pop_id).

-- ---------------------------------------------------------------------------
-- Mesas: catálogo + sesiones
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.dining_tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pop_id UUID NOT NULL REFERENCES public.pops (id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  zone TEXT,
  capacity SMALLINT CHECK (capacity IS NULL OR capacity > 0),
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  deleted_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT dining_tables_name_nonempty CHECK (char_length(trim(name)) > 0)
);

CREATE UNIQUE INDEX IF NOT EXISTS dining_tables_pop_name_active_idx
  ON public.dining_tables (pop_id, lower(trim(name)))
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_dining_tables_pop_active
  ON public.dining_tables (pop_id, is_active)
  WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS public.table_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pop_id UUID NOT NULL REFERENCES public.pops (id) ON DELETE CASCADE,
  dining_table_id UUID NOT NULL REFERENCES public.dining_tables (id) ON DELETE RESTRICT,
  status TEXT NOT NULL DEFAULT 'open',
  guest_count SMALLINT CHECK (guest_count IS NULL OR guest_count > 0),
  opened_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  closed_at TIMESTAMPTZ,
  opened_by UUID REFERENCES auth.users (id) ON DELETE SET NULL,
  closed_by UUID REFERENCES auth.users (id) ON DELETE SET NULL,
  notes TEXT NOT NULL DEFAULT '',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT table_sessions_status_check
    CHECK (status IN ('open', 'closed', 'cancelled')),
  CONSTRAINT table_sessions_open_closed_at_check
    CHECK (status <> 'open' OR closed_at IS NULL)
);

CREATE UNIQUE INDEX IF NOT EXISTS table_sessions_one_open_per_table_idx
  ON public.table_sessions (dining_table_id)
  WHERE status = 'open';

CREATE INDEX IF NOT EXISTS idx_table_sessions_pop_status
  ON public.table_sessions (pop_id, status, opened_at DESC);

CREATE INDEX IF NOT EXISTS idx_table_sessions_dining_table
  ON public.table_sessions (dining_table_id, opened_at DESC);

CREATE OR REPLACE FUNCTION public.table_sessions_same_pop_as_table ()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  p UUID;
BEGIN
  SELECT pop_id INTO p FROM public.dining_tables WHERE id = NEW.dining_table_id;
  IF p IS NULL THEN
    RAISE EXCEPTION 'table_sessions: mesa inexistente';
  END IF;
  IF p <> NEW.pop_id THEN
    RAISE EXCEPTION 'table_sessions: pop_id debe coincidir con la mesa';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS table_sessions_same_pop_as_table ON public.table_sessions;
CREATE TRIGGER table_sessions_same_pop_as_table
  BEFORE INSERT OR UPDATE OF pop_id, dining_table_id
  ON public.table_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.table_sessions_same_pop_as_table ();

-- ---------------------------------------------------------------------------
-- Ventas: canal operativo (POS / mesa / mostrador)
-- ---------------------------------------------------------------------------

ALTER TABLE public.sales
  ADD COLUMN IF NOT EXISTS sale_channel TEXT NOT NULL DEFAULT 'pos';

ALTER TABLE public.sales
  ADD COLUMN IF NOT EXISTS table_session_id UUID
  REFERENCES public.table_sessions (id) ON DELETE SET NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'sales_sale_channel_check'
  ) THEN
    ALTER TABLE public.sales
      ADD CONSTRAINT sales_sale_channel_check
      CHECK (sale_channel IN ('pos', 'table', 'counter'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_sales_pop_channel_sold_at
  ON public.sales (pop_id, sale_channel, sold_at DESC);

CREATE INDEX IF NOT EXISTS idx_sales_table_session
  ON public.sales (table_session_id)
  WHERE table_session_id IS NOT NULL;

-- ---------------------------------------------------------------------------
-- Servicios: catálogo + órdenes
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.service_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pop_id UUID NOT NULL REFERENCES public.pops (id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'variable' CHECK (kind IN ('fijo', 'variable')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT service_categories_pop_name_unique UNIQUE (pop_id, name)
);

CREATE INDEX IF NOT EXISTS idx_service_categories_pop
  ON public.service_categories (pop_id)
  WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS public.service_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pop_id UUID NOT NULL REFERENCES public.pops (id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.service_categories (id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  default_price NUMERIC(15, 2) NOT NULL DEFAULT 0 CHECK (default_price >= 0),
  duration_minutes INTEGER CHECK (duration_minutes IS NULL OR duration_minutes > 0),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  deleted_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT service_types_name_nonempty CHECK (char_length(trim(name)) > 0)
);

CREATE UNIQUE INDEX IF NOT EXISTS service_types_pop_name_active_idx
  ON public.service_types (pop_id, lower(trim(name)))
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_service_types_pop_active
  ON public.service_types (pop_id, is_active)
  WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS public.service_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pop_id UUID NOT NULL REFERENCES public.pops (id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients (id) ON DELETE SET NULL,
  customer_name TEXT,
  customer_tax_id TEXT,
  service_type_id UUID REFERENCES public.service_types (id) ON DELETE SET NULL,
  title TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  scheduled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  line_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal NUMERIC(15, 2) NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
  tax_total NUMERIC(15, 2) NOT NULL DEFAULT 0 CHECK (tax_total >= 0),
  discount_total NUMERIC(15, 2) NOT NULL DEFAULT 0 CHECK (discount_total >= 0),
  total NUMERIC(15, 2) NOT NULL DEFAULT 0 CHECK (total >= 0),
  currency TEXT NOT NULL DEFAULT 'ARS',
  status TEXT NOT NULL DEFAULT 'draft',
  voided_at TIMESTAMPTZ,
  void_reason TEXT,
  assigned_to UUID REFERENCES auth.users (id) ON DELETE SET NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by UUID NOT NULL REFERENCES auth.users (id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT service_orders_status_check
    CHECK (status IN ('draft', 'scheduled', 'in_progress', 'completed', 'cancelled', 'voided')),
  CONSTRAINT service_orders_line_items_is_array
    CHECK (jsonb_typeof(line_items) = 'array')
);

CREATE INDEX IF NOT EXISTS idx_service_orders_pop_status
  ON public.service_orders (pop_id, status, scheduled_at DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS idx_service_orders_pop_client
  ON public.service_orders (pop_id, client_id)
  WHERE client_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.service_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pop_id UUID NOT NULL REFERENCES public.pops (id) ON DELETE CASCADE,
  service_order_id UUID NOT NULL REFERENCES public.service_orders (id) ON DELETE RESTRICT,
  amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
  paid_at DATE NOT NULL,
  payment_method_id UUID REFERENCES public.payment_methods (id) ON DELETE SET NULL,
  accounting_entry_id UUID REFERENCES public.accounting_entries (id) ON DELETE SET NULL,
  reversal_accounting_entry_id UUID REFERENCES public.accounting_entries (id) ON DELETE SET NULL,
  notes TEXT,
  created_by UUID NOT NULL REFERENCES auth.users (id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_service_payments_order
  ON public.service_payments (service_order_id, paid_at DESC);

CREATE INDEX IF NOT EXISTS idx_service_payments_pop
  ON public.service_payments (pop_id);

-- ---------------------------------------------------------------------------
-- Alquileres: catálogo + contratos
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.rental_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pop_id UUID NOT NULL REFERENCES public.pops (id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  identifier TEXT,
  default_rate NUMERIC(15, 2) NOT NULL DEFAULT 0 CHECK (default_rate >= 0),
  billing_period TEXT NOT NULL DEFAULT 'daily',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  deleted_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT rental_assets_name_nonempty CHECK (char_length(trim(name)) > 0),
  CONSTRAINT rental_assets_billing_period_check
    CHECK (billing_period IN ('once', 'daily', 'weekly', 'monthly', 'custom'))
);

CREATE UNIQUE INDEX IF NOT EXISTS rental_assets_pop_name_active_idx
  ON public.rental_assets (pop_id, lower(trim(name)))
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_rental_assets_pop_active
  ON public.rental_assets (pop_id, is_active)
  WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS public.rentals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pop_id UUID NOT NULL REFERENCES public.pops (id) ON DELETE CASCADE,
  rental_asset_id UUID REFERENCES public.rental_assets (id) ON DELETE SET NULL,
  client_id UUID REFERENCES public.clients (id) ON DELETE SET NULL,
  customer_name TEXT,
  customer_tax_id TEXT,
  description TEXT NOT NULL DEFAULT '',
  amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL DEFAULT 'ARS',
  rental_start DATE NOT NULL,
  rental_end DATE,
  billing_period TEXT NOT NULL DEFAULT 'once',
  deposit_amount NUMERIC(15, 2) CHECK (deposit_amount IS NULL OR deposit_amount >= 0),
  status TEXT NOT NULL DEFAULT 'pending',
  voided_at TIMESTAMPTZ,
  void_reason TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by UUID NOT NULL REFERENCES auth.users (id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT rentals_period_check
    CHECK (billing_period IN ('once', 'daily', 'weekly', 'monthly', 'custom')),
  CONSTRAINT rentals_status_check
    CHECK (status IN ('pending', 'partial', 'paid', 'cancelled', 'voided')),
  CONSTRAINT rentals_date_range_check
    CHECK (rental_end IS NULL OR rental_end >= rental_start)
);

CREATE INDEX IF NOT EXISTS idx_rentals_pop_status
  ON public.rentals (pop_id, status, rental_start DESC);

CREATE INDEX IF NOT EXISTS idx_rentals_pop_client
  ON public.rentals (pop_id, client_id)
  WHERE client_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.rental_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pop_id UUID NOT NULL REFERENCES public.pops (id) ON DELETE CASCADE,
  rental_id UUID NOT NULL REFERENCES public.rentals (id) ON DELETE RESTRICT,
  amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
  paid_at DATE NOT NULL,
  payment_method_id UUID REFERENCES public.payment_methods (id) ON DELETE SET NULL,
  accounting_entry_id UUID REFERENCES public.accounting_entries (id) ON DELETE SET NULL,
  reversal_accounting_entry_id UUID REFERENCES public.accounting_entries (id) ON DELETE SET NULL,
  notes TEXT,
  created_by UUID NOT NULL REFERENCES auth.users (id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rental_payments_rental
  ON public.rental_payments (rental_id, paid_at DESC);

CREATE INDEX IF NOT EXISTS idx_rental_payments_pop
  ON public.rental_payments (pop_id);

-- ---------------------------------------------------------------------------
-- Triggers: coherencia pop_id y pagos (patrón expenses)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.service_types_same_pop_as_category ()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  p UUID;
BEGIN
  IF NEW.category_id IS NULL THEN
    RETURN NEW;
  END IF;
  SELECT pop_id INTO p FROM public.service_categories WHERE id = NEW.category_id;
  IF p IS NULL THEN
    RAISE EXCEPTION 'service_types: categoría inexistente';
  END IF;
  IF p <> NEW.pop_id THEN
    RAISE EXCEPTION 'service_types: pop_id debe coincidir con la categoría';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS service_types_same_pop_as_category ON public.service_types;
CREATE TRIGGER service_types_same_pop_as_category
  BEFORE INSERT OR UPDATE OF pop_id, category_id
  ON public.service_types
  FOR EACH ROW
  EXECUTE FUNCTION public.service_types_same_pop_as_category ();

CREATE OR REPLACE FUNCTION public.service_payments_same_pop_as_order ()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  p UUID;
  st TEXT;
BEGIN
  SELECT pop_id, status INTO p, st
  FROM public.service_orders
  WHERE id = NEW.service_order_id;
  IF p IS NULL THEN
    RAISE EXCEPTION 'service_payments: orden inexistente';
  END IF;
  IF p <> NEW.pop_id THEN
    RAISE EXCEPTION 'service_payments: pop_id debe coincidir con la orden';
  END IF;
  IF st = 'voided' THEN
    RAISE EXCEPTION 'service_payments: la orden está anulada';
  END IF;
  IF NEW.payment_method_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.payment_methods pm
      WHERE pm.id = NEW.payment_method_id AND pm.pop_id = NEW.pop_id
    ) THEN
      RAISE EXCEPTION 'service_payments: medio de pago inválido para este POP';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS service_payments_same_pop_as_order ON public.service_payments;
CREATE TRIGGER service_payments_same_pop_as_order
  BEFORE INSERT OR UPDATE OF pop_id, service_order_id, payment_method_id
  ON public.service_payments
  FOR EACH ROW
  EXECUTE FUNCTION public.service_payments_same_pop_as_order ();

CREATE OR REPLACE FUNCTION public.rental_payments_same_pop_as_rental ()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  p UUID;
  st TEXT;
BEGIN
  SELECT pop_id, status INTO p, st FROM public.rentals WHERE id = NEW.rental_id;
  IF p IS NULL THEN
    RAISE EXCEPTION 'rental_payments: alquiler inexistente';
  END IF;
  IF p <> NEW.pop_id THEN
    RAISE EXCEPTION 'rental_payments: pop_id debe coincidir con el alquiler';
  END IF;
  IF st = 'voided' THEN
    RAISE EXCEPTION 'rental_payments: el alquiler está anulado';
  END IF;
  IF NEW.payment_method_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.payment_methods pm
      WHERE pm.id = NEW.payment_method_id AND pm.pop_id = NEW.pop_id
    ) THEN
      RAISE EXCEPTION 'rental_payments: medio de pago inválido para este POP';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS rental_payments_same_pop_as_rental ON public.rental_payments;
CREATE TRIGGER rental_payments_same_pop_as_rental
  BEFORE INSERT OR UPDATE OF pop_id, rental_id, payment_method_id
  ON public.rental_payments
  FOR EACH ROW
  EXECUTE FUNCTION public.rental_payments_same_pop_as_rental ();

CREATE OR REPLACE FUNCTION public.rental_payments_cap_total ()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  rid UUID;
  cap NUMERIC(15, 2);
  prev NUMERIC(15, 2);
BEGIN
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  rid := NEW.rental_id;
  SELECT amount INTO cap FROM public.rentals WHERE id = rid FOR SHARE;
  IF cap IS NULL THEN
    RAISE EXCEPTION 'rental_payments_cap_total: alquiler inexistente';
  END IF;
  SELECT COALESCE(SUM(amount), 0) INTO prev
  FROM public.rental_payments
  WHERE rental_id = rid
    AND NOT (TG_OP = 'UPDATE' AND id = NEW.id);
  IF prev + NEW.amount > cap + 0.0001 THEN
    RAISE EXCEPTION 'rental_payments: la suma de cobros no puede superar el importe del alquiler';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS rental_payments_cap_total ON public.rental_payments;
CREATE TRIGGER rental_payments_cap_total
  BEFORE INSERT OR UPDATE OF amount, rental_id
  ON public.rental_payments
  FOR EACH ROW
  EXECUTE FUNCTION public.rental_payments_cap_total ();

CREATE OR REPLACE FUNCTION public.rentals_recompute_status_from_payments ()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  rid UUID;
  cap NUMERIC(15, 2);
  tot NUMERIC(15, 2);
  st TEXT;
BEGIN
  rid := COALESCE(NEW.rental_id, OLD.rental_id);
  SELECT amount, status INTO cap, st FROM public.rentals WHERE id = rid FOR UPDATE;
  IF st = 'voided' OR st = 'cancelled' THEN
    RETURN COALESCE(NEW, OLD);
  END IF;
  SELECT COALESCE(SUM(amount), 0) INTO tot FROM public.rental_payments WHERE rental_id = rid;
  IF tot <= 0 THEN
    UPDATE public.rentals SET status = 'pending', updated_at = now() WHERE id = rid;
  ELSIF tot + 0.0001 >= cap THEN
    UPDATE public.rentals SET status = 'paid', updated_at = now() WHERE id = rid;
  ELSE
    UPDATE public.rentals SET status = 'partial', updated_at = now() WHERE id = rid;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS rentals_recompute_status_from_payments ON public.rental_payments;
CREATE TRIGGER rentals_recompute_status_from_payments
  AFTER INSERT OR UPDATE OR DELETE
  ON public.rental_payments
  FOR EACH ROW
  EXECUTE FUNCTION public.rentals_recompute_status_from_payments ();

CREATE OR REPLACE FUNCTION public.service_payments_cap_total ()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  oid UUID;
  cap NUMERIC(15, 2);
  prev NUMERIC(15, 2);
BEGIN
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  oid := NEW.service_order_id;
  SELECT total INTO cap FROM public.service_orders WHERE id = oid FOR SHARE;
  IF cap IS NULL THEN
    RAISE EXCEPTION 'service_payments_cap_total: orden inexistente';
  END IF;
  SELECT COALESCE(SUM(amount), 0) INTO prev
  FROM public.service_payments
  WHERE service_order_id = oid
    AND NOT (TG_OP = 'UPDATE' AND id = NEW.id);
  IF prev + NEW.amount > cap + 0.0001 THEN
    RAISE EXCEPTION 'service_payments: la suma de cobros no puede superar el total de la orden';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS service_payments_cap_total ON public.service_payments;
CREATE TRIGGER service_payments_cap_total
  BEFORE INSERT OR UPDATE OF amount, service_order_id
  ON public.service_payments
  FOR EACH ROW
  EXECUTE FUNCTION public.service_payments_cap_total ();

-- updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at ()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS dining_tables_set_updated_at ON public.dining_tables;
CREATE TRIGGER dining_tables_set_updated_at
  BEFORE UPDATE ON public.dining_tables
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at ();

DROP TRIGGER IF EXISTS table_sessions_set_updated_at ON public.table_sessions;
CREATE TRIGGER table_sessions_set_updated_at
  BEFORE UPDATE ON public.table_sessions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at ();

DROP TRIGGER IF EXISTS service_types_set_updated_at ON public.service_types;
CREATE TRIGGER service_types_set_updated_at
  BEFORE UPDATE ON public.service_types
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at ();

DROP TRIGGER IF EXISTS service_orders_set_updated_at ON public.service_orders;
CREATE TRIGGER service_orders_set_updated_at
  BEFORE UPDATE ON public.service_orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at ();

DROP TRIGGER IF EXISTS rental_assets_set_updated_at ON public.rental_assets;
CREATE TRIGGER rental_assets_set_updated_at
  BEFORE UPDATE ON public.rental_assets
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at ();

DROP TRIGGER IF EXISTS rentals_set_updated_at ON public.rentals;
CREATE TRIGGER rentals_set_updated_at
  BEFORE UPDATE ON public.rentals
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at ();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

DO $$
DECLARE
  t TEXT;
  tables text[] := ARRAY[
    'dining_tables',
    'table_sessions',
    'service_categories',
    'service_types',
    'service_orders',
    'service_payments',
    'rental_assets',
    'rentals',
    'rental_payments'
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

-- ---------------------------------------------------------------------------
-- Comentarios
-- ---------------------------------------------------------------------------

COMMENT ON TABLE public.dining_tables IS
  'Catálogo de mesas del local. Configuración previa a operar por mesa.';

COMMENT ON TABLE public.table_sessions IS
  'Sesión operativa de una mesa (apertura, comandas, cierre). Una mesa solo puede tener una sesión open.';

COMMENT ON COLUMN public.sales.sale_channel IS
  'Canal: pos (caja), table (restaurante por mesa), counter (mostrador).';

COMMENT ON TABLE public.service_categories IS
  'Categorías del catálogo de servicios (configuración).';

COMMENT ON TABLE public.service_types IS
  'Tipos de servicio ofrecidos (catálogo / tarifario).';

COMMENT ON TABLE public.service_orders IS
  'Orden de servicio operativa. Cobros en service_payments.';

COMMENT ON TABLE public.rental_assets IS
  'Bienes disponibles para alquilar (catálogo).';

COMMENT ON TABLE public.rentals IS
  'Contrato u obligación de cobro por alquiler. Cobros en rental_payments.';
