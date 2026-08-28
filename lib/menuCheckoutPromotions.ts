import type { MenuCatalogPromotion } from "@/app/[siteId]/[popId]/menu-catalog/actions"
import { resolveCatalogCartLinePricing } from "@/components/sale-operation/saleCatalogProduct"
import type { SaleCatalogProduct } from "@/components/sale-operation/saleCatalogProduct"
import type { MenuCartItem } from "@/lib/menuCart"
import { cartItemKey, normalizeCartItemKind, resolveCartLineId } from "@/lib/menuCart"
import type { CartLineOverrideSnapshot } from "@/lib/menuCartLineMerge"
import { cartLineHasPersonalizedManualDiscount } from "@/lib/menuCartLineMerge"
import type { MenuCatalogProduct } from "@/lib/menuCatalogProduct"
import {
  computeQuantityDealApplications,
  computeQuantityDealDiscounts,
  priceComboPromotion,
  resolveAutoComboSelections,
  type PromotionCartSelection,
  type QuantityDealApplication,
  type QuantityDealUnit,
} from "@/lib/promotionPricing"
import type { PartialPaymentSelection } from "@/lib/partialCheckoutSelection"
import { roundSaleMoney } from "@/lib/saleLineDiscount"

function regularPaidUnitCount(
  lineKey: string,
  paidPartialUnits?: PartialPaymentSelection,
): number {
  if (!paidPartialUnits) return 0
  return Math.max(0, paidPartialUnits[`regular:${lineKey}`] ?? 0)
}

/** Unidades elegibles para promos por cantidad (excluye ítems ya cobrados). */
function quantityDealEligibleUnitCount(
  item: MenuCartItem,
  lineKey: string,
  paidPartialUnits?: PartialPaymentSelection,
): number {
  if (item.paidLocked || item.comandaStatus === "voided") return 0
  const paidQty = regularPaidUnitCount(lineKey, paidPartialUnits)
  return Math.max(0, item.cantidad - paidQty)
}

export function menuPromotionToProduct(
  promo: MenuCatalogPromotion,
): MenuCatalogProduct {
  const listFromSlots = promo.slots.reduce((sum, slot) => {
    const minOpt = slot.options.reduce(
      (min, o) => (min == null || o.salePrice < min ? o.salePrice : min),
      null as number | null,
    )
    return sum + (minOpt ?? 0) * slot.quantity
  }, 0)

  let displayPrice = listFromSlots
  if (promo.pricingMode === "fixed_total" && promo.fixedPrice != null) {
    displayPrice = promo.fixedPrice
  } else if (promo.pricingMode === "percent_off" && promo.discountValue != null) {
    displayPrice = roundSaleMoney(
      listFromSlots * (1 - promo.discountValue / 100),
    )
  } else if (promo.pricingMode === "fixed_off" && promo.discountValue != null) {
    displayPrice = roundSaleMoney(Math.max(0, listFromSlots - promo.discountValue))
  }

  return {
    id: promo.id,
    nombre: promo.name,
    descripcion: promo.description.trim() ? promo.description : promo.pricingLabel,
    precio: displayPrice,
    precioOriginal: displayPrice < listFromSlots ? listFromSlots : undefined,
    categoria: "Promociones",
    imagen: promo.imageUrl?.trim()
      ? promo.imageUrl.trim()
      : `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(promo.id)}&backgroundColor=1a1f1d`,
    promo: promo.pricingLabel,
    kind: "promotion",
    section: "promotions",
    categoriaFiltro: "promotions:all",
    promotionMeta: promo,
  }
}

export function buildMenuProductMap(
  products: MenuCatalogProduct[],
): Map<string, MenuCatalogProduct> {
  const map = new Map<string, MenuCatalogProduct>()
  for (const p of products) {
    map.set(`${p.kind}:${p.id}`, p)
  }
  return map
}

export function resolvePromotionCartPricing(
  promo: MenuCatalogPromotion,
  selections: PromotionCartSelection[],
  cantidad: number,
) {
  const priced = priceComboPromotion(
    {
      pricingMode: promo.pricingMode,
      fixedPrice: promo.fixedPrice,
      discountMode: promo.discountMode,
      discountValue: promo.discountValue,
    },
    selections,
    cantidad,
  )
  return {
    precioUnitario:
      cantidad > 0 ? roundSaleMoney(priced.promoTotal / cantidad) : 0,
    precioBase: priced.listTotal,
    precioFinal: priced.promoTotal,
    itemDiscountAmount: priced.promoDiscount,
    tieneDescuentoCatalogo: false,
    tieneDescuentoManual: false,
    descuentoCatalogoLabel: undefined,
    itemDiscountMode: null as "porcentaje" | "fijo" | null,
    itemDiscountValue: null as number | null,
    discountSource: "promotion" as const,
    promotionPricing: priced,
    selectionLabels: selections.map((s) => s.name).join(" · "),
  }
}

