import type { InvoiceRegimenValue } from "@/app/[siteId]/[popId]/invoices/invoiceConstants"

export type InvoicesAppliedFilters = {
  regimen: InvoiceRegimenValue | ""
}

export function defaultInvoicesFilters(): InvoicesAppliedFilters {
  return { regimen: "" }
}
