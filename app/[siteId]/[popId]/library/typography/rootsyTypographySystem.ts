/**
 * Sistema tipográfico Rootsy — fuente de verdad del design system.
 * UI (Nunito Sans) · Lectura (Source Sans 3) · Números (Inter)
 * Escala minor third · base 16px · unidades rem.
 */

export type TypographyStyle = {
  id: string
  token: string
  category: "heading" | "body" | "metric" | "code"
  preview: string
  fontFamily: "ui" | "reading" | "numeric" | "code"
  fontWeight: number
  fontWeightLabel: string
  fontSizeRem: string
  fontSizePx: number
  lineHeightRem: string
  lineHeightPx: number
  paragraphSpacingPx?: number
  usage: string
}

export type RootsyTypeface = {
  id: string
  label: string
  family: string
  cssVar: string
  role: string
  description: string
  sample: string
}

export const ROOTSY_TYPOGRAPHY_MANIFESTO =
  "La tipografía de Rootsy se lee sin esfuerzo: tamaños con ritmo natural, pesos con intención clara y tres voces que hacen una sola cosa cada una. El texto guía — no compite con la interfaz."

export const ROOTSY_TYPOGRAPHY_PRINCIPLES = [
  {
    title: "Se lee solo",
    detail:
      "Jerarquía obvia: título, contexto, cuerpo, dato. Sin saltos de tamaño ni pesos al azar.",
  },
  {
    title: "Tres voces",
    detail:
      "UI en pantallas, lectura en prosa, números en montos — cada fuente en su lugar.",
  },
  {
    title: "Pocos tamaños",
    detail:
      "Escala acotada sobre 16px. Si dudás, subí o bajá un nivel — no inventes valores sueltos.",
  },
] as const

export type RootsyTypefaceSpec = RootsyTypeface & {
  tokenRole: string
  weights: string[]
  features: string[]
}

export const ROOTSY_TYPEFACE_SPECS: RootsyTypefaceSpec[] = [
  {
    id: "ui",
    label: "UI",
    family: "Nunito Sans",
    cssVar: "--font-nunito-sans",
    tokenRole: "font.sans",
    role: "Headings y body de componentes — UI principal.",
    description: "Redondeada y clara — la voz principal del producto.",
    sample: "Confirmar venta",
    weights: ["400 Regular", "500 Medium", "600 Semibold", "700 Bold", "800 ExtraBold"],
    features: ["UI optimizada", "Headings y labels", "Botones y formularios"],
  },
  {
    id: "reading",
    label: "Lectura",
    family: "Source Sans 3",
    cssVar: "--font-source-sans",
    tokenRole: "font.secondary",
    role: "Prosa, artículos y descripciones largas.",
    description: "Fluida en bloques de texto — cómoda para leer de corrido.",
    sample: "Rootsy conecta inventario, ventas y tesorería en un solo lugar.",
    weights: ["400 Regular", "500 Medium", "600 Semibold", "700 Bold"],
    features: ["Long-form", "Documentación", "Subtítulos descriptivos"],
  },
  {
    id: "numeric",
    label: "Números",
    family: "Inter",
    cssVar: "--font-inter",
    tokenRole: "font.numeric",
    role: "Montos, cantidades, tablas numéricas y KPIs.",
    description: "Cifras tabulares alineadas — precisa sin ser fría.",
    sample: "$ 124.580,00",
    weights: ["400 Regular", "500 Medium", "600 Semibold", "700 Bold"],
    features: ["tabular-nums", "Importes y stock", "Tiles de métrica"],
  },
  {
    id: "code",
    label: "Código",
    family: "JetBrains Mono",
    cssVar: "--font-code",
    tokenRole: "font.code",
    role: "Bloques de código y snippets técnicos.",
    description: "Monoespaciada — solo en docs y referencias, no en UI general.",
    sample: "font.heading.large",
    weights: ["400 Regular", "500 Medium"],
    features: ["Code blocks", "Tokens en documentación", "No ligatures en UI"],
  },
]

