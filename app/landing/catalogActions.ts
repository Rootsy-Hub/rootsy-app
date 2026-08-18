"use server"

import { landingPlanLimitLabel } from "@/lib/landingSubscriptionPlans"
import { createServiceRoleClient } from "@/utils/supabase/service-role"

export type PublicSubscriptionPlanRow = {
  id: string
  name: string
  displayName: string
  description: string | null
}

export type PublicBusinessTypeRow = {
  id: string
  name: string
  displayName: string
}

export type PublicPlanLimitRow = {
  id: string
  planName: string
  businessTypeName: string
  maxUsersLabel: string
  maxArticlesLabel: string
  maxOperationsPerMonthLabel: string
  priceMonthly: number
  priceYearly: number
  allModules: boolean
}

export type PublicSubscriptionCatalog = {
  plans: PublicSubscriptionPlanRow[]
  businessTypes: PublicBusinessTypeRow[]
  planLimits: PublicPlanLimitRow[]
}

export async function listPublicSubscriptionCatalog(): Promise<PublicSubscriptionCatalog> {
  const supabase = createServiceRoleClient()

  const [plansRes, typesRes, limitsRes] = await Promise.all([
    supabase
      .from("_subscription_plans")
      .select("id, name, display_name, description, sort_order, is_active, is_public")
      .eq("is_active", true)
      .eq("is_public", true)
      .order("sort_order", { ascending: true }),
    supabase
      .from("_business_types")
      .select("id, name, display_name, is_active, is_public")
      .eq("is_active", true)
      .eq("is_public", true)
      .order("display_name", { ascending: true }),
    supabase
      .from("_subscription_plan_limits")
      .select(
        `
        id,
        max_users,
        max_articles,
        max_operations_per_month,
        price_monthly,
        price_yearly,
        all_modules,
        plan:_subscription_plans ( name, is_active, is_public ),
        business_type:_business_types ( name, is_active, is_public )
      `,
      )
      .order("price_monthly", { ascending: true }),
  ])

  const plans = (plansRes.data ?? []).map((row) => ({
    id: String(row.id),
    name: String(row.name ?? ""),
    displayName: String(row.display_name ?? row.name ?? ""),
    description: row.description != null ? String(row.description) : null,
  }))

  const businessTypes = (typesRes.data ?? []).map((row) => ({
    id: String(row.id),
    name: String(row.name ?? ""),
    displayName: String(row.display_name ?? row.name ?? ""),
  }))

  const planLimits = (limitsRes.data ?? [])
    .map((row) => {
      const planRaw = Array.isArray(row.plan) ? row.plan[0] : row.plan
      const btRaw = Array.isArray(row.business_type)
        ? row.business_type[0]
        : row.business_type
      const plan = planRaw as
        | { name?: string; is_active?: boolean; is_public?: boolean }
        | null
      const businessType = btRaw as
        | { name?: string; is_active?: boolean; is_public?: boolean }
        | null
      if (!plan?.is_active || plan.is_public === false) return null
      if (!businessType?.is_active || businessType.is_public === false) {
        return null
      }
      return {
        id: String(row.id),
        planName: String(plan.name ?? ""),
        businessTypeName: String(businessType.name ?? ""),
        maxUsersLabel: landingPlanLimitLabel(Number(row.max_users ?? 0)),
        maxArticlesLabel: landingPlanLimitLabel(Number(row.max_articles ?? 0)),
        maxOperationsPerMonthLabel: landingPlanLimitLabel(
          Number(row.max_operations_per_month ?? 0),
        ),
        priceMonthly: Number(row.price_monthly ?? 0),
        priceYearly: Number(row.price_yearly ?? 0),
        allModules: Boolean(row.all_modules),
      }
    })
    .filter((row): row is PublicPlanLimitRow => row != null)

  return { plans, businessTypes, planLimits }
}
