import { workspaceDataTableClassName } from "@/components/data-workspace/dataWorkspaceListStyles"

export {
  articleDialogSurfaceClass as promotionDialogSurfaceClass,
  articleDialogSurfaceTwoColClass as promotionDialogSurfaceWideClass,
  articleDialogHeaderClass as promotionDialogHeaderClass,
  articleDialogBodyClass as promotionDialogBodyClass,
  articleDialogFooterClass as promotionDialogFooterClass,
  articleFormTextFieldClass as promotionFormFieldClass,
  articleFormSelectTriggerClass as promotionFormSelectTriggerClass,
  articleFormTextareaClass as promotionFormTextareaClass,
  articleFormSelectContentClass as promotionFormSelectContentClass,
  articleFormSelectItemClass as promotionFormSelectItemClass,
} from "@/app/[siteId]/[popId]/articles/articleConstants"

/** Frase que el usuario debe escribir para confirmar borrado de una promoción. */
export function promotionDeleteConfirmPhrase(promotionName: string): string {
  const name = promotionName.trim() || "esta promoción"
  return `Eliminar ${name}`
}

/** @deprecated Usar `promotionDeleteConfirmPhrase` */
export const PROMOTION_DELETE_CONFIRM_PHRASE = "ELIMINAR"

export const PROMOTION_TABLE_PAGE_SIZES = [10, 25, 50] as const
export const DEFAULT_PROMOTION_TABLE_PAGE_SIZE = 25

/** @deprecated Usar `workspaceDataTableClassName` desde dataWorkspaceListStyles */
export const promotionsStockTableClassName = workspaceDataTableClassName

export const QUANTITY_DEAL_SLOT_LABEL = "Productos elegibles"
