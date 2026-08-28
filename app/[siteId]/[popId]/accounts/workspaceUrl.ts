export const ACCOUNT_FILTERS = [
  "todas",
  "banco",
  "billetera",
  "efectivo",
  "inactivas",
] as const

export type AccountFilter = (typeof ACCOUNT_FILTERS)[number]

export const ACCOUNT_FILTER_OPTIONS = [
  { value: "todas", label: "Todas" },
  { value: "banco", label: "Banco" },
  { value: "billetera", label: "Billetera" },
  { value: "efectivo", label: "Efectivo" },
  { value: "inactivas", label: "Inactivas" },
] as const

export type AccountsWorkspaceUrlState = {
  filter: AccountFilter
}

function parseFilter(raw: string | null): AccountFilter {
  const value = raw?.trim() ?? ""
  return ACCOUNT_FILTERS.includes(value as AccountFilter)
    ? (value as AccountFilter)
    : "todas"
}

export function parseAccountsWorkspaceUrl(
  params: URLSearchParams,
): AccountsWorkspaceUrlState {
  return { filter: parseFilter(params.get("f")) }
}

export function mergeAccountsWorkspaceUrl(
  current: URLSearchParams,
  patch: Partial<AccountsWorkspaceUrlState>,
): URLSearchParams {
  const next = new URLSearchParams(current.toString())
  const merged = { ...parseAccountsWorkspaceUrl(current), ...patch }
  if (merged.filter !== "todas") next.set("f", merged.filter)
  else next.delete("f")
  return next
}
