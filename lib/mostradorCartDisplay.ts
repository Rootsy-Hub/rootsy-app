import type { MenuCatalogProduct } from "@/lib/menuCatalogProduct"
import { resolveCartLineId, type MenuCartItemKind } from "@/lib/menuCart"
import type { CartLineOverrideSnapshot } from "@/lib/menuCartLineMerge"
import {
  cartLineCommentFingerprint,
  cartLineDiscountFingerprint,
} from "@/lib/menuCartLineMerge"
import { resolveCatalogCartLinePricing } from "@/components/sale-operation/saleCatalogProduct"
import type { MenuCatalogPromotion } from "@/app/[siteId]/[popId]/menu-catalog/actions"
import { discountGroupBannerLabelFromPricing } from "@/lib/cartLineDiscountBadge"
import type { PromotionCartSelection } from "@/lib/promotionPricing"
import type { QuantityDealApplication } from "@/lib/promotionPricing"
import { resolvePromotionCartPricing } from "@/lib/menuCheckoutPromotions"
import { roundSaleMoney } from "@/lib/saleLineDiscount"

export type MostradorCartCloudVariant = "discount" | "promotion" | "none"

export type MostradorCartDisplayRow = {
  rowKey: string
  lineId: string
  variant: "product" | "combo_component"
  productoId: string
  kind: MenuCartItemKind
  nombre: string
  descripcion?: string | null
  cantidad: number
  producto: MenuCatalogProduct | null
  promotionMeta?: MenuCatalogPromotion
  promotionSelections?: PromotionCartSelection[]
  comboGroupId?: string
  comboComponentKey?: string
  /** Agrupa filas que comparten una sola nube de promo/descuento arriba. */
  promoGroupKey?: string
  promoGroupLabel?: string
  promoGroupVariant?: "promotion" | "discount"
  promoGroupDiscountMode?: "porcentaje" | "fijo"
  topCloudLabel?: string
  topCloudVariant: MostradorCartCloudVariant
  comment?: string
  discountEditingDisabled: boolean
  commentEditingDisabled: boolean
  showGreenBorder: boolean
  cartLineId: string
  /** Precio lista de unidades incluidas en promo por cantidad (sin desc. catálogo). */
  quantityDealListTotal?: number
  quantityDealDiscountTotal?: number
  /** Total del grupo qty-deal (sobrevive consolidación de filas). */
  quantityDealGroupPricing?: MostradorCartGroupPricing
  /** Si está en un grupo qty-deal, id de la aplicación para quitar la promo entera. */
  quantityDealApplicationId?: string
  /** Cantidad total en la línea del carrito cuando esta fila es un slice parcial. */
  cartLineTotalCantidad?: number
  /** En combos: solo la primera línea muestra el precio total de la promo. */
  hidePrice?: boolean
  /** Precios fijos para vistas read-only (detalle de venta). */
  readOnlyPricing?: MostradorCartGroupPricing
  /** Línea del carrito ya cobrada; solo lectura en el ticket. */
  paidLocked?: boolean
}

export type MostradorCartGroupPricing = {
  listTotal: number
  finalTotal: number
}

export type MostradorCartDisplayGroup = {
  key: string
  promoLabel?: string
  promoVariant?: "promotion" | "discount"
  promoDiscountMode?: "porcentaje" | "fijo"
  showPromoBorder: boolean
  groupPricing?: MostradorCartGroupPricing
  rows: MostradorCartDisplayRow[]
}

export function visibleProductDescription(
  value?: string | null,
): string | null {
  const trimmed = value?.trim()
  if (!trimmed || trimmed === "—") return null
  return trimmed
}

export function productDescriptionForMostradorRow(
  row: MostradorCartDisplayRow,
): string | null {
  return visibleProductDescription(row.producto?.descripcion ?? row.descripcion)
}

export function isPartialMostradorCartSlice(
  row: MostradorCartDisplayRow,
): boolean {
  return (
    row.cartLineTotalCantidad != null &&
    row.cantidad < row.cartLineTotalCantidad
  )
}

export type MostradorCartDetailItem = {
  lineId: string
  productoId: string
  kind: MenuCartItemKind
  cantidad: number
  producto: MenuCatalogProduct | null
  promotionSelections?: PromotionCartSelection[]
  paidLocked?: boolean
}

