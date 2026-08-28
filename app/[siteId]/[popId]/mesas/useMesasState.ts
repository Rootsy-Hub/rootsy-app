"use client"

import {
  cancelTableReservationApi,
  closeTableSessionApi,
  fetchMesasWaiters,
  fetchTableSession,
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
  setMesasSessionDetailCache,
  upsertMesasReservationCache,
  upsertMesasSessionCache,
  type MesasReservationSettingsCache,
} from "@/app/[siteId]/[popId]/mesas/mesasQueryCache"
import {
  popMesasLayoutQueryKey,
  popMesasReservationSettingsQueryKey,
  popMesasReservationsQueryKey,
  popMesasSessionQueryKey,
  popMesasSessionsQueryKey,
  popMesasWaitersQueryKey,
} from "@/lib/queryKeys"
import { sessionListQueryOptions } from "@/lib/queryStaleTimes"
import { useMesasFloorHydrate } from "@/hooks/useMesasFloorHydrate"
import {
  readMesasLayoutLocalOrFetch,
  readMesasReservationsLocalOrFetch,
  readMesasReservationSettingsLocalOrFetch,
  readMesasSessionsLocalOrFetch,
  refreshMesasLayoutFromNetwork,
  refreshMesasReservationsFromNetwork,
  refreshMesasReservationSettingsFromNetwork,
  refreshMesasSessionsFromNetwork,
} from "@/lib/popLocalDb/hydrateMesasFloor"
import { usePopSaleComprobanteFiscalContext } from "@/hooks/usePopSaleComprobanteFiscalContext"
import { readMesasWorkspacePreference } from "@/lib/mesasWorkspacePreference"
import { readInitialSaleCheckoutFromCache } from "@/lib/saleCheckoutDefaults"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

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
  const fiscal = usePopSaleComprobanteFiscalContext()
  const floorHydrate = useMesasFloorHydrate(popId)
  const enabled = Boolean(popId && siteId)
  const floorEnabled = enabled && floorHydrate.canReadFloor

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
  const tableRestoredRef = useRef(false)

  const layoutQuery = useQuery({
    queryKey: popMesasLayoutQueryKey(popId),
    queryFn: () => readMesasLayoutLocalOrFetch(popId),
    enabled: floorEnabled,
    ...sessionListQueryOptions,
  })

  const sessionsQuery = useQuery({
    queryKey: popMesasSessionsQueryKey(popId),
    queryFn: () => readMesasSessionsLocalOrFetch(popId),
    enabled: floorEnabled,
    ...sessionListQueryOptions,
  })

  const reservationsQuery = useQuery({
    queryKey: popMesasReservationsQueryKey(popId),
    queryFn: () => readMesasReservationsLocalOrFetch(popId),
    enabled: floorEnabled,
    ...sessionListQueryOptions,
  })

  const settingsQuery = useQuery({
    queryKey: popMesasReservationSettingsQueryKey(popId),
    queryFn: () => readMesasReservationSettingsLocalOrFetch(popId),
    enabled: floorEnabled,
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

  const layoutLoading = layoutQuery.isLoading || !floorHydrate.canReadFloor
  const occupancyLoading =
    !floorHydrate.canReadFloor || sessionsQuery.isLoading
  const waitersLoading = waitersQuery.isLoading

  useEffect(() => {
    const id = window.setInterval(() => setFloorNow(new Date()), 60_000)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    setActiveSalonId((prev) => {
      if (prev && salons.some((s) => s.id === prev)) return prev
      if (prev && salons.length === 0) return prev
      return firstActiveSalonId(salons)
    })
  }, [salons])

  useEffect(() => {
    tableRestoredRef.current = false
  }, [popId])

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

  useEffect(() => {
    if (!popId || tableRestoredRef.current) return
    if (!floorHydrate.canReadFloor) return
    if (layoutQuery.isLoading || sessionsQuery.isLoading) return
    tableRestoredRef.current = true
    const saved = readMesasWorkspacePreference(popId)
    if (!saved) return
    if (saved.tableId && tables.some((table) => table.id === saved.tableId)) {
      const table = tables.find((item) => item.id === saved.tableId)
      if (table) setActiveSalonId(table.salonId)
      setSelectedTableId(saved.tableId)
      return
    }
    if (saved.salonId && salons.some((salon) => salon.id === saved.salonId)) {
      setActiveSalonId(saved.salonId)
    }
  }, [
    popId,
    floorHydrate.canReadFloor,
    layoutQuery.isLoading,
    sessionsQuery.isLoading,
    tables,
    salons,
  ])

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
    const sessions = await refreshMesasSessionsFromNetwork(popId)
    queryClient.setQueryData(popMesasSessionsQueryKey(popId), sessions)
  }, [popId, queryClient])

  const reloadReservations = useCallback(async () => {
    if (!popId) return
    const reservations = await refreshMesasReservationsFromNetwork(popId)
    queryClient.setQueryData(popMesasReservationsQueryKey(popId), reservations)
  }, [popId, queryClient])

  const reloadReservationSettings = useCallback(async () => {
    if (!popId) return
    const settings = await refreshMesasReservationSettingsFromNetwork(popId)
    queryClient.setQueryData(popMesasReservationSettingsQueryKey(popId), settings)
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
    const layout = await refreshMesasLayoutFromNetwork(popId)
    queryClient.setQueryData(popMesasLayoutQueryKey(popId), layout)
  }, [popId, queryClient])

  useEffect(() => {
    if (!activeSalonId || tables.length === 0) return
    setSelectedTableId((prev) => {
      if (!prev) return prev
      if (tables.some((t) => t.id === prev && t.salonId === activeSalonId)) {
        return prev
      }
      return null
    })
  }, [activeSalonId, tables])

  const salonTables = useMemo(
    () => tables.filter((t) => t.salonId === activeSalonId),
    [tables, activeSalonId],
  )

  const selectTable = useCallback(
    (tableId: string) => {
      if (!tableId) return
      const table = tables.find((item) => item.id === tableId)
      if (table) setActiveSalonId(table.salonId)
      setSelectedTableId(tableId)
    },
    [tables],
  )

  const salonDecors = useMemo(
    () => decors.filter((d) => d.salonId === activeSalonId),
    [decors, activeSalonId],
  )

  const selectedTable = useMemo(
    () => tables.find((t) => t.id === selectedTableId) ?? null,
    [tables, selectedTableId],
  )

  const selectedSessionId = selectedTable?.sessionId ?? null
  const sessionDetailIdRef = useRef<string | null>(null)
  if (selectedSessionId) sessionDetailIdRef.current = selectedSessionId
  const sessionDetailId = selectedSessionId ?? sessionDetailIdRef.current

  const sessionDetailQuery = useQuery({
    queryKey: popMesasSessionQueryKey(popId, sessionDetailId ?? ""),
    queryFn: async ({ queryKey }) => {
      const sessionId = queryKey[3]
      if (!sessionId) return null
      const res = await fetchTableSession(popId, sessionId)
      if (!res.success) throw new Error(res.error)
      if (!res.session) {
        removeMesasSessionCache(queryClient, popId, sessionId)
        return null
      }
      const session = mapSessionRow(res.session)
      upsertMesasSessionCache(queryClient, popId, session)
      setMesasSessionDetailCache(queryClient, popId, session)
      return session
    },
    enabled: enabled && Boolean(selectedSessionId && sessionDetailId),
    ...sessionListQueryOptions,
  })

  const sessionTicketReady =
    !selectedSessionId ||
    sessionDetailQuery.data != null ||
    sessionDetailQuery.isFetched

  const selectedSession = useMemo(() => {
    if (!selectedSessionId) return null
    const floor = sessions.find((s) => s.id === selectedSessionId) ?? null
    if (!floor) return null
    return {
      ...floor,
      updatedAt: sessionDetailQuery.data?.updatedAt ?? floor.updatedAt,
      checkout: sessionTicketReady
        ? sessionDetailQuery.data?.checkout ?? null
        : null,
    }
  }, [
    selectedSessionId,
    sessions,
    sessionTicketReady,
    sessionDetailQuery.data,
    sessionDetailQuery.data?.updatedAt,
    sessionDetailQuery.data?.checkout,
  ])

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
      const res = await openTableSessionApi(popId, {
        ...toSessionInput(input),
        checkout: readInitialSaleCheckoutFromCache(queryClient, popId, {
          popEmisorIvaCondition: fiscal.popEmisorIvaCondition,
          hasValidPopFiscalCuit: fiscal.hasValidPopFiscalCuit,
        }),
      })
      if (!res.success) {
        setSessionError(res.error)
        return false
      }

      const mapped = mapSessionRow(res.session)
      upsertMesasSessionCache(queryClient, popId, mapped)
      setMesasSessionDetailCache(queryClient, popId, mapped)
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
    [
      fiscal.hasValidPopFiscalCuit,
      fiscal.popEmisorIvaCondition,
      popId,
      queryClient,
      siteId,
    ],
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

      const mapped = mapSessionRow(res.session)
      upsertMesasSessionCache(queryClient, popId, mapped)
      setMesasSessionDetailCache(queryClient, popId, mapped)
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
    waitersLoading,
    reservations: visibleReservations,
    decors,
    activeSalonId,
    setActiveSalonId,
    selectedTableId,
    selectedTableIds,
    selectTable,
    selectedTable,
    selectedSession,
    sessionTicketReady,
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
      sessionDetailQuery.error?.message ??
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
