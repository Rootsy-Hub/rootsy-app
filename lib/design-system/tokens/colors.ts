/**
 * Tokens de color Rootsy — fuente de verdad (TS).
 * Espejo de styles/rootsy/tokens/colors.css
 *
 * Tres familias de marca: sombra · bruma · savia
 * Suelo = chrome de piso (footer + toolbox). No es una cuarta familia de marca.
 * Cielo / sol = climas complementarios (comandas, mundos). No son marca.
 * Éter = chrome del header (espacio fuera del planeta). No es cielo de día.
 * Atmósfera = efectos decorativos de marketing (no familia aplicable a UI).
 */

export type RootsyColorFamily = "sombra" | "bruma" | "savia"

/** @deprecated Alias de migración — ceniza → sombra, landing/marketing → sombra/savia/atmosphere */
export type LegacyRootsyColorFamily = RootsyColorFamily | "ceniza" | "landing" | "marketing" | "atmosphere"

export const ROOTSY_COLOR_RAMPS = {
  sombra: {
    "950": "#050807",
    "900": "#080C0B",
    "800": "#0E1311",
    "700": "#151C19",
    "600": "#1B2420",
    "500": "#222B27",
    "400": "#5A6B63",
    "300": "#8FA396",
    border: "#2A3530",
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
    /** Extensión promocional — gradiente CTA hero (savia → teal). */
    teal: "#14B8A6",
  },
} as const

/**
 * Tierra mojada — humus oliva bajo el dosel.
 * No es el stone Tailwind (#292524) ni sombra sola: dialoga con sombra (bosque)
 * y savia (humedad). Solo footer de tablas y toolbox de operar.
 */
export const ROOTSY_SUELO = {
  "950": "#0A0C08",
  "900": "#151810",
  "800": "#24291E",
  "700": "#353B2C",
  "600": "#464D3A",
  "400": "#8F9782",
  "300": "#B6BDA8",
  "50": "#F1F2EB",
} as const

/**
 * Cielo — azul de naturaleza vivo (cerúleo de siesta, no Tailwind sky ni teal).
 * Dialoga con savia sin competir: más azul, más croma. Headers “enviada”, info de mundo.
 */
export const ROOTSY_CIELO = {
  "800": "#0A4574",
  "700": "#0B5A98",
  "600": "#0C72C2",
  "500": "#1286E8",
  "400": "#45A6F2",
  "200": "#A8D6FA",
  "100": "#D4ECFC",
  "50": "#EAF6FE",
} as const

/**
 * Sol — amarillo sol a través del dosel.
 * No es el ámbar de aviso (#D97706) ni otoño Tailwind. Calor vivo para “preparando”.
 */
export const ROOTSY_SOL = {
  "800": "#7A4E08",
  "700": "#9C640A",
  "600": "#C98C0D",
  "500": "#E8B10F",
  "400": "#F3C62E",
  "200": "#F8E17A",
  "100": "#FBF3C6",
  "50": "#FDF8E8",
} as const

/**
 * Éter — espacio fuera del planeta.
 * Noche profunda, estrellas y horizonte de luz fría. Header reutilizable.
 * No es sombra (bosque) ni cielo (día).
 */
export const ROOTSY_ETER = {
  "950": "#010306",
  "900": "#02060A",
  "800": "#040A0E",
  "700": "#0B1824",
  "200": "#C8DCE8",
  "100": "#E4F2F8",
} as const

/** Auroras y glow — solo blur/atmosphere en marketing. Nunca texto, borde ni botón sólido. */
export const ROOTSY_ATMOSPHERE = {
  neon: "#25FE02",
  "neon-2": "#02FE85",
} as const

const LANDING_ALIAS: Record<string, { family: RootsyColorFamily | "atmosphere"; step: string }> = {
  "950": { family: "sombra", step: "900" },
  "900": { family: "sombra", step: "950" },
  "800": { family: "sombra", step: "800" },
  "500": { family: "savia", step: "500" },
  "400": { family: "savia", step: "400" },
  "300": { family: "savia", step: "300" },
  "200": { family: "savia", step: "200" },
  teal: { family: "savia", step: "teal" },
  neon: { family: "atmosphere", step: "neon" },
  "neon-2": { family: "atmosphere", step: "neon-2" },
}

function resolveLegacyColor(
  family: LegacyRootsyColorFamily,
  step: string | number,
): { family: RootsyColorFamily | "atmosphere"; step: string } {
  const key = String(step)
  if (family === "ceniza") return { family: "sombra", step: key }
  if (family === "marketing" || family === "landing") {
    const mapped = LANDING_ALIAS[key]
    if (mapped) return mapped
    throw new Error(`Unknown landing color alias: landing.${key}`)
  }
  if (family === "atmosphere") return { family: "atmosphere", step: key }
  return { family, step: key }
}

/** Referencia CSS: var(--rootsy-bruma-100) */
export function rootsyColorVar(
  family: LegacyRootsyColorFamily,
  step: string | number,
): string {
  const resolved = resolveLegacyColor(family, step)
  if (resolved.family === "atmosphere") {
    return `var(--rootsy-atmosphere-${resolved.step})`
  }
  return `var(--rootsy-${resolved.family}-${resolved.step})`
}

/** Hex literal para TS / canvas / docs. */
export function rootsyColorHex(
  family: LegacyRootsyColorFamily,
  step: string | number,
): string {
  const resolved = resolveLegacyColor(family, step)
  if (resolved.family === "atmosphere") {
    const hex = ROOTSY_ATMOSPHERE[resolved.step as keyof typeof ROOTSY_ATMOSPHERE]
    if (!hex) throw new Error(`Unknown atmosphere color: ${resolved.step}`)
    return hex
  }
  const ramp = ROOTSY_COLOR_RAMPS[resolved.family] as Record<string, string>
  const hex = ramp[resolved.step]
  if (!hex) {
    throw new Error(`Unknown rootsy color: ${resolved.family}.${resolved.step}`)
  }
  return hex
}

/** Atajos semánticos usados en demos y componentes. */
export const ROOTSY_COLOR_SEMANTIC = {
  white: "#FFFFFF",
  textOnDark: "#F4F8F6",
  action: rootsyColorHex("savia", "600"),
  actionHover: rootsyColorHex("savia", "700"),
  accent: rootsyColorHex("savia", "400"),
  promoGradientEnd: rootsyColorHex("savia", "teal"),
} as const
