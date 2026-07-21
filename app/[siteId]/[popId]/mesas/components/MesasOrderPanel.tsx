"use client"

import type { MesasSaleCheckout } from "@/app/[siteId]/[popId]/mesas/useMesasSaleCheckout"
import { SaleOperationTicketOrderPanel } from "@/components/sale-operation/SaleOperationTicketOrderPanel"

type Props = {
  checkout: MesasSaleCheckout
  tableLabel: string | null
}

export function MesasOrderPanel({ checkout, tableLabel }: Props) {
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
        confirmLabel: "Cobrar mesa",
        confirmTitle: !checkout.puedeRegistrar
          ? "Completá el pedido, pago y mesa abierta."
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
      listSubtitle={tableLabel ? `Mesa ${tableLabel}` : undefined}
    />
  )
}
