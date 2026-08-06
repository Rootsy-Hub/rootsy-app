"use client"

import type { SaleCatalogProduct } from "@/components/sale-operation/saleCatalogProduct"
import {
  SaleCatalogProductOfferOverlay,
  saleCatalogDiscountPercent,
} from "@/components/sale-operation/SaleCatalogProductOfferOverlay"
import { saleOpFmt } from "@/components/sale-operation/saleOperationStyles"
import {
  LAYOUTS_OPERAR_CATALOG_SIDEBAR_WIDTH_PX,
  layoutsOperarProductCardAddClass,
  layoutsOperarProductCardClass,
  layoutsOperarProductCardDescClass,
  layoutsOperarProductCardGridBodyClass,
  layoutsOperarProductCardListBodyClass,
  layoutsOperarProductCardListClass,
  layoutsOperarProductCardListMediaClass,
  layoutsOperarProductCardMediaClass,
  layoutsOperarProductCardPriceClass,
  layoutsOperarProductCardTitleClass,
} from "@/app/[siteId]/[popId]/library/layouts/layoutsOperarStyles"
import { cn } from "@/lib/utils"
import { Plus } from "lucide-react"
import Image from "next/image"

type Props = {
  product: SaleCatalogProduct
  variant: "grid" | "lista"
  disabled?: boolean
  onClick: () => void
}

export function SaleCatalogProductCard({
  product,
  variant,
  disabled = false,
  onClick,
}: Props) {
  const descuentoPct = saleCatalogDiscountPercent(product.precioOriginal, product.precio)
  const promoTrim = product.promo?.trim() ?? ""
  const mostrarBadgeOferta = descuentoPct != null || promoTrim.length > 0
  const isList = variant === "lista"

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        isList ? layoutsOperarProductCardListClass : layoutsOperarProductCardClass,
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      <div
        className={cn(
          isList ? layoutsOperarProductCardListMediaClass : layoutsOperarProductCardMediaClass,
          !isList && "h-full w-full",
        )}
      >
        <Image
          src={product.imagen}
          alt={product.nombre}
          fill
          className="h-full w-full transition-transform duration-300 ease-out group-hover:scale-[1.03]"
          unoptimized
          sizes={isList ? `${LAYOUTS_OPERAR_CATALOG_SIDEBAR_WIDTH_PX}px` : "33vw"}
          style={{ objectFit: "cover", objectPosition: "center" }}
        />
        {mostrarBadgeOferta ? (
          <SaleCatalogProductOfferOverlay
            precioOriginal={product.precioOriginal}
            precio={product.precio}
            promo={product.promo}
          />
        ) : null}
        {!disabled ? (
          <span className={layoutsOperarProductCardAddClass} aria-hidden>
            <Plus className="size-4.5" strokeWidth={2.5} />
          </span>
        ) : null}
      </div>
      <div className={isList ? layoutsOperarProductCardListBodyClass : layoutsOperarProductCardGridBodyClass}>
        <div className="min-h-0 self-start">
          <h3 className={layoutsOperarProductCardTitleClass}>{product.nombre}</h3>
          <p className={layoutsOperarProductCardDescClass}>{product.descripcion}</p>
        </div>
        <div className={isList ? "shrink-0" : "self-end"}>
          <span className={layoutsOperarProductCardPriceClass}>
            {saleOpFmt.format(product.precio)}
          </span>
        </div>
      </div>
    </button>
  )
}
