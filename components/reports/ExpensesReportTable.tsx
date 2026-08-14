"use client"

import type { OperationExpenseLedgerRow } from "@/app/[siteId]/[popId]/operations/actions"
import {
  workspaceTableLayoutBodyCellClass,
  workspaceTableLayoutCellPrimaryTextClass,
  workspaceTableLayoutCellSecondaryTextClass,
  workspaceTableLayoutCellStackClass,
  workspaceTableLayoutHeaderHeadClass,
  workspaceTableLayoutListBodyScopeClass,
  workspaceTableLayoutListSurfaceClass,
} from "@/components/data-workspace/dataWorkspaceTablesLayout"
import { workspaceLayoutsTablesScopeClass } from "@/components/layouts-tables/rootsLayoutsTablesProductStyles"
import {
  WorkspaceTableBodyRow,
  WorkspaceTableHead,
  WorkspaceTableHeader,
  WorkspaceTableHeaderRow,
} from "@/components/data-workspace/WorkspaceTableHeader"
import {
  workspaceTableLayoutClassName,
  workspaceTableNatureMoneyClass,
  workspaceTableNatureTextPrimaryClass,
  workspaceTableNatureTextSecondaryClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import { formatReportMoneyAr } from "@/lib/reportFormatters"
import {
  buildExpenseReportRowModel,
  type ExpenseReportRowModel,
} from "@/lib/purchasesExpensesReportFormatters"
import { usePopTimeZone } from "@/hooks/usePopTimeZone"
import { cn } from "@/lib/utils"
import { Table, TableBody, TableCell } from "@/components/ui/table"

type Props = {
  rows: OperationExpenseLedgerRow[]
}

const COLUMN_COUNT = 5

const tableBodyScopeClass = cn(
  workspaceTableLayoutListBodyScopeClass,
  "[&_[data-slot=table-body]_[data-slot=table-row]]:!h-auto [&_[data-slot=table-body]_[data-slot=table-row]]:!max-h-none",
  "[&_[data-slot=table-body]_[data-slot=table-cell]]:!h-auto [&_[data-slot=table-body]_[data-slot=table-cell]]:!max-h-none [&_[data-slot=table-body]_[data-slot=table-cell]]:align-top [&_[data-slot=table-body]_[data-slot=table-cell]]:!py-2",
)

const mobileLabelClass =
  "text-[10px] font-medium uppercase tracking-[0.08em] text-rootsy-bruma-500"
const mobileValueClass = "text-sm leading-snug text-rootsy-bruma-900"
const paymentCellClass =
  "whitespace-normal break-words text-sm font-medium leading-snug"

function ReportStackCell({
  primary,
  secondary,
  primaryClassName,
}: {
  primary: string
  secondary?: string | null
  primaryClassName?: string
}) {
  return (
    <TableCell className={cn(workspaceTableLayoutBodyCellClass, "!h-auto !max-h-none align-top !py-2")}>
      <div className={workspaceTableLayoutCellStackClass}>
        <span
          className={cn(
            workspaceTableLayoutCellPrimaryTextClass,
            workspaceTableNatureTextPrimaryClass,
            primaryClassName,
          )}
          title={primary}
        >
          {primary}
        </span>
        {secondary ? (
          <span
            className={cn(
              workspaceTableLayoutCellSecondaryTextClass,
              workspaceTableNatureTextSecondaryClass,
            )}
            title={secondary}
          >
            {secondary}
          </span>
        ) : null}
      </div>
    </TableCell>
  )
}

function ExpensesReportMobileRow({ row }: { row: ExpenseReportRowModel }) {
  return (
    <article className="px-4 py-3.5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium tabular-nums text-rootsy-bruma-900">{row.when}</p>
          {row.dateSecondary ? (
            <p className="mt-0.5 text-xs text-rootsy-bruma-500">{row.dateSecondary}</p>
          ) : null}
        </div>
        <p className={cn("shrink-0 text-sm font-semibold tabular-nums", workspaceTableNatureMoneyClass)}>
          {formatReportMoneyAr(row.amount)}
        </p>
      </div>
      <dl className="mt-3 space-y-2.5">
        <div>
          <dt className={mobileLabelClass}>Categoría</dt>
          <dd className={cn("mt-0.5", mobileValueClass)}>{row.category}</dd>
        </div>
        <div>
          <dt className={mobileLabelClass}>Detalle</dt>
          <dd className={cn("mt-0.5 break-words", mobileValueClass)}>{row.detail}</dd>
          {row.detailSecondary ? (
            <dd className="mt-0.5 text-xs text-rootsy-bruma-500">{row.detailSecondary}</dd>
          ) : null}
        </div>
        <div>
          <dt className={mobileLabelClass}>Cobro</dt>
          <dd className={cn("mt-0.5 break-words", mobileValueClass)}>{row.payment}</dd>
        </div>
      </dl>
    </article>
  )
}

export function ExpensesReportTable({ rows }: Props) {
  const timeZone = usePopTimeZone()
  const rowModels = rows.map((row) => buildExpenseReportRowModel(row, timeZone))

  return (
    <div className={cn(workspaceLayoutsTablesScopeClass, workspaceTableLayoutListSurfaceClass)}>
      <div className="divide-y divide-rootsy-bruma-200 md:hidden">
        {rows.length === 0 ? (
          <p className="px-4 py-6 text-sm text-rootsy-bruma-500">Sin gastos en el período.</p>
        ) : (
          rowModels.map((row, index) => (
            <ExpensesReportMobileRow key={rows[index]!.entryId} row={row} />
          ))
        )}
      </div>

      <div className={cn("hidden overflow-x-auto md:block", tableBodyScopeClass)}>
        <Table className={cn(workspaceTableLayoutClassName, "min-w-[44rem]")}>
          <WorkspaceTableHeader>
            <WorkspaceTableHeaderRow>
              <WorkspaceTableHead className={workspaceTableLayoutHeaderHeadClass}>Fecha</WorkspaceTableHead>
              <WorkspaceTableHead className={workspaceTableLayoutHeaderHeadClass}>Categoría</WorkspaceTableHead>
              <WorkspaceTableHead className={workspaceTableLayoutHeaderHeadClass}>Detalle</WorkspaceTableHead>
              <WorkspaceTableHead className={cn(workspaceTableLayoutHeaderHeadClass, "w-[9.5rem]")}>
                Cobro
              </WorkspaceTableHead>
              <WorkspaceTableHead className={cn(workspaceTableLayoutHeaderHeadClass, "text-right")}>
                Importe
              </WorkspaceTableHead>
            </WorkspaceTableHeaderRow>
          </WorkspaceTableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <WorkspaceTableBodyRow index={0} noHover>
                <TableCell colSpan={COLUMN_COUNT} className={cn(workspaceTableLayoutBodyCellClass, "text-rootsy-bruma-500")}>
                  Sin gastos en el período.
                </TableCell>
              </WorkspaceTableBodyRow>
            ) : (
              rowModels.map((row, index) => (
                <WorkspaceTableBodyRow key={rows[index]!.entryId} index={index} noHover>
                  <ReportStackCell primary={row.when} secondary={row.dateSecondary} primaryClassName="tabular-nums" />
                  <ReportStackCell primary={row.category} />
                  <ReportStackCell primary={row.detail} secondary={row.detailSecondary} />
                  <TableCell className={cn(workspaceTableLayoutBodyCellClass, "!h-auto !max-h-none align-top !py-2")}>
                    <span className={cn(paymentCellClass, workspaceTableNatureTextSecondaryClass)} title={row.payment}>
                      {row.payment}
                    </span>
                  </TableCell>
                  <TableCell className={cn(workspaceTableLayoutBodyCellClass, "text-right !h-auto !max-h-none align-top !py-2")}>
                    <span className={cn(workspaceTableLayoutCellPrimaryTextClass, workspaceTableNatureMoneyClass)}>
                      {formatReportMoneyAr(row.amount)}
                    </span>
                  </TableCell>
                </WorkspaceTableBodyRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