function discountCloudLabel(
  product: MenuCatalogProduct | null,
  lineId: string,
  overrides: CartLineOverrideSnapshot,
  quantityDealActive: boolean,
): {
  label?: string
  variant: MostradorCartCloudVariant
  discountMode?: "porcentaje" | "fijo"
} {
  if (quantityDealActive) return { variant: "none" }
  const pricing = resolveCatalogCartLinePricing(
    product,
    1,
    overrides.itemDescuentoSuprimido[lineId]
      ? null
      : overrides.itemDescuentoDraft[lineId]?.trim()
        ? {
            mode: overrides.itemDescuentoModo[lineId] ?? "porcentaje",
            draft: overrides.itemDescuentoDraft[lineId] ?? "",
          }
        : null,
    { suppressCatalogDiscount: overrides.itemDescuentoSuprimido[lineId] === true },
  )
  if (pricing.tieneDescuentoManual || pricing.tieneDescuentoCatalogo) {
    const discountMode =
      pricing.itemDiscountMode === "fijo" || pricing.itemDiscountMode === "porcentaje"
        ? pricing.itemDiscountMode
        : undefined

    const label = discountGroupBannerLabelFromPricing({
      itemDiscountAmount: pricing.itemDiscountAmount,
      itemDiscountMode: pricing.itemDiscountMode,
      itemDiscountValue: pricing.itemDiscountValue,
    })

    if (label) {
      return {
        label,
        variant: "discount",
        discountMode,
      }
    }
  }
  return { variant: "none" }
}

function pendingDealUnitsByLine(
  applications: QuantityDealApplication[],
  assignedAppIds: Set<string>,
): Map<string, number> {
  const out = new Map<string, number>()
  for (const app of applications) {
    if (assignedAppIds.has(app.id)) continue
    for (const [lineKey, count] of Object.entries(app.unitsPerLineKey)) {
      out.set(lineKey, (out.get(lineKey) ?? 0) + count)
    }
  }
  return out
}

function appsAnchoredOnLine(
  lineId: string,
  applications: QuantityDealApplication[],
  assignedAppIds: Set<string>,
): QuantityDealApplication[] {
  return applications.filter((app) => {
    if (assignedAppIds.has(app.id)) return false
    const anchor = Object.keys(app.unitsPerLineKey).sort()[0]
    return anchor === lineId
  })
}

function pushQuantityDealGroupRows(
  rows: MostradorCartDisplayRow[],
  app: QuantityDealApplication,
  itemsByLineId: Map<string, MostradorCartDetailItem>,
  overrides: CartLineOverrideSnapshot,
) {
  const promoGroupKey = `qtydeal:${app.id}`
  const lineKeys = Object.keys(app.unitsPerLineKey).sort()
  const pendingRows: MostradorCartDisplayRow[] = []
  let appListTotal = 0

  for (const partLineId of lineKeys) {
    const partItem = itemsByLineId.get(partLineId)
    if (!partItem) continue
    const unitCount = app.unitsPerLineKey[partLineId] ?? 0
    if (unitCount <= 0) continue
    const comment = cartLineCommentFingerprint(partLineId, overrides)
    const listUnit =
      partItem.producto?.precioOriginal ?? partItem.producto?.precio ?? 0
    const listTotal = roundSaleMoney(listUnit * unitCount)
    const dealDiscount = roundSaleMoney(app.discountByLineKey[partLineId] ?? 0)
    appListTotal += listTotal

    pendingRows.push({
      rowKey: `${promoGroupKey}:${partLineId}`,
      lineId: partLineId,
      cartLineId: partLineId,
      variant: "product",
      productoId: partItem.productoId,
      kind: partItem.kind,
      nombre: partItem.producto?.nombre ?? "Producto",
      descripcion: partItem.producto?.descripcion,
      cantidad: unitCount,
      producto: partItem.producto,
      promoGroupKey,
      promoGroupLabel: app.promotionName,
      promoGroupVariant: "promotion",
      topCloudVariant: "none",
      comment: comment || undefined,
      discountEditingDisabled: true,
      commentEditingDisabled: false,
      showGreenBorder: true,
      quantityDealListTotal: listTotal,
      quantityDealDiscountTotal: dealDiscount,
      quantityDealApplicationId: app.id,
      hidePrice: true,
    })
  }

  if (pendingRows.length === 0) return

  const groupPricing: MostradorCartGroupPricing = {
    listTotal: roundSaleMoney(appListTotal),
    finalTotal: roundSaleMoney(Math.max(0, appListTotal - app.discountAmount)),
  }

  for (const row of pendingRows) {
    rows.push({ ...row, quantityDealGroupPricing: groupPricing })
  }
}

