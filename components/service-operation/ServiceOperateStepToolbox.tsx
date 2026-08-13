"use client"

import {
  layoutsOperarToolboxProposalSlotLabelClass,
  layoutsOperarToolboxProposalSlotValueClass,
} from "@/app/library/layouts/layoutsOperarHardcodedSpec"
import { LAYOUTS_OPERAR_DEFAULT_TOOLBOX_PROPOSAL } from "@/app/library/layouts/rootsyLayoutsOperarSystem"
import {
  layoutsOperarToolboxBandClass,
  layoutsOperarToolboxBarClass,
  layoutsOperarToolboxIconWrapClass,
  layoutsOperarToolboxSlotClass,
} from "@/app/library/layouts/layoutsOperarStyles"
import { saleOpImporteBaseClass } from "@/components/sale-operation/saleOperationStyles"
import { SERVICE_OPERATE_STEP_LIST } from "@/components/service-operation/serviceOperateStepMeta"
import type { ServiceOperateStep } from "@/lib/serviceOperateSteps"
import { cn } from "@/lib/utils"
import { Percent } from "lucide-react"

const TOOLBOX_PROPOSAL = LAYOUTS_OPERAR_DEFAULT_TOOLBOX_PROPOSAL

type StepSlot = {
  step: ServiceOperateStep
  value: string
  configured: boolean
  disabled?: boolean
}

type Props = {
  activeStep: ServiceOperateStep
  onStepChange: (step: ServiceOperateStep) => void
  slots: StepSlot[]
  descuentoLabel: string
  hayDescuento: boolean
  descuentoDisabled?: boolean
  onDescuentoClick: () => void
  /** Borde de separación hacia el contenido — arriba cuando la banda va al tope. */
  edge?: "top" | "bottom"
  className?: string
}

export function ServiceOperateStepToolbox({
  activeStep,
  onStepChange,
  slots,
  descuentoLabel,
  hayDescuento,
  descuentoDisabled = false,
  onDescuentoClick,
  edge = "bottom",
  className,
}: Props) {
  return (
    <div className={cn(layoutsOperarToolboxBandClass, className)}>
      <div
        role="toolbar"
        aria-label="Pasos y descuento del cargo"
        className={cn(
          layoutsOperarToolboxBarClass,
          edge === "top" &&
            "border-t-0 border-b border-[var(--layouts-operar-border-dark-default)]",
        )}
      >
        {SERVICE_OPERATE_STEP_LIST.map(({ step, label }) => {
          const slot = slots.find((entry) => entry.step === step)
          const value = slot?.value ?? label
          const configured = slot?.configured ?? false
          const disabled = slot?.disabled ?? false
          const selected = activeStep === step

          return (
            <button
              key={step}
              type="button"
              role="tab"
              aria-selected={selected}
              disabled={disabled}
              onClick={() => onStepChange(step)}
              className={cn(
                layoutsOperarToolboxSlotClass(configured, selected),
                disabled && "opacity-45",
              )}
              aria-label={`Paso ${step} — ${label}: ${value}`}
            >
              <span
                className={cn(
                  layoutsOperarToolboxIconWrapClass(configured),
                  "text-sm font-bold tabular-nums tracking-tight",
                )}
                aria-hidden
              >
                {step}
              </span>
              <span className="min-w-0 flex-1">
                <span
                  className={layoutsOperarToolboxProposalSlotLabelClass(TOOLBOX_PROPOSAL)}
                >
                  {label}
                </span>
                <span
                  className={layoutsOperarToolboxProposalSlotValueClass(
                    TOOLBOX_PROPOSAL,
                    configured,
                  )}
                >
                  {value}
                </span>
              </span>
            </button>
          )
        })}

        <button
          type="button"
          disabled={descuentoDisabled}
          onClick={onDescuentoClick}
          className={cn(
            layoutsOperarToolboxSlotClass(hayDescuento),
            descuentoDisabled && "opacity-45",
          )}
          aria-label={`Descuento: ${descuentoLabel}${descuentoDisabled ? " (bloqueado)" : ""}`}
        >
          <span className={layoutsOperarToolboxIconWrapClass(hayDescuento)}>
            <Percent className="size-4.5 sm:size-5" aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className={layoutsOperarToolboxProposalSlotLabelClass(TOOLBOX_PROPOSAL)}>
              Descuento
            </span>
            <span
              className={cn(
                layoutsOperarToolboxProposalSlotValueClass(TOOLBOX_PROPOSAL, hayDescuento),
                hayDescuento && saleOpImporteBaseClass,
              )}
            >
              {descuentoLabel}
            </span>
          </span>
        </button>
      </div>
    </div>
  )
}
