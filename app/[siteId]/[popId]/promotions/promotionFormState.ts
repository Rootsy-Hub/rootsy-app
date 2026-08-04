import {
  createEmptySlotLine,
  slotLinesFromDetail,
  slotLinesToInput,
  type PromotionSlotFormLine,
} from "@/app/[siteId]/[popId]/promotions/components/PromotionSlotEditor"
import { QUANTITY_DEAL_SLOT_LABEL } from "@/app/[siteId]/[popId]/promotions/promotionConstants"
import type { PromotionDetail } from "@/app/[siteId]/[popId]/promotions/actions"
import {
  ALL_PROMOTION_WEEKDAYS,
  type PromotionBenefitTarget,
  type PromotionPricingMode,
  type PromotionType,
} from "@/lib/promotionTypes"

export type PromotionFormState = {
  name: string
  description: string
  imageUrl: string
  promotionType: PromotionType
  pricingMode: PromotionPricingMode
  fixedPrice: string
  discountMode: "porcentaje" | "fijo"
  discountValue: string
  buyQuantity: string
  benefitQuantity: string
  benefitDiscountPct: string
  applyBenefitTo: PromotionBenefitTarget
  autoApply: boolean
  showInMenu: boolean
  isActive: boolean
  validFrom: string
  validUntil: string
  validTimeStart: string
  validTimeEnd: string
  scheduleDays: number[]
  slots: PromotionSlotFormLine[]
}

export function defaultPromotionFormState(): PromotionFormState {
  return {
    name: "",
    description: "",
    imageUrl: "",
    promotionType: "combo",
    pricingMode: "fixed_total",
    fixedPrice: "",
    discountMode: "porcentaje",
    discountValue: "",
    buyQuantity: "2",
    benefitQuantity: "1",
    benefitDiscountPct: "100",
    applyBenefitTo: "cheapest",
    autoApply: true,
    showInMenu: true,
    isActive: true,
    validFrom: "",
    validUntil: "",
    validTimeStart: "",
    validTimeEnd: "",
    scheduleDays: [...ALL_PROMOTION_WEEKDAYS],
    slots: [createEmptySlotLine()],
  }
}

export function promotionFormFromDetail(
  promotion: PromotionDetail,
): PromotionFormState {
  return {
    name: promotion.name,
    description: promotion.description,
    imageUrl: promotion.imageUrl ?? "",
    promotionType: promotion.promotionType,
    pricingMode: promotion.pricingMode,
    fixedPrice:
      promotion.fixedPrice != null ? String(promotion.fixedPrice) : "",
    discountMode: promotion.discountMode ?? "porcentaje",
    discountValue:
      promotion.discountValue != null ? String(promotion.discountValue) : "",
    buyQuantity:
      promotion.buyQuantity != null ? String(promotion.buyQuantity) : "2",
    benefitQuantity:
      promotion.benefitQuantity != null
        ? String(promotion.benefitQuantity)
        : "1",
    benefitDiscountPct:
      promotion.benefitDiscountPct != null
        ? String(promotion.benefitDiscountPct)
        : "100",
    applyBenefitTo: promotion.applyBenefitTo ?? "cheapest",
    autoApply: promotion.autoApply,
    showInMenu: promotion.showInMenu,
    isActive: promotion.isActive,
    validFrom: promotion.validFrom ?? "",
    validUntil: promotion.validUntil ?? "",
    validTimeStart: promotion.validTimeStart ?? "",
    validTimeEnd: promotion.validTimeEnd ?? "",
    scheduleDays: promotion.scheduleDays,
    slots: slotLinesFromDetail(promotion.promotionType, promotion.slots),
  }
}

export function promotionFormToPayload(form: PromotionFormState) {
  const slots =
    form.promotionType === "quantity_deal"
      ? [
          {
            label: QUANTITY_DEAL_SLOT_LABEL,
            quantity: 1,
            options: slotLinesToInput(form.slots)[0]?.options ?? [],
          },
        ]
      : slotLinesToInput(form.slots)

  return {
    name: form.name,
    description: form.description,
    imageUrl: form.imageUrl,
    promotionType: form.promotionType,
    pricingMode: form.pricingMode,
    fixedPrice:
      form.pricingMode === "fixed_total"
        ? Number(form.fixedPrice.replace(",", "."))
        : null,
    discountMode:
      form.pricingMode === "fixed_total" ? null : form.discountMode,
    discountValue:
      form.pricingMode === "fixed_total"
        ? null
        : Number(form.discountValue.replace(",", ".")),
    buyQuantity:
      form.promotionType === "quantity_deal"
        ? Number(form.buyQuantity.replace(",", "."))
        : null,
    benefitQuantity:
      form.promotionType === "quantity_deal"
        ? Number(form.benefitQuantity.replace(",", "."))
        : null,
    benefitDiscountPct:
      form.promotionType === "quantity_deal"
        ? Number(form.benefitDiscountPct.replace(",", "."))
        : null,
    applyBenefitTo:
      form.promotionType === "quantity_deal" ? form.applyBenefitTo : null,
    autoApply: form.autoApply,
    showInMenu: form.showInMenu,
    isActive: form.isActive,
    validFrom: form.validFrom.trim() || null,
    validUntil: form.validUntil.trim() || null,
    validTimeStart: form.validTimeStart.trim() || null,
    validTimeEnd: form.validTimeEnd.trim() || null,
    scheduleDays: form.scheduleDays,
    slots,
  }
}

export function promotionFormWithType(
  prev: PromotionFormState,
  type: PromotionType,
): PromotionFormState {
  return {
    ...prev,
    promotionType: type,
    slots:
      type === "quantity_deal"
        ? [
            {
              ...createEmptySlotLine(QUANTITY_DEAL_SLOT_LABEL),
              options: prev.slots[0]?.options ?? [],
            },
          ]
        : prev.slots.length > 0 &&
            prev.slots[0].label !== QUANTITY_DEAL_SLOT_LABEL
          ? prev.slots
          : [createEmptySlotLine()],
  }
}

export function promotionFormToggleWeekday(
  prev: PromotionFormState,
  day: number,
): PromotionFormState {
  const set = new Set(prev.scheduleDays)
  if (set.has(day)) set.delete(day)
  else set.add(day)
  return { ...prev, scheduleDays: [...set].sort((a, b) => a - b) }
}
