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
import { OperationsModuleBackdrop } from "@/components/layouts-module/DataWorkspaceOperationsLayout"
import { LayoutsOperarMainGrid } from "@/components/layouts-module/LayoutsOperarMainGrid"
import {
  layoutsOperarCatalogColumnClass,
  layoutsOperarSummaryPanelClass,
  layoutsOperarSummaryPanelInnerGridClass,
} from "@/app/[siteId]/[popId]/library/layouts/layoutsOperarStyles"
import { OpenCashSessionBanner } from "@/components/sale-operation/OpenCashSessionBanner"
import { SaleOperationToolbox } from "@/components/sale-operation/SaleOperationToolbox"
import { useCartListScrollHighlight } from "@/hooks/useCartListScrollHighlight"
import { useMemo, useState, useEffect, useCallback } from "react"
import { cn } from "@/lib/utils"

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
    realtimeStatus,
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

  const [rightView, setRightView] = useState<MesasRightPanelView>("session")
  const [waiters, setWaiters] = useState<MesaWaiter[]>([])
  const showCatalog = rightView === "cart"
  const cartScrollHighlight = useCartListScrollHighlight()

  const remoteSession = useMemo(
    () =>
      selectedSession
        ? {
            checkout: selectedSession.checkout,
            updatedAt: selectedSession.updatedAt,
          }
        : null,
    [
      selectedSession?.checkout,
      selectedSession?.id,
      selectedSession?.updatedAt,
    ],
  )

  const handleSessionClose = useCallback(async () => {
    await reloadSessions()
  }, [reloadSessions])

  const handleCartLineAdded = useCallback(
    (lineId: string) => {
      cartScrollHighlight.notifyLineAdded(lineId)
      setRightView("cart")
    },
    [cartScrollHighlight],
  )

  const checkout = useMesasSaleCheckout(
    popId,
    siteId,
    selectedSession?.id ?? null,
    remoteSession,
    {
      onSessionClose: handleSessionClose,
      catalogSidebarOpen: catalogSidebarOpen || showCatalog,
      onCartLineAdded: handleCartLineAdded,
    },
  )

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
    <div className="relative flex h-full min-h-0 w-full flex-col overflow-hidden">
      <OperationsModuleBackdrop />

      {checkout.catalogLoadAttempted &&
      !checkout.catalogLoading &&
      !checkout.openCashSession ? (
        <OpenCashSessionBanner siteId={siteId} popId={popId} variant="dark" />
      ) : null}

      {realtimeStatus === "disconnected" ? (
        <div className="relative z-20 border-b border-amber-500/35 bg-amber-950/50 px-4 py-2 text-sm text-amber-100">
          Conexión en vivo interrumpida. Reconectando… los cambios pueden demorar
          unos segundos.
        </div>
      ) : null}

      <LayoutsOperarMainGrid
        catalog={
          !showCatalog ? (
            <section className={cn(layoutsOperarCatalogColumnClass, "flex-col")}>
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
            </section>
          ) : (
            <MesasCatalogPanel
              siteId={siteId}
              popId={popId}
              checkout={checkout}
              catalogSidebarOpen={catalogSidebarOpen}
            />
          )
        }
        toolbox={<SaleOperationToolbox {...checkout.toolbox} />}
        ticket={
          <aside
            className={cn(
              layoutsOperarSummaryPanelClass,
              "[grid-template-rows:auto_minmax(0,1fr)]",
            )}
            aria-label="Panel de mesa y pedido"
          >
            <MesasRightPanelTabs
              value={rightView}
              onChange={setRightView}
              pedidoDisabled={!selectedSession}
            />

            <div className={layoutsOperarSummaryPanelInnerGridClass}>
              {rightView === "session" ? (
                <MesaSessionPanel
                  table={selectedTable}
                  session={selectedSession}
                  sessionTables={sessionTables}
                  waiters={waiters}
                  mergeCandidates={mergeCandidates}
                  sessionError={sessionError ?? checkout.submitError}
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
                  {checkout.submitError ? (
                    <div className="shrink-0 px-3 pt-3 sm:px-3.5">
                      <p className="rounded-xl border border-destructive/25 bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive">
                        {checkout.submitError}
                      </p>
                    </div>
                  ) : null}
                  <MesasOrderPanel
                    checkout={checkout}
                    tableLabel={mesaLabel}
                    cartScrollHighlight={cartScrollHighlight}
                  />
                </div>
              )}
            </div>
          </aside>
        }
      />

      <MesasCheckoutModals checkout={checkout} />
    </div>
  )
}
