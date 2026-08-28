import type { QueryClient } from "@tanstack/react-query"
import type { ComandaStatus } from "@/app/[siteId]/[popId]/comandas/comandasTypes"
import type {
  ComandaSendPeel,
  ComandaVoidPeel,
} from "@/app/[siteId]/[popId]/comandas/comandasTypes"
import type { MesaReservationRow, MesaSessionRow } from "@/app/[siteId]/[popId]/mesas/actions"
import {
  applyComandaSendToSessionCache,
  applyComandaStatusToSessionCache,
  applyComandaVoidToSessionCache,
  applyMesasCheckoutToSessionCache,
  mapReservationRow,
  mapSessionRow,
  markMesasReservationCancelledCache,
  patchMesasSessionCache,
  removeMesasSessionCache,
  upsertMesasReservationCache,
  upsertMesasSessionCache,
} from "@/app/[siteId]/[popId]/mesas/mesasQueryCache"
import {
  popLocalMesasFloorHydrateQueryKey,
  popMesasLayoutQueryKey,
  popMesasQueryRoot,
  popMesasReservationSettingsQueryKey,
  popMesasReservationsQueryKey,
  popMesasSessionQueryKey,
  popMesasSessionsQueryKey,
} from "@/lib/queryKeys"
import {
  clearPopLocalMesasFloorHydrateMark,
  refreshMesasLayoutFromNetwork,
  refreshMesasReservationsFromNetwork,
  refreshMesasReservationSettingsFromNetwork,
} from "@/lib/popLocalDb/hydrateMesasFloor"
import type { DomainEvent } from "@/lib/realtime/protocol"

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value))
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === "string")
}

function parseSessionRow(value: unknown): MesaSessionRow | null {
  if (!isRecord(value)) return null
  const id = asString(value.id)
  if (!id) return null
  const tableIds = asStringArray(value.tableIds)
  const floorStatus =
    value.floorStatus === "paying" ? ("paying" as const) : ("open" as const)
  return {
    id,
    tableIds,
    waiterId: asString(value.waiterId) ?? "",
    guestCount:
      typeof value.guestCount === "number" && Number.isFinite(value.guestCount)
        ? value.guestCount
        : null,
    note: asString(value.note) ?? "",
    openedAt: asString(value.openedAt) ?? new Date().toISOString(),
    updatedAt: asString(value.updatedAt) ?? new Date().toISOString(),
    checkout: null,
    floorStatus,
  }
}

function parseReservationRow(value: unknown): MesaReservationRow | null {
  if (!isRecord(value)) return null
  const id = asString(value.id)
  if (!id) return null
  const status = value.status
  if (
    status !== "pending" &&
    status !== "confirmed" &&
    status !== "seated" &&
    status !== "no_show" &&
    status !== "cancelled" &&
    status !== "completed" &&
    status !== "expired"
  ) {
    return null
  }
  return {
    id,
    tableId: asString(value.tableId),
    tableIds: asStringArray(value.tableIds),
    clientId: asString(value.clientId),
    clientName: asString(value.clientName) ?? "",
    guestCount:
      typeof value.guestCount === "number" && Number.isFinite(value.guestCount)
        ? value.guestCount
        : null,
    arrivalAt: asString(value.arrivalAt) ?? "",
    status,
    note: asString(value.note) ?? "",
    updatedAt: asString(value.updatedAt) ?? new Date().toISOString(),
  }
}

function parseSendPeels(value: unknown): ComandaSendPeel[] {
  if (!Array.isArray(value)) return []
  const peels: ComandaSendPeel[] = []
  for (const item of value) {
    if (!isRecord(item)) continue
    const fromCartLineId = asString(item.fromCartLineId)
    const sentCartLineId = asString(item.sentCartLineId)
    if (!fromCartLineId || !sentCartLineId) continue
    peels.push({
      fromCartLineId,
      sentCartLineId,
      sentQuantity:
        typeof item.sentQuantity === "number" ? item.sentQuantity : 0,
      remainderQuantity:
        typeof item.remainderQuantity === "number" ? item.remainderQuantity : 0,
    })
  }
  return peels
}

function parseVoidPeels(value: unknown): ComandaVoidPeel[] {
  if (!Array.isArray(value)) return []
  const peels: ComandaVoidPeel[] = []
  for (const item of value) {
    if (!isRecord(item)) continue
    const fromCartLineId = asString(item.fromCartLineId)
    const voidedCartLineId = asString(item.voidedCartLineId)
    if (!fromCartLineId || !voidedCartLineId) continue
    peels.push({
      fromCartLineId,
      voidedCartLineId,
      voidedQuantity:
        typeof item.voidedQuantity === "number" ? item.voidedQuantity : 0,
      remainderQuantity:
        typeof item.remainderQuantity === "number" ? item.remainderQuantity : 0,
    })
  }
  return peels
}

function parseComandaStatus(value: unknown): ComandaStatus | null {
  if (
    value === "pending" ||
    value === "sent" ||
    value === "preparing" ||
    value === "ready" ||
    value === "delivered" ||
    value === "voided"
  ) {
    return value
  }
  return null
}

export function invalidateMesasRealtimeQueries(
  queryClient: QueryClient,
  popId: string,
) {
  void clearPopLocalMesasFloorHydrateMark(popId).then(() => {
    void queryClient.invalidateQueries({
      queryKey: popLocalMesasFloorHydrateQueryKey(popId),
      refetchType: "all",
    })
    void queryClient.invalidateQueries({
      queryKey: popMesasQueryRoot(popId),
      refetchType: "all",
      predicate: (query) => query.queryKey[2] !== "session",
    })
  })
}

