/** Design System v2 — ruta y navegación. No pisa el sistema de diseño v1. */

export const HANDBOOK_V2_ROOT = "/handbook/v2"
export const HANDBOOK_V2_BACK_HREF = "/handbook/producto"
export const DEFAULT_HANDBOOK_V2_PAGE = "overview"

export type HandbookV2NavPage = {
  id: string
  label: string
}

export type HandbookV2NavGroup = {
  id: string
  label: string
  items: HandbookV2NavPage[]
}

export const HANDBOOK_V2_NAV: HandbookV2NavGroup[] = [
  {
    id: "inicio",
    label: "",
    items: [{ id: "overview", label: "Visión" }],
  },
  {
    id: "marca",
    label: "Marca",
    items: [
      { id: "esencia", label: "Esencia preservada" },
      { id: "evolucion", label: "Qué evoluciona" },
    ],
  },
  {
    id: "sistema",
    label: "Sistema",
    items: [
      { id: "fundamentos", label: "Fundamentos" },
      { id: "tokens", label: "Tokens" },
      { id: "componentes", label: "Componentes" },
      { id: "patrones", label: "Patrones" },
      { id: "accesibilidad", label: "Accesibilidad" },
    ],
  },
  {
    id: "aplicacion",
    label: "Aplicación",
    items: [
      { id: "vender", label: "Vender" },
      { id: "mejoras", label: "Mejoras implementadas" },
      { id: "extension", label: "Extender el sistema" },
    ],
  },
]

export const HANDBOOK_V2_PAGES = HANDBOOK_V2_NAV.flatMap((group) => group.items)
export const HANDBOOK_V2_PAGE_IDS = HANDBOOK_V2_PAGES.map((page) => page.id)

export function isHandbookV2PageId(pageId: string): boolean {
  return HANDBOOK_V2_PAGE_IDS.includes(pageId)
}

export function isHandbookV2Path(pathname: string): boolean {
  return pathname === HANDBOOK_V2_ROOT || pathname.startsWith(`${HANDBOOK_V2_ROOT}/`)
}

export function handbookV2PageFromPath(pathname: string): string {
  if (!isHandbookV2Path(pathname)) return DEFAULT_HANDBOOK_V2_PAGE
  const rest = pathname.slice(HANDBOOK_V2_ROOT.length).replace(/^\//, "")
  if (!rest) return DEFAULT_HANDBOOK_V2_PAGE
  const raw = rest.split("/")[0] ?? DEFAULT_HANDBOOK_V2_PAGE
  return isHandbookV2PageId(raw) ? raw : DEFAULT_HANDBOOK_V2_PAGE
}

export function handbookV2Href(pageId: string): string {
  if (pageId === DEFAULT_HANDBOOK_V2_PAGE) return HANDBOOK_V2_ROOT
  return `${HANDBOOK_V2_ROOT}/${pageId}`
}

export function getHandbookV2Page(pageId: string): HandbookV2NavPage | undefined {
  return HANDBOOK_V2_PAGES.find((page) => page.id === pageId)
}

export function getHandbookV2NavGroup(pageId: string): HandbookV2NavGroup | undefined {
  return HANDBOOK_V2_NAV.find((group) => group.items.some((item) => item.id === pageId))
}
