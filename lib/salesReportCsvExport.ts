import type { OperationSaleRow } from "@/app/[siteId]/[popId]/operations/actions"
import { formatOperationSaleDateTime } from "@/app/[siteId]/[popId]/operations/OperationsSalesTable"
import { displayOperationSaleTotal } from "@/lib/channelOperationSales"
import { buildCsv, downloadCsv } from "@/lib/exportCsv"
import {
  saleReportChannelLabel,
  saleReportChannelSecondary,
  saleReportComprobantePrimary,
  saleReportComprobanteSecondary,
  saleReportCustomerPrimary,
  saleReportCustomerSecondary,
  saleReportPaymentLabel,
} from "@/lib/salesReportFormatters"

function formatMoney(n: number): string {
  return n.toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function salesReportCsvFilename(periodSummary: string): string {
  const stamp = new Date().toISOString().slice(0, 10)
  const slug = periodSummary
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48)
  return slug
    ? `detalle-ventas-${slug}-${stamp}.csv`
    : `detalle-ventas-${stamp}.csv`
}

export function exportSalesDetailReportCsv(
  rows: OperationSaleRow[],
  options?: { timeZone?: string; periodSummary?: string },
): void {
  const timeZone = options?.timeZone
  const headers = [
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

  const body = rows.map((sale) => {
    const when = formatOperationSaleDateTime(sale.soldAt, timeZone)
    const ivaAmount =
      sale.accruesOutputVat && sale.taxTotal > 0 ? sale.taxTotal : 0

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
      sale.discountTotal > 0 ? formatMoney(sale.discountTotal) : "",
      ivaAmount > 0 ? formatMoney(ivaAmount) : "",
      formatMoney(displayOperationSaleTotal(sale)),
      sale.id,
    ]
  })

  downloadCsv(
    salesReportCsvFilename(options?.periodSummary ?? ""),
    buildCsv(headers, body),
  )
}
