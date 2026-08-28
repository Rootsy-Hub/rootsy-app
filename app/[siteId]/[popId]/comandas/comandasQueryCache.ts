import type { QueryClient } from "@tanstack/react-query"
import { isComandaBoardVisible } from "@/app/[siteId]/[popId]/comandas/comandasLogic"
import type {
  ComandaTicket,
} from "@/app/[siteId]/[popId]/comandas/comandasTypes"
import {
  deleteComandaTicket,
  deleteComandaTicketsBySendId,
  upsertComandaTicket,
} from "@/lib/popLocalDb/comandasBoardRepo"
import { writeComandasBoardIfOpen } from "@/lib/popLocalDb/mesasFloorPersist"
import {
  popComandasTicketsQueryKey,
  popComandasTicketsQueryRoot,
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

function ticketClock(ticket: ComandaTicket): string {
  const updatedMs = Date.parse(ticket.updatedAt)
  const changedMs = Date.parse(ticket.statusChangedAt)
  if (Number.isFinite(updatedMs) && Number.isFinite(changedMs)) {
    return updatedMs >= changedMs ? ticket.updatedAt : ticket.statusChangedAt
  }
  return ticket.updatedAt || ticket.statusChangedAt
}

function isNewerTicket(next: ComandaTicket, prev: ComandaTicket): boolean {
  return isNewerTimestamp(ticketClock(next), ticketClock(prev))
}

function overlayInFlightTicket(
  ticket: ComandaTicket,
  inFlight: Map<string, ComandaTicket> | undefined,
): ComandaTicket {
  const optimistic = inFlight?.get(ticket.id)
  if (!optimistic) return ticket
  return { ...ticket, status: optimistic.status }
}

export function overlayComandasInFlight(
  tickets: ComandaTicket[],
  inFlight: Map<string, ComandaTicket>,
): ComandaTicket[] {
  if (inFlight.size === 0) return tickets
  return tickets.map((ticket) => overlayInFlightTicket(ticket, inFlight))
}

function persistTicket(popId: string, ticket: ComandaTicket) {
  writeComandasBoardIfOpen(popId, (db) => {
    upsertComandaTicket(db, ticket)
  })
}

function persistHiddenTicket(popId: string, ticket: ComandaTicket) {
  writeComandasBoardIfOpen(popId, (db) => {
    if (ticket.sendId) {
      deleteComandaTicketsBySendId(db, ticket.sendId)
      return
    }
    deleteComandaTicket(db, ticket.id)
  })
}

function writeTicketToStationCache(
  queryClient: QueryClient,
  popId: string,
  ticket: ComandaTicket,
) {
  const key = popComandasTicketsQueryKey(popId, ticket.stationId)
  const prev = queryClient.getQueryData<ComandaTicket[]>(key) ?? []
  if (!isComandaBoardVisible(ticket.status)) {
    queryClient.setQueryData<ComandaTicket[]>(
      key,
      prev.filter((row) => row.id !== ticket.id),
    )
    persistHiddenTicket(popId, { ...ticket, sendId: null })
    return
  }
  const index = prev.findIndex((row) => row.id === ticket.id)
  if (index < 0) {
    queryClient.setQueryData<ComandaTicket[]>(key, [...prev, ticket])
  } else {
    const next = [...prev]
    next[index] = ticket
    queryClient.setQueryData<ComandaTicket[]>(key, next)
  }
  persistTicket(popId, ticket)
}

export function upsertComandaTicketCache(
  queryClient: QueryClient,
  popId: string,
  ticket: ComandaTicket,
  inFlight?: Map<string, ComandaTicket>,
) {
  const mapped = overlayInFlightTicket(ticket, inFlight)
  const key = popComandasTicketsQueryKey(popId, mapped.stationId)
  const prev = queryClient.getQueryData<ComandaTicket[]>(key) ?? []
  const current = prev.find((row) => row.id === mapped.id)
  if (
    current &&
    !inFlight?.has(mapped.id) &&
    isComandaBoardVisible(mapped.status) &&
    !isNewerTicket(mapped, current)
  ) {
    const kept = overlayInFlightTicket(current, inFlight)
    if (kept !== current) writeTicketToStationCache(queryClient, popId, kept)
    return
  }
  writeTicketToStationCache(queryClient, popId, mapped)
}

export function replaceComandaTicketCache(
  queryClient: QueryClient,
  popId: string,
  ticket: ComandaTicket,
  inFlight?: Map<string, ComandaTicket>,
) {
  writeTicketToStationCache(
    queryClient,
    popId,
    overlayInFlightTicket(ticket, inFlight),
  )
}

export function applyComandaStatusToTicketsCache(
  queryClient: QueryClient,
  popId: string,
  ticket: ComandaTicket,
  inFlight?: Map<string, ComandaTicket>,
) {
  const mapped = overlayInFlightTicket(ticket, inFlight)
  const key = popComandasTicketsQueryKey(popId, mapped.stationId)
  const prev = queryClient.getQueryData<ComandaTicket[]>(key) ?? []
  const current = prev.find((row) => row.id === mapped.id)
  if (
    current &&
    !inFlight?.has(mapped.id) &&
    !isNewerTicket(mapped, current)
  ) {
    return
  }

  if (!isComandaBoardVisible(mapped.status)) {
    queryClient.setQueryData<ComandaTicket[]>(
      key,
      prev.filter((row) => {
        if (row.id === mapped.id) return false
        if (mapped.sendId && row.sendId === mapped.sendId) return false
        return true
      }),
    )
    persistHiddenTicket(popId, mapped)
    return
  }

  const sendId = mapped.sendId
  const now = mapped.statusChangedAt
  const next = prev
    .map((row) => {
      const same =
        row.id === mapped.id || (sendId != null && row.sendId === sendId)
      if (!same) return row
      if (row.id === mapped.id) return mapped
      return {
        ...row,
        status: mapped.status,
        statusChangedAt: now,
        sentAt: mapped.sentAt,
        preparingAt: mapped.preparingAt,
        readyAt: mapped.readyAt,
        deliveredAt: mapped.deliveredAt,
      }
    })
    .concat(prev.some((row) => row.id === mapped.id) ? [] : [mapped])

  queryClient.setQueryData<ComandaTicket[]>(key, next)
  writeComandasBoardIfOpen(popId, (db) => {
    const related = sendId
      ? next.filter((row) => row.id === mapped.id || row.sendId === sendId)
      : [mapped]
    for (const row of related) upsertComandaTicket(db, row)
  })
}

export function replaceComandasTicketsCaches(
  queryClient: QueryClient,
  popId: string,
  stations: Array<{ id: string }>,
  tickets: ComandaTicket[],
) {
  for (const station of stations) {
    queryClient.setQueryData<ComandaTicket[]>(
      popComandasTicketsQueryKey(popId, station.id),
      tickets.filter((ticket) => ticket.stationId === station.id),
    )
  }
}

export function invalidateComandasTicketsCache(
  queryClient: QueryClient,
  popId: string,
) {
  void queryClient.invalidateQueries({
    queryKey: popComandasTicketsQueryRoot(popId),
    refetchType: "all",
  })
}
