import type { MenuCatalogProduct } from "@/lib/menuCatalogProduct"
import {
  buildMenuCartTotalsLines,
  menuCartOrderTotals,
  resolvePromotionCartPricing,
} from "@/lib/menuCheckoutPromotions"
import type { CartLineOverrideSnapshot } from "@/lib/menuCartLineMerge"
import {
  normalizeCartItemKind,
  resolveCartLineId,
  type MenuCartItem,
} from "@/lib/menuCart"
import { createCartLineId } from "@/lib/menuCartLineMerge"
import {
  groupMostradorCartDisplayRows,
  pricingForMostradorRow,
  type MostradorCartDisplayGroup,
  type MostradorCartDisplayRow,
} from "@/lib/mostradorCartDisplay"
import type { QuantityDealApplication } from "@/lib/promotionPricing"
import { roundSaleMoney } from "@/lib/saleLineDiscount"

export type PartialPaymentUnitKind = "regular" | "promotion" | "quantity_deal"

export type PartialPaymentUnit = {
  selectionKey: string
  kind: PartialPaymentUnitKind
  label: string
  detail?: string
  /** Cantidad máxima seleccionable (unidades regulares o 1 si es atómico). */
  maxSelectable: number
  /** Promos y qty-deals: todo o nada. */
  isAtomic: boolean
  quantityDealApplicationId?: string
  promotionCartLineId?: string
  regularLineId?: string
  /** Precio final del ítem o grupo (con descuentos de ítem/promo). */
  lineFinalTotal: number
  unitFinalPrice?: number
}

export type PartialPaymentSelection = Record<string, number>

export type PartialCheckoutPaidState = {
  paidPartialUnits: PartialPaymentSelection
  totalPagadoAcumulado: number
}

export const emptyPartialCheckoutPaidState = (): PartialCheckoutPaidState => ({
  paidPartialUnits: {},
  totalPagadoAcumulado: 0,
})

function promoSelectionKey(lineId: string) {
  return `promo:${lineId}`
}

function qtyDealSelectionKey(appId: string) {
  return `qtydeal:${appId}`
}

function regularSelectionKey(lineId: string) {
  return `regular:${lineId}`
}

function unpaidAtomicUnits(
  key: string,
  paidPartialUnits: PartialPaymentSelection,
): boolean {
  return (paidPartialUnits[key] ?? 0) < 1
}

export function cartLineHasPaidUnits(
  lineId: string,
  item: Pick<MenuCartItem, "paidLocked" | "kind">,
  paidPartialUnits: PartialPaymentSelection,
): boolean {
  if (item.paidLocked) return true
  const kind = normalizeCartItemKind(item.kind)
  if (kind === "promotion") {
    return (paidPartialUnits[promoSelectionKey(lineId)] ?? 0) >= 1
  }
  return (paidPartialUnits[regularSelectionKey(lineId)] ?? 0) > 0
}

export function isQuantityDealApplicationPaid(
  applicationId: string,
  paidPartialUnits: PartialPaymentSelection,
): boolean {
  return (paidPartialUnits[qtyDealSelectionKey(applicationId)] ?? 0) >= 1
}

/** Separa unidades pagadas en líneas bloqueadas para que no se editen ni mergeen. */
export function materializePaidCartLines(input: {
  carrito: MenuCartItem[]
  paidPartialUnits: PartialPaymentSelection
}): {
  carrito: MenuCartItem[]
  paidPartialUnits: PartialPaymentSelection
  overrideCopies: Array<{ fromLineId: string; toLineId: string }>
} {
  const nextPaid = { ...input.paidPartialUnits }
  const nextCart: MenuCartItem[] = []
  const overrideCopies: Array<{ fromLineId: string; toLineId: string }> = []

  for (const item of input.carrito) {
    const lineId = resolveCartLineId(item)
    const kind = normalizeCartItemKind(item.kind)

    if (item.paidLocked) {
      nextCart.push(item)
      continue
    }

    if (kind === "promotion") {
      const key = promoSelectionKey(lineId)
      if ((nextPaid[key] ?? 0) >= 1) {
        nextCart.push({ ...item, paidLocked: true })
      } else {
        nextCart.push(item)
      }
      continue
    }

    const key = regularSelectionKey(lineId)
    const paidQty = nextPaid[key] ?? 0
    if (paidQty <= 0) {
      nextCart.push(item)
      continue
    }

    if (paidQty >= item.cantidad) {
      nextCart.push({ ...item, paidLocked: true })
      continue
    }

    const newLineId = createCartLineId()
    nextCart.push({
      ...item,
      lineId: newLineId,
      cantidad: paidQty,
      paidLocked: true,
    })
    nextCart.push({
      ...item,
      cantidad: item.cantidad - paidQty,
    })
    nextPaid[regularSelectionKey(newLineId)] = paidQty
    delete nextPaid[key]
    overrideCopies.push({ fromLineId: lineId, toLineId: newLineId })
  }

  return { carrito: nextCart, paidPartialUnits: nextPaid, overrideCopies }
}

