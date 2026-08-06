"use client"

import {
  saleOpFooterBandHeightClass,
  saleOpFooterBarPaddingClass,
  saleOpFmt,
  saleOpImporteBaseClass,
  saleOpImporteCartClass,
  saleOpImporteTotalClass,
  saleOpImporteTotalDiscountClass,
} from "@/components/sale-operation/saleOperationStyles"
import { cartLineRowGridColumnsClass } from "@/components/sale-operation/CartLineQuantityLabel"
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
  /** `pos` = footer verde de ventas/mesas; `modal` = paleta clara para detalle en modal */
  tone?: "pos" | "modal"
}

const breakdownLabelPosClass =
  "text-[10px] font-medium uppercase tracking-[0.12em] text-white/42"

const breakdownLabelModalClass =
  "text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground"

const amountColumnClass = "min-w-[6.5rem] text-right"
const modalAmountCellClass = cn(
  saleOpImporteCartClass,
  "justify-self-end pt-0.5 text-right",
)
const modalSummaryGridClass = cn(
  cartLineRowGridColumnsClass,
  "gap-y-1 px-3 py-2.5",
)
const modalSummaryLabelClass = "col-span-2 self-center min-w-0"

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
  tone = "pos",
}: SaleOperationTotalBarProps) {
  const isModal = tone === "modal"
  const breakdownLabelClass = isModal
    ? breakdownLabelModalClass
    : breakdownLabelPosClass
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

  const subtotalAmountClass = isModal
    ? modalAmountCellClass
    : cn(
        saleOpImporteBaseClass,
        amountColumnClass,
        "text-sm font-semibold text-white/78",
      )
  const discountAmountClass = isModal
    ? modalAmountCellClass
    : cn(saleOpImporteTotalDiscountClass, amountColumnClass)
  const totalLabelClass = isModal
    ? "self-center text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground"
    : "self-center text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-200/80"
  const totalAmountClass = isModal
    ? cn(
        saleOpImporteCartClass,
        "justify-self-end pt-0.5 text-right text-base font-semibold",
      )
    : cn(saleOpImporteTotalClass, amountColumnClass, "self-center")

  return (
    <div
      role="region"
      aria-label={totalAriaLabel ?? totalLabel}
      className={cn(
        "relative box-border flex w-full shrink-0 flex-col justify-center",
        isModal
          ? cn(
              "border-t border-slate-200/90 bg-white",
              flush ? "py-2.5" : saleOpFooterBarPaddingClass,
            )
          : cn(
              "backdrop-blur-xl",
              flush
                ? "border-t-0 px-3 py-2 sm:px-3 sm:py-2.5"
                : cn("border-t border-emerald-500/35", saleOpFooterBarPaddingClass),
              showSubtotalBreakdown
                ? "min-h-[calc(5.75rem+1.5rem)] sm:min-h-[calc(6rem+2rem)]"
                : saleOpFooterBandHeightClass,
            ),
        className,
      )}
    >
      {!isModal ? (
        <>
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
        </>
      ) : null}

      <div
        className={cn(
          "relative z-10 w-full",
          isModal
            ? modalSummaryGridClass
            : "grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-0.5",
        )}
      >
        {showSubtotalBreakdown ? (
          <>
            <span
              className={cn(
                breakdownLabelClass,
                isModal ? modalSummaryLabelClass : "self-center",
              )}
            >
              Subtotal
            </span>
            <p className={subtotalAmountClass}>
              {saleOpFmt.format(subtotalDisplay)}
            </p>
            {showItemsDiscount ? (
              <>
                <span
                  className={cn(
                    breakdownLabelClass,
                    isModal ? modalSummaryLabelClass : "self-center",
                  )}
                >
                  Descuento ítems
                </span>
                <p className={discountAmountClass}>
                  −{saleOpFmt.format(itemsDiscountAmount)}
                </p>
              </>
            ) : null}
            {showPromociones ? (
              <>
                <span
                  className={cn(
                    breakdownLabelClass,
                    isModal ? modalSummaryLabelClass : "self-center",
                  )}
                >
                  Promociones aplicadas ({promocionesAplicadasCount})
                </span>
                <p className={discountAmountClass}>
                  −{saleOpFmt.format(promocionesAplicadasMonto)}
                </p>
              </>
            ) : null}
            {showGeneralDiscount ? (
              <>
                <span
                  className={cn(
                    breakdownLabelClass,
                    isModal ? modalSummaryLabelClass : "self-center",
                  )}
                >
                  Descuento general
                </span>
                <p className={discountAmountClass}>
                  −{saleOpFmt.format(descuentoMonto)}
                </p>
              </>
            ) : null}
            {showPagado ? (
              <>
                <span
                  className={cn(
                    breakdownLabelClass,
                    isModal ? modalSummaryLabelClass : "self-center",
                  )}
                >
                  Pagado
                </span>
                <p className={discountAmountClass}>
                  −{saleOpFmt.format(totalPagado)}
                </p>
              </>
            ) : null}
          </>
        ) : null}
        <p className={cn(totalLabelClass, isModal && modalSummaryLabelClass)}>
          {totalLabel}
        </p>
        <p
          className={totalAmountClass}
          aria-live="polite"
          aria-atomic="true"
        >
          {saleOpFmt.format(total)}
        </p>
        {!isModal ? (
          <>
            <span aria-hidden className="min-h-0" />
            <span
              className={cn(
                amountColumnClass,
                "text-[10px] font-semibold uppercase tracking-[0.14em] text-white/32",
              )}
            >
              Pesos argentinos
            </span>
          </>
        ) : null}
      </div>
    </div>
  )
}
