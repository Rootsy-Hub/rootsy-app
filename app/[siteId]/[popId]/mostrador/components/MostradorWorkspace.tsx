"use client"

import { OpenCashSessionBanner } from "@/components/sale-operation/OpenCashSessionBanner"
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
import {
  layoutsOperarCatalogColumnClass,
  layoutsOperarCatalogCanvasClass,
  layoutsOperarSummaryPanelClass,
  layoutsOperarSummaryPanelInnerGridClass,
  layoutsOperarSummaryPanelTabBodyClass,
} from "@/app/library/layouts/layoutsOperarStyles"
import { mostradorRealtimeBannerClass } from "@/app/[siteId]/[popId]/mostrador/mostradorOperarStyles"
import { SaleOperationToolbox } from "@/components/sale-operation/SaleOperationToolbox"
import { useCartListScrollHighlight } from "@/hooks/useCartListScrollHighlight"
import { cn } from "@/lib/utils"
import { useEffect, useState, useCallback } from "react"

type Props = {
  siteId: string
  popId: string
  catalogSidebarOpen: boolean
  onRegisterStartCreateOrder?: (handler: (() => void) | null) => void
}

export function MostradorWorkspace({
  siteId,
  popId,
  catalogSidebarOpen,
  onRegisterStartCreateOrder,
}: Props) {
  const {
    orders,
    loading,
    orderError,
    realtimeStatus,
    selectedOrderId,
    selectedOrder,
    selectOrder,
    createOrder,
    patchOrder,
    moveOrderStatus,
    cancelOrder,
    reloadOrders,
  } = useMostradorState(popId, siteId)

  const [rightView, setRightView] = useState<MostradorRightPanelView>("detail")
  const [creating, setCreating] = useState(false)
  const showCatalog = rightView === "cart"
  const cartScrollHighlight = useCartListScrollHighlight()

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
    selectedOrder
      ? {
          checkout: selectedOrder.checkout,
          updatedAt: selectedOrder.updatedAt,
        }
      : null,
    {
      isPaid: selectedOrder?.isPaid,
      onSaleComplete: () => void reloadOrders(),
      catalogSidebarOpen,
      catalogLoadEnabled:
        catalogSidebarOpen ||
        selectedOrderId != null ||
        creating ||
        showCatalog,
      onCartLineAdded: handleCartLineAdded,
    },
  )

  useEffect(() => {
    if (!selectedOrder) {
      setRightView("detail")
      return
    }
    if (!creating) {
      setRightView("cart")
    }
  }, [selectedOrder?.id, creating])

  useEffect(() => {
    if (!onRegisterStartCreateOrder) return
    onRegisterStartCreateOrder(() => {
      selectOrder(null)
      setCreating(true)
      setRightView("detail")
    })
    return () => onRegisterStartCreateOrder(null)
  }, [onRegisterStartCreateOrder, selectOrder])

  const orderLabel = selectedOrder ? `#${selectedOrder.orderNumber}` : null

  return (
    <div className="relative flex h-full min-h-0 w-full flex-col overflow-hidden">
      <OperationsModuleBackdrop />

      {checkout.catalogLoadAttempted &&
      !checkout.catalogLoading &&
      !checkout.openCashSession ? (
        <OpenCashSessionBanner siteId={siteId} popId={popId} variant="dark" />
      ) : null}

      {realtimeStatus === "disconnected" ? (
        <div className={mostradorRealtimeBannerClass}>
          Conexión en vivo interrumpida. Reconectando… los cambios pueden demorar
          unos segundos.
        </div>
      ) : null}

      <LayoutsOperarMainGrid
        catalog={
          !showCatalog ? (
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
                  }}
                  onMoveOrder={moveOrderStatus}
                />
              </div>
            </section>
          ) : (
            <MostradorCatalogPanel
              siteId={siteId}
              popId={popId}
              checkout={checkout}
              catalogSidebarOpen={catalogSidebarOpen}
            />
          )
        }
        toolbox={
          showCatalog ? <SaleOperationToolbox {...checkout.toolbox} /> : null
        }
        ticket={
          <aside
            className={cn(
              layoutsOperarSummaryPanelClass,
              "[grid-template-rows:auto_minmax(0,1fr)]",
            )}
            aria-label="Panel de pedido"
          >
            <MostradorRightPanelTabs
              value={rightView}
              onChange={setRightView}
              cartDisabled={!selectedOrder}
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
                    if (ok) setCreating(false)
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
          </aside>
        }
      />

      <MesasCheckoutModals checkout={checkout} confirmLabel="Cobrar pedido" contextLabel="pedido" />
    </div>
  )
}
