"use client"

import {
  lightTableThClass,
  workspaceTableNatureHeaderCellClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import { TableHead } from "@/components/ui/table"
import type { WorkspaceTableSortDisplayDirection } from "@/lib/workspaceTableSort"
import { cn } from "@/lib/utils"
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react"
import type { WorkspaceTableTone } from "@/components/data-workspace/WorkspaceTableHeader"

const headAlignClass = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
} as const

const sortHeadInnerAlignClass = {
  left: "justify-start",
  center: "justify-center",
  right: "justify-end",
} as const

function workspaceTableHeadCellClass(tone: WorkspaceTableTone = "default") {
  if (tone === "nature" || tone === "earth") {
    return workspaceTableNatureHeaderCellClass
  }
  return lightTableThClass
}

function sortButtonClass(direction: WorkspaceTableSortDisplayDirection) {
  const active = direction !== "none"
  return cn(
    "inline-flex size-8 shrink-0 items-center justify-center rounded-md transition-[color,background-color,box-shadow] duration-150",
    "focus-visible:outline-none focus-visible:shadow-[0_0_0_2px_color-mix(in_srgb,var(--rootsy-savia-400)_45%,transparent)]",
    active
      ? "text-[var(--rootsy-savia-600)] hover:bg-[var(--rootsy-savia-50)]"
      : "text-[var(--color-texto-muted)] hover:bg-[var(--color-superficie)] hover:text-[var(--color-texto)]",
  )
}

function sortLabelClass(direction: WorkspaceTableSortDisplayDirection) {
  return cn(
    "truncate text-sm font-medium leading-5",
    direction === "none"
      ? "text-[var(--color-texto-muted)]"
      : "text-[var(--rootsy-bruma-700)]",
  )
}

export function WorkspaceTableSortHead({
  label,
  direction = "none",
  onSort,
  className,
  align = "left",
  tone = "default",
  disabled = false,
}: {
  label: string
  direction?: WorkspaceTableSortDisplayDirection
  onSort?: () => void
  className?: string
  align?: keyof typeof headAlignClass
  tone?: WorkspaceTableTone
  disabled?: boolean
}) {
  const SortIcon =
    direction === "asc" ? ArrowUp : direction === "desc" ? ArrowDown : ArrowUpDown
  const sortLabel =
    direction === "asc"
      ? `${label}, orden ascendente`
      : direction === "desc"
        ? `${label}, orden descendente`
        : `Ordenar ${label}`

  const sortButton = onSort ? (
    <button
      type="button"
      className={sortButtonClass(direction)}
      aria-label={sortLabel}
      disabled={disabled}
      onClick={onSort}
    >
      <SortIcon className="size-4" aria-hidden />
    </button>
  ) : null

  return (
    <TableHead
      className={cn(
        workspaceTableHeadCellClass(tone),
        headAlignClass[align],
        className,
      )}
      aria-sort={
        direction === "asc"
          ? "ascending"
          : direction === "desc"
            ? "descending"
            : "none"
      }
    >
      <div
        className={cn(
          "flex w-full min-w-0 items-center gap-1",
          sortHeadInnerAlignClass[align],
        )}
      >
        {align === "right" ? (
          <>
            {sortButton}
            <span className={sortLabelClass(direction)}>{label}</span>
          </>
        ) : (
          <>
            <span className={sortLabelClass(direction)}>{label}</span>
            {sortButton}
          </>
        )}
      </div>
    </TableHead>
  )
}