export function computeMenuQuantityDealDiscounts(input: {
  carrito: MenuCartItem[]
  productosByKey: Map<string, MenuCatalogProduct>
  quantityDeals: MenuCatalogPromotion[]
  overrides: CartLineOverrideSnapshot
  paidPartialUnits?: PartialPaymentSelection
}) {
  const discounts = new Map<
    string,
    { promotionId: string; promotionName: string; amount: number }
  >()

  for (const deal of input.quantityDeals) {
    if (
      deal.buyQuantity == null ||
      deal.benefitQuantity == null ||
      deal.benefitDiscountPct == null ||
      !deal.applyBenefitTo
    ) {
      continue
    }

    const pool = new Set<string>()
    for (const slot of deal.slots) {
      for (const opt of slot.options) {
        pool.add(`${opt.kind}:${opt.refId}`)
      }
    }

    const units = collectQuantityDealUnits({
      carrito: input.carrito,
      productosByKey: input.productosByKey,
      pool,
      overrides: input.overrides,
      paidPartialUnits: input.paidPartialUnits,
    })

    const lines = computeQuantityDealDiscounts({
      units,
      promotionId: deal.id,
      promotionName: deal.name,
      buyQuantity: deal.buyQuantity,
      benefitQuantity: deal.benefitQuantity,
      benefitDiscountPct: deal.benefitDiscountPct,
      applyBenefitTo: deal.applyBenefitTo,
    })

    for (const line of lines) {
      const prev = discounts.get(line.lineKey)
      discounts.set(line.lineKey, {
        promotionId: line.promotionId,
        promotionName: line.promotionName,
        amount: roundSaleMoney((prev?.amount ?? 0) + line.discountAmount),
      })
    }
  }

  return discounts
}

function collectQuantityDealUnits(input: {
  carrito: MenuCartItem[]
  productosByKey: Map<string, MenuCatalogProduct>
  pool: Set<string>
  overrides: CartLineOverrideSnapshot
  paidPartialUnits?: PartialPaymentSelection
}): QuantityDealUnit[] {
  const units: QuantityDealUnit[] = []
  for (const item of input.carrito) {
    const kind = normalizeCartItemKind(item.kind)
    if (kind === "promotion") continue
    const poolKey = `${kind}:${item.productoId}`
    if (!input.pool.has(poolKey)) continue
    const producto = input.productosByKey.get(poolKey)
    if (!producto) continue
    const lineKey = resolveCartLineId({ ...item, kind })
    if (
      cartLineHasPersonalizedManualDiscount(lineKey, producto, input.overrides)
    ) {
      continue
    }
    const unitPrice = producto.precioOriginal ?? producto.precio
    const eligibleUnits = quantityDealEligibleUnitCount(
      item,
      lineKey,
      input.paidPartialUnits,
    )
    for (let i = 0; i < eligibleUnits; i++) {
      units.push({
        lineKey,
        kind,
        refId: item.productoId,
        unitPrice,
      })
    }
  }
  return units
}

export function computeMenuQuantityDealApplications(input: {
  carrito: MenuCartItem[]
  productosByKey: Map<string, MenuCatalogProduct>
  quantityDeals: MenuCatalogPromotion[]
  overrides: CartLineOverrideSnapshot
  paidPartialUnits?: PartialPaymentSelection
}): QuantityDealApplication[] {
  const applications: QuantityDealApplication[] = []

  for (const deal of input.quantityDeals) {
    if (
      deal.buyQuantity == null ||
      deal.benefitQuantity == null ||
      deal.benefitDiscountPct == null ||
      !deal.applyBenefitTo
    ) {
      continue
    }

    const pool = new Set<string>()
    for (const slot of deal.slots) {
      for (const opt of slot.options) {
        pool.add(`${opt.kind}:${opt.refId}`)
      }
    }

    const units = collectQuantityDealUnits({
      carrito: input.carrito,
      productosByKey: input.productosByKey,
      pool,
      overrides: input.overrides,
      paidPartialUnits: input.paidPartialUnits,
    })

    applications.push(
      ...computeQuantityDealApplications({
        units,
        promotionId: deal.id,
        promotionName: deal.name,
        buyQuantity: deal.buyQuantity,
        benefitQuantity: deal.benefitQuantity,
        benefitDiscountPct: deal.benefitDiscountPct,
        applyBenefitTo: deal.applyBenefitTo,
      }),
    )
  }

  return applications
}

