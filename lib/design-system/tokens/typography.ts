/**
 * Tokens tipográficos Rootsy — fuente de verdad (TS).
 * Espejo de styles/rootsy/tokens/typography.css
 */

export const ROOTSY_FONT_FAMILIES = {
  ui: {
    token: "font.sans",
    cssVar: "--rootsy-font-ui",
    stack: "var(--font-nunito-sans), 'Nunito Sans', sans-serif",
    label: "UI",
    family: "Nunito Sans",
  },
  reading: {
    token: "font.secondary",
    cssVar: "--rootsy-font-reading",
    stack: "var(--font-source-sans), 'Source Sans 3', 'Source Sans Pro', sans-serif",
    label: "Lectura",
    family: "Source Sans 3",
  },
  numeric: {
    token: "font.numeric",
    cssVar: "--rootsy-font-numeric",
    stack: "var(--font-inter), 'Inter', sans-serif",
    label: "Números",
    family: "Inter",
  },
  code: {
    token: "font.code",
    cssVar: "--rootsy-font-code",
    stack: "ui-monospace, 'JetBrains Mono', 'SF Mono', monospace",
    label: "Código",
    family: "JetBrains Mono",
  },
} as const

export const ROOTSY_FONT_WEIGHTS = {
  regular: { token: "font.weight.regular", value: 400 },
  medium: { token: "font.weight.medium", value: 500 },
  semibold: { token: "font.weight.semibold", value: 600 },
  bold: { token: "font.weight.bold", value: 700 },
} as const

export const ROOTSY_TEXT_STYLES = {
  "heading.xxlarge": { fontSize: "2rem", lineHeight: "2.25rem", weight: 700 },
  "heading.xlarge": { fontSize: "1.75rem", lineHeight: "2rem", weight: 700 },
  "heading.large": { fontSize: "1.5rem", lineHeight: "1.75rem", weight: 700 },
  "heading.medium": { fontSize: "1.25rem", lineHeight: "1.5rem", weight: 700 },
  "heading.small": { fontSize: "1rem", lineHeight: "1.25rem", weight: 700 },
  "heading.xsmall": { fontSize: "0.875rem", lineHeight: "1.25rem", weight: 700 },
  "heading.xxsmall": { fontSize: "0.75rem", lineHeight: "1rem", weight: 700 },
  "body.large": { fontSize: "1rem", lineHeight: "1.5rem", weight: 400 },
  body: { fontSize: "0.875rem", lineHeight: "1.25rem", weight: 400 },
  "body.small": { fontSize: "0.75rem", lineHeight: "1rem", weight: 400 },
  "metric.large": { fontSize: "1.75rem", lineHeight: "2rem", weight: 700 },
  "metric.medium": { fontSize: "1.5rem", lineHeight: "1.75rem", weight: 700 },
  "metric.small": { fontSize: "1rem", lineHeight: "1.25rem", weight: 700 },
  code: { fontSize: "0.75rem", lineHeight: "1.25rem", weight: 400 },
} as const

export const ROOTSY_TYPE_SCALE = {
  basePx: 16,
  ratio: 1.2,
} as const

export function rootsyTextVar(token: keyof typeof ROOTSY_TEXT_STYLES): string {
  const slug = token.replace(/\./g, "-")
  return `var(--rootsy-text-${slug})`
}
