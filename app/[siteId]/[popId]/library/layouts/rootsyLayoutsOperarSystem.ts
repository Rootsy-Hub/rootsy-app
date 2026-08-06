/**
 * Layout operar — fuente de verdad del design system.
 * Espejo de sale/page.tsx · DataWorkspaceOperationsLayout · Vender / Comprar / Mesas / Mostrador.
 * Color: fundamentos nuevos — sombra · bruma · savia (colors-new · ROOTSY_SURFACE_STACKS.pos).
 */

import {
  LAYOUTS_OPERAR_CATALOG_SIDEBAR_WIDTH_PX,
  LAYOUTS_OPERAR_SUMMARY_PANEL_WIDTH_PX,
} from "@/app/[siteId]/[popId]/library/layouts/layoutsOperarStyles"
import { ROOTSY_LAYOUTS_MODULE_HEADER } from "@/app/[siteId]/[popId]/library/layouts/rootsyLayoutsModuleSystem"
import { COLOR_NEW_GRADIENTS } from "@/app/[siteId]/[popId]/library/color/rootsyNaturePalette"
import { rootsyColorHex } from "@/lib/design-system"

const hx = rootsyColorHex

const POS_TOTALS_GRADIENT = COLOR_NEW_GRADIENTS.find((g) => g.id === "pos-totals")!

export const ROOTSY_LAYOUTS_OPERAR_MANIFESTO =
  "Pantalla operar — split POS sombra + bruma. Vender · Compras · Mesas · Mostrador comparten grid catálogo/toolbox + ticket ~380px bajo el shell módulo."

export const ROOTSY_LAYOUTS_OPERAR_PRINCIPLES = [
  {
    title: "Shell módulo + cuerpo POS",
    detail:
      "DataWorkspaceOperationsLayout → OperationsModuleBody · .rootsy-theme-pos · header sombra · backdrop POP.",
  },
  {
    title: "Grid operar",
    detail:
      "main grid-cols-[1fr_380px] · fila 1 catálogo · fila 2 toolbox · columna 2 ticket row-span-2.",
  },
  {
    title: "Catálogo · sombra",
    detail:
      "Sidebar 280px · rail sombra-700 · canvas/toolbar sombra-600 · cards sombra-500 · toolbox sombra-900 · borde sombra-border.",
  },
  {
    title: "Ticket · bruma + savia",
    detail:
      "Panel bruma-100 · carrito bruma-50 · acciones white · totales gradiente pos-totals (savia-975→990).",
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
  summaryPanelWidthPx: LAYOUTS_OPERAR_SUMMARY_PANEL_WIDTH_PX,
  toolboxMinHeightClass: "calc(4.5rem + 1rem)",
  toolboxMinHeightSmClass: "calc(4.75rem + 1.25rem)",
  catalogToolbarHeightPx: 64,
  toolboxRowMinHeightPx: 68,
  toolboxRowMinHeightSmPx: 68,
  ticketHeaderHeightPx: 40,
  ticketActionsHeightPx: 52,
  ticketTotalMinHeightPx: 68,
  productCardHeightPx: 318,
  productCardMediaHeightPx: 152,
  catalogGridColsDesktop: 3,
  toolboxSlots: ["Cliente", "Comprobante", "Pago", "Descuento"] as const,
} as const

/**
 * Superficies operar — alineadas a ROOTSY_SURFACE_STACKS.pos + columna bruma del ticket.
 * Fuente: library/color/rootsyColorSystem.ts · colors-new-themes · pos-split.
 */
export const ROOTSY_LAYOUTS_OPERAR_SURFACES = {
  shell: { token: "sombra-950", css: "var(--rootsy-sombra-950)" },
  header: { token: "sombra-950→800", css: "linear-gradient chrome" },
  rail: { token: "sombra-700", css: "var(--rootsy-sombra-700)" },
  canvas: { token: "sombra-600", css: "var(--rootsy-sombra-600)" },
  productCard: { token: "sombra-500", css: "var(--rootsy-sombra-500)" },
  footer: { token: "sombra-900", css: "var(--rootsy-sombra-900)" },
  dividerDark: { token: "sombra-border", css: "var(--rootsy-sombra-border)" },
  lightPanel: { token: "bruma-100", css: "var(--rootsy-bruma-100)" },
  lightContent: { token: "bruma-50", css: "var(--rootsy-bruma-50)" },
  lightActions: { token: "white", css: "#ffffff" },
  lightTotals: { token: "savia-975→990", css: "pos-totals gradient" },
  lightBorder: { token: "bruma-200", css: "var(--rootsy-bruma-200)" },
} as const

export type LayoutsOperarSurfaceId = keyof typeof ROOTSY_LAYOUTS_OPERAR_SURFACES

export function getLayoutsOperarSurfaceDocToken(id: LayoutsOperarSurfaceId) {
  return ROOTSY_LAYOUTS_OPERAR_SURFACES[id].token
}

/** Header wireframe — chrome sombra (continuidad workspace/tablas). */
export function getLayoutsOperarWireframeHeaderStyle() {
  return {
    background: `linear-gradient(180deg, ${hx("sombra", "950")} 0%, ${hx("sombra", "800")} 100%)`,
    borderBottom: `1px solid ${hx("sombra", "border")}`,
  } as const
}

/** Barra de totales — gradiente pos-totals (colors-new). */
export function getLayoutsOperarPosTotalsGradient() {
  return `linear-gradient(165deg, ${POS_TOTALS_GRADIENT.from} 0%, ${POS_TOTALS_GRADIENT.via} 48%, ${POS_TOTALS_GRADIENT.to} 100%)`
}

export const ROOTSY_LAYOUTS_OPERAR_PRODUCTION = {
  page: "app/[siteId]/[popId]/sale/page.tsx",
  layout: "components/layouts-module/DataWorkspaceOperationsLayout.tsx",
  ticketPanel: "components/sale-operation/SaleOperationTicketOrderPanel.tsx",
  toolboxStyles: "components/sale-operation/saleOperationStyles.ts",
  styles: "library/layouts/layoutsOperarStyles.ts",
  palette: "styles/rootsy/themes/pos.css · colors-new · sombra/bruma/savia",
} as const
