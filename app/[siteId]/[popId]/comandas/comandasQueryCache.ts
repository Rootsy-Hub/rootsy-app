import type { QueryClient } from "@tanstack/react-query"
import type {
  ComandaTicket,
} from "@/app/[siteId]/[popId]/comandas/comandasTypes"
import {
  popComandasTicketsQueryKey,
  popComandasTicketsQueryRoot,
} from "@/lib/queryKeys"

function isBoardVisible(ticket: ComandaTicket) {
  return ticket.status !== "pending" && ticket.status !== "voided"
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

export function upsertComandaTicketCache(
  queryClient: QueryClient,
  popId: string,
  ticket: ComandaTicket,
  inFlight?: Map<string, ComandaTicket>,
) {
  const mapped = overlayInFlightTicket(ticket, inFlight)
  queryClient.setQueryData<ComandaTicket[]>(
    popComandasTicketsQueryKey(popId, mapped.stationId),
    (prev) => {
      const list = prev ?? []
      if (!isBoardVisible(mapped)) {
        return list.filter((row) => row.id !== mapped.id)
      }
      const index = list.findIndex((row) => row.id === mapped.id)
      if (index < 0) return [...list, mapped]
      const next = [...list]
      next[index] = mapped
      return next
    },
  )
}

export function replaceComandaTicketCache(
  queryClient: QueryClient,
  popId: string,
  ticket: ComandaTicket,
  inFlight?: Map<string, ComandaTicket>,
) {
  upsertComandaTicketCache(queryClient, popId, ticket, inFlight)
}

export function applyComandaStatusToTicketsCache(
  queryClient: QueryClient,
  popId: string,
  ticket: ComandaTicket,
  inFlight?: Map<string, ComandaTicket>,
) {
  const mapped = overlayInFlightTicket(ticket, inFlight)
  queryClient.setQueryData<ComandaTicket[]>(
    popComandasTicketsQueryKey(popId, mapped.stationId),
    (prev) => {
      const list = prev ?? []
      if (!isBoardVisible(mapped)) {
        return list.filter((row) => {
          if (row.id === mapped.id) return false
          if (mapped.sendId && row.sendId === mapped.sendId) return false
          return true
        })
      }
      const sendId = mapped.sendId
      const now = mapped.statusChangedAt
      return list.map((row) => {
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
      }).concat(
        list.some((row) => row.id === mapped.id) ? [] : [mapped],
      )
    },
  )
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
