/**
 * Tokens tipográficos Rootsy — fuente de verdad (TS).
 * Espejo de styles/rootsy/tokens/typography.css
 *
 * Dos familias. Tres voces. Cuatro pesos. Una escala minor third sobre 16px.
 * Inter = UI y números. Nunito Sans = lectura.
 * No hay ExtraBold ni Black: 700 es el techo.
 */

export const ROOTSY_TYPE_SCALE = {
  basePx: 16,
  ratio: 1.2,
  rule: "Minor third — cada paso ×1.2, redondeado al múltiplo de 4px más cercano.",
  units: "font-size y line-height en rem — el zoom del navegador no rompe el layout.",
  lineHeightHeading: "~1.2× del tamaño",
  lineHeightUiBody: "~1.4× del tamaño — compacto en componentes",
  lineHeightReading: "1.5× del tamaño — prosa y documentación",
  measureCh: 65,
} as const

const INTER_STACK = 'var(--font-inter, "Inter"), sans-serif'
const NUNITO_STACK = 'var(--font-nunito-sans, "Nunito Sans"), sans-serif'

export const ROOTSY_FONT_FAMILIES = {
  ui: {
    id: "ui",
    token: "font.ui",
    tokenAlias: "font.sans",
    cssVar: "--rootsy-font-ui",
    cssClass: "font-canopy",
    stack: INTER_STACK,
    label: "UI",
    family: "Inter",
    role: "Chrome del producto: títulos, botones, labels, tablas y formularios.",
    description:
      "Neutra y precisa. Es la voz de la interfaz. No se usa para artículos largos.",
    sample: "Confirmar venta",
    weights: ["400", "500", "600", "700"] as const,
    features: ["Headings y labels", "Botones y formularios", "Navegación"],
  },
  reading: {
    id: "reading",
    token: "font.reading",
    tokenAlias: "font.secondary",
    cssVar: "--rootsy-font-reading",
    cssClass: "font-stream",
    stack: NUNITO_STACK,
    label: "Lectura",
    family: "Nunito Sans",
    role: "Prosa: handbook, ayuda, descripciones largas y vacío editorial.",
    description:
      "Redondeada y fluida en bloques. Solo entra cuando hay que leer de corrido — no en controles.",
    sample: "Rootsy conecta inventario, ventas y tesorería en un solo lugar.",
    weights: ["400", "500", "600", "700"] as const,
    features: ["Long-form", "Documentación", "Ayuda en pantalla"],
  },
  numeric: {
    id: "numeric",
    token: "font.numeric",
    cssVar: "--rootsy-font-numeric",
    cssClass: "font-numeric",
    stack: INTER_STACK,
    label: "Números",
    family: "Inter",
    role: "Montos, cantidades, KPIs y columnas numéricas.",
    description:
      "La misma Inter de la UI, en tabular. El número destaca; la etiqueta debajo no compite.",
    sample: "$ 124.580,00",
    weights: ["400", "500", "600", "700"] as const,
    features: ["tabular-nums", "Importes y stock", "Tiles de métrica"],
  },
} as const

export type RootsyFontVoice = keyof typeof ROOTSY_FONT_FAMILIES

export const ROOTSY_FONT_WEIGHTS = {
  regular: { token: "font.weight.regular", value: 400, label: "Regular" },
  medium: { token: "font.weight.medium", value: 500, label: "Medium" },
  semibold: { token: "font.weight.semibold", value: 600, label: "Semibold" },
  bold: { token: "font.weight.bold", value: 700, label: "Bold" },
} as const

export const ROOTSY_FONT_WEIGHT_STEPS = [
  {
    id: "regular",
    token: "font.weight.regular",
    cssVar: "--rootsy-font-weight-regular",
    label: "Regular",
    value: 400,
    usage: "Párrafos, descripciones y el default de body.",
  },
  {
    id: "medium",
    token: "font.weight.medium",
    cssVar: "--rootsy-font-weight-medium",
    label: "Medium",
    value: 500,
    usage: "Texto junto a íconos line. Alinea el trazo con el glifo.",
  },
  {
    id: "semibold",
    token: "font.weight.semibold",
    cssVar: "--rootsy-font-weight-semibold",
    label: "Semibold",
    value: 600,
    usage: "Énfasis puntual: labels de tabla, botones, nav activa.",
  },
  {
    id: "bold",
    token: "font.weight.bold",
    cssVar: "--rootsy-font-weight-bold",
    label: "Bold",
    value: 700,
    usage: "Headings y métricas. Es el techo — no hay 800 ni 900.",
  },
] as const

