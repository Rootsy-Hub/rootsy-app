"use client"

import { loadReportPdfRuntime } from "@/lib/reportPdfRuntime"
import { applyReportPdfBrandingFooters } from "@/lib/reportExportBranding"
import { drawReportPdfPopBrandHeader } from "@/lib/reportPdfPopBrand"
import {
  buildPurchaseOrderPdfTableRows,
  resolvePurchaseOrderLineSummaries,
} from "@/lib/purchaseOrderDocumentLines"
import { printJsPdfDocument } from "@/lib/reportPdfPrint"
import type { PurchaseOrderDetail } from "@/lib/purchaseOrderTypes"
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

function formatOrderDate(iso: string, timeZone?: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
    ...(timeZone ? { timeZone } : {}),
  }).format(date)
}

function buildPurchaseOrderPdfAutoTableBody(
  order: PurchaseOrderDetail,
): CellDef[][] {
  const summaries = resolvePurchaseOrderLineSummaries(order.metadata)
  const pdfRows = buildPurchaseOrderPdfTableRows(summaries, formatReportMoneyAr)
  return pdfRows.map((row) => row.cells as CellDef[])
}

async function buildPurchaseOrderPdfDocument(
  order: PurchaseOrderDetail,
  options?: ExportOptions,
): Promise<{ doc: jsPDF; filename: string }> {
  const { jsPDF, autoTable } = await loadReportPdfRuntime()
  const doc = new jsPDF({ unit: "mm", format: "a4" })

  doc.setFont("helvetica", "bold")
  doc.setFontSize(16)
  doc.text("Orden de compra", 14, 16)

  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)
  doc.text(`N.º ${order.orderNumber}`, 14, 23)
  doc.text(
    `Generada ${formatOrderDate(order.createdAt, options?.timeZone)}`,
    14,
    29,
  )

  doc.setFontSize(11)
  doc.text(`Proveedor: ${order.supplierName || "Sin proveedor"}`, 14, 38)
  let metaY = 44
  if (order.supplierTaxId) {
    doc.text(`Documento: ${order.supplierTaxId}`, 14, metaY)
    metaY += 6
  }
  if (order.metadata.comprobanteLabel) {
    doc.text(`Comprobante: ${order.metadata.comprobanteLabel}`, 14, metaY)
    metaY += 6
  }
  if (order.metadata.paymentLabel) {
    doc.text(`Medio de pago: ${order.metadata.paymentLabel}`, 14, metaY)
    metaY += 6
  }
  if (order.metadata.discountLabel) {
    doc.text(`Descuento general: ${order.metadata.discountLabel}`, 14, metaY)
    metaY += 6
  }

  await drawReportPdfPopBrandHeader(doc, {
    popName: options?.popName,
    popLogoUrl: options?.popLogoUrl,
    popStreetAddress: options?.popStreetAddress,
    popCity: options?.popCity,
    align: "right",
  })

  const body = buildPurchaseOrderPdfAutoTableBody(order)
  const tableStartY = Math.max(metaY + 4, 68)

  autoTable(doc, {
    head: [["Artículo", "Cant.", "Costo unit.", "Subtotal"]],
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

  doc.setFont("helvetica", "bold")
  doc.setFontSize(10)
  let totalsY = finalY + 10

  doc.text(`Subtotal: ${formatReportMoneyAr(order.subtotal)}`, 14, totalsY)
  totalsY += 6

  if (order.discountTotal > 0) {
    doc.setFont("helvetica", "normal")
    doc.text(
      `Descuento${order.metadata.discountLabel ? ` (${order.metadata.discountLabel})` : ""}: -${formatReportMoneyAr(order.discountTotal)}`,
      14,
      totalsY,
    )
    totalsY += 6
  }

  doc.setFont("helvetica", "bold")
  doc.setFontSize(12)
  doc.text(`Total: ${formatReportMoneyAr(order.total)}`, 14, totalsY + 2)

  await applyReportPdfBrandingFooters(doc)

  return {
    doc,
    filename: `orden-compra-${order.orderNumber}.pdf`,
  }
}

export async function exportPurchaseOrderPdf(
  order: PurchaseOrderDetail,
  options?: ExportOptions,
): Promise<void> {
  const { doc, filename } = await buildPurchaseOrderPdfDocument(order, options)
  doc.save(filename)
}

export async function printPurchaseOrderPdf(
  order: PurchaseOrderDetail,
  options?: ExportOptions,
): Promise<void> {
  const { doc } = await buildPurchaseOrderPdfDocument(order, options)
  await printJsPdfDocument(doc)
}
