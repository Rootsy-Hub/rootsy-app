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
  className?: string
}

export function SaleOperationTotalBar({
  total,
  subtotal,
  descuentoMonto,
  hayDescuento,
  className,
}: SaleOperationTotalBarProps) {
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
          {hayDescuento ? (
            <p className="mt-1 max-w-44 text-[10px] leading-snug text-white/40">
              Incluye descuento general sobre el subtotal.
            </p>
          ) : null}
        </div>
        <div className="flex min-w-0 shrink-0 flex-col items-end text-right">
          {hayDescuento ? (
            <>
              <p className={saleOpImporteTotalMutedClass}>
                {saleOpFmt.format(subtotal)}
              </p>
              <p className={cn(saleOpImporteTotalDiscountClass, "mt-0.5")}>
                −{saleOpFmt.format(descuentoMonto)}
              </p>
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
