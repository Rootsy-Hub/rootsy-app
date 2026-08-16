import type {
  OperationExpenseLedgerRow,
  OperationPurchaseRow,
} from "@/app/[siteId]/[popId]/operations/actions"
import { buildCsv, downloadCsv } from "@/lib/exportCsv"
import {
  buildExpensesReportCsvRows,
  buildPurchasesReportCsvRows,
  EXPENSES_REPORT_CSV_HEADERS,
  purchasesExpensesExportFilename,
  PURCHASES_REPORT_CSV_HEADERS,
} from "@/lib/purchasesExpensesReportExportData"

export function exportPurchasesReportCsv(
  rows: OperationPurchaseRow[],
  options?: { timeZone?: string; periodSummary?: string },
): void {
  downloadCsv(
    purchasesExpensesExportFilename("purchases", "csv", options?.periodSummary ?? ""),
    buildCsv(
      [...PURCHASES_REPORT_CSV_HEADERS],
      buildPurchasesReportCsvRows(rows, options?.timeZone),
    ),
  )
}

export function exportExpensesReportCsv(
  rows: OperationExpenseLedgerRow[],
  options?: { timeZone?: string; periodSummary?: string },
): void {
  downloadCsv(
    purchasesExpensesExportFilename("expenses", "csv", options?.periodSummary ?? ""),
    buildCsv(
      [...EXPENSES_REPORT_CSV_HEADERS],
      buildExpensesReportCsvRows(rows, options?.timeZone),
    ),
  )
}
