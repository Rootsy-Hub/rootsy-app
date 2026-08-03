import {
  lightToolbarFocusClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import {
  rootsFormColumnClass,
  rootsFormFieldStackClass,
  rootsFormGridClass,
  rootsFormTwoColRowClass,
} from "@/components/rootsy-form/rootsFormStyles"
import {
  saleOpChannelFormField,
  saleOpLightSelectContent,
  saleOpLightSelectItem,
} from "@/components/sale-operation/saleOperationStyles"
import { cn } from "@/lib/utils"

export const ARTICLE_DELETE_CONFIRM_PHRASE = "ELIMINAR"

/** Altura única para inputs, selects y controles de una línea en el formulario de artículo. */
export const articleFormControlHeightClass = "h-11"

/**
 * Shell visual compartido: mismo borde, radio, fondo y altura fija para todos los controles de 1 línea.
 */
export const articleFormControlShellClass = cn(
  saleOpChannelFormField,
  articleFormControlHeightClass,
  "box-border !min-h-11 !max-h-11 w-full min-w-0 shrink-0 shadow-none",
  lightToolbarFocusClass,
)

export const articleFormFieldStackClass = rootsFormFieldStackClass

export const articleFormColumnClass = rootsFormColumnClass

export const articleFormGridClass = rootsFormGridClass

export const articleFormTwoColRowClass = rootsFormTwoColRowClass

export const articleFormSelectTriggerClass = cn(
  articleFormControlShellClass,
  "!w-full justify-between px-3.5 !py-0",
  "data-[size=default]:!h-11 data-[size=sm]:!h-11",
  "bg-muted/15 hover:bg-muted/20",
)

export const articleFormTextFieldClass = cn(
  articleFormControlShellClass,
  "px-3.5 text-sm",
)

export const articleFormInlineAddonClass =
  "inline-flex shrink-0 self-stretch items-center border-border/70 bg-muted/35 px-3.5 text-sm font-semibold tabular-nums text-muted-foreground"

export const articleFormTextareaClass = cn(
  saleOpChannelFormField,
  "min-h-[5.25rem] w-full min-w-0 resize-y bg-muted/15 px-3.5 py-2.5 text-sm leading-relaxed shadow-none",
  lightToolbarFocusClass,
)

export const articleFormSelectContentClass = saleOpLightSelectContent

export const articleFormSelectItemClass = saleOpLightSelectItem

export const articleDialogSurfaceClass = cn(
  "rootsy-app-light gap-0 overflow-hidden rounded-2xl border border-border/60 bg-card p-0 text-foreground shadow-2xl ring-1 ring-black/[0.04] sm:max-w-md",
  "max-h-[min(90vh,640px)] flex flex-col overflow-hidden",
)

export const articleDialogSurfaceWideClass = cn(
  articleDialogSurfaceClass,
  "sm:max-w-lg max-h-[min(90vh,560px)]",
)

export const articleDialogSurfaceTwoColClass = cn(
  "rootsy-app-light gap-0 overflow-hidden rounded-2xl border border-border/60 bg-card p-0 text-foreground shadow-2xl ring-1 ring-black/[0.04]",
  "sm:max-w-4xl max-h-[min(90vh,860px)] flex flex-col overflow-hidden",
)

export const articleDialogHeaderClass =
  "shrink-0 border-b border-border/50 bg-muted/25 px-6 pb-4 pt-5 text-left"

export const articleDialogBodyClass =
  "min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-4"

export const articleDialogFooterClass =
  "shrink-0 gap-2 border-t border-border/50 bg-muted/10 px-6 py-4 sm:flex-row sm:items-center sm:justify-between"
