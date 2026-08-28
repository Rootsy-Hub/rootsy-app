"use client"

import {
  layoutsOperarCheckoutFaceClass,
  layoutsOperarCheckoutFichaCopyClass,
  layoutsOperarCheckoutFichaLineClass,
  layoutsOperarCheckoutPipelineClass,
  layoutsOperarCheckoutPipelineNodeClass,
  layoutsOperarCheckoutPipelineValueClass,
  layoutsOperarCheckoutFloorOptionsClusterClass,
  layoutsOperarCheckoutFloorStepsClusterClass,
} from "@/app/library/layouts/layoutsOperarStyles"
import { RootsSemanticButton } from "@/components/rootsy-button"
import { saleOpFmt, saleOpImporteBaseClass } from "@/components/sale-operation/saleOperationStyles"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"
import { CircleDollarSign } from "lucide-react"

export type LayoutsOperarCheckoutProposal = "pipeline" | "pills" | "ficha"

export type LayoutsOperarCheckoutStep = {
  id: string
  icon: LucideIcon
  officeLabel: string
  value: string
  configured: boolean
  disabled?: boolean
  ariaLabel?: string
  onClick: () => void
}

type Props = {
  proposal: LayoutsOperarCheckoutProposal
  steps: readonly LayoutsOperarCheckoutStep[]
  options?: readonly LayoutsOperarCheckoutStep[]
  closingTotal?: number
}

function Face({
  icon: Icon,
  reading,
  className,
}: {
  icon: LucideIcon
  reading: boolean
  className?: string
}) {
  return (
    <span className={cn(layoutsOperarCheckoutFaceClass, reading && "is-reading", className)}>
      <Icon className="size-5" aria-hidden />
    </span>
  )
}

function stepAriaLabel(step: LayoutsOperarCheckoutStep) {
  if (step.ariaLabel) return step.ariaLabel
  return step.configured
    ? `${step.officeLabel}: ${step.value}`
    : `Completar ${step.officeLabel}`
}

function CheckoutOptionPills({
  steps,
  className,
}: {
  steps: readonly LayoutsOperarCheckoutStep[]
  className: string
}) {
  return (
    <div className={className}>
      {steps.map((step) => (
        <RootsSemanticButton
          key={step.id}
          type="button"
          semantic={step.configured ? "secondary" : "tertiary"}
          size="compact"
          shape="pill"
          atmosphere="eter"
          disabled={step.disabled}
          onClick={step.onClick}
          icon={step.icon}
          aria-label={stepAriaLabel(step)}
          className="min-w-0 max-w-48 shrink overflow-hidden"
        >
          <span className="min-w-0 truncate">
            {step.configured ? step.value : step.officeLabel}
          </span>
        </RootsSemanticButton>
      ))}
    </div>
  )
}

export function LayoutsOperarCheckoutSteps({
  proposal,
  steps,
  options,
  closingTotal,
}: Props) {
  if (proposal === "pills") {
    return (
      <>
        <CheckoutOptionPills
          steps={steps}
          className={layoutsOperarCheckoutFloorStepsClusterClass}
        />
        {options && options.length > 0 ? (
          <CheckoutOptionPills
            steps={options}
            className={layoutsOperarCheckoutFloorOptionsClusterClass}
          />
        ) : null}
      </>
    )
  }

  if (proposal === "ficha") {
    return (
      <>
        <div className={layoutsOperarCheckoutFichaCopyClass}>
          {steps.map((step) => (
            <p
              key={step.id}
              className={cn(
                layoutsOperarCheckoutFichaLineClass,
                step.configured && "is-reading",
              )}
            >
              {step.configured ? step.value : "—"}
            </p>
          ))}
        </div>
        {steps.map((step) => (
          <button
            key={step.id}
            type="button"
            disabled={step.disabled}
            onClick={step.onClick}
            className={cn(
              layoutsOperarCheckoutFaceClass,
              step.configured && "is-reading",
            )}
            aria-label={stepAriaLabel(step)}
          >
            <step.icon className="size-5" aria-hidden />
          </button>
        ))}
      </>
    )
  }

  return (
    <div
      className={layoutsOperarCheckoutPipelineClass}
      role="toolbar"
      aria-label="Pasos del checkout"
    >
      {steps.map((step) => (
        <button
          key={step.id}
          type="button"
          disabled={step.disabled}
          onClick={step.onClick}
          className={cn(
            layoutsOperarCheckoutPipelineNodeClass,
            step.configured && "is-reading",
          )}
          aria-label={stepAriaLabel(step)}
        >
          <Face icon={step.icon} reading={step.configured} />
          <span className={layoutsOperarCheckoutPipelineValueClass}>
            {step.configured ? step.value : step.officeLabel}
          </span>
        </button>
      ))}
      {closingTotal != null ? (
        <div className={cn(layoutsOperarCheckoutPipelineNodeClass, "is-static")}>
          <Face icon={CircleDollarSign} reading />
          <span
            className={cn(
              layoutsOperarCheckoutPipelineValueClass,
              saleOpImporteBaseClass,
            )}
          >
            {saleOpFmt.format(closingTotal)}
          </span>
        </div>
      ) : null}
    </div>
  )
}
