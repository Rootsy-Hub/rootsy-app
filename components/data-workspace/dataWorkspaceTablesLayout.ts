import {
  lightToolbarPanelClass,
  lightToolbarPanelLastClass,
  lightToolbarShellClass,
  workspaceTableLayoutClassName,
  workspaceTableLayoutMetaLabelClass,
  workspaceTableNatureTextSecondaryClass,
  workspaceTableNatureTextTertiaryClass,
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

/** Cristal en header sticky — blur del contenido al scrollear. */
export const workspaceTableLayoutStickyHeaderGlassClass =
  "backdrop-blur-md backdrop-saturate-150 bg-[var(--wt-header-bg-glass)]"

/** Encabezado layout — cristal bruma sobre contenido scrolleable. */
export const workspaceTableLayoutHeaderHeadClass = cn(
  workspaceTableLayoutMetaLabelClass,
  workspaceTableLayoutHeaderHeightClass,
  workspaceTableLayoutStickyHeaderGlassClass,
  "sticky top-0 z-20 !py-0 px-3 align-middle",
  "!border-b border-[var(--wt-border)] !shadow-none",
  "text-[var(--wt-header-text)]",
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

/** Scope layout — h-10 header · h-14 filas · header sticky en contenedor scroll. */
export const workspaceTableLayoutListBodyScopeClass = cn(
  "[&_[data-slot=table-container]]:!overflow-visible",
  "[&_[data-slot=table-head]]:!sticky [&_[data-slot=table-head]]:!top-0 [&_[data-slot=table-head]]:!z-30",
  "[&_[data-slot=table-header]_[data-slot=table-row]]:!border-b-0",
  "[&_[data-slot=table-head]]:!h-10 [&_[data-slot=table-head]]:!max-h-10 [&_[data-slot=table-head]]:box-border [&_[data-slot=table-head]]:!py-0",
  "[&_[data-slot=table-head]]:!border-b [&_[data-slot=table-head]]:!border-[var(--wt-border)] [&_[data-slot=table-head]]:!shadow-none",
  "[&_[data-slot=table-head]]:!backdrop-blur-md [&_[data-slot=table-head]]:!backdrop-saturate-150 [&_[data-slot=table-head]]:!bg-[var(--wt-header-bg-glass)] [&_[data-slot=table-head]]:!text-[var(--wt-header-text)]",
  "[&_[data-slot=table-head]>div]:!h-full [&_[data-slot=table-head]>div]:!min-h-0",
  "[&_[data-slot=table-body]_[data-slot=table-row]]:!h-14 [&_[data-slot=table-body]_[data-slot=table-row]]:!max-h-14",
  "[&_[data-slot=table-body]_[data-slot=table-cell]]:!h-14 [&_[data-slot=table-body]_[data-slot=table-cell]]:!max-h-14 [&_[data-slot=table-body]_[data-slot=table-cell]]:box-border [&_[data-slot=table-body]_[data-slot=table-cell]]:!py-0",
  "[&_[data-slot=table-body]_[data-slot=table-cell]:has([role=checkbox])]:!py-0",
  "[&_[data-slot=table-body]_[role=checkbox]]:pointer-events-auto [&_[data-slot=table-head]_[role=checkbox]]:pointer-events-auto",
  "[&_[data-slot=table-row][data-state=selected]]:!bg-[var(--wt-surface-selected)]",
)

/** Contenedor scroll de tablas en reportes. */
export const workspaceTableLayoutReportScrollClass =
  "min-h-0 flex-1 overflow-auto"

/** Borde inferior en header sticky al scrollear (pseudo-elemento sobre celdas sticky). */
export const workspaceTableLayoutReportScrollScrolledScopeClass = cn(
  "[&[data-table-scrolled=true]_[data-slot=table-head]]:relative",
  "[&[data-table-scrolled=true]_[data-slot=table-head]]:after:pointer-events-none",
  "[&[data-table-scrolled=true]_[data-slot=table-head]]:after:absolute",
  "[&[data-table-scrolled=true]_[data-slot=table-head]]:after:inset-x-0",
  "[&[data-table-scrolled=true]_[data-slot=table-head]]:after:bottom-0",
  "[&[data-table-scrolled=true]_[data-slot=table-head]]:after:z-[1]",
  "[&[data-table-scrolled=true]_[data-slot=table-head]]:after:h-px",
  "[&[data-table-scrolled=true]_[data-slot=table-head]]:after:bg-[var(--wt-border-strong)]",
  "[&[data-table-scrolled=true]_[data-slot=table-head]]:after:content-['']",
)

/** Wrapper tabla desktop en reportes — scroll lo maneja el padre (sticky header). */
export const workspaceTableLayoutReportTableDesktopClass = "hidden md:block"

/** Operaciones — header compacto layout; filas flexibles (celdas multilínea). */
export const workspaceTableOperationsListHeaderScopeClass = cn(
  "[&_[data-slot=table-container]]:!overflow-visible",
  "[&_[data-slot=table-head]]:!sticky [&_[data-slot=table-head]]:!top-0 [&_[data-slot=table-head]]:!z-30",
  "[&_[data-slot=table-header]_[data-slot=table-row]]:!border-b-0",
  "[&_[data-slot=table-head]]:!h-10 [&_[data-slot=table-head]]:!max-h-10 [&_[data-slot=table-head]]:box-border [&_[data-slot=table-head]]:!py-0",
  "[&_[data-slot=table-head]]:!border-b [&_[data-slot=table-head]]:!border-[var(--wt-border)] [&_[data-slot=table-head]]:!shadow-none",
  "[&_[data-slot=table-head]]:!backdrop-blur-md [&_[data-slot=table-head]]:!backdrop-saturate-150 [&_[data-slot=table-head]]:!bg-[var(--wt-header-bg-glass)] [&_[data-slot=table-head]]:!text-[var(--wt-header-text)]",
  "[&_[data-slot=table-head]>div]:!h-full [&_[data-slot=table-head]>div]:!min-h-0",
)

export const workspaceTableLayoutImageColumnClass = "w-14"

/** Miniatura fila — space.500 · radius.medium · bruma-300. */
export const workspaceTableLayoutThumbnailSmClass = "size-10"
export const workspaceTableLayoutThumbnailLgClass = "size-20"

export const workspaceTableLayoutThumbnailClass = cn(
  "relative shrink-0 overflow-hidden rounded-lg border border-[var(--rootsy-bruma-300)] bg-[var(--rootsy-white)]",
)

export const workspaceTableLayoutThumbnailPlaceholderClass = cn(
  workspaceTableLayoutThumbnailClass,
  "flex items-center justify-center bg-[var(--rootsy-bruma-50)] text-[var(--rootsy-bruma-500)]",
)

export const workspaceTableLayoutThumbnailInteractiveClass =
  "rounded-lg outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--rootsy-savia-400)_45%,transparent)]"

export const workspaceTableLayoutCellStackClass =
  "flex h-full min-h-0 min-w-0 flex-col justify-center gap-0 overflow-hidden"

/** Máximo 2 líneas visibles — título + subtítulo. */
export const workspaceTableLayoutCellPrimaryTextClass =
  "truncate text-sm font-medium leading-4"

export const workspaceTableLayoutCellSecondaryTextClass =
  "truncate text-xs leading-4"

/** Superficie listado layout — canvas bruma. */
export const workspaceTableLayoutListSurfaceClass = "bg-[var(--rootsy-bruma-50)]"

/** Footer scroll infinito — estado cargando. */
export const workspaceTableLayoutListLoadingMoreClass = cn(
  "flex items-center justify-center gap-2 border-t border-[var(--wt-border)] px-4 py-3 text-sm",
  workspaceTableNatureTextSecondaryClass,
)

/** Footer scroll infinito — fin del listado. */
export const workspaceTableLayoutListEndFooterClass = cn(
  "flex items-center gap-3 px-4 py-6 text-sm",
  workspaceTableNatureTextTertiaryClass,
)

export const workspaceTableLayoutListEndFooterDividerClass =
  "h-px flex-1 bg-[var(--wt-border)]"

/** Encabezado layout en tablas inset (modal) — sin sticky; el borde va en thead. */
export const workspaceTableLayoutInsetHeaderHeadClass = cn(
  workspaceTableLayoutMetaLabelClass,
  workspaceTableLayoutHeaderHeightClass,
  workspaceTableLayoutStickyHeaderGlassClass,
  "static top-auto z-auto !py-0 px-3 align-middle",
  "!border-b-0 !shadow-none",
  "text-[var(--wt-header-text)]",
)

/** Tabla inset en modal/panel — borde exterior + clip; sin fondo en shell (evita artefactos). */
export const workspaceTableLayoutInsetTableShellClass = cn(
  "relative isolate overflow-hidden rounded-lg border border-[var(--wt-border)] bg-transparent",
  "[&_[data-slot=table-head]]:!static [&_[data-slot=table-head]]:!top-auto",
  "[&_[data-slot=table-header]_[data-slot=table-row]]:!border-b-0",
  "[&_[data-slot=table-head]]:!border-b-0",
  "[&_[data-slot=table-header]]:border-b [&_[data-slot=table-header]]:border-[var(--wt-border)]",
  "[&_[data-slot=table-head]:first-child]:rounded-tl-lg",
  "[&_[data-slot=table-head]:last-child]:rounded-tr-lg",
  "[&_table]:bg-transparent",
  "[&_[data-slot=table-body]_[data-slot=table-row]]:!border-b",
  "[&_[data-slot=table-body]_[data-slot=table-row]]:!border-[var(--wt-border)]",
  "[&_[data-slot=table-body]_[data-slot=table-row]:last-child]:!border-b-0",
)

export const workspaceTableLayoutInsetTableClass = cn(
  workspaceTableLayoutClassName,
  "border-separate border-spacing-0",
)

/** Barra de filtros — h-23 · toolbar elevation.overlay. */
export const dataWorkspaceListFiltersBarClass = cn(
  "shrink-0 bg-white",
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
