import type { QueryClient } from "@tanstack/react-query"
import {
  applyComandaStatusToTicketsCache,
  invalidateComandasTicketsCache,
  upsertComandaTicketCache,
} from "@/app/[siteId]/[popId]/comandas/comandasQueryCache"
import type {
  ComandaSendKind,
  ComandaSourceKind,
  ComandaStatus,
  ComandaTicket,
} from "@/app/[siteId]/[popId]/comandas/comandasTypes"
import { popComandasQueryRoot } from "@/lib/queryKeys"
import type { DomainEvent } from "@/lib/realtime/protocol"

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value))
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null
}

function parseStatus(value: unknown): ComandaStatus | null {
  if (
    value === "pending" ||
    value === "sent" ||
    value === "preparing" ||
    value === "ready" ||
    value === "delivered" ||
    value === "voided"
  ) {
    return value
  }
  return null
}

function parseSourceKind(value: unknown): ComandaSourceKind | null {
  return value === "table" || value === "counter" ? value : null
}

function parseSendKind(value: unknown): ComandaSendKind {
  return value === "void" ? "void" : "order"
}

export function parseComandaTicket(value: unknown): ComandaTicket | null {
  if (!isRecord(value)) return null
  const id = asString(value.id)
  const stationId = asString(value.stationId)
  const status = parseStatus(value.status)
  const sourceKind = parseSourceKind(value.sourceKind)
  const sourceId = asString(value.sourceId)
  if (!id || !stationId || !status || !sourceKind || !sourceId) return null
  return {
    id,
    stationId,
    status,
    sourceKind,
    sourceId,
    cartLineId: asString(value.cartLineId) ?? "",
    recipeId: asString(value.recipeId),
    recipeName: asString(value.recipeName) ?? "",
    quantity:
      typeof value.quantity === "number" && Number.isFinite(value.quantity)
        ? value.quantity
        : 0,
    comment: asString(value.comment) ?? "",
    originLabel: asString(value.originLabel) ?? "",
    customerName: asString(value.customerName) ?? "",
    createdAt: asString(value.createdAt) ?? new Date().toISOString(),
    updatedAt: asString(value.updatedAt) ?? new Date().toISOString(),
    statusChangedAt:
      asString(value.statusChangedAt) ?? new Date().toISOString(),
    sentAt: asString(value.sentAt),
    preparingAt: asString(value.preparingAt),
    readyAt: asString(value.readyAt),
    deliveredAt: asString(value.deliveredAt),
    sendId: asString(value.sendId),
    sendKind: parseSendKind(value.sendKind),
    sendComment: asString(value.sendComment) ?? "",
  }
}

function parseTicketList(value: unknown): ComandaTicket[] {
  if (!Array.isArray(value)) return []
  const tickets: ComandaTicket[] = []
  for (const item of value) {
    const ticket = parseComandaTicket(item)
    if (ticket) tickets.push(ticket)
  }
  return tickets
}

export function invalidateComandasRealtimeQueries(
  queryClient: QueryClient,
  popId: string,
) {
  void queryClient.invalidateQueries({
    queryKey: popComandasQueryRoot(popId),
    refetchType: "all",
  })
}

export function applyComandasRealtimeEvent(
  queryClient: QueryClient,
  popId: string,
  event: DomainEvent,
) {
  if (event.popId !== popId) return

  if (event.type === "comandas.sent" || event.type === "comandas.voided") {
    const tickets = parseTicketList(event.payload.tickets)
    if (tickets.length > 0) {
      for (const ticket of tickets) {
        upsertComandaTicketCache(queryClient, popId, ticket)
      }
      return
    }
    invalidateComandasTicketsCache(queryClient, popId)
    return
  }

  if (event.type === "comandas.status_changed") {
    const ticket = parseComandaTicket(event.payload.ticket)
    if (ticket) {
      applyComandaStatusToTicketsCache(queryClient, popId, ticket)
      return
    }
    invalidateComandasTicketsCache(queryClient, popId)
  }
}