function mergeCartItems(items: MenuCartItem[]): MenuCartItem[] {
  const byKey = new Map<string, MenuCartItem>()
  for (const item of items) {
    const lineId = resolveCartLineId(item)
    const existing = byKey.get(lineId)
    if (!existing) {
      byKey.set(lineId, { ...item, lineId })
      continue
    }
    byKey.set(lineId, {
      ...existing,
      cantidad: existing.cantidad + item.cantidad,
    })
  }
  return [...byKey.values()]
}

export function buildPartialPaymentUnits(input: {
  groups: MostradorCartDisplayGroup[]
  carrito: MenuCartItem[]
  paidPartialUnits: PartialPaymentSelection
  overrides: CartLineOverrideSnapshot
  productosByKey: Map<string, MenuCatalogProduct>
}): PartialPaymentUnit[] {
  const units: PartialPaymentUnit[] = []
  const seenDeals = new Set<string>()

  for (const item of input.carrito) {
    const kind = normalizeCartItemKind(item.kind)
    if (kind !== "promotion") continue
    if (item.paidLocked) continue
    const lineId = resolveCartLineId(item)
    const key = promoSelectionKey(lineId)
    if (!unpaidAtomicUnits(key, input.paidPartialUnits)) continue
    const promoMeta =
      input.productosByKey.get(`promotion:${item.productoId}`)?.promotionMeta
    const selections = item.promotionSelections ?? []
    let lineFinalTotal = 0
    if (promoMeta && selections.length > 0) {
      const priced = resolvePromotionCartPricing(
        promoMeta,
        selections,
        item.cantidad,
      )
      lineFinalTotal = priced.precioFinal
    }
    const promoProduct = input.productosByKey.get(`promotion:${item.productoId}`)
    units.push({
      selectionKey: key,
      kind: "promotion",
      label: promoProduct?.nombre ?? "Promoción",
      maxSelectable: 1,
      isAtomic: true,
      promotionCartLineId: lineId,
      lineFinalTotal,
    })
  }

  for (const group of input.groups) {
    const first = group.rows[0]
    if (!first?.quantityDealApplicationId) continue
    const appId = first.quantityDealApplicationId
    if (seenDeals.has(appId)) continue
    seenDeals.add(appId)
    const key = qtyDealSelectionKey(appId)
    if (!unpaidAtomicUnits(key, input.paidPartialUnits)) continue
    units.push({
      selectionKey: key,
      kind: "quantity_deal",
      label: group.promoLabel ?? "Promoción por cantidad",
      detail: group.rows.map((r) => `${r.cantidad}× ${r.nombre}`).join(" · "),
      maxSelectable: 1,
      isAtomic: true,
      quantityDealApplicationId: appId,
      lineFinalTotal: group.groupPricing?.finalTotal ?? 0,
    })
  }

  const seenRegularKeys = new Set<string>()
  for (const group of input.groups) {
    if (group.promoVariant === "promotion") continue
    for (const row of group.rows) {
      if (row.quantityDealApplicationId) continue
      if (row.variant === "combo_component") continue
      if (row.kind === "promotion") continue
      if (row.paidLocked) continue
      const key = regularSelectionKey(row.cartLineId)
      if (seenRegularKeys.has(key)) continue
      seenRegularKeys.add(key)
      const paid = input.paidPartialUnits[key] ?? 0
      const maxSelectable = Math.max(0, row.cantidad - paid)
      if (maxSelectable <= 0) continue
      const pricing = pricingForMostradorRow(row, input.overrides)
      units.push({
        selectionKey: key,
        kind: "regular",
        label: row.nombre,
        detail: row.descripcion?.trim() || undefined,
        maxSelectable,
        isAtomic: false,
        regularLineId: row.cartLineId,
        lineFinalTotal: roundSaleMoney(pricing.precioFinal),
        unitFinalPrice: pricing.precioUnitario,
      })
    }
  }

  return units
}

