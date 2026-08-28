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
import {
  deleteMostradorOrderSlim,
  upsertMostradorOrderSlim,
} from "@/lib/popLocalDb/mostradorBoardRepo"
import { writeMostradorBoardIfOpen } from "@/lib/popLocalDb/mesasFloorPersist"
import {
  popMostradorOrderQueryKey,
  popMostradorOrdersQueryKey,
} from "@/lib/queryKeys"

function isNewerTimestamp(next: string, prev: string | undefined): boolean {
  if (!prev) return true
  const nextMs = Date.parse(next)
  const prevMs = Date.parse(prev)
  if (Number.isFinite(nextMs) && Number.isFinite(prevMs)) {
    return nextMs > prevMs
  }
  return next > prev
}

function isCheckoutTimestampCurrent(
  next: string,
  prev: string | undefined,
): boolean {
  if (!prev) return true
  const nextMs = Date.parse(next)
  const prevMs = Date.parse(prev)
  if (Number.isFinite(nextMs) && Number.isFinite(prevMs)) {
    return nextMs >= prevMs
  }
  return next >= prev
}

function floorOrder(order: CounterOrder): CounterOrder {
  return { ...order, checkout: null }
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

function writeMostradorOrderDetail(
  queryClient: QueryClient,
  popId: string,
  order: CounterOrder,
  inFlight?: Map<string, CounterOrder>,
) {
  queryClient.setQueryData<CounterOrder>(
    popMostradorOrderQueryKey(popId, order.id),
    (prev) => {
      const incoming = overlayInFlightOrder(order, inFlight)
      if (!prev) return incoming.checkout ? incoming : prev
      if (!isNewerTimestamp(incoming.updatedAt, prev.updatedAt)) {
        return overlayInFlightOrder(prev, inFlight)
      }
      return overlayInFlightOrder(
        {
          ...prev,
          ...floorOrder(incoming),
          checkout: incoming.checkout ?? prev.checkout,
        },
        inFlight,
      )
    },
  )
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
  const mapped = overlayInFlightOrder(floorOrder(order), inFlight)
  queryClient.setQueryData<CounterOrder[]>(
    popMostradorOrdersQueryKey(popId),
    (prev) => {
      const list = prev ?? []
      const index = list.findIndex((item) => item.id === mapped.id)
      if (index < 0) return [mapped, ...list]
      const next = [...list]
      next[index] = mapped
      return next
    },
  )
  writeMostradorOrderDetail(queryClient, popId, order, inFlight)
  writeMostradorBoardIfOpen(popId, (db) => {
    upsertMostradorOrderSlim(db, mapped)
  })
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
  const mapped = overlayInFlightOrder(floorOrder(order), inFlight)
  queryClient.setQueryData<CounterOrder[]>(
    popMostradorOrdersQueryKey(popId),
    (prev) => {
      const list = prev ?? []
      const index = list.findIndex((item) => item.id === mapped.id)
      if (index < 0) return [mapped, ...list]
      const current = list[index]
      if (current && !isNewerTimestamp(mapped.updatedAt, current.updatedAt)) {
        return list.map((item, i) =>
          i === index ? overlayInFlightOrder(item, inFlight) : item,
        )
      }
      const next = [...list]
      next[index] = mapped
      return next
    },
  )
  writeMostradorOrderDetail(queryClient, popId, order, inFlight)
  writeMostradorBoardIfOpen(popId, (db) => {
    upsertMostradorOrderSlim(db, mapped)
  })
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
  queryClient.removeQueries({
    queryKey: popMostradorOrderQueryKey(popId, orderId),
  })
  writeMostradorBoardIfOpen(popId, (db) => {
    deleteMostradorOrderSlim(db, orderId)
  })
}

export function setMostradorOrderDetailCache(
  queryClient: QueryClient,
  popId: string,
  order: CounterOrder,
) {
  queryClient.setQueryData(popMostradorOrderQueryKey(popId, order.id), order)
}

export function patchMostradorOrderCache(
  queryClient: QueryClient,
  popId: string,
  orderId: string,
  patch: Partial<CounterOrder>,
  inFlight?: Map<string, CounterOrder>,
) {
  const { checkout: _checkout, ...floorPatch } = patch
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
        return overlayInFlightOrder(
          { ...order, ...floorPatch, checkout: null },
          inFlight,
        )
      }),
  )
  queryClient.setQueryData<CounterOrder>(
    popMostradorOrderQueryKey(popId, orderId),
    (prev) => {
      if (!prev) return prev
      if (
        patch.updatedAt &&
        !isNewerTimestamp(patch.updatedAt, prev.updatedAt) &&
        patch.updatedAt !== prev.updatedAt
      ) {
        return overlayInFlightOrder(prev, inFlight)
      }
      return overlayInFlightOrder(
        {
          ...prev,
          ...floorPatch,
          checkout: patch.checkout ?? prev.checkout,
        },
        inFlight,
      )
    },
  )
  writeMostradorBoardIfOpen(popId, (db) => {
    const current = queryClient
      .getQueryData<CounterOrder[]>(popMostradorOrdersQueryKey(popId))
      ?.find((order) => order.id === orderId)
    if (current) upsertMostradorOrderSlim(db, current)
  })
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
        if (!isCheckoutTimestampCurrent(updatedAt, order.updatedAt)) return order
        return { ...order, updatedAt, checkout: null }
      }),
  )
  queryClient.setQueryData<CounterOrder>(
    popMostradorOrderQueryKey(popId, orderId),
    (prev) => {
      if (!prev) {
        if (!snap) return prev
        const floor = queryClient
          .getQueryData<CounterOrder[]>(popMostradorOrdersQueryKey(popId))
          ?.find((order) => order.id === orderId)
        if (!floor) return prev
        return { ...floor, updatedAt, checkout: snap }
      }
      if (!isCheckoutTimestampCurrent(updatedAt, prev.updatedAt)) return prev
      return {
        ...prev,
        updatedAt,
        checkout: snap ?? prev.checkout,
      }
    },
  )
  writeMostradorBoardIfOpen(popId, (db) => {
    const current = queryClient
      .getQueryData<CounterOrder[]>(popMostradorOrdersQueryKey(popId))
      ?.find((order) => order.id === orderId)
    if (current) upsertMostradorOrderSlim(db, current)
  })
}

