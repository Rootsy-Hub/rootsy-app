"use client"

import type { OperationExpenseLedgerRow } from "@/app/[siteId]/[popId]/operations/actions"
import { formatOperationDetailTimestamp } from "@/app/[siteId]/[popId]/operations/operationSaleDetailUi"
import { operationTableFmt } from "@/app/[siteId]/[popId]/operations/operationsTableCells"
import { saleOpImporteBaseClass } from "@/components/sale-operation/saleOperationStyles"
import { cn } from "@/lib/utils"

const fmt = operationTableFmt

type Props = {
  expense: OperationExpenseLedgerRow
  timeZone?: string
}

export function OperationExpenseDetailPayments({ expense, timeZone }: Props) {
  const isVoid = expense.sourceType === "expense_void"

  if (isVoid) {
    return (
      <p className="text-sm text-muted-foreground">
        Anulación registrada en contabilidad.
      </p>
    )
  }

  if (expense.paymentMethodLabel === "—") {
    return (
      <p className="text-sm text-muted-foreground">Sin forma de pago registrada.</p>
    )
  }

  return (
    <ul className="divide-y divide-border/45 rounded-lg border border-border/60 bg-background">
      <li className="px-3 py-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium leading-snug text-foreground">
              {expense.paymentMethodLabel}
            </p>
            <p className="mt-1 text-xs leading-snug text-muted-foreground">
              {formatOperationDetailTimestamp(expense.operationAt, timeZone)}
            </p>
          </div>
          <span
            className={cn(
              "shrink-0 pt-0.5 text-sm font-semibold text-foreground",
              saleOpImporteBaseClass,
            )}
          >
            {fmt.format(expense.amount)}
          </span>
        </div>
      </li>
    </ul>
  )
}
