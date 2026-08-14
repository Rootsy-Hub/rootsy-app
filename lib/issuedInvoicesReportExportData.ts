import type { InvoiceArcaTableRow } from "@/app/[siteId]/[popId]/invoices/actions"
import {
  formatInvoiceCbteFch,
  invoiceStatusLabel,
} from "@/app/[siteId]/[popId]/invoices/invoiceConstants"

export const ISSUED_INVOICES_REPORT_CSV_HEADERS = [
  "Fecha",
  "Tipo",
  "Punto de venta",
  "Número",
  "Receptor",
  "Documento",
  "Neto",
  "IVA",
  "Total",
  "Estado",
  "CAE",
] as const

export const ISSUED_INVOICES_REPORT_PDF_HEADERS = [
  "Fecha",
  "Comprobante",
  "Receptor",
  "Neto",
  "IVA",
  "Total",
  "Estado",
] as const

function formatExportMoney(n: number): string {
  return n.toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function invoiceComprobanteLabel(row: InvoiceArcaTableRow): string {
  return `${row.tipoLabel} · ${row.ptoVta}-${row.cbteNro}`
}

function invoiceReceptorDoc(row: InvoiceArcaTableRow): string {
  const doc = row.docNro.trim()
  if (!doc || doc === "0") return "—"
  return doc
}

export function sumIssuedInvoicesReportTotal(rows: InvoiceArcaTableRow[]): number {
  return rows.reduce((sum, row) => sum + row.impTotal, 0)
}

export function sumIssuedInvoicesReportIva(rows: InvoiceArcaTableRow[]): number {
  return rows.reduce((sum, row) => sum + row.impIva, 0)
}

export function issuedInvoicesReportExportFilename(
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
    ? `facturas-emitidas-${slug}-${stamp}`
    : `facturas-emitidas-${stamp}`
  return `${base}.${extension}`
}

export function buildIssuedInvoicesReportCsvRows(rows: InvoiceArcaTableRow[]) {
  return rows.map((row) => [
    formatInvoiceCbteFch(row.cbteFch),
    row.tipoLabel,
    String(row.ptoVta),
    row.cbteNro,
    row.receptorRazonSocial.trim() || "—",
    invoiceReceptorDoc(row),
    formatExportMoney(row.impNeto),
    formatExportMoney(row.impIva),
    formatExportMoney(row.impTotal),
    invoiceStatusLabel(row.status),
    row.cae ?? "—",
  ])
}

export function buildIssuedInvoicesReportPdfRows(rows: InvoiceArcaTableRow[]) {
  return rows.map((row) => [
    formatInvoiceCbteFch(row.cbteFch),
    invoiceComprobanteLabel(row),
    row.receptorRazonSocial.trim() || "—",
    formatExportMoney(row.impNeto),
    formatExportMoney(row.impIva),
    formatExportMoney(row.impTotal),
    invoiceStatusLabel(row.status),
  ])
}
