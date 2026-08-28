/**
 * Spec de elevación del handbook.
 * Niveles, sombras y z-index salen de /library. Acá vive el criterio de uso.
 */

import {
  ELEVATION_GUIDELINES,
  ROOTSY_ELEVATION_INTERACTION,
  ROOTSY_ELEVATION_LEVELS,
  ROOTSY_ELEVATION_SEMANTIC,
  ROOTSY_ELEVATION_SHADOW_TOKENS,
  ROOTSY_ELEVATION_SURFACES_DARK,
  ROOTSY_ELEVATION_SURFACES_LIGHT,
  ROOTSY_ELEVATION_Z_INDEX,
  SUNKEN_VS_NEUTRAL,
} from "@/app/library/elevation/rootsyElevationSystem"
import { rootsyColorHex } from "@/lib/design-system/tokens/colors"

export const HANDBOOK_ELEVATION_LEVELS = ROOTSY_ELEVATION_LEVELS
export const HANDBOOK_ELEVATION_SHADOWS = ROOTSY_ELEVATION_SHADOW_TOKENS
export const HANDBOOK_ELEVATION_LIGHT = ROOTSY_ELEVATION_SURFACES_LIGHT
export const HANDBOOK_ELEVATION_DARK = ROOTSY_ELEVATION_SURFACES_DARK
export const HANDBOOK_ELEVATION_INTERACTION = ROOTSY_ELEVATION_INTERACTION
export const HANDBOOK_ELEVATION_SEMANTIC = ROOTSY_ELEVATION_SEMANTIC
export const HANDBOOK_ELEVATION_Z_INDEX = ROOTSY_ELEVATION_Z_INDEX
export const HANDBOOK_SUNKEN_VS_NEUTRAL = SUNKEN_VS_NEUTRAL
export const HANDBOOK_ELEVATION_GUIDELINES = ELEVATION_GUIDELINES

export const HANDBOOK_ELEVATION_PRINCIPLES = [
  {
    title: "Tres lecturas",
    detail: "Hundido para agrupar. Plano para trabajar. Flotante para interrumpir.",
  },
  {
    title: "Borde antes que sombra",
    detail: "1px bruma alcanza. Raised solo con drag, modal o un foco único.",
  },
  {
    title: "Par surface + shadow",
    detail: "Raised con shadow.raised. Overlay con shadow.overlay. Sunken no lleva sombra.",
  },
] as const

export type HandbookElevationAtmosphereId = "bruma" | "sombra"

export const HANDBOOK_ELEVATION_ATMOSPHERES = [
  {
    id: "bruma" as const,
    name: "Sotobosque · Luz filtrada",
    stage: "var(--rootsy-bruma-100)",
    themeClass: "",
    headingId: "sotobosque-luz-filtrada",
    sunkenVs: {
      sunken: "Opaco — bruma 50. Agrupa en la misma capa (kanban, panel anidado, zebra).",
      neutral: "Transparente — hereda elevación del padre. Usar cuando el fondo debe continuar la pila.",
    },
  },
  {
    id: "sombra" as const,
    name: "Sotobosque · Sombra",
    stage: "var(--rootsy-sombra-900)",
    themeClass: "rootsy-theme-pos",
    headingId: "sotobosque-sombra",
    sunkenVs: {
      sunken: "Opaco — sombra 950. El pozo sobre el suelo 900. Agrupa canvas, rail y toolbox.",
      neutral: "Transparente — hereda el dosel. Usar cuando el fondo debe continuar la pila.",
    },
  },
] as const

function hexToRgbChannels(hex: string): string {
  const h = hex.replace("#", "")
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)).join(" ")
}

function elevationShadowRaised(rgb: string) {
  return `0 1px 2px rgb(${rgb} / 0.07), 0 4px 14px rgb(${rgb} / 0.08)`
}

function elevationShadowOverlay(rgb: string) {
  return `0 22px 70px -18px rgb(${rgb} / 0.28)`
}

const BRUMA_SHADOW_RGB = "5 8 7"
const SOMBRA_50_RGB = hexToRgbChannels(rootsyColorHex("sombra", "50"))

export const HANDBOOK_ELEVATION_LEVEL_SURFACES: Record<
  HandbookElevationAtmosphereId,
  Record<string, { background: string; border?: string; boxShadow?: string }>
> = {
  bruma: {
    sunken: { background: "var(--rootsy-bruma-50)" },
    default: { background: "var(--rootsy-bruma-100)" },
    "default-bordered": {
      background: "var(--rootsy-bruma-100)",
      border: "1px solid var(--rootsy-bruma-200)",
    },
    raised: {
      background: "var(--rootsy-blanco)",
      boxShadow: elevationShadowRaised(BRUMA_SHADOW_RGB),
    },
    overlay: {
      background: "var(--rootsy-blanco)",
      boxShadow: elevationShadowOverlay(BRUMA_SHADOW_RGB),
    },
  },
  sombra: {
    sunken: { background: "var(--rootsy-sombra-950)" },
    default: { background: "var(--rootsy-sombra-900)" },
    "default-bordered": {
      background: "var(--rootsy-sombra-900)",
      border: "1px solid var(--rootsy-sombra-800)",
    },
    raised: {
      background: "var(--rootsy-negro)",
      boxShadow: elevationShadowRaised(SOMBRA_50_RGB),
    },
    overlay: {
      background: "var(--rootsy-negro)",
      boxShadow: elevationShadowOverlay(SOMBRA_50_RGB),
    },
  },
}

export const HANDBOOK_ELEVATION_LEVEL_COPY: Record<
  HandbookElevationAtmosphereId,
  Record<string, { usage: string; pairRule?: string }>
> = {
  bruma: Object.fromEntries(
    HANDBOOK_ELEVATION_LEVELS.map((level) => [
      level.id,
      { usage: level.usage, pairRule: level.pairRule },
    ]),
  ),
  sombra: Object.fromEntries(
    HANDBOOK_ELEVATION_LEVELS.map((level) => [
      level.id,
      { usage: level.usage, pairRule: level.pairRule },
    ]),
  ),
}
