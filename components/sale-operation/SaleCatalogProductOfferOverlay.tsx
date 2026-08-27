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
      className="pointer-events-none absolute inset-x-0 top-0 z-15 bg-linear-to-b from-[color-mix(in_srgb,var(--rootsy-sombra-950)_72%,transparent)] via-[color-mix(in_srgb,var(--rootsy-sombra-950)_28%,transparent)] to-transparent p-2.5 pb-6"
      aria-hidden
    >
      {descuentoPct != null ? (
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={cn(
              saleOpImporteBaseClass,
              "inline-flex h-6 items-center justify-center rounded-md bg-[var(--rootsy-sombra-900)] px-2 text-[10px] leading-none font-bold tracking-wider text-[var(--rootsy-savia-500)] uppercase shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--rootsy-savia-500)_45%,transparent)]",
            )}
          >
            −{descuentoPct}%
          </span>
          {precioOriginal != null ? (
            <span
              className={cn(
                saleOpImporteBaseClass,
                "rounded-md bg-[var(--rootsy-sombra-800)] px-1.5 py-0.5 text-xs font-semibold text-[var(--rootsy-sombra-300)] line-through shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--rootsy-sombra-400)_40%,transparent)]",
              )}
            >
              {saleOpFmt.format(precioOriginal)}
            </span>
          ) : null}
        </div>
      ) : (
        <Badge className="w-fit bg-[var(--rootsy-sombra-900)] px-2 py-0.5 text-[10px] font-bold tracking-wider text-[var(--rootsy-savia-500)] shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--rootsy-savia-500)_45%,transparent)]">
          OFERTA
        </Badge>
      )}
    </div>
  )
}
