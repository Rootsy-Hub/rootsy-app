"use client"

import "@/app/[siteId]/[popId]/library/layouts/layoutsOperarTheme.css"
import "@/app/[siteId]/[popId]/library/radius/rootsyRadiusSystem.css"
import {
  getLayoutsOperarGridCssVariables,
  getLayoutsOperarProductCardMediaEmptyPhotoLayers,
  layoutsOperarProductCardProposalAddClass,
  layoutsOperarProductCardProposalBodyClass,
  layoutsOperarProductCardProposalDescClass,
  layoutsOperarProductCardProposalGridShellClass,
  layoutsOperarProductCardProposalListShellClass,
  layoutsOperarProductCardProposalMediaClass,
  layoutsOperarProductCardProposalMediaStyle,
  layoutsOperarProductCardProposalOfferClass,
  layoutsOperarProductCardMediaEmptyStateShellClass,
  layoutsOperarProductCardProposalPriceClass,
  layoutsOperarProductCardProposalTitleClass,
  type LayoutsOperarProductCardProposalId,
} from "@/app/[siteId]/[popId]/library/layouts/layoutsOperarHardcodedSpec"
import {
  layoutsOperarCatalogArticleDemoScopeClass,
  layoutsOperarProductCardMediaEmptyStateGrainClass,
} from "@/app/[siteId]/[popId]/library/layouts/layoutsOperarStyles"
import { LAYOUTS_OPERAR_DEFAULT_PRODUCT_CARD_PROPOSAL } from "@/app/[siteId]/[popId]/library/layouts/rootsyLayoutsOperarSystem"
import { SaleCatalogProductOfferOverlay } from "@/components/sale-operation/SaleCatalogProductOfferOverlay"
import { cn } from "@/lib/utils"
import { Plus } from "lucide-react"
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
  return `$ ${amount.toLocaleString("es-AR")},00`
}

/** Superficie foto ausente — sin icono ni copy; luz de estudio + grano como imagen real. */
export function LayoutsOperarProductCardMediaEmptyState({
  proposalId = LAYOUTS_OPERAR_DEFAULT_PRODUCT_CARD_PROPOSAL,
  seed = "product",
  className,
}: {
  proposalId?: LayoutsOperarProductCardProposalId
  seed?: string
  className?: string
}) {
  const layers = getLayoutsOperarProductCardMediaEmptyPhotoLayers(seed)

  return (
    <div
      className={cn(layoutsOperarProductCardMediaEmptyStateShellClass(proposalId), className)}
      role="img"
      aria-label="Producto sin fotografía"
    >
      <div style={layers.base} aria-hidden />
      <div style={layers.keyLight} aria-hidden />
      <div style={layers.colorPoolA} aria-hidden />
      <div style={layers.colorPoolB} aria-hidden />
      <div style={layers.depth} aria-hidden />
      <div style={layers.vignette} aria-hidden />
      <div className={layoutsOperarProductCardMediaEmptyStateGrainClass} aria-hidden />
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
        <LayoutsOperarProductCardMediaEmptyState proposalId={proposalId} seed={product.id} />
      ) : (
        <img
          src={product.image ?? undefined}
          alt=""
          onError={() => setImageFailed(true)}
          className="size-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
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

function LayoutsOperarProductCardProposalBody({
  product,
  variant,
  proposalId,
}: {
  product: LayoutsOperarDemoProduct
  variant: "grid" | "list"
  proposalId: LayoutsOperarProductCardProposalId
}) {
  return (
    <div className={layoutsOperarProductCardProposalBodyClass(proposalId, variant)}>
      <div className="min-h-0 self-start">
        <h3 className={layoutsOperarProductCardProposalTitleClass(proposalId)}>{product.name}</h3>
        <p className={layoutsOperarProductCardProposalDescClass(proposalId)}>{product.description}</p>
      </div>
      <div className={variant === "grid" ? "self-end" : "shrink-0"}>
        <span className={layoutsOperarProductCardProposalPriceClass(proposalId)}>
          {formatDemoPrice(product.price)}
        </span>
      </div>
    </div>
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
      className={layoutsOperarProductCardProposalGridShellClass(proposalId)}
    >
      <LayoutsOperarProductCardProposalMedia product={product} variant="grid" proposalId={proposalId} />
      <LayoutsOperarProductCardProposalBody product={product} variant="grid" proposalId={proposalId} />
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
      <LayoutsOperarProductCardProposalBody product={product} variant="list" proposalId={proposalId} />
    </button>
  )
}

