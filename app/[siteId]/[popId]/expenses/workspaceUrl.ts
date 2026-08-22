export type ExpensesWorkspaceUrlState = {
  year: number
  month1: number
}

function currentMonth(): ExpensesWorkspaceUrlState {
  const now = new Date()
  return { year: now.getFullYear(), month1: now.getMonth() + 1 }
}

export function parseExpensesWorkspaceUrl(
  params: URLSearchParams,
): ExpensesWorkspaceUrlState {
  const fallback = currentMonth()
  const yearRaw = Number(params.get("y"))
  const monthRaw = Number(params.get("m"))
  const year =
    Number.isFinite(yearRaw) && yearRaw >= 2000 && yearRaw <= 2100
      ? Math.floor(yearRaw)
      : fallback.year
  const month1 =
    Number.isFinite(monthRaw) && monthRaw >= 1 && monthRaw <= 12
      ? Math.floor(monthRaw)
      : fallback.month1
  return { year, month1 }
}

export function mergeExpensesWorkspaceUrl(
  current: URLSearchParams,
  patch: Partial<ExpensesWorkspaceUrlState>,
): URLSearchParams {
  const next = new URLSearchParams(current.toString())
  const merged = { ...parseExpensesWorkspaceUrl(current), ...patch }
  const fallback = currentMonth()
  if (merged.year === fallback.year) next.delete("y")
  else next.set("y", String(merged.year))
  if (merged.month1 === fallback.month1) next.delete("m")
  else next.set("m", String(merged.month1))
  return next
}