export const ROOTSY_TEXT_STYLES = {
  "heading.xxlarge": {
    fontSize: "2rem",
    lineHeight: "2.25rem",
    weight: 700,
    sizePx: 32,
    lineHeightPx: 36,
    family: "ui" as const,
    usage: "Marketing y heroes de marca. Casi nunca en producto.",
  },
  "heading.xlarge": {
    fontSize: "1.75rem",
    lineHeight: "2rem",
    weight: 700,
    sizePx: 28,
    lineHeightPx: 32,
    family: "ui" as const,
    usage: "Títulos de campaña. En producto preferí heading.large.",
  },
  "heading.large": {
    fontSize: "1.5rem",
    lineHeight: "1.75rem",
    weight: 700,
    sizePx: 24,
    lineHeightPx: 28,
    family: "ui" as const,
    usage: "Título de página. Un solo h1 por pantalla.",
  },
  "heading.medium": {
    fontSize: "1.25rem",
    lineHeight: "1.5rem",
    weight: 700,
    sizePx: 20,
    lineHeightPx: 24,
    family: "ui" as const,
    usage: "Título de sección, header de modal.",
  },
  "heading.small": {
    fontSize: "1rem",
    lineHeight: "1.25rem",
    weight: 700,
    sizePx: 16,
    lineHeightPx: 20,
    family: "ui" as const,
    usage: "Subtítulos en cards y flags.",
  },
  "heading.xsmall": {
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
    weight: 700,
    sizePx: 14,
    lineHeightPx: 20,
    family: "ui" as const,
    usage: "Título de producto en el catálogo y valor de slot toolbox.",
  },
  "heading.xxsmall": {
    fontSize: "0.75rem",
    lineHeight: "1rem",
    weight: 700,
    sizePx: 12,
    lineHeightPx: 16,
    family: "ui" as const,
    usage: "Casi nunca. Preferí body.small + semibold.",
  },
  "body.large": {
    fontSize: "1rem",
    lineHeight: "1.5rem",
    weight: 400,
    sizePx: 16,
    lineHeightPx: 24,
    family: "reading" as const,
    usage: "16px / 1.5 / 65ch. Nunito Sans — prosa, no chrome.",
  },
  body: {
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
    weight: 400,
    sizePx: 14,
    lineHeightPx: 20,
    family: "ui" as const,
    usage: "Default de componentes: inputs, celdas, labels.",
  },
  "body.small": {
    fontSize: "0.75rem",
    lineHeight: "1rem",
    weight: 400,
    sizePx: 12,
    lineHeightPx: 16,
    family: "ui" as const,
    usage: "Hints, timestamps, metadata. Nunca un párrafo largo.",
  },
  "metric.large": {
    fontSize: "1.75rem",
    lineHeight: "2rem",
    weight: 700,
    sizePx: 28,
    lineHeightPx: 32,
    family: "numeric" as const,
    usage: "KPI hero, total destacado.",
  },
  "metric.medium": {
    fontSize: "1.5rem",
    lineHeight: "1.75rem",
    weight: 700,
    sizePx: 24,
    lineHeightPx: 28,
    family: "numeric" as const,
    usage: "Total en tile o donut mediano.",
  },
  "metric.small": {
    fontSize: "1rem",
    lineHeight: "1.25rem",
    weight: 700,
    sizePx: 16,
    lineHeightPx: 20,
    family: "numeric" as const,
    usage: "Single-value tiles y donuts chicos.",
  },
} as const

export type RootsyTextStyleId = keyof typeof ROOTSY_TEXT_STYLES

export const ROOTSY_TYPE_SCALE_STEPS = [
  { sizePx: 12, tokens: "body.small · heading.xxsmall" },
  { sizePx: 14, tokens: "body · heading.xsmall" },
  { sizePx: 16, tokens: "body.large · heading.small · metric.small" },
  { sizePx: 20, tokens: "heading.medium" },
  { sizePx: 24, tokens: "heading.large · metric.medium" },
  { sizePx: 28, tokens: "heading.xlarge · metric.large" },
  { sizePx: 32, tokens: "heading.xxlarge" },
] as const

/** Roles del día a día. Si dudás, usá uno de estos. */
export const ROOTSY_TYPE_ROLES = [
  {
    id: "page-title",
    label: "Título de página",
    sample: "Ventas de hoy",
    style: "heading.large" as const,
    html: "h1",
  },
  {
    id: "section-title",
    label: "Título de sección",
    sample: "Tu pedido",
    style: "heading.medium" as const,
    html: "h2",
  },
  {
    id: "product-title",
    label: "Título de producto",
    sample: "Agua mineral",
    style: "heading.xsmall" as const,
    html: "h3",
  },
  {
    id: "body",
    label: "Texto de interfaz",
    sample: "Medialuna clásica",
    style: "body" as const,
    html: "p",
  },
  {
    id: "meta",
    label: "Metadatos",
    sample: "Panadería · x2",
    style: "body.small" as const,
    html: "p",
  },
  {
    id: "metric",
    label: "Monto",
    sample: "$ 48.320",
    style: "metric.large" as const,
    html: "p",
  },
] as const

/** Clases de propósito — API de producto. Preferir estas a text-[13px]. */
export const ROOTSY_TEXT_ROLE_CLASS = {
  pageTitle: "rootsy-text-page-title",
  sectionTitle: "rootsy-text-section-title",
  headingSmall: "rootsy-text-heading-small",
  headingXsmall: "rootsy-text-heading-xsmall",
  body: "rootsy-text-body",
  meta: "rootsy-text-meta",
  metric: "rootsy-text-metric",
  metricMedium: "rootsy-text-metric-medium",
  metricSmall: "rootsy-text-metric-small",
  reading: "rootsy-text-reading",
  label: "rootsy-text-label",
} as const

export function rootsyTextVar(token: RootsyTextStyleId): string {
  const slug = token.replace(/\./g, "-")
  return `var(--rootsy-text-${slug}-size)`
}
