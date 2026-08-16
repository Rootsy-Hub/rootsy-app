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
import type { jsPDF } from "jspdf"
import { loadReportPdfRuntime } from "@/lib/reportPdfRuntime"
import { applyReportPdfBrandingFooters } from "@/lib/reportExportBranding"
import { printJsPdfDocument } from "@/lib/reportPdfPrint"

type PdfExportOptions = {
  timeZone?: string
  periodSummary?: string
  rowCount?: number
  periodTotal?: number
}

function writePdfHeader(
  doc: jsPDF,
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

async function buildPurchasesReportPdfDocument(
  rows: OperationPurchaseRow[],
  options?: PdfExportOptions,
): Promise<{ doc: jsPDF; filename: string }> {
  const { jsPDF, autoTable } = await loadReportPdfRuntime()
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
    margin: { left: 14, right: 14, bottom: 16 },
  })

  await applyReportPdfBrandingFooters(doc)

  return {
    doc,
    filename: purchasesExpensesExportFilename("purchases", "pdf", periodSummary),
  }
}

async function buildExpensesReportPdfDocument(
  rows: OperationExpenseLedgerRow[],
  options?: PdfExportOptions,
): Promise<{ doc: jsPDF; filename: string }> {
  const { jsPDF, autoTable } = await loadReportPdfRuntime()
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
    margin: { left: 14, right: 14, bottom: 16 },
  })

  await applyReportPdfBrandingFooters(doc)

  return {
    doc,
    filename: purchasesExpensesExportFilename("expenses", "pdf", periodSummary),
  }
}

export async function exportPurchasesReportPdf(
  rows: OperationPurchaseRow[],
  options?: PdfExportOptions,
): Promise<void> {
  const { doc, filename } = await buildPurchasesReportPdfDocument(rows, options)
  doc.save(filename)
}

export async function printPurchasesReportPdf(
  rows: OperationPurchaseRow[],
  options?: PdfExportOptions,
): Promise<void> {
  const { doc } = await buildPurchasesReportPdfDocument(rows, options)
  await printJsPdfDocument(doc)
}

export async function exportExpensesReportPdf(
  rows: OperationExpenseLedgerRow[],
  options?: PdfExportOptions,
): Promise<void> {
  const { doc, filename } = await buildExpensesReportPdfDocument(rows, options)
  doc.save(filename)
}

export async function printExpensesReportPdf(
  rows: OperationExpenseLedgerRow[],
  options?: PdfExportOptions,
): Promise<void> {
  const { doc } = await buildExpensesReportPdfDocument(rows, options)
  await printJsPdfDocument(doc)
}
