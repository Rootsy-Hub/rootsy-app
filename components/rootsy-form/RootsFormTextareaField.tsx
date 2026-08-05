"use client"

import { RootsFormControlTextarea } from "@/components/rootsy-form/RootsFormControlTextarea"
import { RootsFormField } from "@/components/rootsy-form/RootsFormField"
import type { RootsFormFieldAssistProps } from "@/components/rootsy-form/rootsFormFieldAssist"
import { useRootsFormFieldControlProps } from "@/components/rootsy-form/rootsFormFieldContext"
import { useId, type ComponentProps } from "react"

type Props = {
  label: string
  id?: string
  className?: string
  textareaClassName?: string
} & RootsFormFieldAssistProps &
  Omit<ComponentProps<"textarea">, "id" | "className">

export function RootsFormTextareaField({
  label,
  id,
  className,
  textareaClassName,
  hint,
  error,
  warning,
  success,
  invalid,
  rows = 3,
  ...textareaProps
}: Props) {
  const autoId = useId()
  const fieldId = id ?? autoId
  const controlProps = useRootsFormFieldControlProps({ invalid })

  return (
    <RootsFormField
      label={label}
      htmlFor={fieldId}
      className={className}
      hint={hint}
      error={error}
      warning={warning}
      success={success}
      invalid={invalid}
    >
      <RootsFormControlTextarea
        id={fieldId}
        rows={rows}
        invalid={controlProps.isInvalid}
        disabled={textareaProps.disabled}
        className={textareaClassName}
        aria-describedby={controlProps.describedBy}
        aria-invalid={controlProps.isInvalid || undefined}
        {...textareaProps}
      />
    </RootsFormField>
  )
}
