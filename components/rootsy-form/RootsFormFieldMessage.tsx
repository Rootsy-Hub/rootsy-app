"use client"

import type { RootsFormFieldMessageVariant } from "@/components/rootsy-form/rootsFormFieldAssist"
import {
  rootsFormFieldErrorClass,
  rootsFormFieldHintClass,
  rootsFormFieldSuccessClass,
  rootsFormFieldWarningClass,
} from "@/components/rootsy-form/rootsFormStyles"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

export type { RootsFormFieldMessageVariant } from "@/components/rootsy-form/rootsFormFieldAssist"

const variantClass: Record<RootsFormFieldMessageVariant, string> = {
  hint: rootsFormFieldHintClass,
  error: rootsFormFieldErrorClass,
  warning: rootsFormFieldWarningClass,
  success: rootsFormFieldSuccessClass,
}

type Props = {
  id?: string
  variant?: RootsFormFieldMessageVariant
  children: ReactNode
  className?: string
}

export function RootsFormFieldMessage({
  id,
  variant = "hint",
  children,
  className,
}: Props) {
  return (
    <p
      id={id}
      data-slot="roots-form-field-message"
      data-variant={variant}
      className={cn(variantClass[variant], className)}
    >
      {children}
    </p>
  )
}