export type MenuCartProductLine = {
  displayKind: "product"
  cartLineKey: string
  productoId: string
  kind: ReturnType<typeof normalizeCartItemKind>
  cantidad: number
  producto: MenuCatalogProduct | null
  promotionSelections?: PromotionCartSelection[]
  quantityDealUnitsOnLine: number
}

export type MenuCartQuantityDealLine = {
  displayKind: "quantity_deal"
  cartLineKey: string
  application: QuantityDealApplication
}

export type MenuCartDisplayLine = MenuCartProductLine | MenuCartQuantityDealLine

export function buildMenuCartDisplayLines(
  productLines: Omit<MenuCartProductLine, "displayKind" | "quantityDealUnitsOnLine">[],
  applications: QuantityDealApplication[],
): MenuCartDisplayLine[] {
  const dealUnitsByLine = new Map<string, number>()
  for (const app of applications) {
    for (const [lineKey, count] of Object.entries(app.unitsPerLineKey)) {
      dealUnitsByLine.set(lineKey, (dealUnitsByLine.get(lineKey) ?? 0) + count)
    }
  }

  const appsByFirstLine = new Map<string, QuantityDealApplication[]>()
  const assignedApps = new Set<string>()
  for (const app of applications) {
    const lineKeys = Object.keys(app.unitsPerLineKey)
    const anchor = lineKeys.sort()[0]
    if (!anchor) continue
    const list = appsByFirstLine.get(anchor) ?? []
    list.push(app)
    appsByFirstLine.set(anchor, list)
  }

  const out: MenuCartDisplayLine[] = []
  for (const line of productLines) {
    out.push({
      displayKind: "product",
      ...line,
      quantityDealUnitsOnLine: dealUnitsByLine.get(line.cartLineKey) ?? 0,
    })
    const linked = appsByFirstLine.get(line.cartLineKey) ?? []
    for (const app of linked) {
      if (assignedApps.has(app.id)) continue
      assignedApps.add(app.id)
      out.push({
        displayKind: "quantity_deal",
        cartLineKey: `qtydeal:${app.id}`,
        application: app,
      })
    }
  }

  for (const app of applications) {
    if (assignedApps.has(app.id)) continue
    out.push({
      displayKind: "quantity_deal",
      cartLineKey: `qtydeal:${app.id}`,
      application: app,
    })
  }

  return out
}

export function removeQuantityDealApplicationFromCart(
  carrito: MenuCartItem[],
  application: QuantityDealApplication,
): MenuCartItem[] {
  const toSubtract = new Map<string, number>()
  for (const [lineKey, units] of Object.entries(application.unitsPerLineKey)) {
    if (units > 0) toSubtract.set(lineKey, units)
  }

  return carrito
    .map((item) => {
      const kind = normalizeCartItemKind(item.kind)
      const lineKey = resolveCartLineId({ ...item, kind })
      const minus = toSubtract.get(lineKey) ?? 0
      if (minus <= 0) return item
      return { ...item, cantidad: item.cantidad - minus }
    })
    .filter((item) => item.cantidad > 0)
}

export function tryAutoComboSelections(
  promo: MenuCatalogPromotion,
): PromotionCartSelection[] | null {
  if (promo.promotionType !== "combo") return null
  return resolveAutoComboSelections(
    promo.slots.map((slot) => ({
      id: slot.id,
      label: slot.label,
      quantity: slot.quantity,
      options: slot.options.map((o) => ({
        kind: o.kind,
        refId: o.refId,
        name: o.name,
        salePrice: o.salePrice,
        iva: o.iva,
      })),
    })),
  )
}

export type MenuCartTotalsLine = {
  producto: Pick<
    SaleCatalogProduct,
    "precio" | "precioOriginal" | "discountMode" | "discountValue"
  > | null
  cantidad: number
  manualDiscount?: { mode: "porcentaje" | "fijo"; draft: string } | null
  suppressCatalogDiscount?: boolean
  promotionMeta?: MenuCatalogPromotion
  promotionSelections?: PromotionCartSelection[]
  quantityDealDiscount?: number
}

export function quantityDealUnitsOnLine(
  lineKey: string,
  applications: QuantityDealApplication[],
): number {
  let count = 0
  for (const app of applications) {
    count += app.unitsPerLineKey[lineKey] ?? 0
  }
  return count
}

type MenuCartTotalsItem = {
  cartLineKey: string
  cantidad: number
  producto: MenuCatalogProduct | null
  promotionSelections?: PromotionCartSelection[]
  comandaStatus?: string
}

