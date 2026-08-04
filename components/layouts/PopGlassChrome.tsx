"use client"

import { menuNatureShellClass, menuPopChromeClass } from "@/app/[siteId]/[popId]/menu/menuNatureStyles"
import "@/app/[siteId]/[popId]/menu/menuNaturePalette.css"
import {
  popHeaderGlassBorderClass,
  popHeaderGlassClass,
} from "@/components/layouts/popHeaderBackdropStyles"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

type Props = {
  className?: string
  borderTop?: boolean
  borderBottom?: boolean
  children: ReactNode
}

/** Barra cristal oscura + blur — deja ver el fondo POP de la página (como el header del menú). */
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
        menuPopChromeClass,
        popHeaderGlassClass,
        borderTop && cn("border-t", popHeaderGlassBorderClass),
        borderBottom && cn("border-b", popHeaderGlassBorderClass),
        className,
      )}
    >
      <div className="relative z-10 h-full min-h-0">{children}</div>
    </div>
  )
}
