"use client"

import { RootsFormField } from "@/components/rootsy-form/RootsFormField"
import type { RootsFormFieldAssistProps } from "@/components/rootsy-form/rootsFormFieldAssist"
import { useRootsFormFieldControlProps } from "@/components/rootsy-form/rootsFormFieldContext"
import { RootsFormSelectContent } from "@/components/rootsy-form/RootsFormSelectContent"
import { RootsFormSelectTrigger } from "@/components/rootsy-form/RootsFormSelectTrigger"
import { Select, SelectValue } from "@/components/ui/select"
import { useId, useRef, type ReactNode } from "react"

type Props = {
  label: string
  id?: string
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  invalid?: boolean
  prefix?: ReactNode
  prefixVariant?: "sunken" | "inline"
  className?: string
  triggerClassName?: string
  contentClassName?: string
  tone?: "light" | "dark"
  children: ReactNode
} & RootsFormFieldAssistProps

export function RootsFormSelectField({
  label,
  id,
  value,
  onValueChange,
  placeholder,
  disabled,
  invalid,
  hint,
  error,
  warning,
  success,
  prefix,
  prefixVariant = "sunken",
  className,
  triggerClassName,
  contentClassName,
  tone = "light",
  children,
}: Props) {
  const autoId = useId()
  const fieldId = id ?? autoId
  const hasPrefix = prefix != null
  const triggerRef = useRef<HTMLButtonElement>(null)
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
      <Select
        value={value || undefined}
        onValueChange={onValueChange}
        disabled={disabled}
        onOpenChange={(open) => {
          if (!open) {
            requestAnimationFrame(() => triggerRef.current?.blur())
          }
        }}
      >
        <RootsFormSelectTrigger
          ref={triggerRef}
          id={fieldId}
          tone={tone}
          invalid={controlProps.isInvalid}
          aria-invalid={controlProps.isInvalid}
          aria-describedby={controlProps.describedBy}
          prefixed={hasPrefix}
          prefixVariant={prefixVariant}
          leadingPrefix={hasPrefix ? prefix : undefined}
          className={triggerClassName}
        >
          <SelectValue placeholder={placeholder} />
        </RootsFormSelectTrigger>
        <RootsFormSelectContent tone={tone} className={contentClassName}>
          {children}
        </RootsFormSelectContent>
      </Select>
    </RootsFormField>
  )
}
