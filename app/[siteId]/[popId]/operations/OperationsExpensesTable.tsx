"use client"

import type { OperationExpenseLedgerRow } from "@/app/[siteId]/[popId]/operations/actions"
import { OperationAccountingViewButton } from "@/app/[siteId]/[popId]/operations/OperationAccountingModal"
import { OperationsExpensesSkeletonRows } from "@/app/[siteId]/[popId]/operations/OperationsTableSkeleton"
import { formatOperationSaleDateTime } from "@/app/[siteId]/[popId]/operations/OperationsSalesTable"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  lightTableThClass,
  tdClientNamedClass,
  tdMoneyClass,
  tdMoneyMutedClass,
  tdMoneyTotalClass,
  workspaceTableBodyRowClassNames,
  workspaceTableHeaderRowClass,
  workspaceTablePlaceholderRowClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import { cn } from "@/lib/utils"
import { Eye } from "lucide-react"
import { useMemo, useState } from "react"
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const fmt = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 2,
})

const opsDialogSurfaceMd = cn(
  "rootsy-app-light gap-0 overflow-hidden rounded-2xl border border-border/60 bg-card p-0 text-foreground shadow-2xl ring-1 ring-black/[0.04] sm:max-w-2xl",
  "max-h-[min(90vh,760px)] flex flex-col overflow-hidden",
)
const opsDialogHeader =
  "shrink-0 space-y-1.5 border-b border-border/50 bg-muted/25 px-6 pb-4 pt-5 text-left"
const opsDialogBody =
  "min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-4"

const detailTotalMoneyClass = cn(
  "text-base font-semibold text-primary",
  tdMoneyClass,
)

function ExpenseDetailTotalsRow({
  label,
  value,
  emphasize = false,
  valueClassName,
}: {
  label: string
  value: string
  emphasize?: boolean
  valueClassName?: string
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1.5">
      <span
        className={cn(
          "text-sm text-muted-foreground",
          emphasize && "font-semibold text-foreground",
        )}
      >
        {label}
      </span>
      <span
        className={cn(
          "shrink-0 tabular-nums",
          emphasize
            ? detailTotalMoneyClass
            : cn("text-sm font-medium text-foreground", tdMoneyClass),
          valueClassName,
        )}
      >
        {value}
      </span>
    </div>
  )
}

function expenseKindLabel(row: OperationExpenseLedgerRow) {
  return row.sourceType === "expense_void" ? "Anulación" : "Pago"
}

