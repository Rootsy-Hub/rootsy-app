/**
 * Estilos producto — layout · tablas (bruma · savia · sombra).
 * Espejo Tailwind de rootsyLayoutsTablesSystem + layoutsTablesHardcodedSpec.
 */

import "@/components/data-workspace/dataWorkspaceTablesAtmosphere.css"
import { cn } from "@/lib/utils"

/** Chrome sombra — header y footer (gradiente 950→800). */
export const layoutsTablesChromeSurfaceClass = cn(
  "border-[var(--rootsy-sombra-border)]",
  "bg-[linear-gradient(180deg,var(--rootsy-sombra-950)_0%,var(--rootsy-sombra-800)_100%)]",
)

export const layoutsTablesFooterSurfaceClass = cn(
  "border-t border-[var(--rootsy-bruma-300)]",
  "bg-[var(--rootsy-bruma-100)]",
)

export const layoutsTablesChromeDividerClass =
  "bg-[var(--rootsy-sombra-600)]"

export const layoutsTablesChromeMutedTextClass =
  "text-[var(--rootsy-sombra-400)]"

export const layoutsTablesChromeTitleTextClass = "text-white"

export const layoutsTablesChromePopRingClass =
  "ring-[color-mix(in_srgb,var(--rootsy-white)_12%,var(--rootsy-sombra-700))]"

/** IconButton POS ghost sobre chrome sombra — footer nav y header acciones. */
export const layoutsTablesChromeIconButtonClass = cn(
  "inline-flex shrink-0 items-center justify-center rounded-lg border outline-none transition-all",
  "size-10 border-transparent bg-transparent text-[color-mix(in_srgb,var(--rootsy-white)_72%,var(--rootsy-sombra-300)_28%)]",
  "hover:border-[color-mix(in_srgb,var(--rootsy-white)_10%,var(--rootsy-sombra-600))]",
  "hover:bg-[color-mix(in_srgb,var(--rootsy-sombra-700)_55%,transparent)]",
  "hover:text-white",
  "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[color-mix(in_srgb,var(--rootsy-white)_14%,var(--rootsy-savia-400)_6%)]",
  "disabled:pointer-events-none disabled:opacity-40",
  "[&_svg]:size-4",
)

export const layoutsTablesFooterGridClass =
  "grid h-full w-full grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 sm:px-5"

export const layoutsTablesFooterCountTextClass = cn(
  "font-canopy text-sm text-[var(--rootsy-bruma-700)]",
)

export const layoutsTablesFooterCountStrongClass =
  "font-semibold text-[var(--rootsy-bruma-900)]"

export const layoutsTablesFooterNavClusterClass =
  "flex items-center gap-2"

export const layoutsTablesFooterPageLabelClass =
  "px-1.5 font-canopy text-sm font-semibold tabular-nums text-[var(--rootsy-bruma-900)]"

export const layoutsTablesFooterPageSizeClusterClass =
  "flex items-center justify-end gap-2"

export const layoutsTablesFooterSelectTriggerClass = cn(
  "!h-10 !min-h-10 !w-[4.5rem] min-w-[4.5rem] max-w-[4.5rem] justify-between gap-1 px-2 text-xs font-medium",
)

export const layoutsTablesFooterSelectItemClass = "py-1.5 text-xs"

/** Scope raíz del listado — activa tokens --wt-* (ver rootsLayoutsTablesScope.css). */
export const workspaceLayoutsTablesScopeClass = "workspace-layouts-tables"

export const workspaceLayoutsTablesShellClass = cn(
  "data-workspace-tables-atmosphere rootsy-app-light flex min-h-0 flex-1 flex-col overflow-x-hidden",
  workspaceLayoutsTablesScopeClass,
)
