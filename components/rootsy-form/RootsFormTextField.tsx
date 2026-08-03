"use client"

import { RootsFormField } from "@/components/rootsy-form/RootsFormField"
import { rootsFormTextFieldClass } from "@/components/rootsy-form/rootsFormStyles"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useId, type ComponentProps } from "react"

type Props = {
  label: string
  id?: string
  className?: string
  inputClassName?: string
} & Omit<ComponentProps<"input">, "id" | "className">

export function RootsFormTextField({
  label,
  id,
  className,
  inputClassName,
  ...inputProps
}: Props) {
  const autoId = useId()
  const fieldId = id ?? autoId

  return (
    <RootsFormField label={label} htmlFor={fieldId} className={className}>
      <Input
        id={fieldId}
        className={cn(rootsFormTextFieldClass, inputClassName)}
        {...inputProps}
      />
    </RootsFormField>
  )
}
