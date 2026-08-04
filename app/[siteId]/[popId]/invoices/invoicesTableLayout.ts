import { workspaceTableLayoutHeaderHeadClass } from "@/components/data-workspace/dataWorkspaceTablesLayout"
import { cn } from "@/lib/utils"

export const invoiceTableExpandColumnClass = "w-12 min-w-12 max-w-12"
export const invoiceTableTypeColumnClass = "w-36 min-w-36 max-w-40"
export const invoiceTableDateColumnClass = "w-28 min-w-28 max-w-28"
export const invoiceTableNumberColumnClass = "w-32 min-w-32 max-w-32"
export const invoiceTableReceptorColumnClass = "min-w-[10rem] w-48 max-w-56"
export const invoiceTableTotalColumnClass = "w-32 min-w-32 max-w-32"
export const invoiceTableCaeColumnClass = "w-28 min-w-28 max-w-32"
export const invoiceTableStatusColumnClass = "w-32 min-w-32 max-w-36"

export const INVOICE_TABLE_COLUMN_COUNT = 8

export function invoiceTableHeaderClass(...extra: Array<string | undefined>) {
  return cn("px-3", workspaceTableLayoutHeaderHeadClass, ...extra)
}
