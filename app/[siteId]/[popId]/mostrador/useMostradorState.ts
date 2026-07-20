"use client"

import {
  cancelCounterOrder,
  createCounterOrder,
  getCounterOrders,
  updateCounterOrder,
  updateCounterOrderStatus,
  type CounterOrderRow,
} from "@/app/[siteId]/[popId]/mostrador/actions"
import type {
  CounterOrder,
  CreateCounterOrderInput,
  UpdateCounterOrderInput,
} from "@/app/[siteId]/[popId]/mostrador/mostradorTypes"
import { createClient } from "@/utils/supabase/client"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

function mapOrderRow(row: CounterOrderRow): CounterOrder {
  return {
    id: row.id,
    orderDay: row.orderDay,
    orderNumber: row.orderNumber,
    status: row.status,
    fulfillmentType: row.fulfillmentType,
    deliveryAddress: row.deliveryAddress,
    phone: row.phone,
    driverName: row.driverName,
    estimatedMinutes: row.estimatedMinutes,
    notes: row.notes,
    immediateFulfillment: row.immediateFulfillment,
    saleId: row.saleId,
    isPaid: row.saleId != null,
    openedAt: row.openedAt,
    updatedAt: row.updatedAt,
    deliveredAt: row.deliveredAt,
    checkout: row.checkout,
  }
}

export function useMostradorState(popId: string, siteId: string) {
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

  const reloadOrders = useCallback(async () => {
    if (!popId || !siteId) return
    const res = await getCounterOrders(popId, siteId)
    if (!res.success) {
      setOrderError(res.error)
      setOrders([])
      return
    }
    setOrderError(null)
    applyServerOrders(res.orders.map(mapOrderRow))
  }, [popId, siteId, applyServerOrders])

  useEffect(() => {
    setLoading(true)
    void reloadOrders().finally(() => setLoading(false))
  }, [reloadOrders])

  useEffect(() => {
    if (!popId) return
    const supabase = createClient()
    const channel = supabase
      .channel(`mostrador-counter-orders:${popId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "counter_orders",
          filter: `pop_id=eq.${popId}`,
        },
        () => {
          void reloadOrders()
        },
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [popId, reloadOrders])

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
      if (!popId || !siteId) return false
      const res = await createCounterOrder(popId, siteId, input)
      if (!res.success) {
        setOrderError(res.error)
        return false
      }
      setOrderError(null)
      setSelectedOrderId(res.order.id)
      await reloadOrders()
      return true
    },
    [popId, siteId, reloadOrders],
  )

  const patchOrder = useCallback(
    async (orderId: string, input: UpdateCounterOrderInput) => {
      if (!popId || !siteId) return false
      const res = await updateCounterOrder(popId, siteId, orderId, input)
      if (!res.success) {
        setOrderError(res.error)
        return false
      }
      setOrderError(null)
      await reloadOrders()
      return true
    },
    [popId, siteId, reloadOrders],
  )

  const moveOrderStatus = useCallback(
    async (orderId: string, status: CounterOrder["status"]) => {
      if (!popId || !siteId) return false
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

      const res = await updateCounterOrderStatus(popId, siteId, orderId, status)

      if (!res.success) {
        inFlightMovesRef.current.delete(orderId)
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? previousOrder! : o)),
        )
        setOrderError(res.error)
        return false
      }

      inFlightMovesRef.current.delete(orderId)
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? mapOrderRow(res.order) : o,
        ),
      )
      return true
    },
    [popId, siteId],
  )

  const cancelOrder = useCallback(
    async (orderId: string) => {
      if (!popId || !siteId) return false
      const res = await cancelCounterOrder(popId, siteId, orderId)
      if (!res.success) {
        setOrderError(res.error)
        return false
      }
      setOrderError(null)
      if (selectedOrderId === orderId) setSelectedOrderId(null)
      await reloadOrders()
      return true
    },
    [popId, siteId, selectedOrderId, reloadOrders],
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
