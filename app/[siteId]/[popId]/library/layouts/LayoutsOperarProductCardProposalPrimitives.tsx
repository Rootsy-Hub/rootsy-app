"use client"

import "@/app/[siteId]/[popId]/library/layouts/layoutsOperarTheme.css"
import "@/app/[siteId]/[popId]/library/radius/rootsyRadiusSystem.css"
import {
  getLayoutsOperarGridCssVariables,
  layoutsOperarProductCardProposalAddClass,
  layoutsOperarProductCardProposalBodyClass,
  layoutsOperarProductCardProposalDescClass,
  layoutsOperarProductCardProposalGridShellClass,
  layoutsOperarProductCardProposalListShellClass,
  layoutsOperarProductCardProposalMediaClass,
  layoutsOperarProductCardProposalMediaStyle,
  layoutsOperarProductCardProposalOfferClass,
  layoutsOperarProductCardProposalPlaceholderIconClass,
  layoutsOperarProductCardProposalPlaceholderLabelClass,
  layoutsOperarProductCardProposalPlaceholderWrapClass,
  layoutsOperarProductCardProposalPriceClass,
  layoutsOperarProductCardProposalTitleClass,
  type LayoutsOperarProductCardProposalId,
} from "@/app/[siteId]/[popId]/library/layouts/layoutsOperarHardcodedSpec"
import { layoutsOperarCatalogArticleDemoScopeClass } from "@/app/[siteId]/[popId]/library/layouts/layoutsOperarStyles"
import {
  LAYOUTS_OPERAR_DEFAULT_PRODUCT_CARD_PROPOSAL,
  ROOTSY_LAYOUTS_OPERAR_PRODUCT_CARD_PROPOSALS,
} from "@/app/[siteId]/[popId]/library/layouts/rootsyLayoutsOperarSystem"
import { SaleCatalogProductOfferOverlay } from "@/components/sale-operation/SaleCatalogProductOfferOverlay"
import { cn } from "@/lib/utils"
import { ImageOff, Plus } from "lucide-react"
import { useState } from "react"

export type LayoutsOperarDemoProduct = {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  offerLabel?: string
  image: string
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

function formatDemoPrice(amount: number) {
  return `$ ${amount.toLocaleString("es-AR")},00`
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

  return (
    <div
      className={layoutsOperarProductCardProposalMediaClass(proposalId, variant)}
      style={mediaStyle}
    >
      {imageFailed ? (
        <div className={layoutsOperarProductCardProposalPlaceholderWrapClass(proposalId)} aria-hidden>
          <div className={layoutsOperarProductCardProposalPlaceholderIconClass(proposalId)}>
            <ImageOff className="size-7 stroke-[1.5]" />
          </div>
          <span className={layoutsOperarProductCardProposalPlaceholderLabelClass(proposalId)}>
            Sin imagen
          </span>
        </div>
      ) : (
        <img
          src={product.image}
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

function LayoutsOperarProductCardProposalDemo({
  proposalId,
}: {
  proposalId: LayoutsOperarProductCardProposalId
}) {
  const proposal = ROOTSY_LAYOUTS_OPERAR_PRODUCT_CARD_PROPOSALS.find((p) => p.id === proposalId)!

  return (
    <div className="space-y-2">
      <div className="space-y-1">
        <p className="text-sm font-semibold text-foreground">
          Propuesta {proposal.letter} · {proposal.title}
          {proposal.recommended ? (
            <span className="ml-2 font-normal text-[color-mix(in_srgb,var(--rootsy-savia-600)_88%,transparent)]">
              · recomendada
            </span>
          ) : null}
        </p>
        <p className="text-sm text-muted-foreground">
          <span className="font-mono text-[11px] text-foreground/80">{proposal.pairingId}</span>
          {" · "}
          {proposal.pairingLabel}
          {" — "}
          {proposal.summary}
        </p>
        <p className="text-xs leading-relaxed text-muted-foreground">{proposal.uxNote}</p>
        <p className="font-mono text-[10px] text-muted-foreground/90">
          grilla {proposal.gridHeightPx}px (media {proposal.gridMediaHeightPx}px) · lista min{" "}
          {proposal.listMinHeightPx}px · media {proposal.listMediaWidthPx}px
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <LayoutsOperarProductCardDemoCanvas className="max-w-xs">
          <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-[color-mix(in_srgb,var(--rootsy-sombra-300)_72%,transparent)]">
            2.2.a · Grilla · vertical
          </p>
          <LayoutsOperarProductCardProposalGrid product={LAYOUTS_OPERAR_DEMO_ARTICLE} proposalId={proposalId} />
        </LayoutsOperarProductCardDemoCanvas>
        <LayoutsOperarProductCardDemoCanvas>
          <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-[color-mix(in_srgb,var(--rootsy-sombra-300)_72%,transparent)]">
            2.2.b · Lista · horizontal
          </p>
          <LayoutsOperarProductCardProposalList product={LAYOUTS_OPERAR_DEMO_ARTICLE} proposalId={proposalId} />
        </LayoutsOperarProductCardDemoCanvas>
      </div>
    </div>
  )
}

export function LayoutsOperarProductCardProposalsDemo() {
  return (
    <div className="space-y-10">
      {ROOTSY_LAYOUTS_OPERAR_PRODUCT_CARD_PROPOSALS.map((proposal) => (
        <LayoutsOperarProductCardProposalDemo key={proposal.id} proposalId={proposal.id} />
      ))}
    </div>
  )
}
