"use client"

import { MesaAgendaPanel } from "@/app/[siteId]/[popId]/mesas/components/MesaAgendaPanel"
import { MesasCatalogPanel } from "@/app/[siteId]/[popId]/mesas/components/MesasCatalogPanel"
import { MesasCheckoutModals } from "@/app/[siteId]/[popId]/mesas/components/MesasCheckoutModals"
import { MesaSessionPanel } from "@/app/[siteId]/[popId]/mesas/components/MesaSessionPanel"
import { MesasFloorPlan } from "@/app/[siteId]/[popId]/mesas/components/MesasFloorPlan"
import { MesasTablePickerList } from "@/app/[siteId]/[popId]/mesas/components/MesasTablePickerList"
import { MesasOrderPanel } from "@/app/[siteId]/[popId]/mesas/components/MesasOrderPanel"
import { MesasRightPanelTabs } from "@/app/[siteId]/[popId]/mesas/components/MesasRightPanelTabs"
import { MesasSalonTabs } from "@/app/[siteId]/[popId]/mesas/components/MesasSalonTabs"
import {
  getMesasWaiters,
  type MesasLayoutData,
} from "@/app/[siteId]/[popId]/mesas/actions"
import type {
  MesaOpenSessionInput,
  MesaReservation,
  MesaWaiter,
  MesasRightPanelView,
} from "@/app/[siteId]/[popId]/mesas/mesasTypes"
import { useMesasSaleCheckout } from "@/app/[siteId]/[popId]/mesas/useMesasSaleCheckout"
import { useMesasState } from "@/app/[siteId]/[popId]/mesas/useMesasState"
import { OperationsModuleBackdrop } from "@/components/layouts-module/DataWorkspaceOperationsLayout"
import { LayoutsOperarMainGrid } from "@/components/layouts-module/LayoutsOperarMainGrid"
import { useOperarMobileStage } from "@/components/layouts-module/OperarMobileStage"
import {
  layoutsOperarCatalogColumnClass,
  layoutsOperarCatalogCanvasClass,
  layoutsOperarSummaryPanelTabsClass,
  layoutsOperarSummaryPanelInnerGridClass,
  layoutsOperarSummaryPanelTabBodyClass,
} from "@/app/library/layouts/layoutsOperarStyles"
import {
  mesasFloorEmptyHintClass,
  mesasFloorEmptyStrongClass,
  mesasFloorEmptyTextClass,
  mesasLayoutErrorBannerClass,
} from "@/app/[siteId]/[popId]/mesas/mesasOperarStyles"
import { OpenCashSessionBanner } from "@/components/sale-operation/OpenCashSessionBanner"
import {
  MesasFloorPlanSkeleton,
  MesasTablePickerListSkeleton,
} from "@/components/sale-operation/OperarChannelCanvasSkeletons"
import { SaleOperationToolbox } from "@/components/sale-operation/SaleOperationToolbox"
import { SaleOperationToolboxSkeleton } from "@/components/sale-operation/SaleOperationToolboxSkeleton"
import { useCartListScrollHighlight } from "@/hooks/useCartListScrollHighlight"
import { clientsAccessFromKeys } from "@/lib/popWorkspaceAccess"
import { usePopWorkspace } from "@/context/PopWorkspaceContext"
import { cn } from "@/lib/utils"
import { useMemo, useState, useEffect, useCallback } from "react"

