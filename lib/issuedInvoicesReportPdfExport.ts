"use client"

import type { InvoiceArcaTableRow } from "@/app/[siteId]/[popId]/invoices/actions"
import { formatReportMoneyAr } from "@/lib/reportFormatters"
import {
  buildIssuedInvoicesReportPdfRows,
  ISSUED_INVOICES_REPORT_PDF_HEADERS,
  issuedInvoicesReportExportFilename,
  sumIssuedInvoicesReportIva,
  sumIssuedInvoicesReportTotal,
} from "@/lib/issuedInvoicesReportExportData"
import { loadReportPdfRuntime } from "@/lib/reportPdfRuntime"
import { applyReportPdfBrandingFooters } from "@/lib/reportExportBranding"

type ExportPdfOptions = {
  timeZone?: string
  periodSummary?: string
  invoiceCount?: number
  periodTotal?: number
  periodIva?: number
}

export async function exportIssuedInvoicesReportPdf(
  rows: InvoiceArcaTableRow[],
  options?: ExportPdfOptions,
): Promise<void> {
  const { jsPDF, autoTable } = await loadReportPdfRuntime()

  const periodSummary = options?.periodSummary ?? "Facturas emitidas"
  const invoiceCount = options?.invoiceCount ?? rows.length
  const periodTotal = options?.periodTotal ?? sumIssuedInvoicesReportTotal(rows)
  const periodIva = options?.periodIva ?? sumIssuedInvoicesReportIva(rows)
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
  doc.text("Facturas emitidas", 14, 14)

  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)
  doc.text(periodSummary, 14, 21)
  doc.text(
    `Comprobantes: ${invoiceCount.toLocaleString("es-AR")} · Total: ${formatReportMoneyAr(periodTotal)} · IVA: ${formatReportMoneyAr(periodIva)}`,
    14,
    27,
  )
  doc.text(`Generado: ${generatedAt}`, 14, 33)

  autoTable(doc, {
    startY: 38,
    head: [Array.from(ISSUED_INVOICES_REPORT_PDF_HEADERS)],
    body: buildIssuedInvoicesReportPdfRows(rows),
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
    columnStyles: {
      0: { cellWidth: 22 },
      1: { cellWidth: 52 },
      2: { cellWidth: 48 },
      3: { cellWidth: 24, halign: "right" },
      4: { cellWidth: 24, halign: "right" },
      5: { cellWidth: 24, halign: "right" },
      6: { cellWidth: 28 },
    },
    margin: { left: 14, right: 14, bottom: 16 },
  })

  await applyReportPdfBrandingFooters(doc)

  doc.save(issuedInvoicesReportExportFilename("pdf", periodSummary))
}
