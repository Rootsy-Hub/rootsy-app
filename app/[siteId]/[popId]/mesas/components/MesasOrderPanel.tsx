"use client"

import type { MesasSaleCheckout } from "@/app/[siteId]/[popId]/mesas/useMesasSaleCheckout"
import { catalogCartLinePricing } from "@/components/sale-operation/saleCatalogProduct"
import { SaleOperationActionsBar } from "@/components/sale-operation/SaleOperationActionsBar"
import { SaleOperationCartItem } from "@/components/sale-operation/SaleOperationCartItem"
import { SaleOperationCartList } from "@/components/sale-operation/SaleOperationCartList"
import { SaleOperationTotalBar } from "@/components/sale-operation/SaleOperationTotalBar"

type Props = {
  checkout: MesasSaleCheckout
  tableLabel: string | null
}

export function MesasOrderPanel({ checkout, tableLabel }: Props) {
  const {
    itemsDetallados,
    cambiarCantidad,
    quitarDelCarrito,
    actions,
    subtotal,
    descuentoMonto,
    total,
    hayDescuento,
    subtotalOriginal,
    descuentoCatalogoMonto,
    hayDescuentoCatalogo,
  } = checkout

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <SaleOperationCartList
        title="Pedido"
        subtitle={tableLabel ? `Mesa ${tableLabel}` : undefined}
        lineCount={itemsDetallados.length}
        emptyTitle="Pedido vacío"
        emptyDescription="Agregá productos desde el panel izquierdo."
      >
        {itemsDetallados.map((item) => {
          const pricing = catalogCartLinePricing(item.producto, item.cantidad)

          return (
            <SaleOperationCartItem
              key={item.productoId}
              itemId={item.productoId}
              nombre={item.producto?.nombre ?? "Producto"}
              descripcion={item.producto?.descripcion}
              cantidad={item.cantidad}
              precioUnitario={pricing.precioUnitario}
              precioBase={pricing.precioBase}
              precioFinal={pricing.precioFinal}
              tieneDescuento={pricing.tieneDescuentoCatalogo}
              descuentoLabel={pricing.descuentoCatalogoLabel}
              onQuantityDecrease={() => cambiarCantidad(item.productoId, -1)}
              onQuantityIncrease={() => cambiarCantidad(item.productoId, 1)}
              onRemove={() => quitarDelCarrito(item.productoId)}
            />
          )
        })}
      </SaleOperationCartList>

      <SaleOperationActionsBar
        {...actions}
        confirmLabel="Cobrar mesa"
        confirmTitle={
          !checkout.puedeRegistrar
            ? "Completá el pedido, pago y mesa abierta."
            : undefined
        }
      />
      <SaleOperationTotalBar
        total={total}
        subtotal={subtotal}
        descuentoMonto={descuentoMonto}
        hayDescuento={hayDescuento}
        subtotalOriginal={subtotalOriginal}
        descuentoCatalogoMonto={descuentoCatalogoMonto}
        hayDescuentoCatalogo={hayDescuentoCatalogo}
      />
    </div>
  )
}
