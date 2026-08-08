"use client"

import type { OperationExpenseLedgerRow } from "@/app/[siteId]/[popId]/operations/actions"
import { expenseKindLabel } from "@/app/[siteId]/[popId]/operations/operationExpenseUi"
import { OperationSaleDetailField } from "@/app/[siteId]/[popId]/operations/OperationSaleDetailField"
import { formatOperationDetailTimestamp } from "@/app/[siteId]/[popId]/operations/operationSaleDetailUi"

type Props = {
  expense: OperationExpenseLedgerRow
  timeZone?: string
}

export function OperationExpenseDetailMeta({ expense, timeZone }: Props) {
  return (
    <div className="divide-y divide-border/45">
      <OperationSaleDetailField label="ID asiento">
        <span className="break-all text-[11px] leading-snug text-muted-foreground">
          {expense.entryId}
        </span>
      </OperationSaleDetailField>
      {expense.expenseId ? (
        <OperationSaleDetailField label="ID gasto">
          <span className="break-all text-[11px] leading-snug text-muted-foreground">
            {expense.expenseId}
          </span>
        </OperationSaleDetailField>
      ) : null}
      <OperationSaleDetailField label="Fecha">
        {formatOperationDetailTimestamp(expense.operationAt, timeZone)}
      </OperationSaleDetailField>
      {expense.recordedByName ? (
        <OperationSaleDetailField label="Usuario">
          {expense.recordedByName}
        </OperationSaleDetailField>
      ) : null}
      <OperationSaleDetailField label="Categoría">
        {expense.categoryName}
      </OperationSaleDetailField>
      <OperationSaleDetailField label="Tipo">
        {expenseKindLabel(expense.sourceType)}
      </OperationSaleDetailField>
    </div>
  )
}
