import { ROOTSY_LAYOUTS_OPERAR_ANATOMY } from "@/app/[siteId]/[popId]/library/layouts/rootsyLayoutsOperarSystem"
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
  | "sidebar"
  | "canvas"
  | "toolbar"
  | "card"
  | "toolbox"
  | "toolbox-slot"
  | "ticket"
  | "ticket-cart"
  | "ticket-actions"
  | "ticket-total"

export function getLayoutsOperarWireframeZoneStyle(zone: LayoutsOperarWireframeZone) {
  const a = ROOTSY_LAYOUTS_OPERAR_ANATOMY

  switch (zone) {
    case "shell":
      return { backgroundColor: "var(--op-dark-shell, #0c1210)" }
    case "sidebar":
      return {
        backgroundColor: a.catalogSidebarBackground,
        borderRight: `1px solid ${a.catalogDivider}`,
      }
    case "canvas":
      return { backgroundColor: a.catalogCanvasBackground }
    case "toolbar":
      return {
        backgroundColor: a.catalogCanvasBackground,
        borderBottom: `1px solid ${a.catalogDivider}`,
      }
    case "card":
      return {
        backgroundColor: a.productCardBackground,
        border: `1px solid ${a.catalogDivider}`,
        borderRadius: 16,
      }
    case "toolbox":
      return {
        backgroundColor: a.toolboxBackgroundAlpha,
        borderTop: `1px solid ${a.catalogDivider}`,
      }
    case "toolbox-slot":
      return {
        backgroundColor: "rgba(255, 255, 255, 0.03)",
        borderRight: `1px solid ${a.catalogDivider}`,
      }
    case "ticket":
      return {
        backgroundColor: a.summaryBackground,
        borderLeft: `1px solid ${a.catalogDivider}`,
      }
    case "ticket-cart":
      return { backgroundColor: a.ticketCartBackground }
    case "ticket-actions":
      return {
        backgroundColor: "#ffffff",
        borderTop: `1px solid ${a.ticketDivider}`,
        borderBottom: `1px solid ${a.ticketDivider}`,
      }
    case "ticket-total":
      return {
        backgroundColor: a.ticketTotalBackground,
        borderTop: `1px solid ${a.ticketDivider}`,
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
