"use client"

import {
  cancelTableReservationApi,
  closeTableSessionApi,
  fetchMesasLayout,
  fetchMesasReservationSettings,
  fetchMesasWaiters,
  fetchOpenTableSessions,
  fetchTableReservations,
  openTableSessionApi,
  saveMesasLayoutPositionsApi,
  setTableSessionFloorStatusApi,
  updateTableReservationStatusApi,
  updateTableSessionApi,
  updateMesasReservationSettingsApi,
  upsertTableReservationApi,
} from "@/lib/rootsyApi/mesasClient"
import {
  isMesaOccupiedNow,
  pickFloorReservation,
  readMesasReservationSettings,
  reservationsForAgendaDay,
  resolveReservationStatus,
  upcomingReservationWarning,
  type MesaReservationWarning,
  type MesasReservationSettings,
} from "@/app/[siteId]/[popId]/mesas/mesasReservationLogic"
import { DEFAULT_OPERATIONAL_DAY_CLOSE_TIME } from "@/lib/popOperationalDay"
import { timezoneForSiteId } from "@/lib/popTimezone"
import type {
  MesaOpenSessionInput,
  MesaReservation,
  MesaReservationInput,
  MesaSession,
  MesaTable,
  MesaWaiter,
} from "@/app/[siteId]/[popId]/mesas/mesasTypes"
import {
  mapLayoutToState,
  mapReservationRow,
  mapSessionRow,
  markMesasReservationCancelledCache,
  moveMesasLayoutDecorCache,
  moveMesasLayoutTableCache,
  patchMesasReservationSettingsCache,
  patchMesasSessionCache,
  removeMesasSessionCache,
  rotateMesasLayoutItemCache,
  upsertMesasReservationCache,
  upsertMesasSessionCache,
  type MesasReservationSettingsCache,
} from "@/app/[siteId]/[popId]/mesas/mesasQueryCache"
import {
  popMesasLayoutQueryKey,
  popMesasReservationSettingsQueryKey,
  popMesasReservationsQueryKey,
  popMesasSessionsQueryKey,
  popMesasWaitersQueryKey,
} from "@/lib/queryKeys"
import { sessionListQueryOptions } from "@/lib/queryStaleTimes"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useCallback, useEffect, useMemo, useState } from "react"

function firstActiveSalonId(
  salons: { id: string; isActive?: boolean }[],
): string {
  const active = salons.filter((s) => s.isActive !== false)
  return active[0]?.id ?? salons[0]?.id ?? ""
}

function applyTableOccupancy(
  tables: MesaTable[],
  sessions: MesaSession[],
  reservations: MesaReservation[],
  settings: MesasReservationSettings,
  now: Date,
): MesaTable[] {
  const sessionByTable = new Map<string, MesaSession>()
  for (const session of sessions) {
    for (const tableId of session.tableIds) {
      sessionByTable.set(tableId, session)
    }
  }

  return tables.map((table) => {
    const session = sessionByTable.get(table.id)
    if (session) {
      const visualStatus =
        session.floorStatus === "paying" ? ("paying" as const) : ("open" as const)
      return {
        ...table,
        status: visualStatus,
        sessionId: session.id,
        reservationId: null,
      }
    }

    const reservation = pickFloorReservation(
      table.id,
      reservations,
      settings,
      now,
    )
    if (reservation) {
      return {
        ...table,
        status: "reserved" as const,
        sessionId: null,
        reservationId: reservation.id,
      }
    }

    return {
      ...table,
      status: "free" as const,
      sessionId: null,
      reservationId: null,
    }
  })
}

function toSessionInput(input: MesaOpenSessionInput) {
  return {
    tableIds: input.tableIds,
    waiterId: input.waiterId,
    guestCount: input.guestCount,
    note: input.note,
    reservationId: input.reservationId,
  }
}

