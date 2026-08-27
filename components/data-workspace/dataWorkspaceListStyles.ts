/** Tokens compartidos entre listados tipo “workspace” (layout preview, clientes, etc.). */

import "@/components/data-workspace/dataWorkspaceBlocksAtmosphere.css"
import {
  rootsyElevationInteractiveMotionClass,
  rootsyElevationRaisedHoverClass,
  rootsyElevationRaisedRestClass,
} from "@/components/elevation/rootsyElevationStyles"
import {
  rootsDropdownContentLightClass,
  rootsDropdownItemLightCompactClass,
  rootsDropdownLabelLightClass,
} from "@/components/rootsy-dropdown/rootsDropdownStyles"
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
import {
  rootsyDateCalendarPanelClass,
  rootsyDatePopoverContentClass,
} from "@/components/ui/rootsyDateCalendarStyles"
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

/** Chrome superior — misma loseta que el detalle (bruma-200 · raised · radius.xxlarge). */
export const dataWorkspaceFlushBottomPanelChromeClass = cn(
  dataWorkspaceBlocksCardSurfaceClass,
  "shrink-0 overflow-hidden rounded-t-[1.375rem] border border-b-0 border-[var(--rootsy-bruma-200)]",
  rootsyElevationRaisedRestClass,
)

/** Cuerpo inferior — laterales bruma-200, sin borde de piso. */
export const dataWorkspaceFlushBottomPanelBodyClass = cn(
  dataWorkspaceBlocksCardSurfaceClass,
  "flex min-h-0 flex-1 flex-col border-x border-[var(--rootsy-bruma-200)]",
)

/**
 * Grid de tarjetas (cuentas, cajas): 100% ancho · columnas auto-fill.
 * Mínimo 18rem por bloque; crece en 1fr para llenar la fila (fluido).
 */
export const dataWorkspaceEntityCardsGridClass =
  "grid w-full min-w-0 gap-4 grid-cols-[repeat(auto-fill,minmax(min(100%,18rem),1fr))]"

/** Máximo legible de columna — referencia spec (22rem); el track puede crecer en pantallas anchas. */
export const dataWorkspaceEntityCardsGridColumnMaxClass = "max-w-[22rem]"

/** Superficie del listado flush (tablas layout workspace). */
export const workspaceTableSurfaceClass =
  "bg-[var(--wt-surface)]"

/** Marco del listado — la tabla ocupa el claro, de lado a lado hasta el suelo. */
export const dataWorkspaceTablesSheetFrameClass =
  "relative z-1 flex min-h-0 min-w-0 flex-1 flex-col"

/** Hoja flush — tabla + piso stripe (no blanco) bajo la última fila. */
export const dataWorkspaceTablesSheetClass = cn(
  "flex min-h-0 flex-1 flex-col overflow-hidden bg-[var(--wt-surface-stripe)]",
)

/** Piso del listado — el “otro” de las filas (stripe), no el blanco. */
export const dataWorkspaceTableBodyFloorClass = "bg-[var(--wt-surface-stripe)]"

/** Cuerpo de tabla — mismo `game-scroll` que el body de los modales. */
export const dataWorkspaceTableBodyScrollClass = cn(
  "game-scroll absolute inset-0 overflow-auto overscroll-contain",
  dataWorkspaceTableBodyFloorClass,
)

/** Cuerpo de tabla mientras carga — sin barras (el esqueleto no scrollea). */
export const dataWorkspaceTableBodyScrollHiddenClass = cn(
  "absolute inset-0 overflow-hidden",
  dataWorkspaceTableBodyFloorClass,
)

/** Scope raíz — tokens --wt-* (ver rootsyNaturePalette.css). */
export const workspaceTableNatureScopeClass = "workspace-table-nature"

/** Contenido bloques — scrollea adentro del valle; el horizonte no se mueve. */
export const dataWorkspaceBlocksContentScopeClass =
  "min-h-0 flex-1 overflow-y-auto"

/** Padding estándar del área de grid bloques. */
export const dataWorkspaceBlocksContentInnerClass =
  "relative flex w-full flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8"

/** `<main>` bloques — recuadro del valle. El scroll lo hace el hijo. */
export const dataWorkspaceBlocksPageMainClass = cn(
  "data-workspace-blocks-atmosphere rootsy-app-light min-h-0 overflow-hidden overflow-y-hidden text-foreground",
)

