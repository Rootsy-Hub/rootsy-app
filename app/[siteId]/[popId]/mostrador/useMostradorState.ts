"use client"

import {
  cancelCounterOrder,
  createCounterOrder,
  getCounterOrderById,
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
import {
  createKeyedDebouncer,
  readRealtimeRowId,
  subscribePostgresChanges,
  type RealtimeConnectionStatus,
} from "@/lib/supabaseRealtimeHelpers"
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
  const [realtimeStatus, setRealtimeStatus] =
    useState<RealtimeConnectionStatus>("connecting")
  const inFlightMovesRef = useRef(new Map<string, CounterOrder>())
  const orderSyncDebouncerRef = useRef(createKeyedDebouncer())
  const wasDisconnectedRef = useRef(false)
  const knownOrderIdsRef = useRef(new Set<string>())

  useEffect(() => {
    knownOrderIdsRef.current = new Set(orders.map((order) => order.id))
  }, [orders])

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
    orderSyncDebouncerRef.current.cancel(orderId)
    setOrders((prev) => prev.filter((order) => order.id !== orderId))
  }, [])

  const upsertOrder = useCallback((row: CounterOrderRow) => {
    const mapped = mapOrderRow(row)
    setOrders((prev) => {
      const index = prev.findIndex((order) => order.id === mapped.id)
      if (index < 0) return [mapped, ...prev]
      const next = [...prev]
      next[index] = mapped
      return next
    })
  }, [])

  const syncOrderFromServer = useCallback(
    async (orderId: string) => {
      if (!popId || !siteId) return

      const res = await getCounterOrderById(popId, siteId, orderId)
      if (!res.success) {
        setOrderError(res.error)
        return
      }

      setOrderError(null)
      if (res.order) {
        upsertOrder(res.order)
        return
      }

      if (knownOrderIdsRef.current.has(orderId)) {
        removeOrder(orderId)
      }
    },
    [popId, siteId, upsertOrder, removeOrder],
  )

  const scheduleOrderSync = useCallback(
    (orderId: string) => {
      orderSyncDebouncerRef.current.schedule(orderId, () => {
        void syncOrderFromServer(orderId)
      })
    },
    [syncOrderFromServer],
  )

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
    const debouncer = orderSyncDebouncerRef.current

    const ordersChannel = subscribePostgresChanges({
      supabase,
      channelName: `mostrador-counter-orders:${popId}`,
      table: "counter_orders",
      filter: `pop_id=eq.${popId}`,
      onStatusChange: (status) => {
        if (status === "connected") {
          if (wasDisconnectedRef.current) {
            wasDisconnectedRef.current = false
            void reloadOrders()
          }
          setRealtimeStatus("connected")
          return
        }

        wasDisconnectedRef.current = true
        setRealtimeStatus("disconnected")
      },
      onChange: (payload) => {
        if (payload.eventType === "DELETE") {
          const orderId = readRealtimeRowId(payload)
          if (orderId) removeOrder(orderId)
          return
        }

        const orderId = readRealtimeRowId(payload)
        if (orderId) scheduleOrderSync(orderId)
      },
    })

    return () => {
      debouncer.clear()
      void supabase.removeChannel(ordersChannel)
    }
  }, [popId, reloadOrders, removeOrder, scheduleOrderSync])

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
      upsertOrder(res.order)
      setSelectedOrderId(res.order.id)
      return true
    },
    [popId, siteId, upsertOrder],
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
      upsertOrder(res.order)
      return true
    },
    [popId, siteId, upsertOrder],
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
      upsertOrder(res.order)
      return true
    },
    [popId, siteId, upsertOrder],
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
      removeOrder(orderId)
      return true
    },
    [popId, siteId, selectedOrderId, removeOrder],
  )

  return {
    orders,
    loading,
    orderError,
    realtimeStatus,
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
