import type { QueryClient } from "@tanstack/react-query"
import type {
  MesasLayoutData,
  MesaReservationRow,
  MesaSessionRow,
} from "@/app/[siteId]/[popId]/mesas/actions"
import type { TableSessionCheckoutSnapshot } from "@/app/[siteId]/[popId]/mesas/mesasCheckoutState"
import type { MesasReservationSettings } from "@/app/[siteId]/[popId]/mesas/mesasReservationLogic"
import type {
  MesaFloorDecor,
  MesaReservation,
  MesaSalon,
  MesaSession,
  MesaTable,
} from "@/app/[siteId]/[popId]/mesas/mesasTypes"
import { resolveCartLineId } from "@/lib/menuCart"
import {
  popMesasLayoutQueryKey,
  popMesasReservationSettingsQueryKey,
  popMesasReservationsQueryKey,
  popMesasSessionQueryKey,
  popMesasSessionsQueryKey,
} from "@/lib/queryKeys"
import type { ComandaStatus } from "@/app/[siteId]/[popId]/comandas/comandasTypes"
import {
  applyComandaSendToCart,
  applyComandaVoidToCart,
} from "@/app/[siteId]/[popId]/comandas/comandasLogic"
import type {
  ComandaSendPeel,
  ComandaVoidPeel,
} from "@/app/[siteId]/[popId]/comandas/comandasTypes"
import {
  deleteMesasSessionSlim,
  patchMesasDecorPosition,
  patchMesasReservationSettingsLocal,
  patchMesasTablePosition,
  upsertMesasReservationSlim,
  upsertMesasSessionSlim,
} from "@/lib/popLocalDb/mesasFloorRepo"
import { writeMesasFloorIfOpen } from "@/lib/popLocalDb/mesasFloorPersist"

export type MesasReservationSettingsCache = {
  settings: MesasReservationSettings
  operationalDayCloseTime: string
}

export function mapSessionRow(row: MesaSessionRow): MesaSession {
  return {
    id: row.id,
    tableIds: row.tableIds,
    waiterId: row.waiterId,
    guestCount: row.guestCount,
    note: row.note,
    openedAt: row.openedAt,
    updatedAt: row.updatedAt,
    checkout: row.checkout,
    floorStatus: row.floorStatus,
  }
}

export function floorSession(session: MesaSession): MesaSession {
  return { ...session, checkout: null }
}

export function mapReservationRow(row: MesaReservationRow): MesaReservation {
  return {
    id: row.id,
    tableId: row.tableId,
    tableIds: row.tableIds,
    clientId: row.clientId,
    clientName: row.clientName,
    guestCount: row.guestCount,
    arrivalAt: row.arrivalAt,
    status: row.status,
    note: row.note,
    updatedAt: row.updatedAt,
  }
}

export function mapLayoutToState(data: MesasLayoutData): {
  salons: MesaSalon[]
  layoutTables: MesaTable[]
  decors: MesaFloorDecor[]
} {
  const salons: MesaSalon[] = data.salons
    .filter((s) => s.isActive)
    .map((s) => ({
      id: s.id,
      name: s.name,
      sortOrder: s.sortOrder,
      isActive: s.isActive,
    }))

  const layoutTables: MesaTable[] = data.tables
    .filter((t) => t.isActive)
    .map((t) => ({
      id: t.id,
      salonId: t.salonId,
      label: t.label,
      shape: t.shape,
      x: t.x,
      y: t.y,
      rotation: t.rotation ?? 0,
      seats: t.seats,
      status: "free" as const,
      sessionId: null,
      reservationId: null,
    }))

  const decors: MesaFloorDecor[] = data.decors
    .filter((d) => d.isActive)
    .map((d) => ({
      id: d.id,
      salonId: d.salonId,
      kind: d.kind,
      x: d.x,
      y: d.y,
      width: d.width,
      height: d.height,
      rotation: d.rotation ?? 0,
      label: d.label || undefined,
    }))

  return { salons, layoutTables, decors }
}

