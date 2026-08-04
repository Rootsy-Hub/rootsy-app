"use client"

import { RootsFormField } from "@/components/rootsy-form/RootsFormField"
import type { RootsFormFieldAssistProps } from "@/components/rootsy-form/rootsFormFieldAssist"
import { useRootsFormFieldControlProps } from "@/components/rootsy-form/rootsFormFieldContext"
import { rootsFormTextFieldClass } from "@/components/rootsy-form/rootsFormStyles"
import { Input } from "@/components/ui/input"
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
        error={error}
        warning={warning}
        success={success}
        invalid={invalid}
      >
        <Input
          ref={ref}
          id={fieldId}
          className={cn(rootsFormTextFieldClass, inputClassName)}
          aria-describedby={controlProps.describedBy}
          aria-invalid={controlProps.isInvalid || undefined}
          {...inputProps}
        />
      </RootsFormField>
    )
  },
)
