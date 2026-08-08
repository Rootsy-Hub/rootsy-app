-- Job fin de trial: la cola debe reintentar cargos abiertos post-trial.

CREATE OR REPLACE FUNCTION public.list_pops_pending_trial_billing ()
RETURNS TABLE (
  pop_id uuid,
  subscription_id uuid,
  organization_id uuid,
  trial_ends_at timestamptz,
  scheduled_plan_id uuid,
  scheduled_billing_cycle text,
  organization_payment_method_id uuid,
  mp_payer_id text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT
    p.id AS pop_id,
    ps.id AS subscription_id,
    p.organization_id,
    ps.trial_ends_at,
    ps.scheduled_plan_id,
    ps.scheduled_billing_cycle,
    ps.organization_payment_method_id,
    o.mp_payer_id
  FROM public._pop_subscriptions ps
  JOIN public.pops p ON p.id = ps.pop_id
  JOIN public.organizations o ON o.id = p.organization_id
  WHERE ps.status = 'trial'
    AND ps.trial_ends_at IS NOT NULL
    AND ps.trial_ends_at <= now()
    AND ps.scheduled_plan_id IS NOT NULL
    AND ps.organization_payment_method_id IS NOT NULL
    AND NOT EXISTS (
      SELECT 1
      FROM public._subscription_charges c
      WHERE c.subscription_id = ps.id
        AND c.period_start >= ps.trial_ends_at
        AND c.status = 'paid'
    );
$function$;
