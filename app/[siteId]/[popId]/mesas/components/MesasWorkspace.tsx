"use client"

import { MesasCatalogPanel } from "@/app/[siteId]/[popId]/mesas/components/MesasCatalogPanel"
import { MesasCheckoutModals } from "@/app/[siteId]/[popId]/mesas/components/MesasCheckoutModals"
import { MesaSessionPanel } from "@/app/[siteId]/[popId]/mesas/components/MesaSessionPanel"
import { MesasFloorPlan } from "@/app/[siteId]/[popId]/mesas/components/MesasFloorPlan"
import { MesasOrderPanel } from "@/app/[siteId]/[popId]/mesas/components/MesasOrderPanel"
import { MesasRightPanelTabs } from "@/app/[siteId]/[popId]/mesas/components/MesasRightPanelTabs"
import { MesasSalonTabs } from "@/app/[siteId]/[popId]/mesas/components/MesasSalonTabs"
import {
  getMesasWaiters,
  type MesasLayoutData,
} from "@/app/[siteId]/[popId]/mesas/actions"
import type {
  MesaWaiter,
  MesasRightPanelView,
} from "@/app/[siteId]/[popId]/mesas/mesasTypes"
import { useMesasSaleCheckout } from "@/app/[siteId]/[popId]/mesas/useMesasSaleCheckout"
import { useMesasState } from "@/app/[siteId]/[popId]/mesas/useMesasState"
import { OpenCashSessionBanner } from "@/components/sale-operation/OpenCashSessionBanner"
import { SaleOperationToolbox } from "@/components/sale-operation/SaleOperationToolbox"
import { useMemo, useState, useEffect, useCallback } from "react"

type Props = {
  siteId: string
  popId: string
  catalogSidebarOpen: boolean
  canUpdateLayout: boolean
  onRegisterReload?: (reload: () => Promise<void>) => void
  onRegisterLayoutData?: (getter: () => MesasLayoutData | null) => void
}

function sessionTitle(
  tableLabel: string | null,
  labels: string[],
): string | null {
  if (labels.length > 1) return labels.join(" + ")
  return tableLabel
}

