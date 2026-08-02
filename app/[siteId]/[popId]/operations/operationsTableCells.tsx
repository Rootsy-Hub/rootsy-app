"use client"

import {
  tdMoneyClass,
  tdMoneyMutedClass,
  workspaceTableBodyCellClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"
import { TableCell } from "@/components/ui/table"

export const operationTableFmt = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 2,
})

export const operationTablePrimaryClass =
  "truncate text-sm font-medium leading-snug text-foreground"

export const operationTableSecondaryClass =
  "truncate text-xs leading-snug text-muted-foreground"

const operationTableVerMasClass =
  "w-fit text-left text-xs font-medium text-primary underline-offset-2 hover:underline"

export function OperationTableStackCell({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) {
  return (
    <TableCell className={cn(workspaceTableBodyCellClass, className)}>
      <div className="flex min-w-0 flex-col gap-0.5">{children}</div>
    </TableCell>
  )
}

export function OperationTableVerMas({
  label,
  onClick,
}: {
  label: string
  onClick: () => void
}) {
  return (
    <button type="button" className={operationTableVerMasClass} onClick={onClick}>
      Ver más
      <span className="sr-only">{label}</span>
    </button>
  )
}

export function OperationTableMoneyCell({
  amount,
  showDashWhenZero = true,
}: {
  amount: number
  showDashWhenZero?: boolean
}) {
  const showAmount = !showDashWhenZero || amount > 0
  return (
    <TableCell
      className={cn(workspaceTableBodyCellClass, "text-right align-middle")}
    >
      <span
        className={cn(
          "block tabular-nums",
          showAmount ? tdMoneyClass : tdMoneyMutedClass,
        )}
      >
        {showAmount ? operationTableFmt.format(amount) : "—"}
      </span>
    </TableCell>
  )
}
