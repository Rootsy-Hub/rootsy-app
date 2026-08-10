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
            sizes={isList ? "192px" : "33vw"}
          />
        )}
        {!disabled ? (
          <span className={layoutsOperarProductCardProposalAddClass(proposalId)} aria-hidden>
            <Plus className="size-4" strokeWidth={2.5} aria-hidden />
          </span>
        ) : null}
      </div>
      <div className={layoutsOperarProductCardProposalBodyClass(proposalId, layoutVariant)}>
        <div className="min-h-0 self-start">
          <h3 className={layoutsOperarProductCardProposalTitleClass(proposalId)}>
            {product.nombre}
          </h3>
          <p className={layoutsOperarProductCardProposalDescClass(proposalId)}>
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