export function buildMostradorCartDisplayRows(input: {
  items: MostradorCartDetailItem[]
  applications: QuantityDealApplication[]
  overrides: CartLineOverrideSnapshot
  productosByKey?: Map<string, MenuCatalogProduct>
}): MostradorCartDisplayRow[] {
  const assignedAppIds = new Set<string>()
  const dealUnitsShownByLine = new Map<string, number>()
  const itemsByLineId = new Map(input.items.map((item) => [item.lineId, item]))
  const rows: MostradorCartDisplayRow[] = []

  for (let itemIndex = 0; itemIndex < input.items.length; itemIndex++) {
    const item = input.items[itemIndex]!
    const lineId = item.lineId
    const comment = cartLineCommentFingerprint(lineId, input.overrides)
    const itemPaidLocked = item.paidLocked === true

    if (item.kind === "promotion" && item.promotionSelections?.length) {
      const promoMeta = item.producto?.promotionMeta
      const promoName = promoMeta?.name ?? item.producto?.nombre ?? "Promoción"

      for (let comboIdx = 0; comboIdx < item.cantidad; comboIdx++) {
        const promoGroupKey = `${lineId}@${itemIndex}:combo:${comboIdx}`
        for (const sel of item.promotionSelections) {
          const repeats = Math.max(1, Math.round(sel.slotQuantity))
          for (let r = 0; r < repeats; r++) {
            const componentKey = `${sel.slotId}:${sel.kind}:${sel.refId}:${comboIdx}:${r}`
            const componentProduct =
              input.productosByKey?.get(`${sel.kind}:${sel.refId}`) ?? null
            rows.push({
              rowKey: `${lineId}:${componentKey}`,
              lineId: `${lineId}:${componentKey}`,
              cartLineId: lineId,
              variant: "combo_component",
              productoId: sel.refId,
              kind: sel.kind,
              nombre: sel.name,
              descripcion: componentProduct?.descripcion,
              cantidad: 1,
              producto: componentProduct,
              promotionMeta: promoMeta,
              promotionSelections: item.promotionSelections,
              comboGroupId: promoGroupKey,
              comboComponentKey: componentKey,
              promoGroupKey,
              promoGroupLabel: promoName,
              promoGroupVariant: "promotion",
              topCloudVariant: "none",
              hidePrice: true,
              discountEditingDisabled: true,
              commentEditingDisabled: false,
              showGreenBorder: true,
              paidLocked: itemPaidLocked,
            })
          }
        }
      }
      continue
    }

    for (const app of appsAnchoredOnLine(
      lineId,
      input.applications,
      assignedAppIds,
    )) {
      assignedAppIds.add(app.id)
      pushQuantityDealGroupRows(
        rows,
        app,
        itemsByLineId,
        input.overrides,
      )
      for (const [partLineId, count] of Object.entries(app.unitsPerLineKey)) {
        dealUnitsShownByLine.set(
          partLineId,
          (dealUnitsShownByLine.get(partLineId) ?? 0) + count,
        )
      }
    }

    const dealUnitsShown = dealUnitsShownByLine.get(lineId) ?? 0
    const pendingDealUnits =
      pendingDealUnitsByLine(input.applications, assignedAppIds).get(lineId) ??
      0
    const regularUnitCount = Math.max(
      0,
      item.cantidad - dealUnitsShown - pendingDealUnits,
    )

    if (regularUnitCount > 0) {
      const cloud = discountCloudLabel(
        item.producto,
        lineId,
        input.overrides,
        false,
      )
      rows.push({
        rowKey: `${lineId}:regular`,
        lineId,
        cartLineId: lineId,
        cartLineTotalCantidad: item.cantidad,
        variant: "product",
        productoId: item.productoId,
        kind: item.kind,
        nombre: item.producto?.nombre ?? "Producto",
        descripcion: item.producto?.descripcion,
        cantidad: regularUnitCount,
        producto: item.producto,
        promoGroupKey:
          cloud.variant === "discount" ? `${lineId}:discount` : undefined,
        promoGroupLabel: cloud.label,
        promoGroupVariant: cloud.variant === "discount" ? "discount" : undefined,
        promoGroupDiscountMode: cloud.discountMode,
        topCloudLabel: cloud.label,
        topCloudVariant: cloud.variant,
        comment: comment || undefined,
        discountEditingDisabled: false,
        commentEditingDisabled: false,
        showGreenBorder: cloud.variant === "discount",
        paidLocked: itemPaidLocked,
      })
    }
  }

  for (const app of input.applications) {
    if (assignedAppIds.has(app.id)) continue
    assignedAppIds.add(app.id)
    pushQuantityDealGroupRows(rows, app, itemsByLineId, input.overrides)
  }

  return rows
}

