-- Reglas de vencimiento en catálogo, suscripciones y medio de pago en cobros

ALTER TABLE public.service_types
  ADD COLUMN IF NOT EXISTS payment_timing text NOT NULL DEFAULT 'end_of_period',
  ADD COLUMN IF NOT EXISTS due_days_after smallint NOT NULL DEFAULT 0;

UPDATE public.service_types
SET due_days_after = due_day
WHERE due_day IS NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'service_types_payment_timing_check'
  ) THEN
    ALTER TABLE public.service_types
      ADD CONSTRAINT service_types_payment_timing_check
      CHECK (payment_timing IN ('during_period', 'end_of_period'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'service_types_due_days_after_check'
  ) THEN
    ALTER TABLE public.service_types
      ADD CONSTRAINT service_types_due_days_after_check
      CHECK (due_days_after >= 0 AND due_days_after <= 365);
  END IF;
END $$;

ALTER TABLE public.service_types
  DROP CONSTRAINT IF EXISTS service_types_due_day_check;

ALTER TABLE public.service_types
  DROP COLUMN IF EXISTS due_day;

CREATE TABLE IF NOT EXISTS public.service_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pop_id uuid NOT NULL REFERENCES public.pops (id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES public.clients (id) ON DELETE RESTRICT,
  service_type_id uuid NOT NULL REFERENCES public.service_types (id) ON DELETE RESTRICT,
  status text NOT NULL DEFAULT 'active',
  period_start date NOT NULL,
  unit_price numeric(15, 2) NOT NULL DEFAULT 0 CHECK (unit_price >= 0),
  discount_mode text NOT NULL DEFAULT 'none',
  discount_value numeric(15, 2),
  notes text,
  cancelled_at timestamptz,
  cancel_reason text,
  created_by uuid NOT NULL REFERENCES auth.users (id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT service_subscriptions_status_check
    CHECK (status IN ('active', 'cancelled')),
  CONSTRAINT service_subscriptions_discount_mode_check
    CHECK (discount_mode IN ('none', 'porcentaje', 'fijo'))
);

CREATE INDEX IF NOT EXISTS idx_service_subscriptions_pop_client
  ON public.service_subscriptions (pop_id, client_id, status);

CREATE INDEX IF NOT EXISTS idx_service_subscriptions_pop_service
  ON public.service_subscriptions (pop_id, service_type_id, status);

ALTER TABLE public.service_charges
  ADD COLUMN IF NOT EXISTS subscription_id uuid REFERENCES public.service_subscriptions (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_service_charges_subscription
  ON public.service_charges (subscription_id)
  WHERE subscription_id IS NOT NULL;

ALTER TABLE public.service_charge_payments
  ADD COLUMN IF NOT EXISTS payment_kind text,
  ADD COLUMN IF NOT EXISTS treasury_account_id uuid REFERENCES public.treasury_accounts (id) ON DELETE SET NULL;

DROP TRIGGER IF EXISTS service_subscriptions_set_updated_at ON public.service_subscriptions;
CREATE TRIGGER service_subscriptions_set_updated_at
  BEFORE UPDATE ON public.service_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at ();

ALTER TABLE public.service_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS service_subscriptions_select_pop ON public.service_subscriptions;
CREATE POLICY service_subscriptions_select_pop ON public.service_subscriptions
  FOR SELECT TO authenticated
  USING (public.user_is_member_of_active_pop(pop_id));

DROP POLICY IF EXISTS service_subscriptions_insert_pop ON public.service_subscriptions;
CREATE POLICY service_subscriptions_insert_pop ON public.service_subscriptions
  FOR INSERT TO authenticated
  WITH CHECK (public.user_is_member_of_active_pop(pop_id));

DROP POLICY IF EXISTS service_subscriptions_update_pop ON public.service_subscriptions;
CREATE POLICY service_subscriptions_update_pop ON public.service_subscriptions
  FOR UPDATE TO authenticated
  USING (public.user_is_member_of_active_pop(pop_id))
  WITH CHECK (public.user_is_member_of_active_pop(pop_id));

DROP POLICY IF EXISTS service_subscriptions_delete_pop ON public.service_subscriptions;
CREATE POLICY service_subscriptions_delete_pop ON public.service_subscriptions
  FOR DELETE TO authenticated
  USING (public.user_is_member_of_active_pop(pop_id));

COMMENT ON COLUMN public.service_types.payment_timing IS
  'during_period = vence N días después del inicio del período; end_of_period = N días después del fin.';

COMMENT ON TABLE public.service_subscriptions IS
  'Suscripciones activas; un worker futuro generará cargos periódicos hasta cancelar.';
