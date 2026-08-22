import type {
  CreateExpenseInput,
  ExpenseCategoryRow,
  ExpenseListRow,
  MonthProgress,
  RecordExpensePaymentInput,
} from "@/app/[siteId]/[popId]/expenses/actions"
import type { TreasuryPaymentContext } from "@/lib/treasuryPaymentOptions"

type ApiOk<T> = { success: true; data: T }
type ApiErr = { success: false; error?: string }
type MutateResult = { success: true } | { success: false; error: string }

type ApiCategory = {
  id: string
  name: string
  kind: ExpenseCategoryRow["kind"]
  sortOrder: number
  deletedAt: string | null
  accountingChartAccountId: string | null
  accountCode: string | null
  readOnly: boolean
  canDelete: boolean
}

type ListData = {
  rows: ExpenseListRow[]
  ledgerByCategoryId: Record<string, number>
  progress: MonthProgress
  categories: ApiCategory[]
}

export type PopExpensesMonthResult =
  | {
      success: true
      rows: ExpenseListRow[]
      ledgerByCategoryId: Record<string, number>
      progress: MonthProgress
      categories: ExpenseCategoryRow[]
    }
  | {
      success: false
      error: string
      rows: ExpenseListRow[]
      ledgerByCategoryId: Record<string, number>
      progress: MonthProgress
      categories: ExpenseCategoryRow[]
    }

const EMPTY: Omit<
  Extract<PopExpensesMonthResult, { success: false }>,
  "success" | "error"
> = {
  rows: [],
  ledgerByCategoryId: {},
  progress: { totalDue: 0, totalPaid: 0 },
  categories: [],
}

export function mapExpenseCategory(row: ApiCategory): ExpenseCategoryRow {
  return {
    id: row.id,
    name: row.name,
    kind: row.kind,
    sortOrder: row.sortOrder,
    deletedAt: row.deletedAt,
    chartAccountId: row.accountingChartAccountId,
    accountCode: row.accountCode,
    readOnly: row.readOnly,
    canDelete: row.canDelete,
  }
}

async function parseMutate(res: Response): Promise<MutateResult> {
  const json = (await res.json().catch(() => null)) as
    | { success?: boolean; error?: string }
    | null
  if (res.ok && json && json.success) return { success: true }
  return {
    success: false,
    error:
      json && typeof json.error === "string" && json.error
        ? json.error
        : `HTTP ${res.status}`,
  }
}

export async function fetchPopExpensesMonth(
  popId: string,
  year: number,
  month: number,
): Promise<PopExpensesMonthResult> {
  const params = new URLSearchParams({
    year: String(year),
    month: String(month),
  })
  const res = await fetch(`/api/pops/${popId}/expenses?${params}`, {
    headers: { accept: "application/json" },
  })
  const json = (await res.json().catch(() => null)) as
    | ApiOk<ListData>
    | ApiErr
    | null
  if (res.ok && json && "success" in json && json.success) {
    return {
      success: true,
      rows: json.data.rows,
      ledgerByCategoryId: json.data.ledgerByCategoryId,
      progress: json.data.progress,
      categories: json.data.categories.map(mapExpenseCategory),
    }
  }
  return {
    success: false,
    error:
      json && "error" in json && json.error ? json.error : `HTTP ${res.status}`,
    ...EMPTY,
  }
}

export async function fetchExpensePaymentContext(
  popId: string,
): Promise<
  | { success: true; context: TreasuryPaymentContext }
  | { success: false; error: string }
> {
  const res = await fetch(`/api/pops/${popId}/expenses/payment-context`, {
    headers: { accept: "application/json" },
  })
  const json = (await res.json().catch(() => null)) as
    | ApiOk<TreasuryPaymentContext>
    | ApiErr
    | null
  if (res.ok && json && "success" in json && json.success) {
    return { success: true, context: json.data }
  }
  return {
    success: false,
    error:
      json && "error" in json && json.error ? json.error : `HTTP ${res.status}`,
  }
}

export async function createExpense(
  popId: string,
  year: number,
  month: number,
  input: CreateExpenseInput,
): Promise<{ success: true; id: string } | { success: false; error: string }> {
  const res = await fetch(`/api/pops/${popId}/expenses`, {
    method: "POST",
    headers: { accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ ...input, year, month }),
  })
  const json = (await res.json().catch(() => null)) as
    | ApiOk<{ id: string }>
    | ApiErr
    | null
  if (res.ok && json && "success" in json && json.success) {
    return { success: true, id: json.data.id }
  }
  return {
    success: false,
    error:
      json && "error" in json && json.error ? json.error : `HTTP ${res.status}`,
  }
}

export async function recordExpensePayment(
  popId: string,
  expenseId: string,
  input: RecordExpensePaymentInput,
): Promise<MutateResult> {
  const res = await fetch(`/api/pops/${popId}/expenses/${expenseId}/payments`, {
    method: "POST",
    headers: { accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
  return parseMutate(res)
}

export async function deleteExpense(
  popId: string,
  expenseId: string,
): Promise<MutateResult> {
  const res = await fetch(`/api/pops/${popId}/expenses/${expenseId}`, {
    method: "DELETE",
    headers: { accept: "application/json" },
  })
  return parseMutate(res)
}

export async function voidExpense(
  popId: string,
  expenseId: string,
  reason: string,
): Promise<MutateResult> {
  const res = await fetch(`/api/pops/${popId}/expenses/${expenseId}/void`, {
    method: "POST",
    headers: { accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ reason }),
  })
  return parseMutate(res)
}

export async function fetchPopExpenseCategories(
  popId: string,
): Promise<
  | { success: true; categories: ExpenseCategoryRow[] }
  | { success: false; error: string; categories: ExpenseCategoryRow[] }
> {
  const params = new URLSearchParams({ includeDeleted: "true" })
  const res = await fetch(`/api/pops/${popId}/expense-categories?${params}`, {
    headers: { accept: "application/json" },
  })
  const json = (await res.json().catch(() => null)) as
    | ApiOk<ApiCategory[]>
    | ApiErr
    | null
  if (res.ok && json && "success" in json && json.success) {
    return { success: true, categories: json.data.map(mapExpenseCategory) }
  }
  return {
    success: false,
    error:
      json && "error" in json && json.error ? json.error : `HTTP ${res.status}`,
    categories: [],
  }
}

export async function createExpenseCategory(
  popId: string,
  name: string,
  kind: "fijo" | "variable",
  family: "administracion" | "comercializacion" | "financiera",
): Promise<MutateResult> {
  const res = await fetch(`/api/pops/${popId}/expense-categories`, {
    method: "POST",
    headers: { accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ name, kind, family }),
  })
  return parseMutate(res)
}

export async function deleteExpenseCategory(
  popId: string,
  categoryId: string,
): Promise<MutateResult> {
  const res = await fetch(`/api/pops/${popId}/expense-categories/${categoryId}`, {
    method: "DELETE",
    headers: { accept: "application/json" },
  })
  return parseMutate(res)
}
