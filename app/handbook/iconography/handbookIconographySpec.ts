/**
 * Spec de iconografía del handbook.
 * Set, tamaños y roles salen de /library. Acá vive el criterio de uso.
 */

import {
  ICONOGRAPHY_GUIDELINES,
  ROOTSY_ICON_CATEGORIES,
  ROOTSY_ICON_COLOR_ROLES,
  ROOTSY_ICON_LIBRARY,
  ROOTSY_ICON_SIZES,
  ROOTSY_ICON_VARIANTS,
  ROOTSY_ICON_VISUAL_STYLE,
} from "@/app/library/iconography/rootsyIconographySystem"

export const HANDBOOK_ICON_LIBRARY = ROOTSY_ICON_LIBRARY
export const HANDBOOK_ICON_SIZES = ROOTSY_ICON_SIZES
export const HANDBOOK_ICON_COLORS = ROOTSY_ICON_COLOR_ROLES
export const HANDBOOK_ICON_VARIANTS = ROOTSY_ICON_VARIANTS
export const HANDBOOK_ICON_STYLE = ROOTSY_ICON_VISUAL_STYLE
export const HANDBOOK_ICON_CATEGORIES = ROOTSY_ICON_CATEGORIES
export const HANDBOOK_ICON_GUIDELINES = ICONOGRAPHY_GUIDELINES

export const HANDBOOK_ICON_PRINCIPLES = [
  {
    title: "Señal, no adorno",
    detail:
      "Iconsax Linear en UI. La identidad nature vive en color e ilustración, no en el trazo.",
  },
  {
    title: "16px es la base",
    detail:
      "Chevrons a 12px. Large y xlarge solo en tiles y vacíos — nunca en una tabla.",
  },
  {
    title: "Ícono + palabra",
    detail:
      "El label dice la acción. Bold marca activo. Sin hex suelto: icon.color.*",
  },
] as const
