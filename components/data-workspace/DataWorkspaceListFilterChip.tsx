"use client"

import {
  listActiveFilterChipClass,
  listActiveFilterChipDismissClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"
import type { ReactNode } from "react"

type Props = {
  label: ReactNode
  onRemove: () => void
  removeAriaLabel: string
  className?: string
}

export function DataWorkspaceListFilterChip({
  label,
  onRemove,
  removeAriaLabel,
  className,
}: Props) {
  return (
    <span className={cn(listActiveFilterChipClass, className)}>
      <span className="min-w-0 truncate">{label}</span>
      <button
        type="button"
        className={listActiveFilterChipDismissClass}
        onClick={onRemove}
        aria-label={removeAriaLabel}
      >
        <X className="size-3" aria-hidden />
      </button>
    </span>
  )
}
