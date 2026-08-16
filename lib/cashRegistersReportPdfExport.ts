"use client"

import type { CashRegistersPeriodReportRow } from "@/app/[siteId]/[popId]/cash-registers/actions"
import { formatReportMoneyAr } from "@/lib/reportFormatters"
import {
  buildCashRegistersReportPdfRows,
  CASH_REGISTERS_REPORT_PDF_HEADERS,
  cashRegistersReportExportFilename,
  sumCashRegistersReportDifference,
  sumCashRegistersReportTotalCobrado,
} from "@/lib/cashRegistersReportExportData"
import {
  applyReportPdfBrandingFooters,
  drawReportPdfIssuerBlock,
  type ReportExportContext,
} from "@/lib/reportExportBranding"
import { loadReportPdfRuntime } from "@/lib/reportPdfRuntime"
import { printJsPdfDocument } from "@/lib/reportPdfPrint"
import type { jsPDF } from "jspdf"

type ExportPdfOptions = {
  timeZone?: string
  periodSummary?: string
  arqueoCount?: number
  totalCobrado?: number
  netDifference?: number
  exportContext: ReportExportContext
}

export async function buildCashRegistersReportPdfDocument(
  rows: CashRegistersPeriodReportRow[],
  options: ExportPdfOptions,
): Promise<{ doc: jsPDF; filename: string }> {
  const { jsPDF, autoTable } = await loadReportPdfRuntime()

  const periodSummary = options.periodSummary ?? "Arqueo de caja"
  const arqueoCount = options.arqueoCount ?? rows.length
  const totalCobrado =
    options?.totalCobrado ?? sumCashRegistersReportTotalCobrado(rows)
  const netDifference =
    options?.netDifference ?? sumCashRegistersReportDifference(rows)

  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  })

  let startY = drawReportPdfIssuerBlock(doc, options.exportContext)
  startY += 4

  doc.setFont("helvetica", "bold")
  doc.setFontSize(14)
  doc.text("Arqueo de caja", 14, startY)
  startY += 6

  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)
  doc.text(periodSummary, 14, startY)
  startY += 5

  doc.text(
    `Arqueos: ${arqueoCount.toLocaleString("es-AR")} · Total cobrado: ${formatReportMoneyAr(totalCobrado)} · Diferencia neta: ${formatReportMoneyAr(netDifference)}`,
    14,
    startY,
  )
  startY += 6

  autoTable(doc, {
    startY,
    head: [Array.from(CASH_REGISTERS_REPORT_PDF_HEADERS)],
    body: buildCashRegistersReportPdfRows(rows, options.timeZone),
    styles: {
      font: "helvetica",
      fontSize: 7,
      cellPadding: 1.6,
      overflow: "linebreak",
      valign: "top",
    },
    headStyles: {
      fillColor: [24, 24, 27],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    columnStyles: {
      0: { cellWidth: 28 },
      1: { cellWidth: 12 },
      2: { cellWidth: 30 },
      3: { cellWidth: 28 },
      4: { cellWidth: 30 },
      5: { cellWidth: 28 },
      6: { cellWidth: 24, halign: "right" },
      7: { cellWidth: 22, halign: "right" },
    },
    margin: { left: 14, right: 14, bottom: 16 },
  })

  await applyReportPdfBrandingFooters(doc)

  return {
    doc,
    filename: cashRegistersReportExportFilename("pdf", periodSummary),
  }
}

export async function exportCashRegistersReportPdf(
  rows: CashRegistersPeriodReportRow[],
  options: ExportPdfOptions,
): Promise<void> {
  const { doc, filename } = await buildCashRegistersReportPdfDocument(rows, options)
  doc.save(filename)
}

export async function printCashRegistersReportPdf(
  rows: CashRegistersPeriodReportRow[],
  options: ExportPdfOptions,
): Promise<void> {
  const { doc } = await buildCashRegistersReportPdfDocument(rows, options)
  await printJsPdfDocument(doc)
}
