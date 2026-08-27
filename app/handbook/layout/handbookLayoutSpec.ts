/**
 * Spec de layout del handbook.
 * Grilla, contenedores y breakpoints salen de /library. Acá vive el criterio de uso.
 */

import {
  GRID_ALIGNMENT_GUIDELINES,
  GRID_ANATOMY_PARTS,
  GRID_LAYOUT_ANATOMY,
  GRID_SPAN_PRESETS,
  ROOTSY_GRID_BREAKPOINTS,
  ROOTSY_GRID_TYPES,
} from "@/app/library/grid/rootsyGridSystem"

export const HANDBOOK_GRID_BREAKPOINTS = ROOTSY_GRID_BREAKPOINTS
export const HANDBOOK_GRID_TYPES = ROOTSY_GRID_TYPES
export const HANDBOOK_GRID_ANATOMY = GRID_ANATOMY_PARTS
export const HANDBOOK_GRID_SPANS = GRID_SPAN_PRESETS
export const HANDBOOK_GRID_GUIDELINES = GRID_ALIGNMENT_GUIDELINES
export const HANDBOOK_LAYOUT_SHELL = GRID_LAYOUT_ANATOMY

export const HANDBOOK_LAYOUT_PRINCIPLES = [
  {
    title: "El claro, no el chrome",
    detail:
      "La grilla vive en el área de contenido. Nav, panel y overlays quedan fuera.",
  },
  {
    title: "12 · 6 · 2",
    detail:
      "Doce surcos en desktop, seis en tablet, dos en móvil. Tres lecturas, no seis reglas.",
  },
  {
    title: "Fixed-wide por defecto",
    detail:
      "1296px para workspace. Fluid solo cuando el contenido no tiene techo horizontal.",
  },
] as const

export const HANDBOOK_LAYOUT_DEVICES = [
  {
    id: "mobile",
    label: "Móvil",
    columns: 2,
    range: "320–479px",
    gutter: "space.150",
    margin: "space.200",
  },
  {
    id: "tablet",
    label: "Tablet",
    columns: 6,
    range: "480–1023px",
    gutter: "space.150",
    margin: "space.200",
  },
  {
    id: "desktop",
    label: "Desktop",
    columns: 12,
    range: "1024px+",
    gutter: "space.200",
    margin: "space.400",
  },
] as const
