"use client"

import { layoutsOperarToolboxFloorClass } from "@/app/library/layouts/layoutsOperarStyles"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

type Props = {
  children: ReactNode
  className?: string
}

/**
 * Bloque de fondo del toolbox — mundo Sombra (canvas del catálogo).
 */
export function LayoutsOperarToolboxFloor({ children, className }: Props) {
  return <div className={cn(layoutsOperarToolboxFloorClass, className)}>{children}</div>
}
