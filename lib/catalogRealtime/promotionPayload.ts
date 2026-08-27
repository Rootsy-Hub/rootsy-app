import type { PromotionSnapshot } from "@/lib/popLocalDb/types"
import { promotionDumpRowToSnapshot } from "@/lib/popLocalDb/mapPromotion"

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : value == null ? fallback : String(value)
}

export function promotionSnapshotFromRealtimePayload(
  raw: unknown,
): PromotionSnapshot | null {
  if (!raw || typeof raw !== "object") return null
  const row = raw as Record<string, unknown>
  return promotionDumpRowToSnapshot({
    id: asString(row.id),
    name: asString(row.name),
    description: asString(row.description),
    imageUrl:
      typeof row.imageUrl === "string" && row.imageUrl.trim()
        ? row.imageUrl.trim()
        : null,
    promotionType: row.promotionType as PromotionSnapshot["promotionType"],
    pricingMode: row.pricingMode as PromotionSnapshot["pricingMode"],
    fixedPrice: row.fixedPrice as number | null,
    discountMode: row.discountMode as PromotionSnapshot["discountMode"],
    discountValue: row.discountValue as number | null,
    buyQuantity: row.buyQuantity as number | null,
    benefitQuantity: row.benefitQuantity as number | null,
    benefitDiscountPct: row.benefitDiscountPct as number | null,
    applyBenefitTo: row.applyBenefitTo as PromotionSnapshot["applyBenefitTo"],
    autoApply: Boolean(row.autoApply),
    showInMenu: Boolean(row.showInMenu),
    isActive: row.isActive !== false,
    sortOrder: Number(row.sortOrder ?? 0) || 0,
    validFrom: (row.validFrom as string | null) ?? null,
    validUntil: (row.validUntil as string | null) ?? null,
    validTimeStart: (row.validTimeStart as string | null) ?? null,
    validTimeEnd: (row.validTimeEnd as string | null) ?? null,
    scheduleDays: Array.isArray(row.scheduleDays)
      ? (row.scheduleDays as number[])
      : [],
    slotCount: 0,
    optionCount: 0,
    pricingSummary: "",
    scheduleSummary: "",
    slots: Array.isArray(row.slots)
      ? (row.slots as NonNullable<Parameters<typeof promotionDumpRowToSnapshot>[0]["slots"]>)
      : [],
  })
}

export function promotionIdFromRealtimeEvent(payload: Record<string, unknown>) {
  if (typeof payload.promotionId === "string" && payload.promotionId.trim()) {
    return payload.promotionId.trim()
  }
  const promotion = payload.promotion
  if (promotion && typeof promotion === "object" && "id" in promotion) {
    const id = (promotion as { id?: unknown }).id
    if (typeof id === "string" && id.trim()) return id.trim()
  }
  return null
}
