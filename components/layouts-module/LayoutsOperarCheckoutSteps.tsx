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
  layoutsOperarToolboxIconWrapClass,
  layoutsOperarToolboxSlotClass,
  layoutsOperarToolboxSlotCopyClass,
  layoutsOperarToolboxSlotLabelClass,
  layoutsOperarToolboxSlotLine,
  layoutsOperarToolboxSlotLineClass,
  layoutsOperarToolboxSlotMetaClass,
} from "@/app/library/layouts/layoutsOperarStyles"
import { RootsSemanticButton } from "@/components/rootsy-button"
import { saleOpFmt, saleOpImporteBaseClass } from "@/components/sale-operation/saleOperationStyles"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"
import { Banknote, CircleDollarSign, Percent, Receipt, User } from "lucide-react"

export type LayoutsOperarCheckoutProposal = "pipeline" | "pills" | "ficha"

export type LayoutsOperarCheckoutStep = {
  id: string
  icon: LucideIcon
  officeLabel: string
  value: string
  /** Segunda línea (IVA, destino de tesorería). */
  meta?: string | null
  configured: boolean
  disabled?: boolean
  ariaLabel?: string
  onClick: () => void
}

export function layoutsOperarCheckoutPillsFromToolbox(input: {
  clienteLabel: string
  clienteMeta?: string | null
  clienteDisabled?: boolean
  clienteConfigurado?: boolean
  toolbarDisabled?: boolean
  pagoDisabled?: boolean
  comprobanteLabel: string
  comprobanteConfigurado?: boolean
  pagoLabel: string
  pagoMeta?: string | null
  pagoConfigurado: boolean
  pagoIcon?: LucideIcon
  onClienteClick: () => void
  onComprobanteClick: () => void
  onPagoClick: () => void
  discountLabel?: string
  discountConfigured?: boolean
  discountDisabled?: boolean
  onDiscountClick?: () => void
}): {
  steps: LayoutsOperarCheckoutStep[]
  options: LayoutsOperarCheckoutStep[]
} {
  const comprobanteListo =
    input.comprobanteConfigurado ?? input.comprobanteLabel !== "Sin comprobante"
  const pagoDisabled = input.pagoDisabled ?? input.toolbarDisabled
  const steps: LayoutsOperarCheckoutStep[] = [
    {
      id: "party",
      icon: User,
      officeLabel: "Cliente",
      value: input.clienteLabel,
      meta: input.clienteMeta,
      configured: Boolean(input.clienteConfigurado),
      disabled: input.clienteDisabled,
      onClick: input.onClienteClick,
    },
    {
      id: "comprobante",
      icon: Receipt,
      officeLabel: "Comprobante",
      value: input.comprobanteLabel,
      configured: comprobanteListo && !input.toolbarDisabled,
      disabled: input.toolbarDisabled,
      onClick: input.onComprobanteClick,
    },
    {
      id: "pago",
      icon: input.pagoIcon ?? Banknote,
      officeLabel: "Pago",
      value: input.pagoLabel,
      meta: input.pagoMeta,
      configured: input.pagoConfigurado,
      disabled: pagoDisabled,
      onClick: input.onPagoClick,
    },
  ]
  const options: LayoutsOperarCheckoutStep[] = input.onDiscountClick
    ? [
        {
          id: "discount",
          icon: Percent,
          officeLabel: "Descuento",
          value: input.discountLabel ?? "Descuento",
          configured: Boolean(input.discountConfigured),
          disabled: input.discountDisabled,
          onClick: input.onDiscountClick,
        },
      ]
    : []
  return { steps, options }
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
  if (!step.configured) return `Completar ${step.officeLabel}`
  return step.meta
    ? `${step.officeLabel}: ${step.value}, ${step.meta}`
    : `${step.officeLabel}: ${step.value}`
}

function CheckoutValueSlots({
  steps,
  className,
}: {
  steps: readonly LayoutsOperarCheckoutStep[]
  className: string
}) {
  return (
    <div className={className} role="toolbar" aria-label="Pasos del checkout">
      {steps.map((step) => {
        const Icon = step.icon
        const line = layoutsOperarToolboxSlotLine(
          step.officeLabel,
          step.value,
          step.configured,
        )
        return (
          <button
            key={step.id}
            type="button"
            disabled={step.disabled}
            onClick={step.onClick}
            className={cn(
              layoutsOperarToolboxSlotClass(step.configured),
              step.disabled && "cursor-not-allowed",
            )}
            aria-label={stepAriaLabel(step)}
            aria-pressed={step.configured}
          >
            <span className={layoutsOperarToolboxIconWrapClass(step.configured)}>
              <Icon className="size-5" aria-hidden />
            </span>
            <span className={layoutsOperarToolboxSlotCopyClass}>
              <span className={layoutsOperarToolboxSlotLabelClass}>
                {step.officeLabel}
              </span>
              <span className={layoutsOperarToolboxSlotLineClass}>{line}</span>
              {step.configured && step.meta ? (
                <span className={layoutsOperarToolboxSlotMetaClass}>
                  {step.meta}
                </span>
              ) : null}
            </span>
          </button>
        )
      })}
    </div>
  )
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
          atmosphere="sombra"
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
        <CheckoutValueSlots
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
