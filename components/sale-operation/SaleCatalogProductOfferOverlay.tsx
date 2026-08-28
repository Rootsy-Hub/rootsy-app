"use client"

import { RootsNaturePill } from "@/components/rootsy-pill"
import { saleOpFmt } from "@/components/sale-operation/saleOperationStyles"

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
      className="pointer-events-none absolute inset-x-0 top-0 z-15 p-2.5"
      aria-hidden
    >
      {descuentoPct != null ? (
        <div className="flex flex-wrap items-center gap-1.5">
          <RootsNaturePill variant="sombra" atmosphere="sombra">
            −{descuentoPct}%
          </RootsNaturePill>
          {precioOriginal != null ? (
            <RootsNaturePill variant="sombraMuted" atmosphere="sombra" strike>
              {saleOpFmt.format(precioOriginal)}
            </RootsNaturePill>
          ) : null}
        </div>
      ) : (
        <RootsNaturePill variant="sombra" atmosphere="sombra">
          OFERTA
        </RootsNaturePill>
      )}
    </div>
  )
}
