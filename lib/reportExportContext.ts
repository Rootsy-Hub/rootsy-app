import { escapeCsvCell } from "@/lib/exportCsv"

export type ReportExportPopInfo = {
  popName: string
  popFiscalRazonSocial?: string | null
  popFiscalCuit?: string | null
  popStreetAddress?: string | null
}

export type ReportExportContext = ReportExportPopInfo

export function formatReportExportCuit(raw: string | null | undefined): string {
  const digits = String(raw ?? "").replace(/\D/g, "")
  if (digits.length !== 11) return String(raw ?? "").trim() || "—"
  return `${digits.slice(0, 2)}-${digits.slice(2, 10)}-${digits.slice(10)}`
}

export function buildReportCsvMetadataSection(
  context: ReportExportContext,
  periodLabel: string,
): string {
  const rows: [string, string][] = [["Punto de venta", context.popName]]

  if (context.popFiscalRazonSocial?.trim()) {
    rows.push(["Razón social", context.popFiscalRazonSocial.trim()])
  }
  if (context.popFiscalCuit?.trim()) {
    rows.push(["CUIT", formatReportExportCuit(context.popFiscalCuit)])
  }
  if (context.popStreetAddress?.trim()) {
    rows.push(["Dirección", context.popStreetAddress.trim()])
  }

  rows.push(["Período", periodLabel])

  return rows
    .map(([label, value]) => `${escapeCsvCell(label)},${escapeCsvCell(value)}`)
    .join("\r\n")
}

export function finalizeReportCsv(
  csvBody: string,
  context: ReportExportContext,
  options: {
    periodLabel: string
    generatedAt: string
    brandingLabel: string
  },
): string {
  const metadata = buildReportCsvMetadataSection(context, options.periodLabel)
  return `${metadata}\r\n\r\n${csvBody}\r\n\r\n${options.brandingLabel}\r\nGenerado el: ${options.generatedAt}`
}

type ReportPdfDoc = {
  text: (
    text: string,
    x: number,
    y: number,
    options?: { align?: "left" | "center" | "right" | "justify" },
  ) => void
  setFont: (fontName: string, fontStyle?: string) => void
  setFontSize: (size: number) => void
  setTextColor: (ch1: number, ch2?: number, ch3?: number) => void
}

export function drawReportPdfIssuerBlock(
  doc: ReportPdfDoc,
  context: ReportExportContext,
  options?: { startY?: number },
): number {
  let y = options?.startY ?? 14

  doc.setTextColor(0, 0, 0)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(11)
  doc.text(context.popName, 14, y)
  y += 5

  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)

  const fiscalLine = [
    context.popFiscalRazonSocial?.trim() || null,
    context.popFiscalCuit?.trim()
      ? `CUIT ${formatReportExportCuit(context.popFiscalCuit)}`
      : null,
  ]
    .filter(Boolean)
    .join(" · ")

  if (fiscalLine) {
    doc.text(fiscalLine, 14, y)
    y += 4.5
  }

  if (context.popStreetAddress?.trim()) {
    doc.text(context.popStreetAddress.trim(), 14, y)
    y += 4.5
  }

  y += 3

  return y
}
