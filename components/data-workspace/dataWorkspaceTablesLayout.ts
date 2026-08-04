import {
  lightToolbarPanelClass,
  lightToolbarPanelLastClass,
  lightToolbarShellClass,
  workspaceTableLayoutMetaLabelClass,
  workspaceTableNatureScopeClass,
  workspaceTableNatureSurfaceClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import { cn } from "@/lib/utils"

/** Variante tierra orgánica — tablas de layout workspace. */
export const workspaceTableNatureEarthOrganicClass =
  "workspace-table-nature--earth-organic"

export const workspaceTableNatureEarthOrganicScopeClass = cn(
  workspaceTableNatureScopeClass,
  workspaceTableNatureEarthOrganicClass,
  workspaceTableNatureSurfaceClass,
)

/** Alturas alineadas al wireframe layout tablas (h-11 filas y header · fondo blanco). */
export const workspaceTableLayoutHeaderHeadClass = cn(
  workspaceTableLayoutMetaLabelClass,
  "!h-11 py-0 !bg-white supports-[backdrop-filter]:!bg-white",
)

export const workspaceTableLayoutBodyRowClass =
  "!h-11 !max-h-11 overflow-hidden"

export const workspaceTableLayoutBodyCellClass =
  "px-3 py-0 align-middle overflow-hidden"

/** Scope layout — anula py-2.5 del listado y fuerza filas h-11. */
export const workspaceTableLayoutListBodyScopeClass = cn(
  "[&_[data-slot=table-body]_[data-slot=table-row]]:!h-11 [&_[data-slot=table-body]_[data-slot=table-row]]:!max-h-11",
  "[&_[data-slot=table-body]_[data-slot=table-cell]]:!py-0",
  "[&_[data-slot=table-body]_[data-slot=table-cell]:has([role=checkbox])]:!py-0",
)

export const workspaceTableLayoutImageColumnClass = "w-14"

export const workspaceTableLayoutCellStackClass =
  "flex min-h-0 min-w-0 flex-col justify-center gap-0 overflow-hidden"

/** Máximo 2 líneas visibles — título + subtítulo. */
export const workspaceTableLayoutCellPrimaryTextClass =
  "truncate text-sm font-medium leading-4"

export const workspaceTableLayoutCellSecondaryTextClass =
  "truncate text-xs leading-4"

/** Barra de filtros — h-23 · tres columnas iguales · labels visibles. */
export const dataWorkspaceListFiltersBarClass =
  "shrink-0 border-b border-border/80 bg-white"

export const dataWorkspaceListFiltersBarInnerClass = "h-23"

export const dataWorkspaceListFiltersGridClass =
  "grid h-full grid-cols-1 md:grid-cols-3"

export const dataWorkspaceListFiltersPanelClass =
  "flex h-full min-w-0 items-center border-r border-border/80 px-3"

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
