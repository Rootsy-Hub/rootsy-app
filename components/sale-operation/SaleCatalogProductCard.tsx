"use client"

import {
  layoutsOperarProductCardProposalAddClass,
  layoutsOperarProductCardProposalBodyClass,
  layoutsOperarProductCardProposalDescClass,
  layoutsOperarProductCardProposalGridShellClass,
  layoutsOperarProductCardProposalListShellClass,
  layoutsOperarProductCardProposalTriggerClass,
  layoutsOperarProductCardProposalMediaClass,
  layoutsOperarProductCardProposalMediaStyle,
  layoutsOperarProductCardProposalOfferClass,
  layoutsOperarProductCardProposalPriceClass,
  layoutsOperarProductCardProposalPriceRowClass,
  layoutsOperarProductCardProposalTextClass,
  layoutsOperarProductCardProposalTitleClass,
  type LayoutsOperarProductCardProposalId,
} from "@/app/library/layouts/layoutsOperarHardcodedSpec"
import {
  layoutsOperarProductCardStockClass,
  layoutsOperarProductCardStockOutClass,
} from "@/app/library/layouts/layoutsOperarStyles"
import { LAYOUTS_OPERAR_DEFAULT_PRODUCT_CARD_PROPOSAL } from "@/app/library/layouts/rootsyLayoutsOperarSystem"
import type { SaleCatalogProduct } from "@/components/sale-operation/saleCatalogProduct"
import {
  catalogProductStockState,
  catalogProductVisibleDescription,
} from "@/components/sale-operation/saleCatalogProduct"
import { CatalogProductCardMediaPhoto } from "@/components/sale-operation/CatalogProductCardMediaPhoto"
import {
  SaleCatalogProductOfferOverlay,
} from "@/components/sale-operation/SaleCatalogProductOfferOverlay"
import { saleOpFmt } from "@/components/sale-operation/saleOperationStyles"
import { cn } from "@/lib/utils"
import { Plus } from "lucide-react"

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
  const isList = variant === "lista"
  const layoutVariant = isList ? "list" : "grid"
  const promoTrim = product.promo?.trim() ?? ""
  const showOfferOverlay =
    product.precioOriginal != null && product.precioOriginal > product.precio
  const mediaStyle = layoutsOperarProductCardProposalMediaStyle(proposalId)
  const description = catalogProductVisibleDescription(product.descripcion)
  const stock = catalogProductStockState(product)
  const stockBlocked = stock?.blocked === true
  const mutedByParent = disabled && !stockBlocked

  const priceLabel = saleOpFmt.format(product.precio)
  const productAriaLabel = stockBlocked
    ? `${product.nombre}, ${priceLabel}, sin stock`
    : `${product.nombre}, ${priceLabel}`

  const stockMark = stock ? (
    <span
      className={
        stock.out
          ? layoutsOperarProductCardStockOutClass
          : layoutsOperarProductCardStockClass
      }
    >
      {stock.label}
    </span>
  ) : null

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
  )

  if (isList) {
    return (
      <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        data-proposal={proposalId}
        aria-label={productAriaLabel}
        className={cn(
          layoutsOperarProductCardProposalListShellClass(proposalId),
          mutedByParent && "cursor-not-allowed opacity-50",
          stockBlocked && "cursor-not-allowed",
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
            {description ? (
              <p
                className={cn(
                  layoutsOperarProductCardProposalDescClass(proposalId),
                  "line-clamp-1",
                )}
              >
                {description}
              </p>
            ) : null}
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1">
            <span className={layoutsOperarProductCardProposalPriceClass(proposalId)}>
              {saleOpFmt.format(product.precio)}
            </span>
            {stockMark}
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
      aria-label={productAriaLabel}
      className={cn(
        layoutsOperarProductCardProposalTriggerClass(proposalId),
        mutedByParent && "cursor-not-allowed opacity-50",
        stockBlocked && "cursor-not-allowed",
      )}
    >
      <div
        className={layoutsOperarProductCardProposalGridShellClass(proposalId)}
        data-proposal={proposalId}
      >
        {media}
        <div className={layoutsOperarProductCardProposalTextClass(proposalId)}>
          <h3 className={layoutsOperarProductCardProposalTitleClass(proposalId)}>
            {product.nombre}
          </h3>
          {description ? (
            <p className={layoutsOperarProductCardProposalDescClass(proposalId)}>
              {description}
            </p>
          ) : null}
        </div>
        <div className={layoutsOperarProductCardProposalPriceRowClass(proposalId)}>
          <span className={layoutsOperarProductCardProposalPriceClass(proposalId)}>
            {saleOpFmt.format(product.precio)}
          </span>
          {stockMark}
        </div>
      </div>
    </button>
  )
}
