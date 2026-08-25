"use server"

import { requireBackofficeAccess } from "@/app/backoffice/backofficeAuth"
import {
  getRootsyPlatformPopId,
  isRootsyPlatformPopConfigured,
} from "@/lib/rootsyPlatformPop"
import { createServiceRoleClient } from "@/utils/supabase/service-role"

async function backofficeDb() {
  await requireBackofficeAccess()
  return createServiceRoleClient()
}

export type BackofficePlatformServiceBindingRow = {
  id: string
  planName: string
  planDisplayName: string
  businessTypeName: string | null
  businessTypeDisplayName: string | null
  billingCycle: "monthly" | "yearly"
  serviceTypeId: string
  serviceTypeName: string | null
  isActive: boolean
  notes: string | null
}

export type BackofficeBridgePlanOption = {
  name: string
  displayName: string
}

export type BackofficeBridgeBusinessTypeOption = {
  name: string
  displayName: string
}

export type BackofficeBridgeContext = {
  rootsyPopId: string | null
  rootsyPopConfigured: boolean
  rootsyPopName: string | null
  rootsyPopSiteId: string | null
  bindings: BackofficePlatformServiceBindingRow[]
  planOptions: BackofficeBridgePlanOption[]
  businessTypeOptions: BackofficeBridgeBusinessTypeOption[]
}

export async function getBackofficeBridgeContext(): Promise<BackofficeBridgeContext> {
  const supabase = await backofficeDb()
  const rootsyPopId = getRootsyPlatformPopId()

  const [plansRes, typesRes, bindingsRes, popRes] = await Promise.all([
    supabase
      .from("_subscription_plans")
      .select("name, display_name, is_active")
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
    supabase
      .from("_business_types")
      .select("name, display_name, is_active")
      .eq("is_active", true)
      .order("display_name", { ascending: true }),
    supabase
      .from("_platform_service_bindings")
      .select(
        "id, plan_name, business_type_name, billing_cycle, service_type_id, is_active, notes",
      )
      .order("plan_name", { ascending: true })
      .order("billing_cycle", { ascending: true }),
    rootsyPopId
      ? supabase
          .from("pops")
          .select("id, name, site_id")
          .eq("id", rootsyPopId)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ])

  const planOptions = (plansRes.data ?? [])
    .filter((row) => !["free_trial", "rootsy_internal"].includes(String(row.name)))
    .map((row) => ({
      name: String(row.name ?? ""),
      displayName: String(row.display_name ?? row.name ?? ""),
    }))

  const businessTypeOptions = (typesRes.data ?? [])
    .filter((row) => String(row.name) !== "platform_full")
    .map((row) => ({
      name: String(row.name ?? ""),
      displayName: String(row.display_name ?? row.name ?? ""),
    }))

  const planDisplayByName = new Map(
    planOptions.map((plan) => [plan.name, plan.displayName]),
  )
  const businessDisplayByName = new Map(
    businessTypeOptions.map((type) => [type.name, type.displayName]),
  )

  const serviceTypeIds = [
    ...new Set(
      (bindingsRes.data ?? []).map((row) => String(row.service_type_id)),
    ),
  ]

  const serviceNameById = new Map<string, string>()
  if (rootsyPopId && serviceTypeIds.length > 0) {
    const { data: services } = await supabase
      .from("service_types")
      .select("id, name")
      .eq("pop_id", rootsyPopId)
      .in("id", serviceTypeIds)
    for (const row of services ?? []) {
      serviceNameById.set(String(row.id), String(row.name ?? ""))
    }
  }

  const bindings: BackofficePlatformServiceBindingRow[] = (
    bindingsRes.data ?? []
  ).map((row) => {
    const planName = String(row.plan_name ?? "")
    const businessTypeName =
      row.business_type_name != null ? String(row.business_type_name) : null
    const billingCycle: BackofficePlatformServiceBindingRow["billingCycle"] =
      row.billing_cycle === "yearly" ? "yearly" : "monthly"
    const serviceTypeId = String(row.service_type_id)

    return {
      id: String(row.id),
      planName,
      planDisplayName: planDisplayByName.get(planName) ?? planName,
      businessTypeName,
      businessTypeDisplayName: businessTypeName
        ? (businessDisplayByName.get(businessTypeName) ?? businessTypeName)
        : null,
      billingCycle,
      serviceTypeId,
      serviceTypeName: serviceNameById.get(serviceTypeId) ?? null,
      isActive: Boolean(row.is_active),
      notes: row.notes != null ? String(row.notes) : null,
    }
  })

  return {
    rootsyPopId,
    rootsyPopConfigured: isRootsyPlatformPopConfigured(),
    rootsyPopName: popRes.data?.name != null ? String(popRes.data.name) : null,
    rootsyPopSiteId:
      popRes.data?.site_id != null ? String(popRes.data.site_id) : null,
    bindings,
    planOptions,
    businessTypeOptions,
  }
}

export type UpsertBackofficePlatformBindingInput = {
  id?: string | null
  planName: string
  businessTypeName?: string | null
  billingCycle: "monthly" | "yearly"
  serviceTypeId: string
  isActive?: boolean
  notes?: string | null
}

export async function upsertBackofficePlatformBinding(
  input: UpsertBackofficePlatformBindingInput,
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const supabase = await backofficeDb()
    const rootsyPopId = getRootsyPlatformPopId()
    if (!rootsyPopId) {
      return {
        success: false,
        error: "ROOTSY_POP_ID no está configurado en el entorno.",
      }
    }

    const planName = input.planName.trim()
    const serviceTypeId = input.serviceTypeId.trim()
    const businessTypeName = input.businessTypeName?.trim() || null
    const billingCycle = input.billingCycle === "yearly" ? "yearly" : "monthly"

    if (!planName) {
      return { success: false, error: "Elegí un plan." }
    }
    if (!/^[0-9a-f-]{36}$/i.test(serviceTypeId)) {
      return { success: false, error: "service_type_id inválido." }
    }

    const { data: serviceRow } = await supabase
      .from("service_types")
      .select("id")
      .eq("id", serviceTypeId)
      .eq("pop_id", rootsyPopId)
      .is("deleted_at", null)
      .maybeSingle()

    if (!serviceRow?.id) {
      return {
        success: false,
        error: "El servicio no existe en el POP Rootsy configurado.",
      }
    }

    const payload = {
      plan_name: planName,
      business_type_name: businessTypeName,
      billing_cycle: billingCycle,
      service_type_id: serviceTypeId,
      is_active: input.isActive ?? true,
      notes: input.notes?.trim() || null,
    }

    if (input.id?.trim()) {
      const { error } = await supabase
        .from("_platform_service_bindings")
        .update(payload)
        .eq("id", input.id.trim())
      if (error) return { success: false, error: error.message }
      return { success: true }
    }

    const { error } = await supabase
      .from("_platform_service_bindings")
      .insert(payload)
    if (error) return { success: false, error: error.message }
    return { success: true }
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    }
  }
}

export async function deleteBackofficePlatformBinding(
  bindingId: string,
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const supabase = await backofficeDb()
    const id = bindingId.trim()
    if (!/^[0-9a-f-]{36}$/i.test(id)) {
      return { success: false, error: "Binding inválido." }
    }
    const { error } = await supabase
      .from("_platform_service_bindings")
      .delete()
      .eq("id", id)
    if (error) return { success: false, error: error.message }
    return { success: true }
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    }
  }
}
