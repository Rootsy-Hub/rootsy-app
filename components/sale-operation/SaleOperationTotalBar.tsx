"use client"

import {
  saleOpFooterBarPaddingClass,
  saleOpFmt,
  saleOpImporteBaseClass,
  saleOpImporteTotalClass,
  saleOpImporteTotalDiscountClass,
} from "@/components/sale-operation/saleOperationStyles"
import { cn } from "@/lib/utils"

export type SaleOperationTotalBarProps = {
  total: number
  subtotal: number
  descuentoMonto: number
  hayDescuento: boolean
  subtotalOriginal?: number
  /** Suma de descuentos por ítem (catálogo + inline). */
  descuentoItemsMonto?: number
  hayDescuentoItems?: boolean
  /** @deprecated Usar descuentoItemsMonto */
  descuentoCatalogoMonto?: number
  /** @deprecated Usar hayDescuentoItems */
  hayDescuentoCatalogo?: boolean
  /** Total descontado por promociones (combo + cantidad). */
  promocionesAplicadasMonto?: number
  promocionesAplicadasCount?: number
  /** Suma acumulada de pagos parciales en la sesión/pedido. */
  totalPagado?: number
  className?: string
  flush?: boolean
  totalLabel?: string
  totalAriaLabel?: string
}

const breakdownLabelClass =
  "text-[10px] font-medium uppercase tracking-[0.12em] text-white/42"

const amountColumnClass = "min-w-[6.5rem] text-right"

export function SaleOperationTotalBar({
  total,
  subtotal,
  descuentoMonto,
  hayDescuento,
  subtotalOriginal = 0,
  descuentoItemsMonto,
  hayDescuentoItems,
  descuentoCatalogoMonto = 0,
  hayDescuentoCatalogo = false,
  promocionesAplicadasMonto = 0,
  promocionesAplicadasCount = 0,
  totalPagado = 0,
  className,
  flush = false,
  totalLabel = "Total a cobrar",
  totalAriaLabel,
}: SaleOperationTotalBarProps) {
  const itemsDiscountAmount =
    descuentoItemsMonto ?? descuentoCatalogoMonto ?? 0
  const showItemsDiscount =
    hayDescuentoItems ?? hayDescuentoCatalogo ?? itemsDiscountAmount > 0
  const showGeneralDiscount = hayDescuento && descuentoMonto > 0
  const showPromociones = promocionesAplicadasMonto > 0
  const showPagado = totalPagado > 0
  const subtotalDisplay =
    subtotalOriginal > 0 ? subtotalOriginal : subtotal
  const showSubtotalBreakdown =
    subtotalDisplay > 0 &&
    (showItemsDiscount ||
      showGeneralDiscount ||
      showPromociones ||
      showPagado)

  const subtotalAmountClass = cn(
    saleOpImporteBaseClass,
    amountColumnClass,
    "text-sm font-semibold text-white/78",
  )

  return (
    <div
      role="region"
      aria-label={totalAriaLabel ?? totalLabel}
      className={cn(
        "relative box-border flex w-full shrink-0 flex-col justify-center border-t border-emerald-500/35 backdrop-blur-xl",
        flush ? "px-3 py-2 sm:px-3 sm:py-2.5" : saleOpFooterBarPaddingClass,
        showSubtotalBreakdown
          ? "min-h-[calc(5.75rem+1rem)] sm:min-h-[calc(6rem+1.25rem)]"
          : "min-h-[calc(4.5rem+1rem)] sm:min-h-[calc(4.75rem+1.25rem)]",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(145deg,#07120e_0%,#0c1f17_42%,#061009_100%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_90%_at_50%_-20%,rgba(52,211,153,0.28),transparent_52%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-emerald-400/55 to-transparent"
        aria-hidden
      />

      <div className="relative z-10 grid w-full grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-0.5">
        {showSubtotalBreakdown ? (
          <>
            <span className={cn(breakdownLabelClass, "self-center")}>
              Subtotal
            </span>
            <p className={subtotalAmountClass}>
              {saleOpFmt.format(subtotalDisplay)}
            </p>
            {showItemsDiscount ? (
              <>
                <span className={cn(breakdownLabelClass, "self-center")}>
                  Descuento ítems
                </span>
                <p className={cn(saleOpImporteTotalDiscountClass, amountColumnClass)}>
                  −{saleOpFmt.format(itemsDiscountAmount)}
                </p>
              </>
            ) : null}
            {showPromociones ? (
              <>
                <span className={cn(breakdownLabelClass, "self-center")}>
                  Promociones aplicadas ({promocionesAplicadasCount})
                </span>
                <p className={cn(saleOpImporteTotalDiscountClass, amountColumnClass)}>
                  −{saleOpFmt.format(promocionesAplicadasMonto)}
                </p>
              </>
            ) : null}
            {showGeneralDiscount ? (
              <>
                <span className={cn(breakdownLabelClass, "self-center")}>
                  Descuento general
                </span>
                <p className={cn(saleOpImporteTotalDiscountClass, amountColumnClass)}>
                  −{saleOpFmt.format(descuentoMonto)}
                </p>
              </>
            ) : null}
            {showPagado ? (
              <>
                <span className={cn(breakdownLabelClass, "self-center")}>
                  Pagado
                </span>
                <p className={cn(saleOpImporteTotalDiscountClass, amountColumnClass)}>
                  −{saleOpFmt.format(totalPagado)}
                </p>
              </>
            ) : null}
          </>
        ) : null}
        <p
          className={cn(
            "self-center text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-200/80",
          )}
        >
          {totalLabel}
        </p>
        <p
          className={cn(saleOpImporteTotalClass, amountColumnClass, "self-center")}
          aria-live="polite"
          aria-atomic="true"
        >
          {saleOpFmt.format(total)}
        </p>
        <span aria-hidden className="min-h-0" />
        <span
          className={cn(
            amountColumnClass,
            "text-[10px] font-semibold uppercase tracking-[0.14em] text-white/32",
          )}
        >
          Pesos argentinos
        </span>
      </div>
    </div>
  )
}
