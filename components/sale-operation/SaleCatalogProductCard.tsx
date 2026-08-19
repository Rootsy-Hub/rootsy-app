"use client"

import {
  layoutsOperarProductCardProposalAddClass,
  layoutsOperarProductCardProposalBodyClass,
  layoutsOperarProductCardProposalDescClass,
  layoutsOperarProductCardProposalGridShellClass,
  layoutsOperarProductCardProposalListShellClass,
  layoutsOperarProductCardProposalMediaClass,
  layoutsOperarProductCardProposalMediaStyle,
  layoutsOperarProductCardProposalOfferClass,
  layoutsOperarProductCardProposalPriceClass,
  layoutsOperarProductCardProposalTitleClass,
  type LayoutsOperarProductCardProposalId,
} from "@/app/library/layouts/layoutsOperarHardcodedSpec"
import { LayoutsOperarProductCardMediaEmptyState } from "@/app/library/layouts/LayoutsOperarProductCardProposalPrimitives"
import { LAYOUTS_OPERAR_DEFAULT_PRODUCT_CARD_PROPOSAL } from "@/app/library/layouts/rootsyLayoutsOperarSystem"
import type { SaleCatalogProduct } from "@/components/sale-operation/saleCatalogProduct"
import {
  SaleCatalogProductOfferOverlay,
} from "@/components/sale-operation/SaleCatalogProductOfferOverlay"
import { saleOpFmt } from "@/components/sale-operation/saleOperationStyles"
import { cn } from "@/lib/utils"
import { Plus } from "lucide-react"
import Image from "next/image"
import { useState } from "react"

type Props = {
  product: SaleCatalogProduct
  variant: "grid" | "lista"
  disabled?: boolean
  onClick: () => void
  proposalId?: LayoutsOperarProductCardProposalId
}

export function SaleCatalogProductCard({
  product,
  variant,
  disabled = false,
  onClick,
  proposalId = LAYOUTS_OPERAR_DEFAULT_PRODUCT_CARD_PROPOSAL,
}: Props) {
  const [imageFailed, setImageFailed] = useState(false)
  const isList = variant === "lista"
  const layoutVariant = isList ? "list" : "grid"
  const promoTrim = product.promo?.trim() ?? ""
  const showOfferOverlay =
    product.precioOriginal != null && product.precioOriginal > product.precio
  const imagenTrim = product.imagen?.trim() ?? ""
  const showEmptyState = imagenTrim.length === 0 || imageFailed
  const mediaStyle = layoutsOperarProductCardProposalMediaStyle(proposalId)

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      data-proposal={proposalId}
      className={cn(
        isList
          ? layoutsOperarProductCardProposalListShellClass(proposalId)
          : layoutsOperarProductCardProposalGridShellClass(proposalId),
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      <div
        className={layoutsOperarProductCardProposalMediaClass(proposalId, layoutVariant)}
        style={mediaStyle}
      >
        {showEmptyState ? (
          <LayoutsOperarProductCardMediaEmptyState
            proposalId={proposalId}
            seed={product.id}
          />
        ) : (
          <Image
            src={product.imagen}
            alt=""
            fill
            onError={() => setImageFailed(true)}
            className="size-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
            unoptimized
            sizes={isList ? "80px" : "33vw"}
          />
        )}
        {showOfferOverlay ? (
          <SaleCatalogProductOfferOverlay
            precioOriginal={product.precioOriginal}
            precio={product.precio}
            promo={product.promo}
          />
        ) : promoTrim ? (
          <span className={layoutsOperarProductCardProposalOfferClass(proposalId)}>
            {promoTrim}
          </span>
        ) : null}
        {!disabled ? (
          <span className={layoutsOperarProductCardProposalAddClass(proposalId)} aria-hidden>
            <Plus className="size-4" strokeWidth={2.5} aria-hidden />
          </span>
        ) : null}
      </div>
      <div className={layoutsOperarProductCardProposalBodyClass(proposalId, layoutVariant)}>
        <div className={cn("min-h-0 min-w-0", !isList && "self-start")}>
          <h3
            className={cn(
              layoutsOperarProductCardProposalTitleClass(proposalId),
              isList && "line-clamp-1",
            )}
          >
            {product.nombre}
          </h3>
          <p
            className={cn(
              layoutsOperarProductCardProposalDescClass(proposalId),
              isList && "line-clamp-1",
            )}
          >
            {product.descripcion}
          </p>
        </div>
        <div className={isList ? "shrink-0" : "self-end"}>
          <span className={layoutsOperarProductCardProposalPriceClass(proposalId)}>
            {saleOpFmt.format(product.precio)}
          </span>
        </div>
      </div>
    </button>
  )
}
