/**
 * Sistema de elevación Rootsy — fuente de verdad del design system.
 * Alineado a Atlassian Elevation con capa nature: profundidad orgánica, sombras canopy.
 */

export type ElevationLevel = {
  id: string
  token: string
  natureName: string
  label: string
  description: string
  usage: string
  surfaceToken: string
  shadowToken?: string
  cssClass: string
  pairRule?: string
}

export type ElevationInteractionState = {
  id: string
  state: "hovered" | "pressed"
  surfaceToken: string
  notes: string
}

export type ElevationSemanticMapping = {
  token: string
  component: string
  levelId: string
  source: string
  notes?: string
}

export type ElevationZIndexRow = {
  zIndex: number
  usage: string
  level: string
  rootsyExample: string
}

export const ROOTSY_ELEVATION_MANIFESTO =
  "Las elevaciones son las capas del bosque: el claro hundido donde agrupás columnas, el suelo plano del workspace, el brote que levanta una tarjeta movible y el dosel que cubre todo cuando abrís un modal. Superficie + sombra — nunca mezclar tokens de distinto nivel. En dark, las capas altas se aclaran como la luz filtrada entre hojas."

export const ROOTSY_ELEVATION_PRINCIPLES = [
  {
    title: "Capas con intención",
    detail: "Cada nivel guía el foco — no levantar tarjetas si un borde o espacio alcanza.",
  },
  {
    title: "Par surface + shadow",
    detail: "Raised y overlay siempre van con su sombra. Mezclar tokens rompe dark mode.",
  },
  {
    title: "Tinte canopy",
    detail: "Sombras verdes sutiles — profundidad viva, no gris genérico de dashboard.",
  },
  {
    title: "Dark mode",
    detail: "Superficies más claras al subir; sombras siguen acompañando raised y overlay.",
  },
] as const

/** Niveles base — orden de abajo hacia arriba. */
export const ROOTSY_ELEVATION_LEVELS: ElevationLevel[] = [
  {
    id: "sunken",
    token: "elevation.surface.sunken",
    natureName: "Claro",
    label: "Sunken",
    description: "La hondonada — superficie hundida que agrupa contenido sobre el suelo.",
    usage: "Columnas kanban, paneles anidados, CheckoutSectionPanel. Solo sobre default.",
    surfaceToken: "elevation.surface.sunken",
    cssClass: "rootsy-elevation-sunken",
    pairRule: "Sin sombra. No usar sobre raised u overlay.",
  },
  {
    id: "default",
    token: "elevation.surface",
    natureName: "Suelo",
    label: "Default",
    description: "Plano base del workspace — sin lift visual.",
    usage: "Body, fondo de página, canvas de mesas.",
    surfaceToken: "elevation.surface",
    cssClass: "rootsy-elevation-default",
    pairRule: "Tarjetas planas: sumar border (default bordered).",
  },
  {
    id: "default-bordered",
    token: "elevation.surface",
    natureName: "Loseta",
    label: "Default · borde",
    description: "Superficie plana delimitada — énfasis sin sombra.",
    usage: "SpecCard, filas de formulario, listas densas.",
    surfaceToken: "elevation.surface",
    shadowToken: undefined,
    cssClass: "rootsy-elevation-default-bordered",
    pairRule: "1px border · sin shadow.",
  },
  {
    id: "raised",
    token: "elevation.surface.raised",
    natureName: "Brote",
    label: "Raised",
    description: "Tarjeta levemente elevada — draggable o énfasis puntual.",
    usage: "Cards movibles, hover en CashRegisterCard, una sola zona focal.",
    surfaceToken: "elevation.surface.raised",
    shadowToken: "elevation.shadow.raised",
    cssClass: "rootsy-elevation-raised",
    pairRule: "Siempre con elevation.shadow.raised.",
  },
  {
    id: "overlay",
    token: "elevation.surface.overlay",
    natureName: "Dosel",
    label: "Overlay",
    description: "La capa más alta — flota sobre otra UI.",
    usage: "Modales, dropdowns, popovers, toolbars flotantes.",
    surfaceToken: "elevation.surface.overlay",
    shadowToken: "elevation.shadow.overlay",
    cssClass: "rootsy-elevation-overlay",
    pairRule: "Siempre con elevation.shadow.overlay. Puede apilarse.",
  },
  {
    id: "overflow",
    token: "elevation.shadow.overflow",
    natureName: "Bruma",
    label: "Overflow",
    description: "Sombra de borde — contenido scrolleable fuera de vista.",
    usage: "Tablas anchas, scroll horizontal, áreas muy compactas.",
    surfaceToken: "elevation.surface",
    shadowToken: "elevation.shadow.overflow",
    cssClass: "rootsy-elevation-overflow-demo",
    pairRule: "Alternativa a border en headers/footers sticky.",
  },
]

