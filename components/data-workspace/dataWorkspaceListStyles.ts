/** Tokens compartidos entre listados tipo “workspace” (layout preview, clientes, etc.). */

import {
  rootsyElevationPopoverContentLightClass,
  rootsyElevationPopoverMenuItemRadiusClass,
} from "@/components/elevation/rootsyElevationStyles"
import {
  nightForestBorderClass,
  nightForestFocusRingClass,
  nightForestMutedTextClass,
  nightForestPanelClass,
  nightForestPanelHoverClass,
  nightForestSurfaceClass,
} from "@/components/layouts/dataWorkspaceHeaderStyles"
import {
  rootsFormFieldLabelClass,
  rootsFormFieldLabelTypographyClass,
  rootsFormSelectDarkContentClass,
  rootsFormSelectDarkItemClass,
  rootsFormSelectDarkTriggerClass,
} from "@/components/rootsy-form/rootsFormStyles"
import {
  rootsButtonCompactSizeClass,
  rootsIconButtonClass,
} from "@/components/rootsy-button/rootsButtonStyles"
import { cn } from "@/lib/utils"

/** Superficie blanca — shell y zonas internas de tarjetas bloques. */
export const dataWorkspaceBlocksCardSurfaceClass = "bg-white"

export const dataWorkspaceShellCard =
  "rounded-2xl border border-border/80 bg-white shadow-sm"

/** Tarjeta workspace pegada al borde inferior del main (sin redondeo ni borde abajo). */
export const dataWorkspaceFlushBottomShellCard = cn(
  dataWorkspaceShellCard,
  "rounded-b-none border-b-0",
)

/** Panel flush — columna chrome + cuerpo pegado al piso. */
export const dataWorkspaceFlushBottomPanelClass = "flex min-h-0 flex-1 flex-col"

/** Chrome superior — radio y borde arriba/laterales; separa toolbar y KPIs del listado. */
export const dataWorkspaceFlushBottomPanelChromeClass = cn(
  dataWorkspaceBlocksCardSurfaceClass,
  "shrink-0 overflow-hidden rounded-t-2xl border border-b-0 border-border/60 shadow-sm",
)

/** Cuerpo inferior — sin borde inferior; laterales opcionales vía hermano chrome. */
export const dataWorkspaceFlushBottomPanelBodyClass = cn(
  dataWorkspaceBlocksCardSurfaceClass,
  "flex min-h-0 flex-1 flex-col border-x border-border/60",
)

/** Grid de tarjetas (cuentas, cajas): columnas automáticas con ancho mínimo legible. */
export const dataWorkspaceEntityCardsGridClass =
  "grid w-full gap-4 grid-cols-[repeat(auto-fill,minmax(min(100%,18rem),1fr))]"

/** Superficie del listado flush (tablas layout workspace). */
export const workspaceTableSurfaceClass =
  "bg-white dark:bg-white"

/** Scope raíz — tokens --wt-* (ver rootsyNaturePalette.css). */
export const workspaceTableNatureScopeClass = "workspace-table-nature"

/** Cuerpo tierra orgánica — pantallas bloques (cuentas, cajas). Requiere `.rootsy-nature-palette`. */
export const dataWorkspaceBlocksContentScopeClass = cn(
  workspaceTableNatureScopeClass,
  "workspace-table-nature--earth-organic",
  "bg-[var(--wt-surface)]",
)

/** Padding estándar del área de grid bloques. */
export const dataWorkspaceBlocksContentInnerClass =
  "relative flex w-full flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8"

/** `<main>` flush de pantallas bloques — puente shadcn + paleta Nature. */
export const dataWorkspaceBlocksPageMainClass = cn(
  "rootsy-app-light rootsy-nature-palette min-h-0 overflow-y-auto bg-background",
)

/** Contenedor tierra orgánica — debe ser hijo del main con `.rootsy-nature-palette`. */
export const dataWorkspaceBlocksPageContentClass = cn(
  dataWorkspaceBlocksContentScopeClass,
  dataWorkspaceBlocksContentInnerClass,
  "min-h-full flex-1",
)

