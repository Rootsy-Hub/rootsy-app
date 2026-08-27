"use client"

import "@/app/library/layouts/layoutsOperarTheme.css"
import "@/app/library/radius/rootsyRadiusSystem.css"
import {
  getLayoutsOperarGridCssVariables,
  layoutsOperarProductCardProposalAddClass,
  layoutsOperarProductCardProposalBodyClass,
  layoutsOperarProductCardProposalDescClass,
  layoutsOperarProductCardProposalGridInnerClass,
  layoutsOperarProductCardProposalGridShellClass,
  layoutsOperarProductCardProposalListShellClass,
  layoutsOperarProductCardProposalTriggerClass,
  layoutsOperarProductCardProposalMediaClass,
  layoutsOperarProductCardProposalMediaStyle,
  layoutsOperarProductCardProposalOfferClass,
  layoutsOperarProductCardMediaEmptyStateShellClass,
  layoutsOperarProductCardProposalPriceClass,
  layoutsOperarProductCardProposalPriceRowClass,
  layoutsOperarProductCardProposalTextClass,
  layoutsOperarProductCardProposalTitleClass,
  type LayoutsOperarProductCardProposalId,
} from "@/app/library/layouts/layoutsOperarHardcodedSpec"
import {
  layoutsOperarCatalogArticleDemoScopeClass,
  layoutsOperarProductCardMediaEmptyStateIconClass,
} from "@/app/library/layouts/layoutsOperarStyles"
import { LAYOUTS_OPERAR_DEFAULT_PRODUCT_CARD_PROPOSAL } from "@/app/library/layouts/rootsyLayoutsOperarSystem"
import { SaleCatalogProductOfferOverlay } from "@/components/sale-operation/SaleCatalogProductOfferOverlay"
import { saleOpFmt } from "@/components/sale-operation/saleOperationStyles"
import { cn } from "@/lib/utils"
import { Image as ImageIcon, Plus } from "lucide-react"
import { useState } from "react"

export type LayoutsOperarDemoProduct = {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  offerLabel?: string
  image?: string | null
}

export const LAYOUTS_OPERAR_DEMO_ARTICLE: LayoutsOperarDemoProduct = {
  id: "cafe",
  name: "Café en grano",
  description: "Tostado medio · origen Colombia · 250 g",
  price: 4500,
  image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=300&fit=crop",
}

export const LAYOUTS_OPERAR_DEMO_ARTICLE_OFFER: LayoutsOperarDemoProduct = {
  id: "medialunas",
  name: "Medialunas x6",
  description: "Manteca · recién horneadas",
  price: 3200,
  originalPrice: 3760,
  image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&h=300&fit=crop",
  offerLabel: "15% off",
}

export const LAYOUTS_OPERAR_DEMO_ARTICLE_NO_IMAGE: LayoutsOperarDemoProduct = {
  id: "tomate",
  name: "Tomate cherry",
  description: "Bandeja 500 g · huerta local",
  price: 2400,
  image: null,
}

function formatDemoPrice(amount: number) {
  return saleOpFmt.format(amount)
}

/** Superficie foto ausente — mismo fondo que la card e icono savia al centro. */
export function LayoutsOperarProductCardMediaEmptyState({
  proposalId = LAYOUTS_OPERAR_DEFAULT_PRODUCT_CARD_PROPOSAL,
  decorative = false,
  className,
}: {
  proposalId?: LayoutsOperarProductCardProposalId
  decorative?: boolean
  className?: string
}) {
  return (
    <div
      className={cn(layoutsOperarProductCardMediaEmptyStateShellClass(proposalId), className)}
      role={decorative ? undefined : "img"}
      aria-hidden={decorative ? true : undefined}
      aria-label={decorative ? undefined : "Producto sin fotografía"}
    >
      {decorative ? null : (
        <ImageIcon
          className={layoutsOperarProductCardMediaEmptyStateIconClass}
          strokeWidth={1.6}
          aria-hidden
        />
      )}
    </div>
  )
}

export function LayoutsOperarProductCardDemoCanvas({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(layoutsOperarCatalogArticleDemoScopeClass, className)}
      style={getLayoutsOperarGridCssVariables()}
    >
      {children}
    </div>
  )
}

