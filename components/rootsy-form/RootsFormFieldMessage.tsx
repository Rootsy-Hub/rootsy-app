"use client"

import type { RootsFormFieldMessageVariant } from "@/components/rootsy-form/rootsFormFieldAssist"
import { useRootsFormControlTone } from "@/components/rootsy-form/rootsFormFieldContext"
import { getFormAssistStyle } from "@/components/rootsy-form/rootsFormSpecRuntime"
import type { ReactNode } from "react"

export type { RootsFormFieldMessageVariant } from "@/components/rootsy-form/rootsFormFieldAssist"

type Props = {
  id?: string
  variant?: RootsFormFieldMessageVariant
  children: ReactNode
}

export function RootsFormFieldMessage({
  id,
  variant = "hint",
  children,
}: Props) {
  const tone = useRootsFormControlTone()

  return (
    <span
      id={id}
      data-slot="roots-form-field-message"
      data-variant={variant}
      style={getFormAssistStyle(variant, { tone })}
    >
      {children}
    </span>
  )
}
