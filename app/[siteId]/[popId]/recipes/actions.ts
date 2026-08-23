import type { ArticleItemKind } from "@/lib/articleItemKind"
import type { SalePriceListAmountInput } from "@/lib/salePriceLists"

export type RecipeCategoryOption = {
  id: string
  name: string
  sortOrder: number
  showInMenu: boolean
  isActive: boolean
  stationId: string | null
  stationName: string | null
}

export type ComandaStationOption = {
  id: string
  name: string
  sortOrder: number
  isActive: boolean
}

export type RecipeCategoryLayoutUpdate = {
  id: string
  sortOrder: number
  showInMenu: boolean
}

export type RecipeIngredientOption = {
  id: string
  name: string
  itemKind: ArticleItemKind
  unitOfMeasure: string
  costPrice: number
  defaultWastePct: number | null
}

export type RecipeIngredientInput = {
  articleId: string
  quantity: number
  wastePct: number | null
}

export type RecipeIngredientRow = {
  id: string
  articleId: string
  articleName: string
  itemKind: ArticleItemKind
  unitOfMeasure: string
  quantity: number
  wastePct: number | null
  articleCostPrice: number
  articleDefaultWastePct: number | null
  lineCost: number
}

export type RecipeTableRow = {
  id: string
  name: string
  description: string
  imageUrl: string | null
  categoryId: string | null
  categoryName: string
  salePrice: number
  costPrice: number
  iva: number
  ingredientCount: number
  isActive: boolean
  allowNegativeStock: boolean
  outputArticleId: string | null
  outputArticleName: string | null
}

export type RecipeDetail = RecipeTableRow & {
  ingredients: RecipeIngredientRow[]
  listPrices: { listId: string; amount: number }[]
}

export type CreateRecipeInput = {
  name: string
  description: string
  imageUrl: string
  categoryId: string
  salePrice: number
  iva: number
  isActive: boolean
  allowNegativeStock: boolean
  outputArticleId: string | null
  ingredients: RecipeIngredientInput[]
  listPrices?: SalePriceListAmountInput[]
}

export type UpdateRecipeInput = CreateRecipeInput

export type GetPopRecipesTableInput = {
  q?: string
  page?: number
  pageSize?: number
  soloActivos?: boolean
  categoryId?: string
  sort?: string | null
  ord?: "asc" | "desc"
}
