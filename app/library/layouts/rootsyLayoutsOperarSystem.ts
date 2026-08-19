/**
 * Layout operar — fuente de verdad del design system.
 * Espejo de sale/page.tsx · DataWorkspaceOperationsLayout · Vender / Comprar / Mesas / Mostrador.
 * Color: fundamentos nuevos — sombra · bruma · savia (colors-new · ROOTSY_SURFACE_STACKS.pos).
 */

import {
  LAYOUTS_OPERAR_CATALOG_SIDEBAR_WIDTH_PX,
  LAYOUTS_OPERAR_CATALOG_SIDEBAR_WIDTH_TOKEN,
  LAYOUTS_OPERAR_SUMMARY_PANEL_WIDTH_PX,
  LAYOUTS_OPERAR_SUMMARY_PANEL_WIDTH_TOKEN,
} from "@/app/library/layouts/layoutsOperarStyles"
import { ROOTSY_LAYOUTS_EARTH_FLOOR } from "@/app/library/layouts/rootsyLayoutsEarthFloor"
import { ROOTSY_LAYOUTS_MODULE_HEADER } from "@/app/library/layouts/rootsyLayoutsModuleSystem"
import { COLOR_NEW_GRADIENTS } from "@/app/library/color/rootsyNaturePalette"
import { rootsyColorHex, rootsySpacePx } from "@/lib/design-system"

const hx = rootsyColorHex

const POS_TOTALS_GRADIENT = COLOR_NEW_GRADIENTS.find((g) => g.id === "pos-totals")!

/** Toolbox + totales — slot space.1000 · padding vertical space.150 (base) / space.200 (sm). */
const OPERAR_FOOTER_SLOT_MIN_PX = rootsySpacePx("1000")
const OPERAR_FOOTER_BAND_PAD_Y_PX = rootsySpacePx("150")
const OPERAR_FOOTER_SLOT_MIN_SM_PX = rootsySpacePx("1000") + rootsySpacePx("050")
const OPERAR_FOOTER_BAND_PAD_Y_SM_PX = rootsySpacePx("200")
const OPERAR_FOOTER_BAND_MIN_PX = OPERAR_FOOTER_SLOT_MIN_PX + OPERAR_FOOTER_BAND_PAD_Y_PX * 2
const OPERAR_FOOTER_BAND_MIN_SM_PX = OPERAR_FOOTER_SLOT_MIN_SM_PX + OPERAR_FOOTER_BAND_PAD_Y_SM_PX * 2

export const ROOTSY_LAYOUTS_OPERAR_MANIFESTO =
  "Pantalla operar — split POS sombra + bruma. Vender · Compras · Mesas · Mostrador comparten grid catálogo/toolbox + ticket 400px (10× space.500) bajo el shell módulo."

export const ROOTSY_LAYOUTS_OPERAR_PRINCIPLES = [
  {
    title: "Shell módulo + cuerpo POS",
    detail:
      "DataWorkspaceOperationsLayout → OperationsModuleBody · .rootsy-theme-pos · header sombra · backdrop POP.",
  },
  {
    title: "Grid operar",
    detail:
      "main grid-cols-[1fr_400px] · fila 1 catálogo · fila 2 toolbox · columna 2 ticket row-span-2.",
  },
  {
    title: "Catálogo · dosel denso",
    detail:
      "Sidebar w-64 (256px) · library-sidebar + library-nav (paridad Library / Estadísticas / Ajustes) · canvas sombra-800 · cards sombra-600 · toolbox tierra empapada · hairline sombra-border · pairing pos-core.",
  },
  {
    title: "Ticket · bruma-50",
    detail:
      "Panel, carrito y total bruma-50 (mismo piso que cuentas/cajas) · hairline bruma-200 · split sombra-700 · el total solo aparece con ítems.",
  },
] as const

export const ROOTSY_LAYOUTS_OPERAR_SCREENS = [
  { id: "sale", label: "Vender", route: "sale/page.tsx" },
  { id: "purchases", label: "Comprar", route: "purchases (channel)" },
  { id: "tables", label: "Mesas", route: "mesas (channel)" },
  { id: "counter", label: "Mostrador", route: "mostrador (channel)" },
] as const

