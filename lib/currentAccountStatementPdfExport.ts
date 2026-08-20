"use client"

import type {
  CurrentAccountLedgerLine,
  CurrentAccountOpenDocument,
} from "@/app/[siteId]/[popId]/current-accounts/actions"
import {
  CURRENT_ACCOUNT_AGING_BUCKETS,
  currentAccountDirectionLabel,
  type CurrentAccountAgingTotals,
  type CurrentAccountDirection,
} from "@/lib/currentAccounts"
import { applyReportPdfBrandingFooters } from "@/lib/reportExportBranding"
import { formatLocaleTime } from "@/lib/popTimezone"
import { formatReportMoneyAr } from "@/lib/reportFormatters"
import { drawReportPdfPopBrandHeader } from "@/lib/reportPdfPopBrand"
import { printJsPdfDocument } from "@/lib/reportPdfPrint"
import { loadReportPdfRuntime } from "@/lib/reportPdfRuntime"
import type { jsPDF } from "jspdf"

export type CurrentAccountStatementPdfInput = {
  partyName: string
  direction: CurrentAccountDirection
  balance: number
  aging: CurrentAccountAgingTotals
  openDocuments: CurrentAccountOpenDocument[]
  lines: CurrentAccountLedgerLine[]
}

type ExportOptions = {
  popName?: string
  popLogoUrl?: string
  popStreetAddress?: string | null
  popCity?: string | null
}

function formatIsoDate(iso: string): string {
  if (!iso) return "—"
  const date = new Date(`${iso}T12:00:00`)
  if (Number.isNaN(date.getTime())) return iso
  return new Intl.DateTimeFormat("es-AR", { dateStyle: "short" }).format(date)
}

function formatLedgerDate(isoDate: string, occurredAt?: string | null): string {
  const date = formatIsoDate(isoDate)
  if (!occurredAt) return date
  const instant = new Date(occurredAt)
  if (Number.isNaN(instant.getTime())) return date
  return `${date} ${formatLocaleTime(instant)}`
}

function slugPartyName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40)
}

async function buildCurrentAccountStatementPdf(
  input: CurrentAccountStatementPdfInput,
  options?: ExportOptions,
): Promise<{ doc: jsPDF; filename: string }> {
  const { jsPDF, autoTable } = await loadReportPdfRuntime()
  const doc = new jsPDF({ unit: "mm", format: "a4" })

  doc.setFont("helvetica", "bold")
  doc.setFontSize(16)
  doc.text("Extracto de cuenta corriente", 14, 16)

  doc.setFont("helvetica", "normal")
  doc.setFontSize(11)
  doc.text(input.partyName || "—", 14, 24)
  doc.setFontSize(10)
  doc.text(
    `${currentAccountDirectionLabel(input.direction)} · saldo ${formatReportMoneyAr(input.balance)}`,
    14,
    30,
  )

  const agingBits = CURRENT_ACCOUNT_AGING_BUCKETS.filter(
    (bucket) => input.aging[bucket.value] > 0.009,
  ).map(
    (bucket) =>
      `${bucket.label} ${formatReportMoneyAr(input.aging[bucket.value])}`,
  )
  if (agingBits.length > 0) {
    doc.text(agingBits.join("  ·  "), 14, 36)
  }

  await drawReportPdfPopBrandHeader(doc, {
    popName: options?.popName,
    popLogoUrl: options?.popLogoUrl,
    popStreetAddress: options?.popStreetAddress,
    popCity: options?.popCity,
    align: "right",
  })

  let startY = 48
  if (input.openDocuments.length > 0) {
    doc.setFont("helvetica", "bold")
    doc.setFontSize(11)
    doc.text("Comprobantes abiertos", 14, startY)
    startY += 4
    autoTable(doc, {
      head: [["Fecha", "Comprobante", "Vence", "Restante"]],
      body: input.openDocuments.map((document) => [
        formatIsoDate(document.date),
        document.documentLabel,
        formatIsoDate(document.dueDate),
        formatReportMoneyAr(document.remaining),
      ]),
      startY,
      styles: { font: "helvetica", fontSize: 9, cellPadding: 2 },
      headStyles: {
        fillColor: [24, 24, 27],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      columnStyles: {
        3: { halign: "right" },
      },
      margin: { left: 14, right: 14, bottom: 16 },
    })
    startY =
      (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable
        ?.finalY ?? startY
    startY += 10
  }

  doc.setFont("helvetica", "bold")
  doc.setFontSize(11)
  doc.text("Movimientos", 14, startY)
  startY += 4
  autoTable(doc, {
    head: [["Fecha", "Comprobante", "Debe", "Haber", "Saldo"]],
    body: input.lines.map((line) => [
      formatLedgerDate(line.date, line.occurredAt),
      line.paymentKindLabel
        ? `${line.documentLabel}\n${line.paymentKindLabel}`
        : line.documentLabel,
      line.debit > 0.009 ? formatReportMoneyAr(line.debit) : "—",
      line.credit > 0.009 ? formatReportMoneyAr(line.credit) : "—",
      formatReportMoneyAr(line.balance),
    ]),
    startY,
    styles: { font: "helvetica", fontSize: 9, cellPadding: 2 },
    headStyles: {
      fillColor: [24, 24, 27],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    columnStyles: {
      2: { halign: "right" },
      3: { halign: "right" },
      4: { halign: "right" },
    },
    margin: { left: 14, right: 14, bottom: 16 },
  })

  await applyReportPdfBrandingFooters(doc)

  const slug = slugPartyName(input.partyName) || "cuenta"
  return {
    doc,
    filename: `extracto-${slug}.pdf`,
  }
}

export async function exportCurrentAccountStatementPdf(
  input: CurrentAccountStatementPdfInput,
  options?: ExportOptions,
): Promise<void> {
  const { doc, filename } = await buildCurrentAccountStatementPdf(input, options)
  doc.save(filename)
}

export async function printCurrentAccountStatementPdf(
  input: CurrentAccountStatementPdfInput,
  options?: ExportOptions,
): Promise<void> {
  const { doc } = await buildCurrentAccountStatementPdf(input, options)
  await printJsPdfDocument(doc)
}
