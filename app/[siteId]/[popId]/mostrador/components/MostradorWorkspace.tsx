"use client"

import { CounterOrderPanel } from "@/app/[siteId]/[popId]/mostrador/components/CounterOrderPanel"
import { MesasCheckoutModals } from "@/app/[siteId]/[popId]/mesas/components/MesasCheckoutModals"
import { MostradorBoard } from "@/app/[siteId]/[popId]/mostrador/components/MostradorBoard"
import { MostradorCatalogPanel } from "@/app/[siteId]/[popId]/mostrador/components/MostradorCatalogPanel"
import { MostradorOrderPanel } from "@/app/[siteId]/[popId]/mostrador/components/MostradorOrderPanel"
import { MostradorRightPanelTabs } from "@/app/[siteId]/[popId]/mostrador/components/MostradorRightPanelTabs"
import type { MostradorRightPanelView } from "@/app/[siteId]/[popId]/mostrador/mostradorTypes"
import { useMostradorSaleCheckout } from "@/app/[siteId]/[popId]/mostrador/useMostradorSaleCheckout"
import { useMostradorState } from "@/app/[siteId]/[popId]/mostrador/useMostradorState"
import { OperationsModuleBackdrop } from "@/components/layouts-module/DataWorkspaceOperationsLayout"
import { LayoutsOperarMainGrid } from "@/components/layouts-module/LayoutsOperarMainGrid"
import { useOperarMobileStage } from "@/components/layouts-module/OperarMobileStage"
import { OperarMobileToolboxIcons } from "@/components/layouts-module/OperarMobileToolbox"
import {
  layoutsOperarCatalogColumnClass,
  layoutsOperarCatalogCanvasClass,
  layoutsOperarSummaryPanelTabsClass,
  layoutsOperarSummaryPanelInnerGridClass,
  layoutsOperarSummaryPanelTabBodyClass,
} from "@/app/library/layouts/layoutsOperarStyles"
import { SaleOperationToolbox } from "@/components/sale-operation/SaleOperationToolbox"
import { SaleOperationToolboxSkeleton } from "@/components/sale-operation/SaleOperationToolboxSkeleton"
import { useCartListScrollHighlight } from "@/hooks/useCartListScrollHighlight"
import { useCajasRealtime } from "@/hooks/useCajasRealtime"
import { useMostradorRealtime } from "@/hooks/useMostradorRealtime"
import { useOperateCatalogHydrate } from "@/hooks/useOperateCatalogHydrate"
import { useSaleOpenCashSessionToasts } from "@/hooks/useSaleOpenCashSessionToasts"
import {
  readMostradorWorkspacePreference,
  reconcileMostradorWorkspaceView,
  writeMostradorWorkspacePreference,
} from "@/lib/mostradorWorkspacePreference"
import { useAuth } from "@/context/AuthContextSupabase"
import { cn } from "@/lib/utils"
import { useEffect, useState, useCallback, useRef } from "react"

type Props = {
  siteId: string
  popId: string
  catalogSidebarOpen: boolean
  onCatalogSidebarOpenChange?: (open: boolean) => void
  onRegisterStartCreateOrder?: (handler: (() => void) | null) => void
}

