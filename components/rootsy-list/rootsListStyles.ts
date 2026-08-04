import {
  rootsFormEarthBgSubtleClass,
  rootsFormEarthBorderClass,
  rootsFormEarthHighlightHoverClass,
  rootsFormEarthTextClass,
  rootsFormEarthTextSecondaryClass,
  rootsFormEarthTextTertiaryClass,
} from "@/components/rootsy-form/rootsFormEarthTokens"
import {
  rootsFormControlTypographyClass,
  rootsFormTextFieldClass,
} from "@/components/rootsy-form/rootsFormStyles"
import { cn } from "@/lib/utils"

export const ROOTS_SORTABLE_ROW_HEIGHT_PX = 44
export const ROOTS_SORTABLE_ROW_GAP_PX = 6
export const ROOTS_SORTABLE_SLOT_SHIFT_PX =
  ROOTS_SORTABLE_ROW_HEIGHT_PX + ROOTS_SORTABLE_ROW_GAP_PX

export const ROOTS_SORTABLE_LAYOUT_TRANSITION =
  "transform 320ms cubic-bezier(0.32, 0.72, 0, 1)"

export const rootsSortableListPanelClass = cn(
  "rounded-lg border shadow-xs",
  rootsFormEarthBorderClass,
  rootsFormEarthBgSubtleClass,
)

export const rootsSortableListPanelHeaderClass = cn(
  "border-b px-3 py-2.5",
  rootsFormEarthBorderClass,
)

export const rootsSortableListPanelTitleClass = cn(
  "text-sm font-semibold",
  rootsFormEarthTextClass,
)

export const rootsSortableListPanelDescriptionClass = cn(
  "mt-0.5 text-xs leading-snug",
  rootsFormEarthTextSecondaryClass,
)

export const rootsSortableListBodyClass = "p-2"

export const rootsSortableListRowClass = cn(
  "flex h-11 items-center gap-2 rounded-lg border bg-white px-2 shadow-xs transition-[border-color,background-color]",
  rootsFormEarthBorderClass,
  "hover:border-[#d6d3d1]",
)

export const rootsSortableListRowLabelClass = cn(
  "truncate text-sm font-medium",
  rootsFormControlTypographyClass,
  rootsFormEarthTextClass,
)

export const rootsSortableListRowLabelMutedClass =
  rootsFormEarthTextSecondaryClass

export const rootsSortableListDragHandleClass = cn(
  "inline-flex size-8 shrink-0 cursor-grab items-center justify-center rounded-lg transition-colors",
  rootsFormEarthTextTertiaryClass,
  rootsFormEarthHighlightHoverClass,
  "hover:text-[#78716c] active:cursor-grabbing",
)

export const rootsSortableListDragHandleIconClass = rootsFormEarthTextTertiaryClass

export const rootsSortableListInlineEditInputClass = cn(
  rootsFormTextFieldClass,
  "h-8 px-2.5",
)

export const rootsSortableListEmptyClass = cn(
  "rounded-lg border border-dashed px-3 py-6 text-center text-xs",
  rootsFormEarthBorderClass,
  rootsFormEarthTextSecondaryClass,
)

export const rootsSortableListFooterHintClass = cn(
  "text-xs leading-snug",
  rootsFormEarthTextSecondaryClass,
)
