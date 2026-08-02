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
}: {
  children?: ReactNode
  className?: string
  align?: keyof typeof headAlignClass
  srOnly?: boolean
}) {
  return (
    <TableHead
      className={cn(lightTableThClass, headAlignClass[align], className)}
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
}: {
  checked: CheckedState
  onCheckedChange: (checked: CheckedState) => void
  disabled?: boolean
  ariaLabel?: string
  className?: string
}) {
  return (
    <TableHead
      className={cn(
        lightTableThClass,
        workspaceTableSelectHeadClass,
        className,
      )}
    >
      <div className={cn(selectColumnInnerClass, "min-h-10")}>
        <Checkbox
          className={tableRowSelectCheckboxClass}
          checked={checked}
          onCheckedChange={onCheckedChange}
          disabled={disabled}
          aria-label={ariaLabel}
        />
      </div>
    </TableHead>
  )
}
