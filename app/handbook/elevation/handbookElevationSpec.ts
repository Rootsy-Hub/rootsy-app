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
    stage: "var(--rootsy-sombra-950)",
    themeClass: "rootsy-theme-pos",
    headingId: "sotobosque-sombra",
    sunkenVs: {
      sunken: "Opaco — negro o sombra 950. El pozo sobre la hoja 800. Agrupa canvas, rail y toolbox.",
      neutral: "Transparente — hereda el dosel. Usar cuando el fondo debe continuar la pila.",
    },
  },
] as const

const LIGHT_SHADOW_RAISED = "0 1px 2px rgb(5 8 7 / 0.07), 0 4px 14px rgb(5 8 7 / 0.08)"
const LIGHT_SHADOW_OVERLAY = "0 22px 70px -18px rgb(5 8 7 / 0.28)"
const DARK_SHADOW_RAISED = "0 1px 2px rgb(0 0 0 / 0.35), 0 8px 24px rgb(0 0 0 / 0.45)"
const DARK_SHADOW_OVERLAY = "0 24px 80px -16px rgb(0 0 0 / 0.65)"

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
      boxShadow: LIGHT_SHADOW_RAISED,
    },
    overlay: {
      background: "var(--rootsy-blanco)",
      boxShadow: LIGHT_SHADOW_OVERLAY,
    },
  },
  sombra: {
    sunken: { background: "var(--rootsy-negro)" },
    default: { background: "var(--rootsy-sombra-800)" },
    "default-bordered": {
      background: "var(--rootsy-negro)",
      border: "1px solid var(--rootsy-bruma-800)",
    },
    raised: {
      background: "var(--rootsy-sombra-800)",
      boxShadow: DARK_SHADOW_RAISED,
    },
    overlay: {
      background: "var(--rootsy-sombra-800)",
      boxShadow: DARK_SHADOW_OVERLAY,
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
  sombra: {
    sunken: {
      usage: "Pozo negro. Canvas, rail y toolbox. Solo sobre default oscuro.",
      pairRule: "Sin sombra. No usar sobre raised u overlay.",
    },
    default: {
      usage: "Hoja 800. Toolbar, panel y slots donde se opera.",
      pairRule: "Tarjetas planas: sumar borde bruma 800.",
    },
    "default-bordered": {
      usage: "Tarjetas de producto, slots y listas densas.",
      pairRule: "1px border bruma 800 · sin shadow.",
    },
    raised: {
      usage: "Cards con foco, hover en entidades, una zona que se levanta.",
      pairRule: "Siempre con elevation.shadow.raised.",
    },
    overlay: {
      usage: "Diálogos, menús, toolbars flotantes sobre el dosel.",
      pairRule: "Siempre con elevation.shadow.overlay.",
    },
  },
}