function ExpenseDetailDialog({
  expense,
  open,
  onOpenChange,
}: {
  expense: OperationExpenseLedgerRow | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  if (!expense) return null

  const when = formatOperationSaleDateTime(expense.operationAt)
  const isVoid = expense.sourceType === "expense_void"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={opsDialogSurfaceMd}>
        <DialogHeader className={opsDialogHeader}>
          <DialogTitle className="text-base font-semibold tracking-tight">
            {isVoid ? "Anulación de gasto" : "Detalle de gasto"}
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed">
            {when.primary}
            {when.secondary ? ` · ${when.secondary}` : ""} · {expense.categoryName}
            {isVoid ? " · Anulación" : ""}
          </DialogDescription>
        </DialogHeader>
        <div className={opsDialogBody}>
          <p className="mb-4 break-all font-mono text-[11px] text-muted-foreground">
            {expense.entryId}
          </p>

          {expense.description !== "—" ? (
            <>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Descripción
              </p>
              <p className="mb-4 rounded-lg border border-border bg-muted/20 px-3 py-2 text-sm text-foreground">
                {expense.description}
              </p>
            </>
          ) : null}

          <div className="rounded-lg border border-border bg-muted/20 px-4 py-3">
            {expense.expenseAmount != null && expense.expenseAmount > 0 ? (
              <ExpenseDetailTotalsRow
                label="Monto del gasto"
                value={fmt.format(expense.expenseAmount)}
              />
            ) : null}
            <ExpenseDetailTotalsRow
              label={isVoid ? "Importe anulado" : "Importe pagado"}
              value={fmt.format(expense.amount)}
              emphasize
              valueClassName={isVoid ? tdMoneyMutedClass : undefined}
            />
            <ExpenseDetailTotalsRow
              label="Forma de pago"
              value={expense.paymentMethodLabel}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function OperationsExpensesTable({
  rows,
  listFetching,
  totalCount,
  hasActiveFilters,
  skeletonRowCount,
  onOpenAccounting,
}: {
  rows: OperationExpenseLedgerRow[]
  listFetching: boolean
  totalCount: number
  hasActiveFilters: boolean
  skeletonRowCount: number
  onOpenAccounting: (row: OperationExpenseLedgerRow) => void
}) {
  const [detailExpense, setDetailExpense] =
    useState<OperationExpenseLedgerRow | null>(null)

  const emptyMessage = useMemo(
    () =>
      hasActiveFilters
        ? "No hay gastos que coincidan con los filtros."
        : "No hay pagos de gastos contabilizados en este punto.",
    [hasActiveFilters],
  )

  return (
    <>
      <table
        className={cn(
          "relative w-max min-w-full caption-bottom text-sm",
          "[&_th:last-child]:pr-5 [&_td:last-child]:pr-5",
        )}
        aria-busy={listFetching}
      >
        <TableHeader>
          <TableRow className={workspaceTableHeaderRowClass}>
            <TableHead className={cn(lightTableThClass, "w-[7.5rem] text-left")}>
              Fecha
            </TableHead>
            <TableHead className={cn(lightTableThClass, "min-w-[10rem] text-left")}>
              Categoría
            </TableHead>
            <TableHead className={cn(lightTableThClass, "w-[6.5rem] text-center")}>
              Detalle
            </TableHead>
            <TableHead className={cn(lightTableThClass, "text-right")}>
              Total
            </TableHead>
            <TableHead className={cn(lightTableThClass, "min-w-[8rem] text-left")}>
              Forma de pago
            </TableHead>
            <TableHead className={cn(lightTableThClass, "w-[6.5rem] text-center")}>
              Asientos
            </TableHead>
            <TableHead className={cn(lightTableThClass, "min-w-[19rem] text-left")}>
              ID
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {listFetching ? (
            <OperationsExpensesSkeletonRows rowCount={skeletonRowCount} />
          ) : totalCount === 0 ? (
            <TableRow className={workspaceTablePlaceholderRowClass}>
              <TableCell
                colSpan={7}
                className="py-12 text-center text-muted-foreground"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row, i) => {
              const when = formatOperationSaleDateTime(row.operationAt)
              const isVoid = row.sourceType === "expense_void"

              return (
                <TableRow
                  key={row.entryId}
                  className={workspaceTableBodyRowClassNames(i)}
                >
                  <TableCell className="px-3 py-2.5">
                    <span className="block text-sm font-medium text-foreground">
                      {when.primary}
                    </span>
                    {when.secondary ? (
                      <span className="block text-xs tabular-nums text-muted-foreground">
                        {when.secondary}
                      </span>
                    ) : null}
                  </TableCell>
                  <TableCell className="max-w-[14rem] px-3 py-2.5 text-sm">
                    <span
                      className={cn(
                        tdClientNamedClass,
                        isVoid && "text-muted-foreground",
                      )}
                      title={row.categoryName}
                    >
                      {row.categoryName}
                    </span>
                    {isVoid ? (
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {expenseKindLabel(row)}
                      </span>
                    ) : null}
                  </TableCell>
                  <TableCell className="px-2 py-2.5 text-center">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1.5 px-2.5 text-xs"
                      onClick={() => setDetailExpense(row)}
                    >
                      <Eye className="size-3.5" aria-hidden />
                      Ver
                    </Button>
                  </TableCell>
                  <TableCell
                    className={cn(
                      "px-3 py-2.5 text-right text-sm",
                      isVoid ? tdMoneyMutedClass : tdMoneyTotalClass,
                    )}
                  >
                    {fmt.format(row.amount)}
                  </TableCell>
                  <TableCell className="max-w-[12rem] px-3 py-2.5 text-sm text-foreground">
                    {row.paymentMethodLabel !== "—" ? (
                      <span
                        className="line-clamp-2"
                        title={row.paymentMethodLabel}
                      >
                        {row.paymentMethodLabel}
                      </span>
                    ) : (
                      <span className={tdMoneyMutedClass}>—</span>
                    )}
                  </TableCell>
                  <TableCell className="px-2 py-2.5 text-center">
                    <OperationAccountingViewButton
                      onClick={() => onOpenAccounting(row)}
                      label={`Ver asientos contables del gasto ${row.entryId}`}
                    />
                  </TableCell>
                  <TableCell className="min-w-[19rem] whitespace-nowrap px-3 py-2.5 pr-5">
                    <span className="font-mono text-[11px] leading-snug text-muted-foreground">
                      {row.entryId}
                    </span>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </table>

      <ExpenseDetailDialog
        expense={detailExpense}
        open={detailExpense != null}
        onOpenChange={(open) => {
          if (!open) setDetailExpense(null)
        }}
      />
    </>
  )
}
