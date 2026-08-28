/**
 * Spec de espaciado del handbook.
 * La escala y los roles salen de /library. Acá vive el criterio de uso.
 */

import {
  LAYOUT_PRIMITIVES,
  NATURE_RHYTHM_TIERS,
  ROOTSY_NEGATIVE_SPACING_TOKENS,
  ROOTSY_SPACING_BASE_PX,
  ROOTSY_SPACING_SEMANTIC_ROLES,
  ROOTSY_SPACING_TOKENS,
  SPACING_LAYOUT_GUIDELINES,
  SPACING_RANGE_META,
} from "@/app/library/spacing/rootsySpacingScale"

export const HANDBOOK_SPACING_BASE_PX = ROOTSY_SPACING_BASE_PX
export const HANDBOOK_SPACING_TOKENS = ROOTSY_SPACING_TOKENS
export const HANDBOOK_SPACING_TIERS = NATURE_RHYTHM_TIERS
export const HANDBOOK_SPACING_ROLES = ROOTSY_SPACING_SEMANTIC_ROLES
export const HANDBOOK_SPACING_RANGES = SPACING_RANGE_META
export const HANDBOOK_SPACING_NEGATIVES = ROOTSY_NEGATIVE_SPACING_TOKENS
export const HANDBOOK_SPACING_GUIDELINES = SPACING_LAYOUT_GUIDELINES
export const HANDBOOK_LAYOUT_PRIMITIVES = LAYOUT_PRIMITIVES

export const HANDBOOK_SPACING_PRINCIPLES = [
  {
    title: "Proximidad",
    detail:
      "Lo relacionado cerca. Label, campo e hint en el mismo tallo; los capítulos, con claro.",
  },
  {
    title: "Base 8px",
    detail:
      "space.100 es el latido. Tokens en código y Figma. Sin 7px, sin 15px, sin excepciones.",
  },
  {
    title: "Ritmo",
    detail:
      "Más espacio es más separación semántica. El vacío guía la mirada; no rellena.",
  },
] as const

export const HANDBOOK_SPACING_DENSITIES = [
  {
    id: "compact",
    label: "Compacta",
    range: "small" as const,
    token: "space.050",
    gapPx: 4,
    usage: "Tablas, chips, badges, ícono junto al texto. La operación cabe en una mirada.",
  },
  {
    id: "comfortable",
    label: "Cómoda",
    range: "medium" as const,
    token: "space.200",
    gapPx: 16,
    usage: "Formularios, listas, cards. El componente respira sin perder densidad.",
  },
  {
    id: "spacious",
    label: "Amplia",
    range: "large" as const,
    token: "space.400",
    gapPx: 32,
    usage: "Secciones de página, modales, héroes. El claro marca un capítulo nuevo.",
  },
] as const
