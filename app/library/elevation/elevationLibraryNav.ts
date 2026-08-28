/** Raíz y subsecciones de elevación — alineadas con Atlassian Elevation. */
export const ELEVATION_LIBRARY_ROOT = { id: "elevation", label: "Elevación" } as const

export const ELEVATION_LIBRARY_SUBITEMS = [
  { id: "elevation-applying", label: "Interacción" },
] as const

export const ELEVATION_LIBRARY_ITEMS = [
  ELEVATION_LIBRARY_ROOT,
  ...ELEVATION_LIBRARY_SUBITEMS,
] as const

export const ELEVATION_SECTION_IDS = ELEVATION_LIBRARY_ITEMS.map((item) => item.id)

export function isElevationLibrarySection(sectionId: string): boolean {
  return (ELEVATION_SECTION_IDS as readonly string[]).includes(sectionId)
}

export type ElevationPageMeta = {
  id: string
  title: string
  description: string
}

export const ELEVATION_PAGE_META: Record<string, ElevationPageMeta> = {
  elevation: {
    id: "elevation",
    title: "Elevación",
    description:
      "Profundidad de bruma, no de teatro. Niveles, sombras y superficies — una sombra alcanza.",
  },
  "elevation-applying": {
    id: "elevation-applying",
    title: "Interacción",
    description:
      "Tokens semánticos, z-index, hover/pressed y mapeo a componentes.",
  },
}

export function getElevationPageMeta(sectionId: string): ElevationPageMeta | undefined {
  return ELEVATION_PAGE_META[sectionId]
}

export const ELEVATION_RELATED_LINKS = [
  {
    sectionId: "elevation-applying",
    label: "Interacción",
    hint: "Z-index, tokens semánticos y componentes.",
  },
  { sectionId: "elevation", label: "Elevación", hint: "Niveles sunken → overlay." },
  { sectionId: "colors", label: "Color", hint: "Superficies y contraste en dark." },
  { sectionId: "motion", label: "Movimiento", hint: "Transiciones entre capas." },
] as const
