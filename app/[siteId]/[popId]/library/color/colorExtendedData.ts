export type AccentColorSpec = {
  id: string
  label: string
  tagClassName: string
  subtlestClassName: string
  subtlerClassName: string
  subtleClassName: string
  boldClassName: string
  textDefaultClassName: string
  textBoldClassName: string
}

/** Acentos nature Rootsy — intercambiables sin cambiar significado. */
export const ROOTSY_ACCENT_COLORS: AccentColorSpec[] = [
  {
    id: "green",
    label: "Verde",
    tagClassName: "bg-primary/15 text-emerald-900",
    subtlestClassName: "bg-emerald-500/5",
    subtlerClassName: "bg-emerald-500/10",
    subtleClassName: "bg-emerald-500/20",
    boldClassName: "bg-emerald-600",
    textDefaultClassName: "text-emerald-700",
    textBoldClassName: "text-emerald-900",
  },
  {
    id: "meadow",
    label: "Prado",
    tagClassName: "bg-meadow/40 text-emerald-950",
    subtlestClassName: "bg-meadow/20",
    subtlerClassName: "bg-meadow/35",
    subtleClassName: "bg-meadow/55",
    boldClassName: "bg-meadow",
    textDefaultClassName: "text-emerald-800",
    textBoldClassName: "text-emerald-950",
  },
  {
    id: "teal",
    label: "Teal",
    tagClassName: "bg-teal-500/15 text-teal-900",
    subtlestClassName: "bg-teal-500/5",
    subtlerClassName: "bg-teal-500/10",
    subtleClassName: "bg-teal-500/20",
    boldClassName: "bg-teal-600",
    textDefaultClassName: "text-teal-700",
    textBoldClassName: "text-teal-900",
  },
  {
    id: "amber",
    label: "Ámbar",
    tagClassName: "bg-amber/30 text-amber-950",
    subtlestClassName: "bg-amber-500/5",
    subtlerClassName: "bg-amber-500/10",
    subtleClassName: "bg-amber-500/25",
    boldClassName: "bg-amber",
    textDefaultClassName: "text-amber-800",
    textBoldClassName: "text-amber-950",
  },
  {
    id: "warm",
    label: "Cálido",
    tagClassName: "bg-accent/35 text-amber-950",
    subtlestClassName: "bg-accent/15",
    subtlerClassName: "bg-accent/25",
    subtleClassName: "bg-accent/45",
    boldClassName: "bg-accent",
    textDefaultClassName: "text-amber-900",
    textBoldClassName: "text-amber-950",
  },
  {
    id: "bark",
    label: "Corteza",
    tagClassName: "bg-bark/20 text-stone-900",
    subtlestClassName: "bg-bark/10",
    subtlerClassName: "bg-bark/20",
    subtleClassName: "bg-bark/35",
    boldClassName: "bg-bark",
    textDefaultClassName: "text-stone-700",
    textBoldClassName: "text-stone-900",
  },
  {
    id: "cream",
    label: "Crema",
    tagClassName: "bg-cream text-stone-800 ring-1 ring-border/50",
    subtlestClassName: "bg-cream/60",
    subtlerClassName: "bg-cream",
    subtleClassName: "bg-cream ring-1 ring-amber-200/60",
    boldClassName: "bg-amber-100",
    textDefaultClassName: "text-stone-700",
    textBoldClassName: "text-stone-900",
  },
  {
    id: "neutral",
    label: "Neutro",
    tagClassName: "bg-muted text-foreground",
    subtlestClassName: "bg-muted/40",
    subtlerClassName: "bg-muted/60",
    subtleClassName: "bg-muted",
    boldClassName: "bg-muted-foreground/80",
    textDefaultClassName: "text-muted-foreground",
    textBoldClassName: "text-foreground",
  },
]

export type PaletteStepSpec = {
  id: string
  label: string
  className: string
}

export type PaletteFamilySpec = {
  id: string
  label: string
  steps: PaletteStepSpec[]
}

