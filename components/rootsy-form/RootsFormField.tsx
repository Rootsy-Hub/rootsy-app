"use client"

import { CheckoutSectionLabel } from "@/components/checkout/CheckoutFormFields"
import { rootsFormFieldStackClass } from "@/components/rootsy-form/rootsFormStyles"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

type Props = {
  label: string
  htmlFor?: string
  children: ReactNode
  className?: string
}

export function RootsFormField({ label, htmlFor, children, className }: Props) {
  return (
    <div className={cn(rootsFormFieldStackClass, className)}>
      <CheckoutSectionLabel htmlFor={htmlFor}>{label}</CheckoutSectionLabel>
      {children}
    </div>
  )
}
