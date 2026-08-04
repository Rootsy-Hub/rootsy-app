/**
 * Sistema tipográfico Rootsy — fuente de verdad del design system.
 * Canopy (Nunito Sans) · Stream (Source Sans 3) · Ledger (Inter)
 * Escala minor third · base 16px · unidades rem.
 */

export type TypographyStyle = {
  id: string
  token: string
  category: "heading" | "body" | "metric" | "code"
  preview: string
  fontFamily: "canopy" | "stream" | "ledger" | "code"
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
  natureName: string
  family: string
  cssVar: string
  role: string
  description: string
  weights: string[]
  features?: string[]
}

export const ROOTSY_TYPOGRAPHY_MANIFESTO =
  "La tipografía de Rootsy habla con la calidez del bosque y la precisión del ledger. Canopy (Nunito Sans) es la voz de la app — redondeada, viva, legible. Stream (Source Sans 3) fluye en lectura larga y descripciones. Ledger (Inter) ancla montos, stock y métricas con cifras tabulares. Todo en rem — accesible, responsive, alineado a escala minor third."

export const ROOTSY_TYPOGRAPHY_PRINCIPLES = [
  {
    title: "Legibilidad primero",
    detail: "Tamaños y line-heights optimizados — el contenido se entiende sin esfuerzo.",
  },
  {
    title: "Armonía visual",
    detail: "Jerarquía clara entre heading, body y metric — sin saltos arbitrarios.",
  },
  {
    title: "Contexto por voz",
    detail: "Canopy en UI · Stream en prosa · Ledger en números — cada fuente en su hábitat.",
  },
  {
    title: "Rem, no px sueltos",
    detail: "font-size y line-height en rem — respeta preferencias del navegador.",
  },
] as const

export const ROOTSY_TYPEFACES: RootsyTypeface[] = [
  {
    id: "canopy",
    natureName: "Canopy",
    family: "Nunito Sans",
    cssVar: "--font-canopy",
    role: "font.sans · UI principal",
    description:
      "Voz de Rootsy en headings y body de componentes — cálida, redondeada, nature-friendly.",
    weights: ["400 Regular", "500 Medium", "600 Semibold", "700 Bold", "800 ExtraBold"],
    features: ["UI optimizada", "Pares bien con verde canopy", "Headings y labels"],
  },
  {
    id: "stream",
    natureName: "Stream",
    family: "Source Sans 3",
    cssVar: "--font-stream",
    role: "font.secondary · lectura",
    description:
      "Prosa, artículos, descripciones largas y contenido editorial — fluye como agua.",
    weights: ["400 Regular", "500 Medium", "600 Semibold", "700 Bold"],
    features: ["Long-form", "Documentación", "Subtítulos descriptivos"],
  },
  {
    id: "ledger",
    natureName: "Ledger",
    family: "Inter",
    cssVar: "--font-ledger",
    role: "font.numeric · métricas",
    description:
      "Montos, cantidades, tablas numéricas y KPIs — tabular-nums, tracking tight.",
    weights: ["400 Regular", "500 Medium", "600 Semibold", "700 Bold"],
    features: ["tabular-nums", "Importes y stock", "Donuts y tiles de métrica"],
  },
  {
    id: "code",
    natureName: "Bark",
    family: "JetBrains Mono",
    cssVar: "--font-code",
    role: "font.code · código",
    description: "Bloques de código y snippets — monoespaciada, slashed zero.",
    weights: ["400 Regular", "500 Medium"],
    features: ["Code blocks", "Tokens técnicos en docs", "No ligatures en UI"],
  },
]

export const ROOTSY_FONT_WEIGHTS = [
  { token: "font.weight.regular", value: 400, usage: "Párrafos, descripciones." },
  { token: "font.weight.medium", value: 500, usage: "Componentes, texto junto a íconos." },
  { token: "font.weight.semibold", value: 600, usage: "Énfasis puntual — usar con criterio." },
  { token: "font.weight.bold", value: 700, usage: "Headings, métricas destacadas." },
] as const

