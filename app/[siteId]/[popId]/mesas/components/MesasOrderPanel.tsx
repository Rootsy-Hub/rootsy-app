"use client"

import { useState } from "react"
import type { MesasSaleCheckout } from "@/app/[siteId]/[popId]/mesas/useMesasSaleCheckout"
import {
  RootsAlertDialogContent,
  RootsAlertDialogFooter,
  RootsAlertDialogPanel,
} from "@/components/rootsy-dialog/RootsAlertDialog"
import { SaleOperationTicketOrderPanel } from "@/components/sale-operation/SaleOperationTicketOrderPanel"
import { AlertDialog } from "@/components/ui/alert-dialog"
import type { CartListScrollHighlightValue } from "@/hooks/useCartListScrollHighlight"

type Props = {
  checkout: MesasSaleCheckout
  tableLabel: string | null
  cartScrollHighlight?: CartListScrollHighlightValue
}

export function MesasOrderPanel({
  checkout,
  tableLabel,
  cartScrollHighlight,
}: Props) {
  const {
    cartDisplayRows,
    cambiarCantidadPorLinea,
    aplicarEdicionLineaTicket,
    quitarQuantityDealApplication,
    actions,
    subtotal,
    descuentoMonto,
    total,
    hayDescuento,
    subtotalOriginal,
    descuentoItemsMonto,
    hayDescuentoItems,
    promocionesAplicadasMonto,
    promocionesAplicadasCount,
    paidPartialUnits,
    totalPagadoAcumulado,
    cartLineOverrides,
    puedeCerrarMesa,
    cerrarMesa,
    cerrarMesaMode,
    puedeRegistrar,
    orderPanelLoading,
  } = checkout
  const [cannotChargeOpen, setCannotChargeOpen] = useState(false)

  const alreadyFullyCharged = totalPagadoAcumulado > 0 && total <= 0
  const confirmLabel =
    puedeCerrarMesa && !alreadyFullyCharged ? "Liberar mesa" : "Cobrar mesa"
  const confirmDisabled = alreadyFullyCharged
    ? false
    : puedeCerrarMesa
      ? !puedeCerrarMesa
      : !puedeRegistrar
  const confirmTitle = alreadyFullyCharged
    ? "El pedido ya está cobrado. No queda saldo."
    : puedeCerrarMesa
      ? cerrarMesaMode === "release"
        ? "No hay ítems ni cobros pendientes. Podés liberar la mesa."
        : "Todo el pedido está cobrado. Podés liberar la mesa."
      : !puedeRegistrar
        ? "Completá el pedido, pago y mesa abierta."
        : undefined

  return (
    <>
      <SaleOperationTicketOrderPanel
        cartDisplayRows={cartDisplayRows}
        cartLineOverrides={cartLineOverrides}
        paidPartialUnits={paidPartialUnits}
        aplicarEdicionLineaTicket={aplicarEdicionLineaTicket}
        cambiarCantidadPorLinea={cambiarCantidadPorLinea}
        quitarQuantityDealApplication={quitarQuantityDealApplication}
        actions={{
          ...actions,
          confirmLabel,
          confirmDisabled,
          confirmTitle,
          onConfirm: () => {
            if (alreadyFullyCharged) {
              setCannotChargeOpen(true)
              return
            }
            if (puedeCerrarMesa) {
              void cerrarMesa()
              return
            }
            actions.onConfirm()
          },
        }}
        totalBar={{
          total,
          subtotal,
          descuentoMonto,
          hayDescuento,
          subtotalOriginal,
          descuentoItemsMonto,
          hayDescuentoItems,
          promocionesAplicadasMonto,
          promocionesAplicadasCount,
          totalPagado: totalPagadoAcumulado,
        }}
        listTitle="Pedido"
        contextLabel={tableLabel ? { caption: "Mesa", value: tableLabel } : undefined}
        loading={orderPanelLoading}
        cartScrollHighlight={cartScrollHighlight}
      />

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
    </>
  )
}