export const ROOTSY_LAYOUTS_OPERAR_ANATOMY = {
  moduleHeaderHeightPx: ROOTSY_LAYOUTS_MODULE_HEADER.heightPx,
  catalogSidebarWidthPx: LAYOUTS_OPERAR_CATALOG_SIDEBAR_WIDTH_PX,
  catalogSidebarWidthToken: LAYOUTS_OPERAR_CATALOG_SIDEBAR_WIDTH_TOKEN,
  summaryPanelWidthPx: LAYOUTS_OPERAR_SUMMARY_PANEL_WIDTH_PX,
  summaryPanelWidthToken: LAYOUTS_OPERAR_SUMMARY_PANEL_WIDTH_TOKEN,
  catalogToolbarHeightPx: 64,
  /** Slot interno toolbox — space.1000 (80px) · icono 40px + label + valor. */
  toolboxSlotMinHeightPx: OPERAR_FOOTER_SLOT_MIN_PX,
  toolboxSlotMinHeightSmPx: OPERAR_FOOTER_SLOT_MIN_SM_PX,
  toolboxSlotMinHeightToken: "space.1000",
  toolboxSlotMinHeightSmToken: "space.1000 + space.050",
  toolboxBandPaddingYPx: OPERAR_FOOTER_BAND_PAD_Y_PX,
  toolboxBandPaddingYSmPx: OPERAR_FOOTER_BAND_PAD_Y_SM_PX,
  toolboxBandPaddingYToken: "space.150",
  toolboxBandPaddingYSmToken: "space.200",
  /** Banda toolbox fila 2 — alineada con barra de totales del ticket. */
  toolboxRowMinHeightPx: OPERAR_FOOTER_BAND_MIN_PX,
  toolboxRowMinHeightSmPx: OPERAR_FOOTER_BAND_MIN_SM_PX,
  toolboxRowMinHeightToken: "space.1000 + 2× space.150",
  toolboxRowMinHeightSmToken: "space.1000 + space.050 + 2× space.200",
  toolboxMinHeightClass: `min-h-[${OPERAR_FOOTER_BAND_MIN_PX}px] sm:min-h-[${OPERAR_FOOTER_BAND_MIN_SM_PX}px]`,
  toolboxMinHeightSmClass: `sm:min-h-[${OPERAR_FOOTER_BAND_MIN_SM_PX}px]`,
  ticketHeaderHeightPx: 40,
  /** space.800 — aire para círculo large (48) + Descartar default (40). */
  ticketActionsHeightPx: 64,
  /** Totales — misma altura mínima que toolbox para cerrar el grid en una sola línea base. */
  ticketTotalMinHeightPx: OPERAR_FOOTER_BAND_MIN_PX,
  ticketTotalMinHeightSmPx: OPERAR_FOOTER_BAND_MIN_SM_PX,
  productCardHeightPx: 256,
  productCardMediaHeightPx: 80,
  catalogGridColsDesktop: 3,
  toolboxSlots: ["Cliente", "Comprobante", "Pago", "Descuento"] as const,
} as const

/**
 * Superficies operar — dosel denso · pos-core (colors-new).
 * Catálogo plano bajo el dosel; savia reservada para acciones y totales.
 */
export const ROOTSY_LAYOUTS_OPERAR_SURFACES = {
  shell: { token: "sombra-950", css: "var(--rootsy-sombra-950)" },
  header: { token: "sombra-950→900", css: "linear-gradient chrome" },
  rail: { token: "sombra-700 · library-sidebar", css: "var(--rootsy-sombra-700)" },
  canvas: { token: "sombra-800", css: "var(--rootsy-sombra-800)" },
  productCard: { token: "sombra-600", css: "var(--rootsy-sombra-600)" },
  footer: {
    token: ROOTSY_LAYOUTS_EARTH_FLOOR.chromeToken,
    css: ROOTSY_LAYOUTS_EARTH_FLOOR.background,
  },
  lightPanel: { token: "bruma-50", css: "var(--rootsy-bruma-50)" },
  lightContent: { token: "bruma-50", css: "var(--rootsy-bruma-50)" },
  lightActions: { token: "bruma-50", css: "var(--rootsy-bruma-50)" },
  lightTotals: { token: "bruma-50", css: "var(--rootsy-bruma-50)" },
} as const

/**
 * Bordes operar — ancho + color emparejados (rootsyBorderSystem).
 * Dosel denso: hairlines sutiles dentro del catálogo; sombra-700 en split bruma; bruma-200 en ticket.
 */
