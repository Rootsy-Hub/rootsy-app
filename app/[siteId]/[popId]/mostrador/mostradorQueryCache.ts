import type { QueryClient } from "@tanstack/react-query"
import {
  applyComandaSendToCart,
  applyComandaVoidToCart,
} from "@/app/[siteId]/[popId]/comandas/comandasLogic"
import type {
  ComandaSendPeel,
  ComandaStatus,
  ComandaVoidPeel,
} from "@/app/[siteId]/[popId]/comandas/comandasTypes"
import { parseTableSessionCheckout } from "@/app/[siteId]/[popId]/mesas/mesasCheckoutState"
import type { CounterOrder } from "@/app/[siteId]/[popId]/mostrador/mostradorTypes"
import { resolveCartLineId } from "@/lib/menuCart"
import { popMostradorOrdersQueryKey } from "@/lib/queryKeys"

function isNewerTimestamp(next: string, prev: string | undefined): boolean {
  if (!prev) return true
  const nextMs = Date.parse(next)
  const prevMs = Date.parse(prev)
  if (Number.isFinite(nextMs) && Number.isFinite(prevMs)) {
    return nextMs > prevMs
  }
  return next > prev
}

function overlayInFlightOrder(
  order: CounterOrder,
  inFlight: Map<string, CounterOrder> | undefined,
): CounterOrder {
  const optimistic = inFlight?.get(order.id)
  if (!optimistic) return order
  return {
    ...order,
    status: optimistic.status,
    deliveredAt: optimistic.deliveredAt,
  }
}

export function overlayMostradorInFlight(
  orders: CounterOrder[],
  inFlight: Map<string, CounterOrder>,
): CounterOrder[] {
  if (inFlight.size === 0) return orders
  return orders.map((order) => overlayInFlightOrder(order, inFlight))
}

export function replaceMostradorOrderCache(
  queryClient: QueryClient,
  popId: string,
  order: CounterOrder,
  inFlight?: Map<string, CounterOrder>,
) {
  if (order.saleId || order.status === "cancelled") {
    removeMostradorOrderCache(queryClient, popId, order.id)
    return
  }
  queryClient.setQueryData<CounterOrder[]>(
    popMostradorOrdersQueryKey(popId),
    (prev) => {
      const list = prev ?? []
      const mapped = overlayInFlightOrder(order, inFlight)
      const index = list.findIndex((item) => item.id === mapped.id)
      if (index < 0) return [mapped, ...list]
      const next = [...list]
      next[index] = mapped
      return next
    },
  )
}

export function upsertMostradorOrderCache(
  queryClient: QueryClient,
  popId: string,
  order: CounterOrder,
  inFlight?: Map<string, CounterOrder>,
) {
  if (order.saleId || order.status === "cancelled") {
    removeMostradorOrderCache(queryClient, popId, order.id)
    return
  }
  queryClient.setQueryData<CounterOrder[]>(
    popMostradorOrdersQueryKey(popId),
    (prev) => {
      const list = prev ?? []
      const mapped = overlayInFlightOrder(order, inFlight)
      const index = list.findIndex((item) => item.id === mapped.id)
      if (index < 0) return [mapped, ...list]
      const current = list[index]
      if (current && !isNewerTimestamp(mapped.updatedAt, current.updatedAt)) {
        return list.map((item, i) =>
          i === index ? overlayInFlightOrder(item, inFlight) : item,
        )
      }
      const next = [...list]
      next[index] = {
        ...mapped,
        checkout: mapped.checkout ?? current?.checkout ?? null,
      }
      return next
    },
  )
}

export function removeMostradorOrderCache(
  queryClient: QueryClient,
  popId: string,
  orderId: string,
) {
  queryClient.setQueryData<CounterOrder[]>(
    popMostradorOrdersQueryKey(popId),
    (prev) => (prev ?? []).filter((order) => order.id !== orderId),
  )
}

export function patchMostradorOrderCache(
  queryClient: QueryClient,
  popId: string,
  orderId: string,
  patch: Partial<CounterOrder>,
  inFlight?: Map<string, CounterOrder>,
) {
  queryClient.setQueryData<CounterOrder[]>(
    popMostradorOrdersQueryKey(popId),
    (prev) =>
      (prev ?? []).map((order) => {
        if (order.id !== orderId) return order
        if (
          patch.updatedAt &&
          !isNewerTimestamp(patch.updatedAt, order.updatedAt) &&
          patch.updatedAt !== order.updatedAt
        ) {
          return overlayInFlightOrder(order, inFlight)
        }
        return overlayInFlightOrder({ ...order, ...patch }, inFlight)
      }),
  )
}

export function applyMostradorCheckoutToOrderCache(
  queryClient: QueryClient,
  popId: string,
  orderId: string,
  updatedAt: string,
  checkout: unknown,
) {
  const snap =
    checkout && typeof checkout === "object" && !Array.isArray(checkout)
      ? parseTableSessionCheckout(checkout)
      : null
  queryClient.setQueryData<CounterOrder[]>(
    popMostradorOrdersQueryKey(popId),
    (prev) =>
      (prev ?? []).map((order) => {
        if (order.id !== orderId) return order
        if (!isNewerTimestamp(updatedAt, order.updatedAt)) return order
        return {
          ...order,
          updatedAt,
          checkout: snap ?? order.checkout,
        }
      }),
  )
}

export function applyComandaSendToOrderCache(
  queryClient: QueryClient,
  popId: string,
  orderId: string,
  sentCartLineIds: string[],
  peels: ComandaSendPeel[],
) {
  queryClient.setQueryData<CounterOrder[]>(
    popMostradorOrdersQueryKey(popId),
    (prev) =>
      (prev ?? []).map((order) => {
        if (order.id !== orderId || !order.checkout) return order
        return {
          ...order,
          checkout: {
            ...order.checkout,
            carrito: applyComandaSendToCart(
              order.checkout.carrito,
              sentCartLineIds,
              peels,
            ),
          },
        }
      }),
  )
}

export function applyComandaVoidToOrderCache(
  queryClient: QueryClient,
  popId: string,
  orderId: string,
  voidedCartLineIds: string[],
  peels: ComandaVoidPeel[],
) {
  queryClient.setQueryData<CounterOrder[]>(
    popMostradorOrdersQueryKey(popId),
    (prev) =>
      (prev ?? []).map((order) => {
        if (order.id !== orderId || !order.checkout) return order
        return {
          ...order,
          checkout: {
            ...order.checkout,
            carrito: applyComandaVoidToCart(
              order.checkout.carrito,
              voidedCartLineIds,
              peels,
            ),
          },
        }
      }),
  )
}

export function applyComandaStatusToOrderCache(
  queryClient: QueryClient,
  popId: string,
  orderId: string,
  cartLineId: string,
  status: ComandaStatus,
) {
  queryClient.setQueryData<CounterOrder[]>(
    popMostradorOrdersQueryKey(popId),
    (prev) =>
      (prev ?? []).map((order) => {
        if (order.id !== orderId || !order.checkout) return order
        return {
          ...order,
          checkout: {
            ...order.checkout,
            carrito: order.checkout.carrito.map((item) =>
              resolveCartLineId(item) === cartLineId
                ? { ...item, comandaStatus: status }
                : item,
            ),
          },
        }
      }),
  )
}
