import type { QueryClient } from "@tanstack/react-query"
import type { ComandaStatus } from "@/app/[siteId]/[popId]/comandas/comandasTypes"
import type {
  ComandaSendPeel,
  ComandaVoidPeel,
} from "@/app/[siteId]/[popId]/comandas/comandasTypes"
import type {
  CounterFulfillmentType,
  CounterOrder,
  CounterOrderStatus,
} from "@/app/[siteId]/[popId]/mostrador/mostradorTypes"
import {
  applyComandaSendToOrderCache,
  applyComandaStatusToOrderCache,
  applyComandaVoidToOrderCache,
  applyMostradorCheckoutToOrderCache,
  patchMostradorOrderCache,
  removeMostradorOrderCache,
  upsertMostradorOrderCache,
} from "@/app/[siteId]/[popId]/mostrador/mostradorQueryCache"
import {
  popLocalMostradorBoardHydrateQueryKey,
  popMostradorOrderQueryKey,
  popMostradorOrdersQueryKey,
  popMostradorQueryRoot,
} from "@/lib/queryKeys"
import {
  clearPopLocalMostradorBoardHydrateMark,
  refreshMostradorOrdersFromNetwork,
} from "@/lib/popLocalDb/hydrateMostradorBoard"
import type { DomainEvent } from "@/lib/realtime/protocol"

function refreshMostradorBoardCache(queryClient: QueryClient, popId: string) {
  void refreshMostradorOrdersFromNetwork(popId)
    .then((orders) => {
      queryClient.setQueryData(popMostradorOrdersQueryKey(popId), orders)
    })
    .catch(() => {
      void queryClient.invalidateQueries({
        queryKey: popMostradorOrdersQueryKey(popId),
        refetchType: "all",
      })
    })
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value))
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === "string")
}

function parseStatus(value: unknown): CounterOrderStatus | null {
  if (
    value === "preparing" ||
    value === "dispatched" ||
    value === "delivered" ||
    value === "cancelled"
  ) {
    return value
  }
  return null
}

function parseFulfillment(value: unknown): CounterFulfillmentType {
  return value === "delivery" ? "delivery" : "pickup"
}

function parseOrder(value: unknown): CounterOrder | null {
  if (!isRecord(value)) return null
  const id = asString(value.id)
  const status = parseStatus(value.status)
  if (!id || !status) return null
  const saleId = asString(value.saleId)
  return {
    id,
    orderDay: asString(value.orderDay) ?? "",
    orderNumber:
      typeof value.orderNumber === "number" && Number.isFinite(value.orderNumber)
        ? value.orderNumber
        : 0,
    status,
    fulfillmentType: parseFulfillment(value.fulfillmentType),
    deliveryAddress: asString(value.deliveryAddress) ?? "",
    phone: asString(value.phone) ?? "",
    driverName: asString(value.driverName) ?? "",
    estimatedMinutes:
      typeof value.estimatedMinutes === "number" &&
      Number.isFinite(value.estimatedMinutes)
        ? value.estimatedMinutes
        : 0,
    notes: asString(value.notes) ?? "",
    immediateFulfillment: value.immediateFulfillment === true,
    saleId,
    isPaid: saleId != null,
    openedAt: asString(value.openedAt) ?? new Date().toISOString(),
    updatedAt: asString(value.updatedAt) ?? new Date().toISOString(),
    deliveredAt: asString(value.deliveredAt),
    checkout: null,
  }
}

function parseSendPeels(value: unknown): ComandaSendPeel[] {
  if (!Array.isArray(value)) return []
  const peels: ComandaSendPeel[] = []
  for (const item of value) {
    if (!isRecord(item)) continue
    const fromCartLineId = asString(item.fromCartLineId)
    const sentCartLineId = asString(item.sentCartLineId)
    if (!fromCartLineId || !sentCartLineId) continue
    peels.push({
      fromCartLineId,
      sentCartLineId,
      sentQuantity:
        typeof item.sentQuantity === "number" ? item.sentQuantity : 0,
      remainderQuantity:
        typeof item.remainderQuantity === "number" ? item.remainderQuantity : 0,
    })
  }
  return peels
}

