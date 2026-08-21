"use client"

import {
  getComandaById,
  getComandaStations,
  getComandas,
  moveComandaStatus,
} from "@/app/[siteId]/[popId]/comandas/actions"
import { canMoveComandaTo } from "@/app/[siteId]/[popId]/comandas/comandasLogic"
import type {
  ComandaStation,
  ComandaStatus,
  ComandaTicket,
} from "@/app/[siteId]/[popId]/comandas/comandasTypes"
import {
  createKeyedDebouncer,
  readRealtimeRowId,
  subscribePostgresChanges,
  type RealtimeConnectionStatus,
} from "@/lib/supabaseRealtimeHelpers"
import { createClient } from "@/utils/supabase/client"
import { useCallback, useEffect, useRef, useState } from "react"

export function useComandasState(popId: string, siteId: string) {
  const [stations, setStations] = useState<ComandaStation[]>([])
  const [stationId, setStationId] = useState<string | null>(null)
  const [tickets, setTickets] = useState<ComandaTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [stationsLoading, setStationsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [realtimeStatus, setRealtimeStatus] =
    useState<RealtimeConnectionStatus>("connecting")
  const inFlightMovesRef = useRef(new Map<string, ComandaTicket>())
  const ticketSyncDebouncerRef = useRef(createKeyedDebouncer())
  const wasDisconnectedRef = useRef(false)
  const knownTicketIdsRef = useRef(new Set<string>())
  const stationIdRef = useRef<string | null>(null)

  useEffect(() => {
    stationIdRef.current = stationId
  }, [stationId])

  useEffect(() => {
    knownTicketIdsRef.current = new Set(tickets.map((ticket) => ticket.id))
  }, [tickets])

  const applyServerTickets = useCallback((serverTickets: ComandaTicket[]) => {
    const visible = serverTickets.filter((ticket) => ticket.status !== "pending")
    const inFlight = inFlightMovesRef.current
    if (inFlight.size === 0) {
      setTickets(visible)
      return
    }
    setTickets(
      visible.map((serverTicket) => {
        const optimistic = inFlight.get(serverTicket.id)
        return optimistic
          ? { ...serverTicket, status: optimistic.status }
          : serverTicket
      }),
    )
  }, [])

  const removeTicket = useCallback((ticketId: string) => {
    ticketSyncDebouncerRef.current.cancel(ticketId)
    setTickets((prev) => prev.filter((ticket) => ticket.id !== ticketId))
  }, [])

  const upsertTicket = useCallback((ticket: ComandaTicket) => {
    setTickets((prev) => {
      if (ticket.status === "pending") {
        return prev.filter((row) => row.id !== ticket.id)
      }
      if (stationIdRef.current && ticket.stationId !== stationIdRef.current) {
        return prev.filter((row) => row.id !== ticket.id)
      }
      const index = prev.findIndex((row) => row.id === ticket.id)
      if (index < 0) return [...prev, ticket]
      const next = [...prev]
      next[index] = ticket
      return next
    })
  }, [])

  const reloadStations = useCallback(async () => {
    if (!popId || !siteId) return
    const res = await getComandaStations(popId, siteId)
    if (!res.success) {
      setError(res.error)
      setStations([])
      return
    }
    setStations(res.stations)
    setStationId((current) => {
      if (current && res.stations.some((station) => station.id === current)) {
        return current
      }
      return res.stations[0]?.id ?? null
    })
  }, [popId, siteId])

  const reloadTickets = useCallback(async () => {
    if (!popId || !siteId || !stationId) {
      setTickets([])
      return
    }
    const res = await getComandas(popId, siteId, stationId)
    if (!res.success) {
      setError(res.error)
      setTickets([])
      return
    }
    setError(null)
    applyServerTickets(res.tickets)
  }, [popId, siteId, stationId, applyServerTickets])

  useEffect(() => {
    setStationsLoading(true)
    void reloadStations().finally(() => setStationsLoading(false))
  }, [reloadStations])

  useEffect(() => {
    if (!stationId) {
      setTickets([])
      setLoading(false)
      return
    }
    setLoading(true)
    void reloadTickets().finally(() => setLoading(false))
  }, [stationId, reloadTickets])

  const syncTicketFromServer = useCallback(
    async (ticketId: string) => {
      if (!popId || !siteId) return
      const res = await getComandaById(popId, siteId, ticketId)
      if (!res.success) {
        setError(res.error)
        return
      }
      setError(null)
      if (res.ticket) {
        upsertTicket(res.ticket)
        return
      }
      if (knownTicketIdsRef.current.has(ticketId)) {
        removeTicket(ticketId)
      }
    },
    [popId, siteId, upsertTicket, removeTicket],
  )

  const scheduleTicketSync = useCallback(
    (ticketId: string) => {
      ticketSyncDebouncerRef.current.schedule(ticketId, () => {
        void syncTicketFromServer(ticketId)
      })
    },
    [syncTicketFromServer],
  )

  useEffect(() => {
    if (!popId) return
    const supabase = createClient()
    const debouncer = ticketSyncDebouncerRef.current

    const channel = subscribePostgresChanges({
      supabase,
      channelName: `comandas:${popId}`,
      table: "comandas",
      filter: `pop_id=eq.${popId}`,
      onStatusChange: (status) => {
        if (status === "connected") {
          if (wasDisconnectedRef.current) {
            wasDisconnectedRef.current = false
            void reloadTickets()
          }
          setRealtimeStatus("connected")
          return
        }
        wasDisconnectedRef.current = true
        setRealtimeStatus("disconnected")
      },
      onChange: (payload) => {
        if (payload.eventType === "DELETE") {
          const ticketId = readRealtimeRowId(payload)
          if (ticketId) removeTicket(ticketId)
          return
        }
        const ticketId = readRealtimeRowId(payload)
        if (ticketId) scheduleTicketSync(ticketId)
      },
    })

    return () => {
      debouncer.clear()
      void supabase.removeChannel(channel)
    }
  }, [popId, reloadTickets, removeTicket, scheduleTicketSync])

  const applyOptimisticStatus = useCallback(
    (ticketId: string, status: ComandaStatus) => {
      let previous: ComandaTicket | undefined
      let skipped = false
      setTickets((prev) => {
        previous = prev.find((ticket) => ticket.id === ticketId)
        if (!previous || previous.status === status) {
          skipped = true
          return prev
        }
        const now = new Date().toISOString()
        const optimistic: ComandaTicket = {
          ...previous,
          status,
          statusChangedAt: now,
          sentAt: status === "sent" ? previous.sentAt ?? now : previous.sentAt,
          preparingAt:
            status === "preparing"
              ? previous.preparingAt ?? now
              : previous.preparingAt,
          readyAt: status === "ready" ? previous.readyAt ?? now : previous.readyAt,
          deliveredAt:
            status === "delivered"
              ? previous.deliveredAt ?? now
              : previous.deliveredAt,
        }
        inFlightMovesRef.current.set(ticketId, optimistic)
        return prev.map((ticket) =>
          ticket.id === ticketId ? optimistic : ticket,
        )
      })
      return { previous, skipped }
    },
    [],
  )

  const moveTicket = useCallback(
    async (ticketId: string, status: ComandaStatus) => {
      if (!popId || !siteId) return false
      const current = tickets.find((ticket) => ticket.id === ticketId)
      if (!current) return false
      if (!canMoveComandaTo(current.status, status)) return false

      const { previous, skipped } = applyOptimisticStatus(ticketId, status)
      if (skipped || !previous) return true

      const res = await moveComandaStatus(popId, siteId, ticketId, status)
      if (!res.success) {
        inFlightMovesRef.current.delete(ticketId)
        setTickets((prev) =>
          prev.map((ticket) => (ticket.id === ticketId ? previous : ticket)),
        )
        setError(res.error)
        return false
      }
      inFlightMovesRef.current.delete(ticketId)
      upsertTicket(res.ticket)
      return true
    },
    [popId, siteId, tickets, applyOptimisticStatus, upsertTicket],
  )

  return {
    stations,
    stationId,
    setStationId,
    tickets,
    loading: loading || stationsLoading,
    error,
    realtimeStatus,
    moveTicket,
    reloadTickets,
  }
}
