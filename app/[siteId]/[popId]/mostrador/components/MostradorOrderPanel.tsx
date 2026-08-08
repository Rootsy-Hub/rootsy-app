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
  } = checkout

  const confirmLabel =
    puedeCerrarPedido && cerrarPedidoMode === "release"
      ? "Liberar pedido"
      : puedeCerrarPedido
        ? "Cerrar pedido"
        : "Cobrar pedido"
  const confirmDisabled = puedeCerrarPedido ? !puedeCerrarPedido : !puedeRegistrar
  const confirmTitle = puedeCerrarPedido
    ? cerrarPedidoMode === "release"
      ? "No hay ítems ni cobros pendientes. Podés liberar el pedido."
      : "Todo el pedido está cobrado. Podés cerrarlo para marcarlo como pagado."
    : !puedeRegistrar
      ? "Completá el pedido, pago y pedido seleccionado."
      : undefined

  return (
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
      listSubtitle={orderLabel ? `Pedido ${orderLabel}` : undefined}
      cartScrollHighlight={cartScrollHighlight}
    />
  )
}
