import type { OperationSaleRow } from "@/app/[siteId]/[popId]/operations/actions"
import { formatChannelPlaceLine } from "@/app/[siteId]/[popId]/operations/operationSaleDetailUi"
import { saleComprobanteLabel } from "@/lib/operationSaleComprobante"

const SALE_STATUS_LABEL: Record<string, string> = {
  draft: "Borrador",
  completed: "Completada",
  cancelled: "Anulada",
}

const INVOICE_STATUS_LABEL: Record<string, string> = {
  draft: "Borrador",
  pending_afip: "Pendiente AFIP",
  authorized: "Autorizada",
  rejected: "Rechazada",
  cancelled: "Anulada",
}

export function saleReportChannelLabel(sale: OperationSaleRow): string {
  switch (sale.saleChannel) {
    case "table":
      return "Mesas"
    case "counter":
      return "Mostrador"
    default:
      return "POS"
  }
}

export function saleReportChannelSecondary(sale: OperationSaleRow): string | null {
  if (sale.saleChannel === "table") {
    const line = formatChannelPlaceLine({
      tableLabel: sale.tableLabel,
      waiterName: sale.channelWaiterName,
      channel: "table",
    })
    return line === "—" ? null : line
  }
  if (sale.saleChannel === "counter") {
    const line = formatChannelPlaceLine({
      counterOrderLabel: sale.counterOrderLabel,
      waiterName: sale.channelWaiterName,
      channel: "counter",
    })
    return line === "—" ? null : line
  }
  return null
}

export function saleReportCustomerPrimary(sale: OperationSaleRow): string {
  return sale.customerName?.trim() || "Consumidor final"
}

export function saleReportCustomerSecondary(
  sale: OperationSaleRow,
): string | null {
  const taxId = sale.customerTaxId?.trim()
  return taxId || null
}

export function saleReportComprobantePrimary(sale: OperationSaleRow): string {
  const label = saleComprobanteLabel(sale)
  return label === "—" ? "Sin comprobante" : label
}

export function saleReportComprobanteSecondary(
  sale: OperationSaleRow,
): string | null {
  const inv = sale.arcaInvoice
  if (inv) {
    const number = `${inv.ptoVta} — ${inv.cbteNro}`
    const status = INVOICE_STATUS_LABEL[inv.status] ?? inv.status
    if (status && status !== "Autorizada") {
      return `${number} · ${status}`
    }
    return number
  }

  if (sale.invoiceTypeLabel) return "Sin emitir"
  return null
}

export function saleReportPaymentLabel(sale: OperationSaleRow): string {
  const label = sale.paymentMethodLabel?.trim()
  if (!label || label === "—") return "—"
  return label
}

export function saleReportDateSecondary(sale: OperationSaleRow): string | null {
  if (sale.status === "cancelled") {
    return SALE_STATUS_LABEL.cancelled
  }
  if (sale.status === "draft") {
    return SALE_STATUS_LABEL.draft
  }
  const who = sale.soldByName?.trim()
  return who || null
}