export const ROOTSY_LAYOUTS_OPERAR_BORDERS = {
  /** Rail ↔ canvas, toolbar, slots toolbox — mismo dosel, división mínima */
  darkHairline: {
    token: "sombra-border / 55%",
    css: `color-mix(in srgb, ${hx("sombra", "border")} 55%, transparent)`,
  },
  /** Catálogo ↔ toolbox, header chrome — borde oscuro estándar POS */
  darkDefault: {
    token: "sombra-border / 80%",
    css: `color-mix(in srgb, ${hx("sombra", "border")} 80%, transparent)`,
  },
  /** Contorno card sombra-600 sobre canvas */
  darkCard: {
    token: "sombra-border",
    css: hx("sombra", "border"),
  },
  /** Split columna sombra ↔ bruma (pos-split) */
  splitColumn: {
    token: "sombra-700",
    css: hx("sombra", "700"),
  },
  /** Ticket — hairline bruma */
  lightHairline: {
    token: "bruma-200",
    css: hx("bruma", "200"),
  },
  /** Borde superior totales savia */
  totalsEdge: {
    token: "savia-990 / 28%",
    css: `color-mix(in srgb, ${hx("savia", "990")} 28%, transparent)`,
  },
} as const

export type LayoutsOperarBorderId = keyof typeof ROOTSY_LAYOUTS_OPERAR_BORDERS

export function getLayoutsOperarBorderCss(id: LayoutsOperarBorderId) {
  return ROOTSY_LAYOUTS_OPERAR_BORDERS[id].css
}

export function getLayoutsOperarBorderToken(id: LayoutsOperarBorderId) {
  return ROOTSY_LAYOUTS_OPERAR_BORDERS[id].token
}

export type LayoutsOperarSurfaceId = keyof typeof ROOTSY_LAYOUTS_OPERAR_SURFACES

export function getLayoutsOperarSurfaceDocToken(id: LayoutsOperarSurfaceId) {
  return ROOTSY_LAYOUTS_OPERAR_SURFACES[id].token
}

/** Header wireframe — chrome sombra 950→900. */
export function getLayoutsOperarWireframeHeaderStyle() {
  return {
    background: `linear-gradient(180deg, ${hx("sombra", "950")} 0%, ${hx("sombra", "900")} 100%)`,
    borderBottom: `1px solid ${getLayoutsOperarBorderCss("darkDefault")}`,
  } as const
}

/** Toolbox — mismo suelo empapado que el footer de tablas. */
export function getLayoutsOperarDoselContinuoToolboxBandBackground() {
  return ROOTSY_LAYOUTS_EARTH_FLOOR.background
}

/** @deprecated Alias — usar getLayoutsOperarDoselContinuoToolboxBandBackground */
export function getLayoutsOperarWireframeFooterBackground() {
  return getLayoutsOperarDoselContinuoToolboxBandBackground()
}

/** Barra de totales — gradiente pos-totals (colors-new). */
export function getLayoutsOperarPosTotalsGradient() {
  return `linear-gradient(165deg, ${POS_TOTALS_GRADIENT.from} 0%, ${POS_TOTALS_GRADIENT.via} 48%, ${POS_TOTALS_GRADIENT.to} 100%)`
}

export type LayoutsOperarToolboxProposalId = "dosel-continuo" | "cubiertas-sombra" | "bruma-ascendente"

export type LayoutsOperarToolboxProposalBandLayout = "inset" | "flush"

export type LayoutsOperarToolboxProposal = {
  id: LayoutsOperarToolboxProposalId
  letter: "A" | "B" | "C"
  title: string
  pairingId: "pos-core" | "pos-split" | "pos-focus"
  pairingLabel: string
  summary: string
  uxNote: string
  recommended?: boolean
  /** inset = banda con padding · flush = cubiertas a altura completa de la banda. */
  bandLayout: LayoutsOperarToolboxProposalBandLayout
  bandMinHeightPx: number
  bandMinHeightSmPx: number
  slotMinHeightPx: number
  slotMinHeightSmPx: number
}

