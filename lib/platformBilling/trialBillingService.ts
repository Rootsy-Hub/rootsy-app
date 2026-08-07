import { createServiceRoleClient } from "@/utils/supabase/service-role"
import type { TrialBillingQueueItem } from "@/lib/platformBilling/types"

export type TrialConversionCharge = {
  chargeId: string
  balanceDue: number
  status: string
}

export async function listPopsPendingTrialBillingAsSystem(): Promise<
  TrialBillingQueueItem[]
> {
  const supabase = createServiceRoleClient()
  const { data, error } = await supabase.rpc("list_pops_pending_trial_billing")

  if (error || !data) {
    throw new Error(error?.message ?? "No se pudo listar trials pendientes")
  }

  return (data as Record<string, unknown>[]).map((row) => ({
    popId: String(row.pop_id ?? ""),
    subscriptionId: String(row.subscription_id ?? ""),
    organizationId: String(row.organization_id ?? ""),
    trialEndsAt: String(row.trial_ends_at ?? ""),
    scheduledPlanId: String(row.scheduled_plan_id ?? ""),
    scheduledBillingCycle:
      row.scheduled_billing_cycle === "yearly" ? "yearly" : "monthly",
    organizationPaymentMethodId: String(
      row.organization_payment_method_id ?? "",
    ),
    mpPayerId: row.mp_payer_id != null ? String(row.mp_payer_id) : null,
  }))
}

export async function findTrialConversionCharge(input: {
  subscriptionId: string
  trialEndsAt: string
}): Promise<TrialConversionCharge | null> {
  const supabase = createServiceRoleClient()
  const { data, error } = await supabase
    .from("_subscription_charges")
    .select("id, total, amount_paid, status")
    .eq("subscription_id", input.subscriptionId)
    .gte("period_start", input.trialEndsAt)
    .neq("status", "void")
    .order("due_at", { ascending: true })
    .limit(1)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  if (!data) return null

  const total = Number(data.total ?? 0)
  const amountPaid = Number(data.amount_paid ?? 0)
  const balanceDue = Math.max(total - amountPaid, 0)

  return {
    chargeId: String(data.id),
    balanceDue,
    status: String(data.status ?? "open"),
  }
}

export async function createTrialConversionCharge(input: {
  subscriptionId: string
  trialEndsAt: string
}): Promise<string> {
  const supabase = createServiceRoleClient()
  const { data, error } = await supabase.rpc(
    "create_subscription_charge_from_subscription",
    {
      p_subscription_id: input.subscriptionId,
      p_period_start: input.trialEndsAt,
      p_period_end: null,
      p_due_at: new Date().toISOString(),
      p_use_scheduled_plan: true,
      p_extra_lines: [],
      p_metadata: {
        trial_conversion: true,
        source: "trial_billing_job",
      },
    },
  )

  if (error) {
    throw new Error(error.message)
  }

  return String(data)
}

export async function getOrganizationPaymentMethodAsSystem(
  paymentMethodId: string,
): Promise<{
  externalPaymentMethodId: string
  provider: string
} | null> {
  const supabase = createServiceRoleClient()
  const { data, error } = await supabase
    .from("_organization_payment_methods")
    .select("external_payment_method_id, provider, is_active")
    .eq("id", paymentMethodId)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  if (!data || data.is_active !== true) return null

  return {
    externalPaymentMethodId: String(data.external_payment_method_id),
    provider: String(data.provider ?? ""),
  }
}

export async function getPopBillingOwnerEmail(popId: string): Promise<{
  email: string
  popName: string
} | null> {
  const supabase = createServiceRoleClient()
  const { data: pop, error: popError } = await supabase
    .from("pops")
    .select("name, owner_user_id")
    .eq("id", popId)
    .maybeSingle()

  if (popError || !pop?.owner_user_id) {
    return null
  }

  const { data: userData, error: userError } =
    await supabase.auth.admin.getUserById(String(pop.owner_user_id))

  if (userError || !userData.user?.email) {
    return null
  }

  return {
    email: userData.user.email,
    popName: String(pop.name ?? "POP"),
  }
}

export async function logSubscriptionBillingEvent(input: {
  popId: string
  subscriptionId: string
  eventType: string
  payload: Record<string, unknown>
}): Promise<void> {
  const supabase = createServiceRoleClient()
  const { error } = await supabase.from("_subscription_events").insert({
    pop_id: input.popId,
    subscription_id: input.subscriptionId,
    event_type: input.eventType,
    payload: input.payload,
    created_by: null,
  })

  if (error) {
    throw new Error(error.message)
  }
}

export async function hasTrialFailureAlertBeenSent(input: {
  subscriptionId: string
  trialEndsAt: string
}): Promise<boolean> {
  const supabase = createServiceRoleClient()
  const { data, error } = await supabase
    .from("_subscription_events")
    .select("id")
    .eq("subscription_id", input.subscriptionId)
    .eq("event_type", "trial_conversion_alert_sent")
    .gte("created_at", input.trialEndsAt)
    .limit(1)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  return Boolean(data)
}
