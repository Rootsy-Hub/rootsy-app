"use client"

import { layoutsOperarToolboxFloorClass } from "@/app/library/layouts/layoutsOperarStyles"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

type Props = {
  children: ReactNode
  className?: string
}

/**
 * Bloque de fondo del toolbox — barro más oscuro que el slot idle.
 * Sin savia: el verde queda solo en el brote del botón configurado.
 */
export function LayoutsOperarToolboxFloor({ children, className }: Props) {
  return <div className={cn(layoutsOperarToolboxFloorClass, className)}>{children}</div>
}
