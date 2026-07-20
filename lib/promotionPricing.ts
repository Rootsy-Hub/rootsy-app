import type {
  PromotionBenefitTarget,
  PromotionDiscountMode,
  PromotionPricingMode,
} from "@/lib/promotionTypes"

export type PromotionCartSelection = {
  slotId: string
  slotLabel: string
  kind: "article" | "recipe"
  refId: string
  name: string
  listUnitPrice: number
  slotQuantity: number
  iva: number
}

export type ComboPromotionPricingInput = {
  pricingMode: PromotionPricingMode
  fixedPrice: number | null
  discountMode: PromotionDiscountMode | null
  discountValue: number | null
}

export type ComboComponentAllocation = PromotionCartSelection & {
  listLineSubtotal: number
  allocatedLineSubtotal: number
  promoDiscount: number
  allocatedUnitPrice: number
}

export type ComboPromotionPricingResult = {
  listTotal: number
  promoTotal: number
  promoDiscount: number
  components: ComboComponentAllocation[]
  /** IVA ponderado para la línea padre. */
  weightedIvaPct: number
}

function roundMoney(n: number): number {
  return Math.round(n * 100) / 100
}

export function stablePromotionSelectionsHash(
  selections: PromotionCartSelection[],
): string {
  return selections
    .slice()
    .sort((a, b) => a.slotId.localeCompare(b.slotId))
    .map(
      (s) =>
        `${s.slotId}:${s.kind}:${s.refId}:${s.slotQuantity}`,
    )
    .join("|")
}

export function priceComboPromotion(
  promo: ComboPromotionPricingInput,
  selections: PromotionCartSelection[],
  promoLineQuantity = 1,
): ComboPromotionPricingResult {
  const expanded: PromotionCartSelection[] = []
  for (const sel of selections) {
    const repeats = Math.max(1, Math.round(sel.slotQuantity))
    for (let i = 0; i < repeats; i++) {
      expanded.push({ ...sel, slotQuantity: 1 })
    }
  }

  const perComboComponents = expanded.map((sel) => {
    const listLineSubtotal = roundMoney(sel.listUnitPrice * sel.slotQuantity)
    return { sel, listLineSubtotal }
  })

  const listTotalPerCombo = roundMoney(
    perComboComponents.reduce((sum, c) => sum + c.listLineSubtotal, 0),
  )

  let promoTotalPerCombo = listTotalPerCombo
  if (promo.pricingMode === "fixed_total") {
    promoTotalPerCombo = roundMoney(Math.max(0, Number(promo.fixedPrice ?? 0)))
  } else if (promo.pricingMode === "percent_off") {
    const pct = Math.min(100, Math.max(0, Number(promo.discountValue ?? 0)))
    promoTotalPerCombo = roundMoney(listTotalPerCombo * (1 - pct / 100))
  } else if (promo.pricingMode === "fixed_off") {
    const off = Math.max(0, Number(promo.discountValue ?? 0))
    promoTotalPerCombo = roundMoney(Math.max(0, listTotalPerCombo - off))
  }

  const promoDiscountPerCombo = roundMoney(
    Math.max(0, listTotalPerCombo - promoTotalPerCombo),
  )

  const components: ComboComponentAllocation[] = perComboComponents.map(
    ({ sel, listLineSubtotal }) => {
      const weight =
        listTotalPerCombo > 0 ? listLineSubtotal / listTotalPerCombo : 0
      const allocatedLineSubtotal = roundMoney(
        promoTotalPerCombo * weight,
      )
      const promoDiscount = roundMoney(
        listLineSubtotal - allocatedLineSubtotal,
      )
      const allocatedUnitPrice =
        sel.slotQuantity > 0
          ? roundMoney(allocatedLineSubtotal / sel.slotQuantity)
          : 0
      return {
        ...sel,
        listLineSubtotal,
        allocatedLineSubtotal,
        promoDiscount,
        allocatedUnitPrice,
      }
    },
  )

  const listTotal = roundMoney(listTotalPerCombo * promoLineQuantity)
  const promoTotal = roundMoney(promoTotalPerCombo * promoLineQuantity)
  const promoDiscount = roundMoney(listTotal - promoTotal)

  const scaledComponents = components.map((c) => ({
    ...c,
    listLineSubtotal: roundMoney(c.listLineSubtotal * promoLineQuantity),
    allocatedLineSubtotal: roundMoney(
      c.allocatedLineSubtotal * promoLineQuantity,
    ),
    promoDiscount: roundMoney(c.promoDiscount * promoLineQuantity),
  }))

  let weightedIvaPct = 0
  if (promoTotalPerCombo > 0) {
    weightedIvaPct = roundMoney(
      components.reduce(
        (sum, c) =>
          sum + c.allocatedLineSubtotal * Math.max(0, c.iva),
        0,
      ) / promoTotalPerCombo,
    )
  }

  return {
    listTotal,
    promoTotal,
    promoDiscount,
    components: scaledComponents,
    weightedIvaPct,
  }
}

