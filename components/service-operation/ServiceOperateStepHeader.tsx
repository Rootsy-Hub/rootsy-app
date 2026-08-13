"use client"

import { SERVICE_OPERATE_STEP_META } from "@/components/service-operation/serviceOperateStepMeta"
import {
  layoutsOperarStepContextBarClass,
  layoutsOperarStepContextLabelClass,
  layoutsOperarStepContextNavButtonClass,
  layoutsOperarStepContextSeparatorClass,
  layoutsOperarStepContextSummaryClass,
} from "@/app/library/layouts/layoutsOperarStyles"
import type { ServiceOperateStep } from "@/lib/serviceOperateSteps"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight } from "lucide-react"

type Props = {
  step: ServiceOperateStep
  summary: string
  className?: string
  onBack?: () => void
  onNext?: () => void
}

function StepContextNavButton({
  direction,
  disabled,
  onClick,
}: {
  direction: "back" | "forward"
  disabled: boolean
  onClick?: () => void
}) {
  const Icon = direction === "back" ? ChevronLeft : ChevronRight

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={layoutsOperarStepContextNavButtonClass}
      aria-label={direction === "back" ? "Paso anterior" : "Paso siguiente"}
    >
      <Icon className="size-5" aria-hidden />
    </button>
  )
}

function CompactStepContext({
  step,
  summary,
}: {
  step: ServiceOperateStep
  summary: string
}) {
  const meta = SERVICE_OPERATE_STEP_META[step]

  return (
    <div className="flex min-w-0 flex-1 items-baseline gap-2">
      <span className={layoutsOperarStepContextLabelClass}>{meta.label}</span>
      <span className={layoutsOperarStepContextSeparatorClass} aria-hidden>
        ·
      </span>
      <span className={layoutsOperarStepContextSummaryClass} title={summary}>
        {summary}
      </span>
    </div>
  )
}

export function ServiceOperateStepHeader({
  step,
  summary,
  className,
  onBack,
  onNext,
}: Props) {
  const canGoBack = step > 1 && Boolean(onBack)
  const canGoNext = step < 3 && Boolean(onNext)

  return (
    <div className={cn(layoutsOperarStepContextBarClass, className)}>
      <StepContextNavButton
        direction="back"
        disabled={!canGoBack}
        onClick={canGoBack ? onBack : undefined}
      />

      <CompactStepContext step={step} summary={summary} />

      <StepContextNavButton
        direction="forward"
        disabled={!canGoNext}
        onClick={canGoNext ? onNext : undefined}
      />
    </div>
  )
}
