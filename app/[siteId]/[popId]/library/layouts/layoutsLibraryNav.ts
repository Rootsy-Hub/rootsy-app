/** Raíz y subsecciones de layouts operativos. */
export const LAYOUTS_LIBRARY_ROOT = { id: "layouts", label: "Layouts" } as const

export const LAYOUTS_LIBRARY_SUBITEMS = [
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
    description:
      "Patrones de pantalla operativa — pocos datos bien presentados, shell compartido y split POS.",
  },
  "layouts-tables": {
    id: "layouts-tables",
    title: "Tablas",
    description:
      "Listados densos — header sombra, toolbar de filtros, tabla Nature y footer de paginación.",
  },
  "layouts-blocks": {
    id: "layouts-blocks",
    title: "Bloques",
    description:
      "Grid de tarjetas para cuentas y cajas — mismo shell, cards con elevación interactiva.",
  },
  "layouts-operations": {
    id: "layouts-operations",
    title: "Operaciones",
    description:
      "Flujo en vivo — canvas nocturno fluido + panel de resumen fijo (~380px). Mesas, mostrador y compras.",
  },
}

export function getLayoutsPageMeta(sectionId: string): LayoutsPageMeta | undefined {
  return LAYOUTS_PAGE_META[sectionId]
}

export function layoutsOperationsPreviewHref(siteId: string, popId: string): string {
  return `/${siteId}/${popId}/library/layouts-operations-preview`
}

export const LAYOUTS_RELATED_LINKS = [
  { sectionId: "colors", label: "Color", hint: "Paleta Nature y tokens semánticos." },
  { sectionId: "spacing", label: "Espaciado", hint: "Ritmo del toolbar y celdas." },
  { sectionId: "border", label: "Borde", hint: "Hairlines bruma y anillos savia." },
  { sectionId: "buttons", label: "Botones", hint: "Acciones en toolbar y filas." },
] as const
