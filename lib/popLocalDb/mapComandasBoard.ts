import type {
  ComandaSendKind,
  ComandaSourceKind,
  ComandaStatus,
  ComandaTicket,
} from "@/app/[siteId]/[popId]/comandas/comandasTypes"
import type { SqlParams } from "@/lib/popLocalDb/database"

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : value == null ? fallback : String(value)
}

function asNumber(value: unknown, fallback = 0): number {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

function asNullableString(value: unknown): string | null {
  if (value == null) return null
  const text = String(value).trim()
  return text ? text : null
}

function parseStatus(value: unknown): ComandaStatus {
  const status = asString(value)
  if (
    status === "pending" ||
    status === "sent" ||
    status === "preparing" ||
    status === "ready" ||
    status === "delivered" ||
    status === "voided"
  ) {
    return status
  }
  return "sent"
}

function parseSourceKind(value: unknown): ComandaSourceKind {
  return asString(value) === "counter" ? "counter" : "table"
}

function parseSendKind(value: unknown): ComandaSendKind {
  return asString(value) === "void" ? "void" : "order"
}

export function ticketBindValues(ticket: ComandaTicket): SqlParams {
  return [
    ticket.id,
    ticket.stationId,
    ticket.status,
    ticket.sourceKind,
    ticket.sourceId,
    ticket.cartLineId,
    ticket.recipeId,
    ticket.recipeName,
    ticket.quantity,
    ticket.comment,
    ticket.originLabel,
    ticket.customerName,
    ticket.createdAt,
    ticket.updatedAt,
    ticket.statusChangedAt,
    ticket.sentAt,
    ticket.preparingAt,
    ticket.readyAt,
    ticket.deliveredAt,
    ticket.sendId,
    ticket.sendKind,
    ticket.sendComment,
  ]
}

export function sqlTicketRowToSnapshot(row: object): ComandaTicket {
  const data = row as Record<string, unknown>
  return {
    id: asString(data.id),
    stationId: asString(data.station_id),
    status: parseStatus(data.status),
    sourceKind: parseSourceKind(data.source_kind),
    sourceId: asString(data.source_id),
    cartLineId: asString(data.cart_line_id),
    recipeId: asNullableString(data.recipe_id),
    recipeName: asString(data.recipe_name),
    quantity: asNumber(data.quantity),
    comment: asString(data.comment),
    originLabel: asString(data.origin_label),
    customerName: asString(data.customer_name),
    createdAt: asString(data.created_at),
    updatedAt: asString(data.updated_at),
    statusChangedAt: asString(data.status_changed_at),
    sentAt: asNullableString(data.sent_at),
    preparingAt: asNullableString(data.preparing_at),
    readyAt: asNullableString(data.ready_at),
    deliveredAt: asNullableString(data.delivered_at),
    sendId: asNullableString(data.send_id),
    sendKind: parseSendKind(data.send_kind),
    sendComment: asString(data.send_comment),
  }
}