export function buildCarritoForPartialSelection(input: {
  carrito: MenuCartItem[]
  units: PartialPaymentUnit[]
  selection: PartialPaymentSelection
  quantityDealApplications: QuantityDealApplication[]
}): MenuCartItem[] {
  const selected: MenuCartItem[] = []
  const byLineId = new Map(
    input.carrito.map((item) => [resolveCartLineId(item), item]),
  )

  for (const unit of input.units) {
    const qty = Math.max(0, Math.floor(selectionQty(input.selection, unit)))
    if (qty <= 0) continue

    if (unit.kind === "promotion" && unit.promotionCartLineId) {
      const item = byLineId.get(unit.promotionCartLineId)
      if (!item) continue
      selected.push({ ...item, cantidad: item.cantidad })
      continue
    }

    if (unit.kind === "quantity_deal" && unit.quantityDealApplicationId) {
      const app = input.quantityDealApplications.find(
        (a) => a.id === unit.quantityDealApplicationId,
      )
      if (!app) continue
      for (const [lineId, count] of Object.entries(app.unitsPerLineKey)) {
        if (count <= 0) continue
        const item = byLineId.get(lineId)
        if (!item) continue
        selected.push({ ...item, cantidad: count })
      }
      continue
    }

    if (unit.kind === "regular" && unit.regularLineId) {
      const item = byLineId.get(unit.regularLineId)
      if (!item) continue
      selected.push({ ...item, cantidad: qty })
    }
  }

  return mergeCartItems(selected)
}

function selectionQty(
  selection: PartialPaymentSelection,
  unit: PartialPaymentUnit,
): number {
  const raw = selection[unit.selectionKey] ?? 0
  if (unit.isAtomic) return raw >= 1 ? unit.maxSelectable || 1 : 0
  return Math.min(unit.maxSelectable, Math.max(0, raw))
}

export function computePartialPaymentPricingContext(input: {
  units: PartialPaymentUnit[]
  selection: PartialPaymentSelection
  quantityDealApplications: QuantityDealApplication[]
  quantityDealDiscounts: Map<
    string,
    { promotionId: string; promotionName: string; amount: number }
  >
}): {
  quantityDealApplications: QuantityDealApplication[]
  quantityDealDiscounts: Map<
    string,
    { promotionId: string; promotionName: string; amount: number }
  >
  regularOnlyLineKeys: Set<string>
} {
  const selectedDealAppIds = new Set<string>()
  for (const unit of input.units) {
    if (
      unit.kind === "quantity_deal" &&
      unit.quantityDealApplicationId &&
      selectionQty(input.selection, unit) > 0
    ) {
      selectedDealAppIds.add(unit.quantityDealApplicationId)
    }
  }

  const filteredApplications = input.quantityDealApplications.filter((app) =>
    selectedDealAppIds.has(app.id),
  )

  const regularOnlyLineKeys = new Set<string>()
  for (const unit of input.units) {
    if (
      unit.kind === "regular" &&
      unit.regularLineId &&
      selectionQty(input.selection, unit) > 0
    ) {
      regularOnlyLineKeys.add(unit.regularLineId)
    }
  }

  for (const app of filteredApplications) {
    for (const lineId of Object.keys(app.unitsPerLineKey)) {
      regularOnlyLineKeys.delete(lineId)
    }
  }

  const filteredDiscounts = new Map<
    string,
    { promotionId: string; promotionName: string; amount: number }
  >()
  for (const app of filteredApplications) {
    for (const [lineKey, discountAmount] of Object.entries(
      app.discountByLineKey,
    )) {
      if (discountAmount <= 0) continue
      const prev = filteredDiscounts.get(lineKey)
      filteredDiscounts.set(lineKey, {
        promotionId: app.promotionId,
        promotionName: app.promotionName,
        amount: roundSaleMoney((prev?.amount ?? 0) + discountAmount),
      })
    }
  }

  return {
    quantityDealApplications: filteredApplications,
    quantityDealDiscounts: filteredDiscounts,
    regularOnlyLineKeys,
  }
}

