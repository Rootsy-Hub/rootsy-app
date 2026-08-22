import type { ArticleItemKind } from "@/lib/articleItemKind"
import type { ArticleDiscountMode } from "@/lib/articleDiscount"
import type { ArticleCostLineInput, ArticleCostRow } from "@/lib/articleCosts"
import type { SalePriceListAmountInput } from "@/lib/salePriceLists"

export type ArticleTableRow = {
  id: string
  name: string
  description: string
  imageUrl: string | null
  brand: string
  sku: string | null
  barcode: string | null
  itemKind: ArticleItemKind
  unitOfMeasure: string
  isSellable: boolean
  defaultWastePct: number | null
  minStockLevel: number | null
  salePrice: number
  iva: number
  discountMode: ArticleDiscountMode | null
  discountValue: number | null
  categoryId: string
  categoryName: string
  isActive: boolean
  allowNegativeStock: boolean
  stockOnHand: number
  activeCostCount: number
  costs: ArticleCostRow[]
  listPrices: { listId: string; amount: number }[]
}

export type ArticleCategoryOption = {
  id: string
  name: string
  itemKind: ArticleItemKind
  sortOrder: number
  showInSale: boolean
}

export type CategoryLayoutUpdate = {
  id: string
  sortOrder: number
  showInSale: boolean
}

export type ArticleItemFieldsInput = {
  itemKind: ArticleItemKind
  unitOfMeasure: string
  isSellable: boolean
  defaultWastePct: number | null
  minStockLevel: number | null
}

export type UpdatePopArticleInput = {
  name: string
  description: string
  imageUrl: string
  brand: string
  sku: string
  barcode: string
  salePrice: number
  iva: number
  categoryId: string
  isActive: boolean
  discountMode: ArticleDiscountMode | null
  discountValue: number | null
  allowNegativeStock: boolean
  costs?: ArticleCostLineInput[]
  listPrices?: SalePriceListAmountInput[]
} & ArticleItemFieldsInput

export type CreatePopArticleInput = UpdatePopArticleInput & {
  siteId?: string
  initialStockQuantity?: number | null
  costs?: ArticleCostLineInput[]
}

export type GetPopArticlesTableInput = {
  page: number
  pageSize: number
  search: string
  soloActivos: boolean
  soloInactivos: boolean
  conDescuento: boolean
  sinDescuento: boolean
  conStock: boolean
  sinStock: boolean
  stockNegativo: boolean
  ventaSinStock: boolean
  categoryId: string
  /** Vacío o los tres tipos = sin filtrar por tipo. */
  itemKinds: ArticleItemKind[]
  sort?: string | null
  ord?: "asc" | "desc"
}
