import type { OperationSaleRow } from "@/app/[siteId]/[popId]/operations/actions"

type SaleComprobanteSource = Pick<
  OperationSaleRow,
  "arcaInvoice" | "invoiceTypeLabel"
>

export function saleComprobanteLabel(sale: SaleComprobanteSource): string {
  if (sale.arcaInvoice?.tipoLabel) return sale.arcaInvoice.tipoLabel
  if (sale.invoiceTypeLabel) return sale.invoiceTypeLabel
  return "—"
}

export function saleHasComprobante(sale: SaleComprobanteSource): boolean {
  return Boolean(sale.arcaInvoice || sale.invoiceTypeLabel)
}

export function formatArcaCbteFch(s: string): string {
  if (!s) return "—"
  if (/^\d{8}$/.test(s)) {
    const y = s.slice(0, 4)
    const m = s.slice(4, 6)
    const d = s.slice(6, 8)
    return `${d}/${m}/${y}`
  }
  const parsed = new Date(s)
  if (!Number.isNaN(parsed.getTime())) {
    return new Intl.DateTimeFormat("es-AR", { dateStyle: "short" }).format(
      parsed,
    )
  }
  return s
}
