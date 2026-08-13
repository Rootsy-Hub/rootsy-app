import type { ServiceTypeChargeAddonOption } from "@/app/[siteId]/[popId]/active-services/actions"
import type { ServiceDiscountMode } from "@/lib/serviceCatalogTypes"
import { formatMoneyInputForField } from "@/lib/moneyInput"
import type { ServiceChargeBillingScope } from "@/lib/serviceChargeTypes"
import { computeChargeAmount } from "@/lib/serviceChargeTypes"

export const SERVICE_CHARGE_ADDON_NONE_LABEL = "Sin adicional"

export function pruneOneTimeAddonIds(
  selectedAddonIds: string[],
  oneTimeAddonIds: string[],
): string[] {
  const allowed = new Set(selectedAddonIds)
  return oneTimeAddonIds.filter((id) => allowed.has(id))
}

export function formatAddonMultiSelectLabel(
  addons: Pick<ServiceTypeChargeAddonOption, "id" | "name">[],
  selectedIds: string[],
  noneLabel = SERVICE_CHARGE_ADDON_NONE_LABEL,
): string {
  if (selectedIds.length === 0) return noneLabel

  const names = selectedIds
    .map((id) => addons.find((addon) => addon.id === id)?.name?.trim())
    .filter((name): name is string => Boolean(name))

  if (names.length === 0) return noneLabel
  if (names.length === 1) return names[0]!
  if (names.length === 2) return `${names[0]}, ${names[1]}`
  return `${names.length} adicionales`
}

export function computeSelectedAddonsTotal(
  addons: Pick<ServiceTypeChargeAddonOption, "id" | "price">[],
  selectedIds: string[],
): number {
  const selected = new Set(selectedIds)
  return addons
    .filter((addon) => selected.has(addon.id))
    .reduce((sum, addon) => sum + (Number(addon.price) || 0), 0)
}

export type ChargeAddonTotals = {
  /** Adicionales de única vez (solo primer período en suscripción). */
  oneTimeAddons: number
  /** Adicionales recurrentes (cada período en suscripción). */
  recurringAddons: number
}

export function computeChargeAddonTotals(
  addons: Pick<ServiceTypeChargeAddonOption, "id" | "price">[],
  billingScope: ServiceChargeBillingScope,
  selectedAddonIds: string[],
  oneTimeAddonIds: string[],
): ChargeAddonTotals {
  const selected = new Set(selectedAddonIds)
  const oneTimeSet = new Set(
    billingScope === "subscription" ? oneTimeAddonIds : [],
  )

  let oneTimeAddons = 0
  let recurringAddons = 0

  for (const addon of addons) {
    if (!selected.has(addon.id)) continue
    const price = Number(addon.price) || 0
    if (billingScope === "subscription") {
      if (oneTimeSet.has(addon.id)) {
        oneTimeAddons += price
      } else {
        recurringAddons += price
      }
    } else {
      oneTimeAddons += price
    }
  }

  return { oneTimeAddons, recurringAddons }
}

function applyChargeDiscount(
  base: number,
  discountMode: ServiceDiscountMode | "none",
  discountValue: number | null,
): number {
  return computeChargeAmount(base, discountMode, discountValue)
}

/** Resumen compacto de precio para header/toolbox (incluye adicionales). */
export function formatChargeConfigPriceSummary(input: {
  unitPrice: number
  billingScope: ServiceChargeBillingScope
  addonTotals: ChargeAddonTotals
  discountMode?: ServiceDiscountMode | "none"
  discountValue?: number | null
}): string {
  const {
    unitPrice,
    billingScope,
    addonTotals,
    discountMode = "none",
    discountValue = null,
  } = input

  if (billingScope === "subscription") {
    const firstBase =
      unitPrice + addonTotals.recurringAddons + addonTotals.oneTimeAddons
    const recurringBase = unitPrice + addonTotals.recurringAddons
    const first = applyChargeDiscount(firstBase, discountMode, discountValue)
    const recurring = applyChargeDiscount(
      recurringBase,
      discountMode,
      discountValue,
    )

    if (Math.abs(first - recurring) < 0.005) {
      return formatMoneyInputForField(first)
    }
    return `${formatMoneyInputForField(first)} luego ${formatMoneyInputForField(recurring)}`
  }

  const total = applyChargeDiscount(
    unitPrice + addonTotals.oneTimeAddons + addonTotals.recurringAddons,
    discountMode,
    discountValue,
  )
  return formatMoneyInputForField(total)
}

export function resolveChargeAddonSelections(
  billingScope: ServiceChargeBillingScope,
  selectedAddonIds: string[],
  oneTimeAddonIds: string[],
): { addonId: string; chargeFrequency: "once" | "each_period" }[] {
  const oneTime = new Set(
    billingScope === "subscription" ? oneTimeAddonIds : selectedAddonIds,
  )

  return selectedAddonIds.map((addonId) => ({
    addonId,
    chargeFrequency: oneTime.has(addonId) ? "once" : "each_period",
  }))
}

export function selectedAddonsForDisplay(
  addons: ServiceTypeChargeAddonOption[],
  selectedIds: string[],
): ServiceTypeChargeAddonOption[] {
  const order = new Map(selectedIds.map((id, index) => [id, index]))
  return addons
    .filter((addon) => order.has(addon.id))
    .sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0))
}
