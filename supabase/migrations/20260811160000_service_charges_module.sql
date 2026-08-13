-- Servicios activos: cargos y cobros imputados

CREATE TABLE IF NOT EXISTS public.service_charges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pop_id uuid NOT NULL REFERENCES public.pops (id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES public.clients (id) ON DELETE RESTRICT,
  service_type_id uuid NOT NULL REFERENCES public.service_types (id) ON DELETE RESTRICT,
  charge_group_id uuid,
  sequence_index integer NOT NULL DEFAULT 0 CHECK (sequence_index >= 0),
  billing_scope text NOT NULL DEFAULT 'one_period',
  period_count integer NOT NULL DEFAULT 1 CHECK (period_count >= 1),
  payment_mode text NOT NULL DEFAULT 'one_time',
  period_start date,
  period_end date,
  unit_price numeric(15, 2) NOT NULL DEFAULT 0 CHECK (unit_price >= 0),
  discount_mode text NOT NULL DEFAULT 'none',
  discount_value numeric(15, 2),
  amount numeric(15, 2) NOT NULL CHECK (amount >= 0),
  due_date date NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  cancelled_at timestamptz,
  cancel_reason text,
  notes text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid NOT NULL REFERENCES auth.users (id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT service_charges_billing_scope_check
    CHECK (billing_scope IN ('one_period', 'multi_period', 'subscription')),
  CONSTRAINT service_charges_payment_mode_check
    CHECK (payment_mode IN ('one_time', 'subscription')),
  CONSTRAINT service_charges_discount_mode_check
    CHECK (discount_mode IN ('none', 'porcentaje', 'fijo')),
  CONSTRAINT service_charges_status_check
    CHECK (status IN ('pending', 'partial', 'paid', 'cancelled'))
);

CREATE INDEX IF NOT EXISTS idx_service_charges_pop_due
  ON public.service_charges (pop_id, due_date DESC);

CREATE INDEX IF NOT EXISTS idx_service_charges_pop_client
  ON public.service_charges (pop_id, client_id, due_date DESC);

CREATE INDEX IF NOT EXISTS idx_service_charges_pop_status
  ON public.service_charges (pop_id, status, due_date DESC);

CREATE INDEX IF NOT EXISTS idx_service_charges_group
  ON public.service_charges (charge_group_id, sequence_index)
  WHERE charge_group_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.service_charge_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pop_id uuid NOT NULL REFERENCES public.pops (id) ON DELETE CASCADE,
  service_charge_id uuid NOT NULL REFERENCES public.service_charges (id) ON DELETE RESTRICT,
  amount numeric(15, 2) NOT NULL CHECK (amount > 0),
  paid_at date NOT NULL,
  notes text,
  created_by uuid NOT NULL REFERENCES auth.users (id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_service_charge_payments_charge
  ON public.service_charge_payments (service_charge_id, paid_at DESC);

CREATE INDEX IF NOT EXISTS idx_service_charge_payments_pop
  ON public.service_charge_payments (pop_id);

-- Triggers updated_at
DROP TRIGGER IF EXISTS service_charges_set_updated_at ON public.service_charges;
CREATE TRIGGER service_charges_set_updated_at
  BEFORE UPDATE ON public.service_charges
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at ();

-- RLS
ALTER TABLE public.service_charges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_charge_payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS service_charges_select_pop ON public.service_charges;
CREATE POLICY service_charges_select_pop ON public.service_charges
  FOR SELECT TO authenticated
  USING (public.user_is_member_of_active_pop(pop_id));

DROP POLICY IF EXISTS service_charges_insert_pop ON public.service_charges;
CREATE POLICY service_charges_insert_pop ON public.service_charges
  FOR INSERT TO authenticated
  WITH CHECK (public.user_is_member_of_active_pop(pop_id));

DROP POLICY IF EXISTS service_charges_update_pop ON public.service_charges;
CREATE POLICY service_charges_update_pop ON public.service_charges
  FOR UPDATE TO authenticated
  USING (public.user_is_member_of_active_pop(pop_id))
  WITH CHECK (public.user_is_member_of_active_pop(pop_id));

DROP POLICY IF EXISTS service_charges_delete_pop ON public.service_charges;
CREATE POLICY service_charges_delete_pop ON public.service_charges
  FOR DELETE TO authenticated
  USING (public.user_is_member_of_active_pop(pop_id));

DROP POLICY IF EXISTS service_charge_payments_select_pop ON public.service_charge_payments;
CREATE POLICY service_charge_payments_select_pop ON public.service_charge_payments
  FOR SELECT TO authenticated
  USING (public.user_is_member_of_active_pop(pop_id));

DROP POLICY IF EXISTS service_charge_payments_insert_pop ON public.service_charge_payments;
CREATE POLICY service_charge_payments_insert_pop ON public.service_charge_payments
  FOR INSERT TO authenticated
  WITH CHECK (public.user_is_member_of_active_pop(pop_id));

DROP POLICY IF EXISTS service_charge_payments_update_pop ON public.service_charge_payments;
CREATE POLICY service_charge_payments_update_pop ON public.service_charge_payments
  FOR UPDATE TO authenticated
  USING (public.user_is_member_of_active_pop(pop_id))
  WITH CHECK (public.user_is_member_of_active_pop(pop_id));

DROP POLICY IF EXISTS service_charge_payments_delete_pop ON public.service_charge_payments;
CREATE POLICY service_charge_payments_delete_pop ON public.service_charge_payments
  FOR DELETE TO authenticated
  USING (public.user_is_member_of_active_pop(pop_id));

COMMENT ON TABLE public.service_charges IS
  'Cargo de servicio activo: cliente + tipo de servicio + período + monto a cobrar.';

COMMENT ON TABLE public.service_charge_payments IS
  'Cobros imputados a un cargo de servicio (parciales o totales).';

-- Permisos service_charges en roles owner/administrator
DO $$
DECLARE
  r RECORD;
  grants JSONB;
  new_perms JSONB := '["service_charges:read","service_charges:create","service_charges:update","service_charges:delete"]'::jsonb;
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

-- Módulo Servicios activos en catálogo JSON
UPDATE public._business_types
SET modules = jsonb_set(
  modules,
  '{shared,operar}',
  (modules->'shared'->'operar') || '[{"key":"active_services","label":"Servicios activos"}]'::jsonb
)
WHERE NOT COALESCE(modules->'shared'->'operar', '[]'::jsonb) @> '[{"key":"active_services"}]'::jsonb;
