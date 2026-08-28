import type {
  CounterFulfillmentType,
  CounterOrder,
  CounterOrderStatus,
} from "@/app/[siteId]/[popId]/mostrador/mostradorTypes"
import type { SqlParams } from "@/lib/popLocalDb/database"

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : value == null ? fallback : String(value)
}

function asNumber(value: unknown, fallback = 0): number {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

function asBool(value: unknown, fallback = false): boolean {
  if (value == null) return fallback
  return value === 1 || value === true || value === "1"
}

function asNullableString(value: unknown): string | null {
  if (value == null) return null
  const text = String(value).trim()
  return text ? text : null
}

function parseStatus(value: unknown): CounterOrderStatus {
  const status = asString(value)
  if (
    status === "preparing" ||
    status === "dispatched" ||
    status === "delivered" ||
    status === "cancelled"
  ) {
    return status
  }
  return "preparing"
}

function parseFulfillment(value: unknown): CounterFulfillmentType {
  return asString(value) === "delivery" ? "delivery" : "pickup"
}

export function orderSlimBindValues(order: CounterOrder): SqlParams {
  return [
    order.id,
    order.orderDay,
    order.orderNumber,
    order.status,
    order.fulfillmentType,
    order.deliveryAddress,
    order.phone,
    order.driverName,
    order.estimatedMinutes,
    order.notes,
    order.immediateFulfillment ? 1 : 0,
    order.saleId,
    order.openedAt,
    order.updatedAt,
    order.deliveredAt,
  ]
}

export function sqlOrderRowToSnapshot(row: object): CounterOrder {
  const data = row as Record<string, unknown>
  const saleId = asNullableString(data.sale_id)
  return {
    id: asString(data.id),
    orderDay: asString(data.order_day),
    orderNumber: asNumber(data.order_number),
    status: parseStatus(data.status),
    fulfillmentType: parseFulfillment(data.fulfillment_type),
    deliveryAddress: asString(data.delivery_address),
    phone: asString(data.phone),
    driverName: asString(data.driver_name),
    estimatedMinutes: asNumber(data.estimated_minutes),
    notes: asString(data.notes),
    immediateFulfillment: asBool(data.immediate_fulfillment, false),
    saleId,
    isPaid: saleId != null,
    openedAt: asString(data.opened_at),
    updatedAt: asString(data.updated_at),
    deliveredAt: asNullableString(data.delivered_at),
    checkout: null,
  }
}
