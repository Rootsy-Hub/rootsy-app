/**
 * Spec de superficies del handbook.
 * Bordes, radio y elevación salen de /library. Fondos, de las atmósferas.
 */

import {
  ROOTSY_BORDER_COLOR_TOKENS,
  ROOTSY_BORDER_PAIRINGS,
  ROOTSY_BORDER_WIDTHS,
} from "@/app/library/border/rootsyBorderSystem"
import {
  ROOTSY_ELEVATION_LEVELS,
  ROOTSY_ELEVATION_SHADOW_TOKENS,
  ROOTSY_ELEVATION_SURFACES_DARK,
  ROOTSY_ELEVATION_SURFACES_LIGHT,
  ROOTSY_ELEVATION_Z_INDEX,
} from "@/app/library/elevation/rootsyElevationSystem"
import { ROOTSY_RADIUS_TOKENS } from "@/app/library/radius/rootsyRadiusSystem"
import {
  HANDBOOK_ATMOSPHERE_CONTEXTS,
  HANDBOOK_ATMOSPHERE_TOKENS,
} from "@/app/handbook/color/handbookColorSpec"

export const HANDBOOK_SURFACE_ATMOSPHERES = HANDBOOK_ATMOSPHERE_CONTEXTS
export const HANDBOOK_SURFACE_TOKENS = HANDBOOK_ATMOSPHERE_TOKENS.filter((token) =>
  ["fondo", "superficie", "elevada"].includes(token.id),
)
export const HANDBOOK_BORDER_WIDTHS = ROOTSY_BORDER_WIDTHS
export const HANDBOOK_BORDER_COLORS = ROOTSY_BORDER_COLOR_TOKENS
export const HANDBOOK_BORDER_PAIRINGS = ROOTSY_BORDER_PAIRINGS
export const HANDBOOK_RADIUS_TOKENS = ROOTSY_RADIUS_TOKENS
export const HANDBOOK_ELEVATION_LEVELS = ROOTSY_ELEVATION_LEVELS
export const HANDBOOK_ELEVATION_SHADOWS = ROOTSY_ELEVATION_SHADOW_TOKENS
export const HANDBOOK_ELEVATION_LIGHT = ROOTSY_ELEVATION_SURFACES_LIGHT
export const HANDBOOK_ELEVATION_DARK = ROOTSY_ELEVATION_SURFACES_DARK
export const HANDBOOK_Z_INDEX = ROOTSY_ELEVATION_Z_INDEX

export const HANDBOOK_SURFACE_PRINCIPLES = [
  {
    title: "El aire primero",
    detail:
      "Éter, bruma o sombra pintan el lienzo. La superficie y la elevada se leen encima.",
  },
  {
    title: "Borde antes que sombra",
    detail:
      "1px bruma alcanza. Raised solo con drag, modal o un foco único.",
  },
  {
    title: "La curva crece con el elemento",
    detail:
      "Large en controles, xlarge en cards, xxlarge en modales. Tile solo en el logomark.",
  },
] as const
