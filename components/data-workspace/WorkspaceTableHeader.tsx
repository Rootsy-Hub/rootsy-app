"use client"

import { Checkbox } from "@/components/ui/checkbox"
import {
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  lightTableThClass,
  selectColumnInnerClass,
  tableRowSelectCheckboxClass,
  workspaceTableNatureCheckboxClass,
  workspaceTableNatureHeaderCellClass,
  workspaceTableHeaderRowClass,
  workspaceTableSelectHeadClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import { cn } from "@/lib/utils"
import type { CheckedState } from "@radix-ui/react-checkbox"
import type { ReactNode } from "react"

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
