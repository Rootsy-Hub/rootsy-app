"use client"

import {
  menuHeaderBorderClass,
  menuHeaderChromeClass,
} from "@/app/[siteId]/[popId]/menu/menuFloatingPillStyles"
import { menuNatureShellClass } from "@/app/[siteId]/[popId]/menu/menuNatureStyles"
import "@/app/[siteId]/[popId]/menu/menuNaturePalette.css"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

type Props = {
  className?: string
  borderTop?: boolean
  borderBottom?: boolean
  children: ReactNode
}

/** Barra cristal oscura + blur — igual que el header del menú POP. */
export function PopGlassChrome({
  className,
  borderTop = false,
  borderBottom = false,
  children,
}: Props) {
  return (
    <div
      className={cn(
        "relative text-zinc-100",
        menuNatureShellClass,
        menuHeaderChromeClass,
        borderTop && cn("border-t", menuHeaderBorderClass),
        borderBottom && cn("border-b", menuHeaderBorderClass),
        className,
      )}
    >
      <div className="relative z-10 h-full min-h-0">{children}</div>
    </div>
  )
}
