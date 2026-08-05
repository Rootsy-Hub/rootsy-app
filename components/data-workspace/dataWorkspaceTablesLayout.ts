import {
  lightToolbarPanelClass,
  lightToolbarPanelLastClass,
  lightToolbarShellClass,
  workspaceTableLayoutMetaLabelClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import {
  workspaceLayoutsTablesScopeClass,
} from "@/components/layouts-tables/rootsLayoutsTablesProductStyles"
import { cn } from "@/lib/utils"

/** @deprecated Alias — usar workspaceLayoutsTablesScopeClass */
export const workspaceTableNatureEarthOrganicClass = workspaceLayoutsTablesScopeClass

/** Scope tokens layout tablas sin fondo opaco (p. ej. pie cristal POP). */
export const workspaceTableNatureEarthOrganicTokensClass =
  workspaceLayoutsTablesScopeClass

export const workspaceTableNatureEarthOrganicScopeClass = cn(
  workspaceLayoutsTablesScopeClass,
  "bg-[var(--wt-surface)]",
)

/** Altura fija filas body (h-14 total, padding horizontal px-3). */
export const workspaceTableLayoutRowHeightClass =
  "!h-14 !max-h-14 box-border"

/** Altura header layout — h-10 (space.500). */
export const workspaceTableLayoutHeaderHeightClass =
  "!h-10 !max-h-10 box-border"

/** Encabezado layout — bruma sunken, sin blur. */
export const workspaceTableLayoutHeaderHeadClass = cn(
  workspaceTableLayoutMetaLabelClass,
  workspaceTableLayoutHeaderHeightClass,
  "sticky top-0 z-20 !py-0 px-3 align-middle",
  "!border-b border-[var(--wt-border)] !shadow-none",
  "bg-[var(--wt-header-bg)] text-[var(--wt-header-text)]",
)

export const workspaceTableLayoutBodyRowClass = cn(
  workspaceTableLayoutRowHeightClass,
  "overflow-hidden",
)

export const workspaceTableLayoutBodyCellClass = cn(
  workspaceTableLayoutRowHeightClass,
  "px-3 !py-0 align-middle overflow-hidden",
)

/** Columna checkbox — misma altura que el resto de celdas layout. */
export const workspaceTableLayoutSelectBodyCellClass = cn(
  workspaceTableLayoutRowHeightClass,
  "w-12 !px-0 !py-0 align-middle",
)

/** Columna acciones — misma altura, padding mínimo horizontal. */
export const workspaceTableLayoutActionsBodyCellClass = cn(
  workspaceTableLayoutRowHeightClass,
  "px-1 !py-0 align-middle",
)

/** Scope layout — h-10 header · h-14 filas. */
export const workspaceTableLayoutListBodyScopeClass = cn(
  "[&_[data-slot=table-header]_[data-slot=table-row]]:!border-b-0",
  "[&_[data-slot=table-head]]:!h-10 [&_[data-slot=table-head]]:!max-h-10 [&_[data-slot=table-head]]:box-border [&_[data-slot=table-head]]:!py-0",
  "[&_[data-slot=table-head]]:!border-b [&_[data-slot=table-head]]:!border-[var(--wt-border)] [&_[data-slot=table-head]]:!shadow-none",
  "[&_[data-slot=table-head]]:!bg-[var(--wt-header-bg)] [&_[data-slot=table-head]]:!text-[var(--wt-header-text)]",
  "[&_[data-slot=table-head]>div]:!h-full [&_[data-slot=table-head]>div]:!min-h-0",
  "[&_[data-slot=table-body]_[data-slot=table-row]]:!h-14 [&_[data-slot=table-body]_[data-slot=table-row]]:!max-h-14",
  "[&_[data-slot=table-body]_[data-slot=table-cell]]:!h-14 [&_[data-slot=table-body]_[data-slot=table-cell]]:!max-h-14 [&_[data-slot=table-body]_[data-slot=table-cell]]:box-border [&_[data-slot=table-body]_[data-slot=table-cell]]:!py-0",
  "[&_[data-slot=table-body]_[data-slot=table-cell]:has([role=checkbox])]:!py-0",
)

/** Operaciones — header compacto layout; filas flexibles (celdas multilínea). */
export const workspaceTableOperationsListHeaderScopeClass = cn(
  "[&_[data-slot=table-header]_[data-slot=table-row]]:!border-b-0",
  "[&_[data-slot=table-head]]:!h-10 [&_[data-slot=table-head]]:!max-h-10 [&_[data-slot=table-head]]:box-border [&_[data-slot=table-head]]:!py-0",
  "[&_[data-slot=table-head]]:!border-b [&_[data-slot=table-head]]:!border-[var(--wt-border)] [&_[data-slot=table-head]]:!shadow-none",
  "[&_[data-slot=table-head]]:!bg-[var(--wt-header-bg)] [&_[data-slot=table-head]]:!text-[var(--wt-header-text)]",
  "[&_[data-slot=table-head]>div]:!h-full [&_[data-slot=table-head]>div]:!min-h-0",
)

export const workspaceTableLayoutImageColumnClass = "w-14"

export const workspaceTableLayoutCellStackClass =
  "flex h-full min-h-0 min-w-0 flex-col justify-center gap-0 overflow-hidden"

/** Máximo 2 líneas visibles — título + subtítulo. */
export const workspaceTableLayoutCellPrimaryTextClass =
  "truncate text-sm font-medium leading-4"

export const workspaceTableLayoutCellSecondaryTextClass =
  "truncate text-xs leading-4"

/** Superficie listado layout — canvas bruma. */
export const workspaceTableLayoutListSurfaceClass = "bg-[var(--rootsy-bruma-50)]"

/** Barra de filtros — h-23 · toolbar elevation.overlay. */
export const dataWorkspaceListFiltersBarClass = cn(
  "shrink-0 border-b border-[var(--rootsy-bruma-200)] bg-white",
)

/** Fila principal de filtros (PERÍODO / FILTROS / BUSCAR). */
export const dataWorkspaceListFiltersBarRowClass =
  "border-b border-[var(--rootsy-bruma-200)]"

export const dataWorkspaceListFiltersBarInnerClass = "h-23"

export const dataWorkspaceListFiltersGridClass =
  "grid h-full grid-cols-1 md:grid-cols-3"

export const dataWorkspaceListFiltersPanelClass =
  "flex h-full min-w-0 items-center border-r border-[var(--rootsy-bruma-200)] px-3"

export const dataWorkspaceListFiltersPanelLastClass = cn(
  dataWorkspaceListFiltersPanelClass,
  "border-r-0",
)

export function dataWorkspaceListFiltersFieldClass(hideLabels = false) {
  return cn(
    "w-full min-w-0",
    hideLabels ? "gap-0 [&>label]:sr-only" : "gap-1.5",
  )
}

/** Demo aislada en librería (tarjeta con borde). */
export const dataWorkspaceListFiltersDemoShellClass = cn(
  lightToolbarShellClass,
  "overflow-hidden rounded-xl border border-border/70",
)

/** Paneles sueltos en librería (no flush). */
export {
  lightToolbarPanelClass,
  lightToolbarPanelLastClass,
}
