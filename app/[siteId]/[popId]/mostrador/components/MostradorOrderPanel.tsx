"use client"

import type { MostradorSaleCheckout } from "@/app/[siteId]/[popId]/mostrador/useMostradorSaleCheckout"
import { SaleOperationTicketOrderPanel } from "@/components/sale-operation/SaleOperationTicketOrderPanel"
import type { CartListScrollHighlightValue } from "@/hooks/useCartListScrollHighlight"

type Props = {
  checkout: MostradorSaleCheckout
  orderLabel: string | null
  cartScrollHighlight?: CartListScrollHighlightValue
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
    puedeCerrarPedido,
    cerrarPedido,
    cerrarPedidoMode,
    puedeRegistrar,
    openCashSession,
    orderPanelLoading,
  } = checkout

  const requiereCajaAbierta = openCashSession == null
  const confirmLabel =
    puedeCerrarPedido && cerrarPedidoMode === "release"
      ? "Liberar pedido"
      : puedeCerrarPedido
        ? "Cerrar pedido"
        : "Cobrar pedido"
  const confirmDisabled = puedeCerrarPedido
    ? !puedeCerrarPedido
    : requiereCajaAbierta || !puedeRegistrar
  const confirmTitle = puedeCerrarPedido
    ? cerrarPedidoMode === "release"
      ? "No hay ítems ni cobros pendientes. Podés liberar el pedido."
      : "Todo el pedido está cobrado. Podés cerrarlo para marcarlo como pagado."
    : requiereCajaAbierta
      ? "Requiere caja abierta"
      : !puedeRegistrar
        ? "Completá el pedido, pago y pedido seleccionado."
        : undefined

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
      actions={{
        ...actions,
        confirmLabel,
        confirmDisabled,
        confirmTitle,
        onConfirm: puedeCerrarPedido
          ? () => void cerrarPedido()
          : actions.onConfirm,
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