/** Contenedor de grid en listados cuentas / cajas. */
export const dataWorkspaceBlocksPageContentClass = cn(
  dataWorkspaceBlocksContentScopeClass,
  dataWorkspaceBlocksContentInnerClass,
)

/** Split 9/3 — cada pane scrollea entero (cabecera + grilla). */
export const dataWorkspaceBlocksSplitFrameClass =
  "flex min-h-0 flex-1 flex-col overflow-hidden"

export const dataWorkspaceBlocksSplitBannerClass =
  "shrink-0 space-y-3 px-4 pt-6 sm:px-6 lg:px-8"

export const dataWorkspaceBlocksSplitGridClass = cn(
  "game-scroll grid min-h-0 flex-1 grid-cols-1",
  "overflow-y-auto overscroll-contain",
  "lg:grid-cols-12 lg:overflow-hidden",
)

export const dataWorkspaceBlocksSplitPaneClass = cn(
  "game-scroll flex min-h-0 min-w-0 flex-col",
  "px-4 py-6 sm:px-6 lg:h-full lg:overflow-y-auto lg:overscroll-contain lg:px-8",
)

/**
 * Divisoria suave entre panes: trazo que se desvanece, no una línea de borde a borde.
 * En mobile es horizontal; en desktop, vertical.
 */
export const dataWorkspaceBlocksSplitPaneRuleClass = cn(
  "relative before:pointer-events-none before:absolute before:content-['']",
  "before:inset-x-8 before:top-0 before:h-px",
  "before:bg-[linear-gradient(to_right,transparent,var(--rootsy-bruma-200)_18%,var(--rootsy-bruma-200)_82%,transparent)]",
  "lg:before:inset-x-auto lg:before:top-[12%] lg:before:bottom-[12%] lg:before:left-0 lg:before:h-auto lg:before:w-px",
  "lg:before:bg-[linear-gradient(to_bottom,transparent,var(--rootsy-bruma-200)_16%,var(--rootsy-bruma-200)_84%,transparent)]",
)

/** Grilla interna del pane. */
export const dataWorkspaceBlocksSplitPaneBodyGridClass =
  "grid min-w-0 grid-cols-1 gap-3"

/** Skeleton bloques — bruma, sin tokens Nature tablas. */
export const dataWorkspaceBlocksSkeletonTone = {
  bar: "animate-pulse rounded-sm bg-[var(--rootsy-bruma-200)]",
  barSm: "animate-pulse rounded-sm bg-[color-mix(in_srgb,var(--rootsy-bruma-200)_65%,white)]",
  box: "animate-pulse rounded-md bg-[var(--rootsy-bruma-200)]",
  pill: "animate-pulse rounded-md bg-[var(--rootsy-bruma-200)]",
} as const

/** Skeleton bloques — respiración lenta (espera que no cuenta el tiempo). */
export const dataWorkspaceBlocksSkeletonBreathTone = {
  bar: "data-workspace-blocks-breath rounded-sm bg-[var(--rootsy-bruma-200)]",
  barSm:
    "data-workspace-blocks-breath rounded-sm bg-[color-mix(in_srgb,var(--rootsy-bruma-200)_65%,white)]",
  box: "data-workspace-blocks-breath rounded-md bg-[var(--rootsy-bruma-200)]",
  pill: "data-workspace-blocks-breath rounded-md bg-[var(--rootsy-bruma-200)]",
} as const

/** Eyebrow / meta de tarjeta entidad. */
export const dataWorkspaceEntityCardEyebrowClass =
  "rootsy-text-label text-[var(--rootsy-bruma-500)]"

export const dataWorkspaceEntityCardTitleClass =
  "rootsy-text-heading-small text-[var(--rootsy-bruma-900)]"

export const dataWorkspaceEntityCardStatLabelClass =
  "rootsy-text-label text-[var(--rootsy-bruma-500)]"

export const dataWorkspaceEntityCardStatValueClass =
  "block min-w-0 truncate rootsy-text-metric-small text-[var(--rootsy-bruma-900)]"

