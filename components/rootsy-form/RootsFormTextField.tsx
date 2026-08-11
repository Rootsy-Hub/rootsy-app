"use client"

import { RootsFormControlInput } from "@/components/rootsy-form/RootsFormControlInput"
import { RootsFormField } from "@/components/rootsy-form/RootsFormField"
import type { RootsFormFieldAssistProps } from "@/components/rootsy-form/rootsFormFieldAssist"
import { useRootsFormFieldControlProps } from "@/components/rootsy-form/rootsFormFieldContext"
import { cn } from "@/lib/utils"
import { forwardRef, useId, type ComponentProps } from "react"

type Props = {
  label: string
  id?: string
  className?: string
  inputClassName?: string
} & RootsFormFieldAssistProps &
  Omit<ComponentProps<"input">, "id" | "className">

export const RootsFormTextField = forwardRef<HTMLInputElement, Props>(
  function RootsFormTextField(
    {
      label,
      id,
      className,
      inputClassName,
      hint,
      labelInfo,
      error,
      warning,
      success,
      invalid,
      ...inputProps
    },
    ref,
  ) {
    const autoId = useId()
    const fieldId = id ?? autoId
    const controlProps = useRootsFormFieldControlProps({ invalid })

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
          ref={ref}
          id={fieldId}
          invalid={controlProps.isInvalid}
          disabled={inputProps.disabled}
          className={inputClassName}
          aria-describedby={controlProps.describedBy}
          aria-invalid={controlProps.isInvalid || undefined}
          {...inputProps}
        />
      </RootsFormField>
    )
  },
)
