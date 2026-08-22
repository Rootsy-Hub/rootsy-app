import type { PurchaseOrderMetadata } from "@/lib/purchaseOrderTypes"

export type CreatePurchaseOrderInput = {
  checkoutSnapshot: unknown
  subtotal: number
  discountTotal: number
  total: number
  supplierId: string | null
  supplierName: string
  supplierTaxId: string | null
  metadata: PurchaseOrderMetadata
}

export type GetPurchaseOrdersTableInput = {
  page?: number
  pageSize?: number
  q?: string
  dateFrom?: string | null
  dateTo?: string | null
}
