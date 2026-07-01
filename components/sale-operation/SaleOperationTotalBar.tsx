"use client"

import {
  saleOpFooterBandHeightClass,
  saleOpFooterBarPaddingClass,
  saleOpFmt,
  saleOpImporteTotalClass,
  saleOpImporteTotalDiscountClass,
  saleOpImporteTotalMutedClass,
} from "@/components/sale-operation/saleOperationStyles"
import { cn } from "@/lib/utils"

export type SaleOperationTotalBarProps = {
  total: number
  subtotal: number
  descuentoMonto: number
  hayDescuento: boolean
  subtotalOriginal?: number
  descuentoCatalogoMonto?: number
  hayDescuentoCatalogo?: boolean
  className?: string
}

export function SaleOperationTotalBar({
  total,
  subtotal,
  descuentoMonto,
  hayDescuento,
  subtotalOriginal = 0,
  descuentoCatalogoMonto = 0,
  hayDescuentoCatalogo = false,
  className,
}: SaleOperationTotalBarProps) {
  const hayAhorroVisible = hayDescuentoCatalogo || hayDescuento

  const helperText = hayDescuentoCatalogo && hayDescuento
    ? "Incluye descuentos en productos y descuento general."
    : hayDescuentoCatalogo
      ? "Incluye descuentos aplicados en productos."
      : hayDescuento
        ? "Incluye descuento general sobre el subtotal."
        : null

  return (
    <div
      role="region"
      aria-label="Total a cobrar"
      className={cn(
        "relative box-border flex w-full shrink-0 flex-col justify-center border-t border-emerald-500/35 backdrop-blur-xl",
        saleOpFooterBarPaddingClass,
        saleOpFooterBandHeightClass,
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

      <div className="relative z-10 flex w-full items-end justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-200/80">
            Total a cobrar
          </p>
          {helperText ? (
            <p className="mt-1 max-w-44 text-[10px] leading-snug text-white/40">
              {helperText}
            </p>
          ) : null}
        </div>
        <div className="flex min-w-0 shrink-0 flex-col items-end text-right">
          {hayAhorroVisible ? (
            <>
              <p className={saleOpImporteTotalMutedClass}>
                {saleOpFmt.format(
                  hayDescuentoCatalogo ? subtotalOriginal : subtotal,
                )}
              </p>
              {hayDescuentoCatalogo ? (
                <p className={cn(saleOpImporteTotalDiscountClass, "mt-0.5")}>
                  −{saleOpFmt.format(descuentoCatalogoMonto)}
                </p>
              ) : null}
              {hayDescuento ? (
                <p className={cn(saleOpImporteTotalDiscountClass, "mt-0.5")}>
                  −{saleOpFmt.format(descuentoMonto)}
                </p>
              ) : null}
              <div
                className="my-1.5 h-px w-12 max-w-full bg-linear-to-r from-emerald-400/50 to-transparent"
                aria-hidden
              />
            </>
          ) : null}
          <p className={saleOpImporteTotalClass} aria-live="polite" aria-atomic="true">
            {saleOpFmt.format(total)}
          </p>
          <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/32">
            Pesos argentinos
          </span>
        </div>
      </div>
    </div>
  )
}