export function MesasWorkspace({
  siteId,
  popId,
  catalogSidebarOpen,
  canUpdateLayout,
  onRegisterReload,
  onRegisterLayoutData,
}: Props) {
  const {
    salons,
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
    layoutSelection,
    selectLayoutItem,
    rotateLayoutItem,
    layoutLoading,
    layoutError,
    sessionError,
    layoutData,
    reloadLayout,
    moveTable,
    moveDecor,
    persistLayoutItem,
    openSession,
    updateSession,
    reloadSessions,
    freeTablesInSalon,
  } = useMesasState(popId, siteId)

  const checkout = useMesasSaleCheckout(
    popId,
    siteId,
    selectedSession?.id ?? null,
    selectedSession
      ? {
          checkout: selectedSession.checkout,
          updatedAt: selectedSession.updatedAt,
        }
      : null,
    { onSessionClose: () => void reloadSessions() },
  )

  const [rightView, setRightView] = useState<MesasRightPanelView>("session")
  const [waiters, setWaiters] = useState<MesaWaiter[]>([])
  const showCatalog = rightView === "cart"

  useEffect(() => {
    if (!popId || !siteId) return
    void (async () => {
      const res = await getMesasWaiters(popId, siteId)
      if (res.success) {
        setWaiters(res.waiters)
      } else {
        setWaiters([])
      }
    })()
  }, [popId, siteId])

  useEffect(() => {
    if (!selectedSession) {
      setRightView("session")
    }
  }, [selectedSession])

  useEffect(() => {
    if (!canUpdateLayout && layoutEditMode) {
      setLayoutEditMode(false)
    }
  }, [canUpdateLayout, layoutEditMode, setLayoutEditMode])

  useEffect(() => {
    onRegisterReload?.(reloadLayout)
  }, [onRegisterReload, reloadLayout])

  useEffect(() => {
    onRegisterLayoutData?.(() => layoutData)
  }, [layoutData, onRegisterLayoutData])

  const tableCounts = useMemo(() => {
    const out: Record<string, { total: number; open: number }> = {}
    for (const salon of salons) {
      const inSalon = tables.filter((t) => t.salonId === salon.id)
      out[salon.id] = {
        total: inSalon.length,
        open: inSalon.filter((t) => t.status === "open" || t.status === "paying")
          .length,
      }
    }
    return out
  }, [salons, tables])

  const tableOpenedAt = useMemo(() => {
    const openedAtBySession = Object.fromEntries(
      sessions.map((s) => [s.id, s.openedAt]),
    )
    const out: Record<string, string> = {}
    for (const table of tables) {
      if (
        (table.status === "open" || table.status === "paying") &&
        table.sessionId &&
        openedAtBySession[table.sessionId]
      ) {
        out[table.id] = openedAtBySession[table.sessionId]
      }
    }
    return out
  }, [tables, sessions])

  const sessionTables = useMemo(() => {
    if (!selectedSession) return selectedTable ? [selectedTable] : []
    return tables.filter((t) => selectedSession.tableIds.includes(t.id))
  }, [tables, selectedSession, selectedTable])

  const mergeCandidates = useMemo(() => {
    if (!selectedTable) return []
    const free = freeTablesInSalon(selectedTable.salonId, [selectedTable.id])
    if (!selectedSession) return free
    const sessionOthers = tables.filter(
      (t) =>
        selectedSession.tableIds.includes(t.id) && t.id !== selectedTable.id,
    )
    const seen = new Set(sessionOthers.map((t) => t.id))
    return [...sessionOthers, ...free.filter((t) => !seen.has(t.id))]
  }, [selectedTable, selectedSession, tables, freeTablesInSalon])

  const mesaLabel = sessionTitle(
    selectedTable?.label ?? null,
    sessionTables.map((t) => t.label),
  )

  const handleSelectTable = (tableId: string) => {
    if (!tableId) return
    selectTable(tableId)
    setRightView("session")
  }

  const handleMoveTable = useCallback(
    (tableId: string, dx: number, dy: number) => {
      const pos = moveTable(tableId, dx, dy)
      if (layoutEditMode && canUpdateLayout && pos) {
        selectLayoutItem("table", tableId)
        void persistLayoutItem("table", tableId, pos)
      }
    },
    [
      moveTable,
      layoutEditMode,
      canUpdateLayout,
      selectLayoutItem,
      persistLayoutItem,
    ],
  )

  const handleMoveDecor = useCallback(
    (decorId: string, dx: number, dy: number) => {
      const pos = moveDecor(decorId, dx, dy)
      if (layoutEditMode && canUpdateLayout && pos) {
        selectLayoutItem("decor", decorId)
        void persistLayoutItem("decor", decorId, pos)
      }
    },
    [
      moveDecor,
      layoutEditMode,
      canUpdateLayout,
      selectLayoutItem,
      persistLayoutItem,
    ],
  )

  return (
    <div className="dark relative flex h-full min-h-0 w-full flex-col overflow-hidden bg-[#070a09] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(52,211,153,0.14),transparent_40%),radial-gradient(circle_at_80%_10%,rgba(99,102,241,0.1),transparent_36%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size-[38px_38px] opacity-20" />
      </div>

      {!checkout.catalogLoading && !checkout.openCashSession ? (
        <OpenCashSessionBanner siteId={siteId} popId={popId} variant="dark" />
      ) : null}

      <main className="relative z-10 grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_380px] grid-rows-[minmax(0,1fr)_calc(4.5rem+1rem)] sm:grid-rows-[minmax(0,1fr)_calc(4.75rem+1.25rem)]">
        <section className="col-start-1 row-start-1 flex min-h-0 min-w-0 flex-col overflow-hidden bg-[#20262e]">
          {!showCatalog ? (
            <>
              <MesasSalonTabs
                salons={salons}
                activeSalonId={activeSalonId}
                onChange={setActiveSalonId}
                tableCounts={tableCounts}
              />
              {layoutError ? (
                <div className="border-b border-red-500/30 bg-red-950/40 px-4 py-2 text-sm text-red-200">
                  {layoutError}
                </div>
              ) : null}
              {layoutLoading ? (
                <div className="flex flex-1 items-center justify-center text-sm text-white/60">
                  Cargando plano…
                </div>
              ) : salons.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center text-sm text-white/65">
                  <p>Todavía no hay salones configurados.</p>
                  {canUpdateLayout ? (
                    <p className="text-white/45">
                      Usá el botón <strong className="text-white/70">Salones</strong>{" "}
                      arriba a la derecha para empezar.
                    </p>
                  ) : null}
                </div>
              ) : (
                <MesasFloorPlan
                  tables={salonTables}
                  decors={salonDecors}
                  selectedTableIds={selectedTableIds}
                  layoutEditMode={layoutEditMode}
                  layoutSelection={layoutSelection}
                  canEditLayout={canUpdateLayout}
                  onToggleLayoutEdit={() => setLayoutEditMode((v) => !v)}
                  onSelectTable={handleSelectTable}
                  onSelectLayoutItem={selectLayoutItem}
                  onRotateLayoutItem={rotateLayoutItem}
                  onMoveTable={handleMoveTable}
                  onMoveDecor={handleMoveDecor}
                  tableOpenedAt={tableOpenedAt}
                />
              )}
            </>
          ) : (
            <MesasCatalogPanel
              siteId={siteId}
              popId={popId}
              checkout={checkout}
              catalogSidebarOpen={catalogSidebarOpen}
            />
          )}
        </section>

        <div className="col-start-1 row-start-2 min-h-0">
          <SaleOperationToolbox {...checkout.toolbox} />
        </div>

        <aside
          className="rootsy-app-light col-start-2 row-span-2 grid min-h-0 overflow-hidden grid-rows-[auto_minmax(0,1fr)] bg-[#eef1f5] text-[#121417]"
          aria-label="Panel de mesa y pedido"
        >
          <MesasRightPanelTabs
            value={rightView}
            onChange={setRightView}
            pedidoDisabled={!selectedSession}
          />

          {rightView === "session" ? (
            <MesaSessionPanel
              table={selectedTable}
              session={selectedSession}
              sessionTables={sessionTables}
              waiters={waiters}
              mergeCandidates={mergeCandidates}
              sessionError={sessionError}
              onOpenSession={openSession}
              onUpdateSession={updateSession}
              onCloseSession={() => checkout.cerrarMesa()}
              canCloseSession={checkout.puedeCerrarMesa}
              closeSessionBlockReason={checkout.cerrarMesaBlockReason}
              closeSessionMode={checkout.cerrarMesaMode}
              closeSessionLoading={checkout.submitting}
              clientLabel={checkout.sessionClientLabel}
            />
          ) : (
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <MesasOrderPanel checkout={checkout} tableLabel={mesaLabel} />
            </div>
          )}
        </aside>
      </main>

      <MesasCheckoutModals checkout={checkout} />
    </div>
  )
}
