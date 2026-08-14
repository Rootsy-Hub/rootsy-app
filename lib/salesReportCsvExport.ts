import type { OperationSaleRow } from "@/app/[siteId]/[popId]/operations/actions"
import { buildCsv, downloadCsv } from "@/lib/exportCsv"
import {
  buildSalesReportCsvRows,
  SALES_REPORT_CSV_HEADERS,
  salesReportExportFilename,
} from "@/lib/salesReportExportData"

export function exportSalesDetailReportCsv(
  rows: OperationSaleRow[],
  options?: { timeZone?: string; periodSummary?: string },
): void {
  downloadCsv(
    salesReportExportFilename("csv", options?.periodSummary ?? ""),
    buildCsv([...SALES_REPORT_CSV_HEADERS], buildSalesReportCsvRows(rows, options?.timeZone)),
  )
}
