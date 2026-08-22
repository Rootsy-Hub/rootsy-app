import {
  DEFAULT_INVOICE_TABLE_PAGE_SIZE,
  INVOICE_TABLE_PAGE_SIZES,
  type InvoiceStatusValue,
  isInvoiceStatusValue,
} from "@/app/[siteId]/[popId]/invoices/invoiceConstants"
import {
  appendWorkspaceTableSortParams,
  parseWorkspaceTableSortUrl,
  type WorkspaceTableSortDirection,
} from "@/lib/workspaceTableSort"

export type InvoiceTablePageSize = (typeof INVOICE_TABLE_PAGE_SIZES)[number]

export const INVOICE_TABLE_SORT_KEYS = [
  "cbte_fch",
  "imp_total",
  "receptor",
  "status",
] as const

export type InvoiceTableSortKey = (typeof INVOICE_TABLE_SORT_KEYS)[number]

export const INVOICE_RECIBO_X_FILTER = "recibo_x" as const

export type InvoiceCbteTipoFilter = number | typeof INVOICE_RECIBO_X_FILTER | ""

export type InvoicesWorkspaceUrlState = {
  q: string
  page: number
  pageSize: InvoiceTablePageSize
  /** Vacío = todos los estados. */
  status: InvoiceStatusValue | ""
  /** Vacío = todos los tipos. Código ARCA `CbteTipo`, o Recibo X. */
  cbteTipo: InvoiceCbteTipoFilter
  sort: InvoiceTableSortKey | null
  ord: WorkspaceTableSortDirection
}

function parsePageSize(raw: string | null): InvoiceTablePageSize {
  const n = Number(raw)
  if (INVOICE_TABLE_PAGE_SIZES.includes(n as InvoiceTablePageSize)) {
    return n as InvoiceTablePageSize
  }
  return DEFAULT_INVOICE_TABLE_PAGE_SIZE
}

function parseStatus(raw: string | null): InvoiceStatusValue | "" {
  const value = raw?.trim() ?? ""
  return isInvoiceStatusValue(value) ? value : ""
}

function parseCbteTipo(raw: string | null): InvoiceCbteTipoFilter {
  const value = raw?.trim() ?? ""
  if (value === INVOICE_RECIBO_X_FILTER || value === "x") {
    return INVOICE_RECIBO_X_FILTER
  }
  const n = Number(value)
  if (Number.isInteger(n) && n >= 1) return n
  return ""
}

export function parseInvoicesWorkspaceUrl(
  params: URLSearchParams,
): InvoicesWorkspaceUrlState {
  const pageRaw = Number(params.get("page"))
  const { sort, ord } = parseWorkspaceTableSortUrl(
    params,
    INVOICE_TABLE_SORT_KEYS,
  )
  return {
    q: params.get("q")?.trim() ?? "",
    page: Number.isFinite(pageRaw) && pageRaw >= 1 ? Math.floor(pageRaw) : 1,
    pageSize: parsePageSize(params.get("ps")),
    status: parseStatus(params.get("status")),
    cbteTipo: parseCbteTipo(params.get("tipo")),
    sort: sort as InvoiceTableSortKey | null,
    ord,
  }
}

export function mergeInvoicesWorkspaceUrl(
  current: URLSearchParams,
  patch: Partial<InvoicesWorkspaceUrlState>,
): URLSearchParams {
  const next = new URLSearchParams(current.toString())
  const merged = { ...parseInvoicesWorkspaceUrl(current), ...patch }

  if (merged.q) next.set("q", merged.q)
  else next.delete("q")

  if (merged.page > 1) next.set("page", String(merged.page))
  else next.delete("page")

  if (merged.pageSize !== DEFAULT_INVOICE_TABLE_PAGE_SIZE) {
    next.set("ps", String(merged.pageSize))
  } else {
    next.delete("ps")
  }

  if (merged.status) next.set("status", merged.status)
  else next.delete("status")

  if (merged.cbteTipo) next.set("tipo", String(merged.cbteTipo))
  else next.delete("tipo")

  next.delete("regimen")

  appendWorkspaceTableSortParams(next, {
    sort: merged.sort,
    ord: merged.ord,
  })

  if (
    patch.page === undefined &&
    (patch.q !== undefined ||
      patch.status !== undefined ||
      patch.cbteTipo !== undefined ||
      patch.sort !== undefined ||
      patch.ord !== undefined)
  ) {
    if (merged.page !== 1) next.set("page", "1")
    else next.delete("page")
  }

  return next
}

export { INVOICE_TABLE_PAGE_SIZES, DEFAULT_INVOICE_TABLE_PAGE_SIZE }