function isNewerTimestamp(next: string, prev: string | undefined): boolean {
  if (!prev) return true
  const nextMs = Date.parse(next)
  const prevMs = Date.parse(prev)
  if (Number.isFinite(nextMs) && Number.isFinite(prevMs)) {
    return nextMs > prevMs
  }
  return next > prev
}

/** El checkout puede llegar con el mismo updated_at si la fila no lo bumpaba. */
function isCheckoutTimestampCurrent(
  next: string,
  prev: string | undefined,
): boolean {
  if (!prev) return true
  const nextMs = Date.parse(next)
  const prevMs = Date.parse(prev)
  if (Number.isFinite(nextMs) && Number.isFinite(prevMs)) {
    return nextMs >= prevMs
  }
  return next >= prev
}

export function upsertMesasSessionCache(
  queryClient: QueryClient,
  popId: string,
  session: MesaSession,
) {
  queryClient.setQueryData<MesaSession[]>(
    popMesasSessionsQueryKey(popId),
    (prev) => {
      const list = prev ?? []
      const index = list.findIndex((item) => item.id === session.id)
      if (index < 0) return [...list, floorSession(session)]
      const current = list[index]
      if (current && !isNewerTimestamp(session.updatedAt, current.updatedAt)) {
        return list
      }
      const next = [...list]
      next[index] = floorSession({
        ...session,
        checkout: null,
      })
      return next
    },
  )
  queryClient.setQueryData<MesaSession>(
    popMesasSessionQueryKey(popId, session.id),
    (prev) => {
      if (!prev) return session.checkout ? session : prev
      if (!isNewerTimestamp(session.updatedAt, prev.updatedAt)) return prev
      return {
        ...prev,
        ...floorSession(session),
        checkout: session.checkout ?? prev.checkout,
      }
    },
  )
  writeMesasFloorIfOpen(popId, (db) => {
    upsertMesasSessionSlim(db, session)
  })
}

export function removeMesasSessionCache(
  queryClient: QueryClient,
  popId: string,
  sessionId: string,
) {
  queryClient.setQueryData<MesaSession[]>(
    popMesasSessionsQueryKey(popId),
    (prev) => (prev ?? []).filter((session) => session.id !== sessionId),
  )
  queryClient.removeQueries({
    queryKey: popMesasSessionQueryKey(popId, sessionId),
  })
  writeMesasFloorIfOpen(popId, (db) => {
    deleteMesasSessionSlim(db, sessionId)
  })
}

export function setMesasSessionDetailCache(
  queryClient: QueryClient,
  popId: string,
  session: MesaSession,
) {
  queryClient.setQueryData(popMesasSessionQueryKey(popId, session.id), session)
}

export function patchMesasSessionCache(
  queryClient: QueryClient,
  popId: string,
  sessionId: string,
  patch: Partial<MesaSession>,
) {
  const { checkout: _checkout, ...floorPatch } = patch
  queryClient.setQueryData<MesaSession[]>(
    popMesasSessionsQueryKey(popId),
    (prev) =>
      (prev ?? []).map((session) => {
        if (session.id !== sessionId) return session
        if (
          patch.updatedAt &&
          !isNewerTimestamp(patch.updatedAt, session.updatedAt) &&
          patch.updatedAt !== session.updatedAt
        ) {
          return session
        }
        return { ...session, ...floorPatch, checkout: null }
      }),
  )
  queryClient.setQueryData<MesaSession>(
    popMesasSessionQueryKey(popId, sessionId),
    (prev) => {
      if (!prev) return prev
      if (
        patch.updatedAt &&
        !isNewerTimestamp(patch.updatedAt, prev.updatedAt) &&
        patch.updatedAt !== prev.updatedAt
      ) {
        return prev
      }
      return {
        ...prev,
        ...floorPatch,
        checkout: patch.checkout ?? prev.checkout,
      }
    },
  )
  writeMesasFloorIfOpen(popId, (db) => {
    const current = queryClient
      .getQueryData<MesaSession[]>(popMesasSessionsQueryKey(popId))
      ?.find((session) => session.id === sessionId)
    if (current) upsertMesasSessionSlim(db, current)
  })
}

