"use client"

import { RootsFormField } from "@/components/rootsy-form/RootsFormField"
import type { RootsFormFieldAssistProps } from "@/components/rootsy-form/rootsFormFieldAssist"
import { useRootsFormFieldControlProps } from "@/components/rootsy-form/rootsFormFieldContext"
import { RootsFormPrefixedInput } from "@/components/rootsy-form/RootsFormPrefixedInput"
import { useId, type ComponentProps } from "react"

type Props = {
  label?: string
  id?: string
  countryPrefix?: string
  className?: string
  inputClassName?: string
} & RootsFormFieldAssistProps &
  Omit<
    ComponentProps<typeof RootsFormPrefixedInput>,
    "id" | "prefix" | "className" | "inputClassName" | "type"
  >

/** Teléfono con prefijo de país (Argentina: +54). */
export function RootsFormPhoneField({
  label = "Teléfono",
  id,
  countryPrefix = "+54",
  className,
  inputClassName,
  hint,
  error,
  warning,
  success,
  invalid,
  ...inputProps
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
      <RootsFormPrefixedInput
        id={fieldId}
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        prefix={countryPrefix}
        invalid={controlProps.isInvalid}
        aria-describedby={controlProps.describedBy}
        inputClassName={inputClassName}
        placeholder="3704 708043"
        {...inputProps}
      />
    </RootsFormField>
  )
}
