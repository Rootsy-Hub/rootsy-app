"use client"

import { dataWorkspaceHeaderSurfaceClass } from "@/components/layouts/dataWorkspaceHeaderStyles"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

const HEADER_VARIANT = "dark" as const

type Props = {
  className?: string
  contentClassName?: string
  /** Bloque vacío (solo degradé bosque nocturno). */
  bare?: boolean
  children?: ReactNode
}

export function LayoutsTablesNightForestSurface({
  className,
  contentClassName,
  bare = false,
  children,
}: Props) {
  const surfaceClass = dataWorkspaceHeaderSurfaceClass(HEADER_VARIANT)

  if (bare) {
    return <div className={cn(surfaceClass, className)} aria-hidden />
  }

  return (
    <div className={cn(surfaceClass, className)}>
      <div className={cn(contentClassName)}>{children}</div>
    </div>
  )
}