function LayoutsOperarProductCardProposalMedia({
  product,
  variant,
  proposalId,
}: {
  product: LayoutsOperarDemoProduct
  variant: "grid" | "list"
  proposalId: LayoutsOperarProductCardProposalId
}) {
  const [imageFailed, setImageFailed] = useState(false)
  const showOfferOverlay = product.originalPrice != null && product.originalPrice > product.price
  const mediaStyle = layoutsOperarProductCardProposalMediaStyle(proposalId)
  const showEmptyState = product.image == null || product.image === "" || imageFailed

  return (
    <div
      className={layoutsOperarProductCardProposalMediaClass(proposalId, variant)}
      style={mediaStyle}
    >
      {showEmptyState ? (
        <LayoutsOperarProductCardMediaEmptyState proposalId={proposalId} />
      ) : (
        <img
          src={product.image ?? undefined}
          alt=""
          onError={() => setImageFailed(true)}
          className="size-full object-cover object-center transition-transform duration-300 ease-out group-hover:scale-[1.03]"
        />
      )}
      {showOfferOverlay ? (
        <SaleCatalogProductOfferOverlay
          precioOriginal={product.originalPrice}
          precio={product.price}
          promo={product.offerLabel}
        />
      ) : product.offerLabel ? (
        <span className={layoutsOperarProductCardProposalOfferClass(proposalId)}>
          {product.offerLabel}
        </span>
      ) : null}
      <span className={layoutsOperarProductCardProposalAddClass(proposalId)} aria-hidden>
        <Plus className="size-4" strokeWidth={2.5} aria-hidden />
      </span>
    </div>
  )
}

function LayoutsOperarProductCardProposalCopy({
  product,
  proposalId,
  compact = false,
}: {
  product: LayoutsOperarDemoProduct
  proposalId: LayoutsOperarProductCardProposalId
  compact?: boolean
}) {
  return (
    <>
      <h3
        className={cn(
          layoutsOperarProductCardProposalTitleClass(proposalId),
          compact && "line-clamp-1",
        )}
      >
        {product.name}
      </h3>
      <p
        className={cn(
          layoutsOperarProductCardProposalDescClass(proposalId),
          compact && "line-clamp-1",
        )}
      >
        {product.description}
      </p>
    </>
  )
}

export function LayoutsOperarProductCardProposalGrid({
  product,
  proposalId = LAYOUTS_OPERAR_DEFAULT_PRODUCT_CARD_PROPOSAL,
}: {
  product: LayoutsOperarDemoProduct
  proposalId?: LayoutsOperarProductCardProposalId
}) {
  return (
    <button
      type="button"
      tabIndex={-1}
      aria-hidden
      data-proposal={proposalId}
      className={layoutsOperarProductCardProposalTriggerClass(proposalId)}
    >
      <div
        className={layoutsOperarProductCardProposalGridShellClass(proposalId)}
        data-proposal={proposalId}
      >
        <div className={layoutsOperarProductCardProposalGridInnerClass(proposalId)}>
          <LayoutsOperarProductCardProposalMedia product={product} variant="grid" proposalId={proposalId} />
          <div className={layoutsOperarProductCardProposalTextClass(proposalId)}>
            <LayoutsOperarProductCardProposalCopy product={product} proposalId={proposalId} />
          </div>
          <div className={layoutsOperarProductCardProposalPriceRowClass(proposalId)}>
            <span className={layoutsOperarProductCardProposalPriceClass(proposalId)}>
              {formatDemoPrice(product.price)}
            </span>
          </div>
        </div>
      </div>
    </button>
  )
}

export function LayoutsOperarProductCardProposalList({
  product,
  proposalId = LAYOUTS_OPERAR_DEFAULT_PRODUCT_CARD_PROPOSAL,
}: {
  product: LayoutsOperarDemoProduct
  proposalId?: LayoutsOperarProductCardProposalId
}) {
  return (
    <button
      type="button"
      tabIndex={-1}
      aria-hidden
      data-proposal={proposalId}
      className={layoutsOperarProductCardProposalListShellClass(proposalId)}
    >
      <LayoutsOperarProductCardProposalMedia product={product} variant="list" proposalId={proposalId} />
      <div className={layoutsOperarProductCardProposalBodyClass(proposalId, "list")}>
        <div className="min-h-0 min-w-0">
          <LayoutsOperarProductCardProposalCopy
            product={product}
            proposalId={proposalId}
            compact
          />
        </div>
        <div className="shrink-0">
          <span className={layoutsOperarProductCardProposalPriceClass(proposalId)}>
            {formatDemoPrice(product.price)}
          </span>
        </div>
      </div>
    </button>
  )
}

