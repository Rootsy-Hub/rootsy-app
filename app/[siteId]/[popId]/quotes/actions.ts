import type { SaleQuoteMetadata } from "@/lib/saleQuoteTypes"

export type CreateSaleQuoteInput = {
  checkoutSnapshot: unknown
  subtotal: number
  discountTotal: number
  total: number
  clientId: string | null
  customerName: string
  customerTaxId: string | null
  metadata: SaleQuoteMetadata
}

export type GetSaleQuotesTableInput = {
  page?: number
  pageSize?: number
  q?: string
  dateFrom?: string | null
  dateTo?: string | null
}
