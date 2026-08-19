export type ExpenseCategoryKind = "fijo" | "variable" | "otro"

export type ExpenseCategoryFamily =
  | "administracion"
  | "comercializacion"
  | "financiera"

export const EXPENSE_CHART_FAMILY_PREFIX: Record<
  ExpenseCategoryFamily,
  string
> = {
  administracion: "6.1.1",
  comercializacion: "6.2.1",
  financiera: "6.3.1",
}

export const EXPENSE_CHART_FAMILY_LABEL: Record<ExpenseCategoryFamily, string> =
  {
    administracion: "Administración",
    comercializacion: "Comercialización",
    financiera: "Financieros",
  }

/** Cuentas que usa otro módulo: se ven en Gastos y no se operan. */
export const EXPENSE_SYSTEM_VIEW_ONLY_CODES = [
  "6.1.1.03",
  "6.1.1.04",
  "6.1.1.05",
  "6.2.1.03",
  "6.3.1.01",
] as const

const EXPENSE_DEFAULT_KIND_BY_CODE: Record<string, ExpenseCategoryKind> = {
  "6.1.1.01": "fijo",
  "6.1.1.02": "fijo",
  "6.1.1.03": "otro",
  "6.1.1.04": "otro",
  "6.1.1.05": "otro",
  "6.2.1.01": "variable",
  "6.2.1.02": "variable",
  "6.2.1.03": "otro",
  "6.2.1.99": "variable",
  "6.3.1.01": "otro",
}

export function kindForExpenseChartCode(code: string): ExpenseCategoryKind {
  return EXPENSE_DEFAULT_KIND_BY_CODE[code.trim()] ?? "variable"
}

export function isExpenseSystemViewOnlyCode(code: string): boolean {
  return (EXPENSE_SYSTEM_VIEW_ONLY_CODES as readonly string[]).includes(
    code.trim(),
  )
}

export function isExpenseDefaultChartCode(code: string): boolean {
  return Object.prototype.hasOwnProperty.call(
    EXPENSE_DEFAULT_KIND_BY_CODE,
    code.trim(),
  )
}

export function isExpenseCategoryKind(value: unknown): value is ExpenseCategoryKind {
  return value === "fijo" || value === "variable" || value === "otro"
}

export function parseExpenseCategoryKind(value: unknown): ExpenseCategoryKind {
  if (value === "variable" || value === "otro") return value
  return "fijo"
}

export function nextExpenseChartCode(
  prefix: string,
  existingCodes: readonly string[],
): string {
  const used = new Set<number>()
  const needle = `${prefix}.`
  for (const code of existingCodes) {
    if (!code.startsWith(needle)) continue
    const suffix = code.slice(needle.length)
    const n = Number.parseInt(suffix, 10)
    if (Number.isFinite(n)) used.add(n)
  }
  let next = 1
  while (used.has(next) || (prefix === "6.2.1" && next === 99)) {
    next += 1
  }
  return `${prefix}.${String(next).padStart(2, "0")}`
}