/**
 * Tarjeta interactiva de entidad — elevation.card.interactive + radius.card.library (rounded-2xl).
 * Sombra base con tinte canopy; hover eleva a shadow-md.
 */
export const dataWorkspaceEntityCardClass = cn(
  "group relative flex h-full flex-col overflow-hidden rounded-2xl",
  "border border-border/60 shadow-sm transition-[border-color,box-shadow] duration-200",
  dataWorkspaceBlocksCardSurfaceClass,
  "hover:border-border hover:shadow-md",
)

export const dataWorkspaceEntityCardHeaderClass =
  "border-b border-border/60 px-4 py-4 pr-11"

/** Zona interna de tarjeta — misma superficie blanca que el shell. */
export const dataWorkspaceEntityCardBodySunkenClass =
  dataWorkspaceBlocksCardSurfaceClass

export const dataWorkspaceEntityCardBodyClass = cn(
  "flex min-h-0 flex-1 flex-col px-4 py-4",
  dataWorkspaceEntityCardBodySunkenClass,
)

export const dataWorkspaceEntityCardFooterClass = cn(
  "border-t border-border/40",
  dataWorkspaceEntityCardBodySunkenClass,
)

export const dataWorkspaceEntityCardIsotypeClass =
  "flex size-11 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-white text-muted-foreground shadow-xs"

/** Shell skeleton — misma superficie que la tarjeta final, sin hover. */
export const dataWorkspaceEntityCardSkeletonShellClass = cn(
  "relative flex h-full flex-col overflow-hidden rounded-2xl",
  "border border-border/60 shadow-sm",
  dataWorkspaceBlocksCardSurfaceClass,
)

export const dataWorkspaceBlocksEmptyStateClass =
  "rounded-xl border border-dashed border-[var(--wt-border-strong)] bg-white px-4 py-10 text-center text-sm text-[var(--wt-text-secondary)]"

/** Scope tierra sin padding — vistas detalle con layout propio. Hijo de `dataWorkspaceBlocksPageMainClass`. */
export const dataWorkspaceBlocksPageScopeClass = cn(
  dataWorkspaceBlocksContentScopeClass,
  "min-h-full flex-1",
)

/** Tarjeta / panel de detalle — misma elevación y radio que bloques, sin hover. */
export const dataWorkspaceDetailCardClass = cn(
  "overflow-hidden rounded-2xl border border-border/60 shadow-sm",
  dataWorkspaceBlocksCardSurfaceClass,
)

export const dataWorkspaceDetailCardHeaderClass =
  "border-b border-border/60 px-4 py-4 sm:px-6 lg:px-8"

export const dataWorkspaceDetailCardStatsClass = cn(
  "grid gap-4 px-4 py-4 sm:grid-cols-2 sm:px-6 lg:flex lg:flex-wrap lg:items-end lg:gap-x-10 lg:gap-y-3 lg:px-8",
  dataWorkspaceEntityCardBodySunkenClass,
)

/** Toolbar de filtros / tabs en paneles de detalle. */
export const dataWorkspaceDetailToolbarClass = cn(
  "flex flex-col gap-3 border-b border-border/60 px-4 py-3 lg:flex-row lg:items-center lg:justify-between lg:px-5",
  dataWorkspaceEntityCardBodySunkenClass,
)

/** Franja KPI dentro de paneles (3 columnas). */
export const dataWorkspaceDetailKpiStripClass = cn(
  "grid divide-y divide-border/60 border-b border-border/60 sm:grid-cols-3 sm:divide-x sm:divide-y-0",
  dataWorkspaceBlocksCardSurfaceClass,
)

/** Franja KPI (2 columnas — saldos de período). */
export const dataWorkspaceDetailKpiStripTwoColClass = cn(
  "grid divide-y divide-border/60 border-b border-border/60 sm:grid-cols-2 sm:divide-x sm:divide-y-0",
  dataWorkspaceBlocksCardSurfaceClass,
)

