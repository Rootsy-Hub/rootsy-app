"use client"

import type {
  CounterOrder,
  CreateCounterOrderInput,
  UpdateCounterOrderInput,
} from "@/app/[siteId]/[popId]/mostrador/mostradorTypes"
import {
  overlayMostradorInFlight,
  removeMostradorOrderCache,
  replaceMostradorOrderCache,
} from "@/app/[siteId]/[popId]/mostrador/mostradorQueryCache"
import {
  cancelCounterOrderApi,
  createCounterOrderApi,
  fetchCounterOrders,
  patchCounterOrderApi,
  patchCounterOrderStatusApi,
} from "@/lib/rootsyApi/mostradorClient"
import { popMostradorOrdersQueryKey } from "@/lib/queryKeys"
import { sessionListQueryOptions } from "@/lib/queryStaleTimes"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

export function useMostradorState(popId: string, _siteId: string) {
  const queryClient = useQueryClient()
  const enabled = Boolean(popId)
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [orderError, setOrderError] = useState<string | null>(null)
  const inFlightMovesRef = useRef(new Map<string, CounterOrder>())

  const ordersQuery = useQuery({
    queryKey: popMostradorOrdersQueryKey(popId),
    queryFn: async () => {
      const res = await fetchCounterOrders(popId)
      if (!res.success) throw new Error(res.error)
      return overlayMostradorInFlight(res.orders, inFlightMovesRef.current)
    },
    enabled,
    ...sessionListQueryOptions,
  })

  const orders = ordersQuery.data ?? []
  const loading = ordersQuery.isLoading

  const reloadOrders = useCallback(async () => {
    if (!popId) return
    await queryClient.invalidateQueries({
      queryKey: popMostradorOrdersQueryKey(popId),
      refetchType: "all",
    })
  }, [popId, queryClient])

  const removeOrder = useCallback(
    (orderId: string) => {
      if (!popId) return
      removeMostradorOrderCache(queryClient, popId, orderId)
    },
    [popId, queryClient],
  )

  const selectedOrder = useMemo(
    () => orders.find((o) => o.id === selectedOrderId) ?? null,
    [orders, selectedOrderId],
  )

  useEffect(() => {
    if (selectedOrderId && !orders.some((o) => o.id === selectedOrderId)) {
      setSelectedOrderId(null)
    }
  }, [orders, selectedOrderId])

  const selectOrder = useCallback((orderId: string | null) => {
    setSelectedOrderId(orderId)
  }, [])

  const createOrder = useCallback(
    async (input: CreateCounterOrderInput) => {
      if (!popId) return false
      const res = await createCounterOrderApi(popId, input)
      if (!res.success) {
        setOrderError(res.error)
        return false
      }
      setOrderError(null)
      replaceMostradorOrderCache(queryClient, popId, res.order)
      setSelectedOrderId(res.order.id)
      return true
    },
    [popId, queryClient],
  )

  const patchOrder = useCallback(
    async (orderId: string, input: UpdateCounterOrderInput) => {
      if (!popId) return false
      const res = await patchCounterOrderApi(popId, orderId, input)
      if (!res.success) {
        setOrderError(res.error)
        return false
      }
      setOrderError(null)
      replaceMostradorOrderCache(queryClient, popId, res.order)
      return true
    },
    [popId, queryClient],
  )

  const moveOrderStatus = useCallback(
    async (orderId: string, status: CounterOrder["status"]) => {
      if (!popId) return false
      if (status === "cancelled") return false

      const previousOrder = queryClient
        .getQueryData<CounterOrder[]>(popMostradorOrdersQueryKey(popId))
        ?.find((o) => o.id === orderId)
      if (!previousOrder || previousOrder.status === status) return true

      const optimisticOrder: CounterOrder = {
        ...previousOrder,
        status,
        deliveredAt: status === "delivered" ? new Date().toISOString() : null,
      }
      inFlightMovesRef.current.set(orderId, optimisticOrder)
      replaceMostradorOrderCache(
        queryClient,
        popId,
        optimisticOrder,
        inFlightMovesRef.current,
      )

      setOrderError(null)
      const res = await patchCounterOrderStatusApi(popId, orderId, status)

      if (!res.success) {
        inFlightMovesRef.current.delete(orderId)
        replaceMostradorOrderCache(queryClient, popId, previousOrder)
        setOrderError(res.error)
        return false
      }

      inFlightMovesRef.current.delete(orderId)
      replaceMostradorOrderCache(queryClient, popId, res.order)
      return true
    },
    [popId, queryClient],
  )

  const cancelOrder = useCallback(
    async (orderId: string) => {
      if (!popId) return false
      const res = await cancelCounterOrderApi(popId, orderId)
      if (!res.success) {
        setOrderError(res.error)
        return false
      }
      setOrderError(null)
      if (selectedOrderId === orderId) setSelectedOrderId(null)
      removeOrder(orderId)
      return true
    },
    [popId, selectedOrderId, removeOrder],
  )

  return {
    orders,
    loading,
    orderError: orderError ?? ordersQuery.error?.message ?? null,
    selectedOrderId,
    selectedOrder,
    selectOrder,
    createOrder,
    patchOrder,
    moveOrderStatus,
    cancelOrder,
    reloadOrders,
    removeOrder,
  }
}
