"use client"

import { ROOTSY_LAYOUTS_TABLES_CHROME } from "@/app/[siteId]/[popId]/library/layouts/rootsyLayoutsTablesSystem"
import type { ReactNode } from "react"

type Props = {
  className?: string
  contentClassName?: string
  style?: React.CSSProperties
  contentStyle?: React.CSSProperties
  /** Bloque vacío (solo degradé sombra). */
  bare?: boolean
  children?: ReactNode
}

export function LayoutsTablesNightForestSurface({
  className,
  contentClassName,
  style,
  contentStyle,
  bare = false,
  children,
}: Props) {
  const shellStyle: React.CSSProperties = {
    background: ROOTSY_LAYOUTS_TABLES_CHROME.headerBackground,
    ...style,
  }

  if (bare) {
    return <div className={className} style={shellStyle} aria-hidden />
  }

  return (
    <div className={className} style={shellStyle}>
      <div className={contentClassName} style={contentStyle}>
        {children}
      </div>
    </div>
  )
}
