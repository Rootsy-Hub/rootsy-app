"use client"

import { RootsFormField } from "@/components/rootsy-form/RootsFormField"
import { RootsFormPrefixedInput } from "@/components/rootsy-form/RootsFormPrefixedInput"
import { usePatternInputHandlers } from "@/components/rootsy-form/usePatternInputHandlers"
import {
  formatNonNegativeIntegerInput,
  INTEGER_INPUT_MAX_LEN,
  parseNonNegativeIntegerInput,
  sanitizeNonNegativeIntegerInput,
} from "@/lib/integerInput"
import { cn } from "@/lib/utils"
import { useId, type ReactNode } from "react"

type Props = {
  label: string
  id?: string
  value: string
  onChange: (value: string) => void
  prefix?: ReactNode
  placeholder?: string
  disabled?: boolean
  invalid?: boolean
  max?: number
  className?: string
  inputClassName?: string
}

export function RootsFormQuantityField({
  label,
  id,
  value,
  onChange,
  prefix = "uds.",
  placeholder = "0",
  disabled,
  invalid,
  max = 10000,
  className,
  inputClassName,
}: Props) {
  const autoId = useId()
  const fieldId = id ?? autoId

  const { handleChange, handleFocus, handleBlur } = usePatternInputHandlers({
    value,
    onChange,
    sanitize: sanitizeNonNegativeIntegerInput,
    formatOnBlur: (current) => {
      if (!current.trim()) return ""
      const parsed = parseNonNegativeIntegerInput(current, Number.NaN)
      if (!Number.isFinite(parsed)) return ""
      return formatNonNegativeIntegerInput(Math.min(max, parsed))
    },
  })

  return (
    <RootsFormField label={label} htmlFor={fieldId} className={className}>
      <RootsFormPrefixedInput
        id={fieldId}
        prefix={prefix}
        inputMode="numeric"
        autoComplete="off"
        value={value}
        maxLength={INTEGER_INPUT_MAX_LEN}
        disabled={disabled}
        invalid={invalid}
        placeholder={placeholder}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        inputClassName={cn(inputClassName)}
      />
    </RootsFormField>
  )
}
