import type { PurchaseCheckoutSnapshot } from "@/lib/purchaseOrderCheckoutState"

export type PurchaseOrderLineSummary = {
  name: string
  quantity: number
  unitPrice: number
  lineTotal: number
}

export type PurchaseOrderMetadata = {
  comprobanteLabel?: string | null
  paymentLabel?: string | null
  discountLabel?: string | null
  lineSummaries?: PurchaseOrderLineSummary[]
}

export type PurchaseOrderTableRow = {
  id: string
  orderNumber: number
  supplierName: string
  supplierTaxId: string | null
  subtotal: number
  discountTotal: number
  total: number
  status: "active" | "converted" | "cancelled"
  createdAt: string
  itemCount: number
}

export type PurchaseOrderDetail = PurchaseOrderTableRow & {
  supplierId: string | null
  checkoutSnapshot: PurchaseCheckoutSnapshot
  metadata: PurchaseOrderMetadata
}
