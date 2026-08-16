import {
  POP_SETTINGS_SECTIONS,
  type PopSettingsSectionId,
} from "@/lib/popSettingsCatalog"

export const POP_SETTINGS_SECTION_QUERY_PARAM = "section"

const VALID_SECTION_IDS = new Set<PopSettingsSectionId>(
  POP_SETTINGS_SECTIONS.map((section) => section.id),
)

export function isPopSettingsSectionId(
  value: string | null | undefined,
): value is PopSettingsSectionId {
  return Boolean(value && VALID_SECTION_IDS.has(value as PopSettingsSectionId))
}

export function resolvePopSettingsSectionId(
  requested: string | null | undefined,
  visibleSectionIds: readonly PopSettingsSectionId[],
): PopSettingsSectionId {
  if (
    isPopSettingsSectionId(requested) &&
    visibleSectionIds.includes(requested)
  ) {
    return requested
  }
  return visibleSectionIds[0] ?? "business"
}

export function mergePopSettingsSectionQuery(
  pathname: string,
  searchParams: Pick<URLSearchParams, "toString">,
  sectionId: PopSettingsSectionId,
): string {
  const next = new URLSearchParams(searchParams.toString())
  next.set(POP_SETTINGS_SECTION_QUERY_PARAM, sectionId)
  const qs = next.toString()
  return qs ? `${pathname}?${qs}` : pathname
}
