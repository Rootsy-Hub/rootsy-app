-- Bridge plataforma: mapeo plan SaaS → servicio del POP Rootsy + vínculos de operación.

CREATE TABLE IF NOT EXISTS public._platform_service_bindings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_name text NOT NULL,
  business_type_name text,
  billing_cycle text NOT NULL DEFAULT 'monthly',
  service_type_id uuid NOT NULL REFERENCES public.service_types (id) ON DELETE RESTRICT,
  is_active boolean NOT NULL DEFAULT true,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT _platform_service_bindings_billing_cycle_check
    CHECK (billing_cycle IN ('monthly', 'yearly'))
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_platform_service_bindings_key
  ON public._platform_service_bindings (
    plan_name,
    COALESCE(business_type_name, ''),
    billing_cycle
  );

CREATE INDEX IF NOT EXISTS idx_platform_service_bindings_active
  ON public._platform_service_bindings (is_active, plan_name);

COMMENT ON TABLE public._platform_service_bindings IS
  'Mapeo de planes de plataforma (_subscription_plans.name) a service_types del POP Rootsy.';

CREATE TABLE IF NOT EXISTS public._organization_rootsy_clients (
  organization_id uuid PRIMARY KEY REFERENCES public.organizations (id) ON DELETE CASCADE,
  rootsy_pop_id uuid NOT NULL REFERENCES public.pops (id) ON DELETE RESTRICT,
  client_id uuid NOT NULL REFERENCES public.clients (id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_organization_rootsy_clients_client
    UNIQUE (rootsy_pop_id, client_id)
);

COMMENT ON TABLE public._organization_rootsy_clients IS
  'Cliente en el POP Rootsy que representa a una organización suscriptora de la plataforma.';

CREATE TABLE IF NOT EXISTS public._platform_operation_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  external_payment_id text NOT NULL,
  customer_pop_id uuid NOT NULL REFERENCES public.pops (id) ON DELETE RESTRICT,
  organization_id uuid REFERENCES public.organizations (id) ON DELETE SET NULL,
  service_charge_id uuid NOT NULL REFERENCES public.service_charges (id) ON DELETE RESTRICT,
  service_charge_payment_id uuid REFERENCES public.service_charge_payments (id) ON DELETE SET NULL,
  amount numeric(15, 2) NOT NULL CHECK (amount >= 0),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_platform_operation_links_external_payment
    UNIQUE (external_payment_id)
);

CREATE INDEX IF NOT EXISTS idx_platform_operation_links_customer_pop
  ON public._platform_operation_links (customer_pop_id, created_at DESC);

COMMENT ON TABLE public._platform_operation_links IS
  'Idempotencia: un pago externo (p. ej. Mercado Pago) genera a lo sumo una operación en el POP Rootsy.';

DROP TRIGGER IF EXISTS _platform_service_bindings_set_updated_at ON public._platform_service_bindings;
CREATE TRIGGER _platform_service_bindings_set_updated_at
  BEFORE UPDATE ON public._platform_service_bindings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at ();

DROP TRIGGER IF EXISTS _organization_rootsy_clients_set_updated_at ON public._organization_rootsy_clients;
CREATE TRIGGER _organization_rootsy_clients_set_updated_at
  BEFORE UPDATE ON public._organization_rootsy_clients
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at ();
