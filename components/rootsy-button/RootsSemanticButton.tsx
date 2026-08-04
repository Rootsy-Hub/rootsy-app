"use client"

import {
  rootsButtonClassForVariant,
  rootsButtonVariant,
  type RootsButtonSemanticVariant,
} from "@/components/rootsy-button/rootsButtonStyles"
import { saleOpDialogDestructiveBtn, saleOpDialogPrimaryBtn } from "@/components/sale-operation/saleOperationStyles"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { ComponentProps } from "react"

type Props = Omit<ComponentProps<typeof Button>, "variant"> & {
  semantic?: RootsButtonSemanticVariant
}

function classForSemantic(semantic: RootsButtonSemanticVariant, className?: string) {
  switch (semantic) {
    case "primary":
      return cn(saleOpDialogPrimaryBtn, rootsButtonClassForVariant("primary"), className)
    case "destructive":
      return cn(saleOpDialogDestructiveBtn, className)
    case "secondary":
      return rootsButtonClassForVariant("secondary", className)
    case "tertiary":
      return rootsButtonClassForVariant("tertiary", className)
    default:
      return className
  }
}

function variantForSemantic(semantic: RootsButtonSemanticVariant) {
  return rootsButtonVariant[semantic]
}

/** Botón con appearance semántico del design system — preferir sobre Button suelto. */
export function RootsSemanticButton({
  semantic = "primary",
  className,
  ...props
}: Props) {
  return (
    <Button
      variant={variantForSemantic(semantic) as "default"}
      className={classForSemantic(semantic, className)}
      {...props}
    />
  )
}

export function RootsPrimaryButton(props: Omit<Props, "semantic">) {
  return <RootsSemanticButton semantic="primary" {...props} />
}

export function RootsSubtleButton(props: Omit<Props, "semantic">) {
  return <RootsSemanticButton semantic="tertiary" {...props} />
}

export function RootsDefaultButton(props: Omit<Props, "semantic">) {
  return <RootsSemanticButton semantic="secondary" {...props} />
}

export function RootsDangerButton(props: Omit<Props, "semantic">) {
  return <RootsSemanticButton semantic="destructive" {...props} />
}
