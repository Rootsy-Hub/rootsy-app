import { workspaceTableLayoutHeaderHeadClass } from "@/components/data-workspace/dataWorkspaceTablesLayout"
import { cn } from "@/lib/utils"

export const recipeTableImageColumnClass = "w-14"
export const recipeTableNameColumnClass = "w-56 min-w-56 max-w-64"
export const recipeTableCategoryColumnClass = "w-40 min-w-40 max-w-44"
export const recipeTableSaleColumnClass = "w-32 min-w-32 max-w-32"
export const recipeTableCostColumnClass = "w-32 min-w-32 max-w-32"
export const recipeTableIngredientsColumnClass = "w-28 min-w-28 max-w-28"
export const recipeTableStatusColumnClass = "w-32 min-w-32 max-w-32"
export const recipeTableActionsColumnClass = "w-[7.25rem] min-w-[7.25rem] max-w-[7.25rem]"

export function recipeTableHeaderClass(...extra: Array<string | undefined>) {
  return cn("px-3", workspaceTableLayoutHeaderHeadClass, ...extra)
}