export const ROOTSY_ELEVATION_SHADOW_TOKENS = [
  {
    token: "elevation.shadow.raised",
    value:
      "0 1px 2px oklch(0.55 0.14 155 / 0.07), 0 4px 14px oklch(0.25 0.03 150 / 0.08)",
    tailwind: "shadow-sm + tint canopy",
    pairsWith: "elevation.surface.raised",
  },
  {
    token: "elevation.shadow.overlay",
    value: "0 22px 70px -18px oklch(0.25 0.03 150 / 0.28)",
    tailwind: "articleDialogSurfaceClass",
    pairsWith: "elevation.surface.overlay",
  },
  {
    token: "elevation.shadow.overflow",
    value:
      "linear-gradient(to right, oklch(0.25 0.03 150 / 0.12), transparent)",
    tailwind: "overflow perimeter",
    pairsWith: "elevation.surface (scroll edge)",
  },
] as const

export const ROOTSY_ELEVATION_SURFACES_LIGHT = [
  { token: "elevation.surface.sunken", value: "oklch(0.95 0.015 110)", mapsTo: "--muted" },
  { token: "elevation.surface", value: "oklch(0.98 0.005 110)", mapsTo: "--background" },
  { token: "elevation.surface.raised", value: "oklch(0.995 0.002 110)", mapsTo: "--card" },
  { token: "elevation.surface.overlay", value: "oklch(1 0 0)", mapsTo: "white / --card" },
] as const

export const ROOTSY_ELEVATION_SURFACES_DARK = [
  { token: "elevation.surface.sunken", value: "#0a0d0c", note: "Más oscuro que default" },
  { token: "elevation.surface", value: "#070a09", note: "Baseline app shell" },
  { token: "elevation.surface.raised", value: "#0c0f0e", note: "Ligeramente más claro" },
  { token: "elevation.surface.overlay", value: "#121816", note: "Más claro — modal/dropdown" },
] as const

export const ROOTSY_ELEVATION_INTERACTION: ElevationInteractionState[] = [
  {
    id: "default-hover",
    state: "hovered",
    surfaceToken: "elevation.surface.hovered",
    notes: "Cambio de color de superficie — preferido en UI pequeña.",
  },
  {
    id: "default-pressed",
    state: "pressed",
    surfaceToken: "elevation.surface.pressed",
    notes: "Feedback táctil sin cambiar de nivel.",
  },
  {
    id: "raised-hover",
    state: "hovered",
    surfaceToken: "elevation.surface.raised.hovered",
    notes: "Opcional: transición a overlay shadow en hover (usar poco).",
  },
  {
    id: "overlay-hover",
    state: "hovered",
    surfaceToken: "elevation.surface.overlay.hovered",
    notes: "Botones dentro del overlay — no elevar el overlay entero.",
  },
]

