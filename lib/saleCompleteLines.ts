import type { CompleteSaleLineInput } from "@/app/[siteId]/[popId]/sale/completeSale"
import { quantityDealUnitsOnLine } from "@/lib/menuCheckoutPromotions"
import type { QuantityDealApplication } from "@/lib/promotionPricing"
import {
  normalizeCartItemKind,
  resolveCartLineId,
  type MenuCartItem,
} from "@/lib/menuCart"

function cartLineSnapshot(
  item: MenuCartItem,
  quantity: number,
): CompleteSaleLineInput["snapshot"] {
  const snap = item.snapshot
  const name = snap?.nombre?.trim() || "Ítem"
  const listPrice = Number(snap?.precioOriginal)
  const salePrice = Number(snap?.precio)
  const hasList = Number.isFinite(listPrice) && listPrice >= 0
  const isPromo = normalizeCartItemKind(item.kind) === "promotion"
  const unitPrice = isPromo
    ? Number.isFinite(salePrice)
      ? salePrice
      : 0
    : hasList
      ? listPrice
      : Number.isFinite(salePrice)
        ? salePrice
        : 0
  return {
    name,
    unitPrice: unitPrice < 0 ? 0 : unitPrice,
    ...(snap?.iva != null ? { iva: snap.iva } : {}),
    catalogDiscountMode: !isPromo && hasList ? snap?.discountMode ?? null : null,
    catalogDiscountValue:
      !isPromo && hasList ? snap?.discountValue ?? null : null,
    ...(isPromo && hasList
      ? { listTotal: Math.max(0, listPrice) * quantity }
      : {}),
  }
}

function cartPromotionSelections(
  item: MenuCartItem,
): CompleteSaleLineInput["promotionSelections"] {
  return (item.promotionSelections ?? []).map((selection) => ({
    slotId: selection.slotId,
    kind: selection.kind,
    refId: selection.refId,
    name: selection.name,
    slotLabel: selection.slotLabel,
    listUnitPrice: selection.listUnitPrice,
    slotQuantity: selection.slotQuantity,
    iva: selection.iva,
  }))
}

export function buildCompleteSaleLinesFromCart(input: {
  carrito: MenuCartItem[]
  quantityDealApplications: QuantityDealApplication[]
  quantityDealDiscounts: Map<
    string,
    { promotionId: string; promotionName: string; amount: number }
  >
  itemDescuentoModo: Record<string, "porcentaje" | "fijo">
  itemDescuentoDraft: Record<string, string>
  itemDescuentoSuprimido: Record<string, true>
  itemComentarios: Record<string, string>
  regularOnlyLineKeys?: Set<string>
}): CompleteSaleLineInput[] {
  const lines: CompleteSaleLineInput[] = []

  for (const item of input.carrito) {
    const kind = normalizeCartItemKind(item.kind)
    const lineKey = resolveCartLineId({ ...item, kind })
    const suprimido = input.itemDescuentoSuprimido[lineKey] === true
    const draft = suprimido ? "" : (input.itemDescuentoDraft[lineKey] ?? "")
    const itemDiscountMode = input.itemDescuentoModo[lineKey] ?? "porcentaje"
    const comment = input.itemComentarios[lineKey]?.trim() ?? ""
    const deal = input.quantityDealDiscounts.get(lineKey)
    const dealUnits = input.regularOnlyLineKeys?.has(lineKey)
      ? 0
      : Math.min(
          item.cantidad,
          quantityDealUnitsOnLine(lineKey, input.quantityDealApplications),
        )
    const regularUnits = Math.max(0, item.cantidad - dealUnits)

    if (kind === "promotion") {
      lines.push({
        promotionId: item.productoId,
        promotionSelections: cartPromotionSelections(item),
        quantity: item.cantidad,
        snapshot: cartLineSnapshot(item, item.cantidad),
        itemDiscountMode,
        itemDiscountDraft: draft,
        suppressCatalogDiscount: suprimido,
        comment: comment || undefined,
      })
      continue
    }

    const lineGroupId =
      deal && dealUnits > 0 ? `qtydeal:${deal.promotionId}:${lineKey}` : undefined

    if (dealUnits > 0) {
      lines.push({
        ...(kind === "recipe"
          ? { recipeId: item.productoId }
          : { articleId: item.productoId }),
        quantity: dealUnits,
        snapshot: cartLineSnapshot(item, dealUnits),
        itemDiscountMode: "porcentaje",
        itemDiscountDraft: "",
        suppressCatalogDiscount: true,
        promotionDealDiscount: deal?.amount ?? 0,
        promotionDealId: deal?.promotionId,
        promotionDealName: deal?.promotionName,
        lineGroupId,
        comment: regularUnits > 0 ? undefined : comment || undefined,
      })
    }

    if (regularUnits > 0) {
      lines.push({
        ...(kind === "recipe"
          ? { recipeId: item.productoId }
          : { articleId: item.productoId }),
        quantity: regularUnits,
        snapshot: cartLineSnapshot(item, regularUnits),
        itemDiscountMode,
        itemDiscountDraft: draft,
        suppressCatalogDiscount: suprimido,
        promotionDealDiscount: 0,
        comment: comment || undefined,
      })
    }
  }

  return lines
}

export type PersistedQuantityDealSummary = {
  promotionId: string
  promotionName: string
  discountAmount: number
  lineGroupIds: string[]
}

export function summarizeQuantityDealsFromLines(
  lines: CompleteSaleLineInput[],
): PersistedQuantityDealSummary[] {
  const byPromo = new Map<string, PersistedQuantityDealSummary>()
  for (const line of lines) {
    if (!line.promotionDealId || !(line.promotionDealDiscount ?? 0)) continue
    const existing = byPromo.get(line.promotionDealId)
    const groupId = line.lineGroupId
    if (existing) {
      existing.discountAmount += line.promotionDealDiscount ?? 0
      if (groupId && !existing.lineGroupIds.includes(groupId)) {
        existing.lineGroupIds.push(groupId)
      }
    } else {
      byPromo.set(line.promotionDealId, {
        promotionId: line.promotionDealId,
        promotionName: line.promotionDealName ?? "Promoción",
        discountAmount: line.promotionDealDiscount ?? 0,
        lineGroupIds: groupId ? [groupId] : [],
      })
    }
  }
  return [...byPromo.values()]
}
