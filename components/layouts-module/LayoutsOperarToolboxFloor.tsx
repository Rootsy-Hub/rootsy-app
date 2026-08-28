"use client"

import { layoutsOperarToolboxFloorClass } from "@/app/library/layouts/layoutsOperarStyles"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

type Props = {
  children: ReactNode
  className?: string
}

/**
 * Piso del toolbox — 79px, luz filtrada, hairline superior 200.
 */
export function LayoutsOperarToolboxFloor({ children, className }: Props) {
  return <div className={cn(layoutsOperarToolboxFloorClass, className)}>{children}</div>
}
