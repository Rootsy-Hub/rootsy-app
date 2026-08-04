import { workspaceDataTableClassName } from "@/components/data-workspace/dataWorkspaceListStyles"

export {
  articleDialogSurfaceClass as recipeDialogSurfaceClass,
  articleDialogSurfaceWideClass as recipeDialogSurfaceWideClass,
  articleDialogSurfaceTwoColClass as recipeDialogSurfaceTwoColClass,
  articleDialogHeaderClass as recipeDialogHeaderClass,
  articleDialogBodyClass as recipeDialogBodyClass,
  articleDialogFooterClass as recipeDialogFooterClass,
  articleFormTextFieldClass as recipeFormFieldClass,
  articleFormSelectTriggerClass as recipeFormSelectTriggerClass,
  articleFormTextareaClass as recipeFormTextareaClass,
  articleFormSelectContentClass as recipeFormSelectContentClass,
  articleFormSelectItemClass as recipeFormSelectItemClass,
} from "@/app/[siteId]/[popId]/articles/articleConstants"

/** Frase que el usuario debe escribir para confirmar borrado de una receta. */
export function recipeDeleteConfirmPhrase(recipeName: string): string {
  const name = recipeName.trim() || "esta receta"
  return `Eliminar ${name}`
}

/** @deprecated Usar `recipeDeleteConfirmPhrase` */
export const RECIPE_DELETE_CONFIRM_PHRASE = "ELIMINAR"

export const RECIPE_TABLE_PAGE_SIZES = [10, 25, 50, 100] as const
export const DEFAULT_RECIPE_TABLE_PAGE_SIZE = 25

/** @deprecated Usar `workspaceDataTableClassName` desde dataWorkspaceListStyles */
export const recipesStockTableClassName = workspaceDataTableClassName
