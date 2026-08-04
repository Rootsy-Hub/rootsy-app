/**
 * Sistema de grilla Rootsy — fuente de verdad del design system.
 * 12 columnas en desktop · gutters/márgenes con tokens space.*
 * Referencia: Atlassian Grid — adaptado con identidad nature.
 */

export type GridBreakpoint = {
  id: string
  device: string
  viewport: string
  columns: number
  gutterToken: string
  gutterPx: number
  marginToken: string
  marginPx: number
}

export type GridType = {
  id: string
  title: string
  natureName: string
  maxWidthPx: number | null
  isDefault?: boolean
  useWhen: string
  examples: string
  dontUseFor: string
}

export type GridGuideline = {
  id: string
  title: string
  doText: string
  dontText: string
}

export const ROOTSY_GRID_MANIFESTO =
  "La grilla es el suelo del claro — donde el contenido Rootsy se planta en surcos regulares. Doce columnas en desktop dividen el horizonte; sendas entre surcos y orillas al borde dan aire sin perder alineación. Los botones y los íconos no necesitan tocarse a la grilla: respiran con tokens de espacio. Las tarjetas, tablas y formularios sí."

export const ROOTSY_GRID_PRINCIPLES = [
  {
    title: "Solo el claro principal",
    detail: "La grilla vive en el área de contenido — no en nav lateral, panel ni overlays flotantes.",
  },
  {
    title: "Contenedores a la grilla",
    detail: "Cards, tablas, formularios e imágenes top-level alinean a surcos. Adentro mandan space tokens.",
  },
  {
    title: "Viewport define breakpoint",
    detail: "El ancho del viewport — no el del main — decide cuántas columnas hay.",
  },
  {
    title: "Fixed por defecto",
    detail: "Fixed-wide (1296px) para workspace estructurado. Fluid solo cuando el contenido no tiene techo horizontal.",
  },
] as const

export const GRID_ANATOMY_PARTS = [
  {
    id: "columns",
    term: "Surcos · columnas",
    description:
      "12 partes iguales en desktop — estructura horizontal del claro. En móvil, 2; en tablet, 6.",
    natureMetaphor: "Surcos de cultivo en el prado",
  },
  {
    id: "gutters",
    term: "Senda · gutter",
    description:
      "Espacio entre surcos — separación consistente. space.150 (12px) en móvil/tablet; space.200 (16px) en desktop.",
    natureMetaphor: "Sendero entre hileras",
  },
  {
    id: "margins",
    term: "Orilla · margin",
    description:
      "Aire entre el borde del claro y el primer surco. space.200 (16px) en móvil; space.400 (32px) en desktop.",
    natureMetaphor: "Orilla del claro antes del bosque",
  },
] as const

export const ROOTSY_GRID_BREAKPOINTS: GridBreakpoint[] = [
  {
    id: "xxs",
    device: "Mobile",
    viewport: "320 – 479px",
    columns: 2,
    gutterToken: "space.150",
    gutterPx: 12,
    marginToken: "space.200",
    marginPx: 16,
  },
  {
    id: "xs",
    device: "Tablet",
    viewport: "480 – 767px",
    columns: 6,
    gutterToken: "space.150",
    gutterPx: 12,
    marginToken: "space.200",
    marginPx: 16,
  },
  {
    id: "s",
    device: "Tablet",
    viewport: "768 – 1023px",
    columns: 6,
    gutterToken: "space.150",
    gutterPx: 12,
    marginToken: "space.200",
    marginPx: 16,
  },
  {
    id: "m",
    device: "Desktop",
    viewport: "1024 – 1439px",
    columns: 12,
    gutterToken: "space.200",
    gutterPx: 16,
    marginToken: "space.400",
    marginPx: 32,
  },
  {
    id: "l",
    device: "Desktop",
    viewport: "1440 – 1767px",
    columns: 12,
    gutterToken: "space.200",
    gutterPx: 16,
    marginToken: "space.400",
    marginPx: 32,
  },
  {
    id: "xl",
    device: "Desktop",
    viewport: "1768px+",
    columns: 12,
    gutterToken: "space.200",
    gutterPx: 16,
    marginToken: "space.400",
    marginPx: 32,
  },
]

export const ROOTSY_GRID_TYPES: GridType[] = [
  {
    id: "fixed-wide",
    title: "Fixed-wide",
    natureName: "Claro amplio",
    maxWidthPx: 1296,
    isDefault: true,
    useWhen: "Contenido estructurado que no necesita ancho total — dashboards, directorios, búsqueda.",
    examples: "Workspace Rootsy, listados, librería de design system.",
    dontUseFor: "Lectura larga tipo artículo — líneas demasiado extensas.",
  },
  {
    id: "fixed-narrow",
    title: "Fixed-narrow",
    natureName: "Senda de lectura",
    maxWidthPx: 864,
    useWhen: "Lectura prolongada es la actividad principal — limitar longitud de línea.",
    examples: "Documentación, blogs, artículos editoriales.",
    dontUseFor: "Tablas anchas, grillas de dos columnas, kanban.",
  },
  {
    id: "fluid",
    title: "Fluid",
    natureName: "Río horizontal",
    maxWidthPx: null,
    useWhen: "Contenido que crece sin techo natural — tableros, lienzos, mesas de trabajo.",
    examples: "Kanban, floor plan de mesas, whiteboards.",
    dontUseFor: "Dashboards y directorios — pierden relación visual en viewports enormes.",
  },
]

export const GRID_SPAN_PRESETS = [
  { span: 12, label: "Ancho completo", usage: "Hero, tabla full-bleed dentro del claro." },
  { span: 8, label: "Centrado amplio", usage: "Formulario principal, contenido focal." },
  { span: 6, label: "Mitad", usage: "Dos columnas de cards, split 50/50." },
  { span: 4, label: "Tercio", usage: "Tres cards en fila, sidebar de contenido." },
] as const

export const GRID_ALIGNMENT_GUIDELINES: GridGuideline[] = [
  {
    id: "containers",
    title: "Contenedores top-level",
    doText: "Alinear cards, tablas, formularios e imágenes a los surcos de la grilla.",
    dontText: "Forzar botones, íconos o chips individuales a columnas — usá space tokens.",
  },
  {
    id: "inside",
    title: "Dentro del contenedor",
    doText: "Space tokens para padding interno, gaps entre campos y columnas de tabla.",
    dontText: "Anidar otra grilla de 12 columnas donde un Stack + Inline resuelve.",
  },
  {
    id: "overlays",
    title: "Overlays",
    doText: "Modales, tooltips y dropdowns flotan sobre la grilla — fuera del claro.",
    dontText: "Snap de modales a surcos del page grid — tienen su propio Box.",
  },
  {
    id: "nested",
    title: "Grillas anidadas",
    doText: "Grilla interna en cards anchas cuando el layout lo pide — con space tokens.",
    dontText: "Replicar 12 columnas dentro de cada card pequeña.",
  },
  {
    id: "overflow",
    title: "Sin desborde",
    doText: "Contenido contenido entre orillas — gutters respetados.",
    dontText: "Cards que invaden sendas o márgenes — rompe la alineación del prado.",
  },
  {
    id: "viewport",
    title: "Breakpoint por viewport",
    doText: "Medir el viewport completo al elegir xxs / xs / m / xl.",
    dontText: "Cambiar breakpoint al colapsar sidebar — el viewport no cambió.",
  },
]

export const GRID_LAYOUT_ANATOMY = {
  topNav: "Cielo · navegación superior",
  sideNav: "Bosque lateral · nav",
  main: "Claro · área con grilla",
  panel: "Claro secundario · panel",
} as const
