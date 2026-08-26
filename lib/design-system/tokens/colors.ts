/**
 * Paleta de color Rootsy — fuente de verdad.
 * Espejo de styles/rootsy/tokens/colors.css
 *
 * Once pasos (50–950) en siete familias. Si un hex no está acá, no entra.
 *
 * Atmósferas: éter · bruma · sombra
 * Funcionales: savia · cielo · sol · lava
 */

export const ROOTSY_COLOR_STEPS = [
  "50",
  "100",
  "200",
  "300",
  "400",
  "500",
  "600",
  "700",
  "800",
  "900",
  "950",
] as const

export type RootsyColorStepId = (typeof ROOTSY_COLOR_STEPS)[number]

export type RootsyColorFamily =
  | "eter"
  | "bruma"
  | "sombra"
  | "savia"
  | "cielo"
  | "sol"
  | "lava"

export type RootsyAtmosphereFamily = "eter" | "bruma" | "sombra"
export type RootsyFunctionalFamily = "savia" | "cielo" | "sol" | "lava"

/** @deprecated Alias de migración — no son familias de paleta. */
export type LegacyRootsyColorFamily =
  | RootsyColorFamily
  | "ceniza"
  | "landing"
  | "marketing"
  | "atmosphere"
  | "suelo"
  | "cielo-de-dia"

export type RootsyColorRamp = Record<RootsyColorStepId, string>

export const ROOTSY_COLOR_RAMPS: Record<RootsyColorFamily, RootsyColorRamp> = {
  eter: {
    "50": "#F3F8FB",
    "100": "#E4F2F8",
    "200": "#C8DCE8",
    "300": "#8FB4C8",
    "400": "#5A8AA4",
    "500": "#2F5A78",
    "600": "#163848",
    "700": "#0B1824",
    "800": "#040A0E",
    "900": "#02060A",
    "950": "#010306",
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
    "800": "#1A1F28",
    "900": "#121417",
    "950": "#0A0C0F",
  },
  sombra: {
    "50": "#F3F6F4",
    "100": "#E5ECE8",
    "200": "#C5D0CA",
    "300": "#8FA396",
    "400": "#5A6B63",
    "500": "#222B27",
    "600": "#1B2420",
    "700": "#151C19",
    "800": "#0E1311",
    "900": "#080C0B",
    "950": "#050807",
  },
  savia: {
    "50": "#ECFDF5",
    "100": "#D1FAE5",
    "200": "#A7F3D0",
    "300": "#6EE7B7",
    "400": "#34D399",
    "500": "#10B981",
    "600": "#059669",
    "700": "#047857",
    "800": "#065F46",
    "900": "#064E3B",
    "950": "#022C22",
  },
  cielo: {
    "50": "#EAF6FE",
    "100": "#D4ECFC",
    "200": "#A8D6FA",
    "300": "#76BDF4",
    "400": "#45A6F2",
    "500": "#1286E8",
    "600": "#0C72C2",
    "700": "#0B5A98",
    "800": "#0A4574",
    "900": "#062E52",
    "950": "#041A30",
  },
  sol: {
    "50": "#FDF8E8",
    "100": "#FBF3C6",
    "200": "#F8E17A",
    "300": "#F5D054",
    "400": "#F3C62E",
    "500": "#E8B10F",
    "600": "#C98C0D",
    "700": "#9C640A",
    "800": "#7A4E08",
    "900": "#523406",
    "950": "#2E1C04",
  },
  lava: {
    "50": "#FDF5F2",
    "100": "#F8E0D6",
    "200": "#F0B8A4",
    "300": "#E48868",
    "400": "#D45C38",
    "500": "#C43A18",
    "600": "#A82C12",
    "700": "#82220E",
    "800": "#58170A",
    "900": "#381008",
    "950": "#1C0805",
  },
} as const

export const ROOTSY_ETER = ROOTSY_COLOR_RAMPS.eter
export const ROOTSY_CIELO = ROOTSY_COLOR_RAMPS.cielo
export const ROOTSY_SOL = ROOTSY_COLOR_RAMPS.sol
export const ROOTSY_LAVA = ROOTSY_COLOR_RAMPS.lava

/**
 * @deprecated El piso usa sombra. Se mantiene el nombre para no romper callers.
 */
export const ROOTSY_SUELO = {
  "50": ROOTSY_COLOR_RAMPS.sombra["50"],
  "300": ROOTSY_COLOR_RAMPS.sombra["300"],
  "400": ROOTSY_COLOR_RAMPS.sombra["400"],
  "600": ROOTSY_COLOR_RAMPS.sombra["600"],
  "700": ROOTSY_COLOR_RAMPS.sombra["700"],
  "800": ROOTSY_COLOR_RAMPS.sombra["800"],
  "900": ROOTSY_COLOR_RAMPS.sombra["900"],
  "950": ROOTSY_COLOR_RAMPS.sombra["950"],
} as const

/**
 * @deprecated Auroras de marketing. Usar savia 400 / 500.
 */
