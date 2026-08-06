import {
  getLayoutsOperarPosTotalsGradient,
  getLayoutsOperarWireframeHeaderStyle,
  ROOTSY_LAYOUTS_OPERAR_ANATOMY,
  ROOTSY_LAYOUTS_OPERAR_SURFACES,
  type LayoutsOperarSurfaceId,
} from "@/app/[siteId]/[popId]/library/layouts/rootsyLayoutsOperarSystem"
import { ROOTSY_COLOR_SEMANTIC } from "@/lib/design-system"
import type { CSSProperties } from "react"

export const LAYOUTS_OPERAR_ANATOMY = ROOTSY_LAYOUTS_OPERAR_ANATOMY

/** Variables CSS del grid — fuente única para wireframe y vista previa. */
export function getLayoutsOperarGridCssVariables(): CSSProperties {
  const a = ROOTSY_LAYOUTS_OPERAR_ANATOMY

  return {
    ["--layouts-operar-grid-cols" as string]: `minmax(0, 1fr) ${a.summaryPanelWidthPx}px`,
    ["--layouts-operar-grid-rows" as string]: `minmax(0, 1fr) minmax(${a.toolboxRowMinHeightPx}px, auto)`,
    ["--layouts-operar-catalog-rows" as string]: `${a.catalogToolbarHeightPx}px minmax(0, 1fr)`,
    ["--layouts-operar-catalog-toolbar-h" as string]: `${a.catalogToolbarHeightPx}px`,
    ["--layouts-operar-catalog-sidebar-w" as string]: `${a.catalogSidebarWidthPx}px`,
    ["--layouts-operar-toolbox-min-h" as string]: `${a.toolboxRowMinHeightPx}px`,
    ["--layouts-operar-ticket-w" as string]: `${a.summaryPanelWidthPx}px`,
    ["--layouts-operar-ticket-rows" as string]: `${a.ticketHeaderHeightPx}px minmax(0, 1fr) ${a.ticketActionsHeightPx}px minmax(${a.ticketTotalMinHeightPx}px, auto)`,
    ["--layouts-operar-ticket-actions-h" as string]: `${a.ticketActionsHeightPx}px`,
    ["--layouts-operar-ticket-total-min-h" as string]: `${a.ticketTotalMinHeightPx}px`,
  }
}

export type LayoutsOperarWireframeZone =
  | "shell"
  | "header"
  | "sidebar"
  | "canvas"
  | "toolbar"
  | "card"
  | "toolbox"
  | "toolbox-slot"
  | "ticket-header"
  | "ticket"
  | "ticket-cart"
  | "ticket-actions"
  | "ticket-total"

const WIREFRAME_ZONE_SURFACE: Record<LayoutsOperarWireframeZone, LayoutsOperarSurfaceId> = {
  shell: "shell",
  header: "header",
  sidebar: "rail",
  canvas: "canvas",
  toolbar: "canvas",
  card: "productCard",
  toolbox: "footer",
  "toolbox-slot": "footer",
  "ticket-header": "lightPanel",
  ticket: "lightPanel",
  "ticket-cart": "lightContent",
  "ticket-actions": "lightActions",
  "ticket-total": "lightTotals",
}

export function getLayoutsOperarWireframeSurfaceToken(zone: LayoutsOperarWireframeZone) {
  return ROOTSY_LAYOUTS_OPERAR_SURFACES[WIREFRAME_ZONE_SURFACE[zone]].token
}

export function getLayoutsOperarWireframeZoneStyle(zone: LayoutsOperarWireframeZone) {
  const darkBorder = ROOTSY_LAYOUTS_OPERAR_SURFACES.dividerDark.css
  const lightBorder = ROOTSY_LAYOUTS_OPERAR_SURFACES.lightBorder.css

  switch (zone) {
    case "shell":
      return { backgroundColor: ROOTSY_LAYOUTS_OPERAR_SURFACES.shell.css }
    case "header":
      return getLayoutsOperarWireframeHeaderStyle()
    case "sidebar":
      return {
        backgroundColor: ROOTSY_LAYOUTS_OPERAR_SURFACES.rail.css,
        borderRight: `1px solid ${darkBorder}`,
      }
    case "canvas":
      return { backgroundColor: ROOTSY_LAYOUTS_OPERAR_SURFACES.canvas.css }
    case "toolbar":
      return {
        backgroundColor: ROOTSY_LAYOUTS_OPERAR_SURFACES.canvas.css,
        borderBottom: `1px solid ${darkBorder}`,
      }
    case "card":
      return {
        backgroundColor: ROOTSY_LAYOUTS_OPERAR_SURFACES.productCard.css,
        border: `1px solid ${darkBorder}`,
        borderRadius: 16,
      }
    case "toolbox":
      return {
        backgroundColor: `color-mix(in srgb, ${ROOTSY_LAYOUTS_OPERAR_SURFACES.footer.css} 92%, transparent)`,
        borderTop: `1px solid ${darkBorder}`,
        backdropFilter: "blur(24px)",
      }
    case "toolbox-slot":
      return {
        backgroundColor: `color-mix(in srgb, ${ROOTSY_LAYOUTS_OPERAR_SURFACES.footer.css} 32%, transparent)`,
        borderRight: `1px solid ${darkBorder}`,
      }
    case "ticket-header":
      return {
        backgroundColor: ROOTSY_LAYOUTS_OPERAR_SURFACES.lightPanel.css,
        borderBottom: `1px solid ${lightBorder}`,
      }
    case "ticket":
      return {
        backgroundColor: ROOTSY_LAYOUTS_OPERAR_SURFACES.lightPanel.css,
        borderLeft: `1px solid ${darkBorder}`,
      }
    case "ticket-cart":
      return { backgroundColor: ROOTSY_LAYOUTS_OPERAR_SURFACES.lightContent.css }
    case "ticket-actions":
      return {
        backgroundColor: ROOTSY_COLOR_SEMANTIC.white,
        borderTop: `1px solid ${lightBorder}`,
        borderBottom: `1px solid ${lightBorder}`,
      }
    case "ticket-total":
      return {
        background: getLayoutsOperarPosTotalsGradient(),
        borderTop: "1px solid color-mix(in srgb, var(--rootsy-savia-990) 28%, transparent)",
      }
  }
}

export function getLayoutsOperarWireframeZoneLabel(
  token: string,
  mode: "fijo" | "fluido" | "min",
  measure: string,
) {
  return `${token} · ${mode} · ${measure}`
}

export function getLayoutsOperarWireframeLabel(zone: "catalog" | "toolbox" | "ticket") {
  if (zone === "catalog") {
    return `catálogo · sidebar ${ROOTSY_LAYOUTS_OPERAR_ANATOMY.catalogSidebarWidthPx}px + canvas`
  }
  if (zone === "toolbox") {
    return `toolbox · min ${ROOTSY_LAYOUTS_OPERAR_ANATOMY.toolboxRowMinHeightPx}px`
  }
  return `ticket · ${ROOTSY_LAYOUTS_OPERAR_ANATOMY.summaryPanelWidthPx}px`
}
