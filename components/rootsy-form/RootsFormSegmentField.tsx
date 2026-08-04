"use client"

import { RootsFormField } from "@/components/rootsy-form/RootsFormField"
import type { RootsFormFieldAssistProps } from "@/components/rootsy-form/rootsFormFieldAssist"
import {
  rootsFormSegmentGroupClass,
  rootsFormSegmentIndicatorClass,
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

function segmentIndicatorStyle(optionCount: number, selectedIndex: number) {
  const inset = 0.25 // p-1
  const gap = 0.25 // gap-1
  const gapsTotal = (optionCount - 1) * gap

  return {
    top: `${inset}rem`,
    bottom: `${inset}rem`,
    left: `${inset}rem`,
    width: `calc((100% - ${inset * 2}rem - ${gapsTotal}rem) / ${optionCount})`,
    transform: `translateX(calc(${selectedIndex} * (100% + ${gap}rem)))`,
  }
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
  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  )
  const useScrollLayout = options.length > 4

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
          useScrollLayout
            ? "flex overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            : segmentGridClass(options.length),
          groupClassName,
        )}
      >
        {!useScrollLayout ? (
          <span
            aria-hidden
            className={rootsFormSegmentIndicatorClass}
            style={segmentIndicatorStyle(options.length, selectedIndex)}
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
                rootsFormSegmentOptionClass(isSelected, isDisabled),
                useScrollLayout &&
                  "h-full shrink-0 whitespace-nowrap px-3.5",
                useScrollLayout &&
                  isSelected &&
                  "bg-white shadow-sm",
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