export function applyComandaSendToOrderCache(
  queryClient: QueryClient,
  popId: string,
  orderId: string,
  sentCartLineIds: string[],
  peels: ComandaSendPeel[],
) {
  queryClient.setQueryData<CounterOrder>(
    popMostradorOrderQueryKey(popId, orderId),
    (prev) => {
      if (!prev?.checkout) return prev
      return {
        ...prev,
        checkout: {
          ...prev.checkout,
          carrito: applyComandaSendToCart(
            prev.checkout.carrito,
            sentCartLineIds,
            peels,
          ),
        },
      }
    },
  )
}

export function applyComandaVoidToOrderCache(
  queryClient: QueryClient,
  popId: string,
  orderId: string,
  voidedCartLineIds: string[],
  peels: ComandaVoidPeel[],
) {
  queryClient.setQueryData<CounterOrder>(
    popMostradorOrderQueryKey(popId, orderId),
    (prev) => {
      if (!prev?.checkout) return prev
      return {
        ...prev,
        checkout: {
          ...prev.checkout,
          carrito: applyComandaVoidToCart(
            prev.checkout.carrito,
            voidedCartLineIds,
            peels,
          ),
        },
      }
    },
  )
}

export function applyComandaStatusToOrderCache(
  queryClient: QueryClient,
  popId: string,
  orderId: string,
  cartLineId: string,
  status: ComandaStatus,
) {
  queryClient.setQueryData<CounterOrder>(
    popMostradorOrderQueryKey(popId, orderId),
    (prev) => {
      if (!prev?.checkout) return prev
      return {
        ...prev,
        checkout: {
          ...prev.checkout,
          carrito: prev.checkout.carrito.map((item) =>
            resolveCartLineId(item) === cartLineId
              ? { ...item, comandaStatus: status }
              : item,
          ),
        },
      }
    },
  )
}
