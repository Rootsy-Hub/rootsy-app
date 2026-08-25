"use client"

import {
  layoutsOperarProductCardProposalAddClass,
  layoutsOperarProductCardProposalBodyClass,
  layoutsOperarProductCardProposalDescClass,
  layoutsOperarProductCardProposalGridShellClass,
  layoutsOperarProductCardProposalListShellClass,
  layoutsOperarProductCardProposalMediaClass,
  layoutsOperarProductCardProposalMediaStyle,
  layoutsOperarProductCardProposalPriceClass,
  layoutsOperarProductCardProposalTitleClass,
} from "@/app/library/layouts/layoutsOperarHardcodedSpec"
import { LayoutsOperarProductCardMediaEmptyState } from "@/app/library/layouts/LayoutsOperarProductCardProposalPrimitives"
import { LAYOUTS_OPERAR_DEFAULT_PRODUCT_CARD_PROPOSAL } from "@/app/library/layouts/rootsyLayoutsOperarSystem"
import {
  purchaseCatalogCostHint,
  type PurchaseCatalogProduct,
} from "@/components/purchase-operation/purchaseCatalogTypes"
import { isCatalogProductPhotoUrl } from "@/lib/catalogProductImageCache"
import { cn } from "@/lib/utils"
import { Plus } from "lucide-react"
import Image from "next/image"
import { useState } from "react"

type Props = {
  product: PurchaseCatalogProduct
  variant: "grid" | "lista"
  disabled?: boolean
  onClick: () => void
}

export function PurchaseCatalogProductCard({
  product,
  variant,
  disabled = false,
  onClick,
}: Props) {
  const [imageFailed, setImageFailed] = useState(false)
  const isList = variant === "lista"
  const layoutVariant = isList ? "list" : "grid"
  const proposalId = LAYOUTS_OPERAR_DEFAULT_PRODUCT_CARD_PROPOSAL
  const imagenTrim = product.imagen?.trim() ?? ""
  const showEmptyState = !isCatalogProductPhotoUrl(imagenTrim) || imageFailed
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
            loading="eager"
            decoding="async"
            onError={() => setImageFailed(true)}
            className="size-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
            unoptimized
            sizes={isList ? "80px" : "33vw"}
          />
        )}
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
            {purchaseCatalogCostHint(product)}
          </span>
        </div>
      </div>
    </button>
  )
}
