import type {
  PromotionBenefitTarget,
  PromotionDiscountMode,
  PromotionOptionKind,
  PromotionPricingMode,
  PromotionType,
} from "@/lib/promotionTypes"

export type PromotionCatalogOption = {
  id: string
  name: string
  kind: PromotionOptionKind
  salePrice: number
}

export type PromotionSlotOptionRow = {
  id: string
  kind: PromotionOptionKind
  refId: string
  name: string
  salePrice: number
  iva?: number
}

export type PromotionSlotRow = {
  id: string
  label: string
  quantity: number
  sortOrder: number
  options: PromotionSlotOptionRow[]
}

export type PromotionTableRow = {
  id: string
  name: string
  description: string
  imageUrl: string | null
  promotionType: PromotionType
  pricingMode: PromotionPricingMode
  fixedPrice: number | null
  discountMode: PromotionDiscountMode | null
  discountValue: number | null
  buyQuantity: number | null
  benefitQuantity: number | null
  benefitDiscountPct: number | null
  applyBenefitTo: PromotionBenefitTarget | null
  autoApply: boolean
  showInMenu: boolean
  isActive: boolean
  sortOrder: number
  validFrom: string | null
  validUntil: string | null
  validTimeStart: string | null
  validTimeEnd: string | null
  scheduleDays: number[]
  slotCount: number
  optionCount: number
  pricingSummary: string
  scheduleSummary: string
  slots?: PromotionSlotRow[]
}

export type PromotionDetail = PromotionTableRow & {
  slots: PromotionSlotRow[]
}

export type PromotionSlotOptionInput = {
  kind: PromotionOptionKind
  refId: string
}

export type PromotionSlotInput = {
  label: string
  quantity: number
  options: PromotionSlotOptionInput[]
}

export type CreatePromotionInput = {
  name: string
  description: string
  imageUrl: string
  promotionType: PromotionType
  pricingMode: PromotionPricingMode
  fixedPrice: number | null
  discountMode: PromotionDiscountMode | null
  discountValue: number | null
  buyQuantity: number | null
  benefitQuantity: number | null
  benefitDiscountPct: number | null
  applyBenefitTo: PromotionBenefitTarget | null
  autoApply: boolean
  showInMenu: boolean
  isActive: boolean
  validFrom: string | null
  validUntil: string | null
  validTimeStart: string | null
  validTimeEnd: string | null
  scheduleDays: number[]
  slots: PromotionSlotInput[]
}

export type UpdatePromotionInput = CreatePromotionInput

export type GetPopPromotionsTableInput = {
  q?: string
  page?: number
  pageSize?: number
  soloActivos?: boolean
  includeSlots?: boolean
  promotionType?: PromotionType | ""
  sort?: string | null
  ord?: "asc" | "desc"
}
