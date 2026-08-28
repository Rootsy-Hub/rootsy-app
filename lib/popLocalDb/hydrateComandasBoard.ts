import { isComandaTicketStored } from "@/app/[siteId]/[popId]/comandas/comandasLogic"
import type {
  ComandaStation,
  ComandaTicket,
} from "@/app/[siteId]/[popId]/comandas/comandasTypes"
import {
  clearComandasBoardHydratedMark,
  isComandasBoardHydrated,
  markComandasBoardHydrated,
} from "@/lib/popLocalDb/hydrateMarks"
import {
  listComandaTicketsByStation,
  replaceComandaTickets,
} from "@/lib/popLocalDb/comandasBoardRepo"
import { getOpenedPopLocalDb, peekPopLocalDb } from "@/lib/popLocalDb/store"
import {
  fetchComandaStations,
  fetchComandas,
} from "@/lib/rootsyApi/comandasClient"

const hydrateLocks = new Map<string, Promise<{ fetched: boolean }>>()

function visibleTickets(tickets: ComandaTicket[]) {
  return tickets.filter((ticket) => isComandaTicketStored(ticket))
}

export async function fetchComandasBoardFromNetwork(popId: string): Promise<{
  stations: ComandaStation[]
  tickets: ComandaTicket[]
}> {
  const stationsRes = await fetchComandaStations(popId)
  if (!stationsRes.success) throw new Error(stationsRes.error)
  const lists = await Promise.all(
    stationsRes.stations.map(async (station) => {
      const res = await fetchComandas(popId, station.id)
      if (!res.success) throw new Error(res.error)
      return res.tickets
    }),
  )
  return {
    stations: stationsRes.stations,
    tickets: visibleTickets(lists.flat()),
  }
}

export async function hydratePopComandasBoardFromNetwork(
  popId: string,
): Promise<{ fetched: boolean }> {
  const pending = hydrateLocks.get(popId)
  if (pending) return pending

  const run = (async () => {
    const handle = await getOpenedPopLocalDb(popId)
    if (isComandasBoardHydrated(handle.database)) return { fetched: false }
    const { tickets } = await fetchComandasBoardFromNetwork(popId)
    replaceComandaTickets(handle.database, tickets)
    markComandasBoardHydrated(handle.database)
    handle.markDirty()
    await handle.flush()
    return { fetched: true }
  })()

  hydrateLocks.set(popId, run)
  try {
    return await run
  } finally {
    hydrateLocks.delete(popId)
  }
}

export async function clearPopLocalComandasBoardHydrateMark(popId: string) {
  const handle = await getOpenedPopLocalDb(popId)
  clearComandasBoardHydratedMark(handle.database)
  handle.markDirty()
  await handle.flush()
}

export async function refreshComandasTicketsFromNetwork(popId: string) {
  const board = await fetchComandasBoardFromNetwork(popId)
  const handle = await getOpenedPopLocalDb(popId).catch(() => null)
  if (handle) {
    replaceComandaTickets(handle.database, board.tickets)
    handle.markDirty()
  }
  return board
}

export async function readComandasTicketsLocalOrFetch(
  popId: string,
  stationId: string,
) {
  const pending = peekPopLocalDb(popId)
  if (pending) {
    const handle = await pending
    if (isComandasBoardHydrated(handle.database)) {
      return listComandaTicketsByStation(handle.database, stationId)
    }
  }
  const res = await fetchComandas(popId, stationId)
  if (!res.success) throw new Error(res.error)
  return visibleTickets(res.tickets)
}
