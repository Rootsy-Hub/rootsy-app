import type { OperationPurchaseRow } from "@/app/[siteId]/[popId]/operations/actions"
import { resolvePurchaseDisplayTaxTotal } from "@/app/[siteId]/[popId]/operations/operationPurchaseUi"
import {
  buildPurchasesReportCsvRows,
  buildPurchasesReportPdfRows,
  PURCHASES_REPORT_CSV_HEADERS,
  PURCHASES_REPORT_PDF_HEADERS,
} from "@/lib/purchasesExpensesReportExportData"

export const RECEIVED_INVOICES_REPORT_CSV_HEADERS = PURCHASES_REPORT_CSV_HEADERS
export const RECEIVED_INVOICES_REPORT_PDF_HEADERS = PURCHASES_REPORT_PDF_HEADERS

export function receivedInvoicesReportExportFilename(
  extension: "csv" | "pdf",
  periodSummary: string,
): string {
  const stamp = new Date().toISOString().slice(0, 10)
  const slug = periodSummary
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48)
  const base = "facturas-recibidas"
  return slug ? `${base}-${slug}-${stamp}.${extension}` : `${base}-${stamp}.${extension}`
}

export function buildReceivedInvoicesReportCsvRows(
  rows: OperationPurchaseRow[],
  timeZone?: string,
) {
  return buildPurchasesReportCsvRows(rows, timeZone)
}

export function buildReceivedInvoicesReportPdfRows(
  rows: OperationPurchaseRow[],
  timeZone?: string,
) {
  return buildPurchasesReportPdfRows(rows, timeZone)
}

export function sumReceivedInvoicesReportTotal(rows: OperationPurchaseRow[]): number {
  return rows.reduce((acc, row) => acc + row.total, 0)
}

export function sumReceivedInvoicesReportIva(rows: OperationPurchaseRow[]): number {
  return rows.reduce(
    (acc, row) => acc + (resolvePurchaseDisplayTaxTotal(row) ?? 0),
    0,
  )
}
