import { createServiceRoleClient } from "@/utils/supabase/service-role"
import type {
  CustomerPopBillingMirrorContext,
  PlatformBillingCycle,
} from "@/lib/rootsyTenantOperations/types"

function normalizeBillingCycle(value: unknown): PlatformBillingCycle {
  return value === "yearly" ? "yearly" : "monthly"
}

export async function getCustomerPopBillingMirrorContext(
  customerPopId: string,
): Promise<CustomerPopBillingMirrorContext | null> {
  const supabase = createServiceRoleClient()

  const { data: pop, error: popError } = await supabase
    .from("pops")
    .select("id, organization_id, owner_user_id, subscription_id")
    .eq("id", customerPopId)
    .maybeSingle()

  if (popError) {
    throw new Error(popError.message)
  }
  if (!pop?.organization_id || !pop.owner_user_id || !pop.subscription_id) {
    return null
  }

  const [{ data: org, error: orgError }, { data: subscription, error: subError }] =
    await Promise.all([
      supabase
        .from("organizations")
        .select("name")
        .eq("id", pop.organization_id)
        .maybeSingle(),
      supabase
        .from("_pop_subscriptions")
        .select(
          "status, billing_cycle, scheduled_billing_cycle, plan_id, scheduled_plan_id, business_type_id",
        )
        .eq("id", pop.subscription_id)
        .maybeSingle(),
    ])

  if (orgError) throw new Error(orgError.message)
  if (subError) throw new Error(subError.message)
  if (!subscription) return null

  const planIds = [
    subscription.plan_id,
    subscription.scheduled_plan_id,
  ].filter(Boolean) as string[]

  const typeIds = subscription.business_type_id
    ? [String(subscription.business_type_id)]
    : []

  const [{ data: plans }, { data: businessTypes }] = await Promise.all([
    planIds.length > 0
      ? supabase.from("_subscription_plans").select("id, name").in("id", planIds)
      : Promise.resolve({ data: [], error: null }),
    typeIds.length > 0
      ? supabase.from("_business_types").select("id, name").in("id", typeIds)
      : Promise.resolve({ data: [], error: null }),
  ])

  const planNameById = new Map(
    (plans ?? []).map((row) => [String(row.id), String(row.name ?? "")]),
  )
  const businessTypeName =
    businessTypes?.[0]?.name != null ? String(businessTypes[0].name) : null

  const activePlanName = subscription.plan_id
    ? (planNameById.get(String(subscription.plan_id)) ?? "")
    : ""
  const scheduledPlanName = subscription.scheduled_plan_id
    ? (planNameById.get(String(subscription.scheduled_plan_id)) ?? "")
    : ""

  const status = String(subscription.status ?? "")
  const useScheduled =
    status === "trial" ||
    activePlanName === "free_trial" ||
    (!activePlanName && Boolean(scheduledPlanName))

  const planName = useScheduled
    ? scheduledPlanName || activePlanName
    : activePlanName || scheduledPlanName

  if (!planName || planName === "free_trial") {
    return null
  }

  const billingCycle = normalizeBillingCycle(
    useScheduled
      ? subscription.scheduled_billing_cycle ?? subscription.billing_cycle
      : subscription.billing_cycle ?? subscription.scheduled_billing_cycle,
  )

  return {
    customerPopId,
    organizationId: String(pop.organization_id),
    organizationName: String(org?.name ?? "Organización"),
    ownerUserId: String(pop.owner_user_id),
    planName,
    businessTypeName,
    billingCycle,
  }
}