export function resolveAutoComboSelections(
  slots: Array<{
    id: string
    label: string
    quantity: number
    options: Array<{
      kind: "article" | "recipe"
      refId: string
      name: string
      salePrice: number
      iva: number
    }>
  }>,
): PromotionCartSelection[] | null {
  const selections: PromotionCartSelection[] = []
  for (const slot of slots) {
    if (slot.options.length !== 1) return null
    const opt = slot.options[0]
    selections.push({
      slotId: slot.id,
      slotLabel: slot.label,
      kind: opt.kind,
      refId: opt.refId,
      name: opt.name,
      listUnitPrice: opt.salePrice,
      slotQuantity: slot.quantity,
      iva: opt.iva,
    })
  }
  return selections.length > 0 ? selections : null
}

export type QuantityDealUnit = {
  lineKey: string
  kind: "article" | "recipe"
  refId: string
  unitPrice: number
}

export type QuantityDealDiscountLine = {
  lineKey: string
  promotionId: string
  promotionName: string
  discountAmount: number
  suppressCatalog: boolean
}

export type QuantityDealApplication = {
  id: string
  promotionId: string
  promotionName: string
  discountAmount: number
  buyQuantity: number
  /** Unidades del carrito que consume esta aplicación (para quitar la promo). */
  unitsPerLineKey: Record<string, number>
  /** Descuento imputado por línea del carrito. */
  discountByLineKey: Record<string, number>
}

export function computeQuantityDealApplications(input: {
  units: QuantityDealUnit[]
  promotionId: string
  promotionName: string
  buyQuantity: number
  benefitQuantity: number
  benefitDiscountPct: number
  applyBenefitTo: PromotionBenefitTarget
}): QuantityDealApplication[] {
  const {
    units,
    promotionId,
    promotionName,
    buyQuantity,
    benefitQuantity,
    benefitDiscountPct,
    applyBenefitTo,
  } = input
  if (buyQuantity < 1 || benefitQuantity < 1 || units.length < buyQuantity) {
    return []
  }

  const sorted = units.slice().sort((a, b) =>
    applyBenefitTo === "cheapest"
      ? a.unitPrice - b.unitPrice
      : b.unitPrice - a.unitPrice,
  )

  const applications: QuantityDealApplication[] = []
  let index = 0
  let appIndex = 0
  while (index + buyQuantity <= sorted.length) {
    const group = sorted.slice(index, index + buyQuantity)
    const benefitTargets =
      applyBenefitTo === "cheapest"
        ? group
            .slice()
            .sort((a, b) => a.unitPrice - b.unitPrice)
            .slice(0, benefitQuantity)
        : group
            .slice()
            .sort((a, b) => b.unitPrice - a.unitPrice)
            .slice(0, benefitQuantity)

    const unitsPerLineKey: Record<string, number> = {}
    for (const unit of group) {
      unitsPerLineKey[unit.lineKey] = (unitsPerLineKey[unit.lineKey] ?? 0) + 1
    }

    const discountByLineKey: Record<string, number> = {}
    let discountAmount = 0
    for (const target of benefitTargets) {
      const unitDiscount = roundMoney(
        target.unitPrice * (benefitDiscountPct / 100),
      )
      discountAmount = roundMoney(discountAmount + unitDiscount)
      discountByLineKey[target.lineKey] = roundMoney(
        (discountByLineKey[target.lineKey] ?? 0) + unitDiscount,
      )
    }

    applications.push({
      id: `${promotionId}:${appIndex}`,
      promotionId,
      promotionName,
      discountAmount,
      buyQuantity,
      unitsPerLineKey,
      discountByLineKey,
    })
    appIndex += 1
    index += buyQuantity
  }

  return applications
}

export function computeQuantityDealDiscounts(input: {
  units: QuantityDealUnit[]
  promotionId: string
  promotionName: string
  buyQuantity: number
  benefitQuantity: number
  benefitDiscountPct: number
  applyBenefitTo: PromotionBenefitTarget
}): QuantityDealDiscountLine[] {
  const applications = computeQuantityDealApplications(input)
  const discountByLine = new Map<string, number>()
  for (const app of applications) {
    for (const [lineKey, amount] of Object.entries(app.discountByLineKey)) {
      discountByLine.set(
        lineKey,
        roundMoney((discountByLine.get(lineKey) ?? 0) + amount),
      )
    }
  }

  return [...discountByLine.entries()].map(([lineKey, discountAmount]) => ({
    lineKey,
    promotionId: input.promotionId,
    promotionName: input.promotionName,
    discountAmount,
    suppressCatalog: true,
  }))
}
