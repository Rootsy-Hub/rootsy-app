"use client"

import { buildCsv, downloadCsv } from "@/lib/exportCsv"
import {
  appendReportCsvBranding,
  applyReportPdfBrandingFooters,
  drawReportPdfIssuerBlock,
  formatReportExportGeneratedAt,
  type ReportExportContext,
} from "@/lib/reportExportBranding"
import { loadReportPdfRuntime } from "@/lib/reportPdfRuntime"

export type ReportTableDocumentExportOptions = {
  title: string
  periodLabel: string
  filenameBase: string
  headers: readonly string[]
  rows: string[][]
  exportContext: ReportExportContext
  subtitleLines?: string[]
  landscape?: boolean
  timeZone?: string
}

function reportDocumentFilename(base: string, extension: "csv" | "pdf"): string {
  const stamp = new Date().toISOString().slice(0, 10)
  const slug = base
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 56)
  return `${slug}-${stamp}.${extension}`
}

export function exportReportTableCsv(options: ReportTableDocumentExportOptions): void {
  const csv = buildCsv([...options.headers], options.rows)
  downloadCsv(
    reportDocumentFilename(options.filenameBase, "csv"),
    appendReportCsvBranding(csv, options.exportContext, {
      periodLabel: options.periodLabel,
      generatedAt: formatReportExportGeneratedAt(options.timeZone),
    }),
  )
}

export async function exportReportTablePdf(
  options: ReportTableDocumentExportOptions,
): Promise<void> {
  const { jsPDF, autoTable } = await loadReportPdfRuntime()

  const doc = new jsPDF({
    orientation: options.landscape ? "landscape" : "portrait",
    unit: "mm",
    format: "a4",
  })

  let startY = drawReportPdfIssuerBlock(doc, options.exportContext)
  startY += 4

  doc.setFont("helvetica", "bold")
  doc.setFontSize(14)
  doc.text(options.title, 14, startY)
  startY += 6

  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)
  doc.text(options.periodLabel, 14, startY)
  startY += 5

  for (const line of options.subtitleLines ?? []) {
    doc.text(line, 14, startY)
    startY += 4.5
  }

  startY += 1

  autoTable(doc, {
    startY,
    head: [Array.from(options.headers)],
    body: options.rows,
    styles: {
      font: "helvetica",
      fontSize: 8,
      cellPadding: 1.8,
      overflow: "linebreak",
      valign: "top",
    },
    headStyles: {
      fillColor: [24, 24, 27],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    margin: { left: 14, right: 14, bottom: 16 },
  })

  await applyReportPdfBrandingFooters(doc)

  doc.save(reportDocumentFilename(options.filenameBase, "pdf"))
}

export async function exportInlineReportDocument(
  format: "csv" | "pdf",
  options: ReportTableDocumentExportOptions,
): Promise<void> {
  if (format === "csv") {
    exportReportTableCsv(options)
    return
  }
  await exportReportTablePdf(options)
}