export const dataWorkspaceEntityCardStatValueLargeClass =
  "block min-w-0 truncate rootsy-text-metric-medium text-[var(--rootsy-bruma-900)]"

export const dataWorkspaceEntityCardBadgeClass =
  "inline-flex items-center gap-1.5 rounded-lg border border-[var(--rootsy-bruma-200)] bg-white px-2.5 py-1.5 rootsy-text-label text-[var(--rootsy-bruma-500)] shadow-xs [&_svg]:size-3.5 [&_svg]:text-[var(--rootsy-bruma-500)]"

export const dataWorkspaceEntityCardStatusOpenClass =
  "inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[color-mix(in_srgb,var(--rootsy-savia-600)_25%,var(--rootsy-bruma-200))] bg-[color-mix(in_srgb,var(--rootsy-savia-600)_10%,white)] px-2.5 py-1 rootsy-text-label text-[var(--rootsy-savia-800)]"

export const dataWorkspaceEntityCardStatusClosedClass =
  "inline-flex shrink-0 items-center rounded-full border border-[var(--rootsy-bruma-200)] bg-white px-2.5 py-1 rootsy-text-label text-[var(--rootsy-bruma-500)]"

export const dataWorkspaceEntityCardStatusInactiveClass =
  "inline-flex shrink-0 items-center rounded-full border border-[var(--rootsy-bruma-200)] bg-[var(--rootsy-bruma-50)] px-2.5 py-1 rootsy-text-label text-[var(--rootsy-bruma-500)]"

export const dataWorkspaceEntityCardMenuTriggerClass = cn(
  "inline-flex size-8 items-center justify-center rounded-lg text-[var(--rootsy-bruma-500)] transition-colors outline-none",
  "hover:bg-[var(--rootsy-bruma-100)] hover:text-[var(--rootsy-bruma-900)]",
  "data-[state=open]:bg-[var(--rootsy-bruma-100)] data-[state=open]:text-[var(--rootsy-bruma-900)]",
  "focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--rootsy-savia-600)_35%,transparent)]",
)

/**
 * Superficie loseta — borde + elevación raised en reposo (sin hover).
 */
export const dataWorkspaceEntityCardLosetaSurfaceClass = cn(
  "relative flex h-full w-full min-w-0 flex-col overflow-hidden rounded-[1.375rem]",
  "border border-[var(--rootsy-bruma-200)] bg-white",
  rootsyElevationRaisedRestClass,
)

/**
 * Tarjeta loseta interactiva — elevation.shadow.raised · hover más marcado (cuentas · propuesta A).
 */
export const dataWorkspaceEntityCardLosetaClass = cn(
  "group",
  dataWorkspaceEntityCardLosetaSurfaceClass,
  rootsyElevationInteractiveMotionClass,
  "hover:border-[var(--rootsy-bruma-300)]",
  rootsyElevationRaisedHoverClass,
  "active:shadow-[0_1px_2px_rgb(5_8_7/0.08)]",
)

/** Loseta inactiva — misma forma, tono apagado, sin pill de estado. */
export const dataWorkspaceEntityCardLosetaInactiveClass = cn(
  "bg-[var(--rootsy-bruma-50)] opacity-[0.72]",
  "hover:border-[var(--rootsy-bruma-200)]",
)

/** Loseta de la persona en sesión — mismo cuerpo, acento savia apenas perceptible. */
export const dataWorkspaceEntityCardLosetaSelfClass = cn(
  "border-[color-mix(in_srgb,var(--rootsy-savia-600)_28%,var(--rootsy-bruma-200))]",
  "bg-[color-mix(in_srgb,var(--rootsy-savia-50)_55%,white)]",
  "hover:border-[color-mix(in_srgb,var(--rootsy-savia-600)_42%,var(--rootsy-bruma-200))]",
)

/** Cuerpo saldo — fila flexible del grid de tarjeta. */
export const dataWorkspaceEntityCardSaldoSectionClass = "min-w-0 px-4 py-4"

export const dataWorkspaceEntityCardFooterClass =
  "border-t border-[var(--rootsy-bruma-200)]"

/** Pie liquidaciones — altura fija para alinear el borde en toda la grilla. */
export const dataWorkspaceEntityCardSettlementFooterClass = cn(
  "grid h-[4.75rem] shrink-0 grid-cols-2 gap-4 px-4 py-4 [&>*]:min-w-0",
  dataWorkspaceEntityCardFooterClass,
)

