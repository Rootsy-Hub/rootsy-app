import { workspaceTableLayoutHeaderHeadClass } from "@/components/data-workspace/dataWorkspaceTablesLayout"
import { cn } from "@/lib/utils"

export const promotionTableImageColumnClass = "w-14"
export const promotionTableNameColumnClass = "w-56 min-w-56 max-w-64"
export const promotionTableTypeColumnClass = "w-28 min-w-28 max-w-28"
export const promotionTablePricingColumnClass = "w-40 min-w-40 max-w-40"
export const promotionTableScheduleColumnClass = "w-56 min-w-56 max-w-64"
export const promotionTableItemsColumnClass = "w-32 min-w-32 max-w-32"
export const promotionTableStatusColumnClass = "w-32 min-w-32 max-w-32"
export const promotionTableActionsColumnClass = "w-[7.25rem] min-w-[7.25rem] max-w-[7.25rem]"

export function promotionTableHeaderClass(...extra: Array<string | undefined>) {
  return cn("px-3", workspaceTableLayoutHeaderHeadClass, ...extra)
}
