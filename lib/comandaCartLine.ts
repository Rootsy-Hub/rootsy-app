import type { ComandaStatus } from "@/app/[siteId]/[popId]/comandas/comandasTypes"
import { COMANDA_STATUS_LABELS } from "@/app/[siteId]/[popId]/comandas/comandasTypes"
import {
  normalizeCartItemKind,
  type MenuCartItem,
} from "@/lib/menuCart"
import { cn } from "@/lib/utils"

/** Comentario de línea: el ticket guarda `row:${lineId}:regular` además de `lineId`. */
export function resolveCheckoutLineComment(
  lineId: string,
  comments: Record<string, string> | null | undefined,
): string {
  if (!comments) return ""
  const direct = comments[lineId]?.trim()
  if (direct) return direct
  const regular = comments[`row:${lineId}:regular`]?.trim()
  if (regular) return regular
  const promo = comments[`row:${lineId}:promo`]?.trim()
  if (promo) return promo
  for (const [key, value] of Object.entries(comments)) {
    const trimmed = value?.trim() ?? ""
    if (!trimmed) continue
    if (key.startsWith(`row:${lineId}:`)) return trimmed
    if (key.startsWith("row:") && key.endsWith(`:${lineId}`)) return trimmed
  }
  return ""
}

export function pendingComandaComment(
  cartLineId: string,
  storedComment: string,
  comments: Record<string, string> | null | undefined,
): string {
  const stored = storedComment.trim()
  if (stored) return stored
  const fromLine = resolveCheckoutLineComment(cartLineId, comments)
  if (fromLine) return fromLine
  const colon = cartLineId.lastIndexOf(":")
  if (colon <= 0) return ""
  return resolveCheckoutLineComment(cartLineId.slice(0, colon), comments)
}

export function parseComandaStatus(value: unknown): ComandaStatus | undefined {
  if (
    value === "pending" ||
    value === "sent" ||
    value === "preparing" ||
    value === "ready" ||
    value === "delivered"
  ) {
    return value
  }
  return undefined
}

/** Ya salió a cocina: no se junta ni se edita la línea. */
export function isComandaLocked(
  status: ComandaStatus | undefined,
): boolean {
  return status != null && status !== "pending"
}

export function initialComandaStatus(commandable: boolean): ComandaStatus | undefined {
  return commandable ? "pending" : undefined
}

export function promotionSelectionsAreCommandable(
  selections: Array<{ kind: string; refId: string }>,
  productosByKey: Map<string, { stationId?: string | null }>,
): boolean {
  return selections.some((selection) => {
    if (selection.kind !== "recipe") return false
    return Boolean(
      productosByKey.get(`recipe:${selection.refId}`)?.stationId?.trim(),
    )
  })
}

export function ensureCartLineComandaStatuses<T extends MenuCartItem>(
  carrito: T[],
  productosByKey: Map<string, { stationId?: string | null }>,
): T[] {
  let changed = false
  const next = carrito.map((item) => {
    if (item.comandaStatus) return item
    const kind = normalizeCartItemKind(item.kind)
    if (kind === "recipe") {
      const product = productosByKey.get(`recipe:${item.productoId}`)
      if (!product?.stationId?.trim()) return item
      changed = true
      return { ...item, comandaStatus: "pending" as const }
    }
    if (
      kind === "promotion" &&
      promotionSelectionsAreCommandable(
        item.promotionSelections ?? [],
        productosByKey,
      )
    ) {
      changed = true
      return { ...item, comandaStatus: "pending" as const }
    }
    return item
  })
  return changed ? next : carrito
}

export function comandaStatusLabel(status: ComandaStatus): string {
  return COMANDA_STATUS_LABELS[status]
}

/** Franja de la línea del ticket — tokens de librería + info/ámbar funcionales. */
export function comandaLineStatusBarClass(status: ComandaStatus): string {
  switch (status) {
    case "pending":
      return "bg-[var(--rootsy-bruma-200)] text-[var(--rootsy-bruma-700)]"
    case "sent":
      return "bg-[color-mix(in_srgb,#93c5fd_46%,white)] text-[#1e40af]"
    case "preparing":
      return "bg-[color-mix(in_srgb,#fde68a_72%,white)] text-[#92400e]"
    case "ready":
      return "bg-[var(--rootsy-savia-100)] text-[var(--rootsy-savia-800)]"
    case "delivered":
      return "bg-[var(--rootsy-savia-600)] text-white"
  }
}
