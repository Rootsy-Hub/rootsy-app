/**
 * Sistema de elevación Rootsy — profundidad con sombra y bruma.
 * Alineado a sombra · bruma · savia del design system.
 */

import { rootsyColorHex } from "@/lib/design-system"

const hx = rootsyColorHex

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

export const ROOTSY_ELEVATION_CONCEPT = {
  title: "Profundidad sin ruido",
  lead:
    "En Rootsy la profundidad se lee como en un sendero: suelo plano, hondonada que agrupa, algo que flota cuando pide atención. Sin manual — el ojo entiende antes que el token.",
  why: [
    "Naturalidad: bruma es neblina bajo los pies; sombra es el dosel; el blanco aparece solo cuando algo importa — como un claro entre árboles.",
    "Simplicidad: tres lecturas — plano, hundido, flotante. Preferí borde o aire antes de levantar sombra.",
    "Intuitivo: si hay modal o menú, flota; si hay columna de kanban, se hunde; el resto queda en el suelo.",
  ],
  closing:
    "Como un paseo al aire libre: la jerarquía se siente inevitable, no diseñada para impresionar.",
} as const

export const ROOTSY_ELEVATION_MANIFESTO =
  "Tres sensaciones, no seis trucos: hundido para agrupar, plano para trabajar, flotante para interrumpir. Superficie y sombra van de a pares — la profundidad orienta, no decora."

export const ROOTSY_ELEVATION_PRINCIPLES = [
  {
    title: "Intuitivo al primer vistazo",
    detail:
      "Plano · hundido · flotante — tres lecturas que el usuario reconoce sin aprender tokens.",
  },
  {
    title: "Simplicidad antes que sombra",
    detail:
      "Borde bruma o espacio alcanza; raised solo con drag, modal o foco único.",
  },
  {
    title: "Naturalidad de capas",
    detail:
      "Bruma como suelo claro, sombra como dosel — misma lógica que color, distinta luz.",
  },
  {
    title: "Par surface + shadow",
    detail:
      "Raised y overlay siempre con su sombra. Mezclar tokens rompe la lectura.",
  },
] as const

/** Niveles base — orden de abajo hacia arriba. */
export const ROOTSY_ELEVATION_LEVELS: ElevationLevel[] = [
  {
    id: "sunken",
    token: "elevation.surface.sunken",
    natureName: "Hondonada",
    label: "Sunken",
    description: "Bruma 50 hundida — agrupa columnas sobre el suelo claro.",
    usage: "Kanban, paneles anidados, filas zebra. Solo sobre default claro.",
    surfaceToken: "elevation.surface.sunken",
    cssClass: "rootsy-elevation-sunken",
    pairRule: "Sin sombra. No usar sobre raised u overlay.",
  },
  {
    id: "default",
    token: "elevation.surface",
    natureName: "Suelo",
    label: "Default",
    description: "Bruma 100 o sombra 600 — plano base sin lift.",
    usage: "Body workspace, canvas POS, fondo de ticket.",
    surfaceToken: "elevation.surface",
    cssClass: "rootsy-elevation-default",
    pairRule: "Tarjetas planas: sumar borde bruma 200.",
  },
  {
    id: "default-bordered",
    token: "elevation.surface",
    natureName: "Loseta",
    label: "Default · borde",
    description: "Superficie plana delimitada — énfasis sin sombra.",
    usage: "SpecCard, filas de formulario, listas densas.",
    surfaceToken: "elevation.surface",
    cssClass: "rootsy-elevation-default-bordered",
    pairRule: "1px border bruma 200 · sin shadow.",
  },
  {
    id: "raised",
    token: "elevation.surface.raised",
    natureName: "Brote",
    label: "Raised",
    description: "Blanco o sombra 500 levemente elevada.",
    usage: "Cards movibles, hover en entidades, una zona focal.",
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
    description: "La capa más alta — modal, dropdown, popover.",
    usage: "Diálogos, menús, toolbars flotantes.",
    surfaceToken: "elevation.surface.overlay",
    shadowToken: "elevation.shadow.overlay",
    cssClass: "rootsy-elevation-overlay",
    pairRule: "Siempre con elevation.shadow.overlay.",
  },
  {
    id: "overflow",
    token: "elevation.shadow.overflow",
    natureName: "Bruma",
    label: "Overflow",
    description: "Gradiente de borde — contenido scrolleable fuera de vista.",
    usage: "Tablas anchas, scroll horizontal.",
    surfaceToken: "elevation.surface",
    shadowToken: "elevation.shadow.overflow",
    cssClass: "rootsy-elevation-overflow-demo",
    pairRule: "Alternativa a border en headers sticky.",
  },
]