export const ROOTSY_HEADING_STYLES: TypographyStyle[] = [
  { id: "h-xxl", token: "font.heading.xxlarge", category: "heading", preview: "Aa", fontFamily: "canopy", fontWeight: 700, fontWeightLabel: "Bold", fontSizeRem: "2rem", fontSizePx: 32, lineHeightRem: "2.25rem", lineHeightPx: 36, usage: "Marketing, heroes de marca." },
  { id: "h-xl", token: "font.heading.xlarge", category: "heading", preview: "Aa", fontFamily: "canopy", fontWeight: 700, fontWeightLabel: "Bold", fontSizeRem: "1.75rem", fontSizePx: 28, lineHeightRem: "2rem", lineHeightPx: 32, usage: "Títulos de campaña, landing interna." },
  { id: "h-l", token: "font.heading.large", category: "heading", preview: "Aa", fontFamily: "canopy", fontWeight: 700, fontWeightLabel: "Bold", fontSizeRem: "1.5rem", fontSizePx: 24, lineHeightRem: "1.75rem", lineHeightPx: 28, usage: "Título de página, formulario upsert." },
  { id: "h-m", token: "font.heading.medium", category: "heading", preview: "Aa", fontFamily: "canopy", fontWeight: 700, fontWeightLabel: "Bold", fontSizeRem: "1.25rem", fontSizePx: 20, lineHeightRem: "1.5rem", lineHeightPx: 24, usage: "Headers de modal, secciones de librería." },
  { id: "h-s", token: "font.heading.small", category: "heading", preview: "Aa", fontFamily: "canopy", fontWeight: 700, fontWeightLabel: "Bold", fontSizeRem: "1rem", fontSizePx: 16, lineHeightRem: "1.25rem", lineHeightPx: 20, usage: "Flags, cards compactas." },
  { id: "h-xs", token: "font.heading.xsmall", category: "heading", preview: "Aa", fontFamily: "canopy", fontWeight: 700, fontWeightLabel: "Bold", fontSizeRem: "0.875rem", fontSizePx: 14, lineHeightRem: "1.25rem", lineHeightPx: 20, usage: "Subtítulos en espacios reducidos." },
  { id: "h-xxs", token: "font.heading.xxsmall", category: "heading", preview: "Aa", fontFamily: "canopy", fontWeight: 700, fontWeightLabel: "Bold", fontSizeRem: "0.75rem", fontSizePx: 12, lineHeightRem: "1rem", lineHeightPx: 16, usage: "Fine print con jerarquía — usar poco." },
]

export const ROOTSY_BODY_STYLES: TypographyStyle[] = [
  { id: "b-l", token: "font.body.large", category: "body", preview: "Aa", fontFamily: "canopy", fontWeight: 400, fontWeightLabel: "Regular", fontSizeRem: "1rem", fontSizePx: 16, lineHeightRem: "1.5rem", lineHeightPx: 24, paragraphSpacingPx: 16, usage: "Long-form, blogs, lectura cómoda." },
  { id: "b-m", token: "font.body", category: "body", preview: "Aa", fontFamily: "canopy", fontWeight: 400, fontWeightLabel: "Regular", fontSizeRem: "0.875rem", fontSizePx: 14, lineHeightRem: "1.25rem", lineHeightPx: 20, paragraphSpacingPx: 12, usage: "Default en componentes — inputs, flags, labels." },
  { id: "b-s", token: "font.body.small", category: "body", preview: "Aa", fontFamily: "canopy", fontWeight: 400, fontWeightLabel: "Regular", fontSizeRem: "0.75rem", fontSizePx: 12, lineHeightRem: "1rem", lineHeightPx: 16, paragraphSpacingPx: 8, usage: "Hints, metadata, fine print." },
]

export const ROOTSY_METRIC_STYLES: TypographyStyle[] = [
  { id: "m-l", token: "font.metric.large", category: "metric", preview: "45%", fontFamily: "ledger", fontWeight: 700, fontWeightLabel: "Bold", fontSizeRem: "1.75rem", fontSizePx: 28, lineHeightRem: "2rem", lineHeightPx: 32, usage: "Donut grande, KPI hero." },
  { id: "m-m", token: "font.metric.medium", category: "metric", preview: "$550", fontFamily: "ledger", fontWeight: 700, fontWeightLabel: "Bold", fontSizeRem: "1.5rem", fontSizePx: 24, lineHeightRem: "1.75rem", lineHeightPx: 28, usage: "Donut mediano, total en tile." },
  { id: "m-s", token: "font.metric.small", category: "metric", preview: "12 uds.", fontFamily: "ledger", fontWeight: 700, fontWeightLabel: "Bold", fontSizeRem: "1rem", fontSizePx: 16, lineHeightRem: "1.25rem", lineHeightPx: 20, usage: "Single-value tiles, donuts chicos." },
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
  usage: "Bloques de código — Bark / JetBrains Mono.",
}

export const TYPE_SCALE_NOTES = {
  basePx: 16,
  ratio: 1.2,
  rule: "Minor third — cada paso ×1.2 redondeado al múltiplo de 4px más cercano.",
  lineHeightHeading: "~1.2× font-size",
  lineHeightBody: "~1.5× font-size",
} as const

export const TYPOGRAPHY_APPLYING_GUIDELINES = [
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
    doText: "Ledger bold en el número del donut — body.small en la etiqueta debajo.",
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

export const TYPOGRAPHY_ACCESSIBILITY_NOTES = [
  "Mínimo 16px (font.body.large) para lectura prolongada.",
  "12px (font.body.small) solo en metadata — nunca párrafos largos.",
  "Contraste de texto con tokens color — WCAG AA mínimo.",
  "Headings semánticos (h1–h6) emparejados con tokens heading.",
  "rem permite zoom del navegador sin romper layout.",
] as const
