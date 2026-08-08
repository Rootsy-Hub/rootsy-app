/**
 * Sistema de radio Rootsy — escala orgánica alineada al theme (--radius 0.75rem).
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

export const ROOTSY_RADIUS_CONCEPT = {
  title: "Formas que respiran",
  lead:
    "Las curvas en Rootsy siguen proporciones naturales: poco redondeo donde hay datos densos, más donde el contenedor abraza al contenido. Una escala, un idioma — no re-decidir en cada pantalla.",
  why: [
    "Naturalidad: de semilla a copa — la curva crece con el elemento, como en el parque.",
    "Simplicidad: large en controles, xlarge en cards, xxlarge en modales — tres paradas que cubren casi todo.",
    "Intuitivo: si ya usaste un formulario Rootsy, conocés el radio — misma forma en todo el producto.",
  ],
  closing:
    "Formas legibles al primer vistazo: nada de rounded-[13px] ni esquinas que sorprendan.",
} as const

export const ROOTSY_RADIUS_MANIFESTO =
  "De semilla a copa: xsmall en badges, large en controles, xlarge en cards, xxlarge en modales, full en avatares. El tile (~34%) es exclusivo del logomark — no reutilizar. Focus siempre +2px con savia."

export const ROOTSY_RADIUS_PRINCIPLES = [
  {
    title: "Intuitivo · una escala",
    detail:
      "Misma curva en formularios, cards y modales — el usuario no reaprende por pantalla.",
  },
  {
    title: "Proporciones naturales",
    detail:
      "Más redondez en contenedores grandes; menos en tablas y datos densos.",
  },
  {
    title: "Formas claras",
    detail:
      "Controles con contorno definido — rounded-lg en inputs, sin curvas arbitrarias.",
  },
  {
    title: "Focus +2px savia",
    detail:
      "El anillo respeta la forma del control — accesible y coherente con borde y color.",
  },
] as const

export const ROOTSY_RADIUS_TOKENS: RadiusToken[] = [
  {
    id: "xsmall",
    token: "radius.xsmall",
    natureName: "Semilla",
    value: "2px",
    focusToken: "radius.focus.xsmall",
    focusValue: "4px",
    tailwind: "rounded-[2px]",
    usage: "Badges mínimos, shortcuts en tooltip.",
  },
  {
    id: "small",
    token: "radius.small",
    natureName: "Brotito",
    value: "4px",
    focusToken: "radius.focus.small",
    focusValue: "6px",
    tailwind: "rounded-sm",
    usage: "Tags, timestamps, celdas compactas.",
  },
  {
    id: "medium",
    token: "radius.medium",
    natureName: "Hoja",
    value: "8px",
    focusToken: "radius.focus.medium",
    focusValue: "10px",
    tailwind: "rounded-md",
    usage: "Pills internos, botones icono.",
  },
  {
    id: "large",
    token: "radius.large",
    natureName: "Rama",
    value: "12px",
    focusToken: "radius.focus.large",
    focusValue: "14px",
    tailwind: "rounded-lg · --radius-lg",
    usage: "Inputs, selects, buttons — light form.",
  },
  {
    id: "xlarge",
    token: "radius.xlarge",
    natureName: "Tronco",
    value: "16px",
    focusToken: "radius.focus.xlarge",
    focusValue: "18px",
    tailwind: "rounded-xl · --radius-xl",
    usage: "Cards, SpecCard, paneles checkout.",
  },
  {
    id: "xxlarge",
    token: "radius.xxlarge",
    natureName: "Copa",
    value: "22px",
    focusToken: "radius.focus.xxlarge",
    focusValue: "24px",
    tailwind: "rounded-[1.375rem]",
    usage: "Modales articleDialog · full-page.",
  },
  {
    id: "full",
    token: "radius.full",
    natureName: "Redondo",
    value: "9999px",
    tailwind: "rounded-full",
    usage: "Avatares POP, switch thumb, pills circulares.",
  },
  {
    id: "tile",
    token: "radius.tile",
    natureName: "Loseta",
    value: "~34% del lado",
    tailwind: "rx ≈ 34% en logomark SVG",
    usage: "Solo logomark Rootsy — no reutilizar.",
  },
]

export const ROOTSY_RADIUS_SEMANTIC: RadiusSemanticMapping[] = [
  {
    token: "radius.form.control",
    component: "RootsFormTextField · Money · Select",
    radiusToken: "radius.large",
    source: "rounded-lg",
  },
  {
    token: "radius.card.library",
    component: "library-spec-card",
    radiusToken: "radius.xlarge",
    source: "rounded-2xl",
  },
  {
    token: "radius.dialog",
    component: "articleDialogSurfaceClass",
    radiusToken: "radius.xxlarge",
    source: "rounded-[1.375rem]",
  },
  {
    token: "radius.avatar.pop",
    component: "Home POP picker",
    radiusToken: "radius.full",
    source: "rounded-full",
  },
  {
    token: "radius.logo.tile",
    component: "Rootsy logomark",
    radiusToken: "radius.tile",
    source: "SVG logomark",
  },
]

export const RADIUS_GUIDELINES = {
  do: "rounded-lg en controles light form; modal con xxlarge; focus +2px savia; full solo círculos.",
  dont: "No uses tile en cards; no inventes rounded-[13px]; no xxlarge en inputs densos.",
} as const

export const ROOTSY_RADIUS_THEME = {
  base: "0.75rem",
  sm: "calc(var(--radius) - 4px)",
  md: "calc(var(--radius) - 2px)",
  lg: "var(--radius)",
  xl: "calc(var(--radius) + 4px)",
} as const
