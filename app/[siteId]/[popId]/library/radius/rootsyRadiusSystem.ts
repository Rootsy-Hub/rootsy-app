/**
 * Sistema de radio Rootsy — fuente de verdad del design system.
 * Alineado a Atlassian Radius + valores reales del theme (--radius 0.75rem).
 */

export type RadiusToken = {
  id: string
  token: string
  natureName: string
  value: string
  focusToken?: string
  focusValue?: string
  tailwind: string
  usage: string
}

export type RadiusSemanticMapping = {
  token: string
  component: string
  radiusToken: string
  source: string
}

export const ROOTSY_RADIUS_MANIFESTO =
  "La redondez en Rootsy crece con el elemento: semilla en badges, hoja en inputs, copa en modales, círculo completo en avatares POP. El focus ring siempre respeta la forma — radio del anillo = radio del componente + 2px, offset 2px, en canopy emerald."

export const ROOTSY_RADIUS_PRINCIPLES = [
  {
    title: "Escala orgánica",
    detail: "Más redondez en contenedores grandes — menos en detalle y datos densos.",
  },
  {
    title: "Focus +2px",
    detail: "radius.focus.* = radius.* + 2px — no calcular a mano en diseño.",
  },
  {
    title: "Tile exclusivo",
    detail: "radius.tile solo para logomark Rootsy y tiles de iconografía — ~34% del lado.",
  },
  {
    title: "Full para personas",
    detail: "Avatares POP y pills circulares — rounded-full, no radius arbitrario.",
  },
] as const

/** Valores alineados a --radius: 0.75rem (12px) como large/xlarge en producto. */
export const ROOTSY_RADIUS_TOKENS: RadiusToken[] = [
  {
    id: "xsmall",
    token: "radius.xsmall",
    natureName: "Semilla",
    value: "2px",
    focusToken: "radius.focus.xsmall",
    focusValue: "4px",
    tailwind: "rounded-[2px]",
    usage: "Badges mínimos, keyboard shortcuts en tooltip.",
  },
  {
    id: "small",
    token: "radius.small",
    natureName: "Brotito",
    value: "4px",
    focusToken: "radius.focus.small",
    focusValue: "6px",
    tailwind: "rounded-sm (theme ~8px) · rounded-[4px] doc",
    usage: "Tags, timestamps, thumbs en tablas, botones compactos internos.",
  },
  {
    id: "medium",
    token: "radius.medium",
    natureName: "Hoja",
    value: "8px",
    focusToken: "radius.focus.medium",
    focusValue: "10px",
    tailwind: "rounded-md",
    usage: "Segment pills internos, botones icono, calendario día.",
  },
  {
    id: "large",
    token: "radius.large",
    natureName: "Rama",
    value: "12px",
    focusToken: "radius.focus.large",
    focusValue: "14px",
    tailwind: "rounded-lg · --radius-lg",
    usage: "Inputs, selects, buttons, dropdowns — light form.",
  },
  {
    id: "xlarge",
    token: "radius.xlarge",
    natureName: "Tronco",
    value: "16px",
    focusToken: "radius.focus.xlarge",
    focusValue: "18px",
    tailwind: "rounded-xl · --radius-xl",
    usage: "Cards, SpecCard, paneles checkout, floating UI.",
  },
  {
    id: "xxlarge",
    token: "radius.xxlarge",
    natureName: "Copa",
    value: "22px",
    focusToken: "radius.focus.xxlarge",
    focusValue: "24px",
    tailwind: "rounded-[1.375rem]",
    usage: "Modales articleDialog · contenedores full-page.",
  },
  {
    id: "full",
    token: "radius.full",
    natureName: "Redondo",
    value: "9999px",
    focusToken: undefined,
    focusValue: undefined,
    tailwind: "rounded-full",
    usage: "Avatares POP en home, switch thumb, pills circulares.",
  },
  {
    id: "tile",
    token: "radius.tile",
    natureName: "Loseta",
    value: "~34% del lado",
    focusToken: undefined,
    focusValue: undefined,
    tailwind: "rx ≈ 9.95 / 29 en logomark SVG",
    usage: "Solo logomark Rootsy e icon tiles — no reutilizar fuera.",
  },
]

export const ROOTSY_RADIUS_SEMANTIC: RadiusSemanticMapping[] = [
  {
    token: "radius.form.control",
    component: "RootsFormTextField · Money · Select",
    radiusToken: "radius.large",
    source: "rootsFormStyles · rounded-lg",
  },
  {
    token: "radius.form.segment",
    component: "RootsFormSegmentField",
    radiusToken: "radius.large",
    source: "outer rounded-lg · inner rounded-md",
  },
  {
    token: "radius.card.library",
    component: "SpecCard · Library panels",
    radiusToken: "radius.xlarge",
    source: "rounded-2xl (1rem) en doc · rounded-xl en cards",
  },
  {
    token: "radius.dialog",
    component: "articleDialogSurfaceClass",
    radiusToken: "radius.xxlarge",
    source: "rounded-[1.375rem]",
  },
  {
    token: "radius.avatar.pop",
    component: "Home POP picker · header logomark",
    radiusToken: "radius.full / radius.large",
    source: "rounded-full home · rounded-lg header 32px",
  },
  {
    token: "radius.logo.tile",
    component: "Rootsy logomark",
    radiusToken: "radius.tile",
    source: "public/rootsy-logo.svg",
  },
]

export const RADIUS_GUIDELINES = {
  do: [
    "Usar rounded-lg en todos los controles light form.",
    "Modal con rounded-[1.375rem] — no mezclar con rounded-xl.",
    "Focus ring offset 2px y radio +2px respecto al control.",
    "rounded-full solo para avatares y elementos circulares.",
  ],
  dont: [
    "No usar radius.tile en cards o inputs.",
    "No inventar rounded-[13px] — elegir token de la escala.",
    "No poner rounded-2xl en inputs — demasiado blando para datos.",
    "No omitir radius.focus en specs de diseño Figma.",
  ],
} as const

export const ROOTSY_RADIUS_THEME = {
  base: "0.75rem",
  sm: "calc(var(--radius) - 4px)",
  md: "calc(var(--radius) - 2px)",
  lg: "var(--radius)",
  xl: "calc(var(--radius) + 4px)",
} as const
