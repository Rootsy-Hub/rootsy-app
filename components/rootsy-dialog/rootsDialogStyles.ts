import {
  rootsDialogBodyClass,
  rootsDialogBodyCompactClass,
  rootsDialogLoadingBodyClass,
} from "@/components/rootsy-dialog/rootsDialogProductStyles"
import {
  rootsFormFieldLabelClass,
  rootsFormFieldStackClass,
} from "@/components/rootsy-form/rootsFormStyles"
import { cn } from "@/lib/utils"

export {
  rootsDialogBodyClass,
  rootsDialogBodyCompactClass,
  rootsDialogLoadingBodyClass,
} from "@/components/rootsy-dialog/rootsDialogProductStyles"

/** Campo solo lectura en modales de detalle — label form + valor en shell blanco. */
export const rootsDialogDetailFieldStackClass = rootsFormFieldStackClass

export const rootsDialogDetailLabelClass = rootsFormFieldLabelClass

export const rootsDialogDetailValueClass = cn(
  "flex min-h-11 w-full min-w-0 items-center rounded-lg border border-[var(--rootsy-bruma-200)] bg-white px-3 text-sm text-[var(--rootsy-bruma-900)] shadow-xs",
)

export const rootsDialogDetailValueMultilineClass = cn(
  "w-full min-w-0 rounded-lg border border-[var(--rootsy-bruma-200)] bg-white px-3 py-2.5 text-sm leading-relaxed text-[var(--rootsy-bruma-900)] shadow-xs",
)

export const rootsDialogDetailMetaClass =
  "text-xs leading-snug text-[var(--rootsy-bruma-500)]"
