import { workspaceDataTableClassName } from "@/components/data-workspace/dataWorkspaceListStyles"
import { cn } from "@/lib/utils"

export const RECIPE_DELETE_CONFIRM_PHRASE = "ELIMINAR"

export const RECIPE_TABLE_PAGE_SIZES = [10, 25, 50, 100] as const
export const DEFAULT_RECIPE_TABLE_PAGE_SIZE = 25

export const recipeFormFieldClass = "bg-background"

export const recipeDialogSurfaceClass = cn(
  "rootsy-app-light gap-0 overflow-hidden rounded-2xl border border-border/60 bg-card p-0 text-foreground shadow-2xl ring-1 ring-black/[0.04] sm:max-w-md",
  "max-h-[min(90vh,640px)] flex flex-col overflow-hidden",
)

export const recipeDialogSurfaceWideClass = cn(
  recipeDialogSurfaceClass,
  "sm:max-w-2xl max-h-[min(92vh,900px)]",
)

export const recipeDialogHeaderClass =
  "shrink-0 space-y-1 border-b border-border/50 bg-muted/25 px-6 pb-4 pt-5 text-left"

export const recipeDialogBodyClass =
  "min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-4"

export const recipeDialogFooterClass =
  "shrink-0 gap-3 border-t border-border/50 bg-muted/10 px-6 py-4 sm:flex-row sm:justify-end"

/** @deprecated Usar `workspaceDataTableClassName` desde dataWorkspaceListStyles */
export const recipesStockTableClassName = workspaceDataTableClassName
