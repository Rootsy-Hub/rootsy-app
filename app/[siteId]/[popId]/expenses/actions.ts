export type ExpenseCategoryKind = "fijo" | "variable" | "otro"
export type ExpenseCategoryFamily =
  | "administracion"
  | "comercializacion"
  | "financiera"

export type ExpenseCategoryRow = {
  id: string
  name: string
  kind: ExpenseCategoryKind
  sortOrder: number
  deletedAt: string | null
  chartAccountId: string | null
  accountCode: string | null
  readOnly: boolean
  canDelete: boolean
}

export type ExpenseStatus = "pending" | "partial" | "paid" | "voided"

export type ExpenseListRow = {
  id: string
  amount: number
  currency: string
  expenseDate: string
  dueDate: string | null
  description: string
  status: ExpenseStatus
  voidedAt: string | null
  voidReason: string | null
  categoryId: string
  categoryName: string
  categoryKind: ExpenseCategoryKind
  categoryDeletedAt: string | null
  paidTotal: number
}

export type MonthProgress = {
  totalDue: number
  totalPaid: number
}

export type CreateExpenseInput = {
  categoryId: string
  amount: number
  expenseDate: string
  dueDate: string | null
  description: string
}

export type RecordExpensePaymentInput = {
  amount: number
  paidAt: string
  paymentKind: string | null
  treasuryAccountId: string | null
  checkDetails?: unknown
}
