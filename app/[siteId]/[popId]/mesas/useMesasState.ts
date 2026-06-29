"use client"

import {
  MOCK_MESA_FLOOR_DECORS,
  MOCK_MESA_SESSIONS,
  MOCK_MESA_TABLES,
} from "@/app/[siteId]/[popId]/mesas/mesasMockData"
import type {
  MesaFloorDecor,
  MesaOpenSessionInput,
  MesaSession,
  MesaTable,
} from "@/app/[siteId]/[popId]/mesas/mesasTypes"
import { useCallback, useMemo, useState } from "react"

function newSessionId(): string {
  return `sess-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function firstTableIdInSalon(
  tables: MesaTable[],
  salonId: string,
): string | null {
  return tables.find((t) => t.salonId === salonId)?.id ?? null
}

export function useMesasState() {
  const [tables, setTables] = useState<MesaTable[]>(() =>
    MOCK_MESA_TABLES.map((t) => ({ ...t })),
  )
  const [decors, setDecors] = useState<MesaFloorDecor[]>(() =>
    MOCK_MESA_FLOOR_DECORS.map((d) => ({ ...d })),
  )
  const [sessions, setSessions] = useState<MesaSession[]>(() =>
    MOCK_MESA_SESSIONS.map((s) => ({ ...s })),
  )
  const [activeSalonId, setActiveSalonId] = useState("salon-a")
  const [selectedTableId, setSelectedTableId] = useState<string | null>(() =>
    firstTableIdInSalon(MOCK_MESA_TABLES, "salon-a"),
  )
  const [layoutEditMode, setLayoutEditMode] = useState(false)

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

  const moveTable = useCallback((tableId: string, dx: number, dy: number) => {
    setTables((prev) =>
      prev.map((t) =>
        t.id === tableId
          ? { ...t, x: Math.max(8, t.x + dx), y: Math.max(8, t.y + dy) }
          : t,
      ),
    )
  }, [])

  const moveDecor = useCallback((decorId: string, dx: number, dy: number) => {
    setDecors((prev) =>
      prev.map((d) =>
        d.id === decorId
          ? { ...d, x: Math.max(8, d.x + dx), y: Math.max(8, d.y + dy) }
          : d,
      ),
    )
  }, [])

  const openSession = useCallback((input: MesaOpenSessionInput) => {
    const sessionId = newSessionId()
    const session: MesaSession = {
      id: sessionId,
      tableIds: input.tableIds,
      waiterId: input.waiterId,
      guestCount: input.guestCount,
      note: input.note.trim(),
      openedAt: new Date().toISOString(),
    }
    setSessions((prev) => [...prev, session])
    setTables((prev) =>
      prev.map((t) =>
        input.tableIds.includes(t.id)
          ? { ...t, status: "open" as const, sessionId }
          : t,
      ),
    )
    setSelectedTableId(input.tableIds[0] ?? null)
  }, [])

  const updateSession = useCallback(
    (sessionId: string, input: MesaOpenSessionInput) => {
      setSessions((prevSessions) => {
        const old = prevSessions.find((s) => s.id === sessionId)
        const oldIds = new Set(old?.tableIds ?? [])
        const newIds = new Set(input.tableIds)

        setTables((prevTables) =>
          prevTables.map((t) => {
            if (newIds.has(t.id)) {
              return { ...t, status: "open" as const, sessionId }
            }
            if (oldIds.has(t.id) && !newIds.has(t.id)) {
              return { ...t, status: "free" as const, sessionId: null }
            }
            return t
          }),
        )

        return prevSessions.map((s) =>
          s.id === sessionId
            ? {
                ...s,
                tableIds: input.tableIds,
                waiterId: input.waiterId,
                guestCount: input.guestCount,
                note: input.note.trim(),
              }
            : s,
        )
      })
    },
    [],
  )

  const closeSession = useCallback((sessionId: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId))
    setTables((prev) =>
      prev.map((t) =>
        t.sessionId === sessionId
          ? { ...t, status: "free" as const, sessionId: null }
          : t,
      ),
    )
  }, [])

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
    tables,
    sessions,
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
    moveTable,
    moveDecor,
    openSession,
    updateSession,
    closeSession,
    freeTablesInSalon,
  }
}
