import {
  createEmptyIngredientLine,
  ingredientLinesToInput,
  type RecipeIngredientFormLine,
} from "@/app/[siteId]/[popId]/recipes/components/RecipeIngredientEditor"
import type { RecipeTableRow } from "@/app/[siteId]/[popId]/recipes/actions"
import { parseMoneyInput } from "@/lib/moneyInput"

export type RecipeFormState = {
  name: string
  description: string
  imageUrl: string
  categoryId: string
  salePrice: string
  iva: string
  isActive: boolean
  allowNegativeStock: boolean
  outputArticleId: string
  outputArticleName: string
  ingredients: RecipeIngredientFormLine[]
  listPrices: Record<string, string>
}

export function defaultRecipeFormState(): RecipeFormState {
  return {
    name: "",
    description: "",
    imageUrl: "",
    categoryId: "",
    salePrice: "0",
    iva: "21",
    isActive: true,
    allowNegativeStock: false,
    outputArticleId: "",
    outputArticleName: "",
    ingredients: [createEmptyIngredientLine()],
    listPrices: {},
  }
}

export function recipeFormFromDetail(
  row: RecipeTableRow,
  ingredients: RecipeIngredientFormLine[],
  listPrices: Record<string, string> = {},
): RecipeFormState {
  return {
    name: row.name,
    description: row.description,
    imageUrl: row.imageUrl ?? "",
    categoryId: row.categoryId ?? "",
    salePrice: String(row.salePrice),
    iva: String(row.iva),
    isActive: row.isActive,
    allowNegativeStock: row.allowNegativeStock,
    outputArticleId: row.outputArticleId ?? "",
    outputArticleName: row.outputArticleName ?? "",
    ingredients:
      ingredients.length > 0 ? ingredients : [createEmptyIngredientLine()],
    listPrices,
  }
}

export function recipeFormToPayload(form: RecipeFormState) {
  return {
    name: form.name,
    description: form.description,
    imageUrl: form.imageUrl,
    categoryId: form.categoryId,
    salePrice: parseMoneyInput(form.salePrice),
    iva: Number(form.iva.replace(",", ".")),
    isActive: form.isActive,
    allowNegativeStock: form.allowNegativeStock,
    outputArticleId: form.outputArticleId.trim() || null,
    ingredients: ingredientLinesToInput(form.ingredients),
  }
}

export type RecipesAppliedFilters = {
  soloActivos: boolean
  categoryId: string
}

export function defaultRecipesFilters(): RecipesAppliedFilters {
  return {
    soloActivos: false,
    categoryId: "",
  }
}
