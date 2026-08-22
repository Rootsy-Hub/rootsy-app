"use client"

import {
  listActiveFiltersBarClass,
  listActiveFiltersCountBadgeClass,
  listBulkToolbarClearButtonClass,
  toolbarBlockLabelClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import { RootsSubtleButton } from "@/components/rootsy-button"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

type Props = {
  activeCount: number
  onClearAll: () => void
  children: ReactNode
  className?: string
}

export function DataWorkspaceListActiveFiltersBar({
  activeCount,
  onClearAll,
  children,
  className,
}: Props) {
  return (
    <div
      className={cn(listActiveFiltersBarClass, className)}
      role="region"
      aria-label="Filtros activos"
    >
      <div className="flex shrink-0 items-center gap-1.5">
        <p className={cn(toolbarBlockLabelClass, "max-md:hidden")}>
          Filtros activos
          <span className="sr-only">: {activeCount}</span>
        </p>
        <span className={listActiveFiltersCountBadgeClass} aria-hidden>
          {activeCount}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {children}
        <RootsSubtleButton
          type="button"
          size="compact"
          className={listBulkToolbarClearButtonClass}
          onClick={onClearAll}
        >
          Limpiar todo
        </RootsSubtleButton>
      </div>
    </div>
  )
}
