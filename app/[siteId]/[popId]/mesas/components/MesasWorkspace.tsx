"use client"

import { MesaAgendaPanel } from "@/app/[siteId]/[popId]/mesas/components/MesaAgendaPanel"
import { MesasCatalogPanel } from "@/app/[siteId]/[popId]/mesas/components/MesasCatalogPanel"
import { MesasCheckoutModals } from "@/app/[siteId]/[popId]/mesas/components/MesasCheckoutModals"
import { MesaSessionPanel } from "@/app/[siteId]/[popId]/mesas/components/MesaSessionPanel"
import { MesasFloorPlan } from "@/app/[siteId]/[popId]/mesas/components/MesasFloorPlan"
import { MesasTablePickerList } from "@/app/[siteId]/[popId]/mesas/components/MesasTablePickerList"
import {
  getMesasOrderConfirmState,
  MesasOrderPanel,
  runMesasOrderConfirm,
} from "@/app/[siteId]/[popId]/mesas/components/MesasOrderPanel"
import { MesasRightPanelTabs } from "@/app/[siteId]/[popId]/mesas/components/MesasRightPanelTabs"
import { MesasSalonTabs } from "@/app/[siteId]/[popId]/mesas/components/MesasSalonTabs"
import type { MesasLayoutData } from "@/app/[siteId]/[popId]/mesas/actions"
import type {
  MesaOpenSessionInput,
  MesaReservation,
  MesasRightPanelView,
} from "@/app/[siteId]/[popId]/mesas/mesasTypes"
import { useMesasSaleCheckout } from "@/app/[siteId]/[popId]/mesas/useMesasSaleCheckout"
import { useMesasState } from "@/app/[siteId]/[popId]/mesas/useMesasState"
import { OperationsModuleBackdrop } from "@/components/layouts-module/DataWorkspaceOperationsLayout"
import { LayoutsOperarMainGrid } from "@/components/layouts-module/LayoutsOperarMainGrid"
import {
  layoutsOperarCheckoutPillsFromToolbox,
} from "@/components/layouts-module/LayoutsOperarCheckoutSteps"
import { LayoutsOperarSaleCheckoutFloor } from "@/components/layouts-module/LayoutsOperarSaleCheckoutFloor"
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
import {
  RootsAlertDialogContent,
  RootsAlertDialogFooter,
  RootsAlertDialogPanel,
} from "@/components/rootsy-dialog/RootsAlertDialog"
import { AlertDialog } from "@/components/ui/alert-dialog"
import type { SaleOperationDiscountHeaderControl } from "@/components/sale-operation/SaleOperationDiscountHeaderButton"
import { SaleOperationToolbox } from "@/components/sale-operation/SaleOperationToolbox"
import {
  MesasFloorPlanSkeleton,
  MesasTablePickerListSkeleton,
} from "@/components/sale-operation/OperarChannelCanvasSkeletons"
import { useCartListScrollHighlight } from "@/hooks/useCartListScrollHighlight"
import { useCajasRealtime } from "@/hooks/useCajasRealtime"
import { useMesasRealtime } from "@/hooks/useMesasRealtime"
import { useOperateCatalogHydrate } from "@/hooks/useOperateCatalogHydrate"
import { useSaleOpenCashSessionToasts } from "@/hooks/useSaleOpenCashSessionToasts"
import { clientsAccessFromKeys } from "@/lib/popWorkspaceAccess"
import { useAuth } from "@/context/AuthContextSupabase"
import { usePopWorkspace } from "@/context/PopWorkspaceContext"
import { cn } from "@/lib/utils"
import {
  readMesasWorkspacePreference,
  reconcileMesasWorkspaceView,
  tableHasOpenSession,
  writeMesasWorkspacePreference,
} from "@/lib/mesasWorkspacePreference"
import { useMemo, useState, useEffect, useCallback, useRef } from "react"

