"use client"

import type { MesasSaleCheckout } from "@/app/[siteId]/[popId]/mesas/useMesasSaleCheckout"
import { SaleOperationTicketOrderPanel } from "@/components/sale-operation/SaleOperationTicketOrderPanel"
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

  const confirmLabel = puedeCerrarMesa ? "Liberar mesa" : "Cobrar mesa"
  const confirmDisabled = puedeCerrarMesa ? !puedeCerrarMesa : !puedeRegistrar
  const confirmTitle = puedeCerrarMesa
    ? cerrarMesaMode === "release"
      ? "No hay ítems ni cobros pendientes. Podés liberar la mesa."
      : "Todo el pedido está cobrado. Podés liberar la mesa."
    : !puedeRegistrar
      ? "Completá el pedido, pago y mesa abierta."
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
        onConfirm: puedeCerrarMesa ? () => void cerrarMesa() : actions.onConfirm,
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
      listSubtitle={tableLabel ? `Mesa ${tableLabel}` : undefined}
      loading={orderPanelLoading}
      cartScrollHighlight={cartScrollHighlight}
    />
  )
}
