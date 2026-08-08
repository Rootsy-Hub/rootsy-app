import {
  workspaceTableLayoutActionsBodyCellClass,
  workspaceTableLayoutHeaderHeadClass,
} from "@/components/data-workspace/dataWorkspaceTablesLayout"
import { cn } from "@/lib/utils"

/** Columnas fijas — `table-fixed`; Detalle con ancho acotado (evita hueco hasta Comprobante). */
export const operationsTableDateColumnClass = "w-40 min-w-40 max-w-40"
export const operationsTableDetailColumnClass = "w-56 min-w-56 max-w-64"
export const operationsTableComprobanteColumnClass = "w-44 min-w-44 max-w-44"
export const operationsTableMoneyColumnClass = "w-28 min-w-28 max-w-28"
/** Solo icono ⋮ — columna mínima (32px botón + padding lateral). */
export const operationsTableActionsColumnClass = "w-10 min-w-10 max-w-10"

export function operationsTableHeaderClass(...extra: Array<string | undefined>) {
  return cn("px-3", workspaceTableLayoutHeaderHeadClass, ...extra)
}

export function operationsTableActionsHeaderClass() {
  return cn(
    "!px-0.5",
    workspaceTableLayoutHeaderHeadClass,
    operationsTableActionsColumnClass,
  )
}

export const operationsTableActionsBodyCellClass = cn(
  workspaceTableLayoutActionsBodyCellClass,
  "!px-0.5",
  operationsTableActionsColumnClass,
)
