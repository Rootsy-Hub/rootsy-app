import {
  dataWorkspaceBlocksSectionDescriptionClass,
  dataWorkspaceBlocksSectionTitleClass,
  dataWorkspaceDetailEmptyStateDescriptionClass,
  dataWorkspaceEntityCardEyebrowClass,
  dataWorkspaceEntityCardLosetaSurfaceClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import {
  libraryScrollLightClass,
} from "@/app/library/libraryColorTheme"
import { cn } from "@/lib/utils"

/** Loseta layout · bloques (library) — radius xxlarge · elevation raised. */
export const statisticsLosetaCardClass = cn(
  dataWorkspaceEntityCardLosetaSurfaceClass,
  "h-auto w-full min-h-0",
)

/** Rail lateral — valle light; chips en mobile, sidecar en desktop. */
export const statisticsNavAsideClass = [
  "statistics-nav-aside rootsy-app-light flex shrink-0 flex-col overflow-hidden",
  "border-b border-[var(--rootsy-bruma-200)] bg-[var(--rootsy-bruma-50)]",
  "lg:min-h-0 lg:h-auto lg:w-64 lg:shrink-0 lg:border-b-0 lg:border-r",
].join(" ")

export const statisticsNavScrollClass = [
  "statistics-nav-scroll min-h-0 overflow-x-auto overflow-y-hidden overscroll-x-contain p-2",
  "snap-x snap-mandatory [scrollbar-width:thin]",
  "lg:min-h-0 lg:flex-1 lg:snap-none lg:overflow-x-hidden lg:overflow-y-auto lg:overscroll-x-auto lg:p-4",
  libraryScrollLightClass,
].join(" ")

/** Nav — paridad LibraryNav / BackofficeSidebar. */
export const statisticsNavShellClass =
  "library-nav statistics-nav-rail w-full min-w-0"

export const statisticsNavListClass =
  "library-nav-list statistics-nav-rail-list"

/** Chip en scroll horizontal mobile; en desktop ocupa el rail. */
export const statisticsNavItemMobileClass =
  "min-w-max shrink-0 snap-start cursor-pointer border-0 lg:min-w-0 lg:w-full"

/** Contenido principal — padding solo en el área de datos (sidebar flush izquierda). */
export const statisticsMainContentClass =
  "min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-y-contain px-3 py-4 sm:px-6 sm:py-6 lg:px-8"

export const statisticsLosetaCardBodyClass = "p-4 sm:p-5"

export const statisticsLosetaCardBodyCompactClass = "px-4 py-3 sm:px-5 sm:py-4"

/** Título principal de sección (Ventas, Compras…). */
export const statisticsSectionPageTitleClass =
  "font-canopy text-xl font-semibold tracking-tight text-[var(--rootsy-bruma-900)] sm:text-2xl"

/** Subtítulo bajo el título principal de sección (Ventas, Rentabilidad…). */
export const statisticsSectionPageSubtitleClass = cn(
  dataWorkspaceBlocksSectionDescriptionClass,
  "text-sm sm:text-[0.9375rem]",
)

/** Meta operativa bajo el título (p. ej. cierre del día operativo). */
export const statisticsSectionOperationalDayMetaClass = cn(
  statisticsSectionPageSubtitleClass,
  "flex flex-wrap items-center gap-x-1 gap-y-0.5",
)

/** Encabezado de bloque — paridad LayoutsBlocksDocSubsection / reportes. */
export function statisticsSectionHeadingClassNames() {
  return {
    title: dataWorkspaceBlocksSectionTitleClass,
    description: dataWorkspaceBlocksSectionDescriptionClass,
  }
}

/** Resumen intro del workspace. */
export const statisticsIntroTextClass = cn(
  dataWorkspaceDetailEmptyStateDescriptionClass,
  "max-w-none text-sm sm:text-[0.9375rem] sm:leading-6",
)

export const statisticsPanelNoteClass = cn(
  dataWorkspaceBlocksSectionDescriptionClass,
  "lg:max-w-xs lg:text-right",
)

export const statisticsPlannedBadgeClass = cn(
  "ml-auto shrink-0 text-[10px] font-semibold uppercase tracking-wide",
  "text-[var(--library-nav-label,var(--rootsy-bruma-400))] opacity-80",
)

export const statisticsDeltaPositiveClass =
  "font-numeric font-medium tabular-nums text-emerald-700"

export const statisticsDeltaNegativeClass =
  "font-numeric font-medium tabular-nums text-amber-700"

export const statisticsDeltaNeutralClass =
  "font-numeric font-medium tabular-nums text-rootsy-bruma-500"

export const statisticsUpcomingItemClass = cn(
  "flex items-center gap-2 rounded-xl border border-rootsy-bruma-200 bg-rootsy-bruma-100 px-3 py-2.5",
  dataWorkspaceDetailEmptyStateDescriptionClass,
  "max-w-none text-sm text-rootsy-bruma-700",
)

export const statisticsEmptyTextClass = "text-sm text-rootsy-bruma-500"

/** Área de gráfico en losetas de estadísticas (evolución, torta, etc.). */
export const statisticsChartAreaClass =
  "mt-4 h-[220px] w-full shrink-0 !aspect-auto [&_.recharts-responsive-container]:!h-full"

export const statisticsRankBadgeTopClass = cn(
  dataWorkspaceEntityCardEyebrowClass,
  "flex size-7 shrink-0 items-center justify-center rounded-full border border-[color-mix(in_srgb,var(--rootsy-savia-600)_25%,var(--rootsy-bruma-200))] bg-[color-mix(in_srgb,var(--rootsy-savia-600)_10%,white)] text-[var(--rootsy-savia-800)] normal-case tracking-normal",
)

export const statisticsRankBadgeClass =
  "flex size-7 shrink-0 items-center justify-center rounded-full bg-rootsy-bruma-100 text-xs font-semibold tabular-nums text-rootsy-bruma-700"
