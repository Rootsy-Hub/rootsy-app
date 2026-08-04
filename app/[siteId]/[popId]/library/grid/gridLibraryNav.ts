/** Raíz y subsecciones de grilla. */
export const GRID_LIBRARY_ROOT = { id: "grid", label: "Grilla" } as const

export const GRID_LIBRARY_SUBITEMS = [
  { id: "grid-responsive", label: "Breakpoints y tipos" },
] as const

export const GRID_LIBRARY_ITEMS = [GRID_LIBRARY_ROOT, ...GRID_LIBRARY_SUBITEMS] as const

export const GRID_SECTION_IDS = GRID_LIBRARY_ITEMS.map((item) => item.id)

export function isGridLibrarySection(sectionId: string): boolean {
  return (GRID_SECTION_IDS as readonly string[]).includes(sectionId)
}

export type GridPageMeta = {
  id: string
  title: string
  description: string
}

export const GRID_PAGE_META: Record<string, GridPageMeta> = {
  grid: {
    id: "grid",
    title: "Grilla",
    description:
      "Surcos, sendas y orillas — estructura horizontal del claro principal donde vive el contenido Rootsy.",
  },
  "grid-responsive": {
    id: "grid-responsive",
    title: "Breakpoints y tipos",
    description:
      "De bosque denso en móvil a pradera de 12 columnas en desktop — fixed-wide, narrow y fluid.",
  },
}

export function getGridPageMeta(sectionId: string): GridPageMeta | undefined {
  return GRID_PAGE_META[sectionId]
}

export const GRID_RELATED_LINKS = [
  {
    sectionId: "grid-responsive",
    label: "Breakpoints y tipos",
    hint: "Viewport, columnas, fixed vs fluid.",
  },
  {
    sectionId: "grid",
    label: "Grilla",
    hint: "Anatomía, alineación y grillas anidadas.",
  },
  {
    sectionId: "spacing",
    label: "Espaciado",
    hint: "Tokens dentro de contenedores.",
  },
  {
    sectionId: "spacing-primitives",
    label: "Primitivos de layout",
    hint: "Box, Inline y Stack en código.",
  },
] as const
