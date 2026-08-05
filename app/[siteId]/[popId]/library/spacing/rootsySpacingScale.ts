/**
 * Sistema de espaciado Rootsy — fuente de verdad del design system.
 * Base 8px · capas nature · primitivos Box / Inline / Stack.
 * La librería define el estándar; el producto se alinea después.
 */

export type SpacingToken = {
  id: string
  token: string
  natureName: string
  multiplier: string
  rem: string
  px: number
  range: "small" | "medium" | "large"
}

export type NatureRhythmTier = {
  id: string
  title: string
  subtitle: string
  pxRange: string
  tokenRange: string
  description: string
}

export type SpacingSemanticRole = {
  id: string
  role: string
  token: string
  px: number
  usage: string
}

export const ROOTSY_SPACING_BASE_PX = 8

export const ROOTSY_SPACING_CONCEPT = {
  title: "El bosque tiene ritmo",
  lead:
    "Rootsy respira como la naturaleza: denso donde los elementos comparten savia — ícono y texto, label y campo — y amplio donde la vista descansa en un claro. El espaciado no es decoración: es la distancia entre hojas del mismo árbol.",
  why: [
    "Naturalidad: rocío, hoja, rama, tronco, claro y horizonte — seis capas que el ojo reconoce sin manual.",
    "Simplicidad: base 8px — space.100 es el latido. Sin 7px, sin 15px, sin excepciones silenciosas.",
    "Intuitivo: lo relacionado cerca; los capítulos separados — la proximidad agrupa antes que el contorno.",
  ],
  closing:
    "Pocos datos, bien presentados — el ritmo guía la mirada como un sendero conocido, no como una rejilla arbitraria.",
} as const

export const ROOTSY_SPACING_MANIFESTO =
  "Rootsy respira como la naturaleza: denso donde los elementos comparten savia — ícono y texto, label y campo — y amplio donde la vista descansa en un claro. El espaciado no es decoración: es la distancia entre hojas del mismo árbol, entre troncos del bosque, entre el suelo y el cielo. Todo parte de 8px — la unidad mínima, como una gota de rocío."

export const ROOTSY_SPACING_PRINCIPLES = [
  {
    title: "Intuitivo · proximidad",
    detail:
      "Lo relacionado cerca — label, campo e hint en el mismo tallo; capítulos separados con claro.",
  },
  {
    title: "Simplicidad · base 8px",
    detail:
      "space.100 es el latido — todo múltiplo de 8. Tokens en código y Figma, nunca px sueltos.",
  },
  {
    title: "Naturalidad · capas nature",
    detail:
      "Rocío a horizonte — cada distancia tiene territorio; denso en savia, amplio en claros.",
  },
  {
    title: "Ritmo, no relleno",
    detail:
      "Más espacio = más separación semántica. El claro entre bloques guía la mirada.",
  },
] as const

/** Capas de ritmo — identidad Rootsy sobre la escala técnica. */
export const NATURE_RHYTHM_TIERS: NatureRhythmTier[] = [
  {
    id: "dew",
    title: "Rocío",
    subtitle: "Micro",
    pxRange: "0–6px",
    tokenRange: "space.0 → space.075",
    description: "Segmentos, switches, ícono↔texto, padding mínimo de badges.",
  },
  {
    id: "leaf",
    title: "Hoja",
    subtitle: "Base · unidad viva",
    pxRange: "8px",
    tokenRange: "space.100",
    description: "Stack label→campo→hint. Gap entre chips. Separación título↔descripción en tarjeta.",
  },
  {
    id: "branch",
    title: "Rama",
    subtitle: "Componente",
    pxRange: "12–16px",
    tokenRange: "space.150 → space.200",
    description: "Padding interno de controles. Gap entre ítems de lista. Avatar↔contenido.",
  },
  {
    id: "trunk",
    title: "Tronco",
    subtitle: "Sección",
    pxRange: "20–24px",
    tokenRange: "space.250 → space.300",
    description: "Entre grupos de campos. Padding de botones grandes. Bloques dentro de un panel.",
  },
  {
    id: "clearing",
    title: "Claro",
    subtitle: "Página",
    pxRange: "32–48px",
    tokenRange: "space.400 → space.600",
    description: "Entre secciones de una vista. Margen header↔contenido. Padding de modales.",
  },
  {
    id: "horizon",
    title: "Horizonte",
    subtitle: "Macro",
    pxRange: "64–80px",
    tokenRange: "space.800 → space.1000",
    description: "Heroes, campañas, máxima separación entre regiones de layout.",
  },
]

