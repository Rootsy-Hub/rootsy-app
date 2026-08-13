"use client"

import { RootsFormField } from "@/components/rootsy-form/RootsFormField"
import type { RootsFormFieldAssistProps } from "@/components/rootsy-form/rootsFormFieldAssist"
import { useRootsFormFieldControlProps, useRootsFormControlTone } from "@/components/rootsy-form/rootsFormFieldContext"
import { RootsFormSelectContent } from "@/components/rootsy-form/RootsFormSelectContent"
import { RootsFormSelectTrigger } from "@/components/rootsy-form/RootsFormSelectTrigger"
import { RootsFormSelectValue } from "@/components/rootsy-form/RootsFormSelectValue"
import { Select } from "@/components/ui/select"
import { useId, type ReactNode } from "react"

type Props = {
  label: string
  id?: string
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  readOnly?: boolean
  invalid?: boolean
  prefix?: ReactNode
  prefixVariant?: "sunken" | "inline"
  className?: string
  triggerClassName?: string
  contentClassName?: string
  tone?: "light" | "dark"
  /** Texto forzado en el trigger (p. ej. rango custom dinámico). */
  valueLabel?: ReactNode
  onOpenChange?: (open: boolean) => void
  children: ReactNode
} & RootsFormFieldAssistProps

export function RootsFormSelectField({
  label,
  id,
  value,
  onValueChange,
  placeholder,
  disabled,
  readOnly,
  invalid,
  hint,
  labelInfo,
  error,
  warning,
  success,
  prefix,
  prefixVariant = "sunken",
  className,
  triggerClassName,
  contentClassName,
  tone,
  valueLabel,
  onOpenChange,
  children,
}: Props) {
  const autoId = useId()
  const fieldId = id ?? autoId
  const hasPrefix = prefix != null
  const resolvedTone = useRootsFormControlTone(tone)
  const controlProps = useRootsFormFieldControlProps({ invalid })

  const handleValueChange = (next: string) => {
    if (readOnly) return
    // Deferir navegación/re-render del padre hasta que Radix cierre el portal.
    window.setTimeout(() => onValueChange(next), 0)
  }

  return (
    <RootsFormField
      label={label}
      htmlFor={fieldId}
      className={className}
      labelInfo={labelInfo}
      hint={hint}
      error={error}
      warning={warning}
      success={success}
      invalid={invalid}
      tone={resolvedTone}
    >
      <Select
        value={value || undefined}
        onValueChange={handleValueChange}
        onOpenChange={(open) => {
          if (readOnly && open) return
          onOpenChange?.(open)
        }}
        disabled={disabled}
      >
        <RootsFormSelectTrigger
          id={fieldId}
          tone={resolvedTone}
          readOnly={readOnly}
          invalid={controlProps.isInvalid}
          aria-invalid={controlProps.isInvalid}
          aria-describedby={controlProps.describedBy}
          prefixed={hasPrefix}
          prefixVariant={prefixVariant}
          leadingPrefix={hasPrefix ? prefix : undefined}
          className={triggerClassName}
        >
          <RootsFormSelectValue placeholder={placeholder}>
            {valueLabel}
          </RootsFormSelectValue>
        </RootsFormSelectTrigger>
        <RootsFormSelectContent tone={resolvedTone} className={contentClassName}>
          {children}
        </RootsFormSelectContent>
      </Select>
    </RootsFormField>
  )
}
