/** Raíz y subsecciones de espaciado. */
export const SPACING_LIBRARY_ROOT = { id: "spacing", label: "Espaciado" } as const

export const SPACING_LIBRARY_SUBITEMS = [
  { id: "spacing-primitives", label: "Primitivos de layout" },
] as const

export const SPACING_LIBRARY_ITEMS = [
  SPACING_LIBRARY_ROOT,
  ...SPACING_LIBRARY_SUBITEMS,
] as const

export const SPACING_SECTION_IDS = SPACING_LIBRARY_ITEMS.map((item) => item.id)

export function isSpacingLibrarySection(sectionId: string): boolean {
  return (SPACING_SECTION_IDS as readonly string[]).includes(sectionId)
}

export type SpacingPageMeta = {
  id: string
  title: string
  description: string
}

export const SPACING_PAGE_META: Record<string, SpacingPageMeta> = {
  spacing: {
    id: "spacing",
    title: "Espaciado",
    description:
      "Rocío, hoja, rama, tronco, claro y horizonte — ritmo nature sobre base 8px.",
  },
  "spacing-primitives": {
    id: "spacing-primitives",
    title: "Primitivos de layout",
    description:
      "Box, Inline y Stack — composición con tokens, no píxeles sueltos.",
  },
}

export function getSpacingPageMeta(sectionId: string): SpacingPageMeta | undefined {
  return SPACING_PAGE_META[sectionId]
}

export const SPACING_RELATED_LINKS = [
  {
    sectionId: "spacing-primitives",
    label: "Primitivos de layout",
    hint: "Box, Inline y Stack en acción.",
  },
  {
    sectionId: "spacing",
    label: "Espaciado",
    hint: "Escala, tokens y guías de uso.",
  },
] as const
