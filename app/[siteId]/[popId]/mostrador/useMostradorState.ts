"use client"

import type {
  CounterOrder,
  CreateCounterOrderInput,
  UpdateCounterOrderInput,
} from "@/app/[siteId]/[popId]/mostrador/mostradorTypes"
import {
  cancelCounterOrderApi,
  createCounterOrderApi,
  fetchCounterOrders,
  patchCounterOrderApi,
  patchCounterOrderStatusApi,
} from "@/lib/rootsyApi/mostradorClient"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

export function useMostradorState(popId: string, _siteId: string) {
  const [orders, setOrders] = useState<CounterOrder[]>([])
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [orderError, setOrderError] = useState<string | null>(null)
  const inFlightMovesRef = useRef(new Map<string, CounterOrder>())

  const applyServerOrders = useCallback((serverOrders: CounterOrder[]) => {
    const inFlight = inFlightMovesRef.current
    if (inFlight.size === 0) {
      setOrders(serverOrders)
      return
    }

    setOrders(
      serverOrders.map((serverOrder) => {
        const optimistic = inFlight.get(serverOrder.id)
        if (!optimistic) return serverOrder
        return {
          ...serverOrder,
          status: optimistic.status,
          deliveredAt: optimistic.deliveredAt,
        }
      }),
    )
  }, [])

  const removeOrder = useCallback((orderId: string) => {
    setOrders((prev) => prev.filter((order) => order.id !== orderId))
  }, [])

  const upsertOrder = useCallback((mapped: CounterOrder) => {
    setOrders((prev) => {
      const index = prev.findIndex((order) => order.id === mapped.id)
      if (index < 0) return [mapped, ...prev]
      const next = [...prev]
      next[index] = mapped
      return next
    })
  }, [])

  const reloadOrders = useCallback(async () => {
    if (!popId) return
    const res = await fetchCounterOrders(popId)
    if (!res.success) {
      setOrderError(res.error)
      setOrders([])
      return
    }
    setOrderError(null)
    applyServerOrders(res.orders)
  }, [popId, applyServerOrders])

  useEffect(() => {
    setLoading(true)
    void reloadOrders().finally(() => setLoading(false))
  }, [reloadOrders])

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
      upsertOrder(res.order)
      setSelectedOrderId(res.order.id)
      return true
    },
    [popId, upsertOrder],
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
      upsertOrder(res.order)
      return true
    },
    [popId, upsertOrder],
  )

  const moveOrderStatus = useCallback(
    async (orderId: string, status: CounterOrder["status"]) => {
      if (!popId) return false
      if (status === "cancelled") return false

      let previousOrder: CounterOrder | undefined
      let skipped = false

      setOrders((prev) => {
        previousOrder = prev.find((o) => o.id === orderId)
        if (!previousOrder || previousOrder.status === status) {
          skipped = true
          return prev
        }

        const optimisticOrder: CounterOrder = {
          ...previousOrder,
          status,
          deliveredAt:
            status === "delivered" ? new Date().toISOString() : null,
        }
        inFlightMovesRef.current.set(orderId, optimisticOrder)

        return prev.map((o) => (o.id === orderId ? optimisticOrder : o))
      })

      if (skipped || !previousOrder) return true

      setOrderError(null)

      const res = await patchCounterOrderStatusApi(popId, orderId, status)

      if (!res.success) {
        inFlightMovesRef.current.delete(orderId)
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? previousOrder! : o)),
        )
        setOrderError(res.error)
        return false
      }

      inFlightMovesRef.current.delete(orderId)
      upsertOrder(res.order)
      return true
    },
    [popId, upsertOrder],
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
    orderError,
    selectedOrderId,
    selectedOrder,
    selectOrder,
    createOrder,
    patchOrder,
    moveOrderStatus,
    cancelOrder,
    reloadOrders,
  }
}
