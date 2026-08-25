"use client"

import {
  cancelTableReservationApi,
  closeTableSessionApi,
  fetchMesasLayout,
  fetchMesasReservationSettings,
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
import type {
  MesasLayoutData,
  MesaReservationRow,
  MesaSessionRow,
} from "@/app/[siteId]/[popId]/mesas/actions"
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
  MesaFloorDecor,
  MesaOpenSessionInput,
  MesaReservation,
  MesaReservationInput,
  MesaSalon,
  MesaSession,
  MesaTable,
} from "@/app/[siteId]/[popId]/mesas/mesasTypes"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

function firstActiveSalonId(salons: MesaSalon[]): string {
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

function mapSessionRow(row: MesaSessionRow): MesaSession {
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

function mapReservationRow(row: MesaReservationRow): MesaReservation {
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

function mapLayoutToState(data: MesasLayoutData): {
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
  const [salons, setSalons] = useState<MesaSalon[]>([])
  const [layoutTables, setLayoutTables] = useState<MesaTable[]>([])
  const [decors, setDecors] = useState<MesaFloorDecor[]>([])
  const [sessions, setSessions] = useState<MesaSession[]>([])
  const [reservations, setReservations] = useState<MesaReservation[]>([])
  const [activeSalonId, setActiveSalonId] = useState("")
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null)
  const [layoutEditMode, setLayoutEditMode] = useState(false)
  const [layoutSelection, setLayoutSelection] = useState<{
    kind: "table" | "decor"
    id: string
  } | null>(null)
  const [layoutLoading, setLayoutLoading] = useState(true)
  const [occupancyLoading, setOccupancyLoading] = useState(true)
  const initialOccupancyLoadedRef = useRef(false)
  const [layoutError, setLayoutError] = useState<string | null>(null)
  const [sessionError, setSessionError] = useState<string | null>(null)
  const [layoutData, setLayoutData] = useState<MesasLayoutData | null>(null)
  const [floorNow, setFloorNow] = useState(() => new Date())
  const [reservationSettings, setReservationSettings] =
    useState<MesasReservationSettings>(() =>
      readMesasReservationSettings(null),
    )
  const [operationalDayCloseTime, setOperationalDayCloseTime] = useState(
    DEFAULT_OPERATIONAL_DAY_CLOSE_TIME,
  )

  useEffect(() => {
    const id = window.setInterval(() => setFloorNow(new Date()), 60_000)
    return () => window.clearInterval(id)
  }, [])

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

  const removeSession = useCallback((sessionId: string) => {
    setSessions((prev) => prev.filter((session) => session.id !== sessionId))
  }, [])

  const upsertSession = useCallback((row: MesaSessionRow) => {
    const mapped = mapSessionRow(row)
    setSessions((prev) => {
      const index = prev.findIndex((session) => session.id === mapped.id)
      if (index < 0) return [...prev, mapped]
      const next = [...prev]
      next[index] = mapped
      return next
    })
  }, [])

  const reloadSessions = useCallback(async () => {
    if (!popId || !siteId) return

    const res = await fetchOpenTableSessions(popId)
    if (!res.success) {
      setSessionError(res.error)
      return
    }

    setSessionError(null)
    setSessions(res.sessions.map(mapSessionRow))
  }, [popId, siteId])

  const reloadReservations = useCallback(async () => {
    if (!popId || !siteId) return

    const res = await fetchTableReservations(popId)
    if (!res.success) {
      setSessionError(res.error)
      return
    }

    setSessionError(null)
    setReservations(res.reservations.map(mapReservationRow))
  }, [popId, siteId])

  const reloadReservationSettings = useCallback(async () => {
    if (!popId || !siteId) return

    const res = await fetchMesasReservationSettings(popId)
    if (!res.success) {
      setSessionError(res.error)
      return
    }

    setSessionError(null)
    setReservationSettings(res.settings)
    setOperationalDayCloseTime(res.operationalDayCloseTime)
  }, [popId, siteId])

  const reloadOccupancy = useCallback(async () => {
    if (!popId || !siteId) {
      setOccupancyLoading(false)
      return
    }

    if (!initialOccupancyLoadedRef.current) {
      setOccupancyLoading(true)
    }

    await Promise.all([
      reloadSessions(),
      reloadReservations(),
      reloadReservationSettings(),
    ])

    initialOccupancyLoadedRef.current = true
    setOccupancyLoading(false)
  }, [
    popId,
    siteId,
    reloadSessions,
    reloadReservations,
    reloadReservationSettings,
  ])

  useEffect(() => {
    initialOccupancyLoadedRef.current = false
    setOccupancyLoading(true)
  }, [popId, siteId])

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
      setReservationSettings(input)
      return true
    },
    [popId, siteId],
  )

  const reloadLayout = useCallback(async () => {
    if (!popId || !siteId) {
      setLayoutLoading(false)
      return
    }

    setLayoutLoading(true)
    setLayoutError(null)

    const res = await fetchMesasLayout(popId)
    setLayoutLoading(false)

    if (!res.success) {
      setLayoutError(res.error)
      setLayoutData(null)
      return
    }

    setLayoutData(res.data)
    const mapped = mapLayoutToState(res.data)
    setSalons(mapped.salons)
    setLayoutTables(mapped.layoutTables)
    setDecors(mapped.decors)

    setActiveSalonId((prev) => {
      if (prev && mapped.salons.some((s) => s.id === prev)) return prev
      return firstActiveSalonId(mapped.salons)
    })
  }, [popId, siteId])

  useEffect(() => {
    void reloadLayout()
    void reloadOccupancy()
  }, [reloadLayout, reloadOccupancy])

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
      let result: { x: number; y: number } | null = null
      setLayoutTables((prev) =>
        prev.map((t) => {
          if (t.id !== tableId) return t
          const x = Math.max(8, t.x + dx)
          const y = Math.max(8, t.y + dy)
          result = { x, y }
          return { ...t, x, y }
        }),
      )
      return result
    },
    [],
  )

  const moveDecor = useCallback((decorId: string, dx: number, dy: number) => {
    let result: { x: number; y: number } | null = null
    setDecors((prev) =>
      prev.map((d) => {
        if (d.id !== decorId) return d
        const x = Math.max(8, d.x + dx)
        const y = Math.max(8, d.y + dy)
        result = { x, y }
        return { ...d, x, y }
      }),
    )
    return result
  }, [])

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
    if (kind === "table") {
      setLayoutTables((prev) => {
        const table = prev.find((t) => t.id === id)
        if (!table) return prev
        const rotation = (table.rotation + 45) % 360
        void saveMesasLayoutPositionsApi(popId, {
          tables: [{ id, x: table.x, y: table.y, rotation }],
        })
        return prev.map((t) => (t.id === id ? { ...t, rotation } : t))
      })
      return
    }

    setDecors((prev) => {
      const decor = prev.find((d) => d.id === id)
      if (!decor) return prev
      const rotation = (decor.rotation + 45) % 360
      void saveMesasLayoutPositionsApi(popId, {
        decors: [{ id, x: decor.x, y: decor.y, rotation }],
      })
      return prev.map((d) => (d.id === id ? { ...d, rotation } : d))
    })
  }, [layoutSelection, popId, siteId])

  const openSession = useCallback(
    async (input: MesaOpenSessionInput) => {
      if (!popId || !siteId) return false

      setSessionError(null)
      const res = await openTableSessionApi(popId, toSessionInput(input))
      if (!res.success) {
        setSessionError(res.error)
        return false
      }

      upsertSession(res.session)
      if (input.reservationId) {
        const seatedId = input.reservationId
        setReservations((prev) =>
          prev.map((r) =>
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
    [popId, siteId, upsertSession],
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

      upsertSession(res.session)
      return true
    },
    [popId, siteId, upsertSession],
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

      setSessions((prev) =>
        prev.map((session) =>
          session.id === sessionId
            ? { ...session, floorStatus: res.floorStatus, updatedAt: res.updatedAt }
            : session,
        ),
      )
      return true
    },
    [popId, siteId],
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

      const mapped = mapReservationRow(res.reservation)
      setReservations((prev) => {
        const index = prev.findIndex((r) => r.id === mapped.id)
        if (index < 0) return [...prev, mapped]
        const next = [...prev]
        next[index] = mapped
        return next
      })
      return true
    },
    [popId, siteId],
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

      setReservations((prev) =>
        prev.map((r) =>
          r.id === reservationId ? { ...r, status: "cancelled" as const } : r,
        ),
      )
      return true
    },
    [popId, siteId],
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

      const mapped = mapReservationRow(res.reservation)
      setReservations((prev) => {
        const index = prev.findIndex((r) => r.id === mapped.id)
        if (index < 0) return [...prev, mapped]
        const next = [...prev]
        next[index] = mapped
        return next
      })
      return true
    },
    [popId, siteId],
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
    layoutError,
    sessionError,
    layoutData,
    reloadLayout,
    reloadSessions,
    reloadReservations,
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
