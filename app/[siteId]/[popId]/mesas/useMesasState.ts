"use client"

import {
  closeTableSession,
  getMesasLayout,
  getOpenTableSessionById,
  getOpenTableSessions,
  openTableSession,
  saveMesasLayoutPositions,
  updateTableSession,
  type MesasLayoutData,
  type MesaSessionRow,
} from "@/app/[siteId]/[popId]/mesas/actions"
import type {
  MesaFloorDecor,
  MesaOpenSessionInput,
  MesaSalon,
  MesaSession,
  MesaTable,
} from "@/app/[siteId]/[popId]/mesas/mesasTypes"
import {
  createKeyedDebouncer,
  readRealtimeForeignKey,
  readRealtimeRowId,
  subscribePostgresChanges,
  type RealtimeConnectionStatus,
} from "@/lib/supabaseRealtimeHelpers"
import { createClient } from "@/utils/supabase/client"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

function firstTableIdInSalon(
  tables: MesaTable[],
  salonId: string,
): string | null {
  return tables.find((t) => t.salonId === salonId)?.id ?? null
}

function firstActiveSalonId(salons: MesaSalon[]): string {
  const active = salons.filter((s) => s.isActive !== false)
  return active[0]?.id ?? salons[0]?.id ?? ""
}

function applySessionsToTables(
  tables: MesaTable[],
  sessions: MesaSession[],
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
      return { ...table, status: "open" as const, sessionId: session.id }
    }
    return { ...table, status: "free" as const, sessionId: null }
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
  }
}

