import type { MenuCatalogPromotion } from "@/app/[siteId]/[popId]/menu-catalog/actions"
import type {
  PromotionTableRow,
} from "@/app/[siteId]/[popId]/promotions/actions"
import type { SqlParams } from "@/lib/popLocalDb/database"
import type {
  PromotionSnapshot,
  PromotionSlotOptionSnap,
  PromotionSlotSnap,
} from "@/lib/popLocalDb/types"
import { isPromotionScheduleActiveNow } from "@/lib/promotionSchedule"
import {
  isPromotionBenefitTarget,
  isPromotionOptionKind,
  isPromotionPricingMode,
  isPromotionType,
  promotionPricingSummary,
  type PromotionDiscountMode,
} from "@/lib/promotionTypes"
import { filterPromotionForSale } from "@/lib/saleMenuCatalog"

type SqlPromotionRow = {
  id: unknown
  name: unknown
  description: unknown
  image_url: unknown
  promotion_type: unknown
  pricing_mode: unknown
  fixed_price: unknown
  discount_mode: unknown
  discount_value: unknown
  buy_quantity: unknown
  benefit_quantity: unknown
  benefit_discount_pct: unknown
  apply_benefit_to: unknown
  auto_apply: unknown
  show_in_menu: unknown
  is_active: unknown
  sort_order: unknown
  valid_from: unknown
  valid_until: unknown
  valid_time_start: unknown
  valid_time_end: unknown
  schedule_days: unknown
  slots: unknown
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : value == null ? fallback : String(value)
}

function asNullableString(value: unknown): string | null {
  const text = asString(value).trim()
  return text ? text : null
}

