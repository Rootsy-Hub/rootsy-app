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
  type LayoutsOperarProductCardProposalId,
} from "@/app/library/layouts/layoutsOperarHardcodedSpec"
import {
  layoutsOperarProductCardSelectedAddClass,
  layoutsOperarProductCardSelectedClass,
} from "@/app/library/layouts/layoutsOperarStyles"
import { LayoutsOperarProductCardMediaEmptyState } from "@/app/library/layouts/LayoutsOperarProductCardProposalPrimitives"
import { LAYOUTS_OPERAR_DEFAULT_PRODUCT_CARD_PROPOSAL } from "@/app/library/layouts/rootsyLayoutsOperarSystem"
import { saleOpFmt } from "@/components/sale-operation/saleOperationStyles"
import type { ServiceOperateCatalogItem } from "@/lib/serviceOperateCatalog"
import { cn } from "@/lib/utils"
import { Check, Plus } from "lucide-react"

type Props = {
  service: ServiceOperateCatalogItem
  variant: "grid" | "lista"
  selected?: boolean
  disabled?: boolean
  onClick: () => void
  proposalId?: LayoutsOperarProductCardProposalId
}

export function ServiceOperateServiceCard({
  service,
  variant,
  selected = false,
  disabled = false,
  onClick,
  proposalId = LAYOUTS_OPERAR_DEFAULT_PRODUCT_CARD_PROPOSAL,
}: Props) {
  const isList = variant === "lista"
  const layoutVariant = isList ? "list" : "grid"
  const mediaStyle = layoutsOperarProductCardProposalMediaStyle(proposalId)

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      data-selected={selected || undefined}
      data-proposal={proposalId}
      aria-pressed={selected}
      className={cn(
        isList
          ? layoutsOperarProductCardProposalListShellClass(proposalId)
          : layoutsOperarProductCardProposalGridShellClass(proposalId),
        selected && layoutsOperarProductCardSelectedClass,
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      <div
        className={layoutsOperarProductCardProposalMediaClass(proposalId, layoutVariant)}
        style={mediaStyle}
      >
        <LayoutsOperarProductCardMediaEmptyState
          proposalId={proposalId}
          seed={service.id}
        />
        {!disabled ? (
          <span
            className={cn(
              selected
                ? layoutsOperarProductCardSelectedAddClass
                : layoutsOperarProductCardProposalAddClass(proposalId),
            )}
            aria-hidden
          >
            {selected ? (
              <Check className="size-4" strokeWidth={2.5} aria-hidden />
            ) : (
              <Plus className="size-4" strokeWidth={2.5} aria-hidden />
            )}
          </span>
        ) : null}
      </div>
      <div className={layoutsOperarProductCardProposalBodyClass(proposalId, layoutVariant)}>
        <div className="min-h-0 self-start">
          <h3 className={layoutsOperarProductCardProposalTitleClass(proposalId)}>
            {service.name}
          </h3>
          <p className={layoutsOperarProductCardProposalDescClass(proposalId)}>
            {service.billingLabel}
          </p>
        </div>
        <div className={isList ? "shrink-0" : "self-end"}>
          <span className={layoutsOperarProductCardProposalPriceClass(proposalId)}>
            {saleOpFmt.format(service.price)}
          </span>
        </div>
      </div>
    </button>
  )
}
