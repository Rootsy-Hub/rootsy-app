import {
  rootsFormAffixPrefixClass,
  rootsFormColumnClass,
  rootsFormFieldStackClass,
  rootsFormGridClass,
  rootsFormSelectContentClass,
  rootsFormSelectItemClass,
  rootsFormSelectTriggerClass,
  rootsFormTextFieldClass,
  rootsFormTextareaFieldClass,
  rootsFormTwoColRowClass,
} from "@/components/rootsy-form/rootsFormStyles"
import { rootsyElevationOverlayLightClass } from "@/components/elevation/rootsyElevationStyles"
import { rootsDialogBodyClass } from "@/components/rootsy-dialog/rootsDialogStyles"
import { cn } from "@/lib/utils"

/** Frase que el usuario debe escribir para confirmar borrado de un artículo. */
export function articleDeleteConfirmPhrase(articleName: string): string {
  const name = articleName.trim() || "este artículo"
  return `Eliminar ${name}`
}

/** Altura única para inputs, selects y controles de una línea en el formulario de artículo. */
export const articleFormControlHeightClass = "h-11"

/**
 * Shell visual compartido — alias de RootsForm light form (rounded-lg, borde zinc, foco emerald).
 * @see components/rootsy-form/rootsFormStyles.ts
 */
export const articleFormControlShellClass = rootsFormTextFieldClass

export const articleFormFieldStackClass = rootsFormFieldStackClass

export const articleFormColumnClass = rootsFormColumnClass

export const articleFormGridClass = rootsFormGridClass

export const articleFormTwoColRowClass = rootsFormTwoColRowClass

export const articleFormSelectTriggerClass = rootsFormSelectTriggerClass

export const articleFormTextFieldClass = rootsFormTextFieldClass

export const articleFormInlineAddonClass = cn(
  rootsFormAffixPrefixClass,
  "border-border/70",
)

export const articleFormTextareaClass = rootsFormTextareaFieldClass

export const articleFormSelectContentClass = rootsFormSelectContentClass

export const articleFormSelectItemClass = rootsFormSelectItemClass

/** iOS — dim suave + blur ligero detrás del sheet. */
export const articleDialogOverlayClass =
  "bg-black/25 backdrop-blur-[3px]"

const articleDialogIOSShellClass = cn(
  "rootsy-app-light rootsy-nature-palette flex flex-col gap-0 overflow-hidden p-0 text-foreground",
  rootsyElevationOverlayLightClass,
  "[&_[data-slot=dialog-close]]:top-4 [&_[data-slot=dialog-close]]:right-4 [&_[data-slot=dialog-close]]:rounded-full [&_[data-slot=dialog-close]]:opacity-60",
)

export const articleDialogSurfaceClass = cn(
  articleDialogIOSShellClass,
  "max-h-[min(90vh,640px)] sm:max-w-md",
)

export const articleDialogSurfaceWideClass = cn(
  articleDialogSurfaceClass,
  "sm:max-w-lg max-h-[min(90vh,560px)]",
)

export const articleDialogSurfaceTwoColClass = cn(
  articleDialogIOSShellClass,
  "max-h-[min(90vh,860px)] sm:max-w-4xl",
)

export const articleDialogTitleClass =
  "text-[17px] font-semibold leading-snug tracking-[-0.01em] text-foreground"

export const articleDialogDescriptionClass =
  "text-[13px] leading-snug text-muted-foreground"

export const articleDialogHeaderClass =
  "flex shrink-0 flex-col gap-0.5 border-b border-black/[0.06] bg-white px-5 pb-3.5 pt-5 text-left"

export const articleDialogBodyClass = rootsDialogBodyClass

export const articleDialogFooterClass =
  "shrink-0 gap-2.5 border-t border-black/[0.06] bg-white px-5 py-3 sm:flex-row sm:items-center sm:justify-between"
