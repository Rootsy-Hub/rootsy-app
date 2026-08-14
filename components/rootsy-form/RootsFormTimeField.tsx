"use client"

import { RootsFormControlInput } from "@/components/rootsy-form/RootsFormControlInput"
import { RootsFormField } from "@/components/rootsy-form/RootsFormField"
import type { RootsFormFieldAssistProps } from "@/components/rootsy-form/rootsFormFieldAssist"
import { useRootsFormFieldControlProps } from "@/components/rootsy-form/rootsFormFieldContext"
import { normalizeTimeHHmmOrDefault } from "@/lib/rootsFormTimeFormat"
import { cn } from "@/lib/utils"
import { useId, type ChangeEventHandler } from "react"

type Props = {
  label: string
  id?: string
  value: string
  onChange: (value: string) => void
  fallbackValue?: string
  disabled?: boolean
  readOnly?: boolean
  invalid?: boolean
  className?: string
  inputClassName?: string
  step?: number
} & RootsFormFieldAssistProps

export function RootsFormTimeField({
  label,
  id,
  value,
  onChange,
  fallbackValue = "00:00",
  disabled,
  readOnly,
  invalid,
  hint,
  labelInfo,
  error,
  warning,
  success,
  className,
  inputClassName,
  step = 60,
}: Props) {
  const autoId = useId()
  const fieldId = id ?? autoId
  const controlProps = useRootsFormFieldControlProps({ invalid })
  const normalizedValue = normalizeTimeHHmmOrDefault(value, fallbackValue)

  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    onChange(normalizeTimeHHmmOrDefault(event.target.value, fallbackValue))
  }

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
        type="time"
        step={step}
        value={normalizedValue}
        onChange={handleChange}
        disabled={disabled}
        readOnly={readOnly}
        invalid={controlProps.isInvalid}
        aria-describedby={controlProps.describedBy}
        aria-invalid={controlProps.isInvalid || undefined}
        inputClassName={cn("tabular-nums", inputClassName)}
        className="w-full max-w-[8.5rem]"
      />
    </RootsFormField>
  )
}
