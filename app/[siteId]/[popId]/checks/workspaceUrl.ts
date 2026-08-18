import {
  isCheckDirection,
  isCheckStatus,
  type CheckDirection,
  type CheckStatus,
} from "@/lib/checkDocuments"
import {
  appendWorkspaceTableSortParams,
  parseWorkspaceTableSortUrl,
  type WorkspaceTableSortDirection,
} from "@/lib/workspaceTableSort"

export const CHECK_TABLE_PAGE_SIZES = [10, 25, 50] as const
export const DEFAULT_CHECK_TABLE_PAGE_SIZE = 25

export type CheckTablePageSize = (typeof CHECK_TABLE_PAGE_SIZES)[number]

export const CHECK_TABLE_SORT_KEYS = [
  "check_number",
  "direction",
  "bank_name",
  "amount",
  "issue_date",
  "due_date",
  "status",
] as const

export type CheckTableSortKey = (typeof CHECK_TABLE_SORT_KEYS)[number]

export type ChecksWorkspaceUrlState = {
  q: string
  page: number
  pageSize: CheckTablePageSize
  direction: CheckDirection | ""
  status: CheckStatus | ""
  sort: CheckTableSortKey | null
  ord: WorkspaceTableSortDirection
}

function parsePageSize(raw: string | null): CheckTablePageSize {
  const n = Number(raw)
  if (CHECK_TABLE_PAGE_SIZES.includes(n as CheckTablePageSize)) {
    return n as CheckTablePageSize
  }
  return DEFAULT_CHECK_TABLE_PAGE_SIZE
}

function parseDirection(raw: string | null): CheckDirection | "" {
  const value = raw?.trim() ?? ""
  return isCheckDirection(value) ? value : ""
}

function parseStatus(raw: string | null): CheckStatus | "" {
  const value = raw?.trim() ?? ""
  return isCheckStatus(value) ? value : ""
}

export function parseChecksWorkspaceUrl(
  params: URLSearchParams,
): ChecksWorkspaceUrlState {
  const pageRaw = Number(params.get("page"))
  const { sort, ord } = parseWorkspaceTableSortUrl(params, CHECK_TABLE_SORT_KEYS)
  return {
    q: params.get("q")?.trim() ?? "",
    page: Number.isFinite(pageRaw) && pageRaw >= 1 ? Math.floor(pageRaw) : 1,
    pageSize: parsePageSize(params.get("ps")),
    direction: parseDirection(params.get("dir")),
    status: parseStatus(params.get("status")),
    sort: sort as CheckTableSortKey | null,
    ord,
  }
}

export function mergeChecksWorkspaceUrl(
  current: URLSearchParams,
  patch: Partial<ChecksWorkspaceUrlState>,
): URLSearchParams {
  const next = new URLSearchParams(current.toString())
  const merged = { ...parseChecksWorkspaceUrl(current), ...patch }

  if (merged.q) next.set("q", merged.q)
  else next.delete("q")

  if (merged.page > 1) next.set("page", String(merged.page))
  else next.delete("page")

  if (merged.pageSize !== DEFAULT_CHECK_TABLE_PAGE_SIZE) {
    next.set("ps", String(merged.pageSize))
  } else {
    next.delete("ps")
  }

  if (merged.direction) next.set("dir", merged.direction)
  else next.delete("dir")

  if (merged.status) next.set("status", merged.status)
  else next.delete("status")

  appendWorkspaceTableSortParams(next, {
    sort: merged.sort,
    ord: merged.ord,
  })

  if (
    patch.page === undefined &&
    (patch.q !== undefined ||
      patch.direction !== undefined ||
      patch.status !== undefined ||
      patch.sort !== undefined ||
      patch.ord !== undefined)
  ) {
    if (merged.page !== 1) next.set("page", "1")
    else next.delete("page")
  }

  return next
}
