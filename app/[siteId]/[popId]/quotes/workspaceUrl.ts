import {
  DEFAULT_QUOTE_TABLE_PAGE_SIZE,
  QUOTE_TABLE_PAGE_SIZES,
} from "@/app/[siteId]/[popId]/quotes/quoteConstants"

export type QuoteTablePageSize = (typeof QUOTE_TABLE_PAGE_SIZES)[number]

export type QuotesWorkspaceUrlState = {
  q: string
  page: number
  pageSize: QuoteTablePageSize
}

function parsePageSize(raw: string | null): QuoteTablePageSize {
  const n = Number(raw)
  if (QUOTE_TABLE_PAGE_SIZES.includes(n as QuoteTablePageSize)) {
    return n as QuoteTablePageSize
  }
  return DEFAULT_QUOTE_TABLE_PAGE_SIZE
}

export function parseQuotesWorkspaceUrl(
  params: URLSearchParams,
): QuotesWorkspaceUrlState {
  const pageRaw = Number(params.get("page"))
  return {
    q: params.get("q")?.trim() ?? "",
    page: Number.isFinite(pageRaw) && pageRaw >= 1 ? Math.floor(pageRaw) : 1,
    pageSize: parsePageSize(params.get("ps")),
  }
}

export function mergeQuotesWorkspaceUrl(
  current: URLSearchParams,
  patch: Partial<QuotesWorkspaceUrlState>,
): URLSearchParams {
  const next = new URLSearchParams(current.toString())
  const merged = { ...parseQuotesWorkspaceUrl(current), ...patch }

  if (merged.q) next.set("q", merged.q)
  else next.delete("q")

  if (merged.page > 1) next.set("page", String(merged.page))
  else next.delete("page")

  if (merged.pageSize !== DEFAULT_QUOTE_TABLE_PAGE_SIZE) {
    next.set("ps", String(merged.pageSize))
  } else {
    next.delete("ps")
  }

  if (
    patch.page === undefined &&
    (patch.q !== undefined || patch.pageSize !== undefined)
  ) {
    if (merged.page !== 1) next.set("page", "1")
    else next.delete("page")
  }

  return next
}