export const ROOTSY_TYPEFACES: RootsyTypeface[] = ROOTSY_TYPEFACE_SPECS.map(
  ({ weights: _w, features: _f, tokenRole: _t, ...face }) => face,
)

export const TYPOGRAPHY_SCALE_SIMPLE = [
  {
    id: "page-title",
    label: "Título de página",
    sample: "Ventas de hoy",
    token: "heading.large",
    sizePx: 24,
    weight: 700,
    font: "ui" as const,
  },
  {
    id: "section-title",
    label: "Título de sección",
    sample: "Tu pedido",
    token: "heading.medium",
    sizePx: 20,
    weight: 700,
    font: "ui" as const,
  },
  {
    id: "body",
    label: "Texto principal",
    sample: "Medialuna clásica",
    token: "body",
    sizePx: 14,
    weight: 400,
    font: "ui" as const,
  },
  {
    id: "meta",
    label: "Metadatos",
    sample: "Panadería · x2",
    token: "body.small",
    sizePx: 12,
    weight: 400,
    font: "ui" as const,
  },
  {
    id: "metric",
    label: "Monto",
    sample: "$ 48.320",
    token: "metric.large",
    sizePx: 28,
    weight: 700,
    font: "numeric" as const,
  },
] as const

export const ROOTSY_FONT_WEIGHTS = [
  { token: "font.weight.regular", label: "Regular", value: 400, usage: "Párrafos y descripciones." },
  { token: "font.weight.medium", label: "Medium", value: 500, usage: "Texto junto a íconos." },
  { token: "font.weight.semibold", label: "Semibold", value: 600, usage: "Énfasis puntual — usar con criterio." },
  { token: "font.weight.bold", label: "Bold", value: 700, usage: "Headings y métricas destacadas." },
] as const

export const TYPOGRAPHY_APPLYING_GUIDELINES = [
  {
    id: "hierarchy",
    title: "Jerarquía",
    doText: "Un título principal por pantalla. Título → contexto → cuerpo → dato.",
    dontText: "Varios títulos del mismo peso compitiendo entre sí.",
  },
  {
    id: "numbers",
    title: "Números",
    doText: "Inter bold en el monto — texto chico normal en la etiqueta debajo.",
    dontText: "Mismo peso y tamaño en número y descripción.",
  },
  {
    id: "meta",
    title: "Metadatos",
    doText: "12px solo para hints, contadores y timestamps.",
    dontText: "Párrafos largos en tamaño chico — cuesta leerlos.",
  },
] as const

export const TYPOGRAPHY_ACCESSIBILITY_NOTES = [
  "16px para lectura prolongada — 14px es el default de componentes.",
  "12px solo en metadata — nunca en bloques de texto largo.",
  "Contraste de texto con tokens de color — mínimo WCAG AA.",
] as const

export const TYPOGRAPHY_TECHNICAL_GUIDELINES = [
  {
    id: "headings",
    title: "Headings",
    doText: "Un h1 por página · secuencia h1→h2→h3 sin saltar niveles.",
    dontText: "Bold suelto en lugar de token heading — rompe accesibilidad.",
  },
  {
    id: "body",
    title: "Body",
    doText: "font.body en componentes · font.body.large en párrafos largos.",
    dontText: "Heading token dentro de un botón — body medium/bold.",
  },
  {
    id: "metric",
    title: "Metric",
    doText: "Inter bold en el número — body.small en la etiqueta debajo.",
    dontText: "Metric en leyendas de chart o ejes — ahí body.small.",
  },
  {
    id: "icons",
    title: "Peso con íconos",
    doText: "Medium (500) cuando el texto va junto a íconos line.",
    dontText: "Regular al lado de íconos — el trazo no alinea visualmente.",
  },
  {
    id: "links",
    title: "Links",
    doText: "Tokens color.link — distinguible del texto circundante.",
    dontText: "Mismo color que párrafo sin subrayado ni peso.",
  },
  {
    id: "caps",
    title: "All caps",
    doText: "Solo acrónimos e IDs — ART-001.",
    dontText: "Palabras completas en mayúsculas — legibilidad y i18n.",
  },
] as const