export const dataWorkspaceDetailPanelClass = cn(
  dataWorkspaceDetailCardClass,
  "overflow-hidden",
)

export const dataWorkspaceDetailSectionClass =
  "border-t border-[color:var(--wt-border)] px-4 py-4 lg:px-5"

export const dataWorkspaceDetailBodyClass = "px-4 py-4 lg:px-5"

export type WorkspaceTableTone = "default" | "nature" | "earth"

export const workspaceTableNatureSurfaceClass = "bg-[var(--wt-surface)]"

/** Labels meta — header de tabla layout, toolbar y total del footer oscuro. */
export const workspaceTableLayoutMetaLabelClass = cn(
  rootsFormFieldLabelTypographyClass,
  "font-bold",
)

/** Encabezado — tierra con bruma canopy. */
export const workspaceTableNatureHeaderCellClass = cn(
  "sticky top-0 z-20 h-10 border-b px-2 py-2",
  workspaceTableLayoutMetaLabelClass,
  "border-[var(--wt-border-strong)] bg-[var(--wt-header-bg)] text-[var(--wt-header-text)]",
  "shadow-[0_1px_0_0_var(--wt-border-strong)] backdrop-blur-sm",
  "supports-[backdrop-filter]:bg-[color-mix(in_srgb,var(--wt-header-bg)_86%,transparent)]",
)

export const workspaceTableNatureBodyRowInactiveClass = "opacity-[0.78]"

export function workspaceTableNatureBodyRowClassNames(
  index: number,
  options?: {
    selected?: boolean
    noHover?: boolean
    inactive?: boolean
  },
): string {
  const isEven = index % 2 === 0
  const rowSurface = isEven
    ? "bg-[var(--wt-surface-stripe)]"
    : "bg-[var(--wt-surface)]"
  const rowSurfaceHover = isEven
    ? "hover:!bg-[var(--wt-surface-stripe)]"
    : "hover:!bg-[var(--wt-surface)]"

  return cn(
    "border-b border-[var(--wt-border)] transition-colors duration-150",
    rowSurface,
    options?.noHover
      ? rowSurfaceHover
      : "hover:bg-[var(--wt-surface-hover)]",
    options?.selected &&
      "bg-[var(--wt-surface-selected)] hover:bg-[var(--wt-surface-selected)] ring-1 ring-inset ring-[var(--wt-surface-selected-ring)]",
    options?.inactive && workspaceTableNatureBodyRowInactiveClass,
  )
}

export const workspaceTableNatureTextPrimaryClass =
  "text-[var(--wt-text-primary)]"

export const workspaceTableNatureTextSecondaryClass =
  "text-[var(--wt-text-secondary)]"

export const workspaceTableNatureTextTertiaryClass =
  "text-[var(--wt-text-tertiary)]"

export const workspaceTableNatureLinkClass =
  "font-medium text-[var(--wt-link)] underline-offset-2 hover:text-[var(--wt-link-hover)] hover:underline"

export const workspaceTableNatureMoneyClass = cn(
  "font-numeric text-[13px] tabular-nums tracking-tight text-[var(--wt-money)]",
)

export const workspaceTableNatureMoneyNegativeClass = cn(
  "font-numeric text-[13px] tabular-nums tracking-tight text-[var(--wt-money-negative)]",
)

/** Barra de acciones bulk — altura fija h-11 alineada al header layout. */
export const listBulkToolbarBarClass =
  "flex h-11 shrink-0 flex-wrap items-center gap-2 px-3 sm:px-4"

/** Contenedor único — filtros activos + selección antes de la tabla. */
export const listTableChromeStackClass =
  "shrink-0 overflow-hidden bg-white border-b border-[var(--wt-border)]"

/** Separador interno suave entre filas del stack (no `--wt-border-strong`). */
export const listTableChromeStackFollowRowClass =
  "border-t border-[var(--wt-border)]"

/** Superficie compartida — barras contexto h-11 (filtros activos · selección). */
export const listTableChromeBarSurfaceClass = cn(
  listBulkToolbarBarClass,
  "bg-white",
)

