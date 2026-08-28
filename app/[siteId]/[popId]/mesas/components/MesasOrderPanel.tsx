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

export function getMesasOrderConfirmState(checkout: MesasSaleCheckout) {
  const alreadyFullyCharged = checkout.totalPagadoAcumulado > 0 && checkout.total <= 0
  const requiereCajaAbierta = checkout.openCashSession == null
  const confirmLabel =
    checkout.puedeCerrarMesa && !alreadyFullyCharged ? "Liberar mesa" : "Cobrar mesa"
  const confirmDisabled = alreadyFullyCharged
    ? false
    : checkout.puedeCerrarMesa
      ? !checkout.puedeCerrarMesa
      : requiereCajaAbierta || !checkout.puedeRegistrar
  const confirmTitle = alreadyFullyCharged
    ? "El pedido ya está cobrado. No queda saldo."
    : checkout.puedeCerrarMesa
      ? checkout.cerrarMesaMode === "release"
        ? "No hay ítems ni cobros pendientes. Podés liberar la mesa."
        : "Todo el pedido está cobrado. Podés liberar la mesa."
      : requiereCajaAbierta
        ? "Requiere caja abierta"
        : !checkout.puedeRegistrar
          ? "Completá el pedido, pago y mesa abierta."
          : undefined

  return { alreadyFullyCharged, confirmLabel, confirmDisabled, confirmTitle }
}

export function runMesasOrderConfirm(
  checkout: MesasSaleCheckout,
  onCannotCharge: () => void,
) {
  const { alreadyFullyCharged } = getMesasOrderConfirmState(checkout)
  if (alreadyFullyCharged) {
    onCannotCharge()
    return
  }
  if (checkout.puedeCerrarMesa) {
    void checkout.cerrarMesa()
    return
  }
  checkout.actions.onConfirm()
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
    anularLineaComanda,
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
    orderPanelLoading,
  } = checkout
  const [cannotChargeOpen, setCannotChargeOpen] = useState(false)
  const { confirmLabel, confirmDisabled, confirmTitle } =
    getMesasOrderConfirmState(checkout)

  return (
    <>
      <SaleOperationTicketOrderPanel
        cartDisplayRows={cartDisplayRows}
        cartLineOverrides={cartLineOverrides}
        paidPartialUnits={paidPartialUnits}
        aplicarEdicionLineaTicket={aplicarEdicionLineaTicket}
        anularLineaComanda={anularLineaComanda}
        cambiarCantidadPorLinea={cambiarCantidadPorLinea}
        quitarQuantityDealApplication={quitarQuantityDealApplication}
        showDesktopActions={false}
        actions={{
          ...actions,
          confirmLabel,
          confirmDisabled,
          confirmTitle,
          onConfirm: () => runMesasOrderConfirm(checkout, () => setCannotChargeOpen(true)),
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