/** Rangos de uso — modelo Atlassian (small / medium / large). */
export const SPACING_RANGE_META = {
  small: {
    label: "Pequeño · 0–8px",
    tokenRange: "space.0 → space.100",
    description: "UI compacta: iconos, badges, celdas, padding interno de inputs.",
    examples: [
      "Gap entre ícono y texto",
      "Padding de badges e icon buttons",
      "Gap en grupos de botones",
      "Espacio vertical título ↔ descripción en tarjeta",
    ],
  },
  medium: {
    label: "Mediano · 12–24px",
    tokenRange: "space.150 → space.300",
    description: "Componentes más amplios y menos densos.",
    examples: [
      "Padding de botones",
      "Espacio avatar ↔ contenido",
      "Separación entre ítems en listas amplias",
      "Gap entre columnas de formulario",
    ],
  },
  large: {
    label: "Grande · 32–80px",
    tokenRange: "space.400 → space.1000",
    description: "Layout de página y macro-espaciado.",
    examples: [
      "Espacio entre header y contenido de página",
      "Separación entre secciones de fundamentos",
      "Alineación dentro de banners y flags",
    ],
  },
} as const

export const ROOTSY_SPACING_TOKENS: SpacingToken[] = [
  { id: "s0", token: "space.0", natureName: "—", multiplier: "0×", rem: "0rem", px: 0, range: "small" },
  { id: "s025", token: "space.025", natureName: "Rocío fino", multiplier: "0.25×", rem: "0.125rem", px: 2, range: "small" },
  { id: "s050", token: "space.050", natureName: "Rocío", multiplier: "0.5×", rem: "0.25rem", px: 4, range: "small" },
  { id: "s075", token: "space.075", natureName: "Neblina", multiplier: "0.75×", rem: "0.375rem", px: 6, range: "small" },
  { id: "s100", token: "space.100", natureName: "Hoja ★", multiplier: "1×", rem: "0.5rem", px: 8, range: "small" },
  { id: "s150", token: "space.150", natureName: "Vena", multiplier: "1.5×", rem: "0.75rem", px: 12, range: "medium" },
  { id: "s200", token: "space.200", natureName: "Rama", multiplier: "2×", rem: "1rem", px: 16, range: "medium" },
  { id: "s250", token: "space.250", natureName: "Yema", multiplier: "2.5×", rem: "1.25rem", px: 20, range: "medium" },
  { id: "s300", token: "space.300", natureName: "Tronco", multiplier: "3×", rem: "1.5rem", px: 24, range: "medium" },
  { id: "s400", token: "space.400", natureName: "Claro", multiplier: "4×", rem: "2rem", px: 32, range: "large" },
  { id: "s500", token: "space.500", natureName: "Prado", multiplier: "5×", rem: "2.5rem", px: 40, range: "large" },
  { id: "s600", token: "space.600", natureName: "Llanura", multiplier: "6×", rem: "3rem", px: 48, range: "large" },
  { id: "s800", token: "space.800", natureName: "Ladera", multiplier: "8×", rem: "4rem", px: 64, range: "large" },
  { id: "s1000", token: "space.1000", natureName: "Horizonte", multiplier: "10×", rem: "5rem", px: 80, range: "large" },
]

