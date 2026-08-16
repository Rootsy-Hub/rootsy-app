import type { CashRegistersPeriodReportRow } from "@/app/[siteId]/[popId]/cash-registers/actions"
import { buildCsv, downloadCsv } from "@/lib/exportCsv"
import {
  appendReportCsvBranding,
  formatReportExportGeneratedAt,
  type ReportExportContext,
} from "@/lib/reportExportBranding"
import {
  buildCashRegistersReportCsvRows,
  CASH_REGISTERS_REPORT_CSV_HEADERS,
  cashRegistersReportExportFilename,
} from "@/lib/cashRegistersReportExportData"

export function exportCashRegistersReportCsv(
  rows: CashRegistersPeriodReportRow[],
  options: {
    timeZone?: string
    periodSummary?: string
    exportContext: ReportExportContext
  },
): void {
  const csv = buildCsv(
    [...CASH_REGISTERS_REPORT_CSV_HEADERS],
    buildCashRegistersReportCsvRows(rows, options.timeZone),
  )

  downloadCsv(
    cashRegistersReportExportFilename("csv", options.periodSummary ?? ""),
    appendReportCsvBranding(csv, options.exportContext, {
      periodLabel: options.periodSummary ?? "",
      generatedAt: formatReportExportGeneratedAt(options.timeZone),
    }),
  )
}
