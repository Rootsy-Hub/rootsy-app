import { createServiceRoleClient } from "@/utils/supabase/service-role"
import { requireRootsyPlatformPopId } from "@/lib/rootsyPlatformPop"
import type { PlatformBillingCycle } from "@/lib/rootsyTenantOperations/types"

export async function resolvePlatformServiceBinding(input: {
  planName: string
  businessTypeName?: string | null
  billingCycle: PlatformBillingCycle
}): Promise<string | null> {
  const supabase = createServiceRoleClient()
  const planName = input.planName.trim()
  const billingCycle = input.billingCycle === "yearly" ? "yearly" : "monthly"
  const businessTypeName = input.businessTypeName?.trim() || null

  const candidates = businessTypeName
    ? [businessTypeName, null]
    : [null]

  for (const typeName of candidates) {
    let query = supabase
      .from("_platform_service_bindings")
      .select("service_type_id")
      .eq("plan_name", planName)
      .eq("billing_cycle", billingCycle)
      .eq("is_active", true)

    if (typeName) {
      query = query.eq("business_type_name", typeName)
    } else {
      query = query.is("business_type_name", null)
    }

    const { data, error } = await query.maybeSingle()
    if (error) {
      throw new Error(error.message)
    }
    if (data?.service_type_id) {
      return String(data.service_type_id)
    }
  }

  return null
}

export async function getRootsyPlatformPopActorUserId(): Promise<string> {
  const supabase = createServiceRoleClient()
  const popId = await requireRootsyPlatformPopId()
  const { data, error } = await supabase
    .from("pops")
    .select("owner_user_id")
    .eq("id", popId)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }
  if (!data?.owner_user_id) {
    throw new Error("El POP Rootsy no tiene owner_user_id.")
  }
  return String(data.owner_user_id)
}