/** Fila dentro del stack — sin fondo propio ni borde inferior. */
export const listTableChromeBarStackedSurfaceClass = cn(
  listBulkToolbarBarClass,
  "bg-transparent",
)

/** Separador inferior solo en la última barra antes de la tabla. */
export const listTableChromeBarDividerClass =
  "border-b border-[var(--wt-border-strong)]"

export const workspaceTableNatureBulkBarClass = cn(
  listTableChromeBarSurfaceClass,
  listTableChromeBarDividerClass,
)

export const listBulkToolbarCountClass = cn(
  "text-sm",
  workspaceTableNatureTextPrimaryClass,
)

export const listBulkToolbarCountMutedClass =
  workspaceTableNatureTextSecondaryClass

/** Botones secundarios / danger en bulk toolbar — appearance librería + compact h-8. */
export const listBulkToolbarActionButtonClass = rootsButtonCompactSizeClass

export const workspaceTableNatureIconButtonClass = cn(
  "text-[var(--wt-text-tertiary)] hover:text-[var(--wt-text-primary)]",
)

export const workspaceTableNatureStatusBadgeClass: Record<
  "activo" | "pendiente" | "vencido",
  string
> = {
  activo:
    "border-[color:var(--nature-canopy-400)]/45 bg-[color:var(--nature-canopy-100)] text-[color:var(--nature-canopy-800)]",
  pendiente:
    "border-[color:var(--nature-autumn-400)]/50 bg-[color:var(--nature-autumn-100)] text-[color:var(--nature-autumn-800)]",
  vencido:
    "border-[color:var(--nature-ember-500)]/40 bg-[color:var(--nature-ember-600)]/10 text-[color:var(--nature-ember-700)]",
}

export const workspaceTableNatureSkeletonTone = {
  bar: "animate-pulse rounded-sm bg-[var(--wt-skeleton)]",
  barSm: "animate-pulse rounded-sm bg-[var(--wt-skeleton-soft)]",
  box: "animate-pulse rounded-sm bg-[var(--wt-skeleton)]",
  pill: "animate-pulse rounded-md bg-[var(--wt-skeleton)]",
} as const

/** Checkbox — borde corteza, marca canopy al marcar. */
export const workspaceTableNatureCheckboxClass = cn(
  "size-4 border shadow-none [&_[data-slot=checkbox-indicator]_svg]:size-3.5",
  "border-[var(--wt-border-strong)] bg-[var(--wt-surface)]",
  "data-[state=checked]:border-[color:var(--nature-canopy-600)] data-[state=checked]:bg-[color:var(--nature-canopy-600)] data-[state=checked]:text-white",
  "data-[state=indeterminate]:border-[color:var(--nature-canopy-600)]/50 data-[state=indeterminate]:bg-[color:var(--nature-canopy-100)] data-[state=indeterminate]:text-[color:var(--nature-canopy-700)]",
)

/** @deprecated Usar workspaceTableNatureCheckboxClass */
export const workspaceTableEarthCheckboxClass = workspaceTableNatureCheckboxClass

/** @deprecated Alias — usar workspaceTableNature* */
export const workspaceTableEarthSurfaceClass = cn(
  workspaceTableNatureScopeClass,
  workspaceTableNatureSurfaceClass,
)
/** @deprecated Alias */
export const workspaceTableEarthHeaderCellClass =
  workspaceTableNatureHeaderCellClass
/** @deprecated Alias */
export const workspaceTableEarthBodyRowClassNames =
  workspaceTableNatureBodyRowClassNames
/** @deprecated Alias */
export const workspaceTableEarthMutedTextClass =
  workspaceTableNatureTextSecondaryClass
/** @deprecated Alias */
export const tdMoneyEarthClass = workspaceTableNatureMoneyClass

/** @deprecated Ya no se usa; el brillo radial quedó desactivado en tablas flush. */
export const workspaceTableSurfaceGlowClass =
  "pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_85%_60%_at_100%_100%,oklch(0.72_0.11_155/0.08),transparent_60%),radial-gradient(ellipse_50%_42%_at_0%_0%,oklch(0.88_0.06_140/0.07),transparent_55%)]"