function promoRowMergeKey(row: MostradorCartDisplayRow): string | null {
  if (!row.promoGroupKey || row.promoGroupVariant !== "promotion") return null
  if (row.variant === "combo_component" || row.discountEditingDisabled) {
    return `${row.kind}:${row.productoId}`
  }
  return null
}

function commentsCompatible(a?: string, b?: string): boolean {
  return (a ?? "").trim() === (b ?? "").trim()
}

function consolidatePromoGroupRows(
  rows: MostradorCartDisplayRow[],
): MostradorCartDisplayRow[] {
  const out: MostradorCartDisplayRow[] = []
  const mergeIndex = new Map<string, number>()

  for (const row of rows) {
    const mergeKey = promoRowMergeKey(row)
    if (!mergeKey) {
      out.push(row)
      continue
    }

    const bucketKey = `${row.promoGroupKey}:${mergeKey}`
    const existingIdx = mergeIndex.get(bucketKey)
    if (existingIdx == null) {
      mergeIndex.set(bucketKey, out.length)
      out.push({
        ...row,
        rowKey: `${row.promoGroupKey}:${mergeKey}`,
      })
      continue
    }

    const existing = out[existingIdx]!
    if (!commentsCompatible(existing.comment, row.comment)) {
      out.push(row)
      continue
    }

    existing.cantidad += row.cantidad
    existing.hidePrice = Boolean(existing.hidePrice && row.hidePrice)
    if (row.quantityDealListTotal != null) {
      existing.quantityDealListTotal =
        (existing.quantityDealListTotal ?? 0) + row.quantityDealListTotal
    }
    if (row.quantityDealDiscountTotal != null) {
      existing.quantityDealDiscountTotal =
        (existing.quantityDealDiscountTotal ?? 0) + row.quantityDealDiscountTotal
    }
    if (row.quantityDealGroupPricing && !existing.quantityDealGroupPricing) {
      existing.quantityDealGroupPricing = row.quantityDealGroupPricing
    }
    if (row.quantityDealApplicationId && !existing.quantityDealApplicationId) {
      existing.quantityDealApplicationId = row.quantityDealApplicationId
    }
  }

  return out
}

function computeGroupPricing(
  rows: MostradorCartDisplayRow[],
  overrides?: CartLineOverrideSnapshot,
): MostradorCartGroupPricing | undefined {
  if (rows.length === 0) return undefined
  const first = rows[0]!

  if (
    first.variant === "combo_component" &&
    first.promotionMeta &&
    first.promotionSelections?.length
  ) {
    const priced = resolvePromotionCartPricing(
      first.promotionMeta,
      first.promotionSelections,
      1,
    )
    return {
      listTotal: priced.precioBase,
      finalTotal: priced.precioFinal,
    }
  }

  if (first.quantityDealGroupPricing) {
    return first.quantityDealGroupPricing
  }

  if (
    first.promoGroupVariant === "promotion" &&
    first.quantityDealListTotal != null
  ) {
    const listTotal = rows.reduce(
      (sum, row) => sum + (row.quantityDealListTotal ?? 0),
      0,
    )
    const discountTotal = rows.reduce(
      (sum, row) => sum + (row.quantityDealDiscountTotal ?? 0),
      0,
    )
    return {
      listTotal: roundSaleMoney(listTotal),
      finalTotal: roundSaleMoney(Math.max(0, listTotal - discountTotal)),
    }
  }

  if (first.promoGroupVariant === "discount") {
    let listTotal = 0
    let finalTotal = 0
    let hasPricing = false

    for (const row of rows) {
      if (overrides) {
        const pricing = pricingForMostradorRow(row, overrides)
        listTotal += pricing.precioBase
        finalTotal += pricing.precioFinal
        hasPricing = true
        continue
      }
      if (row.readOnlyPricing) {
        listTotal += row.readOnlyPricing.listTotal
        finalTotal += row.readOnlyPricing.finalTotal
        hasPricing = true
      }
    }

    if (!hasPricing) return undefined

    return {
      listTotal: roundSaleMoney(listTotal),
      finalTotal: roundSaleMoney(finalTotal),
    }
  }

  return undefined
}

