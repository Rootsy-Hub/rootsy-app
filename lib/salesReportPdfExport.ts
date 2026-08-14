"use client"

import type { OperationSaleRow } from "@/app/[siteId]/[popId]/operations/actions"
import { formatReportMoneyAr } from "@/lib/reportFormatters"
import {
  buildSalesReportPdfRows,
  SALES_REPORT_PDF_HEADERS,
  salesReportExportFilename,
  sumSalesReportTotal,
} from "@/lib/salesReportExportData"
import { loadReportPdfRuntime } from "@/lib/reportPdfRuntime"
import { applyReportPdfBrandingFooters } from "@/lib/reportExportBranding"

type ExportPdfOptions = {
  timeZone?: string
  periodSummary?: string
  salesCount?: number
  periodTotal?: number
}

export async function exportSalesDetailReportPdf(
  rows: OperationSaleRow[],
  options?: ExportPdfOptions,
): Promise<void> {
  const { jsPDF, autoTable } = await loadReportPdfRuntime()

  const periodSummary = options?.periodSummary ?? "Detalle de ventas"
  const salesCount = options?.salesCount ?? rows.length
  const periodTotal = options?.periodTotal ?? sumSalesReportTotal(rows)
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
  doc.text("Detalle de ventas", 14, 14)

  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)
  doc.text(periodSummary, 14, 21)
  doc.text(
    `Ventas: ${salesCount.toLocaleString("es-AR")} · Total vendido: ${formatReportMoneyAr(periodTotal)}`,
    14,
    27,
  )
  doc.setFontSize(8)
  doc.setTextColor(100, 100, 100)
  doc.text(`Generado ${generatedAt}`, 14, 32)
  doc.setTextColor(0, 0, 0)

  autoTable(doc, {
    head: [[...SALES_REPORT_PDF_HEADERS]],
    body: buildSalesReportPdfRows(rows, options?.timeZone),
    startY: 36,
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
      1: { cellWidth: 32 },
      2: { cellWidth: 38 },
      3: { cellWidth: 38 },
      4: { cellWidth: 24 },
      5: { halign: "right", cellWidth: 22 },
      6: { halign: "right", cellWidth: 20 },
      7: { halign: "right", cellWidth: 24 },
    },
    margin: { left: 14, right: 14, bottom: 16 },
  })

  await applyReportPdfBrandingFooters(doc)

  doc.save(salesReportExportFilename("pdf", periodSummary))
}
