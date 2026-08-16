import type { TableSessionCheckoutSnapshot } from "@/app/[siteId]/[popId]/mesas/mesasCheckoutState"

export type SaleQuoteLineSummary = {
  name: string
  quantity: number
  unitPrice: number
  lineTotal: number
}

export type SaleQuoteLineDiscount = {
  label: string
  amount: number
}

export type SaleQuoteLineGroupLine = {
  name: string
  quantity: number
  unitListPrice: number
  listLineTotal: number
  lineTotal: number
  discounts: SaleQuoteLineDiscount[]
}

export type SaleQuoteLineGroup = {
  id: string
  category: string
  lines: SaleQuoteLineGroupLine[]
  promotionDiscount: SaleQuoteLineDiscount | null
}

export type SaleQuoteMetadata = {
  comprobanteLabel?: string | null
  paymentLabel?: string | null
  discountLabel?: string | null
  lineSummaries?: SaleQuoteLineSummary[]
  lineGroups?: SaleQuoteLineGroup[]
}

export type SaleQuoteTableRow = {
  id: string
  quoteNumber: number
  customerName: string
  customerTaxId: string | null
  subtotal: number
  discountTotal: number
  total: number
  status: "active" | "converted" | "cancelled"
  createdAt: string
  itemCount: number
}

export type SaleQuoteDetail = SaleQuoteTableRow & {
  clientId: string | null
  checkoutSnapshot: TableSessionCheckoutSnapshot
  metadata: SaleQuoteMetadata
}