/** Pie acción caja — efectivo + CTA · altura fija (paridad loseta). */
export const dataWorkspaceEntityCardActionFooterClass = cn(
  "flex h-[4.75rem] shrink-0 items-center justify-between gap-3 px-4",
  dataWorkspaceEntityCardFooterClass,
)

/** Grid interno tarjeta loseta — cabecera · saldo · pie fijo. */
export const dataWorkspaceEntityCardLosetaGridClass =
  "grid h-full min-h-0 flex-1 grid-rows-[auto_minmax(0,1fr)_4.75rem]"

/**
 * Tarjeta interactiva elevada — cajas y entidades con sombra en hover.
 */
export const dataWorkspaceEntityCardClass = cn(
  "group relative flex h-full w-full min-w-0 flex-col overflow-hidden rounded-[1.375rem]",
  "border border-[var(--rootsy-bruma-200)] bg-white shadow-sm",
  "transition-[border-color,box-shadow] duration-200",
  "hover:border-[var(--rootsy-bruma-300)] hover:shadow-md",
)

export const dataWorkspaceEntityCardHeaderClass =
  "border-b border-[var(--rootsy-bruma-200)] px-4 py-4 pr-11"

/** Zona interna de tarjeta — overlay blanco. */
export const dataWorkspaceEntityCardBodySunkenClass = dataWorkspaceBlocksCardSurfaceClass

export const dataWorkspaceEntityCardBodyClass = cn(
  "flex min-h-0 flex-1 flex-col px-4 py-4",
  dataWorkspaceEntityCardBodySunkenClass,
)

export const dataWorkspaceEntityCardIsotypeClass =
  "flex size-11 shrink-0 items-center justify-center rounded-xl border border-[var(--rootsy-bruma-200)] bg-white text-[var(--rootsy-bruma-500)] shadow-xs"

/** Shell skeleton — misma superficie que la tarjeta final, sin hover. */
export const dataWorkspaceEntityCardSkeletonShellClass = cn(
  "relative flex h-full flex-col overflow-hidden rounded-[1.375rem]",
  "border border-[var(--rootsy-bruma-200)] bg-white shadow-sm",
)

export const dataWorkspaceBlocksEmptyStateClass =
  "rounded-xl border border-dashed border-[var(--rootsy-bruma-300)] bg-white px-4 py-10 text-center font-canopy text-sm text-[var(--rootsy-bruma-500)]"

/** Título de sección en layout · bloques — espejo LayoutsBlocksDocSubsection · font.heading.xsmall semibold. */
export const dataWorkspaceBlocksSectionTitleClass =
  "font-canopy text-sm font-semibold text-[var(--rootsy-bruma-900)]"

/** Descripción bajo sección — font.body.small · bruma-500. */
export const dataWorkspaceBlocksSectionDescriptionClass =
  "max-w-2xl font-canopy text-xs leading-relaxed text-[var(--rootsy-bruma-500)]"

/** Empty state embebido en paneles de detalle — icon tile + título + descripción. */
export const dataWorkspaceDetailEmptyStateClass =
  "flex min-h-0 flex-1 flex-col items-center justify-center px-6 py-16 text-center"

export const dataWorkspaceDetailEmptyStateContentClass =
  "flex max-w-[16rem] flex-col items-center gap-3"

export const dataWorkspaceDetailEmptyStateIconWrapClass =
  "flex size-12 items-center justify-center rounded-full bg-[var(--rootsy-bruma-50)] text-[var(--rootsy-bruma-500)]"

export const dataWorkspaceDetailEmptyStateTitleClass =
  "font-canopy text-sm font-medium text-[var(--rootsy-bruma-900)]"

export const dataWorkspaceDetailEmptyStateDescriptionClass =
  "font-canopy text-xs leading-relaxed text-[var(--rootsy-bruma-500)]"

/** Scope sin padding — detalle cuenta / caja. */
export const dataWorkspaceBlocksPageScopeClass =
  dataWorkspaceBlocksContentScopeClass

