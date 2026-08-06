"use client"

import {
  workspaceTableLayoutThumbnailLgClass,
  workspaceTableLayoutThumbnailPlaceholderClass,
  workspaceTableLayoutThumbnailSmClass,
} from "@/components/data-workspace/dataWorkspaceTablesLayout"
import { cn } from "@/lib/utils"
import { ImagePlus } from "lucide-react"

const sizeClass = {
  sm: workspaceTableLayoutThumbnailSmClass,
  lg: workspaceTableLayoutThumbnailLgClass,
} as const

const iconClass = {
  sm: "size-3.5",
  lg: "size-5",
} as const

/** Placeholder visual compartido para celdas de tabla y estados vacíos del catálogo. */
export function ArticleCatalogImagePlaceholder({
  size = "lg",
  className,
}: {
  size?: keyof typeof sizeClass
  className?: string
}) {
  return (
    <div
      className={cn(workspaceTableLayoutThumbnailPlaceholderClass, sizeClass[size], className)}
      aria-hidden
    >
      <ImagePlus className={iconClass[size]} strokeWidth={1.75} />
    </div>
  )
}