/** Propuestas toolbox §3 — sombra · bruma · savia · rootsyBorderSystem. */
export const ROOTSY_LAYOUTS_OPERAR_TOOLBOX_PROPOSALS: LayoutsOperarToolboxProposal[] = [
  {
    id: "dosel-continuo",
    letter: "A",
    title: "Dosel continuo",
    pairingId: "pos-core",
    pairingLabel: "Tierra empapada + Savia viva",
    summary:
      "Banda inset tierra empapada · slots en relieve · savia brota al configurar.",
    uxNote:
      "Los slots son piedras sobre el barro. Al cargar, la savia sale como raíz y hoja — la vida del mundo, no un accent.",
    recommended: true,
    bandLayout: "inset",
    bandMinHeightPx: ROOTSY_LAYOUTS_OPERAR_ANATOMY.toolboxRowMinHeightPx,
    bandMinHeightSmPx: ROOTSY_LAYOUTS_OPERAR_ANATOMY.toolboxRowMinHeightSmPx,
    slotMinHeightPx: ROOTSY_LAYOUTS_OPERAR_ANATOMY.toolboxSlotMinHeightPx,
    slotMinHeightSmPx: ROOTSY_LAYOUTS_OPERAR_ANATOMY.toolboxSlotMinHeightSmPx,
  },
  {
    id: "cubiertas-sombra",
    letter: "B",
    title: "Cubiertas sombra",
    pairingId: "pos-split",
    pairingLabel: "Sombra 900→950 + Savia 400",
    summary:
      "Banda flush gradiente sombra-900→950 · cubiertas full-bleed space.1000 · hairlines · barra inset savia.",
    uxNote:
      "Cuatro cubiertas a altura completa — escaneo horizontal rápido. Ideal para mostrador con prisa y lectura por posición.",
    bandLayout: "flush",
    bandMinHeightPx: ROOTSY_LAYOUTS_OPERAR_ANATOMY.toolboxRowMinHeightPx,
    bandMinHeightSmPx: ROOTSY_LAYOUTS_OPERAR_ANATOMY.toolboxRowMinHeightSmPx,
    slotMinHeightPx: ROOTSY_LAYOUTS_OPERAR_ANATOMY.toolboxRowMinHeightPx,
    slotMinHeightSmPx: ROOTSY_LAYOUTS_OPERAR_ANATOMY.toolboxRowMinHeightSmPx,
  },
  {
    id: "bruma-ascendente",
    letter: "C",
    title: "Bruma ascendente",
    pairingId: "pos-focus",
    pairingLabel: "Sombra 950 + Bruma 100 + Savia 400",
    summary:
      "Banda inset velo bruma-100 · slots space.1000 · bisagra en slot ticket · labels bruma-300.",
    uxNote:
      "La neblina sube desde el ticket — el ojo anticipa la columna clara. Último slot marca la bisagra hacia bruma-100.",
    bandLayout: "inset",
    bandMinHeightPx: ROOTSY_LAYOUTS_OPERAR_ANATOMY.toolboxRowMinHeightPx,
    bandMinHeightSmPx: ROOTSY_LAYOUTS_OPERAR_ANATOMY.toolboxRowMinHeightSmPx,
    slotMinHeightPx: ROOTSY_LAYOUTS_OPERAR_ANATOMY.toolboxSlotMinHeightPx,
    slotMinHeightSmPx: ROOTSY_LAYOUTS_OPERAR_ANATOMY.toolboxSlotMinHeightSmPx,
  },
]

export const LAYOUTS_OPERAR_DEFAULT_TOOLBOX_PROPOSAL: LayoutsOperarToolboxProposalId = "dosel-continuo"

export type LayoutsOperarProductCardProposalId = "plano-dosel" | "losa-sombra" | "relieve-savia"

export type LayoutsOperarProductCardProposal = {
  id: LayoutsOperarProductCardProposalId
  letter: "A" | "B" | "C"
  title: string
  pairingId: "pos-core" | "pos-split" | "pos-focus"
  pairingLabel: string
  summary: string
  uxNote: string
  recommended?: boolean
  gridHeightPx: number
  gridMediaHeightPx: number
  listMinHeightPx: number
  listMediaWidthPx: number
}

/** Propuestas tarjeta catálogo §2.2 — grilla vertical + fila horizontal. */
export const ROOTSY_LAYOUTS_OPERAR_PRODUCT_CARD_PROPOSALS: LayoutsOperarProductCardProposal[] = [
  {
    id: "plano-dosel",
    letter: "A",
    title: "Plano dosel",
    pairingId: "pos-core",
    pairingLabel: "Sombra 600 + 900 + Savia 500",
    summary:
      "Cuerpo sombra-600 · void foto sombra-900 · precio savia · botón + hover · sombra inset (actual producción).",
    uxNote:
      "Tarjeta plana bajo el canvas — lectura rápida en grilla densa. Alineada al dosel denso del grid.",
    recommended: true,
    gridHeightPx: ROOTSY_LAYOUTS_OPERAR_ANATOMY.productCardHeightPx,
    gridMediaHeightPx: ROOTSY_LAYOUTS_OPERAR_ANATOMY.productCardMediaHeightPx,
    listMinHeightPx: ROOTSY_LAYOUTS_OPERAR_ANATOMY.productCardMediaHeightPx,
    listMediaWidthPx: 192,
  },
  {
    id: "losa-sombra",
    letter: "B",
    title: "Losa sombra",
    pairingId: "pos-split",
    pairingLabel: "Sombra 700→800 + Savia 400",
    summary:
      "Superficie sombra-700 · hairlines · media sombra-800 · sin lift · botón savia outline siempre visible.",
    uxNote:
      "Bloques más planos — escaneo horizontal en lista. Menos relieve, más continuidad con el canvas.",
    gridHeightPx: ROOTSY_LAYOUTS_OPERAR_ANATOMY.productCardHeightPx,
    gridMediaHeightPx: ROOTSY_LAYOUTS_OPERAR_ANATOMY.productCardMediaHeightPx,
    listMinHeightPx: ROOTSY_LAYOUTS_OPERAR_ANATOMY.productCardMediaHeightPx,
    listMediaWidthPx: 192,
  },
  {
    id: "relieve-savia",
    letter: "C",
    title: "Relieve savia",
    pairingId: "pos-focus",
    pairingLabel: "Sombra 600 + Savia 400 ring",
    summary:
      "Cuerpo sombra-600 · ring savia sutil · media sombra-950 inset · lift + halo savia al hover.",
    uxNote:
      "La savia marca el foco antes del click — útil en mostrador táctil donde el botón + debe leerse pronto.",
    gridHeightPx: ROOTSY_LAYOUTS_OPERAR_ANATOMY.productCardHeightPx,
    gridMediaHeightPx: ROOTSY_LAYOUTS_OPERAR_ANATOMY.productCardMediaHeightPx,
    listMinHeightPx: ROOTSY_LAYOUTS_OPERAR_ANATOMY.productCardMediaHeightPx,
    listMediaWidthPx: 192,
  },
]

