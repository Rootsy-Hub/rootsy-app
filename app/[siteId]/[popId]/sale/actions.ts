import type { ArticleDiscountMode } from "@/lib/articleDiscount"
import type { CheckoutCheckDetails } from "@/lib/checkoutCheck"
import type { OperationPaymentKind } from "@/lib/operationPaymentKinds"

export type SaleCatalogPaymentOption = {
  kind: OperationPaymentKind
  treasuryAccountId: string
  label: string
  checkDetails?: CheckoutCheckDetails
}

export type SaleCatalogCategory = {
  id: string
  name: string
  sortOrder: number
}

export type SaleCatalogArticle = {
  id: string
  name: string
  description: string
  salePrice: number
  originalSalePrice?: number
  discountMode?: ArticleDiscountMode | null
  discountValue?: number | null
  iva: number
  categoryId: string
  categoryName: string
  unitOfMeasure: string
  imageUrl: string | null
  barcode?: string | null
  stockOnHand?: number
  allowNegativeStock?: boolean
}

export type SaleCatalogClient = {
  id: string
  name: string
  taxId: string | null
  ivaCondition: string | null
  defaultInvoiceTypeLabel: string | null
  currentAccountEnabled?: boolean
}

export type SaleCatalogPaymentMethod = SaleCatalogPaymentOption

export type SaleOpenCashSession = {
  sessionId: string
  cashRegisterId: string
  registerName: string
  cashTreasuryAccountId: string
}
