"use client"

import { MenuHeaderEntity } from "@/app/[siteId]/[popId]/menu/MenuHeaderEntity"
import { layoutsOperarToolboxFloorClass } from "@/app/library/layouts/layoutsOperarStyles"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

type Props = {
  children: ReactNode
  className?: string
}

/**
 * Bloque de fondo del toolbox — tierra mojada del design system
 * (mismo chrome que el footer de listados: MenuHeaderEntity as=footer).
 */
export function LayoutsOperarToolboxFloor({ children, className }: Props) {
  return (
    <MenuHeaderEntity
      as="footer"
      size="dialog"
      className={cn(layoutsOperarToolboxFloorClass, className)}
    >
      {children}
    </MenuHeaderEntity>
  )
}
