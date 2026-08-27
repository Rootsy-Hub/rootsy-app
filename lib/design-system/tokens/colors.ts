/**
 * Paleta de color Rootsy — fuente de verdad.
 * Espejo de styles/rootsy/tokens/colors.css
 *
 * Once pasos (50–950) en siete familias, más --rootsy-blanco fuera de rampa.
 * Si un hex no está acá, no entra.
 *
 * Atmósferas: éter · bruma (Sotobosque · Luz filtrada) · sombra (Sotobosque · Sombra)
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

/** Luz de Bruma clara. No es un paso de rampa. No pinta éter ni sombra. */
export const ROOTSY_BLANCO = "#FFFFFF"

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
    "50": "#F8FAF5",
    "100": "#F3F5EF",
    "200": "#E5EEE2",
    "300": "#CBDCCC",
    "400": "#A8BBA9",
    "500": "#8A988C",
    "600": "#6A776C",
    "700": "#4A554C",
    "800": "#2D352F",
    "900": "#1C231E",
    "950": "#0A0F0C",
  },
  sombra: {
    "50": "#E8F4EC",
    "100": "#C8DFD2",
    "200": "#9DC4B0",
    "300": "#6F9A86",
    "400": "#4A7D62",
    "500": "#2E5446",
    "600": "#243F36",
    "700": "#1B2E28",
    "800": "#131E1A",
    "900": "#0D1513",
    "950": "#080C0B",
  },
  savia: {
    "50": "#E8FFF3",
    "100": "#C4FEE4",
    "200": "#8AFDCA",
    "300": "#4FFCB0",
    "400": "#1EFE98",
    "500": "#02FE85",
    "600": "#00BC66",
    "700": "#05713F",
    "800": "#0A482B",
    "900": "#0A2C1B",
    "950": "#07120C",
  },
  cielo: {
    "50": "#E7F5FF",
    "100": "#D4ECFF",
    "200": "#B1DCFC",
    "300": "#8DCBF8",
    "400": "#60BAF8",
    "500": "#48AEF1",
    "600": "#3391D1",
    "700": "#176EAA",
    "800": "#104A73",
    "900": "#0B314C",
    "950": "#061A29",
  },
  sol: {
    "50": "#FCF6E6",
    "100": "#FBF0D5",
    "200": "#F8E4B5",
    "300": "#F6D893",
    "400": "#F5CB67",
    "500": "#F1C452",
    "600": "#C79832",
    "700": "#956600",
    "800": "#644706",
    "900": "#423007",
    "950": "#241B06",
  },
  lava: {
    "50": "#FFEBE7",
    "100": "#FFD9D3",
    "200": "#FFB9AE",
    "300": "#FD978A",
    "400": "#FA7061",
    "500": "#F05B4D",
    "600": "#D54D42",
    "700": "#B53D34",
    "800": "#7A2821",
    "900": "#501914",
    "950": "#2A0B08",
  },
} as const

/** Roles de acento: vivo 500 · profundo 700 · texto sobre vivo 950. */
export const ROOTSY_FUNCTIONAL_ROLES = {
  vivo: "500",
  profundo: "700",
  on: "950",
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
 * Tokens de propósito. El hex sale de la paleta, salvo elevada en Bruma clara (blanco).
 * Atmósfera por defecto: bruma clara (workspace).
 */
export const ROOTSY_COLOR_SEMANTIC = {
  fondo: rootsyColorHex("bruma", "100"),
  superficie: rootsyColorHex("bruma", "50"),
  elevada: ROOTSY_BLANCO,
  borde: rootsyColorHex("bruma", "200"),
  texto: rootsyColorHex("bruma", "950"),
  textoMuted: rootsyColorHex("bruma", "700"),
  accion: rootsyColorHex("savia", "500"),
  accionHover: rootsyColorHex("savia", "600"),
  accionTexto: rootsyColorHex("savia", "950"),
  accionProfundo: rootsyColorHex("savia", "700"),
  foco: rootsyColorHex("savia", "400"),
  exito: rootsyColorHex("savia", "500"),
  informacion: rootsyColorHex("cielo", "500"),
  informacionTexto: rootsyColorHex("cielo", "950"),
  informacionProfundo: rootsyColorHex("cielo", "700"),
  atencion: rootsyColorHex("sol", "500"),
  atencionTexto: rootsyColorHex("sol", "950"),
  atencionProfundo: rootsyColorHex("sol", "700"),
  peligro: rootsyColorHex("lava", "500"),
  peligroTexto: rootsyColorHex("lava", "950"),
  peligroProfundo: rootsyColorHex("lava", "700"),

  /** Papel de Bruma. Alias de ROOTSY_BLANCO. Inverso de CTA: savia 50. Sobre dosel: sombra 50. */
  white: ROOTSY_BLANCO,
  /** @deprecated Usar sombra 50. */
  textOnDark: rootsyColorHex("sombra", "50"),
  /** @deprecated Usar accion. */
  action: rootsyColorHex("savia", "500"),
  /** @deprecated Usar accionHover. */
  actionHover: rootsyColorHex("savia", "600"),
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
  /** @deprecated Usar peligro / lava 500. */
  danger: rootsyColorHex("lava", "500"),
  /** @deprecated Usar lava 700. */
  dangerDark: rootsyColorHex("lava", "700"),
} as const