export function buildUnpaidCarrito(input: {
  carrito: MenuCartItem[]
  paidPartialUnits: PartialPaymentSelection
  quantityDealApplications: QuantityDealApplication[]
}): MenuCartItem[] {
  const paidDealIds = new Set(
    input.quantityDealApplications
      .filter(
        (app) =>
          (input.paidPartialUnits[qtyDealSelectionKey(app.id)] ?? 0) >= 1,
      )
      .map((app) => app.id),
  )

  const result: MenuCartItem[] = []

  for (const item of input.carrito) {
    if (item.paidLocked) continue

    const lineId = resolveCartLineId(item)
    const kind = normalizeCartItemKind(item.kind)

    if (kind === "promotion") {
      if ((input.paidPartialUnits[promoSelectionKey(lineId)] ?? 0) >= 1) {
        continue
      }
      result.push(item)
      continue
    }

    let remaining = item.cantidad
    for (const app of input.quantityDealApplications) {
      if (!paidDealIds.has(app.id)) continue
      remaining -= app.unitsPerLineKey[lineId] ?? 0
    }
    remaining -= input.paidPartialUnits[regularSelectionKey(lineId)] ?? 0
    if (remaining > 0) {
      result.push({ ...item, cantidad: remaining })
    }
  }

  return result
}

export function computePartialGeneralDiscount(input: {
  fullSubtotal: number
  partialSubtotal: number
  modoDescuento: "porcentaje" | "fijo"
  valorDescuentoPorcentaje: number
  valorDescuentoFijo: number
}): number {
  const { fullSubtotal, partialSubtotal } = input
  if (partialSubtotal <= 0) return 0
  if (input.modoDescuento === "porcentaje") {
    return roundSaleMoney(
      partialSubtotal * (input.valorDescuentoPorcentaje / 100),
    )
  }
  const fullDiscount = Math.min(input.valorDescuentoFijo, fullSubtotal)
  if (fullSubtotal <= 0) return 0
  return roundSaleMoney(fullDiscount * (partialSubtotal / fullSubtotal))
}

export function computeSelectionCheckoutTotals(input: {
  carrito: MenuCartItem[]
  itemsDetallados: Array<{
    cartLineKey: string
    cantidad: number
    producto: MenuCatalogProduct | null
    promotionSelections?: MenuCartItem["promotionSelections"]
  }>
  quantityDealApplications: QuantityDealApplication[]
  quantityDealDiscounts: Map<
    string,
    { promotionId: string; promotionName: string; amount: number }
  >
  overrides: CartLineOverrideSnapshot
  selection: PartialPaymentSelection
  units: PartialPaymentUnit[]
  fullSubtotal: number
  modoDescuento: "porcentaje" | "fijo"
  valorDescuentoPorcentaje: number
  valorDescuentoFijo: number
}): {
  subtotal: number
  descuentoMonto: number
  total: number
  catalogTotals: ReturnType<typeof menuCartOrderTotals>
} {
  const partialCarrito = buildCarritoForPartialSelection({
    carrito: input.carrito,
    units: input.units,
    selection: input.selection,
    quantityDealApplications: input.quantityDealApplications,
  })

  const pricingContext = computePartialPaymentPricingContext({
    units: input.units,
    selection: input.selection,
    quantityDealApplications: input.quantityDealApplications,
    quantityDealDiscounts: input.quantityDealDiscounts,
  })

  const partialLineIds = new Set(
    partialCarrito.map((item) => resolveCartLineId(item)),
  )
  const partialItems = input.itemsDetallados.filter((item) =>
    partialLineIds.has(item.cartLineKey),
  )

  const cartTotalsInput = buildMenuCartTotalsLines({
    items: partialItems.map((item) => {
      const partialItem = partialCarrito.find(
        (p) => resolveCartLineId(p) === item.cartLineKey,
      )
      return partialItem
        ? { ...item, cantidad: partialItem.cantidad }
        : item
    }),
    quantityDealApplications: pricingContext.quantityDealApplications,
    quantityDealDiscounts: pricingContext.quantityDealDiscounts,
    regularOnlyLineKeys: pricingContext.regularOnlyLineKeys,
    itemDescuentoModo: input.overrides.itemDescuentoModo,
    itemDescuentoDraft: input.overrides.itemDescuentoDraft,
    itemDescuentoSuprimido: input.overrides.itemDescuentoSuprimido,
  })

  const catalogTotals = menuCartOrderTotals(cartTotalsInput)
  const subtotal = catalogTotals.subtotal
  const descuentoMonto = computePartialGeneralDiscount({
    fullSubtotal: input.fullSubtotal,
    partialSubtotal: subtotal,
    modoDescuento: input.modoDescuento,
    valorDescuentoPorcentaje: input.valorDescuentoPorcentaje,
    valorDescuentoFijo: input.valorDescuentoFijo,
  })

  return {
    subtotal,
    descuentoMonto,
    total: roundSaleMoney(Math.max(0, subtotal - descuentoMonto)),
    catalogTotals,
  }
}

