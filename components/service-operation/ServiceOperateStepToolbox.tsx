"use client"

import {
  layoutsOperarToolboxBandClass,
  layoutsOperarToolboxBarGridClass,
  layoutsOperarToolboxIconWrapClass,
  layoutsOperarToolboxSlotClass,
  layoutsOperarToolboxSlotCopyClass,
  layoutsOperarToolboxSlotLabelClass,
  layoutsOperarToolboxSlotLine,
  layoutsOperarToolboxSlotLineClass,
} from "@/app/library/layouts/layoutsOperarStyles"
import { LayoutsOperarToolboxFloor } from "@/components/layouts-module/LayoutsOperarToolboxFloor"
import { saleOpImporteBaseClass } from "@/components/sale-operation/saleOperationStyles"
import { SERVICE_OPERATE_STEP_LIST } from "@/components/service-operation/serviceOperateStepMeta"
import type { ServiceOperateStep } from "@/lib/serviceOperateSteps"
import { cn } from "@/lib/utils"
import { Percent } from "lucide-react"

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
  const descuentoLine = layoutsOperarToolboxSlotLine("Descuento", descuentoLabel, hayDescuento)

  return (
    <LayoutsOperarToolboxFloor
      className={cn(
        edge === "top" &&
          "border-t-0 border-b border-(--layouts-operar-border-dark-default)",
        className,
      )}
    >
      <div
        role="toolbar"
        aria-label="Pasos y descuento del cargo"
        className={cn(layoutsOperarToolboxBandClass, layoutsOperarToolboxBarGridClass)}
      >
        {SERVICE_OPERATE_STEP_LIST.map(({ step, label }) => {
          const slot = slots.find((entry) => entry.step === step)
          const value = slot?.value ?? label
          const configured = slot?.configured ?? false
          const disabled = slot?.disabled ?? false
          const selected = activeStep === step
          const line = layoutsOperarToolboxSlotLine(label, value, configured)

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
              <span className={layoutsOperarToolboxSlotCopyClass}>
                <span className={layoutsOperarToolboxSlotLabelClass}>{label}</span>
                <span className={layoutsOperarToolboxSlotLineClass}>{line}</span>
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
            <Percent className="size-5" aria-hidden />
          </span>
          <span className={layoutsOperarToolboxSlotCopyClass}>
            <span className={layoutsOperarToolboxSlotLabelClass}>Descuento</span>
            <span
              className={cn(
                layoutsOperarToolboxSlotLineClass,
                hayDescuento && saleOpImporteBaseClass,
              )}
            >
              {descuentoLine}
            </span>
          </span>
        </button>
      </div>
    </LayoutsOperarToolboxFloor>
  )
}
