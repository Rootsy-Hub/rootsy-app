/** Raíz y subsecciones de layouts operativos. */
export const LAYOUTS_LIBRARY_ROOT = { id: "layouts", label: "Layouts" } as const

export const LAYOUTS_LIBRARY_SUBITEMS = [
  { id: "layouts-tables", label: "Tablas" },
  { id: "layouts-blocks", label: "Bloques" },
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
      "Patrones de pantalla operativa — listados, cabeceras y pies compartidos en el POP.",
  },
  "layouts-tables": {
    id: "layouts-tables",
    title: "Tablas",
    description:
      "Anatomía del listado workspace: header nocturno, toolbar de filtros, tabla Nature y footer de paginación.",
  },
  "layouts-blocks": {
    id: "layouts-blocks",
    title: "Bloques",
    description:
      "Grid de tarjetas para entidades como cuentas de tesorería y cajas registradoras — header nocturno y cuerpo con cards responsivas.",
  },
}

export function getLayoutsPageMeta(sectionId: string): LayoutsPageMeta | undefined {
  return LAYOUTS_PAGE_META[sectionId]
}

export const LAYOUTS_RELATED_LINKS = [
  { sectionId: "colors", label: "Color", hint: "Paleta Nature y tokens semánticos." },
  { sectionId: "spacing", label: "Espaciado", hint: "Ritmo del toolbar y celdas." },
  { sectionId: "border", label: "Borde", hint: "Hairlines tierra y anillos canopy." },
  { sectionId: "buttons", label: "Botones", hint: "Acciones en toolbar y filas." },
] as const
