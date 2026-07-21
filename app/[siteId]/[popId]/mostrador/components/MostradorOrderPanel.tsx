"use client"

import type { MostradorSaleCheckout } from "@/app/[siteId]/[popId]/mostrador/useMostradorSaleCheckout"
import { SaleOperationTicketOrderPanel } from "@/components/sale-operation/SaleOperationTicketOrderPanel"

type Props = {
  checkout: MostradorSaleCheckout
  orderLabel: string | null
}

export function MostradorOrderPanel({ checkout, orderLabel }: Props) {
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
    cartLineOverrides,
  } = checkout

  return (
    <SaleOperationTicketOrderPanel
      cartDisplayRows={cartDisplayRows}
      cartLineOverrides={cartLineOverrides}
      aplicarEdicionLineaTicket={aplicarEdicionLineaTicket}
      cambiarCantidadPorLinea={cambiarCantidadPorLinea}
      quitarQuantityDealApplication={quitarQuantityDealApplication}
      actions={{
        ...actions,
        confirmLabel: "Cobrar pedido",
        confirmTitle: !checkout.puedeRegistrar
          ? "Completá el pedido, pago y pedido seleccionado."
          : undefined,
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
      }}
      listTitle="Pedido"
      listSubtitle={orderLabel ? `Pedido ${orderLabel}` : undefined}
    />
  )
}