export const thBase = cn(
  "sticky top-0 z-20 h-10 border-b border-border bg-muted/90 px-2 py-2",
  workspaceTableLayoutMetaLabelClass,
  "text-foreground/70 shadow-[0_1px_0_0_hsl(var(--border))] backdrop-blur-sm supports-[backdrop-filter]:bg-muted/75 dark:border-border/55 dark:bg-background/90 dark:text-muted-foreground dark:shadow-[0_1px_0_0_rgba(255,255,255,0.06)] supports-[backdrop-filter]:dark:bg-background/82",
)

/** Encabezado sticky compartido (layout preview + listados workspace). */
export const workspaceTableHeaderCellClass = cn(
  thBase,
  "font-bold text-foreground",
)

/** Alias histórico — preferir `WorkspaceTableHead`. */
export const lightTableThClass = workspaceTableHeaderCellClass

/** Columna checkbox en header. */
export const workspaceTableSelectHeadClass = "w-12 !px-0 text-center"

export const toolbarBlockLabelClass = rootsFormFieldLabelClass

/** Toolbar flush (período, filtros, búsqueda). */
export const lightToolbarShellClass =
  "shrink-0 border-b border-border/80 bg-background"

export const lightToolbarPanelClass =
  "border-b border-r border-border/80 bg-background px-4 py-3.5 xl:border-b-0"

export const lightToolbarPanelLastClass =
  "border-b border-border/80 bg-background px-4 py-3.5 xl:border-b-0 xl:border-r-0"

export const lightToolbarFocusClass =
  "focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/20"

export const lightToolbarControlClass =
  "h-11 w-full max-w-full rounded-md border-border/60 bg-muted/25 text-sm text-foreground shadow-sm transition-[color,background-color,border-color,box-shadow] duration-150 hover:bg-muted/40"

export const lightToolbarControlActiveClass =
  "border-primary/35 bg-primary/10 text-foreground ring-1 ring-primary/15"

export const lightToolbarButtonClass = cn(
  lightToolbarControlClass,
  "gap-2 px-3 font-medium",
  lightToolbarFocusClass,
)

export const lightToolbarInputClass = cn(
  lightToolbarControlClass,
  "pl-9 font-normal placeholder:text-muted-foreground shadow-none",
  lightToolbarFocusClass,
)

export const lightToolbarClearButtonClass =
  "absolute right-1.5 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-[color,background-color] duration-150 hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25"

/** Menú desplegable de acciones en toolbars / filas claras. */
export const lightToolbarDropdownContentClass = cn(
  "rootsy-app-light w-56 p-1.5 text-popover-foreground",
  rootsyElevationPopoverContentLightClass,
  rootsyElevationPopoverMenuItemRadiusClass,
  "origin-(--radix-dropdown-menu-content-transform-origin)",
)

export const lightToolbarDropdownItemClass =
  "gap-2 text-popover-foreground focus:bg-muted focus:text-foreground data-[highlighted]:bg-muted data-[highlighted]:text-foreground [&_svg:not([class*='text-'])]:text-muted-foreground [&_svg]:opacity-70"

export const lightToolbarDropdownLabelClass =
  "px-2 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground"

/** Popover del calendario en paneles claros (modales light, filtros de período). */
export const lightDatePopoverContentClass =
  "border border-[#e7e5e4]/90 bg-white p-0 text-[#292524] shadow-xl shadow-[#292524]/8"

