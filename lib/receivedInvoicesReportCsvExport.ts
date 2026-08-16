import type { OperationPurchaseRow } from "@/app/[siteId]/[popId]/operations/actions"
import { buildCsv, downloadCsv } from "@/lib/exportCsv"
import {
  buildReceivedInvoicesReportCsvRows,
  RECEIVED_INVOICES_REPORT_CSV_HEADERS,
  receivedInvoicesReportExportFilename,
} from "@/lib/receivedInvoicesReportExportData"

export function exportReceivedInvoicesReportCsv(
  rows: OperationPurchaseRow[],
  options?: { timeZone?: string; periodSummary?: string },
): void {
  downloadCsv(
    receivedInvoicesReportExportFilename("csv", options?.periodSummary ?? ""),
    buildCsv(
      [...RECEIVED_INVOICES_REPORT_CSV_HEADERS],
      buildReceivedInvoicesReportCsvRows(rows, options?.timeZone),
    ),
  )
}
