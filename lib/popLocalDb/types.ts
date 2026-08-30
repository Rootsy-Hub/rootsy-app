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
  categoryIds?: string[]
  search?: string
  page: number
  pageSize: number
}

export type ListMenuRecipesInput = {
  categoryId?: string | null
  categoryIds?: string[]
  search?: string
  page: number
  pageSize: number
}

export type ListSaleBoardArticlesResult = {
  articles: ArticleSnapshot[]
  totalCount: number
  page: number
}

export type CategorySnapshot = {
  id: string
  name: string
  itemKind: ArticleItemKind
  sortOrder: number
  showInSale: boolean
  visible: boolean
  showInMenu: boolean
}

export type PromotionSlotOptionSnap = {
  id: string
  kind: "article" | "recipe"
  refId: string
  name: string
  salePrice: number
  iva: number
}

export type PromotionSlotSnap = {
  id: string
  label: string
  quantity: number
  sortOrder: number
  options: PromotionSlotOptionSnap[]
}

export type PromotionSnapshot = {
  id: string
  name: string
  description: string
  imageUrl: string | null
  promotionType: "combo" | "quantity_deal"
  pricingMode: "fixed_total" | "percent_off" | "fixed_off"
  fixedPrice: number | null
  discountMode: "porcentaje" | "fijo" | null
  discountValue: number | null
  buyQuantity: number | null
  benefitQuantity: number | null
  benefitDiscountPct: number | null
  applyBenefitTo: "cheapest" | "most_expensive" | null
  autoApply: boolean
  showInMenu: boolean
  isActive: boolean
  sortOrder: number
  validFrom: string | null
  validUntil: string | null
  validTimeStart: string | null
  validTimeEnd: string | null
  scheduleDays: number[]
  slots: PromotionSlotSnap[]
}

export type RecipeSnapshot = {
  id: string
  name: string
  description: string
  imageUrl: string | null
  categoryId: string
  categoryName: string
  salePrice: number
  iva: number
  isActive: boolean
  allowNegativeStock: boolean
  stationId: string | null
  outputArticleId: string | null
  listPrices: ArticleListPriceSnap[]
}

export type RecipeIngredientSnapshot = {
  recipeId: string
  articleId: string
  quantity: number
  wastePct: number | null
  articleDefaultWastePct: number | null
  sortOrder: number
}

export type ListMenuRecipesResult = {
  recipes: RecipeSnapshot[]
  totalCount: number
  page: number
}

export type RecipeCategorySnapshot = {
  id: string
  name: string
  sortOrder: number
  showInMenu: boolean
  isActive: boolean
  stationId: string | null
}
