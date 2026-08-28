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
  setMostradorOrderDetailCache,
} from "@/app/[siteId]/[popId]/mostrador/mostradorQueryCache"
import { useMostradorBoardHydrate } from "@/hooks/useMostradorBoardHydrate"
import {
  readMostradorOrdersLocalOrFetch,
  refreshMostradorOrdersFromNetwork,
} from "@/lib/popLocalDb/hydrateMostradorBoard"
import {
  cancelCounterOrderApi,
  createCounterOrderApi,
  fetchCounterOrder,
  patchCounterOrderApi,
  patchCounterOrderStatusApi,
} from "@/lib/rootsyApi/mostradorClient"
import {
  popMostradorOrderQueryKey,
  popMostradorOrdersQueryKey,
} from "@/lib/queryKeys"
import { readMostradorWorkspacePreference } from "@/lib/mostradorWorkspacePreference"
import { sessionListQueryOptions } from "@/lib/queryStaleTimes"
import { readInitialSaleCheckoutFromCache } from "@/lib/saleCheckoutDefaults"
import { usePopSaleComprobanteFiscalContext } from "@/hooks/usePopSaleComprobanteFiscalContext"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

export function useMostradorState(popId: string, _siteId: string) {
  const queryClient = useQueryClient()
  const fiscal = usePopSaleComprobanteFiscalContext()
  const boardHydrate = useMostradorBoardHydrate(popId)
  const enabled = Boolean(popId)
  const boardEnabled = enabled && boardHydrate.canReadBoard
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [orderError, setOrderError] = useState<string | null>(null)
  const inFlightMovesRef = useRef(new Map<string, CounterOrder>())
  const orderRestoredRef = useRef(false)
  const orderDetailIdRef = useRef<string | null>(null)

  const ordersQuery = useQuery({
    queryKey: popMostradorOrdersQueryKey(popId),
    queryFn: async () => {
      const orders = await readMostradorOrdersLocalOrFetch(popId)
      return overlayMostradorInFlight(orders, inFlightMovesRef.current)
    },
    enabled: boardEnabled,
    ...sessionListQueryOptions,
  })

  const orders = ordersQuery.data ?? []
  const loading = ordersQuery.isLoading || !boardHydrate.canReadBoard

  useEffect(() => {
    orderRestoredRef.current = false
  }, [popId])

  useEffect(() => {
    if (!popId || orderRestoredRef.current) return
    if (!boardHydrate.canReadBoard || ordersQuery.isLoading) return
    orderRestoredRef.current = true
    const saved = readMostradorWorkspacePreference(popId)
    if (!saved?.orderId) return
    if (orders.some((order) => order.id === saved.orderId)) {
      setSelectedOrderId(saved.orderId)
    }
  }, [
    popId,
    boardHydrate.canReadBoard,
    ordersQuery.isLoading,
    orders,
  ])

  if (selectedOrderId) orderDetailIdRef.current = selectedOrderId
  const orderDetailId = selectedOrderId ?? orderDetailIdRef.current

  const orderDetailQuery = useQuery({
    queryKey: popMostradorOrderQueryKey(popId, orderDetailId ?? ""),
    queryFn: async ({ queryKey }) => {
      const orderId = queryKey[3]
      if (!orderId) return null
      const res = await fetchCounterOrder(popId, orderId)
      if (!res.success) throw new Error(res.error)
      if (!res.order) {
        removeMostradorOrderCache(queryClient, popId, orderId)
        return null
      }
      replaceMostradorOrderCache(
        queryClient,
        popId,
        res.order,
        inFlightMovesRef.current,
      )
      setMostradorOrderDetailCache(queryClient, popId, res.order)
      return res.order
    },
    enabled: enabled && Boolean(selectedOrderId && orderDetailId),
    ...sessionListQueryOptions,
  })

  const reloadOrders = useCallback(async () => {
    if (!popId) return
    const next = await refreshMostradorOrdersFromNetwork(popId)
    queryClient.setQueryData(
      popMostradorOrdersQueryKey(popId),
      overlayMostradorInFlight(next, inFlightMovesRef.current),
    )
  }, [popId, queryClient])

  const removeOrder = useCallback(
    (orderId: string) => {
      if (!popId) return
      removeMostradorOrderCache(queryClient, popId, orderId)
    },
    [popId, queryClient],
  )

  const orderTicketReady =
    !selectedOrderId ||
    orderDetailQuery.data != null ||
    orderDetailQuery.isFetched

  const selectedOrder = useMemo(() => {
    if (!selectedOrderId) return null
    const floor = orders.find((o) => o.id === selectedOrderId) ?? null
    if (!floor) return null
    return {
      ...floor,
      updatedAt: orderDetailQuery.data?.updatedAt ?? floor.updatedAt,
      checkout: orderTicketReady
        ? orderDetailQuery.data?.checkout ?? null
        : null,
    }
  }, [
    orders,
    selectedOrderId,
    orderTicketReady,
    orderDetailQuery.data,
    orderDetailQuery.data?.updatedAt,
    orderDetailQuery.data?.checkout,
  ])

  useEffect(() => {
    if (!selectedOrderId || orders.length === 0) return
    if (!orders.some((order) => order.id === selectedOrderId)) {
      setSelectedOrderId(null)
    }
  }, [orders, selectedOrderId])

  const selectOrder = useCallback((orderId: string | null) => {
    setSelectedOrderId(orderId)
  }, [])

  const createOrder = useCallback(
    async (input: CreateCounterOrderInput) => {
      if (!popId) return false
      const res = await createCounterOrderApi(popId, {
        ...input,
        checkout: readInitialSaleCheckoutFromCache(queryClient, popId, {
          popEmisorIvaCondition: fiscal.popEmisorIvaCondition,
          hasValidPopFiscalCuit: fiscal.hasValidPopFiscalCuit,
        }),
      })
      if (!res.success) {
        setOrderError(res.error)
        return false
      }
      setOrderError(null)
      replaceMostradorOrderCache(queryClient, popId, res.order)
      setMostradorOrderDetailCache(queryClient, popId, res.order)
      setSelectedOrderId(res.order.id)
      return true
    },
    [fiscal.hasValidPopFiscalCuit, fiscal.popEmisorIvaCondition, popId, queryClient],
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
      setMostradorOrderDetailCache(queryClient, popId, res.order)
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
    orderError:
      orderError ??
      ordersQuery.error?.message ??
      orderDetailQuery.error?.message ??
      null,
    selectedOrderId,
    selectedOrder,
    orderTicketReady,
    selectOrder,
    createOrder,
    patchOrder,
    moveOrderStatus,
    cancelOrder,
    reloadOrders,
    removeOrder,
  }
}
