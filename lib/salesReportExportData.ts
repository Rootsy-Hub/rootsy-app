import type { OperationSaleRow } from "@/app/[siteId]/[popId]/operations/actions"
import {
  formatOperationSaleDateInline,
  formatOperationSaleDateTime,
} from "@/app/[siteId]/[popId]/operations/OperationsSalesTable"
import { displayOperationSaleCollected } from "@/lib/channelOperationSales"
import {
  saleReportChannelLabel,
  saleReportChannelSecondary,
  saleReportComprobantePrimary,
  saleReportComprobanteSecondary,
  saleReportCustomerPrimary,
  saleReportCustomerSecondary,
  saleReportDateSecondary,
  saleReportPaymentLabel,
} from "@/lib/salesReportFormatters"

export const SALES_REPORT_CSV_HEADERS = [
  "Fecha",
  "Hora",
  "Canal",
  "Detalle canal",
  "Cliente",
  "CUIT",
  "Comprobante",
  "Número comprobante",
  "Cobro",
  "Descuento",
  "IVA",
  "Total",
  "ID",
] as const

export const SALES_REPORT_PDF_HEADERS = [
  "Fecha",
  "Canal",
  "Cliente",
  "Comprobante",
  "Cobro",
  "Descuento",
  "IVA",
  "Total",
] as const

function formatExportMoney(n: number): string {
  return n.toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function saleIvaAmount(sale: OperationSaleRow): number {
  return sale.accruesOutputVat && sale.taxTotal > 0 ? sale.taxTotal : 0
}

function joinLines(primary: string, secondary: string | null | undefined): string {
  const extra = secondary?.trim()
  if (!extra) return primary
  return `${primary}\n${extra}`
}

export function salesReportExportFilename(
  extension: "csv" | "pdf",
  periodSummary: string,
): string {
  const stamp = new Date().toISOString().slice(0, 10)
  const slug = periodSummary
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48)
  const base = slug ? `detalle-ventas-${slug}-${stamp}` : `detalle-ventas-${stamp}`
  return `${base}.${extension}`
}

export function buildSalesReportCsvRows(
  rows: OperationSaleRow[],
  timeZone?: string,
): string[][] {
  return rows.map((sale) => {
    const when = formatOperationSaleDateTime(sale.soldAt, timeZone)
    const ivaAmount = saleIvaAmount(sale)

    return [
      when.primary,
      when.secondary ?? "",
      saleReportChannelLabel(sale),
      saleReportChannelSecondary(sale) ?? "",
      saleReportCustomerPrimary(sale),
      saleReportCustomerSecondary(sale) ?? "",
      saleReportComprobantePrimary(sale),
      saleReportComprobanteSecondary(sale) ?? "",
      saleReportPaymentLabel(sale),
      sale.discountTotal > 0 ? formatExportMoney(sale.discountTotal) : "",
      ivaAmount > 0 ? formatExportMoney(ivaAmount) : "",
      formatExportMoney(displayOperationSaleCollected(sale)),
      sale.id,
    ]
  })
}

export function buildSalesReportPdfRows(
  rows: OperationSaleRow[],
  timeZone?: string,
): string[][] {
  return rows.map((sale) => {
    const when = formatOperationSaleDateInline(sale.soldAt, timeZone)
    const ivaAmount = saleIvaAmount(sale)

    return [
      joinLines(when, saleReportDateSecondary(sale)),
      joinLines(
        saleReportChannelLabel(sale),
        saleReportChannelSecondary(sale),
      ),
      joinLines(
        saleReportCustomerPrimary(sale),
        saleReportCustomerSecondary(sale),
      ),
      joinLines(
        saleReportComprobantePrimary(sale),
        saleReportComprobanteSecondary(sale),
      ),
      saleReportPaymentLabel(sale),
      sale.discountTotal > 0 ? formatExportMoney(sale.discountTotal) : "—",
      ivaAmount > 0 ? formatExportMoney(ivaAmount) : "—",
      formatExportMoney(displayOperationSaleCollected(sale)),
    ]
  })
}

export function sumSalesReportTotal(rows: OperationSaleRow[]): number {
  return rows.reduce((acc, sale) => acc + displayOperationSaleCollected(sale), 0)
}