/** Calendario dentro del popover: isla clara; anula tokens dark del shell. */
export const lightDateCalendarClass = cn(
  "rounded-xl border border-[#f5f5f0] bg-white p-1.5 shadow-inner shadow-[#292524]/5",
  "[&_[data-slot=calendar]]:w-full [&_[data-slot=calendar]]:max-w-none",
  "[&_.rdp-root]:!w-full [&_.rdp-root]:max-w-none",
  "[&_.rdp-month]:w-full min-w-0",
  "[&_.rdp-month_grid]:w-full [&_.rdp-month_grid]:table-fixed",
  "[&_button[data-day]]:!text-[#44403c]",
  "[&_button[data-day]>span]:!opacity-100 [&_button[data-day]>span]:!text-inherit",
  "[&_button[data-day]:not([data-range-start=true]):not([data-range-end=true]):not([data-selected-single=true]):not([data-range-middle=true]):hover]:!bg-[#f5f5f0]",
  "[&_button[data-day]:not([data-range-start=true]):not([data-range-end=true]):not([data-selected-single=true]):not([data-range-middle=true]):hover]:!text-[#292524]",
  "[&_button[data-day][data-range-start=true]:hover]:!bg-emerald-700 [&_button[data-day][data-range-start=true]:hover]:!text-white",
  "[&_button[data-day][data-range-end=true]:hover]:!bg-emerald-700 [&_button[data-day][data-range-end=true]:hover]:!text-white",
  "[&_button[data-day][data-selected-single=true]:hover]:!bg-emerald-700 [&_button[data-day][data-selected-single=true]:hover]:!text-white",
  "[&_button[data-day][data-range-middle=true]:hover]:!bg-emerald-200 [&_button[data-day][data-range-middle=true]:hover]:!text-[#292524]",
  "[&_button[data-day][data-selected-single=true]]:!bg-emerald-600 [&_button[data-day][data-selected-single=true]]:!text-white",
  "[&_button[data-day][data-range-start=true]]:!bg-emerald-600 [&_button[data-day][data-range-start=true]]:!text-white",
  "[&_button[data-day][data-range-end=true]]:!bg-emerald-600 [&_button[data-day][data-range-end=true]]:!text-white",
  "[&_button[data-day][data-range-middle=true]]:!bg-emerald-100 [&_button[data-day][data-range-middle=true]]:!text-[#44403c]",
  "[&_.rdp-button_previous]:!text-[#57534e] [&_.rdp-button_next]:!text-[#57534e]",
  "[&_.rdp-weekday]:!text-[#78716c]",
  "[&_.rdp-caption_label]:!text-[#292524]",
  "[&_td.rdp-outside_button[data-day]]:!text-[#a8a29e]",
  "[&_td.rdp-disabled_button[data-day]]:!text-[#d6d3d1]",
)

export const lightFilterChipClass =
  "max-w-full gap-1 rounded-md border-border/50 py-0 pr-0.5 font-normal"

/** Barra filtros activos — h-11 · una fila con chips (fondo lo aporta el stack). */
export const listActiveFiltersBarClass = cn(
  listTableChromeBarStackedSurfaceClass,
  "gap-x-3 gap-y-1",
)

export const listActiveFiltersCountBadgeClass =
  "inline-flex min-w-5 shrink-0 items-center justify-center rounded-full bg-[#f5f5f0] px-1.5 py-0.5 text-[10px] font-semibold tabular-nums normal-case tracking-normal text-[#78716c]"

/** Chip de filtro activo — escala tierra, altura compacta para h-11. */
export const listActiveFilterChipClass =
  "inline-flex h-7 max-w-full shrink-0 items-center gap-0.5 rounded-md border border-[#e7e5e4] bg-[#fafaf7] pl-2 pr-0.5 text-xs text-[#292524]"

export const listActiveFilterChipDismissClass = cn(
  "inline-flex size-6 shrink-0 items-center justify-center rounded-md text-[#78716c] transition-colors",
  "hover:bg-[#f5f5f0] hover:text-[#292524]",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16704a]/25",
)

/** Acción terciaria «Limpiar» en barra de selección múltiple (hover neutro, sin accent). */
export const listBulkToolbarClearButtonClass = cn(
  rootsButtonCompactSizeClass,
  "bg-transparent font-medium text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary/25 active:bg-muted/60",
)

export const tableChromeFooterClass =
  "border-t border-border/80 bg-muted/35 dark:border-border/50 dark:bg-muted/20"

