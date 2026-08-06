"use client"

import * as SelectPrimitive from "@radix-ui/react-select"
import type { ComponentProps, ReactNode } from "react"

type Props = ComponentProps<typeof SelectPrimitive.Value>

/** Placeholder estable (span) — evita removeChild con traducción / reconciliación React. */
function stablePlaceholder(placeholder: Props["placeholder"]): ReactNode {
  if (placeholder == null || placeholder === "") return undefined
  if (typeof placeholder === "string") {
    return <span>{placeholder}</span>
  }
  return placeholder
}

export function RootsFormSelectValue({ placeholder, ...props }: Props) {
  return (
    <SelectPrimitive.Value
      data-slot="select-value"
      translate="no"
      placeholder={stablePlaceholder(placeholder)}
      {...props}
    />
  )
}
