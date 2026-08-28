import {
  floorSession,
  mapReservationRow,
  mapSessionRow,
} from "@/app/[siteId]/[popId]/mesas/mesasQueryCache"
import type { MesasReservationSettingsCache } from "@/app/[siteId]/[popId]/mesas/mesasQueryCache"
import {
  clearMesasFloorHydratedMark,
  isMesasFloorHydrated,
  markMesasFloorHydrated,
} from "@/lib/popLocalDb/hydrateMarks"
import {
  listMesasLayout,
  listMesasReservationSettings,
  listMesasReservationsSlim,
  listMesasSessionsSlim,
  replaceMesasFloorSnapshot,
  replaceMesasLayout,
  replaceMesasReservationSettings,
  replaceMesasReservationsSlim,
  replaceMesasSessionsSlim,
} from "@/lib/popLocalDb/mesasFloorRepo"
import { getOpenedPopLocalDb, peekPopLocalDb } from "@/lib/popLocalDb/store"
import {
  fetchMesasLayout,
  fetchMesasReservationSettings,
  fetchOpenTableSessions,
  fetchTableReservations,
} from "@/lib/rootsyApi/mesasClient"

const hydrateLocks = new Map<string, Promise<{ fetched: boolean }>>()

async function fetchMesasFloorSnapshot(popId: string) {
  const [layoutRes, sessionsRes, reservationsRes, settingsRes] = await Promise.all([
    fetchMesasLayout(popId),
    fetchOpenTableSessions(popId),
    fetchTableReservations(popId),
    fetchMesasReservationSettings(popId),
  ])
  if (!layoutRes.success) throw new Error(layoutRes.error)
  if (!sessionsRes.success) throw new Error(sessionsRes.error)
  if (!reservationsRes.success) throw new Error(reservationsRes.error)
  if (!settingsRes.success) throw new Error(settingsRes.error)
  return {
    layout: layoutRes.data,
    sessions: sessionsRes.sessions.map((row) => floorSession(mapSessionRow(row))),
    reservations: reservationsRes.reservations.map(mapReservationRow),
    settings: {
      settings: settingsRes.settings,
      operationalDayCloseTime: settingsRes.operationalDayCloseTime,
    } satisfies MesasReservationSettingsCache,
  }
}

export async function hydratePopMesasFloorFromNetwork(
  popId: string,
): Promise<{ fetched: boolean }> {
  const pending = hydrateLocks.get(popId)
  if (pending) return pending

  const run = (async () => {
    const handle = await getOpenedPopLocalDb(popId)
    if (isMesasFloorHydrated(handle.database)) return { fetched: false }
    const snapshot = await fetchMesasFloorSnapshot(popId)
    replaceMesasFloorSnapshot(handle.database, snapshot)
    markMesasFloorHydrated(handle.database)
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

export async function clearPopLocalMesasFloorHydrateMark(popId: string) {
  const handle = await getOpenedPopLocalDb(popId)
  clearMesasFloorHydratedMark(handle.database)
  handle.markDirty()
  await handle.flush()
}

export async function refreshMesasLayoutFromNetwork(popId: string) {
  const res = await fetchMesasLayout(popId)
  if (!res.success) throw new Error(res.error)
  const handle = await getOpenedPopLocalDb(popId).catch(() => null)
  if (handle) {
    replaceMesasLayout(handle.database, res.data)
    handle.markDirty()
  }
  return res.data
}

export async function refreshMesasSessionsFromNetwork(popId: string) {
  const res = await fetchOpenTableSessions(popId)
  if (!res.success) throw new Error(res.error)
  const sessions = res.sessions.map((row) => floorSession(mapSessionRow(row)))
  const handle = await getOpenedPopLocalDb(popId).catch(() => null)
  if (handle) {
    replaceMesasSessionsSlim(handle.database, sessions)
    handle.markDirty()
  }
  return sessions
}

export async function refreshMesasReservationsFromNetwork(popId: string) {
  const res = await fetchTableReservations(popId)
  if (!res.success) throw new Error(res.error)
  const reservations = res.reservations.map(mapReservationRow)
  const handle = await getOpenedPopLocalDb(popId).catch(() => null)
  if (handle) {
    replaceMesasReservationsSlim(handle.database, reservations)
    handle.markDirty()
  }
  return reservations
}

export async function refreshMesasReservationSettingsFromNetwork(popId: string) {
  const res = await fetchMesasReservationSettings(popId)
  if (!res.success) throw new Error(res.error)
  const settings: MesasReservationSettingsCache = {
    settings: res.settings,
    operationalDayCloseTime: res.operationalDayCloseTime,
  }
  const handle = await getOpenedPopLocalDb(popId).catch(() => null)
  if (handle) {
    replaceMesasReservationSettings(handle.database, settings)
    handle.markDirty()
  }
  return settings
}

export async function readMesasLayoutLocalOrFetch(popId: string) {
  const pending = peekPopLocalDb(popId)
  if (pending) {
    const handle = await pending
    if (isMesasFloorHydrated(handle.database)) {
      return listMesasLayout(handle.database)
    }
  }
  const res = await fetchMesasLayout(popId)
  if (!res.success) throw new Error(res.error)
  return res.data
}

export async function readMesasSessionsLocalOrFetch(popId: string) {
  const pending = peekPopLocalDb(popId)
  if (pending) {
    const handle = await pending
    if (isMesasFloorHydrated(handle.database)) {
      return listMesasSessionsSlim(handle.database)
    }
  }
  const res = await fetchOpenTableSessions(popId)
  if (!res.success) throw new Error(res.error)
  return res.sessions.map((row) => floorSession(mapSessionRow(row)))
}

export async function readMesasReservationsLocalOrFetch(popId: string) {
  const pending = peekPopLocalDb(popId)
  if (pending) {
    const handle = await pending
    if (isMesasFloorHydrated(handle.database)) {
      return listMesasReservationsSlim(handle.database)
    }
  }
  const res = await fetchTableReservations(popId)
  if (!res.success) throw new Error(res.error)
  return res.reservations.map(mapReservationRow)
}

export async function readMesasReservationSettingsLocalOrFetch(popId: string) {
  const pending = peekPopLocalDb(popId)
  if (pending) {
    const handle = await pending
    if (isMesasFloorHydrated(handle.database)) {
      return listMesasReservationSettings(handle.database)
    }
  }
  const res = await fetchMesasReservationSettings(popId)
  if (!res.success) throw new Error(res.error)
  return {
    settings: res.settings,
    operationalDayCloseTime: res.operationalDayCloseTime,
  }
}
