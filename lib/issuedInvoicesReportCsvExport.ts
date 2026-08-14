import type { InvoiceArcaTableRow } from "@/app/[siteId]/[popId]/invoices/actions"
import { buildCsv, downloadCsv } from "@/lib/exportCsv"
import {
  buildIssuedInvoicesReportCsvRows,
  ISSUED_INVOICES_REPORT_CSV_HEADERS,
  issuedInvoicesReportExportFilename,
} from "@/lib/issuedInvoicesReportExportData"

export function exportIssuedInvoicesReportCsv(
  rows: InvoiceArcaTableRow[],
  options?: { periodSummary?: string },
): void {
  downloadCsv(
    issuedInvoicesReportExportFilename("csv", options?.periodSummary ?? ""),
    buildCsv(
      [...ISSUED_INVOICES_REPORT_CSV_HEADERS],
      buildIssuedInvoicesReportCsvRows(rows),
    ),
  )
}