function parseVoidPeels(value: unknown): ComandaVoidPeel[] {
  if (!Array.isArray(value)) return []
  const peels: ComandaVoidPeel[] = []
  for (const item of value) {
    if (!isRecord(item)) continue
    const fromCartLineId = asString(item.fromCartLineId)
    const voidedCartLineId = asString(item.voidedCartLineId)
    if (!fromCartLineId || !voidedCartLineId) continue
    peels.push({
      fromCartLineId,
      voidedCartLineId,
      voidedQuantity:
        typeof item.voidedQuantity === "number" ? item.voidedQuantity : 0,
      remainderQuantity:
        typeof item.remainderQuantity === "number" ? item.remainderQuantity : 0,
    })
  }
  return peels
}

function parseComandaStatus(value: unknown): ComandaStatus | null {
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

export function invalidateMostradorRealtimeQueries(
  queryClient: QueryClient,
  popId: string,
) {
  void clearPopLocalMostradorBoardHydrateMark(popId).then(() => {
    void queryClient.invalidateQueries({
      queryKey: popLocalMostradorBoardHydrateQueryKey(popId),
      refetchType: "all",
    })
    void queryClient.invalidateQueries({
      queryKey: popMostradorQueryRoot(popId),
      refetchType: "all",
      predicate: (query) => query.queryKey[2] !== "order",
    })
  })
}

export function applyMostradorRealtimeEvent(
  queryClient: QueryClient,
  popId: string,
  event: DomainEvent,
) {
  if (event.popId !== popId) return

  if (
    event.type === "mostrador.order_opened" ||
    event.type === "mostrador.order_updated"
  ) {
    const order = parseOrder(event.payload.order)
    if (order) {
      upsertMostradorOrderCache(queryClient, popId, order)
      return
    }
    refreshMostradorBoardCache(queryClient, popId)
    return
  }

  if (event.type === "mostrador.order_status_changed") {
    const orderId = asString(event.payload.orderId)
    const status = parseStatus(event.payload.status)
    const updatedAt = asString(event.payload.updatedAt)
    if (orderId && status === "cancelled") {
      removeMostradorOrderCache(queryClient, popId, orderId)
      return
    }
    if (orderId && status && updatedAt) {
      patchMostradorOrderCache(queryClient, popId, orderId, {
        status,
        updatedAt,
        deliveredAt: asString(event.payload.deliveredAt),
      })
      return
    }
    refreshMostradorBoardCache(queryClient, popId)
    return
  }

  if (event.type === "mostrador.checkout_saved") {
    const orderId = asString(event.payload.orderId)
    const updatedAt = asString(event.payload.updatedAt)
    if (orderId && updatedAt && event.payload.checkout != null) {
      applyMostradorCheckoutToOrderCache(
        queryClient,
        popId,
        orderId,
        updatedAt,
        event.payload.checkout,
      )
      return
    }
    if (orderId) {
      void queryClient.invalidateQueries({
        queryKey: popMostradorOrderQueryKey(popId, orderId),
        refetchType: "all",
      })
      return
    }
    refreshMostradorBoardCache(queryClient, popId)
    return
  }

  if (event.type === "mostrador.order_closed") {
    const orderId =
      asString(event.payload.orderId) ?? asString(event.resource?.id)
    if (orderId) {
      removeMostradorOrderCache(queryClient, popId, orderId)
      return
    }
    refreshMostradorBoardCache(queryClient, popId)
    return
  }

  if (event.type === "comandas.sent") {
    const sourceKind = asString(event.payload.sourceKind)
    const sourceId = asString(event.payload.sourceId)
    if (sourceKind !== "counter" || !sourceId) return
    applyComandaSendToOrderCache(
      queryClient,
      popId,
      sourceId,
      asStringArray(event.payload.sentCartLineIds),
      parseSendPeels(event.payload.peels),
    )
    return
  }

  if (event.type === "comandas.voided") {
    const sourceKind = asString(event.payload.sourceKind)
    const sourceId = asString(event.payload.sourceId)
    if (sourceKind !== "counter" || !sourceId) return
    applyComandaVoidToOrderCache(
      queryClient,
      popId,
      sourceId,
      asStringArray(event.payload.voidedCartLineIds),
      parseVoidPeels(event.payload.peels),
    )
    return
  }

  if (event.type === "comandas.status_changed") {
    const sourceKind = asString(event.payload.sourceKind)
    const sourceId = asString(event.payload.sourceId)
    const cartLineId = asString(event.payload.cartLineId)
    const status = parseComandaStatus(event.payload.status)
    if (sourceKind !== "counter" || !sourceId || !cartLineId || !status) return
    applyComandaStatusToOrderCache(
      queryClient,
      popId,
      sourceId,
      cartLineId,
      status,
    )
  }
}