export function useMesasState(popId: string, siteId: string) {
  const [salons, setSalons] = useState<MesaSalon[]>([])
  const [layoutTables, setLayoutTables] = useState<MesaTable[]>([])
  const [decors, setDecors] = useState<MesaFloorDecor[]>([])
  const [sessions, setSessions] = useState<MesaSession[]>([])
  const [activeSalonId, setActiveSalonId] = useState("")
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null)
  const [layoutEditMode, setLayoutEditMode] = useState(false)
  const [layoutSelection, setLayoutSelection] = useState<{
    kind: "table" | "decor"
    id: string
  } | null>(null)
  const [layoutLoading, setLayoutLoading] = useState(true)
  const [layoutError, setLayoutError] = useState<string | null>(null)
  const [sessionError, setSessionError] = useState<string | null>(null)
  const [realtimeStatus, setRealtimeStatus] =
    useState<RealtimeConnectionStatus>("connecting")
  const [layoutData, setLayoutData] = useState<MesasLayoutData | null>(null)

  const sessionSyncDebouncerRef = useRef(createKeyedDebouncer())
  const wasDisconnectedRef = useRef(false)
  const knownSessionIdsRef = useRef(new Set<string>())

  useEffect(() => {
    knownSessionIdsRef.current = new Set(sessions.map((session) => session.id))
  }, [sessions])

  const tables = useMemo(
    () => applySessionsToTables(layoutTables, sessions),
    [layoutTables, sessions],
  )

  const removeSession = useCallback((sessionId: string) => {
    sessionSyncDebouncerRef.current.cancel(sessionId)
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

  const syncSessionFromServer = useCallback(
    async (sessionId: string) => {
      if (!popId || !siteId) return

      const res = await getOpenTableSessionById(popId, siteId, sessionId)
      if (!res.success) {
        setSessionError(res.error)
        return
      }

      setSessionError(null)
      if (res.session) {
        upsertSession(res.session)
        return
      }

      if (knownSessionIdsRef.current.has(sessionId)) {
        removeSession(sessionId)
      }
    },
    [popId, siteId, upsertSession, removeSession],
  )

  const scheduleSessionSync = useCallback(
    (sessionId: string) => {
      sessionSyncDebouncerRef.current.schedule(sessionId, () => {
        void syncSessionFromServer(sessionId)
      })
    },
    [syncSessionFromServer],
  )

  const reloadSessions = useCallback(async () => {
    if (!popId || !siteId) return

    const res = await getOpenTableSessions(popId, siteId)
    if (!res.success) {
      setSessionError(res.error)
      return
    }

    setSessionError(null)
    setSessions(res.sessions.map(mapSessionRow))
  }, [popId, siteId])

  const reloadLayout = useCallback(async () => {
    if (!popId || !siteId) {
      setLayoutLoading(false)
      return
    }

    setLayoutLoading(true)
    setLayoutError(null)

    const res = await getMesasLayout(popId, siteId)
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
    void reloadSessions()
  }, [reloadLayout, reloadSessions])

  useEffect(() => {
    if (!popId) return

    const supabase = createClient()
    const debouncer = sessionSyncDebouncerRef.current

    const handleRealtimeStatus = (status: RealtimeConnectionStatus) => {
      if (status === "connected") {
        if (wasDisconnectedRef.current) {
          wasDisconnectedRef.current = false
          void reloadSessions()
        }
        setRealtimeStatus("connected")
        return
      }

      wasDisconnectedRef.current = true
      setRealtimeStatus("disconnected")
    }

    const sessionChannel = subscribePostgresChanges({
      supabase,
      channelName: `mesas-table-sessions:${popId}`,
      table: "table_sessions",
      filter: `pop_id=eq.${popId}`,
      onStatusChange: handleRealtimeStatus,
      onChange: (payload) => {
        if (payload.eventType === "DELETE") {
          const sessionId = readRealtimeRowId(payload)
          if (sessionId) removeSession(sessionId)
          return
        }

        const sessionId = readRealtimeRowId(payload)
        if (sessionId) scheduleSessionSync(sessionId)
      },
    })

    const mergeChannel = subscribePostgresChanges({
      supabase,
      channelName: `mesas-table-session-tables:${popId}`,
      table: "table_session_tables",
      onChange: (payload) => {
        const sessionId = readRealtimeForeignKey(payload, "table_session_id")
        if (!sessionId) return
        if (
          payload.eventType !== "INSERT" &&
          !knownSessionIdsRef.current.has(sessionId)
        ) {
          return
        }
        scheduleSessionSync(sessionId)
      },
    })

    return () => {
      debouncer.clear()
      void supabase.removeChannel(sessionChannel)
      void supabase.removeChannel(mergeChannel)
    }
  }, [popId, reloadSessions, removeSession, scheduleSessionSync])

  useEffect(() => {
    if (!activeSalonId) {
      setSelectedTableId(null)
      return
    }
    setSelectedTableId((prev) => {
      if (prev && tables.some((t) => t.id === prev && t.salonId === activeSalonId)) {
        return prev
      }
      return firstTableIdInSalon(
        tables.filter((t) => t.salonId === activeSalonId),
        activeSalonId,
      )
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

  const selectedTableIds = useMemo(() => {
    if (!selectedTableId) return new Set<string>()
    if (!selectedSession || selectedSession.tableIds.length <= 1) {
      return new Set([selectedTableId])
    }
    return new Set(selectedSession.tableIds)
  }, [selectedTableId, selectedSession])

  useEffect(() => {
    if (!layoutEditMode) {
      setLayoutSelection(null)
    }
  }, [layoutEditMode])

  const persistLayoutItem = useCallback(
    async (
      kind: "table" | "decor",
      id: string,
      fields: { x: number; y: number; rotation: number },
    ) => {
      if (!popId || !siteId) return
      const payload =
        kind === "table"
          ? { tables: [{ id, ...fields }] }
          : { decors: [{ id, ...fields }] }
      await saveMesasLayoutPositions(popId, siteId, payload)
    },
    [popId, siteId],
  )

  const selectLayoutItem = useCallback(
    (kind: "table" | "decor", id: string) => {
      setLayoutSelection({ kind, id })
    },
    [],
  )

  const rotateLayoutItem = useCallback(() => {
    if (!layoutSelection) return

    if (layoutSelection.kind === "table") {
      setLayoutTables((prev) => {
        const current = prev.find((t) => t.id === layoutSelection.id)
        if (!current) return prev
        const rotation = (current.rotation + 45) % 360
        void persistLayoutItem("table", current.id, {
          x: current.x,
          y: current.y,
          rotation,
        })
        return prev.map((t) =>
          t.id === layoutSelection.id ? { ...t, rotation } : t,
        )
      })
      return
    }

    setDecors((prev) => {
      const current = prev.find((d) => d.id === layoutSelection.id)
      if (!current) return prev
      const rotation = (current.rotation + 45) % 360
      void persistLayoutItem("decor", current.id, {
        x: current.x,
        y: current.y,
        rotation,
      })
      return prev.map((d) =>
        d.id === layoutSelection.id ? { ...d, rotation } : d,
      )
    })
  }, [layoutSelection, persistLayoutItem])

  const moveTable = useCallback(
    (tableId: string, dx: number, dy: number): { x: number; y: number; rotation: number } | null => {
      let next: { x: number; y: number; rotation: number } | null = null
      setLayoutTables((prev) =>
        prev.map((t) => {
          if (t.id !== tableId) return t
          next = {
            x: Math.max(8, t.x + dx),
            y: Math.max(8, t.y + dy),
            rotation: t.rotation,
          }
          return { ...t, x: next.x, y: next.y }
        }),
      )
      return next
    },
    [],
  )

  const moveDecor = useCallback(
    (decorId: string, dx: number, dy: number): { x: number; y: number; rotation: number } | null => {
      let next: { x: number; y: number; rotation: number } | null = null
      setDecors((prev) =>
        prev.map((d) => {
          if (d.id !== decorId) return d
          next = {
            x: Math.max(8, d.x + dx),
            y: Math.max(8, d.y + dy),
            rotation: d.rotation,
          }
          return { ...d, x: next.x, y: next.y }
        }),
      )
      return next
    },
    [],
  )

  const openSession = useCallback(
    async (input: MesaOpenSessionInput) => {
      if (!popId || !siteId) return false

      setSessionError(null)
      const res = await openTableSession(popId, siteId, toSessionInput(input))
      if (!res.success) {
        setSessionError(res.error)
        return false
      }

      upsertSession(res.session)
      setSelectedTableId(input.tableIds[0] ?? null)
      return true
    },
    [popId, siteId, upsertSession],
  )

  const updateSession = useCallback(
    async (sessionId: string, input: MesaOpenSessionInput) => {
      if (!popId || !siteId) return false

      setSessionError(null)
      const res = await updateTableSession(
        popId,
        siteId,
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
      const res = await closeTableSession(popId, siteId, sessionId, "cancelled")
      if (!res.success) {
        setSessionError(res.error)
        return false
      }

      removeSession(sessionId)
      return true
    },
    [popId, siteId, removeSession],
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

  return {
    salons,
    tables,
    sessions,
    decors,
    activeSalonId,
    setActiveSalonId,
    selectedTableId,
    selectedTableIds,
    selectTable,
    selectedTable,
    selectedSession,
    salonTables,
    salonDecors,
    layoutEditMode,
    setLayoutEditMode,
    layoutSelection,
    selectLayoutItem,
    rotateLayoutItem,
    layoutLoading,
    layoutError,
    sessionError,
    realtimeStatus,
    layoutData,
    reloadLayout,
    reloadSessions,
    moveTable,
    moveDecor,
    persistLayoutItem,
    openSession,
    updateSession,
    closeSession,
    freeTablesInSalon,
  }
}
