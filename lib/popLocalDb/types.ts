import type { ArticleDiscountMode } from "@/lib/articleDiscount"
import type { ArticleItemKind } from "@/lib/articleItemKind"

export type ArticleListPriceSnap = {
  listId: string
  amount: number
}

export type ArticleSnapshot = {
  id: string
  name: string
  description: string
  imageUrl: string | null
  barcode: string | null
  sku: string | null
  itemKind: ArticleItemKind
  categoryId: string
  categoryName: string
  salePrice: number
  iva: number
  discountMode: ArticleDiscountMode | null
  discountValue: number | null
  unitOfMeasure: string
  isSellable: boolean
  isActive: boolean
  allowNegativeStock: boolean
  stockOnHand: number
  listPrices: ArticleListPriceSnap[]
}

export type ListSaleBoardArticlesInput = {
  categoryId?: string | null
  search?: string
  page: number
  pageSize: number
}

export type ListSaleBoardArticlesResult = {
  articles: ArticleSnapshot[]
  totalCount: number
  page: number
}