export const darkTableFooterClass = cn(
  "border-t border-[#263530]/80 backdrop-blur-xl",
  nightForestSurfaceClass,
)

/** Lateral fijo — 2 IconButton size-12 + gap + padding. */
export const darkTableFooterNavSideClass =
  "flex w-[7.875rem] shrink-0 items-center gap-1.5 px-3 sm:w-[8.375rem] sm:px-4"

/** @deprecated Usar darkTableFooterNavSideClass */
export const darkTableFooterNavGroupClass = darkTableFooterNavSideClass

export const darkTableFooterControlSurfaceClass = cn(
  nightForestBorderClass,
  nightForestPanelClass,
  "text-[#78716c] transition-colors",
  nightForestPanelHoverClass,
  "hover:text-[#d6d3d1]",
  nightForestFocusRingClass,
)

/** IconButton dark del header — navegación de paginación en footer (large). */
export const darkTableFooterNavIconButtonClass = rootsIconButtonClass({
  tone: "dark",
  size: "large",
})

/** @deprecated Usar darkTableFooterNavIconButtonClass */
export const darkTableFooterNavButtonClass = darkTableFooterNavIconButtonClass

export const footerPaginationSelectTriggerClass = rootsFormSelectDarkTriggerClass

export const footerPaginationSelectContentClass = rootsFormSelectDarkContentClass

export const footerPaginationSelectItemClass = rootsFormSelectDarkItemClass

export const darkTableFooterCenterClass =
  "flex min-w-0 flex-1 items-center justify-center gap-3 px-4"

export const darkTableFooterTotalLabelClass = cn(
  workspaceTableLayoutMetaLabelClass,
  nightForestMutedTextClass,
)

/** @deprecated Usar darkTableFooterTotalLabelClass */
export const darkTableFooterCenterMutedClass = darkTableFooterTotalLabelClass

export const tableRowSelectCheckboxClass =
  "size-4 border border-foreground/22 bg-background/85 shadow-sm dark:border-foreground/28 dark:bg-card/90 [&_[data-slot=checkbox-indicator]_svg]:size-3.5 data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=indeterminate]:border-primary/55 data-[state=indeterminate]:bg-primary/10 data-[state=indeterminate]:text-primary"

export const selectColumnInnerClass =
  "flex w-full items-center justify-center px-2"

/** Texto copiable solo dentro de tablas de listado. */
export const workspaceTableSelectableTextClass =
  "select-text [&_th]:select-text [&_td]:select-text"

/** Alcance en el frame de tabla para reactivar selección bajo un shell select-none. */
export const workspaceTableListBodyScopeClass = cn(
  "[&_[data-slot=table-body]_[data-slot=table-cell]]:align-middle",
  "[&_[data-slot=table-body]_[data-slot=table-cell]]:!py-2.5",
  "[&_[data-slot=table-body]_[data-slot=table-cell]:not(:has([role=checkbox]))]:px-3",
  "[&_[data-slot=table-body]_[data-slot=table-cell]:has([role=checkbox])]:!w-12",
  "[&_[data-slot=table-body]_[data-slot=table-cell]:has([role=checkbox])]:!px-0",
  "[&_[data-slot=table-body]_[data-slot=table-cell]:has([role=checkbox])]:!py-2",
)

export const workspaceTableFrameSelectableScopeClass = cn(
  "[&_table]:select-text [&_table_th]:select-text [&_table_td]:select-text",
  workspaceTableListBodyScopeClass,
)

/** Celda estándar de fila (layout preview / listados workspace). */
export const workspaceTableBodyCellClass = "px-3 py-2.5 align-middle text-sm"

/** Columna de selección (checkbox). */
export const workspaceTableSelectBodyCellClass =
  "w-12 !px-0 py-2 align-middle"

/** Columna de acciones con íconos. */
export const workspaceTableActionsBodyCellClass = "px-1 py-1.5 align-middle"

/** Tablas de datos dentro del shell workspace (scroll horizontal común). */
export const workspaceTableLayoutClassName = cn(
  "relative w-full min-w-full table-fixed caption-bottom text-sm",
  workspaceTableSelectableTextClass,
)

