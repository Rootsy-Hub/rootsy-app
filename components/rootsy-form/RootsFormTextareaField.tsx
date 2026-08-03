"use client"

import { RootsFormField } from "@/components/rootsy-form/RootsFormField"
import { rootsFormTextareaFieldClass } from "@/components/rootsy-form/rootsFormStyles"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { useId, type ComponentProps } from "react"

type Props = {
  label: string
  id?: string
  className?: string
  textareaClassName?: string
} & Omit<ComponentProps<"textarea">, "id" | "className">

export function RootsFormTextareaField({
  label,
  id,
  className,
  textareaClassName,
  rows = 3,
  ...textareaProps
}: Props) {
  const autoId = useId()
  const fieldId = id ?? autoId

  return (
    <RootsFormField label={label} htmlFor={fieldId} className={className}>
      <Textarea
        id={fieldId}
        rows={rows}
        className={cn(rootsFormTextareaFieldClass, textareaClassName)}
        {...textareaProps}
      />
    </RootsFormField>
  )
}