export const TYPOGRAPHY_TECHNICAL_A11Y = [
  "Mínimo 16px (font.body.large) para lectura prolongada.",
  "12px (font.body.small) solo en metadata — nunca párrafos largos.",
  "Contraste de texto con tokens color — WCAG AA mínimo.",
  "Headings semánticos (h1–h6) emparejados con tokens heading.",
  "rem permite zoom del navegador sin romper layout.",
] as const

/** Tokens completos — referencia técnica. */
export const ROOTSY_HEADING_STYLES: TypographyStyle[] = [
  {
    id: "h-xxl",
    token: "font.heading.xxlarge",
    category: "heading",
    preview: "Aa",
    fontFamily: "ui",
    fontWeight: 700,
    fontWeightLabel: "Bold",
    fontSizeRem: "2rem",
    fontSizePx: 32,
    lineHeightRem: "2.25rem",
    lineHeightPx: 36,
    usage: "Marketing, heroes de marca.",
  },
  {
    id: "h-xl",
    token: "font.heading.xlarge",
    category: "heading",
    preview: "Aa",
    fontFamily: "ui",
    fontWeight: 700,
    fontWeightLabel: "Bold",
    fontSizeRem: "1.75rem",
    fontSizePx: 28,
    lineHeightRem: "2rem",
    lineHeightPx: 32,
    usage: "Títulos de campaña, landing interna.",
  },
  {
    id: "h-l",
    token: "font.heading.large",
    category: "heading",
    preview: "Aa",
    fontFamily: "ui",
    fontWeight: 700,
    fontWeightLabel: "Bold",
    fontSizeRem: "1.5rem",
    fontSizePx: 24,
    lineHeightRem: "1.75rem",
    lineHeightPx: 28,
    usage: "Título de página, formulario upsert.",
  },
  {
    id: "h-m",
    token: "font.heading.medium",
    category: "heading",
    preview: "Aa",
    fontFamily: "ui",
    fontWeight: 700,
    fontWeightLabel: "Bold",
    fontSizeRem: "1.25rem",
    fontSizePx: 20,
    lineHeightRem: "1.5rem",
    lineHeightPx: 24,
    usage: "Headers de modal, secciones de librería.",
  },
  {
    id: "h-s",
    token: "font.heading.small",
    category: "heading",
    preview: "Aa",
    fontFamily: "ui",
    fontWeight: 700,
    fontWeightLabel: "Bold",
    fontSizeRem: "1rem",
    fontSizePx: 16,
    lineHeightRem: "1.25rem",
    lineHeightPx: 20,
    usage: "Flags, cards compactas.",
  },
  {
    id: "h-xs",
    token: "font.heading.xsmall",
    category: "heading",
    preview: "Aa",
    fontFamily: "ui",
    fontWeight: 700,
    fontWeightLabel: "Bold",
    fontSizeRem: "0.875rem",
    fontSizePx: 14,
    lineHeightRem: "1.25rem",
    lineHeightPx: 20,
    usage: "Subtítulos en espacios reducidos.",
  },
  {
    id: "h-xxs",
    token: "font.heading.xxsmall",
    category: "heading",
    preview: "Aa",
    fontFamily: "ui",
    fontWeight: 700,
    fontWeightLabel: "Bold",
    fontSizeRem: "0.75rem",
    fontSizePx: 12,
    lineHeightRem: "1rem",
    lineHeightPx: 16,
    usage: "Fine print con jerarquía — usar poco.",
  },
]

