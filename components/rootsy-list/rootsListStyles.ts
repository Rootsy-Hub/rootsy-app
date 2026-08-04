import { cn } from "@/lib/utils"

export const ROOTS_SORTABLE_ROW_HEIGHT_PX = 44
export const ROOTS_SORTABLE_ROW_GAP_PX = 6
export const ROOTS_SORTABLE_SLOT_SHIFT_PX =
  ROOTS_SORTABLE_ROW_HEIGHT_PX + ROOTS_SORTABLE_ROW_GAP_PX

export const ROOTS_SORTABLE_LAYOUT_TRANSITION =
  "transform 320ms cubic-bezier(0.32, 0.72, 0, 1)"

export const rootsSortableListPanelClass =
  "rounded-xl border border-zinc-200 bg-zinc-50/80 dark:border-zinc-200 dark:bg-zinc-50/80"

export const rootsSortableListPanelHeaderClass =
  "border-b border-zinc-200/80 px-3 py-2.5 dark:border-zinc-200/80"

export const rootsSortableListPanelTitleClass =
  "text-sm font-semibold text-foreground"

export const rootsSortableListPanelDescriptionClass =
  "mt-0.5 text-xs leading-snug text-muted-foreground"

export const rootsSortableListBodyClass = "p-2"

export const rootsSortableListRowClass = cn(
  "flex h-11 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-2 shadow-xs",
  "dark:border-zinc-200 dark:bg-white",
)

export const rootsSortableListRowMutedClass = "opacity-60"

export const rootsSortableListDragHandleClass =
  "inline-flex size-8 shrink-0 cursor-grab items-center justify-center rounded-lg text-zinc-500 active:cursor-grabbing"

export const rootsSortableListEmptyClass =
  "rounded-lg border border-dashed border-zinc-200 px-3 py-6 text-center text-xs text-muted-foreground"

export const rootsSortableListFooterHintClass =
  "text-xs leading-snug text-muted-foreground"
