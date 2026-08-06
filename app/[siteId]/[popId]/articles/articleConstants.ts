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
import {
  rootsDialogBodyClass,
  rootsDialogDescriptionClass,
  rootsDialogFooterClass,
  rootsDialogHeaderClass,
  rootsDialogOverlayClass,
  rootsDialogSurfaceDefaultClass,
  rootsDialogSurfaceTwoColClass,
  rootsDialogSurfaceWideClass,
  rootsDialogTitleClass,
} from "@/components/rootsy-dialog/rootsDialogProductStyles"
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

/** Scrim sombra-950 40% + blur — Modales UI. */
export const articleDialogOverlayClass = rootsDialogOverlayClass

export const articleDialogSurfaceClass = rootsDialogSurfaceDefaultClass

export const articleDialogSurfaceWideClass = rootsDialogSurfaceWideClass

export const articleDialogSurfaceTwoColClass = rootsDialogSurfaceTwoColClass

export const articleDialogTitleClass = rootsDialogTitleClass

export const articleDialogDescriptionClass = rootsDialogDescriptionClass

export const articleDialogHeaderClass = rootsDialogHeaderClass

export const articleDialogBodyClass = rootsDialogBodyClass

export const articleDialogFooterClass = rootsDialogFooterClass
