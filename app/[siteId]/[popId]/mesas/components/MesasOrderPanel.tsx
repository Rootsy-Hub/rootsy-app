"use client"

import type { MesasSaleCheckout } from "@/app/[siteId]/[popId]/mesas/useMesasSaleCheckout"
import { SaleOperationActionsBar } from "@/components/sale-operation/SaleOperationActionsBar"
import { SaleOperationTotalBar } from "@/components/sale-operation/SaleOperationTotalBar"
import { saleOpFmt } from "@/components/sale-operation/saleOperationStyles"
import { Minus, Plus } from "lucide-react"

type Props = {
  checkout: MesasSaleCheckout
  tableLabel: string | null
}

export function MesasOrderPanel({ checkout, tableLabel }: Props) {
  const { itemsDetallados, cambiarCantidad, actions, subtotal, descuentoMonto, total, hayDescuento } =
    checkout

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="game-scroll min-h-0 flex-1 overflow-y-auto p-3 sm:p-3.5">
        <div className="mb-1 flex items-baseline justify-between gap-2 px-0.5">
          <div>
            <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
              Pedido
            </h2>
            {tableLabel ? (
              <p className="mt-0.5 text-xs font-medium text-slate-600">
                Mesa {tableLabel}
              </p>
            ) : null}
          </div>
          <span className="text-[11px] font-medium tabular-nums text-slate-400">
            {itemsDetallados.length}{" "}
            {itemsDetallados.length === 1 ? "línea" : "líneas"}
          </span>
        </div>

        {itemsDetallados.length === 0 ? (
          <div className="mt-8 rounded-xl border border-dashed border-slate-200 bg-white/60 px-4 py-10 text-center">
            <p className="text-sm font-medium text-slate-600">Pedido vacío</p>
            <p className="mt-1 text-xs text-slate-400">
              Agregá productos desde el panel izquierdo.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {itemsDetallados.map((item) => (
              <li
                key={item.productoId}
                className="rounded-xl border border-slate-200/90 bg-white px-3 py-2.5 shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-0.5 rounded-lg bg-slate-50 px-1 py-1 ring-1 ring-slate-200/90">
                    <button
                      type="button"
                      onClick={() => cambiarCantidad(item.productoId, -1)}
                      className="inline-flex size-6 items-center justify-center rounded-md bg-white text-slate-600 ring-1 ring-slate-200/80"
                      aria-label="Quitar una unidad"
                    >
                      <Minus className="size-3" />
                    </button>
                    <span className="min-w-5 text-center text-sm font-bold tabular-nums">
                      {item.cantidad}
                    </span>
                    <button
                      type="button"
                      onClick={() => cambiarCantidad(item.productoId, 1)}
                      className="inline-flex size-6 items-center justify-center rounded-md bg-white text-slate-600 ring-1 ring-slate-200/80"
                      aria-label="Agregar una unidad"
                    >
                      <Plus className="size-3" />
                    </button>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {item.producto?.nombre}
                    </p>
                    <p className="text-xs text-slate-500">
                      {saleOpFmt.format(item.producto?.precio ?? 0)} c/u
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-semibold tabular-nums text-slate-900">
                    {saleOpFmt.format(
                      (item.producto?.precio ?? 0) * item.cantidad,
                    )}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

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
      />
    </div>
  )
}
