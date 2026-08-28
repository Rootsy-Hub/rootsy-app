import type {
  ComandaSendPeel,
  ComandaStatus,
  PendingComandaItem,
} from "@/app/[siteId]/[popId]/comandas/comandasTypes"
import {
  pendingComandaComment,
} from "@/lib/comandaCartLine"
import {
  normalizeCartItemKind,
  resolveCartLineId,
} from "@/lib/menuCart"

const FALLBACK_STATION_NAME = "Estación"

type PendingCartItem = {
  lineId?: string
  productoId: string
  cantidad: number
  kind?: string
  comandaStatus?: ComandaStatus
  promotionSelections?: Array<{
    slotId: string
    kind: string
    refId: string
    name?: string
    slotQuantity?: number
  }>
  snapshot?: { nombre?: string }
}

type CatalogProduct = {
  nombre?: string
  stationId?: string | null
}

function recipeName(
  product: CatalogProduct | undefined,
  fallback: string,
): string {
  const fromProduct = product?.nombre?.trim()
  if (fromProduct) return fromProduct
  return fallback.trim() || "Ítem"
}

export function pendingComandaItemsFromCart(input: {
  carrito: readonly PendingCartItem[]
  productosByKey: Map<string, CatalogProduct>
  comments?: Record<string, string> | null
  stationNames?: ReadonlyMap<string, string>
}): PendingComandaItem[] {
  const comments = input.comments ?? {}
  const stationNames = input.stationNames
  const out: PendingComandaItem[] = []

  for (const item of input.carrito) {
    if (item.comandaStatus !== "pending") continue
    const quantity = Math.max(1, Math.round(Number(item.cantidad) || 1))
    const kind = normalizeCartItemKind(item.kind)
    const parentLineId = resolveCartLineId(item)
    const parentComment = pendingComandaComment(parentLineId, "", comments)

    if (kind !== "promotion") {
      if (kind !== "recipe") continue
      const product = input.productosByKey.get(`recipe:${item.productoId}`)
      const stationId = product?.stationId?.trim()
      if (!stationId) continue
      out.push({
        id: parentLineId,
        cartLineId: parentLineId,
        recipeName: recipeName(product, item.snapshot?.nombre ?? ""),
        quantity,
        comment: parentComment,
        stationId,
        stationName: stationNames?.get(stationId)?.trim() || FALLBACK_STATION_NAME,
      })
      continue
    }

    for (const selection of item.promotionSelections ?? []) {
      if (selection.kind !== "recipe") continue
      const product = input.productosByKey.get(`recipe:${selection.refId}`)
      const stationId = product?.stationId?.trim()
      if (!stationId) continue
      const cartLineId = `${parentLineId}:${selection.slotId}`
      const slotQty = Math.max(1, Math.round(Number(selection.slotQuantity) || 1))
      out.push({
        id: cartLineId,
        cartLineId,
        recipeName: recipeName(product, selection.name ?? ""),
        quantity: Math.max(1, quantity * slotQty),
        comment: pendingComandaComment(cartLineId, parentComment, comments),
        stationId,
        stationName: stationNames?.get(stationId)?.trim() || FALLBACK_STATION_NAME,
      })
    }
  }

  return out
}

export function planOptimisticComandaSend(input: {
  items: readonly PendingComandaItem[]
  quantities: Record<string, number>
}): { sentCartLineIds: string[]; peels: ComandaSendPeel[] } {
  const sentCartLineIds: string[] = []
  const peels: ComandaSendPeel[] = []
  for (const item of input.items) {
    const pendingQty = Math.max(1, Math.round(item.quantity))
    const sendQty = Math.min(
      pendingQty,
      Math.max(0, Math.round(Number(input.quantities[item.cartLineId]) || 0)),
    )
    if (sendQty <= 0) continue
    if (sendQty < pendingQty) {
      const sentCartLineId = crypto.randomUUID()
      peels.push({
        fromCartLineId: item.cartLineId,
        sentCartLineId,
        sentQuantity: sendQty,
        remainderQuantity: pendingQty - sendQty,
      })
      sentCartLineIds.push(sentCartLineId)
      continue
    }
    sentCartLineIds.push(item.cartLineId)
  }
  return { sentCartLineIds, peels }
}
