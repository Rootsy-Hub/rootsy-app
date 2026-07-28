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
import { SaleOperationToolbox } from "@/components/sale-operation/SaleOperationToolbox"
import { useEffect, useState } from "react"

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
    },
  )

  useEffect(() => {
    if (!selectedOrder) {
      setRightView("detail")
    }
  }, [selectedOrder])

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
    <div className="dark relative flex h-full min-h-0 w-full flex-col overflow-hidden bg-[#070a09] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(52,211,153,0.14),transparent_40%),radial-gradient(circle_at_80%_10%,rgba(99,102,241,0.1),transparent_36%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size-[38px_38px] opacity-20" />
      </div>

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

      <main className="relative z-10 grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_380px] grid-rows-[minmax(0,1fr)_calc(4.5rem+1rem)] sm:grid-rows-[minmax(0,1fr)_calc(4.75rem+1.25rem)]">
        <section className="col-start-1 row-start-1 flex min-h-0 min-w-0 flex-col overflow-hidden bg-[#20262e]">
          {!showCatalog ? (
            <MostradorBoard
              orders={orders}
              loading={loading}
              orderError={orderError}
              selectedOrderId={selectedOrderId}
              onSelectOrder={(id) => {
                selectOrder(id)
                setCreating(false)
                setRightView("detail")
              }}
              onMoveOrder={moveOrderStatus}
            />
          ) : (
            <MostradorCatalogPanel
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
          className="rootsy-app-light col-start-2 row-span-2 grid min-h-0 grid-rows-[auto_minmax(0,1fr)] overflow-hidden bg-[#eef1f5] text-[#121417]"
          aria-label="Panel de pedido"
        >
          <MostradorRightPanelTabs
            value={rightView}
            onChange={setRightView}
            cartDisabled={!selectedOrder}
          />

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            {rightView === "detail" ? (
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
            ) : (
              <MostradorOrderPanel checkout={checkout} orderLabel={orderLabel} />
            )}
          </div>
        </aside>
      </main>

      <MesasCheckoutModals checkout={checkout} confirmLabel="Cobrar pedido" contextLabel="pedido" />
    </div>
  )
}
