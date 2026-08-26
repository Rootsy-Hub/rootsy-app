"use client"

import { RootsFormField } from "@/components/rootsy-form/RootsFormField"
import type { RootsFormFieldAssistProps } from "@/components/rootsy-form/rootsFormFieldAssist"
import { useRootsFormControlTone } from "@/components/rootsy-form/rootsFormFieldContext"
import { getFormSegmentIndicatorLayoutStyle } from "@/components/rootsy-form/rootsFormSpecRuntime"
import {
  rootsFormSegmentGroupClassForTone,
  rootsFormSegmentIndicatorClassForTone,
  rootsFormSegmentOptionClassForTone,
  rootsFormSegmentSelectedSurfaceClassForTone,
} from "@/components/rootsy-form/rootsFormStyles"
import { cn } from "@/lib/utils"
import type { CSSProperties, ReactNode } from "react"
import type { RootsFormTone } from "@/app/library/ui-components/formsUiHardcodedSpec"

export type RootsFormSegmentOption = {
  value: string
  label: ReactNode
  disabled?: boolean
}

type Props = {
  label: string
  value: string
  onValueChange: (value: string) => void
  options: readonly RootsFormSegmentOption[]
  disabled?: boolean
  /** grid = columnas iguales (formulario) · inline = ancho por contenido (toolbars). */
  layout?: "grid" | "inline"
  className?: string
  groupClassName?: string
  style?: CSSProperties
  tone?: RootsFormTone
  "aria-label"?: string
} & RootsFormFieldAssistProps

function segmentGridClass(count: number) {
  switch (count) {
    case 2:
      return "grid-cols-2"
    case 3:
      return "grid-cols-3"
    case 4:
      return "grid-cols-4"
    default:
      return "grid-cols-2"
  }
}

export function RootsFormSegmentField({
  label,
  value,
  onValueChange,
  options,
  disabled,
  layout = "grid",
  className,
  groupClassName,
  style,
  tone,
  "aria-label": ariaLabel,
  hint,
  error,
  warning,
  success,
  invalid,
}: Props) {
  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  )
  const useInlineLayout = layout === "inline" || options.length > 4
  const segmentLayout = useInlineLayout ? "inline" : "grid"
  const resolvedTone = useRootsFormControlTone(tone)
  const selectedSurfaceClass = rootsFormSegmentSelectedSurfaceClassForTone(
    resolvedTone,
    segmentLayout,
  )

  return (
    <RootsFormField
      label={label}
      className={className}
      style={style}
      tone={tone}
      hint={hint}
      error={error}
      warning={warning}
      success={success}
      invalid={invalid}
    >
      <div
        role="group"
        aria-label={ariaLabel ?? label}
        className={cn(
          rootsFormSegmentGroupClassForTone(resolvedTone, segmentLayout),
          useInlineLayout
            ? "flex overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            : segmentGridClass(options.length),
          groupClassName,
        )}
      >
        {!useInlineLayout ? (
          <span
            aria-hidden
            className={rootsFormSegmentIndicatorClassForTone(resolvedTone)}
            style={getFormSegmentIndicatorLayoutStyle(options.length, selectedIndex)}
          />
        ) : null}
        {options.map((option) => {
          const isSelected = value === option.value
          const isDisabled = disabled || option.disabled

          return (
            <button
              key={option.value}
              type="button"
              disabled={isDisabled}
              aria-pressed={isSelected}
              className={cn(
                rootsFormSegmentOptionClassForTone(
                  isSelected,
                  isDisabled,
                  resolvedTone,
                ),
                useInlineLayout &&
                  "h-full shrink-0 whitespace-nowrap px-3.5",
                useInlineLayout &&
                  isSelected &&
                  cn("rounded-[8px]", selectedSurfaceClass),
              )}
              onClick={() => onValueChange(option.value)}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </RootsFormField>
  )
}