export const LAYOUTS_OPERAR_DEFAULT_PRODUCT_CARD_PROPOSAL: LayoutsOperarProductCardProposalId =
  "plano-dosel"

export type LayoutsOperarTicketProposalId = "bruma-savia" | "bruma-plana" | "bruma-ascendente"

export type LayoutsOperarTicketProposalTotalsLayout = "gradiente" | "plano" | "ring"

export type LayoutsOperarTicketProposal = {
  id: LayoutsOperarTicketProposalId
  letter: "A" | "B" | "C"
  title: string
  pairingId: "pos-core" | "pos-split" | "pos-focus"
  pairingLabel: string
  summary: string
  uxNote: string
  recommended?: boolean
  totalsLayout: LayoutsOperarTicketProposalTotalsLayout
}

/** Propuestas ticket §4 — bruma · savia · desglose como Vender. */
export const ROOTSY_LAYOUTS_OPERAR_TICKET_PROPOSALS: LayoutsOperarTicketProposal[] = [
  {
    id: "bruma-savia",
    letter: "A",
    title: "Bruma savia",
    pairingId: "pos-core",
    pairingLabel: "Bruma 50 · módulo cuentas",
    summary:
      "Cart bruma-50 · hairlines bruma-200 · total en el mismo piso · aparece con ítems.",
    uxNote:
      "Canónico del grid — la columna del pedido es el mundo de cuentas/cajas. El total no es otra capa: solo se muestra cuando hay líneas.",
    recommended: true,
    totalsLayout: "gradiente",
  },
  {
    id: "bruma-plana",
    letter: "B",
    title: "Bruma plana",
    pairingId: "pos-split",
    pairingLabel: "Bruma 50 + Savia 975 sólido",
    summary:
      "Cart bruma-50 · hairlines bruma-200 · banners planos · totales savia sólido sin gradiente.",
    uxNote:
      "Lectura más plana — menos contraste en totales cuando el ticket tiene muchos ítems y grupos promo.",
    totalsLayout: "plano",
  },
  {
    id: "bruma-ascendente",
    letter: "C",
    title: "Bruma ascendente",
    pairingId: "pos-focus",
    pairingLabel: "Velo bruma + Savia ring",
    summary:
      "Header velo bruma · cart bruma-100 · bisagra ring savia en totales · banners con ring savia.",
    uxNote:
      "La neblina sube desde el header — anticipa la columna clara y marca la bisagra hacia el cobro.",
    totalsLayout: "ring",
  },
]

export const LAYOUTS_OPERAR_DEFAULT_TICKET_PROPOSAL: LayoutsOperarTicketProposalId = "bruma-savia"

export const ROOTSY_LAYOUTS_OPERAR_PRODUCTION = {
  page: "app/[siteId]/[popId]/sale/page.tsx",
  layout: "components/layouts-module/DataWorkspaceOperationsLayout.tsx",
  ticketPanel: "components/sale-operation/SaleOperationTicketOrderPanel.tsx",
  toolboxStyles: "components/sale-operation/saleOperationStyles.ts",
  styles: "library/layouts/layoutsOperarStyles.ts",
  theme: "library/layouts/layoutsOperarTheme.css",
  palette: "styles/rootsy/themes/pos.css · colors-new · sombra/bruma/savia",
} as const
