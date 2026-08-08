"use client"

import {
  rootsNaturePillVariantClass,
  type RootsNaturePillVariant,
} from "@/components/rootsy-pill/rootsyNaturePillStyles"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

type Props = {
  variant?: RootsNaturePillVariant
  children: ReactNode
  className?: string
  title?: string
}

export function RootsNaturePill({
  variant = "earth",
  children,
  className,
  title,
}: Props) {
  return (
    <span
      className={cn(rootsNaturePillVariantClass[variant], className)}
      title={title}
    >
      {children}
    </span>
  )
}
