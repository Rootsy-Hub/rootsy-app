import type { CashRegistersPeriodReportRow } from "@/app/[siteId]/[popId]/cash-registers/actions"
import { formatCashRegisterDateTime } from "@/app/[siteId]/[popId]/cash-registers/cashRegisterFormatters"

export const CASH_REGISTERS_REPORT_CSV_HEADERS = [
  "Caja",
  "Arqueo",
  "Apertura",
  "Abierto por",
  "Cierre",
  "Cerrado por",
  "Total cobrado",
  "Diferencia",
] as const

export const CASH_REGISTERS_REPORT_PDF_HEADERS = [
  "Caja",
  "Arqueo",
  "Apertura",
  "Abierto por",
  "Cierre",
  "Cerrado por",
  "Total cobrado",
  "Diferencia",
] as const

function formatExportMoney(n: number): string {
  return n.toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function formatExportDifference(diff: number | null): string {
  if (diff == null) return "—"
  return formatExportMoney(diff)
}

function arqueoLabel(row: CashRegistersPeriodReportRow): string {
  return row.arqueoNumber > 0 ? `#${row.arqueoNumber}` : "—"
}

export function sumCashRegistersReportTotalCobrado(
  rows: CashRegistersPeriodReportRow[],
): number {
  return rows.reduce((sum, row) => sum + row.totalCobrado, 0)
}

export function sumCashRegistersReportDifference(
  rows: CashRegistersPeriodReportRow[],
): number {
  return rows.reduce(
    (sum, row) => sum + (row.cashArqueoDifference ?? 0),
    0,
  )
}

export function cashRegistersReportExportFilename(
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
  const base = slug
    ? `arqueo-de-caja-${slug}-${stamp}`
    : `arqueo-de-caja-${stamp}`
  return `${base}.${extension}`
}

export function buildCashRegistersReportCsvRows(
  rows: CashRegistersPeriodReportRow[],
  timeZone?: string,
) {
  return rows.map((row) => [
    row.registerName,
    arqueoLabel(row),
    formatCashRegisterDateTime(row.openedAt, timeZone),
    row.openedByName ?? "—",
    row.closedAt
      ? formatCashRegisterDateTime(row.closedAt, timeZone)
      : "—",
    row.closedByName ?? "—",
    formatExportMoney(row.totalCobrado),
    formatExportDifference(row.cashArqueoDifference),
  ])
}

export function buildCashRegistersReportPdfRows(
  rows: CashRegistersPeriodReportRow[],
  timeZone?: string,
) {
  return rows.map((row) => [
    row.registerName,
    arqueoLabel(row),
    formatCashRegisterDateTime(row.openedAt, timeZone),
    row.openedByName ?? "—",
    row.closedAt
      ? formatCashRegisterDateTime(row.closedAt, timeZone)
      : "—",
    row.closedByName ?? "—",
    formatExportMoney(row.totalCobrado),
    formatExportDifference(row.cashArqueoDifference),
  ])
}