function uniqueMostradorCartGroupKey(
  baseKey: string,
  groups: MostradorCartDisplayGroup[],
): string {
  if (!groups.some((group) => group.key === baseKey)) return baseKey
  let suffix = 2
  while (groups.some((group) => group.key === `${baseKey}#${suffix}`)) {
    suffix += 1
  }
  return `${baseKey}#${suffix}`
}

export function groupMostradorCartDisplayRows(
  rows: MostradorCartDisplayRow[],
  overrides?: CartLineOverrideSnapshot,
): MostradorCartDisplayGroup[] {
  const groups: MostradorCartDisplayGroup[] = []

  for (const row of rows) {
    const groupKey = row.promoGroupKey ?? row.rowKey
    const last = groups[groups.length - 1]

    if (
      last &&
      row.promoGroupKey &&
      last.key === groupKey &&
      last.promoVariant === row.promoGroupVariant
    ) {
      last.rows.push(row)
      continue
    }

    groups.push({
      key: uniqueMostradorCartGroupKey(groupKey, groups),
      promoLabel: row.promoGroupLabel,
      promoVariant: row.promoGroupVariant,
      promoDiscountMode: row.promoGroupDiscountMode,
      showPromoBorder: Boolean(row.promoGroupKey && row.showGreenBorder),
      rows: [row],
    })
  }

  return groups.map((group) => {
    const rows = consolidatePromoGroupRows(group.rows)
    return {
      ...group,
      rows,
      groupPricing: computeGroupPricing(rows, overrides),
    }
  })
}

export function countAppliedPromotions(input: {
  applications: QuantityDealApplication[]
  comboLineCount: number
}): number {
  return input.applications.length + input.comboLineCount
}

/** Clave estable por fila visible del ticket (post-consolidación). */
export function mostradorCartRowCommentKey(row: MostradorCartDisplayRow): string {
  return `row:${row.rowKey}`
}

export function resolveMostradorCartRowComment(
  row: MostradorCartDisplayRow,
  overrides: CartLineOverrideSnapshot,
): string {
  const rowKeyComment =
    overrides.itemComentarios[mostradorCartRowCommentKey(row)]?.trim() ?? ""
  if (rowKeyComment) return rowKeyComment

  if (row.variant !== "combo_component") {
    return overrides.itemComentarios[row.cartLineId]?.trim() ?? ""
  }

  return ""
}

export function comboComponentCommentKey(
  cartLineId: string,
  componentKey: string,
  comboGroupId?: string,
): string {
  if (comboGroupId?.trim()) {
    return `combo:${comboGroupId.trim()}:${componentKey}`
  }
  return `combo:${cartLineId}:${componentKey}`
}

export function isComboCommentKeyForCartLine(
  key: string,
  cartLineId: string,
): boolean {
  if (!key.startsWith("combo:")) return false
  const rest = key.slice("combo:".length)
  return rest.startsWith(`${cartLineId}:`) || rest.startsWith(`${cartLineId}@`)
}

function isRowCommentKeyForCartLine(key: string, cartLineId: string): boolean {
  if (!key.startsWith("row:")) return false
  const rowKey = key.slice("row:".length)
  return (
    rowKey.startsWith(`${cartLineId}:`) ||
    rowKey.startsWith(`${cartLineId}@`) ||
    rowKey === `${cartLineId}:regular`
  )
}

