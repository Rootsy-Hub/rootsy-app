import {
  createEmptyIngredientLine,
  ingredientLinesToInput,
  type RecipeIngredientFormLine,
} from "@/app/[siteId]/[popId]/recipes/components/RecipeIngredientEditor"
import type { RecipeTableRow } from "@/app/[siteId]/[popId]/recipes/actions"

export type RecipeFormState = {
  name: string
  description: string
  imageUrl: string
  categoryId: string
  salePrice: string
  iva: string
  isActive: boolean
  ingredients: RecipeIngredientFormLine[]
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
    ingredients: [createEmptyIngredientLine()],
  }
}

export function recipeFormFromDetail(
  row: RecipeTableRow,
  ingredients: RecipeIngredientFormLine[],
): RecipeFormState {
  return {
    name: row.name,
    description: row.description,
    imageUrl: row.imageUrl ?? "",
    categoryId: row.categoryId ?? "",
    salePrice: String(row.salePrice),
    iva: String(row.iva),
    isActive: row.isActive,
    ingredients:
      ingredients.length > 0 ? ingredients : [createEmptyIngredientLine()],
  }
}

export function recipeFormToPayload(form: RecipeFormState) {
  return {
    name: form.name,
    description: form.description,
    imageUrl: form.imageUrl,
    categoryId: form.categoryId,
    salePrice: Number(form.salePrice.replace(",", ".")),
    iva: Number(form.iva.replace(",", ".")),
    isActive: form.isActive,
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
