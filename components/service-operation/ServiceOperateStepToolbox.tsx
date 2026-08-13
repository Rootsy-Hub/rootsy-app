"use client"

import {
  layoutsOperarToolboxProposalSlotLabelClass,
  layoutsOperarToolboxProposalSlotValueClass,
} from "@/app/library/layouts/layoutsOperarHardcodedSpec"
import { LAYOUTS_OPERAR_DEFAULT_TOOLBOX_PROPOSAL } from "@/app/library/layouts/rootsyLayoutsOperarSystem"
import {
  layoutsOperarToolboxBandClass,
  layoutsOperarToolboxBar3Class,
  layoutsOperarToolboxIconWrapClass,
  layoutsOperarToolboxSlotClass,
} from "@/app/library/layouts/layoutsOperarStyles"
import { SERVICE_OPERATE_STEP_LIST } from "@/components/service-operation/serviceOperateStepMeta"
import type { ServiceOperateStep } from "@/lib/serviceOperateSteps"
import { cn } from "@/lib/utils"

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
  /** Borde de separación hacia el contenido — arriba cuando la banda va al tope. */
  edge?: "top" | "bottom"
  className?: string
}

export function ServiceOperateStepToolbox({
  activeStep,
  onStepChange,
  slots,
  edge = "bottom",
  className,
}: Props) {
  return (
    <div className={cn(layoutsOperarToolboxBandClass, className)}>
      <div
        role="tablist"
        aria-label="Pasos del cargo"
        className={cn(
          layoutsOperarToolboxBar3Class,
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
      </div>
    </div>
  )
}
