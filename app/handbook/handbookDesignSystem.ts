import type { HandbookSectionMeta, HandbookTopic } from "@/app/handbook/handbookSections"

export const HANDBOOK_DESIGN_SYSTEM_ROOT = "/handbook/sistema-de-diseno"
export const HANDBOOK_DESIGN_SYSTEM_BACK_HREF = "/handbook/producto"
export const DEFAULT_HANDBOOK_DESIGN_SYSTEM_PAGE = "overview"

function slug(title: string): string {
  return title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

function heading(title: string, nested?: HandbookTopic[]): HandbookTopic {
  return {
    id: slug(title),
    title,
    topics: nested,
  }
}

export type HandbookDesignSystemNavPage = {
  id: string
  label: string
  topics: HandbookTopic[]
}

export type HandbookDesignSystemNavGroup = {
  id: string
  label: string
  items: HandbookDesignSystemNavPage[]
}

export const HANDBOOK_DESIGN_SYSTEM_NAV: HandbookDesignSystemNavGroup[] = [
  {
    id: "inicio",
    label: "",
    items: [
      {
        id: "overview",
        label: "Overview",
        topics: [
          heading("Propósito"),
          heading("Principios"),
          heading("Cómo usar el sistema"),
          heading("Changelog"),
        ],
      },
    ],
  },
  {
    id: "foundations",
    label: "Foundations",
    items: [
      {
        id: "color",
        label: "Color",
        topics: [
          heading("Atmósferas del mundo", [
            heading("Bruma"),
            heading("Cielo nocturno"),
            heading("Suelo"),
            heading("Alba"),
          ]),
          heading("Colores funcionales", [
            heading("Savia"),
            heading("Cielo vivo"),
            heading("Sol"),
            heading("Arcilla"),
          ]),
          heading("Tokens de color"),
          heading("Contraste y legibilidad"),
        ],
      },
      {
        id: "tipografia",
        label: "Tipografía",
        topics: [
          heading("Familias tipográficas"),
          heading("Escalas"),
          heading("Jerarquías"),
          heading("Pesos"),
          heading("Uso editorial"),
        ],
      },
      {
        id: "espaciado-y-proporciones",
        label: "Espaciado y proporciones",
        topics: [
          heading("Escala de espaciado"),
          heading("Tamaños"),
          heading("Densidad"),
          heading("Proporciones"),
        ],
      },
      {
        id: "layout",
        label: "Layout",
        topics: [
          heading("Grillas"),
          heading("Contenedores"),
          heading("Breakpoints"),
          heading("Responsive"),
        ],
      },
      {
        id: "superficies-y-profundidad",
        label: "Superficies y profundidad",
        topics: [
          heading("Fondos"),
          heading("Bordes"),
          heading("Radio"),
          heading("Elevación"),
          heading("Capas"),
        ],
      },
      {
        id: "iconografia",
        label: "Iconografía",
        topics: [
          heading("Estilo"),
          heading("Tamaños"),
          heading("Uso"),
          heading("Estados"),
        ],
      },
      {
        id: "movimiento",
        label: "Movimiento",
        topics: [
          heading("Principios de movimiento"),
          heading("Duraciones"),
          heading("Curvas"),
          heading("Transiciones"),
          heading("Estados de carga"),
        ],
      },
    ],
  },
  {
    id: "componentes",
    label: "Componentes",
    items: [
      {
        id: "navegacion",
        label: "Navegación",
        topics: [
          heading("Header"),
          heading("Sidebar"),
          heading("Menús"),
          heading("Tabs"),
          heading("Breadcrumbs"),
          heading("Paginación"),
        ],
      },
      {
        id: "acciones",
        label: "Acciones",
        topics: [
          heading("Botones"),
          heading("Botones de icono"),
          heading("Menús de acciones"),
          heading("Tooltips"),
        ],
      },
      {
        id: "formularios",
        label: "Formularios",
        topics: [
          heading("Inputs"),
          heading("Selects"),
          heading("Checkboxes"),
          heading("Radios"),
          heading("Switches"),
          heading("Date pickers"),
          heading("Validación"),
        ],
      },
      {
        id: "datos",
        label: "Datos",
        topics: [
          heading("Tablas"),
          heading("Cards"),
          heading("Listas"),
          heading("Badges"),
          heading("Métricas"),
          heading("Gráficos"),
          heading("Estados de stock"),
        ],
      },
      {
        id: "feedback",
        label: "Feedback",
        topics: [
          heading("Toasts"),
          heading("Alertas"),
          heading("Banners"),
          heading("Modals"),
          heading("Confirmaciones"),
          heading("Errores"),
          heading("Estados de carga"),
          heading("Empty states"),
        ],
      },
      {
        id: "overlays",
        label: "Overlays",
        topics: [
          heading("Dropdowns"),
          heading("Popovers"),
          heading("Drawers"),
          heading("Dialogs"),
          heading("Toolboxes"),
        ],
      },
    ],
  },
  {
    id: "guia",
    label: "",
    items: [
      {
        id: "patrones",
        label: "Patrones",
        topics: [
          heading("Estructura de módulo"),
          heading("Gestión de datos"),
          heading("Tablas y filtros"),
          heading("Búsqueda"),
          heading("Creación y edición"),
          heading("Acciones masivas"),
          heading("Flujos de venta"),
          heading("Flujos de compra"),
          heading("Estados operativos"),
          heading("Permisos y accesos"),
          heading("Diseño responsive"),
        ],
      },
      {
        id: "presencia-de-rootsy",
        label: "Presencia de Rootsy",
        topics: [
          heading("Rootsy como voz de interfaz"),
          heading("Avisos generales del negocio"),
          heading("Avisos contextuales de módulo"),
          heading("Consejos y recomendaciones"),
          heading("Seguimiento de mejoras"),
          heading("Señales sutiles de actividad"),
        ],
      },
      {
        id: "accesibilidad",
        label: "Accesibilidad",
        topics: [
          heading("Contraste"),
          heading("Navegación por teclado"),
          heading("Foco"),
          heading("Lectores de pantalla"),
          heading("Tamaños táctiles"),
          heading("Movimiento reducido"),
        ],
      },
      {
        id: "contenido-de-interfaz",
        label: "Contenido de interfaz",
        topics: [
          heading("Voz y tono"),
          heading("Mensajes funcionales"),
          heading("Mensajes de Rootsy"),
          heading("Errores"),
          heading("Confirmaciones"),
          heading("Empty states"),
          heading("Recomendaciones"),
        ],
      },
      {
        id: "contribuciones",
        label: "Contribuciones",
        topics: [
          heading("Uso de componentes"),
          heading("Solicitud de componentes"),
          heading("Cambios y deprecaciones"),
          heading("Revisión"),
          heading("Versionado"),
        ],
      },
    ],
  },
]

export const HANDBOOK_DESIGN_SYSTEM_PAGES: HandbookDesignSystemNavPage[] =
  HANDBOOK_DESIGN_SYSTEM_NAV.flatMap((group) => group.items)

export const HANDBOOK_DESIGN_SYSTEM_PAGE_IDS = HANDBOOK_DESIGN_SYSTEM_PAGES.map(
  (page) => page.id,
)

export function isHandbookDesignSystemPageId(pageId: string): boolean {
  return HANDBOOK_DESIGN_SYSTEM_PAGE_IDS.includes(pageId)
}

export function isHandbookDesignSystemPath(pathname: string): boolean {
  return (
    pathname === HANDBOOK_DESIGN_SYSTEM_ROOT ||
    pathname.startsWith(`${HANDBOOK_DESIGN_SYSTEM_ROOT}/`)
  )
}

export function handbookDesignSystemPageFromPath(pathname: string): string {
  if (!isHandbookDesignSystemPath(pathname)) {
    return DEFAULT_HANDBOOK_DESIGN_SYSTEM_PAGE
  }
  const rest = pathname.slice(HANDBOOK_DESIGN_SYSTEM_ROOT.length).replace(/^\//, "")
  if (!rest) return DEFAULT_HANDBOOK_DESIGN_SYSTEM_PAGE
  return rest.split("/")[0] ?? DEFAULT_HANDBOOK_DESIGN_SYSTEM_PAGE
}

export function handbookDesignSystemHref(pageId: string): string {
  if (pageId === DEFAULT_HANDBOOK_DESIGN_SYSTEM_PAGE) {
    return HANDBOOK_DESIGN_SYSTEM_ROOT
  }
  return `${HANDBOOK_DESIGN_SYSTEM_ROOT}/${pageId}`
}

export function handbookDesignSystemTopicHref(pageId: string, topicId: string): string {
  return `${handbookDesignSystemHref(pageId)}#${topicId}`
}

export function getHandbookDesignSystemPage(
  pageId: string,
): HandbookDesignSystemNavPage | undefined {
  return HANDBOOK_DESIGN_SYSTEM_PAGES.find((page) => page.id === pageId)
}

export function getHandbookDesignSystemNavGroup(
  pageId: string,
): HandbookDesignSystemNavGroup | undefined {
  return HANDBOOK_DESIGN_SYSTEM_NAV.find((group) =>
    group.items.some((item) => item.id === pageId),
  )
}

export function getHandbookDesignSystemPageMeta(
  pageId: string,
): HandbookSectionMeta | undefined {
  const page = getHandbookDesignSystemPage(pageId)
  if (!page) return undefined
  return {
    id: page.id,
    title: page.label,
    topics: page.topics,
  }
}
