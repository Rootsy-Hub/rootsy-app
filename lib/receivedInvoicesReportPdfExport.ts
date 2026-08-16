"use client"

import type { OperationPurchaseRow } from "@/app/[siteId]/[popId]/operations/actions"
import { formatReportMoneyAr } from "@/lib/reportFormatters"
import {
  buildReceivedInvoicesReportPdfRows,
  RECEIVED_INVOICES_REPORT_PDF_HEADERS,
  receivedInvoicesReportExportFilename,
  sumReceivedInvoicesReportIva,
  sumReceivedInvoicesReportTotal,
} from "@/lib/receivedInvoicesReportExportData"
import { loadReportPdfRuntime } from "@/lib/reportPdfRuntime"
import { applyReportPdfBrandingFooters } from "@/lib/reportExportBranding"
import { printJsPdfDocument } from "@/lib/reportPdfPrint"
import type { jsPDF } from "jspdf"

type ExportPdfOptions = {
  timeZone?: string
  periodSummary?: string
  invoiceCount?: number
  periodTotal?: number
  periodIva?: number
}

export async function buildReceivedInvoicesReportPdfDocument(
  rows: OperationPurchaseRow[],
  options?: ExportPdfOptions,
): Promise<{ doc: jsPDF; filename: string }> {
  const { jsPDF, autoTable } = await loadReportPdfRuntime()

  const periodSummary = options?.periodSummary ?? "Facturas recibidas"
  const invoiceCount = options?.invoiceCount ?? rows.length
  const periodTotal = options?.periodTotal ?? sumReceivedInvoicesReportTotal(rows)
  const periodIva = options?.periodIva ?? sumReceivedInvoicesReportIva(rows)
  const generatedAt = new Intl.DateTimeFormat("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
    ...(options?.timeZone ? { timeZone: options.timeZone } : {}),
  }).format(new Date())

  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  })

  doc.setFont("helvetica", "bold")
  doc.setFontSize(14)
  doc.text("Facturas recibidas", 14, 14)

  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)
  doc.text(periodSummary, 14, 21)
  doc.text(
    `Comprobantes: ${invoiceCount.toLocaleString("es-AR")} · Total: ${formatReportMoneyAr(periodTotal)} · IVA crédito: ${formatReportMoneyAr(periodIva)}`,
    14,
    27,
  )
  doc.text(`Generado: ${generatedAt}`, 14, 33)

  autoTable(doc, {
    startY: 38,
    head: [Array.from(RECEIVED_INVOICES_REPORT_PDF_HEADERS)],
    body: buildReceivedInvoicesReportPdfRows(rows, options?.timeZone),
    styles: {
      font: "helvetica",
      fontSize: 8,
      cellPadding: 2,
      overflow: "linebreak",
    },
    headStyles: {
      fillColor: [240, 242, 245],
      textColor: [30, 35, 42],
      fontStyle: "bold",
    },
    margin: { left: 14, right: 14, bottom: 16 },
  })

  await applyReportPdfBrandingFooters(doc)

  return {
    doc,
    filename: receivedInvoicesReportExportFilename("pdf", periodSummary),
  }
}

export async function exportReceivedInvoicesReportPdf(
  rows: OperationPurchaseRow[],
  options?: ExportPdfOptions,
): Promise<void> {
  const { doc, filename } = await buildReceivedInvoicesReportPdfDocument(rows, options)
  doc.save(filename)
}

export async function printReceivedInvoicesReportPdf(
  rows: OperationPurchaseRow[],
  options?: ExportPdfOptions,
): Promise<void> {
  const { doc } = await buildReceivedInvoicesReportPdfDocument(rows, options)
  await printJsPdfDocument(doc)
}
