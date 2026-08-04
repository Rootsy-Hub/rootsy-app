import {
  DEFAULT_INVOICE_TABLE_PAGE_SIZE,
  INVOICE_TABLE_PAGE_SIZES,
  type InvoiceRegimenValue,
  type InvoiceStatusValue,
  isInvoiceRegimenValue,
  isInvoiceStatusValue,
} from "@/app/[siteId]/[popId]/invoices/invoiceConstants"

export type InvoiceTablePageSize = (typeof INVOICE_TABLE_PAGE_SIZES)[number]

export type InvoicesWorkspaceUrlState = {
  q: string
  page: number
  pageSize: InvoiceTablePageSize
  /** Vacío = todos los estados. */
  status: InvoiceStatusValue | ""
  /** Vacío = todos los regímenes. */
  regimen: InvoiceRegimenValue | ""
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

function parseRegimen(raw: string | null): InvoiceRegimenValue | "" {
  const value = raw?.trim() ?? ""
  return isInvoiceRegimenValue(value) ? value : ""
}

export function parseInvoicesWorkspaceUrl(
  params: URLSearchParams,
): InvoicesWorkspaceUrlState {
  const pageRaw = Number(params.get("page"))
  return {
    q: params.get("q")?.trim() ?? "",
    page: Number.isFinite(pageRaw) && pageRaw >= 1 ? Math.floor(pageRaw) : 1,
    pageSize: parsePageSize(params.get("ps")),
    status: parseStatus(params.get("status")),
    regimen: parseRegimen(params.get("regimen")),
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

  if (merged.regimen) next.set("regimen", merged.regimen)
  else next.delete("regimen")

  if (
    patch.page === undefined &&
    (patch.q !== undefined ||
      patch.status !== undefined ||
      patch.regimen !== undefined)
  ) {
    if (merged.page !== 1) next.set("page", "1")
    else next.delete("page")
  }

  return next
}

export { INVOICE_TABLE_PAGE_SIZES, DEFAULT_INVOICE_TABLE_PAGE_SIZE }
