"use client"

import type { MesasSaleCheckout } from "@/app/[siteId]/[popId]/mesas/useMesasSaleCheckout"
import { OperationCartLineRow } from "@/components/sale-operation/OperationCartLineRow"
import { QuantityDealCartLineRow } from "@/components/sale-operation/QuantityDealCartLineRow"
import { SaleOperationActionsBar } from "@/components/sale-operation/SaleOperationActionsBar"
import { SaleOperationCartList } from "@/components/sale-operation/SaleOperationCartList"
import { SaleOperationTotalBar } from "@/components/sale-operation/SaleOperationTotalBar"

type Props = {
  checkout: MesasSaleCheckout
  tableLabel: string | null
}

export function MesasOrderPanel({ checkout, tableLabel }: Props) {
  const {
    cartDisplayLines,
    cambiarCantidad,
    quitarDelCarrito,
    quitarQuantityDealApplication,
    actions,
    subtotal,
    descuentoMonto,
    total,
    hayDescuento,
    subtotalOriginal,
    descuentoItemsMonto,
    hayDescuentoItems,
    cartLineOverrides,
    cartLineOverrideActions,
  } = checkout

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <SaleOperationCartList
        title="Pedido"
        subtitle={tableLabel ? `Mesa ${tableLabel}` : undefined}
        lineCount={cartDisplayLines.length}
        emptyTitle="Pedido vacío"
        emptyDescription="Agregá productos desde el panel izquierdo."
      >
        {cartDisplayLines.map((line) => {
          if (line.displayKind === "quantity_deal") {
            const app = line.application
            return (
              <QuantityDealCartLineRow
                key={line.cartLineKey}
                lineKey={line.cartLineKey}
                promotionName={app.promotionName}
                discountAmount={app.discountAmount}
                buyQuantity={app.buyQuantity}
                overrides={cartLineOverrides}
                overrideActions={cartLineOverrideActions}
                onRemove={() => quitarQuantityDealApplication(app.id)}
              />
            )
          }

          const selectionSummary =
            line.kind === "promotion" && line.promotionSelections?.length
              ? line.promotionSelections.map((s) => s.name).join(" · ")
              : undefined

          return (
            <OperationCartLineRow
              key={line.cartLineKey}
              lineKey={line.cartLineKey}
              itemId={line.productoId}
              nombre={line.producto?.nombre ?? "Producto"}
              descripcion={selectionSummary ?? line.producto?.descripcion}
              cantidad={line.cantidad}
              producto={line.producto}
              overrides={cartLineOverrides}
              overrideActions={cartLineOverrideActions}
              promotionMeta={line.producto?.promotionMeta}
              promotionSelections={line.promotionSelections}
              quantityDealUnitsOnLine={line.quantityDealUnitsOnLine}
              onQuantityDecrease={() =>
                cambiarCantidad(
                  line.productoId,
                  -1,
                  line.kind,
                  line.promotionSelections,
                )
              }
              onQuantityIncrease={() =>
                cambiarCantidad(
                  line.productoId,
                  1,
                  line.kind,
                  line.promotionSelections,
                )
              }
              onRemove={() =>
                quitarDelCarrito(
                  line.productoId,
                  line.kind,
                  line.promotionSelections,
                )
              }
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
        descuentoItemsMonto={descuentoItemsMonto}
        hayDescuentoItems={hayDescuentoItems}
      />
    </div>
  )
}
