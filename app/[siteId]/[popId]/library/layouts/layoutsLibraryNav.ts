/** Raíz y subsecciones de layouts operativos. */
export const LAYOUTS_LIBRARY_ROOT = { id: "layouts", label: "Layouts" } as const

export const LAYOUTS_LIBRARY_SUBITEMS = [
  { id: "layouts-module", label: "Módulo" },
  { id: "layouts-tables", label: "Tablas" },
  { id: "layouts-blocks", label: "Bloques" },
  { id: "layouts-operations", label: "Operaciones" },
] as const

export const LAYOUTS_LIBRARY_ITEMS = [
  LAYOUTS_LIBRARY_ROOT,
  ...LAYOUTS_LIBRARY_SUBITEMS,
] as const

export const LAYOUTS_SECTION_IDS = LAYOUTS_LIBRARY_ITEMS.map((item) => item.id)

export function isLayoutsLibrarySection(sectionId: string): boolean {
  return (LAYOUTS_SECTION_IDS as readonly string[]).includes(sectionId)
}

export type LayoutsPageMeta = {
  id: string
  title: string
  description: string
}

export const LAYOUTS_PAGE_META: Record<string, LayoutsPageMeta> = {
  layouts: {
    id: "layouts",
    title: "Layouts",
    description: "Jerarquía — módulos POP y tipos de contenido.",
  },
  "layouts-module": {
    id: "layouts-module",
    title: "Módulo",
    description: "Fondo POP · header h-17 · row contenido bruma.",
  },
  "layouts-tables": {
    id: "layouts-tables",
    title: "Tablas",
    description: "Contenido — filtros · tabla · paginador.",
  },
  "layouts-blocks": {
    id: "layouts-blocks",
    title: "Bloques",
    description: "Contenido — grid de tarjetas.",
  },
  "layouts-operations": {
    id: "layouts-operations",
    title: "Operaciones",
    description: "Contenido — split canvas + resumen.",
  },
}

export function getLayoutsPageMeta(sectionId: string): LayoutsPageMeta | undefined {
  return LAYOUTS_PAGE_META[sectionId]
}

export function layoutsOperationsPreviewHref(siteId: string, popId: string): string {
  return `/${siteId}/${popId}/library/layouts-operations-preview`
}

export const LAYOUTS_RELATED_LINKS = [
  { sectionId: "colors-new", label: "Color", hint: "Sombra · bruma · savia." },
  { sectionId: "elevation", label: "Elevación", hint: "Superficies del contenido." },
  { sectionId: "spacing", label: "Espaciado", hint: "Toolbar · filas · cards." },
  { sectionId: "layouts-module", label: "Módulo", hint: "Shell padre." },
] as const