export function MostradorWorkspace({
  siteId,
  popId,
  catalogSidebarOpen,
  onCatalogSidebarOpenChange,
  onRegisterStartCreateOrder,
}: Props) {
  useOperateCatalogHydrate(popId)
  const { user } = useAuth()
  const {
    orders,
    loading,
    orderError,
    selectedOrderId,
    selectedOrder,
    orderTicketReady,
    selectOrder,
    createOrder,
    patchOrder,
    moveOrderStatus,
    cancelOrder,
    removeOrder,
  } = useMostradorState(popId, siteId)
  useMostradorRealtime(popId, selectedOrderId)
  useCajasRealtime(popId, user?.id)

  const mobileStage = useOperarMobileStage()
  const [rightView, setRightView] = useState<MostradorRightPanelView>("detail")
  const [workspaceReady, setWorkspaceReady] = useState(false)
  const pendingCatalogStageRef = useRef(false)
  const [creating, setCreating] = useState(false)
  const showCatalog = rightView === "cart"
  const cartScrollHighlight = useCartListScrollHighlight(selectedOrderId)

  const handleCartLineAdded = useCallback(
    (lineId: string) => {
      cartScrollHighlight.notifyLineAdded(lineId)
      setRightView("cart")
    },
    [cartScrollHighlight],
  )

  const checkout = useMostradorSaleCheckout(
    popId,
    siteId,
    selectedOrderId,
    selectedOrder && orderTicketReady
      ? {
          checkout: selectedOrder.checkout,
          updatedAt: selectedOrder.updatedAt,
        }
      : null,
    {
      isPaid: selectedOrder?.isPaid,
      remoteTicketPending: Boolean(selectedOrderId && !orderTicketReady),
      onSaleComplete: () => {
        if (selectedOrderId) removeOrder(selectedOrderId)
      },
      catalogLoadEnabled: Boolean(selectedOrder) || creating,
      toolboxLoadEnabled: Boolean(selectedOrder) || creating,
      onCartLineAdded: handleCartLineAdded,
    },
  )

  useSaleOpenCashSessionToasts(
    siteId,
    popId,
    Boolean(popId && siteId),
    !loading,
  )

  useEffect(() => {
    setWorkspaceReady(false)
    pendingCatalogStageRef.current = false
  }, [popId])

  useEffect(() => {
    if (loading || workspaceReady || creating) return
    const saved = readMostradorWorkspacePreference(popId)
    if (saved) {
      const reconciled = reconcileMostradorWorkspaceView({
        rightView: saved.rightView,
        mobileStage: saved.mobileStage,
        orderExists: selectedOrder != null,
      })
      setRightView(reconciled.rightView)
      if (reconciled.mobileStage === "catalog" && selectedOrder) {
        pendingCatalogStageRef.current = true
      } else if (reconciled.mobileStage) {
        mobileStage?.setStage(reconciled.mobileStage)
      }
    }
    setWorkspaceReady(true)
  }, [loading, workspaceReady, creating, popId, selectedOrder, mobileStage])

  useEffect(() => {
    if (!workspaceReady || !pendingCatalogStageRef.current) return
    if (!selectedOrder) return
    pendingCatalogStageRef.current = false
    mobileStage?.setStage("catalog")
  }, [workspaceReady, selectedOrder, mobileStage])

  useEffect(() => {
    if (!workspaceReady || creating) return
    if (rightView === "cart" && !selectedOrder) {
      setRightView("detail")
    }
    if (mobileStage?.stage === "catalog" && !selectedOrder) {
      mobileStage.setStage("ticket")
    }
  }, [workspaceReady, creating, rightView, selectedOrder, mobileStage])

  useEffect(() => {
    if (!workspaceReady || creating) return
    writeMostradorWorkspacePreference(popId, {
      orderId: selectedOrderId,
      rightView,
      ...(mobileStage?.stage ? { mobileStage: mobileStage.stage } : {}),
    })
  }, [
    workspaceReady,
    creating,
    popId,
    selectedOrderId,
    rightView,
    mobileStage?.stage,
  ])

  useEffect(() => {
    if (!onRegisterStartCreateOrder) return
    onRegisterStartCreateOrder(() => {
      selectOrder(null)
      setCreating(true)
      setRightView("detail")
      mobileStage?.setStage("ticket")
    })
    return () => onRegisterStartCreateOrder(null)
  }, [onRegisterStartCreateOrder, selectOrder, mobileStage])

  const orderLabel = selectedOrder ? `#${selectedOrder.orderNumber}` : null

  useEffect(() => {
    if (mobileStage?.stage === "catalog") {
      setRightView("cart")
    }
  }, [mobileStage?.stage])

  const boardCanvas = (
    <section className={cn(layoutsOperarCatalogColumnClass, "flex-col")}>
      <div
        className={cn(
          layoutsOperarCatalogCanvasClass,
          "[grid-template-rows:minmax(0,1fr)]",
        )}
      >
        <MostradorBoard
          orders={orders}
          loading={loading}
          orderError={orderError}
          selectedOrderId={selectedOrderId}
          onSelectOrder={(id) => {
            selectOrder(id)
            setCreating(false)
            setRightView("cart")
            mobileStage?.setStage("ticket")
          }}
          onMoveOrder={moveOrderStatus}
        />
      </div>
    </section>
  )

  const catalogPanel = (
    <MostradorCatalogPanel
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
        mobileHomeLabel="Mostrador"
        mobileHome={boardCanvas}
        mobileCatalog={catalogPanel}
        mobileCatalogDisabled={!selectedOrder && !creating}
        catalog={!showCatalog ? boardCanvas : catalogPanel}
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
            className={cn(
              layoutsOperarSummaryPanelTabsClass,
              rightView !== "cart" && "max-md:grid-rows-[auto_minmax(0,1fr)_auto]",
            )}
            aria-label="Panel de pedido"
          >
            <MostradorRightPanelTabs
              value={rightView}
              onChange={setRightView}
              cartDisabled={!selectedOrder}
              orderLabel={orderLabel}
            />

            {rightView === "detail" ? (
              <div className={layoutsOperarSummaryPanelTabBodyClass}>
                <CounterOrderPanel
                  order={selectedOrder}
                  orderError={orderError}
                  creating={creating}
                  onCancelCreate={() => setCreating(false)}
                  onCreateOrder={async (input) => {
                    const ok = await createOrder(input)
                    if (ok) {
                      setCreating(false)
                      setRightView("cart")
                    }
                    return ok
                  }}
                  onUpdateOrder={patchOrder}
                  onMoveOrder={moveOrderStatus}
                  onCancelOrder={cancelOrder}
                  canCancelOrder={checkout.puedeCancelarPedido}
                  canCloseOrder={checkout.puedeCerrarPedido}
                  closeOrderBlockReason={checkout.cerrarPedidoBlockReason}
                  closeOrderMode={checkout.cerrarPedidoMode}
                  closeOrderLoading={checkout.submitting}
                  onCloseOrder={async () => checkout.cerrarPedido()}
                  clientLabel={checkout.sessionClientLabel}
                />
              </div>
            ) : (
              <div className={layoutsOperarSummaryPanelTabBodyClass}>
                <div className={cn(layoutsOperarSummaryPanelInnerGridClass, "min-h-0 flex-1")}>
                  <MostradorOrderPanel
                    checkout={checkout}
                    orderLabel={orderLabel}
                    cartScrollHighlight={cartScrollHighlight}
                  />
                </div>
              </div>
            )}
            {rightView !== "cart" ? <OperarMobileToolboxIcons /> : null}
          </aside>
        }
      />

      <MesasCheckoutModals checkout={checkout} confirmLabel="Cobrar pedido" contextLabel="pedido" />
    </div>
  )
}
