/** Raíz y subsecciones de grilla. */
export const GRID_LIBRARY_ROOT = { id: "grid", label: "Layout" } as const

export const GRID_LIBRARY_SUBITEMS = [
  { id: "grid-responsive", label: "Breakpoints" },
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
    title: "Layout",
    description:
      "Grillas, contenedores y breakpoints. Doce surcos en desktop, seis en tablet, dos en móvil.",
  },
  "grid-responsive": {
    id: "grid-responsive",
    title: "Breakpoints",
    description:
      "12 · 6 · 2. Fixed-wide por defecto. Fluid solo cuando el contenido no tiene techo.",
  },
}

export function getGridPageMeta(sectionId: string): GridPageMeta | undefined {
  return GRID_PAGE_META[sectionId]
}

export const GRID_RELATED_LINKS = [
  {
    sectionId: "grid-responsive",
    label: "Breakpoints",
    hint: "Viewport, columnas, fixed vs fluid.",
  },
  {
    sectionId: "grid",
    label: "Layout",
    hint: "Grillas, contenedores y alineación.",
  },
  {
    sectionId: "spacing",
    label: "Espaciado",
    hint: "Tokens dentro de contenedores.",
  },
  {
    sectionId: "spacing-primitives",
    label: "Proporciones",
    hint: "Box, Inline y Stack en código.",
  },
] as const