type Props = {
  siteId: string
  popId: string
  catalogSidebarOpen: boolean
  onCatalogSidebarOpenChange?: (open: boolean) => void
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
  onCatalogSidebarOpenChange,
  canUpdateLayout,
  onRegisterReload,
  onRegisterLayoutData,
}: Props) {
  const { bootstrap } = usePopWorkspace()
  const clientsAccess = useMemo(
    () => clientsAccessFromKeys(bootstrap?.permissionKeys ?? []),
    [bootstrap?.permissionKeys],
  )
  const canReadClients = clientsAccess.canRead
  const canCreateClient = clientsAccess.canCreate

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
    selectedReservation,
    selectedTableReservationWarning,
    reservationSettings,
    saveReservationSettings,
    reservations,
    todayAgenda,
    salonTables,
    salonDecors,
    layoutEditMode,
    setLayoutEditMode,
    layoutSelection,
    selectLayoutItem,
    rotateLayoutItem,
    floorLoading,
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
    reloadReservations,
    setSessionFloorStatus,
    saveReservation,
    removeReservation,
    markReservationNoShow,
    checkInReservation,
    freeTablesInSalon,
    removeSession,
  } = useMesasState(popId, siteId)

  const mobileStage = useOperarMobileStage()
  const [rightView, setRightView] = useState<MesasRightPanelView>("session")
  const [agendaReservationId, setAgendaReservationId] = useState<string | null>(
    null,
  )
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
    if (selectedSession?.id) removeSession(selectedSession.id)
    void Promise.all([reloadSessions(), reloadReservations()])
  }, [reloadSessions, reloadReservations, removeSession, selectedSession?.id])

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
      catalogLoadEnabled:
        showCatalog || mobileStage?.stage === "catalog",
      toolboxLoadEnabled:
        showCatalog ||
        (mobileStage?.stage === "ticket" && selectedSession != null),
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
      return
    }
    setRightView("cart")
  }, [selectedSession?.id])

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
    const out: Record<
      string,
      { free: number; open: number; paying: number; reserved: number }
    > = {}
    for (const salon of salons) {
      const inSalon = tables.filter((t) => t.salonId === salon.id)
      out[salon.id] = {
        free: inSalon.filter((t) => t.status === "free").length,
        open: inSalon.filter((t) => t.status === "open").length,
        paying: inSalon.filter((t) => t.status === "paying").length,
        reserved: inSalon.filter((t) => t.status === "reserved").length,
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

  const tableReservationArrivalAt = useMemo(() => {
    const arrivalByReservation = Object.fromEntries(
      reservations.map((reservation) => [reservation.id, reservation.arrivalAt]),
    )
    const out: Record<string, string> = {}
    for (const table of tables) {
      if (
        table.status === "reserved" &&
        table.reservationId &&
        arrivalByReservation[table.reservationId]
      ) {
        out[table.id] = arrivalByReservation[table.reservationId]
      }
    }
    return out
  }, [tables, reservations])

  const sessionTables = useMemo(() => {
    if (!selectedSession) return selectedTable ? [selectedTable] : []
    return tables.filter((t) => selectedSession.tableIds.includes(t.id))
  }, [tables, selectedSession, selectedTable])

  const mergeCandidates = useMemo(() => {
    if (!selectedTable) return []
    const free = freeTablesInSalon(selectedTable.salonId, [selectedTable.id])
    const reservedOthers =
      selectedReservation && selectedTable.status === "reserved"
        ? tables.filter(
            (t) =>
              selectedReservation.tableIds.includes(t.id) &&
              t.id !== selectedTable.id &&
              t.status !== "open" &&
              t.status !== "paying",
          )
        : []
    if (!selectedSession && reservedOthers.length === 0) return free
    const sessionOthers = selectedSession
      ? tables.filter(
          (t) =>
            selectedSession.tableIds.includes(t.id) && t.id !== selectedTable.id,
        )
      : reservedOthers
    const seen = new Set(sessionOthers.map((t) => t.id))
    return [...sessionOthers, ...free.filter((t) => !seen.has(t.id))]
  }, [
    selectedTable,
    selectedSession,
    selectedReservation,
    tables,
    freeTablesInSalon,
  ])

  const mesaLabel = sessionTitle(
    selectedTable?.label ?? null,
    sessionTables.map((t) => t.label),
  )

  const handleSelectAgendaReservation = useCallback((reservation: MesaReservation) => {
    const tableId = reservation.tableIds[0] ?? reservation.tableId
    if (tableId) {
      selectTable(tableId)
    }
  }, [selectTable])

  const handleOpenSession = useCallback(
    async (input: MesaOpenSessionInput) => {
      if (selectedReservation && selectedTable?.status === "reserved") {
        checkout.applyClientFromReservation(selectedReservation)
        return checkInReservation(selectedReservation, input)
      }
      return openSession(input)
    },
    [
      selectedReservation,
      selectedTable?.status,
      checkout,
      checkInReservation,
      openSession,
    ],
  )

  const handleSelectTable = (tableId: string) => {
    if (!tableId || floorLoading) return
    selectTable(tableId)
    const table = tables.find((t) => t.id === tableId)
    const isOpen =
      table != null &&
      table.sessionId != null &&
      (table.status === "open" || table.status === "paying")
    setRightView(isOpen ? "cart" : "session")
    mobileStage?.setStage("ticket")
  }

  useEffect(() => {
    if (mobileStage?.stage === "catalog") {
      setRightView("cart")
    }
  }, [mobileStage?.stage])

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

  const floorCanvas = (
    <section className={cn(layoutsOperarCatalogColumnClass, "flex-col")}>
      <div className={layoutsOperarCatalogCanvasClass}>
        <MesasSalonTabs
          salons={salons}
          activeSalonId={activeSalonId}
          onChange={setActiveSalonId}
          tableCounts={tableCounts}
          loading={floorLoading}
        />
        <div className="row-start-2 flex h-full min-h-0 flex-col overflow-hidden">
          {layoutError ? (
            <div className={mesasLayoutErrorBannerClass}>{layoutError}</div>
          ) : null}
          {floorLoading ? (
            <MesasFloorPlanSkeleton />
          ) : salons.length === 0 ? (
            <div className={cn("flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center text-sm", mesasFloorEmptyTextClass)}>
              <p>Todavía no hay salones configurados.</p>
              {canUpdateLayout ? (
                <p className={mesasFloorEmptyHintClass}>
                  Usá el botón <strong className={mesasFloorEmptyStrongClass}>Salones</strong>{" "}
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
              tableReservationArrivalAt={tableReservationArrivalAt}
              reservationSettings={reservationSettings}
            />
          )}
        </div>
      </div>
    </section>
  )

  const mobileFloorCanvas = (
    <section className={cn(layoutsOperarCatalogColumnClass, "flex-col")}>
      <div
        className={cn(
          layoutsOperarCatalogCanvasClass,
          "[grid-template-rows:minmax(0,1fr)]",
        )}
      >
        <div className="flex h-full min-h-0 flex-col overflow-hidden">
          {layoutError ? (
            <div className={mesasLayoutErrorBannerClass}>{layoutError}</div>
          ) : null}
          {floorLoading ? (
            <MesasTablePickerListSkeleton />
          ) : salons.length === 0 ? (
            <div className={cn("flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center text-sm", mesasFloorEmptyTextClass)}>
              <p>Todavía no hay salones configurados.</p>
              {canUpdateLayout ? (
                <p className={mesasFloorEmptyHintClass}>
                  Usá el botón <strong className={mesasFloorEmptyStrongClass}>Salones</strong>{" "}
                  arriba a la derecha para empezar.
                </p>
              ) : null}
            </div>
          ) : (
            <MesasTablePickerList
              heading="Mesas"
              tables={tables}
              salons={salons}
              selectedTableId={selectedTableId}
              onSelect={handleSelectTable}
            />
          )}
        </div>
      </div>
    </section>
  )

  const catalogPanel = (
    <MesasCatalogPanel
      siteId={siteId}
      popId={popId}
      checkout={checkout}
      catalogSidebarOpen={catalogSidebarOpen}
      onCatalogSidebarOpenChange={onCatalogSidebarOpenChange}
    />
  )

  return (
    <div className="relative flex h-full min-h-0 w-full flex-col overflow-hidden">
      <OperationsModuleBackdrop />

      {checkout.catalogLoadAttempted &&
      !checkout.catalogLoading &&
      !checkout.openCashSession ? (
        <OpenCashSessionBanner siteId={siteId} popId={popId} variant="dark" />
      ) : null}

      <LayoutsOperarMainGrid
        mobileHomeLabel="Mesas"
        mobileHome={mobileFloorCanvas}
        mobileCatalog={catalogPanel}
        mobileCatalogDisabled={!selectedSession}
        catalog={!showCatalog ? floorCanvas : catalogPanel}
        toolbox={
          checkout.toolboxLoading ? (
            <SaleOperationToolboxSkeleton />
          ) : (
            <SaleOperationToolbox {...checkout.toolbox} />
          )
        }
        desktopToolbox={showCatalog}
        ticket={
          <aside
            className={layoutsOperarSummaryPanelTabsClass}
            aria-label="Panel de mesa y pedido"
          >
            <MesasRightPanelTabs
              value={rightView}
              onChange={(view) => {
                if (view !== "agenda") setAgendaReservationId(null)
                setRightView(view)
              }}
              pedidoDisabled={!selectedSession}
              tableLabel={mesaLabel}
            />

            {rightView === "session" ? (
              <div className={layoutsOperarSummaryPanelTabBodyClass}>
                <MesaSessionPanel
                  table={selectedTable}
                  session={selectedSession}
                  floorReservation={
                    selectedTable?.status === "reserved" ? selectedReservation : null
                  }
                  reservationWarning={selectedTableReservationWarning}
                  sessionTables={sessionTables}
                  tables={tables}
                  waiters={waiters}
                  mergeCandidates={mergeCandidates}
                  sessionError={sessionError}
                  onOpenSession={handleOpenSession}
                  onUpdateSession={updateSession}
                  onCloseSession={() => checkout.cerrarMesa()}
                  onSetFloorStatus={(floorStatus) =>
                    selectedSession
                      ? setSessionFloorStatus(selectedSession.id, floorStatus)
                      : Promise.resolve(false)
                  }
                  canCloseSession={checkout.puedeCerrarMesa}
                  closeSessionBlockReason={checkout.cerrarMesaBlockReason}
                  closeSessionMode={checkout.cerrarMesaMode}
                  closeSessionLoading={checkout.submitting}
                  closeSessionError={checkout.submitError}
                  clientLabel={checkout.sessionClientLabel}
                  onOpenReservationDetail={(reservation) => {
                    setAgendaReservationId(reservation.id)
                    setRightView("agenda")
                  }}
                />
              </div>
            ) : rightView === "agenda" ? (
              <div className={layoutsOperarSummaryPanelTabBodyClass}>
                <MesaAgendaPanel
                  agenda={todayAgenda}
                  reservations={reservations}
                  tables={tables}
                  popId={popId}
                  canReadClients={canReadClients}
                  canCreateClient={canCreateClient}
                  reservationSettings={reservationSettings}
                  onSaveReservationSettings={saveReservationSettings}
                  waiters={waiters}
                  sessionError={sessionError}
                  onSaveReservation={saveReservation}
                  onCancelReservation={removeReservation}
                  onMarkReservationNoShow={markReservationNoShow}
                  onCheckInReservation={async (reservation, input) => {
                    checkout.applyClientFromReservation(reservation)
                    return checkInReservation(reservation, input)
                  }}
                  onSelectReservation={handleSelectAgendaReservation}
                  openReservationId={agendaReservationId}
                />
              </div>
            ) : (
              <div
                className={cn(
                  layoutsOperarSummaryPanelTabBodyClass,
                  layoutsOperarSummaryPanelInnerGridClass,
                  "max-md:[grid-template-rows:minmax(0,1fr)]",
                )}
              >
                <MesasOrderPanel
                  checkout={checkout}
                  tableLabel={mesaLabel}
                  cartScrollHighlight={cartScrollHighlight}
                />
              </div>
            )}
          </aside>
        }
      />

      <MesasCheckoutModals checkout={checkout} />
    </div>
  )
}
