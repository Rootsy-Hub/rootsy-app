import { rootsFormFieldHintClass } from "@/components/rootsy-form/rootsFormStyles"
import { cn } from "@/lib/utils"

/** Separador horizontal entre bloques del formulario. */
export const serviceDialogSectionDividerClass =
  "h-px w-full shrink-0 bg-[var(--rootsy-bruma-200)]"

/** Título de sección dentro del modal. */
export const serviceDialogSectionTitleClass =
  "font-canopy text-sm font-semibold text-[var(--rootsy-bruma-900)]"

/** Texto de ayuda bajo títulos de sección. */
export const serviceDialogSectionHintClass = cn(
  "mt-1 text-xs leading-relaxed",
  rootsFormFieldHintClass,
)

/** Panel blanco sobre body sunken del modal. */
export const serviceDialogPanelClass = cn(
  "rounded-xl border border-[var(--rootsy-bruma-200)] bg-white p-4",
)

/** Fila editable dentro de un panel (detalle / cláusula). */
export const serviceDialogRowPanelClass = cn(
  "rounded-lg border border-[var(--rootsy-bruma-200)] bg-white p-3",
)

/** Lista scrollable de categorías. */
export const serviceDialogListShellClass = cn(
  "divide-y divide-[var(--rootsy-bruma-200)] overflow-hidden rounded-xl",
  "border border-[var(--rootsy-bruma-200)] bg-white",
)

/** Empty state dentro de listas del modal. */
export const serviceDialogEmptyHintClass = cn(
  "p-4 text-sm",
  rootsFormFieldHintClass,
)

/** Nombre de ítem en listas inline. */
export const serviceDialogListItemTitleClass =
  "truncate font-medium text-[var(--rootsy-bruma-900)]"

/** Botón/link para agregar filas dinámicas. */
export const serviceDialogAddActionClass = cn(
  "inline-flex items-center gap-1.5 rounded-lg px-2 py-1",
  "text-sm font-medium text-[var(--rootsy-savia-700)] transition-colors",
  "hover:bg-[color-mix(in_srgb,var(--rootsy-savia-500)_12%,transparent)]",
  "disabled:opacity-50",
)