export const ROOTSY_ELEVATION_SHADOW_TOKENS = [
  {
    token: "elevation.shadow.raised",
    value: `0 1px 2px ${hx("sombra", "950")}12, 0 4px 14px ${hx("sombra", "950")}14`,
    tailwind: "shadow-sm · tint sombra",
    pairsWith: "elevation.surface.raised",
  },
  {
    token: "elevation.shadow.overlay",
    value: `0 22px 70px -18px ${hx("sombra", "950")}47`,
    tailwind: "articleDialogSurfaceClass",
    pairsWith: "elevation.surface.overlay",
  },
  {
    token: "elevation.shadow.overflow",
    value: `linear-gradient(to right, ${hx("sombra", "950")}1F, transparent)`,
    tailwind: "overflow perimeter",
    pairsWith: "elevation.surface (scroll edge)",
  },
] as const

export const ROOTSY_ELEVATION_SURFACES_LIGHT = [
  { token: "elevation.surface.sunken", value: hx("bruma", "50"), mapsTo: "--color-elevated" },
  { token: "elevation.surface", value: hx("bruma", "100"), mapsTo: "--color-shell" },
  { token: "elevation.surface.raised", value: hx("bruma", "50"), mapsTo: "white / --card" },
  { token: "elevation.surface.overlay", value: "#FFFFFF", mapsTo: "white · modal" },
] as const

export const ROOTSY_ELEVATION_SURFACES_DARK = [
  { token: "elevation.surface.sunken", value: hx("sombra", "700"), note: "Rail · header" },
  { token: "elevation.surface", value: hx("sombra", "600"), note: "Canvas catálogo" },
  { token: "elevation.surface.raised", value: hx("sombra", "500"), note: "Card producto" },
  { token: "elevation.surface.overlay", value: hx("sombra", "500"), note: "Dropdown · modal oscuro" },
] as const

export const ROOTSY_ELEVATION_INTERACTION: ElevationInteractionState[] = [
  {
    id: "default-hover",
    state: "hovered",
    surfaceToken: "elevation.surface.hovered",
    notes: "Bruma 50 en claro · sombra 500 en POS — preferido en UI pequeña.",
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
    notes: "Sombra un poco más amplia — usar con moderación.",
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
    source: "library-spec-card",
    notes: "border bruma 200 · sin sombra fuerte.",
  },
  {
    token: "elevation.panel.nested",
    component: "CheckoutSectionPanel",
    levelId: "sunken",
    source: "CheckoutFormFields.tsx",
    notes: "bruma 50 · agrupa campos.",
  },
  {
    token: "elevation.card.interactive",
    component: "TreasuryAccountCard · CashRegisterCard",
    levelId: "raised",
    source: "dataWorkspaceEntityCardClass",
    notes: "shadow-sm → hover:shadow-md · rounded-2xl.",
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
    source: "rootsyElevationStyles.ts",
    notes: "Overlay + z-50.",
  },
  {
    token: "elevation.header.workspace",
    component: "DataWorkspaceLayout header",
    levelId: "default",
    source: "DataWorkspaceLayout.tsx",
    notes: "sombra 700 + border-b — sin shadow.",
  },
]

export const ROOTSY_ELEVATION_Z_INDEX: ElevationZIndexRow[] = [
  { zIndex: 100, usage: "Contenido base", level: "Default", rootsyExample: "Workspace body" },
  { zIndex: 200, usage: "Navegación fija", level: "Default", rootsyExample: "Header workspace" },
  { zIndex: 400, usage: "Popup / dropdown", level: "Overlay", rootsyExample: "SelectContent" },
  { zIndex: 500, usage: "Blanket / backdrop", level: "—", rootsyExample: "Dialog overlay" },
  { zIndex: 510, usage: "Modal", level: "Overlay", rootsyExample: "RootsDialogContent" },
  { zIndex: 600, usage: "Flag / toast", level: "Overlay", rootsyExample: "Notificaciones" },
  { zIndex: 800, usage: "Tooltip", level: "—", rootsyExample: "TooltipContent" },
]

export const ELEVATION_GUIDELINES = {
  do: "Emparejá raised con shadow.raised; usá sunken solo sobre default claro; preferí borde bruma antes de raised.",
  dont: "No mezclés shadow.raised con surface.overlay; no apiles raised sin jerarquía; no elevés formularios densos.",
} as const

export const SUNKEN_VS_NEUTRAL = {
  sunken:
    "Opaco — bruma 50 en claro, sombra 700 en rail. Agrupa en la misma capa (kanban, panel anidado).",
  neutral:
    "Transparente — hereda elevación del padre. Usar cuando el fondo debe continuar la pila.",
} as const
