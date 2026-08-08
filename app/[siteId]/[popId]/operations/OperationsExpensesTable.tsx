"use client"

import type { OperationExpenseLedgerRow } from "@/app/[siteId]/[popId]/operations/actions"
import { OperationExpenseDetailDialog } from "@/app/[siteId]/[popId]/operations/OperationExpenseDetailDialog"
import { expenseKindLabel } from "@/app/[siteId]/[popId]/operations/operationExpenseUi"
import {
  OperationTableMoneyCell,
  OperationTableStackCell,
  OperationTableVerMas,
  operationTablePrimaryClass,
  operationTableSecondaryClass,
} from "@/app/[siteId]/[popId]/operations/operationsTableCells"
import {
  operationsTableComprobanteColumnClass,
  operationsTableDateColumnClass,
  operationsTableDetailColumnClass,
  operationsTableHeaderClass,
  operationsTableMoneyColumnClass,
} from "@/app/[siteId]/[popId]/operations/operationsTableLayout"
import {
  OperationTableActionsCell,
  OperationTableActionsHead,
  OperationTableRowOptionsMenu,
} from "@/app/[siteId]/[popId]/operations/operationsTableRowOptions"
import { formatOperationSaleDateInline } from "@/app/[siteId]/[popId]/operations/OperationsSalesTable"
import { OperationsExpensesSkeletonRows } from "@/app/[siteId]/[popId]/operations/OperationsTableSkeleton"
import { usePopTimeZone } from "@/hooks/usePopTimeZone"
import {
  selectColumnInnerClass,
  workspaceTableLayoutClassName,
  workspaceTableNatureCheckboxClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import {
  workspaceTableLayoutListSurfaceClass,
  workspaceTableLayoutSelectBodyCellClass,
} from "@/components/data-workspace/dataWorkspaceTablesLayout"
import { DataWorkspaceListTableFrame } from "@/components/data-workspace/DataWorkspaceListTablePrimitives"
import {
  WorkspaceTableHead,
  WorkspaceTableBodyRow,
  WorkspaceTableHeader,
  WorkspaceTableHeaderRow,
  WorkspaceTableSelectHead,
} from "@/components/data-workspace/WorkspaceTableHeader"
import { WorkspaceTableSortHead } from "@/components/data-workspace/WorkspaceTableSortHead"
import type { WorkspaceTableSortDisplayDirection } from "@/lib/workspaceTableSort"
import { cn } from "@/lib/utils"
import { PanelRightOpen } from "lucide-react"
import { useMemo, useState, type Dispatch, type SetStateAction } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { TableBody, TableCell, TableRow } from "@/components/ui/table"

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
      <TableCell className={workspaceTableLayoutSelectBodyCellClass}>
        <div className={selectColumnInnerClass}>
          <Checkbox
            className={workspaceTableNatureCheckboxClass}
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
      <OperationTableStackCell className={operationsTableDateColumnClass}>
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
      <OperationTableStackCell className={operationsTableDetailColumnClass}>
        <p
          className={operationTablePrimaryClass}
          title={
            description
              ? `${expense.categoryName} · ${description}`
              : `${expense.categoryName} · ${expenseKindLabel(expense.sourceType)}`
          }
        >
          {description ?? expense.categoryName}
        </p>
        <OperationTableVerMas
          label={` del gasto ${expense.entryId}`}
          onClick={() => onOpenDetail(expense)}
        />
      </OperationTableStackCell>
      <OperationTableStackCell className={operationsTableComprobanteColumnClass}>
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
      <OperationTableMoneyCell
        amount={expense.amount}
        showDashWhenZero={false}
      />
      <OperationTableActionsCell>
        <OperationTableRowOptionsMenu
          rowLabel={`gasto ${expense.entryId}`}
          items={[
            {
              id: "detail",
              label: "Ver detalle",
              icon: PanelRightOpen,
              onSelect: () => onOpenDetail(expense),
            },
          ]}
        />
      </OperationTableActionsCell>
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
  sortable = true,
  sortDirection,
  onSortColumn,
}: {
  rows: OperationExpenseLedgerRow[]
  listFetching: boolean
  totalCount: number
  skeletonRowCount: number
  selected: Set<string>
  onSelectedChange: Dispatch<SetStateAction<Set<string>>>
  sortable?: boolean
  sortDirection?: (
    column: "entry_date",
  ) => WorkspaceTableSortDisplayDirection
  onSortColumn?: (column: "entry_date") => void
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
      <DataWorkspaceListTableFrame className={workspaceTableLayoutListSurfaceClass}>
        <table
          className={cn(workspaceTableLayoutClassName, "min-w-[80rem]")}
          aria-busy={listFetching}
        >
          <WorkspaceTableHeader>
            <WorkspaceTableHeaderRow>
              <WorkspaceTableSelectHead
                tone="nature"
                className={operationsTableHeaderClass()}
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
                ariaLabel="Seleccionar filas visibles"
              />
              {sortable ? (
                <WorkspaceTableSortHead
                  tone="nature"
                  label="Fecha"
                  direction={sortDirection?.("entry_date") ?? "none"}
                  onSort={
                    onSortColumn ? () => onSortColumn("entry_date") : undefined
                  }
                  className={operationsTableHeaderClass(operationsTableDateColumnClass)}
                />
              ) : (
                <WorkspaceTableHead
                  tone="nature"
                  className={operationsTableHeaderClass(operationsTableDateColumnClass)}
                >
                  Fecha
                </WorkspaceTableHead>
              )}
              <WorkspaceTableHead
                tone="nature"
                className={operationsTableHeaderClass(operationsTableDetailColumnClass)}
              >
                Detalle
              </WorkspaceTableHead>
              <WorkspaceTableHead
                tone="nature"
                className={operationsTableHeaderClass(operationsTableComprobanteColumnClass)}
              >
                Forma de pago
              </WorkspaceTableHead>
              <WorkspaceTableHead
                tone="nature"
                align="right"
                className={operationsTableHeaderClass(operationsTableMoneyColumnClass)}
              >
                Descuento
              </WorkspaceTableHead>
              <WorkspaceTableHead
                tone="nature"
                align="right"
                className={operationsTableHeaderClass(operationsTableMoneyColumnClass)}
              >
                IVA
              </WorkspaceTableHead>
              <WorkspaceTableHead
                tone="nature"
                align="right"
                className={operationsTableHeaderClass(operationsTableMoneyColumnClass)}
              >
                Total
              </WorkspaceTableHead>
              <OperationTableActionsHead />
            </WorkspaceTableHeaderRow>
          </WorkspaceTableHeader>
          <TableBody>
            {listFetching ? (
              <OperationsExpensesSkeletonRows rowCount={skeletonRowCount} />
            ) : totalCount === 0 ? (
              null
            ) : (
              rows.map((expense, i) => (
                <WorkspaceTableBodyRow
                        key={expense.entryId}
                        index={i}
                        selected={selected.has(expense.entryId)}
                        inactive={expense.sourceType === "expense_void"}
                      >
                  <ExpensesTableRow
                    expense={expense}
                    timeZone={timeZone}
                    selected={selected}
                    onSelectedChange={onSelectedChange}
                    onOpenDetail={setDetailExpense}
                  />
                </WorkspaceTableBodyRow>
              ))
            )}
          </TableBody>
        </table>
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
