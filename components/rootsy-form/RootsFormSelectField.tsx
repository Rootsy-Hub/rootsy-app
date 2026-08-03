"use client"

import { RootsFormField } from "@/components/rootsy-form/RootsFormField"
import { RootsFormSelectContent } from "@/components/rootsy-form/RootsFormSelectContent"
import { RootsFormSelectTrigger } from "@/components/rootsy-form/RootsFormSelectTrigger"
import { rootsFormAffixPrefixClass } from "@/components/rootsy-form/rootsFormStyles"
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
  className?: string
  triggerClassName?: string
  contentClassName?: string
  children: ReactNode
}

export function RootsFormSelectField({
  label,
  id,
  value,
  onValueChange,
  placeholder,
  disabled,
  invalid,
  prefix,
  className,
  triggerClassName,
  contentClassName,
  children,
}: Props) {
  const autoId = useId()
  const fieldId = id ?? autoId
  const hasPrefix = prefix != null
  const triggerRef = useRef<HTMLButtonElement>(null)

  return (
    <RootsFormField label={label} htmlFor={fieldId} className={className}>
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
          aria-invalid={invalid}
          prefixed={hasPrefix}
          className={triggerClassName}
        >
          {hasPrefix ? (
            <span className={rootsFormAffixPrefixClass} aria-hidden>
              {prefix}
            </span>
          ) : null}
          <SelectValue placeholder={placeholder} />
        </RootsFormSelectTrigger>
        <RootsFormSelectContent className={contentClassName}>
          {children}
        </RootsFormSelectContent>
      </Select>
    </RootsFormField>
  )
}