export const workspaceDataTableClassName = cn(
  workspaceTableLayoutClassName,
  "min-w-[80rem]",
)

/** Precios e importes: Inter + alineación numérica estable. */
export const tdMoneyClass =
  "font-numeric text-[13px] tabular-nums tracking-tight text-foreground"

export const tdMoneyMutedClass =
  "font-numeric text-[13px] tabular-nums tracking-tight text-muted-foreground"

/** Total cobrado / importe principal. */
export const tdMoneyTotalClass =
  "font-numeric text-[13px] font-semibold tabular-nums tracking-tight text-emerald-700"

/** Descuentos aplicados. */
export const tdMoneyDiscountClass =
  "font-numeric text-[13px] font-medium tabular-nums tracking-tight text-amber-700"

/** IVA u otros impuestos. */
export const tdMoneyVatClass =
  "font-numeric text-[13px] font-medium tabular-nums tracking-tight text-sky-700"

/** Cliente registrado (enlace a ficha). */
export const tdClientLinkedClass =
  "block min-w-0 max-w-full truncate font-medium text-violet-700 underline-offset-2 transition-colors hover:text-violet-900 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/35 rounded-sm"

/** Cliente con nombre pero sin ficha vinculada. */
export const tdClientNamedClass =
  "block min-w-0 max-w-full truncate font-medium text-violet-700/90"

/** Venta sin cliente identificado. */
export const tdClientAnonymousClass =
  "block min-w-0 max-w-full truncate text-sm text-muted-foreground"

/** Celda de tabla con nombre/etiqueta larga (cliente, proveedor, categoría). */
export const tdTruncatedNameCellClass = cn(
  workspaceTableBodyCellClass,
  "w-[14rem] min-w-0 max-w-[14rem] overflow-hidden",
)

/** Celda de tabla con texto secundario truncable (comprobante, medio de pago). */
export const tdTruncatedTextCellClass = cn(
  workspaceTableBodyCellClass,
  "min-w-0 max-w-[12rem] overflow-hidden",
)

/** Fila de encabezado de tabla (sin hover). */
export const workspaceTableHeaderRowClass = "border-0 hover:bg-transparent"

/** Borde de filas — misma familia cromática que el header (`border-border`). */
export const workspaceTableRowBorderClass = "border-b border-border/70"

/** Hover de filas alineado al tono suave del header (`bg-muted/90`). */
export const workspaceTableRowHoverClass = "hover:bg-muted/40"

/** Franja alternada de filas (muted suave, no zinc). */
export const workspaceTableRowStripeClass = "bg-muted/20"

/** Skeleton de celdas — misma gama que filas/header. */
export const workspaceTableSkeletonTone = {
  bar: "animate-pulse rounded-sm bg-muted/55",
  barSm: "animate-pulse rounded-sm bg-muted/30",
  box: "animate-pulse rounded-sm bg-muted/50",
  pill: "animate-pulse rounded-md bg-muted/55",
} as const

/** Filas de carga / vacío / mensajes (sin hover). */
export const workspaceTablePlaceholderRowClass = cn(
  workspaceTableRowBorderClass,
  "bg-white hover:bg-white pointer-events-none dark:bg-white",
)

/** Filas de detalle expandido o contenido anidado (sin hover). */
export const workspaceTableStaticRowClass = cn(
  workspaceTableRowBorderClass,
  workspaceTableRowStripeClass,
  "hover:bg-muted/20",
)

export function workspaceTableBodyRowClassNames(
  index: number,
  options?: { selected?: boolean },
): string {
  return cn(
    workspaceTableRowBorderClass,
    "transition-colors duration-150",
    workspaceTableRowHoverClass,
    index % 2 === 0 ? "bg-white dark:bg-white" : workspaceTableRowStripeClass,
    options?.selected &&
      "bg-emerald-50/90 hover:bg-emerald-50 ring-1 ring-inset ring-emerald-600/12",
  )
}
