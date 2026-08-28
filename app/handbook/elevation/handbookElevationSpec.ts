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
