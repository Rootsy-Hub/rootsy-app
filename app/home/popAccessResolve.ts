import type {
  PopAccessModule,
  PopAccessModulePermissions,
  PopAccessSubscription,
} from "@/app/home/homeUserDataTypes"
import {
  POP_PAGES,
  type PopPageKey,
} from "@/lib/popPageCrudConstants"
import {
  formatPlanLimitValue,
  ROOTS_BUSINESS_TYPE_MODULES,
  ROOTS_SHARED_MODULES,
  type RootsBusinessTypeKey,
  type RootsModuleDefinition,
  type RootsModuleSectionKey,
} from "@/lib/rootsySubscriptionCatalog"

import {
  POP_ACCESS_MODULE_TO_PAGE_KEY,
} from "@/lib/popAccessModuleMap"

const EXTRA_MODULE_TARGET_SECTION: Record<
  string,
  Exclude<RootsModuleSectionKey, "extras">
> = {
  manufacturing: "operar",
  invoices: "administrar",
  printers: "configurar",
  chat: "configurar",
}

const EXTRA_MODULE_LABEL_OVERRIDE: Record<string, string> = {
  manufacturing: "Fabricar",
}

type ExtraModuleEntry = {
  key: string
  label: string
}

function parsePermissionGrants(raw: unknown): string[] {
  if (!Array.isArray(raw)) return []
  return raw.filter((entry): entry is string => typeof entry === "string")
}

function resolveModulePermissions(
  moduleKey: string,
  grants: readonly string[],
  isOwner: boolean,
): PopAccessModulePermissions | null {
  const pageKey = POP_ACCESS_MODULE_TO_PAGE_KEY[moduleKey]
  if (!pageKey || !(pageKey in POP_PAGES)) {
    return { read: true, create: false, update: false, delete: false }
  }
  const perms = POP_PAGES[pageKey].permissions
  if (isOwner) {
    return { read: true, create: true, update: true, delete: true }
  }
  return {
    read: grants.includes(perms.read),
    create: grants.includes(perms.create),
    update: grants.includes(perms.update),
    delete: grants.includes(perms.delete),
  }
}

function pushModules(
  out: PopAccessModule[],
  modules: RootsModuleDefinition[],
  section: Exclude<RootsModuleSectionKey, "extras">,
  grants: readonly string[],
  isOwner: boolean,
  isExtra: boolean,
) {
  for (const mod of modules) {
    out.push({
      key: mod.key,
      label: mod.label,
      section,
      isExtra,
      permissions: resolveModulePermissions(mod.key, grants, isOwner),
    })
  }
}

export function buildPopAccessEnabledModules(input: {
  businessTypeName: string
  extraModules: ExtraModuleEntry[]
  allModules: boolean
  permissionGrants: readonly string[]
  isOwner: boolean
}): PopAccessModule[] {
  const businessTypeKey = input.businessTypeName as RootsBusinessTypeKey
  const config = ROOTS_BUSINESS_TYPE_MODULES[businessTypeKey]
  if (!config) return []

  const out: PopAccessModule[] = []

  pushModules(
    out,
    ROOTS_SHARED_MODULES.operar,
    "operar",
    input.permissionGrants,
    input.isOwner,
    false,
  )
  pushModules(
    out,
    ROOTS_SHARED_MODULES.administrar,
    "administrar",
    input.permissionGrants,
    input.isOwner,
    false,
  )
  pushModules(
    out,
    ROOTS_SHARED_MODULES.configurar,
    "configurar",
    input.permissionGrants,
    input.isOwner,
    false,
  )
  pushModules(
    out,
    config.specific.operar,
    "operar",
    input.permissionGrants,
    input.isOwner,
    false,
  )
  pushModules(
    out,
    config.specific.administrar,
    "administrar",
    input.permissionGrants,
    input.isOwner,
    false,
  )
  pushModules(
    out,
    config.specific.configurar,
    "configurar",
    input.permissionGrants,
    input.isOwner,
    false,
  )

  const enabledExtraKeys = new Set(
    input.allModules
      ? config.extras.map((mod) => mod.key)
      : input.extraModules.map((mod) => mod.key),
  )

  for (const mod of config.extras) {
    if (!enabledExtraKeys.has(mod.key)) continue
    if (out.some((entry) => entry.key === mod.key)) continue
    const section = EXTRA_MODULE_TARGET_SECTION[mod.key] ?? "configurar"
    out.push({
      key: mod.key,
      label: EXTRA_MODULE_LABEL_OVERRIDE[mod.key] ?? mod.label,
      section,
      isExtra: true,
      permissions: resolveModulePermissions(
        mod.key,
        input.permissionGrants,
        input.isOwner,
      ),
    })
  }

  const showAllModules =
    input.allModules || businessTypeKey === "platform_full"
  if (showAllModules && !out.some((entry) => entry.key === "comandas")) {
    out.push({
      key: "comandas",
      label: "Comandas",
      section: "operar",
      isExtra: false,
      permissions: resolveModulePermissions(
        "comandas",
        input.permissionGrants,
        input.isOwner,
      ),
    })
  }

  return out
}

export function mapPopSubscriptionRow(
  subscription: Record<string, unknown>,
): PopAccessSubscription {
  return {
    status: String(subscription.status ?? ""),
    planName: String(subscription.plan_name ?? ""),
    planDisplayName: String(subscription.plan_display_name ?? ""),
    businessTypeName: String(subscription.business_type_name ?? ""),
    businessTypeDisplayName: String(
      subscription.business_type_display_name ?? "",
    ),
    daysRemaining:
      subscription.days_remaining != null
        ? Number(subscription.days_remaining)
        : null,
    isActive: Boolean(subscription.is_active),
    trialEndsAt: (subscription.trial_ends_at as string | null) ?? null,
    currentPeriodEnd:
      (subscription.current_period_end as string | null) ?? null,
  }
}

export function mapPopAccessLimits(subscription: Record<string, unknown>) {
  const maxUsers = Number(subscription.max_users ?? 0)
  const maxArticles = Number(subscription.max_articles ?? 0)
  const maxOps = Number(subscription.max_operations_per_month ?? 0)
  return {
    maxUsers,
    maxUsersLabel: formatPlanLimitValue(maxUsers),
    maxArticles,
    maxArticlesLabel: formatPlanLimitValue(maxArticles),
    maxOperationsPerMonth: maxOps,
    maxOperationsPerMonthLabel: formatPlanLimitValue(maxOps),
    allModules: Boolean(subscription.all_modules),
  }
}

export function parseExtraModuleEntries(raw: unknown): ExtraModuleEntry[] {
  if (!Array.isArray(raw)) return []
  return raw
    .filter(
      (entry): entry is Record<string, unknown> =>
        typeof entry === "object" && entry != null,
    )
    .map((entry) => ({
      key: String(entry.key ?? ""),
      label: String(entry.label ?? entry.key ?? ""),
    }))
    .filter((entry) => entry.key.length > 0)
}

export function parseRolePermissionGrants(raw: unknown): string[] {
  return parsePermissionGrants(raw)
}
