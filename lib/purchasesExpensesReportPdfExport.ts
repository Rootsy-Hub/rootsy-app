"use client"

import type {
  OperationExpenseLedgerRow,
  OperationPurchaseRow,
} from "@/app/[siteId]/[popId]/operations/actions"
import { formatReportMoneyAr } from "@/lib/reportFormatters"
import {
  buildExpensesReportPdfRows,
  buildPurchasesReportPdfRows,
  EXPENSES_REPORT_PDF_HEADERS,
  purchasesExpensesExportFilename,
  PURCHASES_REPORT_PDF_HEADERS,
  sumExpensesReportAmount,
  sumPurchasesReportPaid,
} from "@/lib/purchasesExpensesReportExportData"

type PdfExportOptions = {
  timeZone?: string
  periodSummary?: string
  rowCount?: number
  periodTotal?: number
}

async function createPdfDocument() {
  const [{ jsPDF }, autoTableModule] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ])

  return {
    jsPDF,
    autoTable: autoTableModule.default,
  }
}

function writePdfHeader(
  doc: InstanceType<Awaited<ReturnType<typeof createPdfDocument>>["jsPDF"]>,
  title: string,
  periodSummary: string,
  summaryLine: string,
  generatedAt: string,
) {
  doc.setFont("helvetica", "bold")
  doc.setFontSize(14)
  doc.text(title, 14, 14)

  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)
  doc.text(periodSummary, 14, 21)
  doc.text(summaryLine, 14, 27)
  doc.setFontSize(8)
  doc.setTextColor(100, 100, 100)
  doc.text(`Generado ${generatedAt}`, 14, 32)
  doc.setTextColor(0, 0, 0)
}

function appendPdfFooter(
  doc: InstanceType<Awaited<ReturnType<typeof createPdfDocument>>["jsPDF"]>,
  data: { pageNumber: number },
) {
  const pageCount = doc.getNumberOfPages()
  doc.setFontSize(8)
  doc.setTextColor(120, 120, 120)
  doc.text(
    `Página ${data.pageNumber} de ${pageCount}`,
    doc.internal.pageSize.getWidth() - 14,
    doc.internal.pageSize.getHeight() - 8,
    { align: "right" },
  )
  doc.setTextColor(0, 0, 0)
}

export async function exportPurchasesReportPdf(
  rows: OperationPurchaseRow[],
  options?: PdfExportOptions,
): Promise<void> {
  const { jsPDF, autoTable } = await createPdfDocument()
  const periodSummary = options?.periodSummary ?? "Compras del período"
  const rowCount = options?.rowCount ?? rows.length
  const periodTotal = options?.periodTotal ?? sumPurchasesReportPaid(rows)
  const generatedAt = new Intl.DateTimeFormat("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
    ...(options?.timeZone ? { timeZone: options.timeZone } : {}),
  }).format(new Date())

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" })
  writePdfHeader(
    doc,
    "Compras",
    periodSummary,
    `Compras: ${rowCount.toLocaleString("es-AR")} · Total pagado: ${formatReportMoneyAr(periodTotal)}`,
    generatedAt,
  )

  autoTable(doc, {
    head: [[...PURCHASES_REPORT_PDF_HEADERS]],
    body: buildPurchasesReportPdfRows(rows, options?.timeZone),
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
    margin: { left: 14, right: 14 },
    didDrawPage: (data) => appendPdfFooter(doc, data),
  })

  doc.save(purchasesExpensesExportFilename("purchases", "pdf", periodSummary))
}

export async function exportExpensesReportPdf(
  rows: OperationExpenseLedgerRow[],
  options?: PdfExportOptions,
): Promise<void> {
  const { jsPDF, autoTable } = await createPdfDocument()
  const periodSummary = options?.periodSummary ?? "Gastos del período"
  const rowCount = options?.rowCount ?? rows.length
  const periodTotal = options?.periodTotal ?? sumExpensesReportAmount(rows)
  const generatedAt = new Intl.DateTimeFormat("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
    ...(options?.timeZone ? { timeZone: options.timeZone } : {}),
  }).format(new Date())

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" })
  writePdfHeader(
    doc,
    "Gastos",
    periodSummary,
    `Gastos: ${rowCount.toLocaleString("es-AR")} · Total: ${formatReportMoneyAr(periodTotal)}`,
    generatedAt,
  )

  autoTable(doc, {
    head: [[...EXPENSES_REPORT_PDF_HEADERS]],
    body: buildExpensesReportPdfRows(rows, options?.timeZone),
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
    margin: { left: 14, right: 14 },
    didDrawPage: (data) => appendPdfFooter(doc, data),
  })

  doc.save(purchasesExpensesExportFilename("expenses", "pdf", periodSummary))
}
