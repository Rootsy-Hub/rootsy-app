import { workspaceTableLayoutHeaderHeadClass } from "@/components/data-workspace/dataWorkspaceTablesLayout"
import { cn } from "@/lib/utils"

/** Columnas fijas — `table-fixed`; Detalle con ancho acotado (evita hueco hasta Comprobante). */
export const operationsTableDateColumnClass = "w-40 min-w-40 max-w-40"
export const operationsTableDetailColumnClass = "w-56 min-w-56 max-w-64"
export const operationsTableComprobanteColumnClass = "w-44 min-w-44 max-w-44"
export const operationsTableMoneyColumnClass = "w-28 min-w-28 max-w-28"

export function operationsTableHeaderClass(...extra: Array<string | undefined>) {
  return cn("px-3", workspaceTableLayoutHeaderHeadClass, ...extra)
}
