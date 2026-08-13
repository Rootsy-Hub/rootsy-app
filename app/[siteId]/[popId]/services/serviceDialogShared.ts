import {
  rootsFormUiFieldHintClass,
  rootsFormUiItemDividerClass,
  rootsFormUiSectionDividerClass,
} from "@/components/rootsy-form/rootsFormUiStyles"
import { cn } from "@/lib/utils"

/** Separador horizontal entre bloques del formulario. */
export const serviceDialogSectionDividerClass = rootsFormUiSectionDividerClass

/** Separador entre filas repetibles (artículos, adicionales). */
export const serviceDialogItemDividerClass = rootsFormUiItemDividerClass

/** Listado repetible con separadores uniformes (divide + borde inferior). */
export const serviceDialogRepeatableListClass = cn(
  "flex w-full min-w-0 flex-col border-b border-[var(--rootsy-bruma-200)] divide-y divide-[var(--rootsy-bruma-200)]",
)

/** Padding vertical de cada ítem dentro del listado repetible. */
export const serviceDialogRepeatableListItemClass = "pt-2.5 pb-3.5"

/** Título de sección dentro del modal. */
export const serviceDialogSectionTitleClass =
  "font-canopy text-sm font-semibold text-[var(--rootsy-bruma-900)]"

/** Texto de ayuda bajo títulos de sección. */
export const serviceDialogSectionHintClass = cn(
  "mt-1 text-xs leading-relaxed",
  rootsFormUiFieldHintClass,
)

/** Panel blanco sobre body sunken del modal. */
export const serviceDialogPanelClass = cn(
  "rounded-xl border border-[var(--rootsy-bruma-200)] bg-[var(--rootsy-white)] p-4",
)

/** Fila editable dentro de un panel (detalle / cláusula). */
export const serviceDialogRowPanelClass = cn(
  "rounded-lg border border-[var(--rootsy-bruma-200)] bg-[var(--rootsy-white)] p-3",
)

/** Lista scrollable de categorías. */
export const serviceDialogListShellClass = cn(
  "divide-y divide-[var(--rootsy-bruma-200)] overflow-hidden rounded-xl",
  "border border-[var(--rootsy-bruma-200)] bg-[var(--rootsy-white)]",
)

/** Empty state dentro de listas del modal. */
export const serviceDialogEmptyHintClass = cn("p-4 text-sm", rootsFormUiFieldHintClass)

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
