export type PromotionType = "combo" | "quantity_deal"

export type PromotionPricingMode = "fixed_total" | "percent_off" | "fixed_off"

export type PromotionDiscountMode = "porcentaje" | "fijo"

export type PromotionBenefitTarget = "cheapest" | "most_expensive"

export type PromotionOptionKind = "article" | "recipe"

export const PROMOTION_TYPES: PromotionType[] = ["combo", "quantity_deal"]

export const PROMOTION_PRICING_MODES: PromotionPricingMode[] = [
  "fixed_total",
  "percent_off",
  "fixed_off",
]

export const PROMOTION_BENEFIT_TARGETS: PromotionBenefitTarget[] = [
  "cheapest",
  "most_expensive",
]

export const PROMOTION_TYPE_LABEL: Record<PromotionType, string> = {
  combo: "Combo",
  quantity_deal: "Por cantidad",
}

export const PROMOTION_PRICING_MODE_LABEL: Record<PromotionPricingMode, string> = {
  fixed_total: "Precio fijo total",
  percent_off: "Porcentaje de descuento",
  fixed_off: "Monto fijo de descuento",
}

export const PROMOTION_BENEFIT_TARGET_LABEL: Record<
  PromotionBenefitTarget,
  string
> = {
  cheapest: "El más barato",
  most_expensive: "El más caro",
}

export const PROMOTION_OPTION_KIND_LABEL: Record<PromotionOptionKind, string> = {
  article: "Producto",
  recipe: "Receta",
}

/** 0 = domingo … 6 = sábado (JS Date.getDay()). */
export const PROMOTION_WEEKDAY_OPTIONS = [
  { value: 1, label: "Lun" },
  { value: 2, label: "Mar" },
  { value: 3, label: "Mié" },
  { value: 4, label: "Jue" },
  { value: 5, label: "Vie" },
  { value: 6, label: "Sáb" },
  { value: 0, label: "Dom" },
] as const

export const ALL_PROMOTION_WEEKDAYS = [0, 1, 2, 3, 4, 5, 6] as const

export function isPromotionType(v: string): v is PromotionType {
  return (PROMOTION_TYPES as readonly string[]).includes(v)
}

export function isPromotionPricingMode(v: string): v is PromotionPricingMode {
  return (PROMOTION_PRICING_MODES as readonly string[]).includes(v)
}

export function isPromotionBenefitTarget(v: string): v is PromotionBenefitTarget {
  return (PROMOTION_BENEFIT_TARGETS as readonly string[]).includes(v)
}

export function isPromotionOptionKind(v: string): v is PromotionOptionKind {
  return v === "article" || v === "recipe"
}

export function promotionTypeLabel(type: PromotionType): string {
  return PROMOTION_TYPE_LABEL[type]
}

export function promotionPricingSummary(input: {
  promotionType: PromotionType
  pricingMode: PromotionPricingMode
  fixedPrice: number | null
  discountMode: PromotionDiscountMode | null
  discountValue: number | null
  buyQuantity: number | null
  benefitQuantity: number | null
  benefitDiscountPct: number | null
  applyBenefitTo: PromotionBenefitTarget | null
}): string {
  if (input.promotionType === "quantity_deal") {
    const buy = input.buyQuantity ?? 0
    const benefit = input.benefitQuantity ?? 0
    const pct = input.benefitDiscountPct ?? 0
    const target = input.applyBenefitTo
      ? PROMOTION_BENEFIT_TARGET_LABEL[input.applyBenefitTo]
      : "—"
    if (pct >= 100) {
      return `${buy}x${buy - benefit} (${target.toLowerCase()})`
    }
    return `${buy}+${benefit} al ${pct}% (${target.toLowerCase()})`
  }
  if (input.pricingMode === "fixed_total") {
    return `Precio fijo $${(input.fixedPrice ?? 0).toLocaleString("es-AR")}`
  }
  if (input.pricingMode === "percent_off") {
    return `${input.discountValue ?? 0}% off por ítem`
  }
  return `$${(input.discountValue ?? 0).toLocaleString("es-AR")} off por ítem`
}
