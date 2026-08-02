import { workspaceDataTableClassName } from "@/components/data-workspace/dataWorkspaceListStyles"
import { cn } from "@/lib/utils"

export const PROMOTION_DELETE_CONFIRM_PHRASE = "ELIMINAR"

export const PROMOTION_TABLE_PAGE_SIZES = [10, 25, 50] as const
export const DEFAULT_PROMOTION_TABLE_PAGE_SIZE = 25

export const promotionFormFieldClass = "bg-background"

export const promotionDialogSurfaceClass = cn(
  "rootsy-app-light gap-0 overflow-hidden rounded-2xl border border-border/60 bg-card p-0 text-foreground shadow-2xl ring-1 ring-black/[0.04] sm:max-w-md",
  "max-h-[min(90vh,640px)] flex flex-col overflow-hidden",
)

export const promotionDialogSurfaceWideClass = cn(
  promotionDialogSurfaceClass,
  "sm:max-w-3xl max-h-[min(92vh,920px)]",
)

export const promotionDialogHeaderClass =
  "shrink-0 space-y-1 border-b border-border/50 bg-muted/25 px-6 pb-4 pt-5 text-left"

export const promotionDialogBodyClass =
  "min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-4"

export const promotionDialogFooterClass =
  "shrink-0 gap-3 border-t border-border/50 bg-muted/10 px-6 py-4 sm:flex-row sm:justify-end"

/** @deprecated Usar `workspaceDataTableClassName` desde dataWorkspaceListStyles */
export const promotionsStockTableClassName = workspaceDataTableClassName

export const QUANTITY_DEAL_SLOT_LABEL = "Productos elegibles"