export const ROOTSY_NEGATIVE_SPACING_TOKENS = [
  { token: "space.negative.025", px: -2, rem: "−0.125rem" },
  { token: "space.negative.050", px: -4, rem: "−0.25rem" },
  { token: "space.negative.075", px: -6, rem: "−0.375rem" },
  { token: "space.negative.100", px: -8, rem: "−0.5rem" },
  { token: "space.negative.150", px: -12, rem: "−0.75rem" },
  { token: "space.negative.200", px: -16, rem: "−1rem" },
  { token: "space.negative.300", px: -24, rem: "−1.5rem" },
  { token: "space.negative.400", px: -32, rem: "−2rem" },
] as const

/** Roles semánticos — cómo usar cada capa (definición, no código legacy). */
export const ROOTSY_SPACING_SEMANTIC_ROLES: SpacingSemanticRole[] = [
  { id: "field-stack", role: "Stack de campo", token: "space.100", px: 8, usage: "Label → control → hint/error — un mismo tallo." },
  { id: "inline-compact", role: "Fila compacta", token: "space.050", px: 4, usage: "Chips, segmentos, íconos en grupo denso." },
  { id: "control-inset", role: "Inset de control", token: "space.150", px: 12, usage: "Padding horizontal de inputs, selects y triggers." },
  { id: "list-item", role: "Ítem de lista", token: "space.200", px: 16, usage: "Separación entre filas de tabla o cards en grilla." },
  { id: "form-section", role: "Sección de formulario", token: "space.300", px: 24, usage: "Entre grupos semánticos — datos, precios, imágenes." },
  { id: "panel-padding", role: "Padding de panel", token: "space.400", px: 32, usage: "Interior de modales, cards de librería, banners." },
  { id: "page-section", role: "Sección de página", token: "space.600", px: 48, usage: "Entre capítulos de una vista — fundamentos, listados." },
  { id: "hero-margin", role: "Margen hero", token: "space.800", px: 64, usage: "Campo visual máximo — onboarding, landing interna." },
]

export const SPACING_LAYOUT_GUIDELINES = [
  {
    id: "similarity",
    title: "Agrupar por similitud",
    doText: "Ítems del mismo tipo con el mismo gap — hojas en la misma rama.",
    dontText: "Mezclar space.100 y space.200 en una lista homogénea.",
  },
  {
    id: "proximity",
    title: "Agrupar por proximidad",
    doText: "Relacionados cerca; bloques distintos más separados — savia vs tronco.",
    dontText: "Más espacio entre label y campo que entre campo y hint.",
  },
  {
    id: "hierarchy",
    title: "Claro en el bosque",
    doText: "space.600 entre capítulos; space.100 dentro del campo — escala de importancia.",
    dontText: "Mismo gap entre título de página y entre ícono y texto.",
  },
  {
    id: "optical",
    title: "Ajuste óptico",
    doText: "Si el balance visual pide un paso, elegí el token más cercano — nunca un px suelto.",
    dontText: "Inventar 14px porque «se ve mejor» — space.150 o space.200.",
  },
] as const

export type LayoutPrimitiveId = "box" | "inline" | "stack"

export type LayoutPrimitiveMeta = {
  id: LayoutPrimitiveId
  title: string
  subtitle: string
  description: string
  figmaHint: string
}

export const LAYOUT_PRIMITIVES: LayoutPrimitiveMeta[] = [
  {
    id: "box",
    title: "Box",
    subtitle: "Superficie · corteza o tierra",
    description:
      "Contenedor genérico con padding, fondo, borde y radio. Envuelve tarjetas, paneles y regiones de página.",
    figmaHint: "Frame + padding horizontal/vertical + fill",
  },
  {
    id: "inline",
    title: "Inline",
    subtitle: "Fila · viento horizontal",
    description:
      "Hijos en línea con gap uniforme — botones de acción, chips, filtros, metadata en fila.",
    figmaHint: "Auto layout horizontal + space between items",
  },
  {
    id: "stack",
    title: "Stack",
    subtitle: "Columna · gravedad natural",
    description:
      "Hijos apilados con gap vertical — formularios, headers, secciones de documentación.",
    figmaHint: "Auto layout vertical + space between items",
  },
]
