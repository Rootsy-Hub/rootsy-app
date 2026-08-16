"use client"

import { loadReportPdfRuntime } from "@/lib/reportPdfRuntime"
import { applyReportPdfBrandingFooters } from "@/lib/reportExportBranding"
import { drawReportPdfPopBrandHeader } from "@/lib/reportPdfPopBrand"
import {
  buildQuotePdfTableRows,
  quoteHasInlineDiscounts,
  quoteSubtotalSinDescuentos,
  resolveQuoteLineGroups,
} from "@/lib/saleQuoteDocumentLines"
import { printJsPdfDocument } from "@/lib/reportPdfPrint"
import type { SaleQuoteDetail } from "@/lib/saleQuoteTypes"
import { formatReportMoneyAr } from "@/lib/reportFormatters"
import type { jsPDF } from "jspdf"
import type { CellDef } from "jspdf-autotable"

type ExportOptions = {
  popName?: string
  popLogoUrl?: string
  popStreetAddress?: string | null
  popCity?: string | null
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

function buildQuotePdfAutoTableBody(
  quote: SaleQuoteDetail,
): CellDef[][] {
  const lineGroups = resolveQuoteLineGroups(quote.metadata)
  const pdfRows = buildQuotePdfTableRows(lineGroups, formatReportMoneyAr)
  const body: CellDef[][] = []

  for (const row of pdfRows) {
    if (row.kind === "group") {
      body.push([
        {
          content: row.label,
          colSpan: 4,
          styles: {
            fontStyle: "bold",
            fillColor: [245, 245, 245],
            textColor: [40, 40, 40],
          },
        },
      ])
      continue
    }

    if (row.kind === "discount") {
      body.push([
        {
          content: row.label,
          colSpan: 3,
          styles: {
            fontSize: 8,
            textColor: [100, 100, 100],
            cellPadding: { top: 1.5, right: 2, bottom: 1.5, left: 6 },
          },
        },
        {
          content: row.amount,
          styles: {
            fontSize: 8,
            halign: "right",
            textColor: [100, 100, 100],
            cellPadding: { top: 1.5, right: 2, bottom: 1.5, left: 2 },
          },
        },
      ])
      continue
    }

    body.push(row.cells as CellDef[])
  }

  return body
}

async function buildSaleQuotePdfDocument(
  quote: SaleQuoteDetail,
  options?: ExportOptions,
): Promise<{ doc: jsPDF; filename: string }> {
  const { jsPDF, autoTable } = await loadReportPdfRuntime()
  const doc = new jsPDF({ unit: "mm", format: "a4" })
  const lineGroups = resolveQuoteLineGroups(quote.metadata)
  const showListSubtotal = quoteHasInlineDiscounts(lineGroups)

  doc.setFont("helvetica", "bold")
  doc.setFontSize(16)
  doc.text("Presupuesto", 14, 16)

  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)
  doc.text(`N.º ${quote.quoteNumber}`, 14, 23)
  doc.text(
    `Generado ${formatQuoteDate(quote.createdAt, options?.timeZone)}`,
    14,
    29,
  )

  doc.setFontSize(11)
  doc.text(`Cliente: ${quote.customerName || "Sin cliente"}`, 14, 38)
  let metaY = 44
  if (quote.customerTaxId) {
    doc.text(`Documento: ${quote.customerTaxId}`, 14, metaY)
    metaY += 6
  }
  if (quote.metadata.comprobanteLabel) {
    doc.text(`Comprobante: ${quote.metadata.comprobanteLabel}`, 14, metaY)
    metaY += 6
  }
  if (quote.metadata.paymentLabel) {
    doc.text(`Medio de pago: ${quote.metadata.paymentLabel}`, 14, metaY)
    metaY += 6
  }
  if (quote.metadata.discountLabel) {
    doc.text(`Descuento general: ${quote.metadata.discountLabel}`, 14, metaY)
    metaY += 6
  }

  await drawReportPdfPopBrandHeader(doc, {
    popName: options?.popName,
    popLogoUrl: options?.popLogoUrl,
    popStreetAddress: options?.popStreetAddress,
    popCity: options?.popCity,
    align: "right",
  })

  const body = buildQuotePdfAutoTableBody(quote)
  const tableStartY = Math.max(metaY + 4, 68)

  autoTable(doc, {
    head: [["Producto", "Cant.", "Precio unit.", "Subtotal"]],
    body,
    startY: tableStartY,
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
    ?.finalY ?? tableStartY

  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)
  let totalsY = finalY + 10

  if (showListSubtotal) {
    doc.text(
      `Subtotal sin descuentos: ${formatReportMoneyAr(quoteSubtotalSinDescuentos(lineGroups))}`,
      14,
      totalsY,
    )
    totalsY += 6
  }

  doc.setFont("helvetica", "bold")
  doc.text(`Subtotal: ${formatReportMoneyAr(quote.subtotal)}`, 14, totalsY)
  totalsY += 6

  if (quote.discountTotal > 0) {
    doc.setFont("helvetica", "normal")
    doc.text(
      `Descuento${quote.metadata.discountLabel ? ` (${quote.metadata.discountLabel})` : ""}: -${formatReportMoneyAr(quote.discountTotal)}`,
      14,
      totalsY,
    )
    totalsY += 6
  }

  doc.setFont("helvetica", "bold")
  doc.setFontSize(12)
  doc.text(`Total: ${formatReportMoneyAr(quote.total)}`, 14, totalsY + 2)

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
