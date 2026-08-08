"use client"

import { saleOpFmt, saleOpImporteBaseClass } from "@/components/sale-operation/saleOperationStyles"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export function saleCatalogDiscountPercent(
  precioOriginal: number | null | undefined,
  precio: number,
): number | null {
  if (precioOriginal == null || precioOriginal <= precio) return null
  return Math.round(((precioOriginal - precio) / precioOriginal) * 100)
}

type Props = {
  precioOriginal?: number | null
  precio: number
  promo?: string | null
}

export function SaleCatalogProductOfferOverlay({
  precioOriginal,
  precio,
  promo,
}: Props) {
  const descuentoPct = saleCatalogDiscountPercent(precioOriginal, precio)
  const promoTrim = promo?.trim() ?? ""

  if (descuentoPct == null && !promoTrim) return null

  return (
    <div
      className="pointer-events-none absolute inset-x-0 top-0 z-15 bg-linear-to-b from-black/55 via-black/20 to-transparent p-2.5 pb-6"
      aria-hidden
    >
      {descuentoPct != null ? (
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={cn(
              saleOpImporteBaseClass,
              "inline-flex h-6 items-center justify-center rounded-md border border-emerald-400/45 bg-emerald-950/90 px-2 text-[10px] leading-none font-bold tracking-wider text-emerald-100 uppercase shadow-sm backdrop-blur-sm",
            )}
          >
            −{descuentoPct}%
          </span>
          {precioOriginal != null ? (
            <span
              className={cn(
                saleOpImporteBaseClass,
                "rounded-md border border-white/10 bg-black/50 px-1.5 py-0.5 text-xs font-semibold text-white/65 line-through backdrop-blur-sm",
              )}
            >
              {saleOpFmt.format(precioOriginal)}
            </span>
          ) : null}
        </div>
      ) : (
        <Badge className="w-fit border border-emerald-400/40 bg-emerald-950/85 px-2 py-0.5 text-[10px] font-bold tracking-wider text-emerald-100 shadow-sm backdrop-blur-sm">
          OFERTA
        </Badge>
      )}
    </div>
  )
}
