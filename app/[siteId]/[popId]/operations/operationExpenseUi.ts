import type { OperationExpenseLedgerRow } from "@/app/[siteId]/[popId]/operations/actions"

export function expenseKindLabel(
  sourceType: OperationExpenseLedgerRow["sourceType"],
): string {
  return sourceType === "expense_void" ? "Anulación" : "Pago"
}

export function expenseDetailTitle(expense: OperationExpenseLedgerRow): string {
  return expense.sourceType === "expense_void"
    ? "Anulación de gasto"
    : "Detalle de gasto"
}

export function expenseDescriptionLabel(description: string): string {
  const trimmed = description.trim()
  return trimmed && trimmed !== "—" ? trimmed : "Sin descripción"
}
