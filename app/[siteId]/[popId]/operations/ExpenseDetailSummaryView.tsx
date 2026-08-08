"use client"

import type { OperationExpenseLedgerRow } from "@/app/[siteId]/[popId]/operations/actions"
import {
  expenseDescriptionLabel,
  expenseKindLabel,
} from "@/app/[siteId]/[popId]/operations/operationExpenseUi"
import { operationTableFmt } from "@/app/[siteId]/[popId]/operations/operationsTableCells"
import { SaleOperationCartList } from "@/components/sale-operation/SaleOperationCartList"
import { SaleOperationTotalBar } from "@/components/sale-operation/SaleOperationTotalBar"
import { SALE_TICKET_PANEL_WIDTH_CLASS } from "@/components/sale-operation/SaleReadonlyTicketPanel"
import { tdMoneyMutedClass } from "@/components/data-workspace/dataWorkspaceListStyles"
import { cn } from "@/lib/utils"

const fmt = operationTableFmt

function ExpenseSummaryBreakdownRow({
  label,
  value,
  muted = false,
}: {
  label: string
  value: string
  muted?: boolean
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 px-3 py-1.5">
      <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </span>
      <span
        className={cn(
          "shrink-0 tabular-nums text-sm font-medium text-foreground",
          muted && tdMoneyMutedClass,
        )}
      >
        {value}
      </span>
    </div>
  )
}

export function ExpenseDetailSummaryView({
  expense,
  showHeading = true,
}: {
  expense: OperationExpenseLedgerRow
  showHeading?: boolean
}) {
  const isVoid = expense.sourceType === "expense_void"
  const description = expenseDescriptionLabel(expense.description)
  const showExpenseAmount =
    expense.expenseAmount != null &&
    expense.expenseAmount > 0 &&
    Math.abs(expense.expenseAmount - expense.amount) > 0.009

  return (
    <>
      {showHeading ? (
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Gasto
        </p>
      ) : null}

      <div
        className={cn(
          "flex flex-col overflow-hidden rounded-xl border border-border/60 bg-white shadow-sm",
          SALE_TICKET_PANEL_WIDTH_CLASS,
        )}
      >
        <SaleOperationCartList
          title={expense.categoryName}
          lineCount={1}
          emptyTitle="Sin detalle."
          flush
        >
          <div className="border-b border-slate-200/90 bg-white px-3 py-3">
            <p
              className={cn(
                "text-sm font-semibold leading-snug text-slate-900",
                isVoid && "text-muted-foreground line-through decoration-border",
              )}
            >
              {description}
            </p>
            <p className="mt-1 text-xs leading-snug text-muted-foreground">
              {expenseKindLabel(expense.sourceType)}
            </p>
          </div>
        </SaleOperationCartList>

        {showExpenseAmount ? (
          <div className="border-t border-slate-200/90 bg-muted/10">
            <ExpenseSummaryBreakdownRow
              label="Monto del gasto"
              value={fmt.format(expense.expenseAmount!)}
            />
          </div>
        ) : null}

        <div className="shrink-0 border-t border-slate-200/90">
          <SaleOperationTotalBar
            tone="modal"
            flush
            total={expense.amount}
            subtotal={expense.amount}
            descuentoMonto={0}
            hayDescuento={false}
            totalLabel={isVoid ? "Importe anulado" : "Importe pagado"}
            totalAriaLabel={isVoid ? "Importe anulado" : "Importe pagado"}
          />
        </div>
      </div>
    </>
  )
}