/** Tarjeta / panel de detalle — radius.xxlarge · elevation.shadow.raised (paridad loseta, sin hover). */
export const dataWorkspaceDetailCardClass = cn(
  "overflow-hidden rounded-[1.375rem] border border-[var(--rootsy-bruma-200)] bg-white",
  rootsyElevationRaisedRestClass,
)

/** Panel de detalle pegado al piso — sin borde ni radio inferior. */
export const dataWorkspaceDetailFlushBottomCardClass = cn(
  dataWorkspaceDetailCardClass,
  "flex min-h-0 flex-1 flex-col rounded-b-none border-b-0",
)

export const dataWorkspaceDetailCardHeaderClass =
  "border-b border-[var(--rootsy-bruma-200)] px-4 py-4 sm:px-6 lg:px-8"

export const dataWorkspaceDetailCardStatsClass = cn(
  "grid gap-4 px-4 py-4 sm:grid-cols-2 sm:px-6 lg:flex lg:flex-wrap lg:items-end lg:gap-x-10 lg:gap-y-3 lg:px-8",
  dataWorkspaceEntityCardBodySunkenClass,
)

/** Toolbar de filtros / tabs en paneles de detalle. */
export const dataWorkspaceDetailToolbarClass = cn(
  "flex flex-col gap-3 border-b border-[var(--rootsy-bruma-200)] px-4 py-3 lg:flex-row lg:items-center lg:justify-between lg:px-5",
  dataWorkspaceEntityCardBodySunkenClass,
)

/** Franja KPI dentro de paneles (3 columnas). */
export const dataWorkspaceDetailKpiStripClass = cn(
  "grid divide-y divide-[var(--rootsy-bruma-200)] border-b border-[var(--rootsy-bruma-200)] sm:grid-cols-3 sm:divide-x sm:divide-y-0",
  dataWorkspaceBlocksCardSurfaceClass,
)

/** Franja KPI (2 columnas — saldos de período). */
export const dataWorkspaceDetailKpiStripTwoColClass = cn(
  "grid divide-y divide-[var(--rootsy-bruma-200)] border-b border-[var(--rootsy-bruma-200)] sm:grid-cols-2 sm:divide-x sm:divide-y-0",
  dataWorkspaceBlocksCardSurfaceClass,
)

export const dataWorkspaceDetailPanelClass = cn(
  dataWorkspaceDetailCardClass,
  "overflow-hidden",
)

export const dataWorkspaceDetailSectionClass =
  "border-t border-[var(--rootsy-bruma-200)] px-4 py-4 lg:px-5"

export const dataWorkspaceDetailBodyClass = "px-4 py-4 lg:px-5"

export type WorkspaceTableTone = "default" | "nature" | "earth"

export const workspaceTableNatureSurfaceClass = "bg-[var(--wt-surface)]"

/** Labels meta — tipografía base (medium); footer oscuro añade bold explícito. */
export const workspaceTableLayoutMetaLabelClass = rootsFormFieldLabelTypographyClass

/** Encabezado — cristal bruma (layout tablas). */
export const workspaceTableNatureHeaderCellClass = cn(
  "sticky top-0 z-20 h-10 border-b px-2 py-2",
  workspaceTableLayoutMetaLabelClass,
  "border-[var(--wt-border)] backdrop-blur-md backdrop-saturate-150 bg-[var(--wt-header-bg-glass)] text-[var(--wt-header-text)]",
)

export const workspaceTableNatureBodyRowInactiveClass = "opacity-[0.78]"

export function workspaceTableNatureBodyRowClassNames(
  index: number,
  options?: {
    selected?: boolean
    noHover?: boolean
    inactive?: boolean
    signal?: "warning" | "danger"
  },
): string {
  const isEven = index % 2 === 0
  /** Par handbook — even superficie 50 · odd fondo 100. */
  const rowSurface = isEven
    ? "bg-[var(--wt-surface)]"
    : "bg-[var(--wt-surface-stripe)]"
  const rowSurfaceHover = isEven
    ? "hover:!bg-[var(--wt-surface)]"
    : "hover:!bg-[var(--wt-surface-stripe)]"

  return cn(
    "border-b border-[var(--wt-border)] transition-colors duration-150",
    rowSurface,
    options?.selected
      ? "!bg-[var(--wt-surface-selected)] hover:!bg-[var(--wt-surface-selected)] ring-1 ring-inset ring-[var(--wt-surface-selected-ring)]"
      : options?.noHover
        ? rowSurfaceHover
        : "hover:!bg-[var(--wt-surface-hover)]",
    options?.inactive && workspaceTableNatureBodyRowInactiveClass,
    !options?.selected &&
      options?.signal === "warning" &&
      workspaceTableNatureBodyRowSignalWarningClass,
    !options?.selected &&
      options?.signal === "danger" &&
      workspaceTableNatureBodyRowSignalDangerClass,
  )
}

