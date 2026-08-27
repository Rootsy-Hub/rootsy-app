/**
 * Spec de radios del handbook.
 * Escala y semántica salen de /library. Acá vive el criterio de uso.
 */

import {
  RADIUS_GUIDELINES,
  ROOTSY_RADIUS_SEMANTIC,
  ROOTSY_RADIUS_THEME,
  ROOTSY_RADIUS_TOKENS,
} from "@/app/library/radius/rootsyRadiusSystem"

export const HANDBOOK_RADIUS_TOKENS = ROOTSY_RADIUS_TOKENS
export const HANDBOOK_RADIUS_SEMANTIC = ROOTSY_RADIUS_SEMANTIC
export const HANDBOOK_RADIUS_THEME = ROOTSY_RADIUS_THEME
export const HANDBOOK_RADIUS_GUIDELINES = RADIUS_GUIDELINES

export const HANDBOOK_RADIUS_PRINCIPLES = [
  {
    title: "La curva crece con el elemento",
    detail: "Poco redondeo en datos densos. Más donde el contenedor abraza.",
  },
  {
    title: "Tres paradas cubren casi todo",
    detail: "Large en controles, xlarge en cards, xxlarge en modales.",
  },
  {
    title: "Focus +2px savia",
    detail: "El anillo sigue la forma del control. Tile solo en el logomark.",
  },
] as const
