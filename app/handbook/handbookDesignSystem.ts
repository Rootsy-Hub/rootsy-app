import {
  ol,
  p,
  ul,
  type HandbookBlock,
  type HandbookSectionMeta,
  type HandbookTopic,
} from "@/app/handbook/handbookSections"

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

function heading(
  title: string,
  nestedOrContent?: HandbookTopic[] | { blocks: HandbookBlock[]; topics?: HandbookTopic[] },
): HandbookTopic {
  if (Array.isArray(nestedOrContent) || nestedOrContent == null) {
    return {
      id: slug(title),
      title,
      topics: nestedOrContent,
    }
  }

  return {
    id: slug(title),
    title,
    blocks: nestedOrContent.blocks,
    topics: nestedOrContent.topics,
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
          heading("Propósito", {
            blocks: [
              p("El sistema de diseño de Rootsy existe para convertir el mundo de Rootsy en una experiencia digital coherente, clara y escalable."),
              p("Su función es asegurar que cada módulo, pantalla y plataforma se sienta parte del mismo sistema: simple de entender, veloz de usar y capaz de acompañar operaciones cada vez más complejas sin perder naturalidad."),
            ],
          }),
          heading("Principios", {
            blocks: [
              ul([
                "Naturalidad: cada elemento debe sentirse obvio y reconocible desde el primer contacto.",
                "Simplicidad: priorizar jerarquías claras, pocos elementos y decisiones visuales con función.",
                "Claridad: ayudar a entender qué está pasando, qué requiere atención y cuál es el próximo paso.",
                "Profundidad progresiva: mostrar una superficie simple y habilitar complejidad solo cuando el negocio la necesita.",
                "Movimiento funcional: usar transiciones y estados para explicar actividad, cambios y continuidad; nunca como adorno.",
                "Presencia sutil de Rootsy: Rootsy se hace visible cuando aporta guía, contexto o confianza, sin invadir la operación cotidiana.",
                "Coherencia del mundo: las atmósferas definen el contexto visual; los colores funcionales definen acciones, estados y prioridades.",
              ]),
            ],
          }),
          heading("Cómo usar el sistema", {
            blocks: [
              ol([
                "Empezar por las foundations: color, tipografía, espaciado, superficies, layout, elevación, borde, radios, iconografía, movimiento y logotipos.",
                "Usar componentes existentes antes de crear soluciones nuevas.",
                "Aplicar patrones definidos para flujos repetidos, como tablas, formularios, operaciones, alertas y estados.",
                "Mantener los mensajes funcionales claros y dejar que Rootsy hable cuando necesite orientar, explicar o recomendar.",
                "Elegir la atmósfera adecuada para el contexto de la pantalla y usar colores funcionales para comunicar qué está ocurriendo.",
                "Documentar, revisar y sumar al sistema cualquier componente o patrón nuevo antes de reutilizarlo.",
              ]),
            ],
          }),
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
            heading("Éter"),
            heading("Bruma"),
            heading("Blanco"),
            heading("Sombra"),
            heading("Sotobosque"),
          ]),
          heading("Colores funcionales", [
            heading("Savia"),
            heading("Cielo de día"),
            heading("Sol"),
            heading("Lava"),
          ]),
          heading("Tokens de color", [
            heading("Funcionales en atmósferas"),
          ]),
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
        id: "superficies-y-profundidad",
        label: "Superficies y profundidad",
        topics: [
          heading("Fondos", [
            heading("Lienzo plano"),
            heading("Lienzo de bloques"),
          ]),
          heading("Capas"),
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
        id: "elevacion",
        label: "Elevación",
        topics: [
          heading("Niveles"),
          heading("Sombras"),
          heading("Superficies"),
          heading("Interacción"),
        ],
      },
      {
        id: "borde",
        label: "Borde",
        topics: [
          heading("Anchos"),
          heading("Colores"),
          heading("Estados"),
        ],
      },
      {
        id: "radios",
        label: "Radios",
        topics: [
          heading("Escala"),
          heading("Uso"),
          heading("Focus"),
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
      {
        id: "logotipos",
        label: "Logotipos",
        topics: [
          heading("Anatomía"),
          heading("Rootsy"),
          heading("POP"),
          heading("Persona"),
          heading("Uso"),
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
  const raw = rest.split("/")[0] ?? DEFAULT_HANDBOOK_DESIGN_SYSTEM_PAGE
  return handbookDesignSystemCanonicalPageId(raw)
}

/** Las URLs `*-final` de Componentes redirigen al id canónico. */
export function handbookDesignSystemCanonicalPageId(pageId: string): string {
  if (!pageId.endsWith("-final")) return pageId
  const base = pageId.slice(0, -"-final".length)
  return isHandbookDesignSystemPageId(base) ? base : pageId
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