export const ROOTSY_ATMOSPHERE = {
  neon: ROOTSY_COLOR_RAMPS.savia["400"],
  "neon-2": ROOTSY_COLOR_RAMPS.savia["500"],
} as const

const FAMILY_ALIASES: Record<string, RootsyColorFamily> = {
  ceniza: "sombra",
  suelo: "sombra",
  "cielo-de-dia": "cielo",
}

const STEP_ALIASES: Partial<Record<RootsyColorFamily, Record<string, RootsyColorStepId>>> = {
  sombra: { border: "400" },
  savia: { teal: "500", "990": "950", "975": "950", "960": "950" },
}

const LANDING_ALIAS: Record<string, { family: RootsyColorFamily; step: RootsyColorStepId }> = {
  "950": { family: "sombra", step: "900" },
  "900": { family: "sombra", step: "950" },
  "800": { family: "sombra", step: "800" },
  "500": { family: "savia", step: "500" },
  "400": { family: "savia", step: "400" },
  "300": { family: "savia", step: "300" },
  "200": { family: "savia", step: "200" },
  teal: { family: "savia", step: "500" },
  neon: { family: "savia", step: "400" },
  "neon-2": { family: "savia", step: "500" },
}

function resolveLegacyColor(
  family: LegacyRootsyColorFamily,
  step: string | number,
): { family: RootsyColorFamily; step: RootsyColorStepId | string } {
  const key = String(step)
  if (family === "atmosphere") {
    if (key === "neon") return { family: "savia", step: "400" }
    if (key === "neon-2") return { family: "savia", step: "500" }
    return { family: "savia", step: key }
  }
  if (family === "marketing" || family === "landing") {
    const mapped = LANDING_ALIAS[key]
    if (mapped) return mapped
    throw new Error(`Unknown landing color alias: landing.${key}`)
  }
  const resolvedFamily = FAMILY_ALIASES[family] ?? (family as RootsyColorFamily)
  const resolvedStep = STEP_ALIASES[resolvedFamily]?.[key] ?? key
  return { family: resolvedFamily, step: resolvedStep }
}

/** Referencia CSS: var(--rootsy-bruma-100) */
export function rootsyColorVar(
  family: LegacyRootsyColorFamily,
  step: string | number,
): string {
  const resolved = resolveLegacyColor(family, step)
  return `var(--rootsy-${resolved.family}-${resolved.step})`
}

/** Hex literal para TS / canvas / docs. */
export function rootsyColorHex(
  family: LegacyRootsyColorFamily,
  step: string | number,
): string {
  const resolved = resolveLegacyColor(family, step)
  const ramp = ROOTSY_COLOR_RAMPS[resolved.family]
  const hex = ramp[resolved.step as RootsyColorStepId]
  if (!hex) {
    throw new Error(`Unknown rootsy color: ${resolved.family}.${resolved.step}`)
  }
  return hex
}

/**
 * Tokens de propósito. El hex sale de la paleta.
 * Atmósfera por defecto: bruma clara (workspace).
 */
export const ROOTSY_COLOR_SEMANTIC = {
  fondo: rootsyColorHex("bruma", "100"),
  superficie: rootsyColorHex("bruma", "50"),
  elevada: rootsyColorHex("bruma", "50"),
  borde: rootsyColorHex("bruma", "200"),
  texto: rootsyColorHex("bruma", "900"),
  textoMuted: rootsyColorHex("bruma", "700"),
  accion: rootsyColorHex("savia", "600"),
  accionHover: rootsyColorHex("savia", "700"),
  foco: rootsyColorHex("savia", "400"),
  exito: rootsyColorHex("savia", "500"),
  informacion: rootsyColorHex("cielo", "500"),
  atencion: rootsyColorHex("sol", "500"),
  peligro: rootsyColorHex("lava", "600"),

  /** @deprecated Usar savia 50 o sombra 50 según contraste. */
  white: rootsyColorHex("savia", "50"),
  /** @deprecated Usar sombra 50. */
  textOnDark: rootsyColorHex("sombra", "50"),
  /** @deprecated Usar accion. */
  action: rootsyColorHex("savia", "600"),
  /** @deprecated Usar accionHover. */
  actionHover: rootsyColorHex("savia", "700"),
  /** @deprecated Usar foco. */
  accent: rootsyColorHex("savia", "400"),
  /** @deprecated Usar savia 500. */
  promoGradientEnd: rootsyColorHex("savia", "500"),
  /** @deprecated Usar atencion / sol 500. */
  warning: rootsyColorHex("sol", "500"),
  /** @deprecated Usar sol 900. */
  warningText: rootsyColorHex("sol", "900"),
  /** @deprecated Usar sol 50. */
  warningSoft: rootsyColorHex("sol", "50"),
  /** @deprecated Usar peligro / lava 600. */
  danger: rootsyColorHex("lava", "600"),
  /** @deprecated Usar lava 700. */
  dangerDark: rootsyColorHex("lava", "700"),
} as const
