"use client"

import {
  canAckComandaVoid,
  canMoveComandaTo,
} from "@/app/[siteId]/[popId]/comandas/comandasLogic"
import {
  overlayComandasInFlight,
  replaceComandaTicketCache,
  replaceComandasTicketsCaches,
} from "@/app/[siteId]/[popId]/comandas/comandasQueryCache"
import type {
  ComandaStatus,
  ComandaTicket,
} from "@/app/[siteId]/[popId]/comandas/comandasTypes"
import { useComandasBoardHydrate } from "@/hooks/useComandasBoardHydrate"
import {
  readComandasTicketsLocalOrFetch,
  refreshComandasTicketsFromNetwork,
} from "@/lib/popLocalDb/hydrateComandasBoard"
import {
  fetchComandaStations,
  moveComandaStatusApi,
} from "@/lib/rootsyApi/comandasClient"
import {
  popComandasStationsQueryKey,
  popComandasTicketsQueryKey,
} from "@/lib/queryKeys"
import { sessionListQueryOptions } from "@/lib/queryStaleTimes"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useCallback, useEffect, useRef, useState } from "react"

function applyStatusTimestamps(
  ticket: ComandaTicket,
  status: ComandaStatus,
  now: string,
): ComandaTicket {
  return {
    ...ticket,
    status,
    statusChangedAt: now,
    sentAt: status === "sent" ? ticket.sentAt ?? now : ticket.sentAt,
    preparingAt:
      status === "preparing" ? ticket.preparingAt ?? now : ticket.preparingAt,
    readyAt: status === "ready" ? ticket.readyAt ?? now : ticket.readyAt,
    deliveredAt:
      status === "delivered" ? ticket.deliveredAt ?? now : ticket.deliveredAt,
  }
}

export function useComandasState(popId: string, _siteId: string) {
  const queryClient = useQueryClient()
  const boardHydrate = useComandasBoardHydrate(popId)
  const enabled = Boolean(popId)
  const boardEnabled = enabled && boardHydrate.canReadBoard
  const [stationId, setStationId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const inFlightMovesRef = useRef(new Map<string, ComandaTicket>())

  const stationsQuery = useQuery({
    queryKey: popComandasStationsQueryKey(popId),
    queryFn: async () => {
      const res = await fetchComandaStations(popId)
      if (!res.success) throw new Error(res.error)
      return res.stations
    },
    enabled,
    ...sessionListQueryOptions,
  })

  const stations = stationsQuery.data ?? []

  useEffect(() => {
    setStationId((current) => {
      if (current && stations.some((station) => station.id === current)) {
        return current
      }
      return stations[0]?.id ?? null
    })
  }, [stations])

  const ticketsQuery = useQuery({
    queryKey: popComandasTicketsQueryKey(popId, stationId ?? ""),
    queryFn: async () => {
      if (!stationId) return [] as ComandaTicket[]
      const tickets = await readComandasTicketsLocalOrFetch(popId, stationId)
      return overlayComandasInFlight(tickets, inFlightMovesRef.current)
    },
    enabled: boardEnabled && Boolean(stationId),
    ...sessionListQueryOptions,
  })

  const tickets = ticketsQuery.data ?? []

  const reloadTickets = useCallback(async () => {
    if (!popId) return
    const { stations, tickets } = await refreshComandasTicketsFromNetwork(popId)
    replaceComandasTicketsCaches(
      queryClient,
      popId,
      stations,
      overlayComandasInFlight(tickets, inFlightMovesRef.current),
    )
  }, [popId, queryClient])

  const moveTicket = useCallback(
    async (ticketId: string, status: ComandaStatus) => {
      if (!popId) return false
      const current = (
        queryClient.getQueryData<ComandaTicket[]>(
          popComandasTicketsQueryKey(popId, stationId ?? ""),
        ) ?? tickets
      ).find((ticket) => ticket.id === ticketId)
      if (!current) return false
      const isAckVoid = canAckComandaVoid(current.sendKind, current.status)
      if (status === "voided") {
        if (!isAckVoid) return false
      } else if (!canMoveComandaTo(current.status, status)) {
        return false
      }
      if (current.status === status) return true

      const now = new Date().toISOString()
      const optimistic = applyStatusTimestamps(current, status, now)
      const sendId = current.sendId
      const group =
        sendId == null
          ? [current]
          : (
              queryClient.getQueryData<ComandaTicket[]>(
                popComandasTicketsQueryKey(popId, current.stationId),
              ) ?? tickets
            ).filter((ticket) => ticket.sendId === sendId)

      for (const ticket of group) {
        const next = applyStatusTimestamps(ticket, status, now)
        inFlightMovesRef.current.set(ticket.id, next)
        replaceComandaTicketCache(
          queryClient,
          popId,
          next,
          inFlightMovesRef.current,
        )
      }

      const res = await moveComandaStatusApi(popId, ticketId, status)
      if (!res.success) {
        for (const ticket of group) {
          inFlightMovesRef.current.delete(ticket.id)
          replaceComandaTicketCache(queryClient, popId, ticket)
        }
        setError(res.error)
        return false
      }

      inFlightMovesRef.current.delete(ticketId)
      for (const ticket of group) {
        inFlightMovesRef.current.delete(ticket.id)
      }
      replaceComandaTicketCache(queryClient, popId, res.ticket)
      if (res.ticket.sendId) {
        const siblings = (
          queryClient.getQueryData<ComandaTicket[]>(
            popComandasTicketsQueryKey(popId, res.ticket.stationId),
          ) ?? []
        ).filter(
          (ticket) =>
            ticket.id !== res.ticket.id && ticket.sendId === res.ticket.sendId,
        )
        for (const sibling of siblings) {
          replaceComandaTicketCache(
            queryClient,
            popId,
            applyStatusTimestamps(
              sibling,
              res.ticket.status,
              res.ticket.statusChangedAt,
            ),
          )
        }
      }
      setError(null)
      return true
    },
    [popId, queryClient, stationId, tickets],
  )

  return {
    stations,
    stationId,
    setStationId,
    tickets,
    loading:
      stationsQuery.isLoading ||
      !boardHydrate.canReadBoard ||
      (Boolean(stationId) && ticketsQuery.isLoading),
    error:
      error ??
      stationsQuery.error?.message ??
      ticketsQuery.error?.message ??
      null,
    moveTicket,
    reloadTickets,
  }
}