export const ROOTSY_SATURATED_PALETTES: PaletteFamilySpec[] = [
  {
    id: "green",
    label: "Verde",
    steps: [
      { id: "g1", label: "100", className: "bg-emerald-50" },
      { id: "g2", label: "200", className: "bg-emerald-100" },
      { id: "g3", label: "300", className: "bg-emerald-200" },
      { id: "g4", label: "400", className: "bg-emerald-400" },
      { id: "g5", label: "500", className: "bg-emerald-500" },
      { id: "g6", label: "600", className: "bg-emerald-600" },
      { id: "g7", label: "700", className: "bg-emerald-700" },
      { id: "g8", label: "800", className: "bg-emerald-800" },
    ],
  },
  {
    id: "amber",
    label: "Ámbar",
    steps: [
      { id: "a1", label: "100", className: "bg-amber-50" },
      { id: "a2", label: "200", className: "bg-amber-100" },
      { id: "a3", label: "300", className: "bg-amber-200" },
      { id: "a4", label: "400", className: "bg-amber-300" },
      { id: "a5", label: "500", className: "bg-amber-400" },
      { id: "a6", label: "600", className: "bg-amber-500" },
      { id: "a7", label: "700", className: "bg-amber-600" },
      { id: "a8", label: "800", className: "bg-amber-700" },
    ],
  },
  {
    id: "earth",
    label: "Tierra",
    steps: [
      { id: "e1", label: "100", className: "bg-stone-100" },
      { id: "e2", label: "200", className: "bg-stone-200" },
      { id: "e3", label: "300", className: "bg-stone-300" },
      { id: "e4", label: "400", className: "bg-stone-400" },
      { id: "e5", label: "500", className: "bg-stone-500" },
      { id: "e6", label: "600", className: "bg-stone-600" },
      { id: "e7", label: "700", className: "bg-stone-700" },
      { id: "e8", label: "800", className: "bg-stone-800" },
    ],
  },
]

export const ROOTSY_LIGHT_NEUTRALS: PaletteStepSpec[] = [
  { id: "n0", label: "0", className: "bg-white ring-1 ring-inset ring-border/40" },
  { id: "n1", label: "100", className: "bg-background" },
  { id: "n2", label: "200", className: "bg-muted" },
  { id: "n3", label: "300", className: "bg-border" },
  { id: "n4", label: "400", className: "bg-muted-foreground/40" },
  { id: "n5", label: "500", className: "bg-muted-foreground/70" },
  { id: "n6", label: "600", className: "bg-muted-foreground" },
  { id: "n7", label: "700", className: "bg-foreground/80" },
  { id: "n8", label: "800", className: "bg-foreground" },
]

export const ROOTSY_DARK_NEUTRALS: PaletteStepSpec[] = [
  { id: "d0", label: "0", className: "bg-[#070a09]" },
  { id: "d1", label: "100", className: "bg-[#0c0f0e]" },
  { id: "d2", label: "200", className: "bg-white/6" },
  { id: "d3", label: "300", className: "bg-white/10" },
  { id: "d4", label: "400", className: "bg-white/16" },
  { id: "d5", label: "500", className: "bg-white/25" },
  { id: "d6", label: "600", className: "bg-white/45" },
  { id: "d7", label: "700", className: "bg-white/70" },
  { id: "d8", label: "800", className: "bg-white" },
]

export const CHART_CATEGORICAL_COLORS = [
  { id: "c1", label: "Serie 1", className: "bg-chart-1" },
  { id: "c2", label: "Serie 2", className: "bg-chart-2" },
  { id: "c3", label: "Serie 3", className: "bg-chart-3" },
  { id: "c4", label: "Serie 4", className: "bg-chart-4" },
  { id: "c5", label: "Serie 5", className: "bg-chart-5" },
]

export const CHART_STATUS_COLORS = [
  {
    id: "success",
    label: "En curso / OK",
    defaultClassName: "bg-emerald-500",
    boldClassName: "bg-emerald-700",
  },
  {
    id: "warning",
    label: "Atención",
    defaultClassName: "bg-amber",
    boldClassName: "bg-amber-600",
  },
  {
    id: "danger",
    label: "Crítico",
    defaultClassName: "bg-destructive/80",
    boldClassName: "bg-destructive",
  },
  {
    id: "neutral",
    label: "Pendiente",
    defaultClassName: "bg-muted-foreground/50",
    boldClassName: "bg-muted-foreground",
  },
]

export const PICKER_TEXT_ROWS = [
  { emphasis: "Intenso", suffix: "bold" },
  { emphasis: "Normal", suffix: "default" },
] as const

export const PICKER_BG_ROWS = [
  { emphasis: "Más sutil", level: "subtlest" },
  { emphasis: "Sutil", level: "subtler" },
  { emphasis: "Medio", level: "subtle" },
  { emphasis: "Intenso", level: "bold" },
] as const

export const PICKER_CHART_ROWS = [
  { emphasis: "Suave", level: 0 },
  { emphasis: "Medio", level: 1 },
  { emphasis: "Intenso", level: 2 },
] as const
