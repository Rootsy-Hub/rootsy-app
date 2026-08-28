import {
  dataWorkspaceBlocksSplitGridClass,
  dataWorkspaceBlocksSplitPaneBodyGridClass,
  dataWorkspaceBlocksSplitPaneClass,
  dataWorkspaceBlocksSplitPaneRuleClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import { cn } from "@/lib/utils"

/** En mobile el pane mide su contenido; no se achica dentro del grid del viewport. */
const hrMobilePaneFlowClass =
  "max-lg:h-auto max-lg:min-h-[max-content] max-lg:self-start"

/** Split de Personal — filas al contenido en mobile; desktop igual que el token 9/3. */
export const hrSplitGridClass = cn(
  dataWorkspaceBlocksSplitGridClass,
  "max-lg:auto-rows-max",
)

/** Personas — 9 cols en desktop; en mobile el bloque crece con las cards. */
export const hrPeoplePaneClass = cn(
  dataWorkspaceBlocksSplitPaneClass,
  hrMobilePaneFlowClass,
  "lg:col-span-9 max-lg:pb-6",
)

/** Roles — 3 cols en desktop; en mobile va debajo, sin pisar personas. */
export const hrRolesPaneClass = cn(
  dataWorkspaceBlocksSplitPaneClass,
  dataWorkspaceBlocksSplitPaneRuleClass,
  hrMobilePaneFlowClass,
  "lg:col-span-3 max-lg:z-0 max-lg:pt-6 max-lg:pb-[max(1.5rem,env(safe-area-inset-bottom))]",
)

/**
 * El segmento queda fijo al scrollear personas (mobile/tablet).
 * El padding inferior es el aire respecto de las cards (el gap no viaja con sticky).
 * En desktop `contents` — el gap de la sección sigue separando tabs y cards.
 */
export const hrPeopleFilterShellClass = cn(
  "lg:contents",
  "max-lg:sticky max-lg:top-0 max-lg:z-20",
  "max-lg:-mx-4 max-lg:px-4 max-lg:pt-2 max-lg:pb-5",
  "max-lg:bg-[color-mix(in_srgb,var(--rootsy-blanco)_92%,transparent)]",
  "max-lg:backdrop-blur-[8px]",
)

export const hrPeopleFilterFieldClass =
  "[&>span:first-child]:sr-only max-lg:min-w-0"

export const hrPeopleFilterGroupClass =
  "border-0 max-lg:overscroll-x-contain"

/** Lista de roles a 2 cols en tablet apilado; 1 col en el rail desktop. */
export const hrRolesBodyGridClass = cn(
  dataWorkspaceBlocksSplitPaneBodyGridClass,
  "sm:max-lg:grid-cols-2",
)

export const hrRolesOperativeSpanClass = "sm:max-lg:col-span-2"

/** Pie de card en mobile: puede crecer si el CUIL o el CTA aprietan. */
export const hrPersonCardFooterClass = cn(
  "max-sm:h-auto max-sm:min-h-[4.75rem] max-sm:py-3",
)