export function buildFullUnpaidSelection(
  units: PartialPaymentUnit[],
): PartialPaymentSelection {
  const selection: PartialPaymentSelection = {}
  for (const unit of units) {
    if (unit.maxSelectable > 0) {
      selection[unit.selectionKey] = unit.maxSelectable
    }
  }
  return selection
}

export function applyPartialPaymentSuccess(
  state: PartialCheckoutPaidState,
  units: PartialPaymentUnit[],
  selection: PartialPaymentSelection,
  paidAmount: number,
): PartialCheckoutPaidState {
  const paidPartialUnits = { ...state.paidPartialUnits }
  for (const unit of units) {
    const qty = selectionQty(selection, unit)
    if (qty <= 0) continue
    if (unit.isAtomic) {
      paidPartialUnits[unit.selectionKey] = 1
    } else {
      paidPartialUnits[unit.selectionKey] =
        (paidPartialUnits[unit.selectionKey] ?? 0) + qty
    }
  }
  return {
    paidPartialUnits,
    totalPagadoAcumulado: roundSaleMoney(
      state.totalPagadoAcumulado + paidAmount,
    ),
  }
}

export function isCheckoutFullyPaid(input: {
  carrito: MenuCartItem[]
  paidPartialUnits: PartialPaymentSelection
  quantityDealApplications: QuantityDealApplication[]
}): boolean {
  return buildUnpaidCarrito(input).length === 0
}

export function getRowPaymentStatus(
  row: MostradorCartDisplayRow,
  paidPartialUnits: PartialPaymentSelection,
): {
  isFullyPaid: boolean
  isPartiallyPaid: boolean
  paidQuantity: number
  unpaidQuantity: number
} {
  if (row.paidLocked) {
    return {
      isFullyPaid: true,
      isPartiallyPaid: false,
      paidQuantity: row.cantidad,
      unpaidQuantity: 0,
    }
  }

  if (row.quantityDealApplicationId) {
    const key = qtyDealSelectionKey(row.quantityDealApplicationId)
    const paid = (paidPartialUnits[key] ?? 0) >= 1
    return {
      isFullyPaid: paid,
      isPartiallyPaid: false,
      paidQuantity: paid ? row.cantidad : 0,
      unpaidQuantity: paid ? 0 : row.cantidad,
    }
  }

  if (row.variant === "combo_component" || row.kind === "promotion") {
    const key = promoSelectionKey(row.cartLineId)
    const paid = (paidPartialUnits[key] ?? 0) >= 1
    return {
      isFullyPaid: paid,
      isPartiallyPaid: false,
      paidQuantity: paid ? row.cantidad : 0,
      unpaidQuantity: paid ? 0 : row.cantidad,
    }
  }

  const key = regularSelectionKey(row.cartLineId)
  const paidQty = Math.min(row.cantidad, paidPartialUnits[key] ?? 0)
  return {
    isFullyPaid: paidQty >= row.cantidad,
    isPartiallyPaid: paidQty > 0 && paidQty < row.cantidad,
    paidQuantity: paidQty,
    unpaidQuantity: Math.max(0, row.cantidad - paidQty),
  }
}

export function buildPartialPaymentUnitGroups(
  rows: MostradorCartDisplayRow[],
  overrides: CartLineOverrideSnapshot,
  paidPartialUnits: PartialPaymentSelection,
  carrito: MenuCartItem[],
  productosByKey: Map<string, MenuCatalogProduct>,
): PartialPaymentUnit[] {
  return buildPartialPaymentUnits({
    groups: groupMostradorCartDisplayRows(rows, overrides),
    carrito,
    paidPartialUnits,
    overrides,
    productosByKey,
  })
}

export function hasAnyPartialPayment(
  state: PartialCheckoutPaidState,
): boolean {
  return (
    state.totalPagadoAcumulado > 0 ||
    Object.values(state.paidPartialUnits).some((v) => v > 0)
  )
}
