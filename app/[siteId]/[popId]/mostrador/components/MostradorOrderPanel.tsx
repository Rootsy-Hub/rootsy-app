"use client"

import type { MostradorSaleCheckout } from "@/app/[siteId]/[popId]/mostrador/useMostradorSaleCheckout"
import { SaleOperationTicketOrderPanel } from "@/components/sale-operation/SaleOperationTicketOrderPanel"
import type { CartListScrollHighlightValue } from "@/hooks/useCartListScrollHighlight"

type Props = {
  checkout: MostradorSaleCheckout
  orderLabel: string | null
  cartScrollHighlight?: CartListScrollHighlightValue
}

export function getMostradorOrderConfirmState(checkout: MostradorSaleCheckout) {
  const requiereCajaAbierta = checkout.openCashSession == null
  const confirmLabel =
    checkout.puedeCerrarPedido && checkout.cerrarPedidoMode === "release"
      ? "Liberar pedido"
      : checkout.puedeCerrarPedido
        ? "Cerrar pedido"
        : "Cobrar pedido"
  const confirmDisabled = checkout.puedeCerrarPedido
    ? !checkout.puedeCerrarPedido
    : requiereCajaAbierta || !checkout.puedeRegistrar
  const confirmTitle = checkout.puedeCerrarPedido
    ? checkout.cerrarPedidoMode === "release"
      ? "No hay ítems ni cobros pendientes. Podés liberar el pedido."
      : "Todo el pedido está cobrado. Podés cerrarlo para marcarlo como pagado."
    : requiereCajaAbierta
      ? "Requiere caja abierta"
      : !checkout.puedeRegistrar
        ? "Completá el pedido, pago y pedido seleccionado."
        : undefined

  return { confirmLabel, confirmDisabled, confirmTitle }
}

export function runMostradorOrderConfirm(checkout: MostradorSaleCheckout) {
  if (checkout.puedeCerrarPedido) {
    void checkout.cerrarPedido()
    return
  }
  checkout.actions.onConfirm()
}

export function MostradorOrderPanel({
  checkout,
  orderLabel,
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
  const { confirmLabel, confirmDisabled, confirmTitle } =
    getMostradorOrderConfirmState(checkout)

  return (
    <SaleOperationTicketOrderPanel
      loading={orderPanelLoading}
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
        onConfirm: () => runMostradorOrderConfirm(checkout),
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
      contextLabel={
        orderLabel
          ? { caption: "Pedido", value: orderLabel, valueSize: "compact" }
          : undefined
      }
      cartScrollHighlight={cartScrollHighlight}
    />
  )
}
