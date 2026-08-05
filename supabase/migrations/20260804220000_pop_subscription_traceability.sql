-- Trazabilidad de subscripción: módulos extra en estado actual + convención de eventos.

ALTER TABLE public._pop_subscriptions
  ADD COLUMN IF NOT EXISTS extra_modules jsonb NOT NULL DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public._pop_subscriptions.extra_modules IS
  'Add-ons activos: [{key, label, price_monthly}]. Historial en _subscription_events.';

-- Demo completo en Rootsy Market (Arián): restaurant + trial → starter + extras → enterprise con prorrateo.
DO $$
DECLARE
  v_pop_id uuid := '32851b60-7fc4-4a00-87b5-27dab1739a4a';
  v_sub_id uuid := 'a3145103-cfcb-4fd9-a646-a7df08853aac';
  v_owner_id uuid := 'fb98be09-be06-4b81-bf50-339b78570783';
  v_bt_restaurant uuid := '8d607678-db2c-4f00-9856-fd71af5dfaf0';
  v_plan_trial uuid := '8c349218-476b-43fb-a834-e6d832f07c76';
  v_plan_starter uuid := 'db6e4257-796a-4eaf-8c86-07a7a7f1ee30';
  v_plan_enterprise uuid := '1a10aa59-d298-4b34-84a7-d215f01bb5c7';
  v_inv_starter uuid := gen_random_uuid();
  v_inv_enterprise uuid := gen_random_uuid();
  v_extras jsonb := '[
    {"key":"invoices","label":"Facturas","price_monthly":10},
    {"key":"chat","label":"Chat","price_monthly":12}
  ]'::jsonb;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.pops WHERE id = v_pop_id) THEN
    RAISE NOTICE 'POP demo no encontrado, omitiendo seed.';
    RETURN;
  END IF;

  DELETE FROM public._subscription_events WHERE pop_id = v_pop_id;
  DELETE FROM public._subscription_invoices WHERE pop_id = v_pop_id;

  UPDATE public.pops
  SET business_type_id = v_bt_restaurant
  WHERE id = v_pop_id;

  UPDATE public._pop_subscriptions
  SET
    plan_id = v_plan_enterprise,
    business_type_id = v_bt_restaurant,
    status = 'active',
    billing_cycle = 'monthly',
    trial_started_at = '2026-07-25 10:00:00+00',
    trial_ends_at = '2026-08-01 10:00:00+00',
    current_period_start = '2026-08-04 11:00:00+00',
    current_period_end = '2026-09-04 11:00:00+00',
    price_monthly = 251,
    price_yearly = 2510,
    extra_modules = v_extras,
    metadata = jsonb_build_object(
      'last_plan_change_at', '2026-08-04T11:00:00+00:00',
      'previous_plan', 'starter'
    ),
    updated_at = now()
  WHERE id = v_sub_id;

  INSERT INTO public._subscription_events (
    pop_id, subscription_id, event_type, payload, created_by, created_at
  ) VALUES
  (
    v_pop_id, v_sub_id, 'pop_created',
    jsonb_build_object(
      'pop_name', 'Rootsy Market',
      'business_type_name', 'restaurant',
      'business_type_display_name', 'Bar/Restaurantes',
      'owner_name', 'Arián Fernandez'
    ),
    v_owner_id, '2026-07-25 10:00:00+00'
  ),
  (
    v_pop_id, v_sub_id, 'trial_started',
    jsonb_build_object(
      'plan_name', 'free_trial',
      'plan_display_name', 'Prueba gratis',
      'business_type_display_name', 'Bar/Restaurantes',
      'period_start', '2026-07-25T10:00:00+00:00',
      'period_end', '2026-08-01T10:00:00+00:00'
    ),
    v_owner_id, '2026-07-25 10:00:00+00'
  ),
  (
    v_pop_id, v_sub_id, 'plan_changed',
    jsonb_build_object(
      'from_plan', 'free_trial',
      'from_plan_display_name', 'Prueba gratis',
      'to_plan', 'starter',
      'to_plan_display_name', 'Starter',
      'extra_modules', v_extras,
      'base_price_monthly', 49,
      'extras_price_monthly', 22,
      'total_price_monthly', 71,
      'period_start', '2026-07-27T14:30:00+00:00',
      'period_end', '2026-08-27T14:30:00+00:00'
    ),
    v_owner_id, '2026-07-27 14:30:00+00'
  ),
  (
    v_pop_id, v_sub_id, 'plan_changed',
    jsonb_build_object(
      'from_plan', 'starter',
      'from_plan_display_name', 'Starter',
      'to_plan', 'enterprise',
      'to_plan_display_name', 'Enterprise',
      'extra_modules', v_extras,
      'base_price_monthly', 229,
      'extras_price_monthly', 22,
      'total_price_monthly', 251,
      'period_start', '2026-08-04T11:00:00+00:00',
      'period_end', '2026-09-04T11:00:00+00:00',
      'proration', jsonb_build_object(
        'type', 'unused_starter_credit',
        'days_remaining', 20,
        'days_in_period', 30,
        'credit_amount', 47.33,
        'previous_period_total', 71
      )
    ),
    v_owner_id, '2026-08-04 11:00:00+00'
  );

  INSERT INTO public._subscription_invoices (
    id, pop_id, subscription_id, plan_id, business_type_id,
    period_start, period_end, amount, currency, status,
    payment_method, paid_at, metadata, created_at
  ) VALUES
  (
    v_inv_starter, v_pop_id, v_sub_id, v_plan_starter, v_bt_restaurant,
    '2026-07-27 14:30:00+00', '2026-08-27 14:30:00+00', 71, 'ARS', 'paid',
    'manual', '2026-07-27 15:10:00+00',
    jsonb_build_object(
      'line_items', jsonb_build_array(
        jsonb_build_object('label', 'Plan Starter', 'amount', 49),
        jsonb_build_object('label', 'Extra Facturas', 'amount', 10),
        jsonb_build_object('label', 'Extra Chat', 'amount', 12)
      ),
      'payment_reference', 'TRF-20260727-001'
    ),
    '2026-07-27 15:10:00+00'
  ),
  (
    v_inv_enterprise, v_pop_id, v_sub_id, v_plan_enterprise, v_bt_restaurant,
    '2026-08-04 11:00:00+00', '2026-09-04 11:00:00+00', 203.67, 'ARS', 'paid',
    'manual', '2026-08-04 11:45:00+00',
    jsonb_build_object(
      'line_items', jsonb_build_array(
        jsonb_build_object('label', 'Plan Enterprise', 'amount', 229),
        jsonb_build_object('label', 'Extra Facturas', 'amount', 10),
        jsonb_build_object('label', 'Extra Chat', 'amount', 12)
      ),
      'proration', jsonb_build_object(
        'type', 'unused_starter_credit',
        'days_remaining', 20,
        'days_in_period', 30,
        'credit_amount', 47.33,
        'previous_plan', 'starter',
        'previous_period_total', 71
      ),
      'gross_amount', 251,
      'payment_reference', 'TRF-20260804-001'
    ),
    '2026-08-04 11:45:00+00'
  );

  INSERT INTO public._subscription_events (
    pop_id, subscription_id, event_type, payload, created_by, created_at
  ) VALUES
  (
    v_pop_id, v_sub_id, 'payment_received',
    jsonb_build_object(
      'invoice_id', v_inv_starter,
      'amount', 71,
      'payment_method', 'manual',
      'payment_reference', 'TRF-20260727-001',
      'plan_display_name', 'Starter'
    ),
    v_owner_id, '2026-07-27 15:10:00+00'
  ),
  (
    v_pop_id, v_sub_id, 'payment_received',
    jsonb_build_object(
      'invoice_id', v_inv_enterprise,
      'amount', 203.67,
      'gross_amount', 251,
      'credit_amount', 47.33,
      'payment_method', 'manual',
      'payment_reference', 'TRF-20260804-001',
      'plan_display_name', 'Enterprise'
    ),
    v_owner_id, '2026-08-04 11:45:00+00'
  );
END $$;
