"use client"

import { Checkbox } from "@/components/ui/checkbox"
import {
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  workspaceTableLayoutBodyRowClass,
  workspaceTableLayoutSelectBodyCellClass,
} from "@/components/data-workspace/dataWorkspaceTablesLayout"
import {
  lightTableThClass,
  selectColumnInnerClass,
  tableRowSelectCheckboxClass,
  workspaceTableNatureBodyRowClassNames,
  workspaceTableNatureCheckboxClass,
  workspaceTableNatureHeaderCellClass,
  workspaceTableHeaderRowClass,
  workspaceTableSelectHeadClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import { cn } from "@/lib/utils"
import type { CheckedState } from "@radix-ui/react-checkbox"
import type { ComponentProps, ReactNode } from "react"

const headAlignClass = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
} as const

export type WorkspaceTableTone = "default" | "nature" | "earth"

function workspaceTableHeadCellClass(tone: WorkspaceTableTone = "default") {
  if (tone === "nature" || tone === "earth") {
    return workspaceTableNatureHeaderCellClass
  }
  return lightTableThClass
}

function workspaceTableCheckboxClass(tone: WorkspaceTableTone = "default") {
  if (tone === "nature" || tone === "earth") {
    return workspaceTableNatureCheckboxClass
  }
  return tableRowSelectCheckboxClass
}

export function WorkspaceTableHeader({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return <TableHeader className={className}>{children}</TableHeader>
}

export function WorkspaceTableHeaderRow({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <TableRow className={cn(workspaceTableHeaderRowClass, className)}>
      {children}
    </TableRow>
  )
}

export function WorkspaceTableHead({
  children,
  className,
  align = "left",
  srOnly = false,
  tone = "default",
}: {
  children?: ReactNode
  className?: string
  align?: keyof typeof headAlignClass
  srOnly?: boolean
  tone?: WorkspaceTableTone
}) {
  return (
    <TableHead
      className={cn(workspaceTableHeadCellClass(tone), headAlignClass[align], className)}
    >
      {srOnly ? <span className="sr-only">{children}</span> : children}
    </TableHead>
  )
}

export function WorkspaceTableSelectHead({
  checked,
  onCheckedChange,
  disabled,
  ariaLabel = "Seleccionar filas visibles",
  className,
  tone = "default",
}: {
  checked: CheckedState
  onCheckedChange: (checked: CheckedState) => void
  disabled?: boolean
  ariaLabel?: string
  className?: string
  tone?: WorkspaceTableTone
}) {
  return (
    <TableHead
      className={cn(
        workspaceTableHeadCellClass(tone),
        workspaceTableSelectHeadClass,
        className,
      )}
    >
      <div className={cn(selectColumnInnerClass, "h-full min-h-0")}>
        <Checkbox
          className={workspaceTableCheckboxClass(tone)}
          checked={checked}
          onCheckedChange={onCheckedChange}
          disabled={disabled}
          aria-label={ariaLabel}
        />
      </div>
    </TableHead>
  )
}

export function WorkspaceTableSelectCell({
  checked,
  onCheckedChange,
  disabled,
  ariaLabel,
  tone = "default",
  className,
}: {
  checked: CheckedState
  onCheckedChange: (checked: CheckedState) => void
  disabled?: boolean
  ariaLabel: string
  tone?: WorkspaceTableTone
  className?: string
}) {
  return (
    <TableCell className={cn(workspaceTableLayoutSelectBodyCellClass, className)}>
      <div className={cn(selectColumnInnerClass, "relative z-[1]")}>
        <Checkbox
          className={workspaceTableCheckboxClass(tone)}
          checked={checked}
          onCheckedChange={onCheckedChange}
          disabled={disabled}
          aria-label={ariaLabel}
          onClick={(event) => event.stopPropagation()}
        />
      </div>
    </TableCell>
  )
}

export function WorkspaceTableBodyRow({
  index,
  selected,
  inactive,
  signal,
  noHover = true,
  className,
  children,
  ...props
}: Omit<ComponentProps<typeof TableRow>, "className"> & {
  index: number
  selected?: boolean
  inactive?: boolean
  /** Aviso o peligro — stock bajo, sin stock, vencido. */
  signal?: "warning" | "danger"
  noHover?: boolean
  className?: string
}) {
  return (
    <TableRow
      data-state={selected ? "selected" : undefined}
      className={cn(
        workspaceTableLayoutBodyRowClass,
        workspaceTableNatureBodyRowClassNames(index, {
          selected,
          noHover,
          inactive,
          signal,
        }),
        selected &&
          "data-[state=selected]:!bg-[var(--wt-surface-selected)] hover:data-[state=selected]:!bg-[var(--wt-surface-selected)]",
        className,
      )}
      {...props}
    >
      {children}
    </TableRow>
  )
}
