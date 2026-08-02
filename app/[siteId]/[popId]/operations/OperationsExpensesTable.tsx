"use client"

import type { OperationExpenseLedgerRow } from "@/app/[siteId]/[popId]/operations/actions"
import { OperationExpenseDetailDialog } from "@/app/[siteId]/[popId]/operations/OperationExpenseDetailDialog"
import { expenseKindLabel } from "@/app/[siteId]/[popId]/operations/operationExpenseUi"
import {
  OperationTableMoneyCell,
  OperationTableStackCell,
  OperationTableVerMas,
  operationTableFmt,
  operationTablePrimaryClass,
  operationTableSecondaryClass,
} from "@/app/[siteId]/[popId]/operations/operationsTableCells"
import { formatOperationSaleDateInline } from "@/app/[siteId]/[popId]/operations/OperationsSalesTable"
import { OperationsExpensesSkeletonRows } from "@/app/[siteId]/[popId]/operations/OperationsTableSkeleton"
import { usePopTimeZone } from "@/hooks/usePopTimeZone"
import {
  selectColumnInnerClass,
  tableRowSelectCheckboxClass,
  tdClientNamedClass,
  tdMoneyMutedClass,
  workspaceDataTableClassName,
  workspaceTableBodyCellClass,
  workspaceTableBodyRowClassNames,
  workspaceTableSelectBodyCellClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import { DataWorkspaceListTableFrame } from "@/components/data-workspace/DataWorkspaceListTablePrimitives"
import {
  WorkspaceTableHead,
  WorkspaceTableHeader,
  WorkspaceTableHeaderRow,
  WorkspaceTableSelectHead,
} from "@/components/data-workspace/WorkspaceTableHeader"
import { cn } from "@/lib/utils"
import { useMemo, useState, type Dispatch, type SetStateAction } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { TableBody, TableCell, TableRow } from "@/components/ui/table"

const fmt = operationTableFmt

function ExpensesTableRow({
  expense,
  timeZone,
  selected,
  onSelectedChange,
  onOpenDetail,
}: {
  expense: OperationExpenseLedgerRow
  timeZone?: string
  selected: Set<string>
  onSelectedChange: Dispatch<SetStateAction<Set<string>>>
  onOpenDetail: (expense: OperationExpenseLedgerRow) => void
}) {
  const whenInline = formatOperationSaleDateInline(expense.operationAt, timeZone)
  const isVoid = expense.sourceType === "expense_void"
  const description =
    expense.description.trim() && expense.description !== "—"
      ? expense.description.trim()
      : null

  return (
    <>
      <TableCell className={workspaceTableSelectBodyCellClass}>
        <div className={selectColumnInnerClass}>
          <Checkbox
            className={tableRowSelectCheckboxClass}
            checked={selected.has(expense.entryId)}
            onCheckedChange={(checked) => {
              onSelectedChange((prev) => {
                const next = new Set(prev)
                if (checked === true) next.add(expense.entryId)
                else next.delete(expense.entryId)
                return next
              })
            }}
            aria-label={`Seleccionar gasto ${expense.entryId}`}
          />
        </div>
      </TableCell>
      <OperationTableStackCell className="min-w-[10rem]">
        <p className={cn(operationTablePrimaryClass, "tabular-nums")} title={whenInline}>
          {whenInline}
        </p>
        <p
          className={operationTableSecondaryClass}
          title={expense.recordedByName ?? undefined}
        >
          {expense.recordedByName ?? "—"}
        </p>
      </OperationTableStackCell>
      <OperationTableStackCell className="min-w-[14rem]">
        <p
          className={cn(
            tdClientNamedClass,
            "text-xs leading-snug",
            isVoid && "text-muted-foreground",
          )}
          title={expense.categoryName}
        >
          {expense.categoryName}
        </p>
        <p className={operationTablePrimaryClass} title={expenseKindLabel(expense.sourceType)}>
          {description ?? expenseKindLabel(expense.sourceType)}
        </p>
        <OperationTableVerMas
          label={` del gasto ${expense.entryId}`}
          onClick={() => onOpenDetail(expense)}
        />
      </OperationTableStackCell>
      <OperationTableStackCell className="min-w-[11rem]">
        <p
          className={operationTablePrimaryClass}
          title={expense.paymentMethodLabel}
        >
          {isVoid ? "—" : expense.paymentMethodLabel}
        </p>
        <p className={operationTableSecondaryClass}>
          {isVoid ? "Anulación" : "Pago"}
        </p>
      </OperationTableStackCell>
      <OperationTableMoneyCell amount={0} />
      <OperationTableMoneyCell amount={0} />
      <TableCell className={cn(workspaceTableBodyCellClass, "text-right align-middle")}>
        <span
          className={cn(
            "block tabular-nums text-sm",
            isVoid ? tdMoneyMutedClass : "font-medium text-foreground",
          )}
        >
          {fmt.format(expense.amount)}
        </span>
      </TableCell>
    </>
  )
}

export function OperationsExpensesTable({
  rows,
  listFetching,
  totalCount,
  skeletonRowCount,
  selected,
  onSelectedChange,
}: {
  rows: OperationExpenseLedgerRow[]
  listFetching: boolean
  totalCount: number
  skeletonRowCount: number
  selected: Set<string>
  onSelectedChange: Dispatch<SetStateAction<Set<string>>>
}) {
  const timeZone = usePopTimeZone()
  const [detailExpense, setDetailExpense] =
    useState<OperationExpenseLedgerRow | null>(null)

  const visibleIds = useMemo(() => rows.map((row) => row.entryId), [rows])
  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selected.has(id))
  const someVisibleSelected = visibleIds.some((id) => selected.has(id))

  return (
    <>
      <DataWorkspaceListTableFrame>
        <table
          className={workspaceDataTableClassName}
          aria-busy={listFetching}
        >
          <WorkspaceTableHeader>
            <WorkspaceTableHeaderRow>
              <WorkspaceTableSelectHead
                checked={
                  allVisibleSelected
                    ? true
                    : someVisibleSelected
                      ? "indeterminate"
                      : false
                }
                onCheckedChange={(checked) => {
                  onSelectedChange((prev) => {
                    const next = new Set(prev)
                    if (checked === true) {
                      visibleIds.forEach((id) => next.add(id))
                    } else {
                      visibleIds.forEach((id) => next.delete(id))
                    }
                    return next
                  })
                }}
                disabled={
                  listFetching || totalCount === 0 || rows.length === 0
                }
              />
              <WorkspaceTableHead className="min-w-[10rem]">Fecha</WorkspaceTableHead>
              <WorkspaceTableHead className="min-w-[14rem]">Detalle</WorkspaceTableHead>
              <WorkspaceTableHead className="min-w-[11rem]">Forma de pago</WorkspaceTableHead>
              <WorkspaceTableHead align="right">Descuento</WorkspaceTableHead>
              <WorkspaceTableHead align="right">IVA</WorkspaceTableHead>
              <WorkspaceTableHead align="right">Total</WorkspaceTableHead>
            </WorkspaceTableHeaderRow>
          </WorkspaceTableHeader>
          <TableBody>
            {listFetching ? (
              <OperationsExpensesSkeletonRows rowCount={skeletonRowCount} />
            ) : totalCount === 0 ? (
              null
            ) : (
              rows.map((expense, i) => (
                <TableRow
                  key={expense.entryId}
                  className={workspaceTableBodyRowClassNames(i)}
                >
                  <ExpensesTableRow
                    expense={expense}
                    timeZone={timeZone}
                    selected={selected}
                    onSelectedChange={onSelectedChange}
                    onOpenDetail={setDetailExpense}
                  />
                </TableRow>
              ))
            )}
          </TableBody>
        </table>
        {!listFetching && totalCount === 0 ? (
          <div className="min-h-[12rem] flex-1" aria-hidden />
        ) : null}
      </DataWorkspaceListTableFrame>

      <OperationExpenseDetailDialog
        expense={detailExpense}
        open={detailExpense != null}
        onOpenChange={(open) => {
          if (!open) setDetailExpense(null)
        }}
        timeZone={timeZone}
      />
    </>
  )
}