export function applyMesasRealtimeEvent(
  queryClient: QueryClient,
  popId: string,
  event: DomainEvent,
) {
  if (event.popId !== popId) return

  if (event.type === "mesas.session_opened" || event.type === "mesas.session_updated") {
    const session = parseSessionRow(event.payload.session)
    if (session) {
      upsertMesasSessionCache(queryClient, popId, mapSessionRow(session))
      return
    }
    void queryClient.invalidateQueries({
      queryKey: popMesasSessionsQueryKey(popId),
      refetchType: "all",
    })
    return
  }

  if (event.type === "mesas.session_closed") {
    const sessionId =
      asString(event.payload.sessionId) ?? asString(event.resource?.id)
    if (sessionId) {
      removeMesasSessionCache(queryClient, popId, sessionId)
    } else {
      void queryClient.invalidateQueries({
        queryKey: popMesasSessionsQueryKey(popId),
        refetchType: "all",
      })
    }
    void refreshMesasReservationsFromNetwork(popId)
      .then((reservations) => {
        queryClient.setQueryData(
          popMesasReservationsQueryKey(popId),
          reservations,
        )
      })
      .catch(() => {
        void queryClient.invalidateQueries({
          queryKey: popMesasReservationsQueryKey(popId),
          refetchType: "all",
        })
      })
    return
  }

  if (event.type === "mesas.checkout_saved") {
    const sessionId = asString(event.payload.sessionId)
    const updatedAt = asString(event.payload.updatedAt)
    if (sessionId && updatedAt && event.payload.checkout != null) {
      applyMesasCheckoutToSessionCache(
        queryClient,
        popId,
        sessionId,
        updatedAt,
        event.payload.checkout,
      )
      return
    }
    if (sessionId) {
      void queryClient.invalidateQueries({
        queryKey: popMesasSessionQueryKey(popId, sessionId),
        refetchType: "all",
      })
      return
    }
    void queryClient.invalidateQueries({
      queryKey: popMesasSessionsQueryKey(popId),
      refetchType: "all",
    })
    return
  }

  if (event.type === "mesas.floor_status_changed") {
    const sessionId = asString(event.payload.sessionId)
    const updatedAt = asString(event.payload.updatedAt)
    const floorStatus =
      event.payload.floorStatus === "paying"
        ? ("paying" as const)
        : event.payload.floorStatus === "open"
          ? ("open" as const)
          : null
    if (sessionId && updatedAt && floorStatus) {
      patchMesasSessionCache(queryClient, popId, sessionId, {
        floorStatus,
        updatedAt,
      })
      return
    }
    void queryClient.invalidateQueries({
      queryKey: popMesasSessionsQueryKey(popId),
      refetchType: "all",
    })
    return
  }

  if (event.type === "mesas.layout_changed") {
    void refreshMesasLayoutFromNetwork(popId)
      .then((layout) => {
        queryClient.setQueryData(popMesasLayoutQueryKey(popId), layout)
      })
      .catch(() => {
        void queryClient.invalidateQueries({
          queryKey: popMesasLayoutQueryKey(popId),
          refetchType: "all",
        })
      })
    return
  }

  if (
    event.type === "mesas.reservation_upserted" ||
    event.type === "mesas.reservation_status_changed"
  ) {
    const reservation = parseReservationRow(event.payload.reservation)
    if (reservation) {
      upsertMesasReservationCache(
        queryClient,
        popId,
        mapReservationRow(reservation),
      )
      return
    }
    void queryClient.invalidateQueries({
      queryKey: popMesasReservationsQueryKey(popId),
      refetchType: "all",
    })
    return
  }

  if (event.type === "mesas.reservation_cancelled") {
    const reservationId = asString(event.payload.reservationId)
    if (reservationId) {
      markMesasReservationCancelledCache(queryClient, popId, reservationId)
      return
    }
    void queryClient.invalidateQueries({
      queryKey: popMesasReservationsQueryKey(popId),
      refetchType: "all",
    })
    return
  }

  if (event.type === "mesas.settings_updated") {
    void refreshMesasReservationSettingsFromNetwork(popId)
      .then((settings) => {
        queryClient.setQueryData(
          popMesasReservationSettingsQueryKey(popId),
          settings,
        )
      })
      .catch(() => {
        void queryClient.invalidateQueries({
          queryKey: popMesasReservationSettingsQueryKey(popId),
          refetchType: "all",
        })
      })
    return
  }

  if (event.type === "comandas.sent") {
    const sourceKind = asString(event.payload.sourceKind)
    const sourceId = asString(event.payload.sourceId)
    if (sourceKind !== "table" || !sourceId) return
    applyComandaSendToSessionCache(
      queryClient,
      popId,
      sourceId,
      asStringArray(event.payload.sentCartLineIds),
      parseSendPeels(event.payload.peels),
    )
    return
  }

  if (event.type === "comandas.voided") {
    const sourceKind = asString(event.payload.sourceKind)
    const sourceId = asString(event.payload.sourceId)
    if (sourceKind !== "table" || !sourceId) return
    applyComandaVoidToSessionCache(
      queryClient,
      popId,
      sourceId,
      asStringArray(event.payload.voidedCartLineIds),
      parseVoidPeels(event.payload.peels),
    )
    return
  }

  if (event.type === "comandas.status_changed") {
    const sourceKind = asString(event.payload.sourceKind)
    const sourceId = asString(event.payload.sourceId)
    const cartLineId = asString(event.payload.cartLineId)
    const status = parseComandaStatus(event.payload.status)
    if (sourceKind !== "table" || !sourceId || !cartLineId || !status) return
    applyComandaStatusToSessionCache(
      queryClient,
      popId,
      sourceId,
      cartLineId,
      status,
    )
  }
}
