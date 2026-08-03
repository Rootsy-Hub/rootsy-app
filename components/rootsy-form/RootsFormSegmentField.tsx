"use client"

import { RootsFormField } from "@/components/rootsy-form/RootsFormField"
import type { RootsFormFieldAssistProps } from "@/components/rootsy-form/rootsFormFieldAssist"
import {
  rootsFormSegmentGroupClass,
  rootsFormSegmentOptionClass,
} from "@/components/rootsy-form/rootsFormStyles"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

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
  className?: string
  groupClassName?: string
  "aria-label"?: string
} & RootsFormFieldAssistProps

function segmentGridClass(count: number) {
  if (count >= 4) return "grid-cols-4"
  if (count === 3) return "grid-cols-3"
  return "grid-cols-2"
}

export function RootsFormSegmentField({
  label,
  value,
  onValueChange,
  options,
  disabled,
  className,
  groupClassName,
  "aria-label": ariaLabel,
  hint,
  error,
  warning,
  success,
  invalid,
}: Props) {
  return (
    <RootsFormField
      label={label}
      className={className}
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
          rootsFormSegmentGroupClass,
          segmentGridClass(options.length),
          groupClassName,
        )}
      >
        {options.map((option) => {
          const isSelected = value === option.value
          const isDisabled = disabled || option.disabled

          return (
            <button
              key={option.value}
              type="button"
              disabled={isDisabled}
              aria-pressed={isSelected}
              className={rootsFormSegmentOptionClass(isSelected, isDisabled)}
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