export function upsertMesasReservationCache(
  queryClient: QueryClient,
  popId: string,
  reservation: MesaReservation,
) {
  queryClient.setQueryData<MesaReservation[]>(
    popMesasReservationsQueryKey(popId),
    (prev) => {
      const list = prev ?? []
      const index = list.findIndex((item) => item.id === reservation.id)
      if (index < 0) return [...list, reservation]
      const next = [...list]
      next[index] = reservation
      return next
    },
  )
  writeMesasFloorIfOpen(popId, (db) => {
    upsertMesasReservationSlim(db, reservation)
  })
}

export function markMesasReservationCancelledCache(
  queryClient: QueryClient,
  popId: string,
  reservationId: string,
) {
  queryClient.setQueryData<MesaReservation[]>(
    popMesasReservationsQueryKey(popId),
    (prev) =>
      (prev ?? []).map((reservation) =>
        reservation.id === reservationId
          ? { ...reservation, status: "cancelled" as const }
          : reservation,
      ),
  )
  writeMesasFloorIfOpen(popId, (db) => {
    const current = queryClient
      .getQueryData<MesaReservation[]>(popMesasReservationsQueryKey(popId))
      ?.find((reservation) => reservation.id === reservationId)
    if (current) upsertMesasReservationSlim(db, current)
  })
}

export function patchMesasReservationSettingsCache(
  queryClient: QueryClient,
  popId: string,
  settings: MesasReservationSettings,
) {
  queryClient.setQueryData<MesasReservationSettingsCache>(
    popMesasReservationSettingsQueryKey(popId),
    (prev) =>
      prev
        ? { ...prev, settings }
        : undefined,
  )
  writeMesasFloorIfOpen(popId, (db) => {
    patchMesasReservationSettingsLocal(db, settings)
  })
}

export function moveMesasLayoutTableCache(
  queryClient: QueryClient,
  popId: string,
  tableId: string,
  dx: number,
  dy: number,
): { x: number; y: number } | null {
  let result: { x: number; y: number } | null = null
  queryClient.setQueryData<MesasLayoutData>(
    popMesasLayoutQueryKey(popId),
    (prev) => {
      if (!prev) return prev
      return {
        ...prev,
        tables: prev.tables.map((table) => {
          if (table.id !== tableId) return table
          const x = Math.max(8, table.x + dx)
          const y = Math.max(8, table.y + dy)
          result = { x, y }
          return { ...table, x, y }
        }),
      }
    },
  )
  if (result) {
    writeMesasFloorIfOpen(popId, (db) => {
      patchMesasTablePosition(db, tableId, result!)
    })
  }
  return result
}

export function moveMesasLayoutDecorCache(
  queryClient: QueryClient,
  popId: string,
  decorId: string,
  dx: number,
  dy: number,
): { x: number; y: number } | null {
  let result: { x: number; y: number } | null = null
  queryClient.setQueryData<MesasLayoutData>(
    popMesasLayoutQueryKey(popId),
    (prev) => {
      if (!prev) return prev
      return {
        ...prev,
        decors: prev.decors.map((decor) => {
          if (decor.id !== decorId) return decor
          const x = Math.max(8, decor.x + dx)
          const y = Math.max(8, decor.y + dy)
          result = { x, y }
          return { ...decor, x, y }
        }),
      }
    },
  )
  if (result) {
    writeMesasFloorIfOpen(popId, (db) => {
      patchMesasDecorPosition(db, decorId, result!)
    })
  }
  return result
}

export function rotateMesasLayoutItemCache(
  queryClient: QueryClient,
  popId: string,
  kind: "table" | "decor",
  id: string,
): { x: number; y: number; rotation: number } | null {
  let result: { x: number; y: number; rotation: number } | null = null
  queryClient.setQueryData<MesasLayoutData>(
    popMesasLayoutQueryKey(popId),
    (prev) => {
      if (!prev) return prev
      if (kind === "table") {
        return {
          ...prev,
          tables: prev.tables.map((table) => {
            if (table.id !== id) return table
            const rotation = ((table.rotation ?? 0) + 45) % 360
            result = { x: table.x, y: table.y, rotation }
            return { ...table, rotation }
          }),
        }
      }
      return {
        ...prev,
        decors: prev.decors.map((decor) => {
          if (decor.id !== id) return decor
          const rotation = ((decor.rotation ?? 0) + 45) % 360
          result = { x: decor.x, y: decor.y, rotation }
          return { ...decor, rotation }
        }),
      }
    },
  )
  if (result) {
    writeMesasFloorIfOpen(popId, (db) => {
      if (kind === "table") {
        patchMesasTablePosition(db, id, result!)
      } else {
        patchMesasDecorPosition(db, id, result!)
      }
    })
  }
  return result
}

