import { popScopedHref } from "@/lib/popRoutes"
import {
  STATISTICS_SECTIONS,
  type StatisticsSectionId,
} from "@/lib/statisticsCatalog"

export const STATISTICS_SECTION_QUERY_PARAM = "section"

const VALID_SECTION_IDS = new Set<StatisticsSectionId>(
  STATISTICS_SECTIONS.map((section) => section.id),
)

export function isStatisticsSectionId(
  value: string | null | undefined,
): value is StatisticsSectionId {
  return Boolean(value && VALID_SECTION_IDS.has(value as StatisticsSectionId))
}

export function resolveStatisticsSectionId(
  requested: string | null | undefined,
  visibleSectionIds: readonly StatisticsSectionId[],
): StatisticsSectionId {
  if (
    isStatisticsSectionId(requested) &&
    visibleSectionIds.includes(requested)
  ) {
    return requested
  }
  return visibleSectionIds[0] ?? "sales"
}

export function statisticsSectionHref(
  siteId: string,
  popId: string,
  sectionId: StatisticsSectionId,
): string {
  const base = popScopedHref(siteId, popId, "statistics")
  return `${base}?${STATISTICS_SECTION_QUERY_PARAM}=${sectionId}`
}

export function mergeStatisticsSectionQuery(
  pathname: string,
  searchParams: Pick<URLSearchParams, "toString">,
  sectionId: StatisticsSectionId,
): string {
  const next = new URLSearchParams(searchParams.toString())
  next.set(STATISTICS_SECTION_QUERY_PARAM, sectionId)
  const qs = next.toString()
  return qs ? `${pathname}?${qs}` : pathname
}
