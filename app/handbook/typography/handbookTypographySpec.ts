/**
 * Spec de tipografía del handbook.
 * Los tokens salen del design system. Acá vive el criterio de uso.
 */

import {
  ROOTSY_FONT_FAMILIES,
  ROOTSY_FONT_WEIGHT_STEPS,
  ROOTSY_TEXT_STYLES,
  ROOTSY_TYPE_ROLES,
  ROOTSY_TYPE_SCALE,
  ROOTSY_TYPE_SCALE_STEPS,
  type RootsyTextStyleId,
} from "@/lib/design-system/tokens/typography"

export const HANDBOOK_TYPE_VOICES = [
  ROOTSY_FONT_FAMILIES.ui,
  ROOTSY_FONT_FAMILIES.reading,
  ROOTSY_FONT_FAMILIES.numeric,
] as const

export const HANDBOOK_TYPE_WEIGHTS = ROOTSY_FONT_WEIGHT_STEPS
export const HANDBOOK_TYPE_ROLES = ROOTSY_TYPE_ROLES
export const HANDBOOK_TYPE_SCALE = ROOTSY_TYPE_SCALE
export const HANDBOOK_TYPE_SCALE_STEPS = ROOTSY_TYPE_SCALE_STEPS

export const HANDBOOK_TEXT_STYLE_ORDER: RootsyTextStyleId[] = [
  "heading.xxlarge",
  "heading.xlarge",
  "heading.large",
  "heading.medium",
  "heading.small",
  "heading.xsmall",
  "heading.xxsmall",
  "body.large",
  "body",
  "body.small",
  "metric.large",
  "metric.medium",
  "metric.small",
]

export const HANDBOOK_TEXT_STYLES = HANDBOOK_TEXT_STYLE_ORDER.map((id) => ({
  id,
  token: `font.${id}`,
  cssSize: `--rootsy-text-${id.replace(/\./g, "-")}-size`,
  ...ROOTSY_TEXT_STYLES[id],
}))

export const HANDBOOK_TYPE_PRINCIPLES = [
  {
    title: "Se lee solo",
    detail: "Título, contexto, cuerpo, dato. Si hay que explicar la jerarquía, está mal armada.",
  },
  {
    title: "Dos familias",
    detail: "Inter en chrome y montos. Nunito Sans en la prosa. No se mezclan en la misma línea.",
  },
  {
    title: "La escala alcanza",
    detail: "Si dudás, subí o bajá un nivel. Un px suelto no entra.",
  },
] as const

export const HANDBOOK_HIERARCHY_LAYERS = [
  {
    id: "titulo",
    label: "Título",
    token: "heading.large",
    sample: "Nueva venta",
    note: "Un h1. Dice dónde estás.",
  },
  {
    id: "contexto",
    label: "Contexto",
    token: "body.small",
    sample: "Mostrador · hoy",
    note: "Metadata. No compite con el título.",
  },
  {
    id: "cuerpo",
    label: "Cuerpo",
    token: "body",
    sample: "Medialuna clásica",
    note: "Copy de interfaz. 14px en componentes.",
  },
  {
    id: "dato",
    label: "Dato",
    token: "metric.large",
    sample: "$ 4.800",
    note: "Inter bold. La etiqueta debajo es body.small.",
  },
] as const

export const HANDBOOK_HIERARCHY_RULES = [
  "Un h1 por pantalla, emparejado con heading.large.",
  "La secuencia semántica es h1 → h2 → h3, sin saltar niveles.",
  "El peso no reemplaza al heading: un bold suelto no es un título.",
  "En una vista conviven como mucho un título, un contexto, un cuerpo y un dato hero.",
] as const

export const HANDBOOK_EDITORIAL_RULES = [
  "Nunito Sans a 16px / 1.5, con un renglón de unas 65 caracteres.",
  "El handbook, la ayuda y los vacíos largos son prosa: Nunito Sans, ritmo abierto. Los controles siguen en Inter a 14px.",
  "Una idea por párrafo. Frases cortas, español de producto.",
  "Mayúsculas sostenidas solo en acrónimos e IDs (ART-001). Nunca en palabras completas.",
  "El número no se escribe con Nunito. El artículo no se escribe con Inter.",
] as const

export const HANDBOOK_TYPE_A11Y = [
  "16px (body.large) para lectura prolongada.",
  "12px (body.small) solo en metadata — nunca un párrafo.",
  "Contraste de texto con los tokens de color: WCAG AA.",
  "rem en tamaño y interlineado, para respetar el zoom del navegador.",
  "12px es el piso. Un label de 10px o 11px no entra.",
] as const