export function useMesasState(popId: string, siteId: string) {
  const queryClient = useQueryClient()
  const enabled = Boolean(popId && siteId)

  const [activeSalonId, setActiveSalonId] = useState("")
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null)
  const [layoutEditMode, setLayoutEditMode] = useState(false)
  const [layoutSelection, setLayoutSelection] = useState<{
    kind: "table" | "decor"
    id: string
  } | null>(null)
  const [layoutError, setLayoutError] = useState<string | null>(null)
  const [sessionError, setSessionError] = useState<string | null>(null)
  const [floorNow, setFloorNow] = useState(() => new Date())

  const layoutQuery = useQuery({
    queryKey: popMesasLayoutQueryKey(popId),
    queryFn: async () => {
      const res = await fetchMesasLayout(popId)
      if (!res.success) throw new Error(res.error)
      return res.data
    },
    enabled,
    ...sessionListQueryOptions,
  })

  const sessionsQuery = useQuery({
    queryKey: popMesasSessionsQueryKey(popId),
    queryFn: async () => {
      const res = await fetchOpenTableSessions(popId)
      if (!res.success) throw new Error(res.error)
      return res.sessions.map(mapSessionRow)
    },
    enabled,
    ...sessionListQueryOptions,
  })

  const reservationsQuery = useQuery({
    queryKey: popMesasReservationsQueryKey(popId),
    queryFn: async () => {
      const res = await fetchTableReservations(popId)
      if (!res.success) throw new Error(res.error)
      return res.reservations.map(mapReservationRow)
    },
    enabled,
    ...sessionListQueryOptions,
  })

  const settingsQuery = useQuery({
    queryKey: popMesasReservationSettingsQueryKey(popId),
    queryFn: async (): Promise<MesasReservationSettingsCache> => {
      const res = await fetchMesasReservationSettings(popId)
      if (!res.success) throw new Error(res.error)
      return {
        settings: res.settings,
        operationalDayCloseTime: res.operationalDayCloseTime,
      }
    },
    enabled,
    ...sessionListQueryOptions,
  })

  const waitersQuery = useQuery({
    queryKey: popMesasWaitersQueryKey(popId),
    queryFn: async (): Promise<MesaWaiter[]> => {
      const res = await fetchMesasWaiters(popId)
      if (!res.success) throw new Error(res.error)
      return res.waiters
    },
    enabled,
    ...sessionListQueryOptions,
  })

  const layoutData = layoutQuery.data ?? null
  const mappedLayout = useMemo(
    () =>
      layoutData
        ? mapLayoutToState(layoutData)
        : { salons: [], layoutTables: [], decors: [] },
    [layoutData],
  )
  const salons = mappedLayout.salons
  const layoutTables = mappedLayout.layoutTables
  const decors = mappedLayout.decors
  const sessions = sessionsQuery.data ?? []
  const reservations = reservationsQuery.data ?? []
  const reservationSettings =
    settingsQuery.data?.settings ?? readMesasReservationSettings(null)
  const operationalDayCloseTime =
    settingsQuery.data?.operationalDayCloseTime ??
    DEFAULT_OPERATIONAL_DAY_CLOSE_TIME

  const layoutLoading = layoutQuery.isLoading
  const occupancyLoading =
    sessionsQuery.isLoading ||
    reservationsQuery.isLoading ||
    settingsQuery.isLoading

  useEffect(() => {
    const id = window.setInterval(() => setFloorNow(new Date()), 60_000)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    setActiveSalonId((prev) => {
      if (prev && salons.some((s) => s.id === prev)) return prev
      return firstActiveSalonId(salons)
    })
  }, [salons])

  const visibleReservations = useMemo(
    () =>
      reservations.map((reservation) => ({
        ...reservation,
        status: resolveReservationStatus(
          reservation,
          reservationSettings,
          floorNow,
        ),
      })),
    [reservations, reservationSettings, floorNow],
  )

  const tables = useMemo(
    () =>
      applyTableOccupancy(
        layoutTables,
        sessions,
        visibleReservations,
        reservationSettings,
        floorNow,
      ),
    [layoutTables, sessions, visibleReservations, reservationSettings, floorNow],
  )

  const todayAgenda = useMemo(
    () =>
      reservationsForAgendaDay(visibleReservations, floorNow, {
        timeZone: timezoneForSiteId(siteId),
        operationalDayCloseTime,
      }),
    [visibleReservations, floorNow, siteId, operationalDayCloseTime],
  )

  const removeSession = useCallback(
    (sessionId: string) => {
      if (!popId) return
      removeMesasSessionCache(queryClient, popId, sessionId)
    },
    [popId, queryClient],
  )

  const reloadSessions = useCallback(async () => {
    if (!popId) return
    await queryClient.invalidateQueries({
      queryKey: popMesasSessionsQueryKey(popId),
      refetchType: "all",
    })
  }, [popId, queryClient])

  const reloadReservations = useCallback(async () => {
    if (!popId) return
    await queryClient.invalidateQueries({
      queryKey: popMesasReservationsQueryKey(popId),
      refetchType: "all",
    })
  }, [popId, queryClient])

  const reloadReservationSettings = useCallback(async () => {
    if (!popId) return
    await queryClient.invalidateQueries({
      queryKey: popMesasReservationSettingsQueryKey(popId),
      refetchType: "all",
    })
  }, [popId, queryClient])

  const saveReservationSettings = useCallback(
    async (input: MesasReservationSettings): Promise<boolean> => {
      if (!popId || !siteId) return false

      const res = await updateMesasReservationSettingsApi(popId, {
        floorBufferMinutes: input.floorBufferMinutes,
        graceMinutes: input.graceMinutes,
      })
      if (!res.success) {
        setSessionError(res.error)
        return false
      }

      setSessionError(null)
      patchMesasReservationSettingsCache(queryClient, popId, input)
      return true
    },
    [popId, queryClient, siteId],
  )

  const reloadLayout = useCallback(async () => {
    if (!popId) return
    await queryClient.invalidateQueries({
      queryKey: popMesasLayoutQueryKey(popId),
      refetchType: "all",
    })
  }, [popId, queryClient])

  useEffect(() => {
    if (!activeSalonId) {
      setSelectedTableId(null)
      return
    }
    setSelectedTableId((prev) => {
      if (prev && tables.some((t) => t.id === prev && t.salonId === activeSalonId)) {
        return prev
      }
      return null
    })
  }, [activeSalonId, tables])

  const salonTables = useMemo(
    () => tables.filter((t) => t.salonId === activeSalonId),
    [tables, activeSalonId],
  )

  const selectTable = useCallback((tableId: string) => {
    if (!tableId) return
    setSelectedTableId(tableId)
  }, [])

  const salonDecors = useMemo(
    () => decors.filter((d) => d.salonId === activeSalonId),
    [decors, activeSalonId],
  )

  const selectedTable = useMemo(
    () => tables.find((t) => t.id === selectedTableId) ?? null,
    [tables, selectedTableId],
  )

  const selectedSession = useMemo(() => {
    if (!selectedTable?.sessionId) return null
    return sessions.find((s) => s.id === selectedTable.sessionId) ?? null
  }, [selectedTable, sessions])

  const selectedReservation = useMemo(() => {
    if (!selectedTable?.reservationId) return null
    return visibleReservations.find((r) => r.id === selectedTable.reservationId) ?? null
  }, [selectedTable, visibleReservations])

  const selectedTableReservationWarning = useMemo((): MesaReservationWarning | null => {
    if (!selectedTableId) return null
    if (selectedTable?.status !== "open" && selectedTable?.status !== "paying") {
      return null
    }
    return upcomingReservationWarning(
      selectedTableId,
      reservations,
      reservationSettings,
      floorNow,
    )
  }, [
    selectedTableId,
    selectedTable?.status,
    reservations,
    reservationSettings,
    floorNow,
  ])

  const selectedTableIds = useMemo(() => {
    if (!selectedTableId) return new Set<string>()
    if (selectedSession && selectedSession.tableIds.length > 1) {
      return new Set(selectedSession.tableIds)
    }
    if (selectedReservation && selectedReservation.tableIds.length > 1) {
      return new Set(selectedReservation.tableIds)
    }
    return new Set([selectedTableId])
  }, [selectedTableId, selectedSession, selectedReservation])

  useEffect(() => {
    if (!layoutEditMode) setLayoutSelection(null)
  }, [layoutEditMode])

  const selectLayoutItem = useCallback(
    (kind: "table" | "decor", id: string) => {
      if (!layoutEditMode) return
      setLayoutSelection({ kind, id })
    },
    [layoutEditMode],
  )

  const moveTable = useCallback(
    (tableId: string, dx: number, dy: number) => {
      if (!popId) return null
      return moveMesasLayoutTableCache(queryClient, popId, tableId, dx, dy)
    },
    [popId, queryClient],
  )

  const moveDecor = useCallback(
    (decorId: string, dx: number, dy: number) => {
      if (!popId) return null
      return moveMesasLayoutDecorCache(queryClient, popId, decorId, dx, dy)
    },
    [popId, queryClient],
  )

  const persistLayoutItem = useCallback(
    async (
      kind: "table" | "decor",
      id: string,
      pos: { x: number; y: number },
    ) => {
      if (!popId || !siteId) return

      const res = await saveMesasLayoutPositionsApi(
        popId,
        kind === "table"
          ? { tables: [{ id, x: pos.x, y: pos.y }] }
          : { decors: [{ id, x: pos.x, y: pos.y }] },
      )

      if (!res.success) {
        setLayoutError(res.error)
        void reloadLayout()
      }
    },
    [popId, siteId, reloadLayout],
  )

  const rotateLayoutItem = useCallback(() => {
    if (!layoutSelection || !popId || !siteId) return

    const { kind, id } = layoutSelection
    const rotated = rotateMesasLayoutItemCache(queryClient, popId, kind, id)
    if (!rotated) return

    if (kind === "table") {
      void saveMesasLayoutPositionsApi(popId, {
        tables: [{ id, x: rotated.x, y: rotated.y, rotation: rotated.rotation }],
      })
      return
    }

    void saveMesasLayoutPositionsApi(popId, {
      decors: [{ id, x: rotated.x, y: rotated.y, rotation: rotated.rotation }],
    })
  }, [layoutSelection, popId, queryClient, siteId])

  const openSession = useCallback(
    async (input: MesaOpenSessionInput) => {
      if (!popId || !siteId) return false

      setSessionError(null)
      const res = await openTableSessionApi(popId, toSessionInput(input))
      if (!res.success) {
        setSessionError(res.error)
        return false
      }

      upsertMesasSessionCache(queryClient, popId, mapSessionRow(res.session))
      if (input.reservationId) {
        const seatedId = input.reservationId
        queryClient.setQueryData<MesaReservation[]>(
          popMesasReservationsQueryKey(popId),
          (prev) =>
            (prev ?? []).map((r) =>
              r.id === seatedId &&
              (r.status === "pending" || r.status === "confirmed")
                ? { ...r, status: "seated" as const }
                : r,
            ),
        )
      }
      setSelectedTableId(input.tableIds[0] ?? null)
      return true
    },
    [popId, queryClient, siteId],
  )

  const updateSession = useCallback(
    async (sessionId: string, input: MesaOpenSessionInput) => {
      if (!popId || !siteId) return false

      setSessionError(null)
      const res = await updateTableSessionApi(
        popId,
        sessionId,
        toSessionInput(input),
      )
      if (!res.success) {
        setSessionError(res.error)
        return false
      }

      upsertMesasSessionCache(queryClient, popId, mapSessionRow(res.session))
      return true
    },
    [popId, queryClient, siteId],
  )

  const closeSession = useCallback(
    async (sessionId: string) => {
      if (!popId || !siteId) return false

      setSessionError(null)
      const res = await closeTableSessionApi(popId, sessionId)
      if (!res.success) {
        setSessionError(res.error)
        return false
      }

      removeSession(sessionId)
      await reloadReservations()
      return true
    },
    [popId, siteId, removeSession, reloadReservations],
  )

  const setSessionFloorStatus = useCallback(
    async (sessionId: string, floorStatus: MesaSession["floorStatus"]) => {
      if (!popId || !siteId) return false

      setSessionError(null)
      const res = await setTableSessionFloorStatusApi(popId, sessionId, floorStatus)
      if (!res.success) {
        setSessionError(res.error)
        return false
      }

      patchMesasSessionCache(queryClient, popId, sessionId, {
        floorStatus: res.floorStatus,
        updatedAt: res.updatedAt,
      })
      return true
    },
    [popId, queryClient, siteId],
  )

  const saveReservation = useCallback(
    async (input: MesaReservationInput) => {
      if (!popId || !siteId) return false

      setSessionError(null)
      const res = await upsertTableReservationApi(popId, input)
      if (!res.success) {
        setSessionError(res.error)
        return false
      }

      upsertMesasReservationCache(
        queryClient,
        popId,
        mapReservationRow(res.reservation),
      )
      return true
    },
    [popId, queryClient, siteId],
  )

  const removeReservation = useCallback(
    async (reservationId: string) => {
      if (!popId || !siteId) return false

      setSessionError(null)
      const res = await cancelTableReservationApi(popId, reservationId)
      if (!res.success) {
        setSessionError(res.error)
        return false
      }

      markMesasReservationCancelledCache(queryClient, popId, reservationId)
      return true
    },
    [popId, queryClient, siteId],
  )

  const freeTablesInSalon = useCallback(
    (salonId: string, excludeIds: string[] = []) => {
      const exclude = new Set(excludeIds)
      return tables.filter(
        (t) =>
          t.salonId === salonId &&
          t.status === "free" &&
          !exclude.has(t.id),
      )
    },
    [tables],
  )

  const markReservationNoShow = useCallback(
    async (reservationId: string) => {
      if (!popId || !siteId) return false

      setSessionError(null)
      const res = await updateTableReservationStatusApi(
        popId,
        reservationId,
        "no_show",
      )
      if (!res.success) {
        setSessionError(res.error)
        return false
      }

      upsertMesasReservationCache(
        queryClient,
        popId,
        mapReservationRow(res.reservation),
      )
      return true
    },
    [popId, queryClient, siteId],
  )

  const checkInReservation = useCallback(
    async (
      reservation: MesaReservation,
      input: MesaOpenSessionInput,
    ) => {
      const requestedIds =
        input.tableIds.length > 0
          ? input.tableIds
          : reservation.tableIds.length > 0
            ? reservation.tableIds
            : reservation.tableId
              ? [reservation.tableId]
              : []
      const tableIds = requestedIds.filter((id, index) => {
        if (index === 0) return true
        const table = tables.find((item) => item.id === id)
        return table == null || !isMesaOccupiedNow(table.status)
      })
      if (tableIds.length === 0) return false

      if (reservation.tableIds.length === 0 && !reservation.tableId) {
        const assigned = await saveReservation({
          reservationId: reservation.id,
          tableId: tableIds[0],
          tableIds,
          clientId: reservation.clientId,
          clientName: reservation.clientName,
          guestCount: input.guestCount ?? reservation.guestCount ?? null,
          arrivalAt: reservation.arrivalAt,
          note: reservation.note,
        })
        if (!assigned) return false
      }

      const ok = await openSession({
        ...input,
        tableIds,
        guestCount: input.guestCount ?? reservation.guestCount ?? null,
        reservationId: reservation.id,
      })
      return ok
    },
    [openSession, saveReservation, tables],
  )

  return {
    salons,
    tables,
    sessions,
    waiters: waitersQuery.data ?? [],
    reservations: visibleReservations,
    decors,
    activeSalonId,
    setActiveSalonId,
    selectedTableId,
    selectedTableIds,
    selectTable,
    selectedTable,
    selectedSession,
    selectedReservation,
    selectedTableReservationWarning,
    reservationSettings,
    saveReservationSettings,
    todayAgenda,
    floorNow,
    salonTables,
    salonDecors,
    layoutEditMode,
    setLayoutEditMode,
    layoutSelection,
    selectLayoutItem,
    rotateLayoutItem,
    layoutLoading,
    occupancyLoading,
    floorLoading: layoutLoading || occupancyLoading,
    layoutError: layoutError ?? layoutQuery.error?.message ?? null,
    sessionError:
      sessionError ??
      sessionsQuery.error?.message ??
      reservationsQuery.error?.message ??
      settingsQuery.error?.message ??
      null,
    layoutData,
    reloadLayout,
    reloadSessions,
    reloadReservations,
    reloadReservationSettings,
    moveTable,
    moveDecor,
    persistLayoutItem,
    openSession,
    updateSession,
    closeSession,
    setSessionFloorStatus,
    saveReservation,
    removeReservation,
    markReservationNoShow,
    checkInReservation,
    freeTablesInSalon,
    removeSession,
  }
}