type Props = {
  siteId: string
  popId: string
  catalogSidebarOpen: boolean
  onCatalogSidebarOpenChange?: (open: boolean) => void
  canUpdateLayout: boolean
  onRegisterReload?: (reload: () => Promise<void>) => void
  onRegisterLayoutData?: (getter: () => MesasLayoutData | null) => void
  onRegisterDiscountHeader?: (
    control: SaleOperationDiscountHeaderControl | null,
  ) => void
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
  onRegisterDiscountHeader,
}: Props) {
  useOperateCatalogHydrate(popId)
  const { user } = useAuth()
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
    waiters,
    waitersLoading,
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
    setSessionFloorStatus,
    saveReservation,
    removeReservation,
    markReservationNoShow,
    checkInReservation,
    freeTablesInSalon,
    removeSession,
  } = useMesasState(popId, siteId)
  useMesasRealtime(popId, selectedTable?.sessionId ?? null)
  useCajasRealtime(popId, user?.id)

  const mobileStage = useOperarMobileStage()
  const [rightView, setRightView] = useState<MesasRightPanelView>("session")
  const [workspaceReady, setWorkspaceReady] = useState(false)
  const pendingCatalogStageRef = useRef(false)
  const [agendaReservationId, setAgendaReservationId] = useState<string | null>(
    null,
  )
  const showCatalog = rightView === "cart"
  const hasTicketItems =
    (selectedSession?.checkout?.carrito.length ?? 0) > 0
  const cartScrollHighlight = useCartListScrollHighlight(selectedSession?.id ?? null)

  const remoteSession = useMemo(
    () =>
      selectedSession && sessionTicketReady
        ? {
            checkout: selectedSession.checkout,
            updatedAt: selectedSession.updatedAt,
          }
        : null,
    [
      selectedSession?.checkout,
      selectedSession?.id,
      selectedSession?.updatedAt,
      sessionTicketReady,
    ],
  )

  const handleSessionClose = useCallback(async () => {
    if (selectedSession?.id) removeSession(selectedSession.id)
  }, [removeSession, selectedSession?.id])

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
      remoteTicketPending: Boolean(selectedSession && !sessionTicketReady),
      catalogLoadEnabled: Boolean(selectedSession),
      toolboxLoadEnabled: Boolean(selectedSession) || hasTicketItems,
      onCartLineAdded: handleCartLineAdded,
    },
  )
  const [cannotChargeOpen, setCannotChargeOpen] = useState(false)
  const mesasOrderConfirm = getMesasOrderConfirmState(checkout)
  const mesasCheckoutPills = layoutsOperarCheckoutPillsFromToolbox({
    ...checkout.toolbox,
    discountLabel: checkout.discountHeader.title,
    discountConfigured: checkout.discountHeader.active,
    discountDisabled: checkout.discountHeader.disabled,
    onDiscountClick: checkout.discountHeader.onClick,
  })
  const mesasSavingsAmount =
    checkout.descuentoMonto +
    checkout.descuentoItemsMonto +
    checkout.promocionesAplicadasMonto

  useEffect(() => {
    onRegisterDiscountHeader?.(checkout.discountHeader)
    return () => onRegisterDiscountHeader?.(null)
  }, [checkout.discountHeader, onRegisterDiscountHeader])

  useSaleOpenCashSessionToasts(
    siteId,
    popId,
    Boolean(popId && siteId),
    !floorLoading,
  )

  useEffect(() => {
    setWorkspaceReady(false)
    pendingCatalogStageRef.current = false
  }, [popId])

  useEffect(() => {
    if (floorLoading || workspaceReady) return
    const saved = readMesasWorkspacePreference(popId)
    if (saved) {
      const reconciled = reconcileMesasWorkspaceView({
        rightView: saved.rightView,
        mobileStage: saved.mobileStage,
        tableExists: selectedTable != null,
        tableHasOpenSession: tableHasOpenSession(selectedTable),
      })
      setRightView(reconciled.rightView)
      if (reconciled.mobileStage === "catalog" && tableHasOpenSession(selectedTable)) {
        pendingCatalogStageRef.current = true
      } else if (reconciled.mobileStage) {
        mobileStage?.setStage(reconciled.mobileStage)
      }
    }
    setWorkspaceReady(true)
  }, [
    floorLoading,
    workspaceReady,
    popId,
    selectedTable,
    mobileStage,
  ])

  useEffect(() => {
    if (!workspaceReady || !pendingCatalogStageRef.current) return
    if (!selectedSession) return
    pendingCatalogStageRef.current = false
    mobileStage?.setStage("catalog")
  }, [workspaceReady, selectedSession, mobileStage])

  useEffect(() => {
    if (!workspaceReady) return
    if (rightView === "cart" && !selectedSession) {
      setRightView("session")
    }
    if (mobileStage?.stage === "catalog" && !selectedSession) {
      mobileStage.setStage("ticket")
    }
  }, [workspaceReady, rightView, selectedSession, mobileStage])

  useEffect(() => {
    if (!workspaceReady) return
    writeMesasWorkspacePreference(popId, {
      tableId: selectedTableId,
      salonId: activeSalonId || null,
      rightView,
      ...(mobileStage?.stage ? { mobileStage: mobileStage.stage } : {}),
    })
  }, [
    workspaceReady,
    popId,
    selectedTableId,
    activeSalonId,
    rightView,
    mobileStage?.stage,
  ])

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
      let ok: boolean
      if (selectedReservation && selectedTable?.status === "reserved") {
        checkout.applyClientFromReservation(selectedReservation)
        ok = await checkInReservation(selectedReservation, input)
      } else {
        ok = await openSession(input)
      }
      if (ok) setRightView("cart")
      return ok
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

      <LayoutsOperarMainGrid
        mobileHomeLabel="Mesas"
        mobileHome={mobileFloorCanvas}
        mobileCatalog={catalogPanel}
        mobileCatalogDisabled={!selectedSession}
        catalog={!showCatalog ? floorCanvas : catalogPanel}
        floor={
          <>
            <SaleOperationToolbox registerOnly {...checkout.toolbox} />
            <LayoutsOperarSaleCheckoutFloor
              proposal="pills"
              proposalSteps={mesasCheckoutPills.steps}
              proposalOptions={mesasCheckoutPills.options}
              savingsAmount={mesasSavingsAmount}
              closingTotal={checkout.total}
              actions={{
                ...checkout.actions,
                confirmLabel: mesasOrderConfirm.confirmLabel,
                confirmDisabled: mesasOrderConfirm.confirmDisabled,
                confirmTitle: mesasOrderConfirm.confirmTitle,
                onConfirm: () =>
                  runMesasOrderConfirm(checkout, () => setCannotChargeOpen(true)),
              }}
            />
          </>
        }
        desktopFloor={showCatalog}
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
                  waitersLoading={waitersLoading}
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
                  waitersLoading={waitersLoading}
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

      <AlertDialog open={cannotChargeOpen} onOpenChange={setCannotChargeOpen}>
        <RootsAlertDialogContent>
          <RootsAlertDialogPanel
            title="No se puede cobrar"
            description="Este pedido ya está cobrado. No queda saldo por cobrar."
          />
          <RootsAlertDialogFooter
            hideCancel
            confirmLabel="Entendido"
            onConfirm={() => setCannotChargeOpen(false)}
          />
        </RootsAlertDialogContent>
      </AlertDialog>
    </div>
  )
}
