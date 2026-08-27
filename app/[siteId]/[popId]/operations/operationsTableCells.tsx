"use client"

import {
  workspaceTableNatureLinkClass,
  workspaceTableNatureMoneyClass,
  workspaceTableNatureTextPrimaryClass,
  workspaceTableNatureTextSecondaryClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import {
  workspaceTableLayoutBodyCellClass,
  workspaceTableLayoutCellPrimaryTextClass,
  workspaceTableLayoutCellSecondaryTextClass,
  workspaceTableLayoutCellStackClass,
} from "@/components/data-workspace/dataWorkspaceTablesLayout"
import {
  operationsTableComprobanteColumnClass,
  operationsTableMoneyColumnClass,
} from "@/app/[siteId]/[popId]/operations/operationsTableLayout"
import { cn } from "@/lib/utils"
import { PopLink as Link } from "@/lib/pop-spa/PopLink"
import type { ReactNode } from "react"
import { TableCell } from "@/components/ui/table"

export const operationTableFmt = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 2,
})

export const operationTablePrimaryClass = cn(
  workspaceTableLayoutCellPrimaryTextClass,
  workspaceTableNatureTextPrimaryClass,
)

export const operationTableSecondaryClass = cn(
  workspaceTableLayoutCellSecondaryTextClass,
  workspaceTableNatureTextSecondaryClass,
)

const operationTableVerMasClass = cn(
  workspaceTableLayoutCellSecondaryTextClass,
  "w-fit text-left font-medium underline-offset-2 hover:underline",
  workspaceTableNatureLinkClass,
)

/** Segunda línea invisible — mantiene h-14 cuando solo hay un renglón visible. */
export const operationTableLayoutPlaceholderLineClass = cn(
  workspaceTableLayoutCellSecondaryTextClass,
  "invisible",
)

export function OperationTableStackCell({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) {
  return (
    <TableCell className={cn(workspaceTableLayoutBodyCellClass, className)}>
      <div className={workspaceTableLayoutCellStackClass}>{children}</div>
    </TableCell>
  )
}

export function OperationTableClientLine({
  name,
  href,
  title,
  asPrimary = false,
}: {
  name?: string | null
  href?: string | null
  title?: string
  asPrimary?: boolean
}) {
  const label = name?.trim()
  if (!label) return null

  const textClass = asPrimary ? operationTablePrimaryClass : operationTableSecondaryClass
  const fullTitle = title ? `${label} · ${title}` : label

  if (href) {
    return (
      <Link
        href={href}
        className={cn(
          textClass,
          !asPrimary && workspaceTableNatureLinkClass,
          "truncate",
        )}
        title={fullTitle}
      >
        {label}
      </Link>
    )
  }

  return (
    <p className={cn(textClass, "truncate")} title={fullTitle}>
      {label}
    </p>
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
      className={cn(
        workspaceTableLayoutBodyCellClass,
        operationsTableMoneyColumnClass,
        "text-right",
      )}
    >
      <span
        className={cn(
          "block text-sm tabular-nums leading-4",
          showAmount
            ? workspaceTableNatureMoneyClass
            : workspaceTableNatureTextSecondaryClass,
        )}
      >
        {showAmount ? operationTableFmt.format(amount) : "—"}
      </span>
    </TableCell>
  )
}

export function OperationTableEmptyComprobanteCell() {
  return (
    <TableCell
      className={cn(
        workspaceTableLayoutBodyCellClass,
        operationsTableComprobanteColumnClass,
      )}
    >
      <span
        className={cn(
          "block text-sm leading-4",
          workspaceTableNatureTextSecondaryClass,
        )}
      >
        —
      </span>
    </TableCell>
  )
}