export const ROOTSY_BODY_STYLES: TypographyStyle[] = [
  {
    id: "b-l",
    token: "font.body.large",
    category: "body",
    preview: "Aa",
    fontFamily: "ui",
    fontWeight: 400,
    fontWeightLabel: "Regular",
    fontSizeRem: "1rem",
    fontSizePx: 16,
    lineHeightRem: "1.5rem",
    lineHeightPx: 24,
    paragraphSpacingPx: 16,
    usage: "Long-form, blogs, lectura cómoda.",
  },
  {
    id: "b-m",
    token: "font.body",
    category: "body",
    preview: "Aa",
    fontFamily: "ui",
    fontWeight: 400,
    fontWeightLabel: "Regular",
    fontSizeRem: "0.875rem",
    fontSizePx: 14,
    lineHeightRem: "1.25rem",
    lineHeightPx: 20,
    paragraphSpacingPx: 12,
    usage: "Default en componentes — inputs, flags, labels.",
  },
  {
    id: "b-s",
    token: "font.body.small",
    category: "body",
    preview: "Aa",
    fontFamily: "ui",
    fontWeight: 400,
    fontWeightLabel: "Regular",
    fontSizeRem: "0.75rem",
    fontSizePx: 12,
    lineHeightRem: "1rem",
    lineHeightPx: 16,
    paragraphSpacingPx: 8,
    usage: "Hints, metadata, fine print.",
  },
]

export const ROOTSY_METRIC_STYLES: TypographyStyle[] = [
  {
    id: "m-l",
    token: "font.metric.large",
    category: "metric",
    preview: "45%",
    fontFamily: "numeric",
    fontWeight: 700,
    fontWeightLabel: "Bold",
    fontSizeRem: "1.75rem",
    fontSizePx: 28,
    lineHeightRem: "2rem",
    lineHeightPx: 32,
    usage: "Donut grande, KPI hero.",
  },
  {
    id: "m-m",
    token: "font.metric.medium",
    category: "metric",
    preview: "$550",
    fontFamily: "numeric",
    fontWeight: 700,
    fontWeightLabel: "Bold",
    fontSizeRem: "1.5rem",
    fontSizePx: 24,
    lineHeightRem: "1.75rem",
    lineHeightPx: 28,
    usage: "Donut mediano, total en tile.",
  },
  {
    id: "m-s",
    token: "font.metric.small",
    category: "metric",
    preview: "12 uds.",
    fontFamily: "numeric",
    fontWeight: 700,
    fontWeightLabel: "Bold",
    fontSizeRem: "1rem",
    fontSizePx: 16,
    lineHeightRem: "1.25rem",
    lineHeightPx: 20,
    usage: "Single-value tiles, donuts chicos.",
  },
]

export const ROOTSY_CODE_STYLE: TypographyStyle = {
  id: "code",
  token: "font.code",
  category: "code",
  preview: "</>",
  fontFamily: "code",
  fontWeight: 400,
  fontWeightLabel: "Regular",
  fontSizeRem: "0.75rem",
  fontSizePx: 12,
  lineHeightRem: "1.25rem",
  lineHeightPx: 20,
  usage: "Bloques de código — JetBrains Mono.",
}

export const TYPE_SCALE_STEPS = [
  { label: "12px", token: "xxsmall / body.small" },
  { label: "14px", token: "body · xsmall heading" },
  { label: "16px", token: "body.large · small heading" },
  { label: "20px", token: "heading.medium" },
  { label: "24px", token: "heading.large" },
  { label: "28px", token: "heading.xlarge · metric.large" },
  { label: "32px", token: "heading.xxlarge" },
] as const

export const TYPE_SCALE_NOTES = {
  basePx: 16,
  ratio: 1.2,
  rule: "Minor third — cada paso ×1.2 redondeado al múltiplo de 4px más cercano.",
  lineHeightHeading: "~1.2× font-size",
  lineHeightBody: "~1.5× font-size",
  units: "font-size y line-height en rem — respeta preferencias del navegador.",
} as const