export const workspaceTableNatureTextPrimaryClass =
  "text-[var(--wt-text-primary)]"

export const workspaceTableNatureTextSecondaryClass =
  "text-[var(--wt-text-secondary)]"

export const workspaceTableNatureTextTertiaryClass =
  "text-[var(--wt-text-tertiary)]"

export const workspaceTableNatureLinkClass =
  "font-semibold text-[var(--wt-link)] underline underline-offset-2 hover:text-[var(--wt-link-hover)]"

export const workspaceTableNatureMoneyClass = cn(
  "font-numeric text-sm font-normal tabular-nums tracking-tight text-[var(--wt-money)]",
)

export const workspaceTableNatureMoneyNegativeClass = cn(
  "font-numeric text-sm tabular-nums tracking-tight text-[var(--wt-money-negative)]",
)

/** Barra de chrome (filtros activos · selección) — crece en mobile si hay wrap. */
export const listBulkToolbarBarClass =
  "flex min-h-11 shrink-0 flex-wrap items-center gap-2 px-3 py-2 sm:px-4 md:h-11 md:py-0"

/** Contenedor único — filtros activos + selección antes de la tabla. */
export const listTableChromeStackClass =
  "shrink-0 overflow-hidden border-b border-[var(--wt-border)] bg-[var(--wt-surface)]"

/** Separador interno suave entre filas del stack. */
export const listTableChromeStackFollowRowClass =
  "border-t border-[var(--wt-border)]"