function isCheckoutSnapshot(
  value: unknown,
): value is TableSessionCheckoutSnapshot {
  return Boolean(
    value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      Array.isArray((value as TableSessionCheckoutSnapshot).carrito),
  )
}

export function applyMesasCheckoutToSessionCache(
  queryClient: QueryClient,
  popId: string,
  sessionId: string,
  updatedAt: string,
  checkout: unknown,
) {
  const snap = isCheckoutSnapshot(checkout) ? checkout : null
  queryClient.setQueryData<MesaSession[]>(
    popMesasSessionsQueryKey(popId),
    (prev) =>
      (prev ?? []).map((session) => {
        if (session.id !== sessionId) return session
        if (!isCheckoutTimestampCurrent(updatedAt, session.updatedAt)) {
          return session
        }
        return { ...session, updatedAt, checkout: null }
      }),
  )
  queryClient.setQueryData<MesaSession>(
    popMesasSessionQueryKey(popId, sessionId),
    (prev) => {
      if (!prev) {
        if (!snap) return prev
        const floor = queryClient
          .getQueryData<MesaSession[]>(popMesasSessionsQueryKey(popId))
          ?.find((session) => session.id === sessionId)
        if (!floor) return prev
        return { ...floor, updatedAt, checkout: snap }
      }
      if (!isCheckoutTimestampCurrent(updatedAt, prev.updatedAt)) return prev
      return {
        ...prev,
        updatedAt,
        checkout: snap ?? prev.checkout,
      }
    },
  )
  writeMesasFloorIfOpen(popId, (db) => {
    const current = queryClient
      .getQueryData<MesaSession[]>(popMesasSessionsQueryKey(popId))
      ?.find((session) => session.id === sessionId)
    if (current) upsertMesasSessionSlim(db, current)
  })
}

export function applyComandaSendToSessionCache(
  queryClient: QueryClient,
  popId: string,
  sessionId: string,
  sentCartLineIds: string[],
  peels: ComandaSendPeel[],
) {
  queryClient.setQueryData<MesaSession>(
    popMesasSessionQueryKey(popId, sessionId),
    (prev) => {
      if (!prev?.checkout) return prev
      return {
        ...prev,
        checkout: {
          ...prev.checkout,
          carrito: applyComandaSendToCart(
            prev.checkout.carrito,
            sentCartLineIds,
            peels,
          ),
        },
      }
    },
  )
}

export function applyComandaVoidToSessionCache(
  queryClient: QueryClient,
  popId: string,
  sessionId: string,
  voidedCartLineIds: string[],
  peels: ComandaVoidPeel[],
) {
  queryClient.setQueryData<MesaSession>(
    popMesasSessionQueryKey(popId, sessionId),
    (prev) => {
      if (!prev?.checkout) return prev
      return {
        ...prev,
        checkout: {
          ...prev.checkout,
          carrito: applyComandaVoidToCart(
            prev.checkout.carrito,
            voidedCartLineIds,
            peels,
          ),
        },
      }
    },
  )
}

export function applyComandaStatusToSessionCache(
  queryClient: QueryClient,
  popId: string,
  sessionId: string,
  cartLineId: string,
  status: ComandaStatus,
) {
  queryClient.setQueryData<MesaSession>(
    popMesasSessionQueryKey(popId, sessionId),
    (prev) => {
      if (!prev?.checkout) return prev
      return {
        ...prev,
        checkout: {
          ...prev.checkout,
          carrito: prev.checkout.carrito.map((item) =>
            resolveCartLineId(item) === cartLineId
              ? { ...item, comandaStatus: status }
              : item,
          ),
        },
      }
    },
  )
}
