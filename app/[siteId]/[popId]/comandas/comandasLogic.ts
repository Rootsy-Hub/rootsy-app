import type {
  ComandaBoardCard,
  ComandaSendPeel,
  ComandaStatus,
  ComandaTicket,
  ComandaVoidPeel,
} from "@/app/[siteId]/[popId]/comandas/comandasTypes"
import { commandableCartLineKeys } from "@/lib/comandaCartLine"

export function formatTableOriginLabel(labels: string[]): string {
  const clean = labels.map((label) => label.trim()).filter(Boolean)
  if (clean.length === 0) return "Mesa"
  if (clean.length === 1) return `Mesa ${clean[0]}`
  return `Mesas ${clean.join(" + ")}`
}

export function formatCounterOriginLabel(orderNumber: number): string {
  return `Pedido #${orderNumber}`
}

/** Pill de tablero: solo la magnitud, sin “hace…”. */
export function formatComandaElapsed(
  iso: string,
  now = Date.now(),
): string {
  const then = new Date(iso).getTime()
  if (!Number.isFinite(then)) return "—"
  const seconds = Math.max(0, Math.round((now - then) / 1000))
  if (seconds < 60) return "<1m"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`
  return `${Math.floor(hours / 24)}d`
}

export function checkoutCustomerName(input: {
  selectedName?: string | null
  manualName?: string | null
}): string {
  const selected = input.selectedName?.trim() ?? ""
  if (selected) return selected
  return input.manualName?.trim() ?? ""
}

export function isComandaBoardVisible(status: ComandaStatus): boolean {
  return status !== "pending" && status !== "voided"
}

export function canDragComanda(status: ComandaStatus): boolean {
  return (
    status === "sent" ||
    status === "preparing" ||
    status === "ready" ||
    status === "delivered"
  )
}

export function canMoveComandaTo(
  from: ComandaStatus,
  to: ComandaStatus,
): boolean {
  if (from === to) return false
  return canDragComanda(from) && canDragComanda(to)
}

export function timestampsForStatusChange(
  current: {
    sentAt: string | null
    preparingAt: string | null
    readyAt: string | null
    deliveredAt: string | null
  },
  next: ComandaStatus,
  now: string,
): {
  status: ComandaStatus
  status_changed_at: string
  sent_at?: string
  preparing_at?: string
  ready_at?: string
  delivered_at?: string
} {
  const patch: {
    status: ComandaStatus
    status_changed_at: string
    sent_at?: string
    preparing_at?: string
    ready_at?: string
    delivered_at?: string
  } = {
    status: next,
    status_changed_at: now,
  }
  if (next === "sent" && !current.sentAt) patch.sent_at = now
  if (next === "preparing" && !current.preparingAt) patch.preparing_at = now
  if (next === "ready" && !current.readyAt) patch.ready_at = now
  if (next === "delivered" && !current.deliveredAt) patch.delivered_at = now
  return patch
}

export function groupComandasForBoard(
  tickets: ComandaTicket[],
): ComandaBoardCard[] {
  const groups = new Map<string, ComandaTicket[]>()
  for (const ticket of tickets) {
    if (!isComandaBoardVisible(ticket.status)) continue
    const key = ticket.sendId ?? ticket.id
    const list = groups.get(key) ?? []
    list.push(ticket)
    groups.set(key, list)
  }

  return [...groups.entries()].map(([key, items]) => {
    const first = items[0]!
    return {
      id: key,
      primaryItemId: first.id,
      sendId: first.sendId,
      sendKind: first.sendKind,
      status: first.status,
      stationId: first.stationId,
      sourceKind: first.sourceKind,
      originLabel: first.originLabel,
      customerName: first.customerName,
      sendComment: first.sendComment,
      createdAt: first.createdAt,
      statusChangedAt: first.statusChangedAt,
      items: items.map((item) => ({
        id: item.id,
        recipeName: item.recipeName,
        quantity: item.quantity,
        comment: item.comment,
      })),
    }
  })
}

export function markCartLinesSent<
  T extends {
    lineId?: string
    productoId: string
    kind?: string
    promotionSelections?: Array<{ slotId: string; kind: string; refId: string }>
    comandaStatus?: ComandaStatus
  },
>(
  carrito: T[],
  sentCartLineIds: string[],
  productosByKey?: Map<string, { stationId?: string | null }>,
): T[] {
  const sent = new Set(sentCartLineIds)
  if (sent.size === 0) return carrito
  return carrito.map((item) => {
    const keys = commandableCartLineKeys(item, productosByKey)
    if (keys.length === 0) return item
    if (!keys.every((key) => sent.has(key))) return item
    return { ...item, comandaStatus: "sent" as const }
  })
}

export function applyComandaSendToCart<
  T extends {
    lineId?: string
    productoId: string
    cantidad: number
    kind?: string
    promotionSelections?: Array<{ slotId: string; kind: string; refId: string }>
    comandaStatus?: ComandaStatus
  },
>(
  carrito: T[],
  sentCartLineIds: string[],
  peels: ComandaSendPeel[],
  productosByKey?: Map<string, { stationId?: string | null }>,
): T[] {
  let next = carrito
  for (const peel of peels) {
    const idx = next.findIndex((item) => {
      const lineId = item.lineId?.trim() || item.productoId
      return lineId === peel.fromCartLineId
    })
    if (idx < 0) continue
    const item = next[idx]!
    if (peel.sentQuantity >= item.cantidad) {
      next = next.map((row, rowIdx) =>
        rowIdx === idx ? { ...row, comandaStatus: "sent" as const } : row,
      )
      continue
    }
    const remainderQty = Math.max(1, peel.remainderQuantity)
    const sentQty = Math.max(1, peel.sentQuantity)
    const copy = next.slice()
    copy[idx] = { ...item, cantidad: remainderQty }
    copy.push({
      ...item,
      lineId: peel.sentCartLineId,
      cantidad: sentQty,
      comandaStatus: "sent" as const,
    })
    next = copy
  }
  return markCartLinesSent(next, sentCartLineIds, productosByKey)
}

/** Líneas pending sin ticket pendiente: ya se comandaron (p. ej. promo con artículos). */
export function healCartLinesAlreadySent<
  T extends {
    lineId?: string
    productoId: string
    kind?: string
    promotionSelections?: Array<{ slotId: string; kind: string; refId: string }>
    comandaStatus?: ComandaStatus
  },
>(
  carrito: T[],
  pendingCartLineIds: string[],
  productosByKey?: Map<string, { stationId?: string | null }>,
): T[] {
  const pending = new Set(pendingCartLineIds)
  return carrito.map((item) => {
    if (item.comandaStatus !== "pending") return item
    const keys = commandableCartLineKeys(item, productosByKey)
    if (keys.length === 0) return item
    if (keys.some((key) => pending.has(key))) return item
    return { ...item, comandaStatus: "sent" as const }
  })
}

export function markCartLinesVoided<
  T extends {
    lineId?: string
    productoId: string
    kind?: string
    promotionSelections?: Array<{ slotId: string; kind: string; refId: string }>
    comandaStatus?: ComandaStatus
  },
>(
  carrito: T[],
  voidedCartLineIds: string[],
  productosByKey?: Map<string, { stationId?: string | null }>,
): T[] {
  const voided = new Set(voidedCartLineIds)
  if (voided.size === 0) return carrito
  return carrito.map((item) => {
    const keys = commandableCartLineKeys(item, productosByKey)
    const lineId = item.lineId?.trim() || item.productoId
    if (voided.has(lineId)) {
      return { ...item, comandaStatus: "voided" as const }
    }
    if (keys.length === 0) return item
    if (!keys.every((key) => voided.has(key))) return item
    return { ...item, comandaStatus: "voided" as const }
  })
}

export function applyComandaVoidToCart<
  T extends {
    lineId?: string
    productoId: string
    cantidad: number
    kind?: string
    promotionSelections?: Array<{ slotId: string; kind: string; refId: string }>
    comandaStatus?: ComandaStatus
  },
>(
  carrito: T[],
  voidedCartLineIds: string[],
  peels: ComandaVoidPeel[],
  productosByKey?: Map<string, { stationId?: string | null }>,
): T[] {
  let next = carrito
  for (const peel of peels) {
    const idx = next.findIndex((item) => {
      const lineId = item.lineId?.trim() || item.productoId
      return lineId === peel.fromCartLineId
    })
    if (idx < 0) continue
    const item = next[idx]!
    if (peel.voidedQuantity >= item.cantidad) {
      next = next.map((row, rowIdx) =>
        rowIdx === idx ? { ...row, comandaStatus: "voided" as const } : row,
      )
      continue
    }
    const remainderQty = Math.max(1, peel.remainderQuantity)
    const voidedQty = Math.max(1, peel.voidedQuantity)
    const copy = next.slice()
    copy[idx] = { ...item, cantidad: remainderQty }
    copy.push({
      ...item,
      lineId: peel.voidedCartLineId,
      cantidad: voidedQty,
      comandaStatus: "voided" as const,
    })
    next = copy
  }
  return markCartLinesVoided(next, voidedCartLineIds, productosByKey)
}
