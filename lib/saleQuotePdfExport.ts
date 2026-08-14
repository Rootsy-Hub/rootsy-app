"use client"

import { loadReportPdfRuntime } from "@/lib/reportPdfRuntime"
import { applyReportPdfBrandingFooters } from "@/lib/reportExportBranding"
import { printJsPdfDocument } from "@/lib/reportPdfPrint"
import type { SaleQuoteDetail } from "@/lib/saleQuoteTypes"
import { formatReportMoneyAr } from "@/lib/reportFormatters"
import type { jsPDF } from "jspdf"

type ExportOptions = {
  popName?: string
  timeZone?: string
}

function formatQuoteDate(iso: string, timeZone?: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
    ...(timeZone ? { timeZone } : {}),
  }).format(date)
}

async function buildSaleQuotePdfDocument(
  quote: SaleQuoteDetail,
  options?: ExportOptions,
): Promise<{ doc: jsPDF; filename: string }> {
  const { jsPDF, autoTable } = await loadReportPdfRuntime()
  const doc = new jsPDF({ unit: "mm", format: "a4" })
  const lines = quote.metadata.lineSummaries ?? []

  doc.setFont("helvetica", "bold")
  doc.setFontSize(16)
  doc.text("Presupuesto", 14, 16)

  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)
  doc.text(`N.º ${quote.quoteNumber}`, 14, 23)
  if (options?.popName) {
    doc.text(options.popName, 14, 29)
  }
  doc.text(`Generado ${formatQuoteDate(quote.createdAt, options?.timeZone)}`, 14, 35)

  doc.setFontSize(11)
  doc.text(`Cliente: ${quote.customerName || "Sin cliente"}`, 14, 44)
  if (quote.customerTaxId) {
    doc.text(`Documento: ${quote.customerTaxId}`, 14, 50)
  }
  if (quote.metadata.comprobanteLabel) {
    doc.text(`Comprobante: ${quote.metadata.comprobanteLabel}`, 14, 56)
  }
  if (quote.metadata.paymentLabel) {
    doc.text(`Medio de pago: ${quote.metadata.paymentLabel}`, 14, 62)
  }
  if (quote.metadata.discountLabel) {
    doc.text(`Descuento: ${quote.metadata.discountLabel}`, 14, 68)
  }

  autoTable(doc, {
    head: [["Producto", "Cant.", "Precio unit.", "Subtotal"]],
    body: lines.map((line) => [
      line.name,
      String(line.quantity),
      formatReportMoneyAr(line.unitPrice),
      formatReportMoneyAr(line.lineTotal),
    ]),
    startY: 74,
    styles: { font: "helvetica", fontSize: 9, cellPadding: 2 },
    headStyles: {
      fillColor: [24, 24, 27],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    columnStyles: {
      1: { halign: "right" },
      2: { halign: "right" },
      3: { halign: "right" },
    },
    margin: { left: 14, right: 14, bottom: 16 },
  })

  const finalY = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable
    ?.finalY ?? 74

  doc.setFont("helvetica", "bold")
  doc.setFontSize(10)
  doc.text(`Subtotal: ${formatReportMoneyAr(quote.subtotal)}`, 14, finalY + 10)
  if (quote.discountTotal > 0) {
    doc.text(
      `Descuento: −${formatReportMoneyAr(quote.discountTotal)}`,
      14,
      finalY + 16,
    )
  }
  doc.setFontSize(12)
  doc.text(`Total: ${formatReportMoneyAr(quote.total)}`, 14, finalY + 24)

  await applyReportPdfBrandingFooters(doc)

  return {
    doc,
    filename: `presupuesto-${quote.quoteNumber}.pdf`,
  }
}

export async function exportSaleQuotePdf(
  quote: SaleQuoteDetail,
  options?: ExportOptions,
): Promise<void> {
  const { doc, filename } = await buildSaleQuotePdfDocument(quote, options)
  doc.save(filename)
}

export async function printSaleQuotePdf(
  quote: SaleQuoteDetail,
  options?: ExportOptions,
): Promise<void> {
  const { doc } = await buildSaleQuotePdfDocument(quote, options)
  await printJsPdfDocument(doc)
}
