/**
 * Spec de borde del handbook.
 * Anchos, colores y pares salen de /library. Acá vive el criterio de uso.
 */

import {
  BORDER_GUIDELINES,
  ROOTSY_BORDER_COLOR_TOKENS,
  ROOTSY_BORDER_PAIRINGS,
  ROOTSY_BORDER_SEMANTIC,
  ROOTSY_BORDER_WIDTHS,
} from "@/app/library/border/rootsyBorderSystem"

export const HANDBOOK_BORDER_WIDTHS = ROOTSY_BORDER_WIDTHS
export const HANDBOOK_BORDER_COLORS = ROOTSY_BORDER_COLOR_TOKENS
export const HANDBOOK_BORDER_PAIRINGS = ROOTSY_BORDER_PAIRINGS
export const HANDBOOK_BORDER_SEMANTIC = ROOTSY_BORDER_SEMANTIC
export const HANDBOOK_BORDER_GUIDELINES = BORDER_GUIDELINES

export const HANDBOOK_BORDER_PRINCIPLES = [
  {
    title: "Divide, no decora",
    detail: "Hairline bruma en reposo. El dato manda; el contorno orienta.",
  },
  {
    title: "Tres estados",
    detail: "1px en reposo. 2px savia al elegir. Ring savia 400 al enfocar.",
  },
  {
    title: "Ancho + color juntos",
    detail: "Nunca 2px gris suelto. Cada ancho trae su par de color.",
  },
] as const
