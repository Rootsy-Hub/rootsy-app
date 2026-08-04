/**
 * Sistema de borde Rootsy — fuente de verdad del design system.
 * Alineado a Atlassian Border: width + color siempre emparejados.
 */

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

export const ROOTSY_BORDER_MANIFESTO =
  "Los bordes delimitan sin gritar: una vena de 1px para dividir, 2px cuando algo está seleccionado o recibe foco por teclado. Ancho y color van juntos — border.width.selected siempre con color.border.selected, border.width.focused siempre con color.border.focused en canopy."

export const ROOTSY_BORDER_PRINCIPLES = [
  {
    title: "Ancho + color",
    detail: "Nunca aplicar grosor sin el token de color que comunica el estado.",
  },
  {
    title: "Hairline canopy",
    detail: "Dividers sutiles con border-border/70 o --rootsy-hairline — no negro duro.",
  },
  {
    title: "Foco accesible",
    detail: "Ring 2px emerald-700/45 en formularios — contraste visible para teclado.",
  },
  {
    title: "Selección clara",
    detail: "2px primary/canopy cuando el usuario elige tab, segment o ítem activo.",
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
    usage: "Tab activo, segment seleccionado, ítem elegido en lista.",
    pairWith: "color.border.selected",
  },
  {
    id: "focused",
    token: "border.width.focused",
    natureName: "Foco",
    value: "2px",
    usage: "Focus ring en elementos interactivos — teclado Tab.",
    pairWith: "color.border.focused",
  },
]

export const ROOTSY_BORDER_COLOR_TOKENS = [
  {
    token: "color.border",
    value: "oklch(0.88 0.025 130)",
    tailwind: "border-border · border-zinc-200 (light form)",
    usage: "Default · dividers · SpecCard border-border/70.",
  },
  {
    token: "color.border.subtle",
    value: "oklch(0.90 0.02 130)",
    tailwind: "--rootsy-hairline",
    usage: "Hairlines en landing y chrome ligero.",
  },
  {
    token: "color.border.selected",
    value: "oklch(0.55 0.14 155)",
    tailwind: "border-primary · border-emerald-600",
    usage: "Par con border.width.selected.",
  },
  {
    token: "color.border.focused",
    value: "oklch(0.45 0.12 155)",
    tailwind: "ring-emerald-700/45 · border-emerald-700",
    usage: "Par con border.width.focused · rootsFormControlBaseClass.",
  },
  {
    token: "color.border.danger",
    value: "oklch(0.55 0.2 25)",
    tailwind: "border-destructive · aria-invalid",
    usage: "Validación de error en campos.",
  },
] as const

export const ROOTSY_BORDER_PAIRINGS: BorderColorPairing[] = [
  {
    id: "default",
    widthToken: "border.width",
    colorToken: "color.border",
    cssExample: "border border-border/70",
    usage: "Cards de librería, paneles checkout, listas.",
  },
  {
    id: "selected",
    widthToken: "border.width.selected",
    colorToken: "color.border.selected",
    cssExample: "border-2 border-primary",
    usage: "RootsFormSegmentField · tab activo.",
  },
  {
    id: "focused",
    widthToken: "border.width.focused",
    colorToken: "color.border.focused",
    cssExample: "focus-visible:ring-2 focus-visible:ring-emerald-700/45",
    usage: "Inputs, selects, botones — sin ring-offset en light form.",
  },
  {
    id: "invalid",
    widthToken: "border.width",
    colorToken: "color.border.danger",
    cssExample: "aria-invalid:border-destructive aria-invalid:ring-destructive/25",
    usage: "RootsForm*Field en error.",
  },
]

export const ROOTSY_BORDER_SEMANTIC: BorderSemanticMapping[] = [
  {
    token: "border.form.control",
    component: "RootsFormTextField · Select · Date",
    widthToken: "border.width",
    colorToken: "color.border",
    source: "rootsFormStyles.ts · border-zinc-200",
  },
  {
    token: "border.form.focus",
    component: "rootsFormControlBaseClass",
    widthToken: "border.width.focused",
    colorToken: "color.border.focused",
    source: "focus-visible:ring-2 ring-emerald-700/45",
  },
  {
    token: "border.library.card",
    component: "SpecCard",
    widthToken: "border.width",
    colorToken: "color.border",
    source: "layoutLibraryShared.tsx · border-border/70",
  },
  {
    token: "border.dialog",
    component: "articleDialogIOSShellClass",
    widthToken: "border.width",
    colorToken: "color.border",
    source: "border-black/[0.04]",
  },
  {
    token: "border.workspace.header",
    component: "DataWorkspaceLayout header",
    widthToken: "border.width",
    colorToken: "color.border",
    source: "border-b border-border · ring-zinc-600 dark",
  },
]

export const BORDER_GUIDELINES = {
  do: [
    "Emparejar border.width.selected + color.border.selected.",
    "Usar ring 2px canopy en focus-visible — contraste para teclado.",
    "Preferir border-border/70 sobre negro puro en cards.",
    "Accent border en fondos sutiles para cumplir contraste 3:1.",
  ],
  dont: [
    "No usar 2px de borde sin token de color semántico.",
    "No mezclar ring gris genérico en formularios Rootsy — usar emerald.",
    "No duplicar borde + sombra fuerte en el mismo contenedor sin intención.",
    "No omitir estado focus en controles custom.",
  ],
} as const
