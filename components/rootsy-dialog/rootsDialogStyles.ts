import {
  rootsFormEarthBgSubtleClass,
  rootsFormEarthBorderClass,
  rootsFormEarthTextClass,
  rootsFormEarthTextSecondaryClass,
} from "@/components/rootsy-form/rootsFormEarthTokens"
import {
  rootsFormFieldLabelClass,
  rootsFormFieldStackClass,
} from "@/components/rootsy-form/rootsFormStyles"
import { cn } from "@/lib/utils"

/** Contenido scrollable — tierra suave; header y footer en blanco. */
export const rootsDialogBodyClass = cn(
  "min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4",
  rootsFormEarthBgSubtleClass,
)

/** Body compacto — altura según contenido; scroll solo si desborda el modal. */
export const rootsDialogBodyCompactClass = cn(
  "flex-none overflow-y-auto overscroll-contain px-5 py-4",
  rootsFormEarthBgSubtleClass,
)

/** Área centrada para spinner de carga en modales. */
export const rootsDialogLoadingBodyClass =
  "flex min-h-[12rem] flex-col items-center justify-center py-8"

/** Campo solo lectura en modales de detalle — label form + valor en shell blanco. */
export const rootsDialogDetailFieldStackClass = rootsFormFieldStackClass

export const rootsDialogDetailLabelClass = rootsFormFieldLabelClass

export const rootsDialogDetailValueClass = cn(
  "flex min-h-11 w-full min-w-0 items-center rounded-lg border bg-white px-3 text-sm shadow-xs",
  rootsFormEarthBorderClass,
  rootsFormEarthTextClass,
)

export const rootsDialogDetailValueMultilineClass = cn(
  "w-full min-w-0 rounded-lg border bg-white px-3 py-2.5 text-sm leading-relaxed shadow-xs",
  rootsFormEarthBorderClass,
  rootsFormEarthTextClass,
)

export const rootsDialogDetailMetaClass = cn(
  "text-xs leading-snug",
  rootsFormEarthTextSecondaryClass,
)
