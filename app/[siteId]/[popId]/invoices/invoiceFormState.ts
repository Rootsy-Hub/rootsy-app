import type { InvoiceStatusValue } from "@/app/[siteId]/[popId]/invoices/invoiceConstants"

export type InvoicesAppliedFilters = {
  status: InvoiceStatusValue | ""
}

export function defaultInvoicesFilters(): InvoicesAppliedFilters {
  return { status: "" }
}
