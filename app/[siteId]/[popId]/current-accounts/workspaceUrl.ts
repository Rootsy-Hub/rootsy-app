import {
  isCurrentAccountAgingFilter,
  isCurrentAccountDirection,
  type CurrentAccountAgingFilter,
  type CurrentAccountDirection,
} from "@/lib/currentAccounts"
import {
  appendWorkspaceTableSortParams,
  parseWorkspaceTableSortUrl,
  type WorkspaceTableSortDirection,
} from "@/lib/workspaceTableSort"

export const CURRENT_ACCOUNT_TABLE_PAGE_SIZES = [10, 25, 50] as const
export const DEFAULT_CURRENT_ACCOUNT_TABLE_PAGE_SIZE = 25

export type CurrentAccountTablePageSize =
  (typeof CURRENT_ACCOUNT_TABLE_PAGE_SIZES)[number]

export const CURRENT_ACCOUNT_TABLE_SORT_KEYS = [
  "party_name",
  "open_count",
  "overdue",
  "balance",
] as const

export type CurrentAccountTableSortKey =
  (typeof CURRENT_ACCOUNT_TABLE_SORT_KEYS)[number]

export type CurrentAccountsWorkspaceUrlState = {
  q: string
  page: number
  pageSize: CurrentAccountTablePageSize
  direction: CurrentAccountDirection
  aging: CurrentAccountAgingFilter
  partyId: string
  view: "open" | "ledger"
  sort: CurrentAccountTableSortKey | null
  ord: WorkspaceTableSortDirection
}

function parsePageSize(raw: string | null): CurrentAccountTablePageSize {
  const n = Number(raw)
  if (
    CURRENT_ACCOUNT_TABLE_PAGE_SIZES.includes(
      n as CurrentAccountTablePageSize,
    )
  ) {
    return n as CurrentAccountTablePageSize
  }
  return DEFAULT_CURRENT_ACCOUNT_TABLE_PAGE_SIZE
}

function parseDirection(raw: string | null): CurrentAccountDirection {
  const value = raw?.trim() ?? ""
  return isCurrentAccountDirection(value) ? value : "receivable"
}

function parseAging(raw: string | null): CurrentAccountAgingFilter {
  const value = raw?.trim() ?? ""
  return isCurrentAccountAgingFilter(value) ? value : "all"
}

function parseView(raw: string | null): "open" | "ledger" {
  return raw === "ledger" ? "ledger" : "open"
}

function parsePartyId(raw: string | null): string {
  const value = raw?.trim() ?? ""
  return /^[0-9a-f-]{36}$/i.test(value) ? value : ""
}

export function parseCurrentAccountsWorkspaceUrl(
  params: URLSearchParams,
): CurrentAccountsWorkspaceUrlState {
  const pageRaw = Number(params.get("page"))
  const { sort, ord } = parseWorkspaceTableSortUrl(
    params,
    CURRENT_ACCOUNT_TABLE_SORT_KEYS,
  )
  return {
    q: params.get("q")?.trim() ?? "",
    page: Number.isFinite(pageRaw) && pageRaw >= 1 ? Math.floor(pageRaw) : 1,
    pageSize: parsePageSize(params.get("ps")),
    direction: parseDirection(params.get("dir")),
    aging: parseAging(params.get("age")),
    partyId: parsePartyId(params.get("party")),
    view: parseView(params.get("view")),
    sort: sort as CurrentAccountTableSortKey | null,
    ord,
  }
}

export function mergeCurrentAccountsWorkspaceUrl(
  current: URLSearchParams,
  patch: Partial<CurrentAccountsWorkspaceUrlState>,
): URLSearchParams {
  const next = new URLSearchParams(current.toString())
  const merged = { ...parseCurrentAccountsWorkspaceUrl(current), ...patch }

  if (merged.q) next.set("q", merged.q)
  else next.delete("q")

  if (merged.page > 1) next.set("page", String(merged.page))
  else next.delete("page")

  if (merged.pageSize !== DEFAULT_CURRENT_ACCOUNT_TABLE_PAGE_SIZE) {
    next.set("ps", String(merged.pageSize))
  } else {
    next.delete("ps")
  }

  if (merged.direction !== "receivable") next.set("dir", merged.direction)
  else next.delete("dir")

  if (merged.aging !== "all") next.set("age", merged.aging)
  else next.delete("age")

  if (merged.partyId) next.set("party", merged.partyId)
  else next.delete("party")

  if (merged.view === "ledger") next.set("view", "ledger")
  else next.delete("view")

  appendWorkspaceTableSortParams(next, {
    sort: merged.sort,
    ord: merged.ord,
  })

  if (
    patch.page === undefined &&
    (patch.q !== undefined ||
      patch.direction !== undefined ||
      patch.aging !== undefined ||
      patch.sort !== undefined ||
      patch.ord !== undefined)
  ) {
    if (merged.page !== 1) next.set("page", "1")
    else next.delete("page")
  }

  return next
}
