/**
 * Sistema de borde Rootsy — ancho + color siempre emparejados.
 * Alineado a bruma · sombra · savia del design system.
 */

import { rootsyColorHex } from "@/lib/design-system"

const hx = rootsyColorHex

export type BorderWidthToken = {
  id: string
  token: string
  natureName: string
  value: string
  usage: string
  pairWith: string
}

export type BorderColorPairing = {
  id: string
  widthToken: string
  colorToken: string
  cssExample: string
  usage: string
}

export type BorderSemanticMapping = {
  token: string
  component: string
  widthToken: string
  colorToken: string
  source: string
}

export const ROOTSY_BORDER_CONCEPT = {
  title: "Delimitar sin gritar",
  lead:
    "Un borde en Rootsy casi no se nota — como la orilla de un sendero: está, separa, pero el ojo sigue caminando. Solo savia interrumpe cuando hay foco o elección.",
  why: [
    "Naturalidad: hairline bruma en ticket — neblina que divide, no reja metálica.",
    "Simplicidad: tres estados visuales — reposo (1px), selección (2px savia), foco (ring savia). Nada más.",
    "Intuitivo: si el contorno compite con el dato, es demasiado fuerte; el borde orienta, no decora.",
  ],
  closing:
    "Formas claras, contorno definido — pero el contenido manda. Como dice el concepto: pocos datos, bien presentados.",
} as const

export const ROOTSY_BORDER_MANIFESTO =
  "Los bordes dividen, no decoran: hairline bruma en ticket y tablas; sombra-border en catálogo; savia 400 cuando hay foco o selección. Ancho y color siempre emparejados — nunca 2px gris genérico."

export const ROOTSY_BORDER_PRINCIPLES = [
  {
    title: "Intuitivo · tres estados",
    detail:
      "Reposo, selección, foco — el usuario distingue sin leer especificaciones de ancho.",
  },
  {
    title: "Simplicidad · hairline",
    detail:
      "1px bruma para dividir; 2px solo cuando hay intención (elegir o enfocar).",
  },
  {
    title: "Naturalidad · bruma y sombra",
    detail:
      "Ticket respira con bruma 200; catálogo usa sombra-border — cada ambiente su neutro.",
  },
  {
    title: "Formas claras",
    detail:
      "Ancho y color siempre juntos — contorno definido, nunca gris genérico suelto.",
  },
] as const

export const ROOTSY_BORDER_WIDTHS: BorderWidthToken[] = [
  {
    id: "default",
    token: "border.width",
    natureName: "Vena",
    value: "1px",
    usage: "Bordes estándar, dividers, cards, inputs en reposo.",
    pairWith: "color.border",
  },
  {
    id: "selected",
    token: "border.width.selected",
    natureName: "Selección",
    value: "2px",
    usage: "Tab activo, segment seleccionado, ítem elegido.",
    pairWith: "color.border.selected",
  },
  {
    id: "focused",
    token: "border.width.focused",
    natureName: "Foco",
    value: "2px",
    usage: "Focus ring — teclado Tab.",
    pairWith: "color.border.focused",
  },
]

export const ROOTSY_BORDER_COLOR_TOKENS = [
  {
    token: "color.border",
    value: hx("bruma", "200"),
    tailwind: "border-border · --color-border",
    usage: "Default claro — SpecCard, ticket, inputs.",
  },
  {
    token: "color.border.subtle",
    value: hx("bruma", "200"),
    tailwind: "border-border/70",
    usage: "Hairlines en librería y workspace.",
  },
  {
    token: "color.border.dark",
    value: hx("sombra", "border"),
    tailwind: "--rootsy-sombra-border",
    usage: "Rail, cards y toolbox POS.",
  },
  {
    token: "color.border.selected",
    value: hx("savia", "600"),
    tailwind: "border-primary",
    usage: "Par con border.width.selected.",
  },
  {
    token: "color.border.focused",
    value: hx("savia", "400"),
    tailwind: "ring-savia-400/45",
    usage: "Par con border.width.focused · rootsFormControlBaseClass.",
  },
  {
    token: "color.border.danger",
    value: "#DC2626",
    tailwind: "border-destructive · aria-invalid",
    usage: "Validación de error — funcional, fuera de familias.",
  },
] as const

export const ROOTSY_BORDER_PAIRINGS: BorderColorPairing[] = [
  {
    id: "default-light",
    widthToken: "border.width",
    colorToken: "color.border",
    cssExample: "border border-border/70",
    usage: "Cards librería, ticket, listas workspace.",
  },
  {
    id: "default-dark",
    widthToken: "border.width",
    colorToken: "color.border.dark",
    cssExample: "border border-[--rootsy-sombra-border]",
    usage: "Cards catálogo POS, rail.",
  },
  {
    id: "selected",
    widthToken: "border.width.selected",
    colorToken: "color.border.selected",
    cssExample: "border-2 border-primary",
    usage: "Segment activo · tab seleccionado.",
  },
  {
    id: "focused",
    widthToken: "border.width.focused",
    colorToken: "color.border.focused",
    cssExample: "focus-visible:ring-2 ring-savia-400/45",
    usage: "Inputs, selects, botones.",
  },
  {
    id: "invalid",
    widthToken: "border.width",
    colorToken: "color.border.danger",
    cssExample: "aria-invalid:border-destructive",
    usage: "Campos en error.",
  },
]

export const ROOTSY_BORDER_SEMANTIC: BorderSemanticMapping[] = [
  {
    token: "border.form.control",
    component: "RootsFormTextField · Select",
    widthToken: "border.width",
    colorToken: "color.border",
    source: "rootsFormStyles · bruma 200",
  },
  {
    token: "border.form.focus",
    component: "rootsFormControlBaseClass",
    widthToken: "border.width.focused",
    colorToken: "color.border.focused",
    source: "ring savia 400",
  },
  {
    token: "border.library.card",
    component: "library-spec-card",
    widthToken: "border.width",
    colorToken: "color.border.subtle",
    source: "border bruma 200",
  },
  {
    token: "border.pos.card",
    component: "Product card catálogo",
    widthToken: "border.width",
    colorToken: "color.border.dark",
    source: "sombra-border",
  },
]

export const BORDER_GUIDELINES = {
  do: "Emparejá ancho + color semántico; bruma 200 en claro; savia 400 en foco; sombra-border en POS.",
  dont: "No uses 2px gris sin token; no mezcles ring zinc en formularios Rootsy; no dupliques borde + sombra fuerte.",
} as const
