"use client"

import { RootsFormControlInput } from "@/components/rootsy-form/RootsFormControlInput"
import { RootsFormField } from "@/components/rootsy-form/RootsFormField"
import type { RootsFormFieldAssistProps } from "@/components/rootsy-form/rootsFormFieldAssist"
import { useRootsFormFieldControlProps } from "@/components/rootsy-form/rootsFormFieldContext"
import { usePatternInputHandlers } from "@/components/rootsy-form/usePatternInputHandlers"
import {
  formatNonNegativeIntegerInput,
  INTEGER_INPUT_MAX_LEN,
  parseNonNegativeIntegerInput,
  sanitizeNonNegativeIntegerInput,
} from "@/lib/integerInput"
import { cn } from "@/lib/utils"
import { useId } from "react"

type Props = {
  label: string
  id?: string
  value: string
  onChange: (value: string) => void
  min?: number
  max?: number
  placeholder?: string
  disabled?: boolean
  invalid?: boolean
  className?: string
  inputClassName?: string
} & RootsFormFieldAssistProps

export function RootsFormIntegerField({
  label,
  id,
  value,
  onChange,
  min = 0,
  max = 9999,
  placeholder = "0",
  disabled,
  invalid,
  hint,
  labelInfo,
  error,
  warning,
  success,
  className,
  inputClassName,
}: Props) {
  const autoId = useId()
  const fieldId = id ?? autoId
  const controlProps = useRootsFormFieldControlProps({ invalid })

  const { handleChange, handleFocus, handleBlur } = usePatternInputHandlers({
    value,
    onChange,
    sanitize: sanitizeNonNegativeIntegerInput,
    formatOnBlur: (current) => {
      if (!current.trim()) {
        return min > 0 ? formatNonNegativeIntegerInput(min) : ""
      }
      const parsed = parseNonNegativeIntegerInput(current, Number.NaN)
      if (!Number.isFinite(parsed)) {
        return min > 0 ? formatNonNegativeIntegerInput(min) : ""
      }
      return formatNonNegativeIntegerInput(
        Math.max(min, Math.min(max, parsed)),
      )
    },
  })

  return (
    <RootsFormField
      label={label}
      htmlFor={fieldId}
      className={className}
      hint={hint}
      labelInfo={labelInfo}
      error={error}
      warning={warning}
      success={success}
      invalid={invalid}
    >
      <RootsFormControlInput
        id={fieldId}
        inputMode="numeric"
        autoComplete="off"
        value={value}
        maxLength={INTEGER_INPUT_MAX_LEN}
        disabled={disabled}
        invalid={controlProps.isInvalid}
        placeholder={placeholder}
        aria-describedby={controlProps.describedBy}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        inputClassName={cn("tabular-nums", inputClassName)}
      />
    </RootsFormField>
  )
}