function asNumber(value: unknown, fallback = 0): number {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

function asNullableNumber(value: unknown): number | null {
  if (value == null || value === "") return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

function asBool(value: unknown, fallback = false): boolean {
  if (value == null) return fallback
  return value === 1 || value === true || value === "1"
}

function parseScheduleDays(raw: unknown): number[] {
  if (Array.isArray(raw)) {
    return raw.flatMap((value) => {
      const n = Number(value)
      return Number.isInteger(n) && n >= 0 && n <= 6 ? [n] : []
    })
  }
  if (typeof raw !== "string" || !raw.trim()) return []
  try {
    return parseScheduleDays(JSON.parse(raw) as unknown)
  } catch {
    return []
  }
}

function parseSlotOption(raw: unknown): PromotionSlotOptionSnap | null {
  if (!raw || typeof raw !== "object") return null
  const row = raw as Record<string, unknown>
  const id = asString(row.id).trim()
  const refId = asString(row.refId).trim()
  const kindRaw = asString(row.kind)
  if (!id || !refId || !isPromotionOptionKind(kindRaw)) return null
  return {
    id,
    kind: kindRaw,
    refId,
    name: asString(row.name),
    salePrice: asNumber(row.salePrice),
    iva: asNumber(row.iva),
  }
}

function parseSlots(raw: unknown): PromotionSlotSnap[] {
  const list = (() => {
    if (Array.isArray(raw)) return raw
    if (typeof raw === "string" && raw.trim()) {
      try {
        const parsed = JSON.parse(raw) as unknown
        return Array.isArray(parsed) ? parsed : []
      } catch {
        return []
      }
    }
    return []
  })()
  return list.flatMap((item, index) => {
    if (!item || typeof item !== "object") return []
    const row = item as Record<string, unknown>
    const id = asString(row.id).trim()
    if (!id) return []
    const options = Array.isArray(row.options)
      ? row.options.flatMap((option) => {
          const parsed = parseSlotOption(option)
          return parsed ? [parsed] : []
        })
      : []
    return [
      {
        id,
        label: asString(row.label),
        quantity: Math.max(1, asNumber(row.quantity, 1)),
        sortOrder: asNumber(row.sortOrder, index),
        options,
      },
    ]
  })
}

function discountModeFrom(raw: unknown): PromotionDiscountMode | null {
  return raw === "porcentaje" || raw === "fijo" ? raw : null
}

export function promotionDumpRowToSnapshot(
  row: PromotionTableRow,
): PromotionSnapshot | null {
  const id = row.id?.trim()
  const name = row.name?.trim()
  if (!id || !name || !isPromotionType(row.promotionType)) return null
  const pricingMode = isPromotionPricingMode(row.pricingMode)
    ? row.pricingMode
    : "fixed_total"
  return {
    id,
    name,
    description: row.description ?? "",
    imageUrl: row.imageUrl,
    promotionType: row.promotionType,
    pricingMode,
    fixedPrice: row.fixedPrice,
    discountMode: discountModeFrom(row.discountMode),
    discountValue: row.discountValue,
    buyQuantity: row.buyQuantity,
    benefitQuantity: row.benefitQuantity,
    benefitDiscountPct: row.benefitDiscountPct,
    applyBenefitTo: isPromotionBenefitTarget(String(row.applyBenefitTo ?? ""))
      ? row.applyBenefitTo
      : null,
    autoApply: Boolean(row.autoApply),
    showInMenu: Boolean(row.showInMenu),
    isActive: Boolean(row.isActive),
    sortOrder: Number(row.sortOrder ?? 0) || 0,
    validFrom: row.validFrom,
    validUntil: row.validUntil,
    validTimeStart: row.validTimeStart,
    validTimeEnd: row.validTimeEnd,
    scheduleDays: Array.isArray(row.scheduleDays) ? row.scheduleDays : [],
    slots: parseSlots(row.slots),
  }
}

export function sqlPromotionRowToSnapshot(
  row: SqlPromotionRow,
): PromotionSnapshot {
  const promotionTypeRaw = asString(row.promotion_type, "combo")
  const pricingModeRaw = asString(row.pricing_mode, "fixed_total")
  const applyRaw = asString(row.apply_benefit_to)
  return {
    id: asString(row.id),
    name: asString(row.name),
    description: asString(row.description),
    imageUrl: asNullableString(row.image_url),
    promotionType: isPromotionType(promotionTypeRaw) ? promotionTypeRaw : "combo",
    pricingMode: isPromotionPricingMode(pricingModeRaw)
      ? pricingModeRaw
      : "fixed_total",
    fixedPrice: asNullableNumber(row.fixed_price),
    discountMode: discountModeFrom(row.discount_mode),
    discountValue: asNullableNumber(row.discount_value),
    buyQuantity: asNullableNumber(row.buy_quantity),
    benefitQuantity: asNullableNumber(row.benefit_quantity),
    benefitDiscountPct: asNullableNumber(row.benefit_discount_pct),
    applyBenefitTo: isPromotionBenefitTarget(applyRaw) ? applyRaw : null,
    autoApply: asBool(row.auto_apply),
    showInMenu: asBool(row.show_in_menu),
    isActive: asBool(row.is_active, true),
    sortOrder: asNumber(row.sort_order),
    validFrom: asNullableString(row.valid_from),
    validUntil: asNullableString(row.valid_until),
    validTimeStart: asNullableString(row.valid_time_start),
    validTimeEnd: asNullableString(row.valid_time_end),
    scheduleDays: parseScheduleDays(row.schedule_days),
    slots: parseSlots(row.slots),
  }
}

export function promotionSnapshotBindValues(
  row: PromotionSnapshot,
  updatedAt = new Date().toISOString(),
): SqlParams {
  return [
    row.id,
    row.name,
    row.description,
    row.imageUrl,
    row.promotionType,
    row.pricingMode,
    row.fixedPrice,
    row.discountMode,
    row.discountValue,
    row.buyQuantity,
    row.benefitQuantity,
    row.benefitDiscountPct,
    row.applyBenefitTo,
    row.autoApply ? 1 : 0,
    row.showInMenu ? 1 : 0,
    row.isActive ? 1 : 0,
    row.sortOrder,
    row.validFrom,
    row.validUntil,
    row.validTimeStart,
    row.validTimeEnd,
    JSON.stringify(row.scheduleDays),
    JSON.stringify(row.slots),
    updatedAt,
  ]
}

export function promotionSnapshotToMenuCatalog(
  row: PromotionSnapshot,
): MenuCatalogPromotion {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    imageUrl: row.imageUrl,
    promotionType: row.promotionType,
    pricingMode: row.pricingMode,
    fixedPrice: row.fixedPrice,
    discountMode: row.discountMode,
    discountValue: row.discountValue,
    buyQuantity: row.buyQuantity,
    benefitQuantity: row.benefitQuantity,
    benefitDiscountPct: row.benefitDiscountPct,
    applyBenefitTo: row.applyBenefitTo,
    autoApply: row.autoApply,
    showInMenu: row.showInMenu,
    slots: row.slots.map((slot) => ({
      id: slot.id,
      label: slot.label,
      quantity: slot.quantity,
      options: slot.options.map((option) => ({
        kind: option.kind,
        refId: option.refId,
        name: option.name,
        salePrice: option.salePrice,
        iva: option.iva,
      })),
    })),
    pricingLabel: promotionPricingSummary(row),
  }
}

export function splitLocalPromotionsForSale(
  rows: PromotionSnapshot[],
  at = new Date(),
): {
  combos: MenuCatalogPromotion[]
  quantityDeals: MenuCatalogPromotion[]
} {
  const visible = rows.filter(
    (row) =>
      row.isActive &&
      isPromotionScheduleActiveNow(
        {
          validFrom: row.validFrom,
          validUntil: row.validUntil,
          validTimeStart: row.validTimeStart,
          validTimeEnd: row.validTimeEnd,
          scheduleDays: row.scheduleDays,
        },
        at,
      ),
  )
  const combos = visible
    .filter((row) => row.promotionType === "combo" && row.showInMenu)
    .map(promotionSnapshotToMenuCatalog)
    .map(filterPromotionForSale)
    .filter((row): row is MenuCatalogPromotion => row != null)
  const quantityDeals = visible
    .filter((row) => row.promotionType === "quantity_deal" && row.autoApply)
    .map(promotionSnapshotToMenuCatalog)
  return { combos, quantityDeals }
}
