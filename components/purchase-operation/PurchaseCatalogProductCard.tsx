"use client"

import {
  layoutsOperarProductCardProposalAddClass,
  layoutsOperarProductCardProposalBodyClass,
  layoutsOperarProductCardProposalDescClass,
  layoutsOperarProductCardProposalGridInnerClass,
  layoutsOperarProductCardProposalGridShellClass,
  layoutsOperarProductCardProposalListShellClass,
  layoutsOperarProductCardProposalTriggerClass,
  layoutsOperarProductCardProposalMediaClass,
  layoutsOperarProductCardProposalMediaStyle,
  layoutsOperarProductCardProposalPriceClass,
  layoutsOperarProductCardProposalPriceRowClass,
  layoutsOperarProductCardProposalTextClass,
  layoutsOperarProductCardProposalTitleClass,
} from "@/app/library/layouts/layoutsOperarHardcodedSpec"
import { LAYOUTS_OPERAR_DEFAULT_PRODUCT_CARD_PROPOSAL } from "@/app/library/layouts/rootsyLayoutsOperarSystem"
import { CatalogProductCardMediaPhoto } from "@/components/sale-operation/CatalogProductCardMediaPhoto"
import {
  purchaseCatalogCostHint,
  type PurchaseCatalogProduct,
} from "@/components/purchase-operation/purchaseCatalogTypes"
import { cn } from "@/lib/utils"
import { Plus } from "lucide-react"

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
  const isList = variant === "lista"
  const layoutVariant = isList ? "list" : "grid"
  const proposalId = LAYOUTS_OPERAR_DEFAULT_PRODUCT_CARD_PROPOSAL
  const mediaStyle = layoutsOperarProductCardProposalMediaStyle(proposalId)

  const media = (
    <div
      className={layoutsOperarProductCardProposalMediaClass(proposalId, layoutVariant)}
      style={mediaStyle}
    >
      <CatalogProductCardMediaPhoto
        src={product.imagen}
        proposalId={proposalId}
        sizes={isList ? "80px" : "33vw"}
      />
      {!disabled ? (
        <span className={layoutsOperarProductCardProposalAddClass(proposalId)} aria-hidden>
          <Plus className="size-4" strokeWidth={2.5} aria-hidden />
        </span>
      ) : null}
    </div>
  )

  if (isList) {
    return (
      <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        data-proposal={proposalId}
        className={cn(
          layoutsOperarProductCardProposalListShellClass(proposalId),
          disabled && "cursor-not-allowed opacity-50",
        )}
      >
        {media}
        <div className={layoutsOperarProductCardProposalBodyClass(proposalId, layoutVariant)}>
          <div className="min-h-0 min-w-0">
            <h3
              className={cn(
                layoutsOperarProductCardProposalTitleClass(proposalId),
                "line-clamp-1",
              )}
            >
              {product.nombre}
            </h3>
            <p
              className={cn(
                layoutsOperarProductCardProposalDescClass(proposalId),
                "line-clamp-1",
              )}
            >
              {product.descripcion}
            </p>
          </div>
          <div className="shrink-0">
            <span className={layoutsOperarProductCardProposalPriceClass(proposalId)}>
              {purchaseCatalogCostHint(product)}
            </span>
          </div>
        </div>
      </button>
    )
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      data-proposal={proposalId}
      className={cn(
        layoutsOperarProductCardProposalTriggerClass(proposalId),
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      <div
        className={layoutsOperarProductCardProposalGridShellClass(proposalId)}
        data-proposal={proposalId}
      >
        <div className={layoutsOperarProductCardProposalGridInnerClass(proposalId)}>
          {media}
          <div className={layoutsOperarProductCardProposalTextClass(proposalId)}>
            <h3 className={layoutsOperarProductCardProposalTitleClass(proposalId)}>
              {product.nombre}
            </h3>
            <p className={layoutsOperarProductCardProposalDescClass(proposalId)}>
              {product.descripcion}
            </p>
          </div>
          <div className={layoutsOperarProductCardProposalPriceRowClass(proposalId)}>
            <span className={layoutsOperarProductCardProposalPriceClass(proposalId)}>
              {purchaseCatalogCostHint(product)}
            </span>
          </div>
        </div>
      </div>
    </button>
  )
}