/** Superficie compartida — barras contexto h-11 (filtros activos · selección). */
export const listTableChromeBarSurfaceClass = cn(
  listBulkToolbarBarClass,
  "bg-[var(--wt-surface)]",
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
  "activo" | "inactivo" | "pendiente" | "vencido" | "info",
  string
> = {
  activo:
    "border-[var(--rootsy-savia-200)] bg-[var(--rootsy-savia-50)] text-[var(--rootsy-savia-800)]",
  inactivo:
    "border-[var(--rootsy-bruma-200)] bg-[var(--rootsy-bruma-100)] text-[var(--rootsy-bruma-700)]",
  pendiente:
    "border-[var(--rootsy-sol-200)] bg-[var(--rootsy-sol-50)] text-[var(--rootsy-sol-900)]",
  vencido:
    "border-[var(--rootsy-lava-200)] bg-[var(--rootsy-lava-50)] text-[var(--rootsy-lava-800)]",
  info:
    "border-[var(--rootsy-cielo-200)] bg-[var(--rootsy-cielo-50)] text-[var(--rootsy-cielo-800)]",
}

/** Fila con señal de importancia — aviso / peligro (stock, vencido). */
export const workspaceTableNatureBodyRowSignalWarningClass =
  "!bg-[color-mix(in_srgb,var(--rootsy-sol-50)_88%,var(--wt-surface))] shadow-[inset_3px_0_0_var(--rootsy-sol-500)]"

export const workspaceTableNatureBodyRowSignalDangerClass =
  "!bg-[color-mix(in_srgb,var(--rootsy-lava-50)_88%,var(--wt-surface))] shadow-[inset_3px_0_0_var(--rootsy-lava-600)]"

export const workspaceTableNatureStockOkClass =
  "text-[var(--rootsy-savia-800)]"

export const workspaceTableNatureStockWarningClass = "text-[var(--rootsy-sol-900)]"

export const workspaceTableNatureStockDangerClass = "text-[var(--rootsy-lava-800)]"

export const workspaceTableNatureSkeletonTone = {
  bar: "animate-pulse rounded-sm bg-[var(--wt-skeleton)]",
  barSm: "animate-pulse rounded-sm bg-[var(--wt-skeleton-soft)]",
  box: "animate-pulse rounded-sm bg-[var(--wt-skeleton)]",
  pill: "animate-pulse rounded-md bg-[var(--wt-skeleton)]",
} as const

/** Checkbox — borde bruma, marca savia al marcar. Aísla estilos del shell Nature (.dark). */
export const workspaceTableNatureCheckboxClass = cn(
  "relative z-[1] shrink-0 cursor-pointer select-auto pointer-events-auto",
  "size-4 rounded border bg-[var(--wt-surface)] shadow-none",
  "[&_[data-slot=checkbox-indicator]_svg]:size-3.5",
  "border-[var(--rootsy-bruma-300)]",
  "data-[state=checked]:border-[var(--rootsy-savia-600)] data-[state=checked]:bg-[var(--rootsy-savia-600)] data-[state=checked]:text-[var(--rootsy-savia-50)]",
  "data-[state=indeterminate]:border-[color-mix(in_srgb,var(--rootsy-savia-600)_50%,var(--rootsy-bruma-200))] data-[state=indeterminate]:bg-[var(--rootsy-savia-100)] data-[state=indeterminate]:text-[var(--rootsy-savia-700)]",
  "dark:bg-[var(--wt-surface)] dark:data-[state=checked]:border-[var(--rootsy-savia-600)] dark:data-[state=checked]:bg-[var(--rootsy-savia-600)] dark:data-[state=checked]:text-[var(--rootsy-savia-50)]",
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
  "text-foreground",
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
  "rootsy-app-light w-56",
  rootsDropdownContentLightClass,
  "origin-(--radix-dropdown-menu-content-transform-origin)",
)

export const lightToolbarDropdownItemClass = rootsDropdownItemLightCompactClass

export const lightToolbarDropdownLabelClass = rootsDropdownLabelLightClass

/** Popover del calendario en paneles claros (modales light, filtros de período). */
export const lightDatePopoverContentClass = rootsyDatePopoverContentClass

/** Calendario dentro del popover — paleta bruma/savia. */
export const lightDateCalendarClass = rootsyDateCalendarPanelClass

export const lightFilterChipClass =
  "max-w-full gap-1 rounded-md border-border/50 py-0 pr-0.5 font-normal"

/** Control toolbar con filtro aplicado — paridad form.control focus (savia-400 · ring 45%). */
export const listToolbarFilterTriggerActiveClass =
  "!border-[var(--rootsy-savia-400)] !shadow-[0_0_0_2px_color-mix(in_srgb,var(--rootsy-savia-400)_45%,transparent)] !ring-0"

/** Badge de cantidad en trigger «Filtros» — círculo fijo 20×20 · acento savia-400. */
export const listToolbarFilterCountBadgeClass =
  "inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--rootsy-savia-400)_12%,transparent)] text-xs font-semibold tabular-nums leading-none text-[var(--rootsy-savia-400)]"

/** Barra filtros activos — h-11 · una fila con chips (fondo lo aporta el stack). */
export const listActiveFiltersBarClass = cn(
  listTableChromeBarStackedSurfaceClass,
  "gap-x-3 gap-y-1",
)

/** Contador junto a «Filtros activos» — pill si supera un dígito. */
export const listActiveFiltersCountBadgeClass = cn(
  listToolbarFilterCountBadgeClass,
  "size-auto h-5 w-auto min-w-5 px-1",
)

/** Chip de filtro activo — pill bruma · botón × circular concéntrico. */
export const listActiveFilterChipClass = cn(
  "inline-flex h-7 max-w-full shrink-0 items-center gap-1 rounded-full border border-[var(--color-borde)] bg-[var(--color-superficie)] py-0 pl-2.5 pr-1 text-xs text-[var(--color-texto)]",
)

export const listActiveFilterChipDismissClass = cn(
  "inline-flex size-5 shrink-0 items-center justify-center rounded-full text-[var(--color-texto-muted)] transition-colors",
  "hover:bg-[var(--color-fondo)] hover:text-[var(--color-texto)]",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--rootsy-savia-600)_25%,transparent)]",
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
  "text-[color:var(--rootsy-bruma-500)] transition-colors",
  nightForestPanelHoverClass,
  "hover:text-[color:var(--rootsy-bruma-300)]",
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
  "font-bold",
  nightForestMutedTextClass,
)

