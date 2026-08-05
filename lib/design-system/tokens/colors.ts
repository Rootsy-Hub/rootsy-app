/**
 * Tokens de color Rootsy — fuente de verdad (TS).
 * Espejo de styles/rootsy/tokens/colors.css
 * Familias: ceniza · bruma · savia · landing
 */

export type RootsyColorFamily = "ceniza" | "bruma" | "savia" | "landing"

export const ROOTSY_COLOR_RAMPS = {
  ceniza: {
    "950": "#070A09",
    "900": "#0B100E",
    "800": "#0F1416",
    "700": "#1A2027",
    "600": "#20262E",
    "500": "#252B34",
    "400": "#64748B",
    "300": "#94A3B8",
  },
  bruma: {
    "50": "#F4F6F9",
    "100": "#EEF1F5",
    "200": "#DFE4EA",
    "300": "#CBD5E1",
    "400": "#94A3B8",
    "500": "#64748B",
    "600": "#475569",
    "700": "#334155",
    "900": "#121417",
  },
  savia: {
    "990": "#061009",
    "975": "#07120E",
    "960": "#0C1F17",
    "950": "#022C22",
    "900": "#064E3B",
    "800": "#065F46",
    "700": "#047857",
    "600": "#059669",
    "500": "#10B981",
    "400": "#34D399",
    "300": "#6EE7B7",
    "200": "#A7F3D0",
    "100": "#D1FAE5",
    "50": "#ECFDF5",
  },
  landing: {
    "950": "#080C0B",
    "900": "#070A09",
    "800": "#0A0E0D",
    "500": "#10B981",
    "400": "#34D399",
    "300": "#6EE7B7",
    "200": "#A7F3D0",
    teal: "#14B8A6",
    neon: "#25FE02",
    "neon-2": "#02FE85",
  },
} as const

/** Referencia CSS: var(--rootsy-bruma-100) */
export function rootsyColorVar(
  family: RootsyColorFamily,
  step: string | number,
): string {
  return `var(--rootsy-${family}-${step})`
}

/** Hex literal para TS / canvas / docs. */
export function rootsyColorHex(
  family: RootsyColorFamily,
  step: string | number,
): string {
  const ramp = ROOTSY_COLOR_RAMPS[family] as Record<string, string>
  const key = String(step)
  const hex = ramp[key]
  if (!hex) {
    throw new Error(`Unknown rootsy color: ${family}.${key}`)
  }
  return hex
}

/** Atajos semánticos usados en demos y componentes. */
export const ROOTSY_COLOR_SEMANTIC = {
  white: "#FFFFFF",
  textOnDark: "#F8FAFC",
  action: rootsyColorHex("savia", "600"),
  actionHover: rootsyColorHex("savia", "700"),
  accent: rootsyColorHex("savia", "400"),
} as const