export function clearComboCommentsForCartLine(
  comments: Record<string, string>,
  cartLineId: string,
): Record<string, string> {
  const cleaned = { ...comments }
  for (const key of Object.keys(cleaned)) {
    if (
      key === cartLineId ||
      isComboCommentKeyForCartLine(key, cartLineId) ||
      isRowCommentKeyForCartLine(key, cartLineId)
    ) {
      delete cleaned[key]
    }
  }
  return cleaned
}

export function resolveRowCartLineId(row: MostradorCartDisplayRow): string {
  return row.cartLineId
}

export function pricingForMostradorRow(
  row: MostradorCartDisplayRow,
  overrides: CartLineOverrideSnapshot,
) {
  if (row.readOnlyPricing) {
    const { listTotal, finalTotal } = row.readOnlyPricing
    return {
      precioUnitario:
        row.cantidad > 0 ? roundSaleMoney(finalTotal / row.cantidad) : 0,
      precioBase: listTotal,
      precioFinal: finalTotal,
    }
  }

  if (
    row.variant === "product" &&
    row.discountEditingDisabled &&
    row.quantityDealListTotal != null
  ) {
    const listTotal = row.quantityDealListTotal
    const discount = row.quantityDealDiscountTotal ?? 0
    const finalTotal = roundSaleMoney(Math.max(0, listTotal - discount))
    return {
      precioUnitario:
        row.cantidad > 0 ? roundSaleMoney(listTotal / row.cantidad) : 0,
      precioBase: listTotal,
      precioFinal: finalTotal,
    }
  }

  if (row.variant === "combo_component" && row.promotionMeta && row.promotionSelections) {
    if (row.hidePrice) {
      return {
        precioUnitario: 0,
        precioBase: 0,
        precioFinal: 0,
      }
    }
    const parentQty =
      row.promotionSelections.length > 0
        ? resolvePromotionCartPricing(row.promotionMeta, row.promotionSelections, 1)
        : null
    if (parentQty) {
      return {
        precioUnitario: parentQty.precioFinal,
        precioBase: parentQty.precioBase,
        precioFinal: parentQty.precioFinal,
      }
    }
  }

  const pricing = resolveCatalogCartLinePricing(
    row.producto,
    row.cantidad,
    overrides.itemDescuentoSuprimido[row.cartLineId]
      ? null
      : overrides.itemDescuentoDraft[row.cartLineId]?.trim()
        ? {
            mode: overrides.itemDescuentoModo[row.cartLineId] ?? "porcentaje",
            draft: overrides.itemDescuentoDraft[row.cartLineId] ?? "",
          }
        : null,
    {
      suppressCatalogDiscount:
        row.discountEditingDisabled ||
        overrides.itemDescuentoSuprimido[row.cartLineId] === true,
    },
  )
  return {
    precioUnitario: pricing.precioUnitario,
    precioBase: pricing.precioBase,
    precioFinal: pricing.precioFinal,
  }
}

export function cartDetailItemsFromCarrito(
  items: Array<{
    lineId?: string
    productoId: string
    kind?: MenuCartItemKind
    cantidad: number
    producto: MenuCatalogProduct | null
    promotionSelections?: PromotionCartSelection[]
    paidLocked?: boolean
  }>,
): MostradorCartDetailItem[] {
  return items.map((item) => ({
    lineId: resolveCartLineId({
      lineId: item.lineId,
      productoId: item.productoId,
      cantidad: item.cantidad,
      kind: item.kind,
      promotionSelections: item.promotionSelections,
    }),
    productoId: item.productoId,
    kind: item.kind ?? "article",
    cantidad: item.cantidad,
    producto: item.producto,
    promotionSelections: item.promotionSelections,
    paidLocked: item.paidLocked,
  }))
}

export function fingerprintsMatchForMerge(
  lineId: string,
  product: MenuCatalogProduct | null,
  overrides: CartLineOverrideSnapshot,
  targetDiscountFp: string,
  targetCommentFp: string,
): boolean {
  return (
    cartLineDiscountFingerprint(lineId, product, overrides) ===
      targetDiscountFp &&
    cartLineCommentFingerprint(lineId, overrides) === targetCommentFp
  )
}
