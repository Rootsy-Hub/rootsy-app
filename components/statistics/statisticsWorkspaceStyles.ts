import {
  dataWorkspaceBlocksSectionDescriptionClass,
  dataWorkspaceBlocksSectionTitleClass,
  dataWorkspaceDetailEmptyStateDescriptionClass,
  dataWorkspaceEntityCardEyebrowClass,
  dataWorkspaceEntityCardLosetaSurfaceClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import {
  libraryNavItemActiveClass,
  libraryNavItemClass,
  libraryNavItemLabelClass,
  libraryNavSurfaceLightClass,
} from "@/app/library/libraryColorTheme"
import { cn } from "@/lib/utils"

/** Loseta layout · bloques (library) — radius xxlarge · elevation raised. */
export const statisticsLosetaCardClass = cn(
  dataWorkspaceEntityCardLosetaSurfaceClass,
  "h-auto w-full min-h-0",
)

export const statisticsLosetaCardBodyClass = "p-4 sm:p-5"

export const statisticsLosetaCardBodyCompactClass = "px-5 py-4"

/** Encabezado de bloque — paridad LayoutsBlocksDocSubsection / reportes. */
export function statisticsSectionHeadingClassNames() {
  return {
    title: dataWorkspaceBlocksSectionTitleClass,
    description: dataWorkspaceBlocksSectionDescriptionClass,
  }
}

/** Resumen intro — paridad ReportHubCategoryLegend. */
export const statisticsIntroTextClass = cn(
  dataWorkspaceDetailEmptyStateDescriptionClass,
  "max-w-none text-sm sm:text-[0.9375rem] sm:leading-6",
)

export const statisticsPanelNoteClass = cn(
  dataWorkspaceBlocksSectionDescriptionClass,
  "lg:max-w-xs lg:text-right",
)

/** Nav lateral — tokens library-nav en superficie clara. */
export const statisticsNavSurfaceClass = cn(
  libraryNavSurfaceLightClass,
  "library-nav statistics-section-nav",
)

export const statisticsNavItemClass = cn(
  libraryNavItemClass,
  "group min-w-[8.5rem] shrink-0 lg:min-w-0",
)

export const statisticsNavItemActiveClass = libraryNavItemActiveClass

export const statisticsNavIconWrapClass = cn(
  "flex size-7 shrink-0 items-center justify-center rounded-lg border border-[var(--rootsy-bruma-200)] bg-white text-[var(--rootsy-bruma-500)] transition-colors",
  "[&_svg]:size-3.5",
  "group-hover:border-[var(--rootsy-bruma-300)] group-hover:bg-[var(--rootsy-bruma-50)] group-hover:text-[var(--rootsy-bruma-700)]",
)

export const statisticsNavIconWrapActiveClass = cn(
  "border-[color-mix(in_srgb,var(--rootsy-savia-600)_28%,var(--rootsy-bruma-200))]",
  "bg-[color-mix(in_srgb,var(--rootsy-savia-600)_14%,white)] text-[var(--rootsy-savia-700)]",
  "group-hover:border-[color-mix(in_srgb,var(--rootsy-savia-600)_34%,var(--rootsy-bruma-200))]",
  "group-hover:bg-[color-mix(in_srgb,var(--rootsy-savia-600)_16%,white)] group-hover:text-[var(--rootsy-savia-800)]",
)

export const statisticsNavLabelClass = cn(
  libraryNavItemLabelClass,
  "font-canopy text-[13px] font-medium leading-tight text-[var(--rootsy-bruma-600)] transition-colors",
  "group-hover:text-[var(--rootsy-bruma-900)]",
)

export const statisticsNavLabelActiveClass =
  "font-semibold text-[var(--rootsy-bruma-900)] group-hover:text-[var(--rootsy-bruma-900)]"

export const statisticsPlannedBadgeClass =
  "ml-auto shrink-0 rounded-full border border-rootsy-bruma-200 bg-rootsy-bruma-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-rootsy-bruma-500"

export const statisticsDeltaPositiveClass =
  "font-numeric font-medium tabular-nums text-emerald-700"

export const statisticsDeltaNegativeClass =
  "font-numeric font-medium tabular-nums text-amber-700"

export const statisticsUpcomingItemClass = cn(
  "flex items-center gap-2 rounded-xl border border-rootsy-bruma-200 bg-rootsy-bruma-100 px-3 py-2.5",
  dataWorkspaceDetailEmptyStateDescriptionClass,
  "max-w-none text-sm text-rootsy-bruma-700",
)

export const statisticsEmptyTextClass = "text-sm text-rootsy-bruma-500"

export const statisticsRankBadgeTopClass = cn(
  dataWorkspaceEntityCardEyebrowClass,
  "flex size-7 shrink-0 items-center justify-center rounded-full border border-[color-mix(in_srgb,var(--rootsy-savia-600)_25%,var(--rootsy-bruma-200))] bg-[color-mix(in_srgb,var(--rootsy-savia-600)_10%,white)] text-[var(--rootsy-savia-800)] normal-case tracking-normal",
)

export const statisticsRankBadgeClass =
  "flex size-7 shrink-0 items-center justify-center rounded-full bg-rootsy-bruma-100 text-xs font-semibold tabular-nums text-rootsy-bruma-700"
