import {
  rootsFormUiControlTypographyClass,
  rootsFormUiTextFieldClass,
} from "@/components/rootsy-form/rootsFormUiStyles"
import { cn } from "@/lib/utils"

export const ROOTS_SORTABLE_ROW_HEIGHT_PX = 44
export const ROOTS_SORTABLE_ROW_GAP_PX = 6
export const ROOTS_SORTABLE_SLOT_SHIFT_PX =
  ROOTS_SORTABLE_ROW_HEIGHT_PX + ROOTS_SORTABLE_ROW_GAP_PX

export const ROOTS_SORTABLE_COMFORTABLE_ROW_HEIGHT_PX = 56
export const ROOTS_SORTABLE_COMFORTABLE_ROW_GAP_PX = 8
export const ROOTS_SORTABLE_COMFORTABLE_SLOT_SHIFT_PX =
  ROOTS_SORTABLE_COMFORTABLE_ROW_HEIGHT_PX +
  ROOTS_SORTABLE_COMFORTABLE_ROW_GAP_PX

export type RootsSortableRowSize = "default" | "comfortable"

export function rootsSortableRowMetrics(size: RootsSortableRowSize = "default") {
  if (size === "comfortable") {
    return {
      rowHeightPx: ROOTS_SORTABLE_COMFORTABLE_ROW_HEIGHT_PX,
      rowGapPx: ROOTS_SORTABLE_COMFORTABLE_ROW_GAP_PX,
      slotShiftPx: ROOTS_SORTABLE_COMFORTABLE_SLOT_SHIFT_PX,
    }
  }
  return {
    rowHeightPx: ROOTS_SORTABLE_ROW_HEIGHT_PX,
    rowGapPx: ROOTS_SORTABLE_ROW_GAP_PX,
    slotShiftPx: ROOTS_SORTABLE_SLOT_SHIFT_PX,
  }
}

export const ROOTS_SORTABLE_LAYOUT_TRANSITION =
  "transform 320ms cubic-bezier(0.32, 0.72, 0, 1)"

/** Panel contenedor — bruma-50 · radius.large · sin elevación en shell. */
export const rootsSortableListPanelClass = cn(
  "overflow-hidden rounded-[12px] border border-[var(--rootsy-bruma-200)] bg-[var(--rootsy-bruma-50)] shadow-none",
)

export const rootsSortableListPanelHeaderClass =
  "border-b border-[var(--rootsy-bruma-200)] px-3 py-2.5"

export const rootsSortableListPanelTitleClass =
  "font-canopy text-sm font-semibold text-[var(--rootsy-bruma-900)]"

export const rootsSortableListPanelDescriptionClass =
  "mt-0.5 font-canopy text-xs leading-snug text-[var(--rootsy-bruma-500)]"

export const rootsSortableListBodyClass = "p-2"

/** Fila — overlay blanco · borde bruma · hover bruma-300. */
export const rootsSortableListRowClass = cn(
  "flex h-11 w-full min-w-0 items-center gap-2 rounded-[12px] border border-[var(--rootsy-bruma-200)] bg-[var(--rootsy-white)] px-2 shadow-none transition-[border-color,background-color]",
  "hover:border-[var(--rootsy-bruma-300)]",
)

export const rootsSortableListRowLabelClass = cn(
  rootsFormUiControlTypographyClass,
  "truncate font-medium text-[var(--rootsy-bruma-900)]",
)

export const rootsSortableListRowLabelMutedClass = "text-[var(--rootsy-bruma-500)]"

export const rootsSortableListDragHandleClass = cn(
  "inline-flex size-8 shrink-0 cursor-grab items-center justify-center rounded-[8px] text-[var(--rootsy-bruma-500)] transition-colors",
  "hover:bg-[var(--rootsy-bruma-50)] hover:text-[var(--rootsy-bruma-900)]",
  "active:cursor-grabbing",
  "focus-visible:outline-none focus-visible:shadow-[0_0_0_2px_color-mix(in_srgb,var(--rootsy-savia-400)_45%,transparent)]",
)

export const rootsSortableListDragHandleIconClass = "text-[var(--rootsy-bruma-500)]"

export const rootsSortableListInlineEditInputClass = cn(
  rootsFormUiTextFieldClass,
  "h-8 px-2.5",
)

export const rootsSortableListEmptyClass = cn(
  "rounded-[12px] border border-dashed border-[var(--rootsy-bruma-200)] px-3 py-6 text-center font-canopy text-xs text-[var(--rootsy-bruma-500)]",
)

export const rootsSortableListFooterHintClass =
  "font-canopy text-xs leading-snug text-[var(--rootsy-bruma-500)]"