export const ROOTSY_ELEVATION_SEMANTIC: ElevationSemanticMapping[] = [
  {
    token: "elevation.card.library",
    component: "SpecCard · LibrarySection panels",
    levelId: "default-bordered",
    source: "layoutLibraryShared.tsx",
    notes: "border-border/70 · shadow-sm ligero en cards de doc.",
  },
  {
    token: "elevation.panel.nested",
    component: "CheckoutSectionPanel",
    levelId: "sunken",
    source: "CheckoutFormFields.tsx",
    notes: "bg-muted/10 · agrupa campos en checkout.",
  },
  {
    token: "elevation.card.interactive",
    component: "CashRegisterCard",
    levelId: "raised",
    source: "CashRegisterCard.tsx",
    notes: "shadow-sm → hover:shadow-md.",
  },
  {
    token: "elevation.dialog.article",
    component: "articleDialogSurfaceClass",
    levelId: "overlay",
    source: "articleConstants.ts",
    notes: "Sombra profunda + rounded-[1.375rem].",
  },
  {
    token: "elevation.popover.select",
    component: "DropdownMenuContent",
    levelId: "overlay",
    source: "components/elevation/rootsyElevationStyles.ts",
    notes: "rootsyElevationOverlay* · rounded-[1.375rem] · border-black/[0.04] · z-50.",
  },
  {
    token: "elevation.popover.form-select",
    component: "RootsFormSelectContent",
    levelId: "raised",
    source: "components/rootsy-form/rootsFormStyles.ts",
    notes: "rounded-lg · border-zinc-200 · shadow-md — distinto del dropdown.",
  },
  {
    token: "elevation.header.workspace",
    component: "DataWorkspaceLayout header",
    levelId: "default",
    source: "DataWorkspaceLayout.tsx",
    notes: "backdrop-blur-xl · border-b — no shadow.",
  },
]

export const ROOTSY_ELEVATION_Z_INDEX: ElevationZIndexRow[] = [
  { zIndex: 100, usage: "Contenido base", level: "Default", rootsyExample: "Workspace body" },
  { zIndex: 200, usage: "Navegación fija", level: "Default", rootsyExample: "Header workspace" },
  { zIndex: 300, usage: "Inline dialog", level: "Overlay", rootsyExample: "Popover inline" },
  { zIndex: 400, usage: "Popup / dropdown", level: "Overlay", rootsyExample: "SelectContent" },
  { zIndex: 500, usage: "Blanket / backdrop", level: "—", rootsyExample: "Dialog overlay bg-black/50" },
  { zIndex: 510, usage: "Modal", level: "Overlay", rootsyExample: "RootsDialogContent" },
  { zIndex: 600, usage: "Flag / toast", level: "Overlay", rootsyExample: "Notificaciones" },
  { zIndex: 700, usage: "Spotlight / onboarding", level: "Overlay", rootsyExample: "Tours futuros" },
  { zIndex: 800, usage: "Tooltip", level: "—", rootsyExample: "TooltipContent" },
]

export const ELEVATION_GUIDELINES = {
  do: [
    "Emparejar elevation.surface.raised con elevation.shadow.raised.",
    "Usar sunken solo sobre default para agrupar — kanban, paneles anidados.",
    "Preferir border o espacio antes de raised cuando no hay drag ni énfasis único.",
    "Verificar contraste de texto en overlay — especialmente en dark.",
  ],
  dont: [
    "No mezclar shadow.raised con surface.overlay.",
    "No apilar múltiples raised sin jerarquía clara — genera ruido.",
    "No usar raised para agrupar si sunken + whitespace alcanza.",
    "No combinar transición de elevación y tokens hovered/pressed a la vez.",
  ],
} as const

export const SUNKEN_VS_NEUTRAL = {
  sunken:
    "Opaco — oscurece en light y dark. Backdrop para agrupar en la misma capa (kanban, panel anidado).",
  neutral:
    "Transparente/adaptativo — color.background.neutral. Usar cuando el fondo debe heredar la elevación padre.",
} as const
