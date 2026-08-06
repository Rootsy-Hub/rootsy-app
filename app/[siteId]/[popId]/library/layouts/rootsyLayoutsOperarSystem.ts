/**
 * Layout operar — fuente de verdad del design system.
 * Espejo de sale/page.tsx · DataWorkspaceOperationsLayout · Vender / Comprar / Mesas / Mostrador.
 */


import {
  LAYOUTS_OPERAR_CATALOG_SIDEBAR_WIDTH_PX,
  LAYOUTS_OPERAR_SUMMARY_PANEL_WIDTH_PX,
} from "@/app/[siteId]/[popId]/library/layouts/layoutsOperarStyles"
import { ROOTSY_LAYOUTS_MODULE_HEADER } from "@/app/[siteId]/[popId]/library/layouts/rootsyLayoutsModuleSystem"

export const ROOTSY_LAYOUTS_OPERAR_MANIFESTO =
  "Pantalla operar — catálogo oscuro + ticket claro. Vender · Compras · Mesas · Mostrador comparten split canvas/toolbox + panel pedido ~380px bajo el shell módulo."

export const ROOTSY_LAYOUTS_OPERAR_PRINCIPLES = [
  {
    title: "Shell módulo + cuerpo dark",
    detail:
      "DataWorkspaceOperationsLayout → OperationsModuleBody (--op-dark-shell) · OperationsModuleBackdrop · header h-17 del módulo.",
  },
  {
    title: "Grid operar",
    detail:
      "main grid-cols-[1fr_380px] · fila 1 catálogo · fila 2 toolbox · columna 2 ticket row-span-2.",
  },
  {
    title: "Catálogo",
    detail:
      "Sidebar 280px colapsable · canvas #20262e · toolbar vista grilla/lista + búsqueda · cards producto.",
  },
  {
    title: "Ticket light",
    detail:
      "Panel #eef1f5 · SaleOperationTicketOrderPanel · acciones Descartar/Vender · totales en barra inferior.",
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
  toolboxBackground: "#0b100e",
  toolboxBackgroundAlpha: "rgba(11, 16, 14, 0.92)",
  ticketCartBackground: "#f4f6f9",
  ticketTotalBackground: "#252b34",
  catalogDivider: "rgba(255, 255, 255, 0.1)",
  ticketDivider: "#dfe4ea",
  productCardHeightPx: 318,
  productCardMediaHeightPx: 152,
  catalogGridColsDesktop: 3,
  toolboxSlots: ["Cliente", "Comprobante", "Pago", "Descuento"] as const,
  summaryBackground: "#eef1f5",
  catalogSidebarBackground: "#1a2027",
  catalogCanvasBackground: "#20262e",
  productCardBackground: "#252b34",
} as const

export const ROOTSY_LAYOUTS_OPERAR_PRODUCTION = {
  page: "app/[siteId]/[popId]/sale/page.tsx",
  layout: "components/layouts-module/DataWorkspaceOperationsLayout.tsx",
  ticketPanel: "components/sale-operation/SaleOperationTicketOrderPanel.tsx",
  toolboxStyles: "components/sale-operation/saleOperationStyles.ts",
  styles: "library/layouts/layoutsOperarStyles.ts",
  palette: "library/color/rootsyNaturePalette.css · .layouts-operar-body",
} as const