/** Separa unidades en promo por cantidad vs regulares para totales correctos. */
export function buildMenuCartTotalsLines(input: {
  items: MenuCartTotalsItem[]
  quantityDealApplications: QuantityDealApplication[]
  quantityDealDiscounts: Map<
    string,
    { promotionId: string; promotionName: string; amount: number }
  >
  itemDescuentoModo: Record<string, "porcentaje" | "fijo">
  itemDescuentoDraft: Record<string, string>
  itemDescuentoSuprimido: Record<string, true>
  /** Líneas cuyas unidades parciales deben cobrarse como regulares (sin qty-deal). */
  regularOnlyLineKeys?: Set<string>
}): MenuCartTotalsLine[] {
  const lines: MenuCartTotalsLine[] = []

  for (const item of input.items) {
    if (item.comandaStatus === "voided") continue
    const lineKey = item.cartLineKey
    const suprimido = input.itemDescuentoSuprimido[lineKey] === true
    const draft = input.itemDescuentoDraft[lineKey] ?? ""
    const manualDiscount =
      !suprimido && draft !== ""
        ? {
            mode: input.itemDescuentoModo[lineKey] ?? "porcentaje",
            draft,
          }
        : null

    if (item.producto?.promotionMeta && item.promotionSelections?.length) {
      lines.push({
        producto: item.producto,
        cantidad: item.cantidad,
        suppressCatalogDiscount: suprimido,
        manualDiscount,
        promotionMeta: item.producto.promotionMeta,
        promotionSelections: item.promotionSelections,
        quantityDealDiscount: 0,
      })
      continue
    }

    const deal = input.quantityDealDiscounts.get(lineKey)
    const dealUnits = input.regularOnlyLineKeys?.has(lineKey)
      ? 0
      : Math.min(
          item.cantidad,
          quantityDealUnitsOnLine(lineKey, input.quantityDealApplications),
        )
    const regularUnits = Math.max(0, item.cantidad - dealUnits)

    if (dealUnits > 0) {
      lines.push({
        producto: item.producto,
        cantidad: dealUnits,
        suppressCatalogDiscount: true,
        manualDiscount: null,
        quantityDealDiscount: deal?.amount ?? 0,
      })
    }

    if (regularUnits > 0) {
      lines.push({
        producto: item.producto,
        cantidad: regularUnits,
        suppressCatalogDiscount: suprimido,
        manualDiscount,
        quantityDealDiscount: 0,
      })
    }
  }

  return lines
}

export function menuCartOrderTotals(lines: MenuCartTotalsLine[]) {
  let subtotal = 0
  let subtotalOriginal = 0
  let descuentoCatalogoMonto = 0
  let descuentoManualMonto = 0
  let descuentoPromoMonto = 0
  let descuentoQuantityDealMonto = 0

  for (const item of lines) {
    if (item.promotionMeta && item.promotionSelections?.length) {
      const priced = resolvePromotionCartPricing(
        item.promotionMeta,
        item.promotionSelections,
        item.cantidad,
      )
      const frozenUnit = item.producto?.precio
      const promoTotal =
        frozenUnit != null && Number.isFinite(frozenUnit)
          ? roundSaleMoney(frozenUnit * item.cantidad)
          : priced.precioFinal
      const listTotal =
        item.producto?.precioOriginal != null
          ? roundSaleMoney(item.producto.precioOriginal * item.cantidad)
          : priced.precioBase
      subtotal += promoTotal
      subtotalOriginal += listTotal
      descuentoPromoMonto += roundSaleMoney(Math.max(0, listTotal - promoTotal))
      continue
    }

    const line = resolveCatalogCartLinePricing(
      item.producto,
      item.cantidad,
      item.manualDiscount,
      { suppressCatalogDiscount: item.suppressCatalogDiscount },
    )
    const dealDisc = item.quantityDealDiscount ?? 0
    subtotal += roundSaleMoney(line.precioFinal - dealDisc)
    subtotalOriginal += line.precioBase
    if (line.discountSource === "catalog") {
      descuentoCatalogoMonto += line.itemDiscountAmount
    } else if (line.discountSource === "manual") {
      descuentoManualMonto += line.itemDiscountAmount
    }
    descuentoQuantityDealMonto += dealDisc
  }

  return {
    subtotal,
    subtotalOriginal,
    descuentoCatalogoMonto,
    descuentoManualMonto,
    descuentoPromoMonto,
    descuentoQuantityDealMonto,
    descuentoItemsMonto: roundSaleMoney(
      descuentoCatalogoMonto +
        descuentoManualMonto +
        descuentoPromoMonto +
        descuentoQuantityDealMonto,
    ),
    hayDescuentoCatalogo: descuentoCatalogoMonto > 0,
    hayDescuentoManual: descuentoManualMonto > 0,
    hayDescuentoItems:
      descuentoCatalogoMonto +
        descuentoManualMonto +
        descuentoPromoMonto +
        descuentoQuantityDealMonto >
      0,
  }
}
