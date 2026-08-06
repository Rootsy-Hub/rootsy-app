"use client"

import "@/app/[siteId]/[popId]/library/layouts/layoutsOperarTheme.css"
import "@/app/[siteId]/[popId]/library/radius/rootsyRadiusSystem.css"
import type { ReactNode } from "react"

type Props = {
  children: ReactNode
}

/** Preview estático pantalla completa — sin module shell; el draft trae header operar. */
export function LayoutsOperarPreviewShell({ children }: Props) {
  return (
    <div className="rootsy-theme-pos rootsy-radius-system flex min-h-svh flex-col bg-[var(--rootsy-sombra-950)]">
      {children}
    </div>
  )
}