/** Pie compacto layout — atmósfera sombra (superficie 600). */
export const earthTableFooterClass = cn(
  "border-t border-[color-mix(in_srgb,var(--rootsy-sombra-400)_45%,transparent)]",
  "bg-[var(--rootsy-sombra-600)]",
)

export const earthTableFooterNavIconButtonClass = cn(
  "inline-flex size-10 shrink-0 items-center justify-center rounded-xl border outline-none transition-all",
  "border-[color-mix(in_srgb,var(--rootsy-sombra-400)_50%,transparent)]",
  "bg-[var(--rootsy-sombra-500)]",
  "text-[var(--rootsy-sombra-50)]",
  "hover:border-[var(--rootsy-sombra-400)]",
  "hover:bg-[var(--rootsy-sombra-500)]",
  "hover:text-[var(--rootsy-sombra-50)]",
  "focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--rootsy-sombra-300)_45%,transparent)] focus-visible:ring-offset-0",
  "disabled:pointer-events-none disabled:opacity-40",
  "[&_svg]:size-5",
)

export const earthTableFooterCenterClass =
  "flex flex-wrap items-center justify-center gap-x-3 gap-y-2"

/** Trigger compacto — tierra oscura (dropdown aparte en estilo light). */
export const earthTableFooterSelectTriggerClass = cn(
  "!h-10 !min-h-10 !w-[4.25rem] min-w-[4.25rem] max-w-[4.25rem] justify-between gap-1 !rounded-md px-2 text-xs font-medium",
  "!border-[color-mix(in_srgb,var(--rootsy-sombra-400)_55%,transparent)]",
  "!bg-[var(--rootsy-sombra-500)]",
  "!text-[var(--rootsy-sombra-50)]",
  "shadow-none outline-none transition-all",
  "hover:!border-[var(--rootsy-sombra-400)]",
  "hover:!bg-[var(--rootsy-sombra-500)]",
  "hover:!text-[var(--rootsy-sombra-50)]",
  "data-[state=open]:!border-[var(--rootsy-sombra-400)]",
  "data-[state=closed]:focus:!border-[color-mix(in_srgb,var(--rootsy-sombra-400)_55%,transparent)] data-[state=closed]:focus:!ring-0",
  "focus-visible:!ring-2 focus-visible:!ring-[color-mix(in_srgb,var(--rootsy-sombra-300)_45%,transparent)] focus-visible:!ring-offset-0",
  "disabled:pointer-events-none disabled:opacity-40",
  "[&_[data-slot=select-value]]:min-w-0 [&_[data-slot=select-value]]:flex-1 [&_[data-slot=select-value]]:truncate [&_[data-slot=select-value]]:text-left",
  "[&_[data-slot=select-value][data-placeholder]]:!text-[var(--rootsy-sombra-300)]",
  "[&_svg]:!size-3.5 [&_svg]:!text-[var(--rootsy-sombra-300)]",
)

export const earthTableFooterSelectItemClass = "py-1.5 text-xs"

export const earthTableFooterTotalLabelClass = cn(
  workspaceTableLayoutMetaLabelClass,
  "font-bold",
  "text-[var(--rootsy-sombra-300)]",
)

export const earthTableFooterDotClass = "text-[var(--rootsy-sombra-400)]"

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
  "[&_[role=checkbox]]:pointer-events-auto [&_[role=checkbox]]:cursor-pointer [&_[role=checkbox]]:select-auto",
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
  "font-numeric text-sm tabular-nums tracking-tight text-foreground"

export const tdMoneyMutedClass =
  "font-numeric text-sm tabular-nums tracking-tight text-muted-foreground"

/** Total cobrado / importe principal. */
export const tdMoneyTotalClass =
  "font-numeric text-sm font-semibold tabular-nums tracking-tight text-emerald-700"

/** Descuentos aplicados. */
export const tdMoneyDiscountClass =
  "font-numeric text-sm font-medium tabular-nums tracking-tight text-amber-700"

/** IVA u otros impuestos. */
export const tdMoneyVatClass =
  "font-numeric text-sm font-medium tabular-nums tracking-tight text-sky-700"

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
