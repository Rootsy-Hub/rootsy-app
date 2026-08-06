import {
  layoutsOperarProductCardAddClass,
  layoutsOperarProductCardClass,
  layoutsOperarProductCardDescClass,
  layoutsOperarProductCardGridBodyClass,
  layoutsOperarProductCardListBodyClass,
  layoutsOperarProductCardListClass,
  layoutsOperarProductCardListMediaClass,
  layoutsOperarProductCardMediaClass,
  layoutsOperarProductCardMediaPlaceholderClass,
  layoutsOperarProductCardMediaPlaceholderIconClass,
  layoutsOperarProductCardMediaPlaceholderLabelClass,
  layoutsOperarProductCardOfferClass,
  layoutsOperarProductCardPriceClass,
  layoutsOperarProductCardTitleClass,
} from "@/app/[siteId]/[popId]/library/layouts/layoutsOperarStyles"
import {
  getLayoutsOperarBorderCss,
  getLayoutsOperarDoselContinuoToolboxBandBackground,
  getLayoutsOperarPosTotalsGradient,
  getLayoutsOperarWireframeHeaderStyle,
  LAYOUTS_OPERAR_DEFAULT_TOOLBOX_PROPOSAL,
  ROOTSY_LAYOUTS_OPERAR_ANATOMY,
  ROOTSY_LAYOUTS_OPERAR_PRODUCT_CARD_PROPOSALS,
  ROOTSY_LAYOUTS_OPERAR_SURFACES,
  ROOTSY_LAYOUTS_OPERAR_TOOLBOX_PROPOSALS,
  type LayoutsOperarProductCardProposal,
  type LayoutsOperarProductCardProposalId,
  type LayoutsOperarSurfaceId,
  type LayoutsOperarToolboxProposal,
  type LayoutsOperarToolboxProposalId,
} from "@/app/[siteId]/[popId]/library/layouts/rootsyLayoutsOperarSystem"
import { ROOTSY_COLOR_SEMANTIC, rootsyColorHex } from "@/lib/design-system"
import { cn } from "@/lib/utils"
import type { CSSProperties } from "react"

const toolboxHx = rootsyColorHex

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
    ["--layouts-operar-toolbox-min-h-sm" as string]: `${a.toolboxRowMinHeightSmPx}px`,
    ["--layouts-operar-toolbox-slot-min-h" as string]: `${a.toolboxSlotMinHeightPx}px`,
    ["--layouts-operar-toolbox-slot-min-h-sm" as string]: `${a.toolboxSlotMinHeightSmPx}px`,
    ["--layouts-operar-toolbox-band-py" as string]: `${a.toolboxBandPaddingYPx}px`,
    ["--layouts-operar-toolbox-band-py-sm" as string]: `${a.toolboxBandPaddingYSmPx}px`,
    ["--layouts-operar-ticket-w" as string]: `${a.summaryPanelWidthPx}px`,
    ["--layouts-operar-ticket-rows" as string]: `${a.ticketHeaderHeightPx}px minmax(0, 1fr) ${a.ticketActionsHeightPx}px minmax(${a.ticketTotalMinHeightPx}px, auto)`,
    ["--layouts-operar-ticket-actions-h" as string]: `${a.ticketActionsHeightPx}px`,
    ["--layouts-operar-ticket-total-min-h" as string]: `${a.ticketTotalMinHeightPx}px`,
    ["--layouts-operar-ticket-total-min-h-sm" as string]: `${a.ticketTotalMinHeightSmPx}px`,
    ["--layouts-operar-border-dark-hairline" as string]: getLayoutsOperarBorderCss("darkHairline"),
    ["--layouts-operar-border-dark-default" as string]: getLayoutsOperarBorderCss("darkDefault"),
    ["--layouts-operar-border-dark-card" as string]: getLayoutsOperarBorderCss("darkCard"),
    ["--layouts-operar-border-split" as string]: getLayoutsOperarBorderCss("splitColumn"),
    ["--layouts-operar-border-light" as string]: getLayoutsOperarBorderCss("lightHairline"),
    ["--layouts-operar-border-totals" as string]: getLayoutsOperarBorderCss("totalsEdge"),
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

const WIREFRAME_ZONE_TOKEN_KEY: Partial<
  Record<LayoutsOperarWireframeZone, "shell" | "header" | "rail" | "canvas" | "card" | "footer" | "lightPanel" | "lightContent">
> = {
  shell: "shell",
  header: "header",
  sidebar: "rail",
  canvas: "canvas",
  toolbar: "canvas",
  card: "card",
  toolbox: "footer",
  "toolbox-slot": "footer",
  "ticket-header": "lightPanel",
  ticket: "lightPanel",
  "ticket-cart": "lightContent",
}

export function getLayoutsOperarWireframeSurfaceToken(zone: LayoutsOperarWireframeZone) {
  const tokenKey = WIREFRAME_ZONE_TOKEN_KEY[zone]
  if (tokenKey === "header") return ROOTSY_LAYOUTS_OPERAR_SURFACES.header.token
  if (tokenKey === "card") return ROOTSY_LAYOUTS_OPERAR_SURFACES.productCard.token
  if (tokenKey === "rail") return ROOTSY_LAYOUTS_OPERAR_SURFACES.rail.token
  if (tokenKey === "canvas") return ROOTSY_LAYOUTS_OPERAR_SURFACES.canvas.token
  if (tokenKey === "footer") {
    return `${ROOTSY_LAYOUTS_OPERAR_SURFACES.footer.token} · dosel continuo`
  }
  if (tokenKey === "shell") return ROOTSY_LAYOUTS_OPERAR_SURFACES.shell.token
  if (tokenKey === "lightPanel") return ROOTSY_LAYOUTS_OPERAR_SURFACES.lightPanel.token
  if (tokenKey === "lightContent") return ROOTSY_LAYOUTS_OPERAR_SURFACES.lightContent.token
  if (zone === "ticket-actions") return ROOTSY_LAYOUTS_OPERAR_SURFACES.lightActions.token
  if (zone === "ticket-total") return ROOTSY_LAYOUTS_OPERAR_SURFACES.lightTotals.token
  return ROOTSY_LAYOUTS_OPERAR_SURFACES[WIREFRAME_ZONE_SURFACE[zone]].token
}

export function getLayoutsOperarWireframeZoneStyle(zone: LayoutsOperarWireframeZone) {
  const surfaces = ROOTSY_LAYOUTS_OPERAR_SURFACES
  const border = getLayoutsOperarBorderCss

  switch (zone) {
    case "shell":
      return { backgroundColor: surfaces.shell.css }
    case "header":
      return getLayoutsOperarWireframeHeaderStyle()
    case "sidebar":
      return {
        backgroundColor: surfaces.rail.css,
        borderRight: `1px solid ${border("darkHairline")}`,
      }
    case "canvas":
      return { backgroundColor: surfaces.canvas.css }
    case "toolbar":
      return {
        backgroundColor: surfaces.canvas.css,
        borderBottom: `1px solid ${border("darkHairline")}`,
      }
    case "card":
      return {
        backgroundColor: surfaces.productCard.css,
        border: `1px solid ${border("darkCard")}`,
        borderRadius: 16,
      }
    case "toolbox":
      return getLayoutsOperarToolboxProposalBandStyle(LAYOUTS_OPERAR_DEFAULT_TOOLBOX_PROPOSAL)
    case "toolbox-slot":
      return {
        backgroundColor: `color-mix(in srgb, ${surfaces.footer.css} 32%, transparent)`,
        borderRight: `1px solid ${border("darkHairline")}`,
      }
    case "ticket-header":
      return {
        backgroundColor: surfaces.lightPanel.css,
        borderBottom: `1px solid ${border("lightHairline")}`,
      }
    case "ticket":
      return {
        backgroundColor: surfaces.lightPanel.css,
        borderLeft: `1px solid ${border("splitColumn")}`,
      }
    case "ticket-cart":
      return { backgroundColor: surfaces.lightContent.css }
    case "ticket-actions":
      return {
        backgroundColor: ROOTSY_COLOR_SEMANTIC.white,
        borderTop: `1px solid ${border("lightHairline")}`,
        borderBottom: `1px solid ${border("lightHairline")}`,
      }
    case "ticket-total":
      return {
        background: getLayoutsOperarPosTotalsGradient(),
        borderTop: `1px solid ${border("totalsEdge")}`,
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

export function getLayoutsOperarMainGridRowsStyle(): CSSProperties {
  const a = ROOTSY_LAYOUTS_OPERAR_ANATOMY
  return {
    gridTemplateRows: `minmax(0, 1fr) minmax(${a.toolboxRowMinHeightPx}px, auto)`,
  }
}

export function getLayoutsOperarMainGridRowsClass() {
  const a = ROOTSY_LAYOUTS_OPERAR_ANATOMY
  return `grid-rows-[minmax(0,1fr)_minmax(${a.toolboxRowMinHeightPx}px,auto)] sm:grid-rows-[minmax(0,1fr)_minmax(${a.toolboxRowMinHeightSmPx}px,auto)]`
}

export function getLayoutsOperarMainGridColsClass() {
  const a = ROOTSY_LAYOUTS_OPERAR_ANATOMY
  return `grid-cols-[minmax(0,1fr)_${a.summaryPanelWidthPx}px]`
}

export function getLayoutsOperarMainGridClass() {
  return cn(getLayoutsOperarMainGridColsClass(), getLayoutsOperarMainGridRowsClass())
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

export function getLayoutsOperarToolboxProposal(
  id: LayoutsOperarToolboxProposalId,
): LayoutsOperarToolboxProposal {
  const proposal = ROOTSY_LAYOUTS_OPERAR_TOOLBOX_PROPOSALS.find((p) => p.id === id)
  if (!proposal) throw new Error(`Unknown toolbox proposal: ${id}`)
  return proposal
}

/** Borde inferior del canvas de contexto — junta hacia toolbox. */
export function getLayoutsOperarToolboxProposalCanvasEdgeStyle(
  id: LayoutsOperarToolboxProposalId,
): CSSProperties {
  switch (id) {
    case "dosel-continuo":
      return {
        backgroundColor: toolboxHx("sombra", "800"),
        borderBottom: `1px solid ${getLayoutsOperarBorderCss("darkHairline")}`,
      }
    case "cubiertas-sombra":
      return {
        backgroundColor: toolboxHx("sombra", "800"),
        borderBottom: `1px solid ${toolboxHx("sombra", "700")}`,
      }
    case "bruma-ascendente":
      return {
        backgroundColor: toolboxHx("sombra", "800"),
        borderBottom: `1px solid color-mix(in srgb, ${toolboxHx("bruma", "200")} 18%, ${toolboxHx("sombra", "border")})`,
      }
  }
}

/** Superficie de la banda toolbox por propuesta. */
export function getLayoutsOperarToolboxProposalBandStyle(
  id: LayoutsOperarToolboxProposalId,
): CSSProperties {
  switch (id) {
    case "dosel-continuo":
      return {
        backgroundColor: getLayoutsOperarDoselContinuoToolboxBandBackground(),
        borderTop: `1px solid ${getLayoutsOperarBorderCss("darkDefault")}`,
      }
    case "cubiertas-sombra":
      return {
        background: `linear-gradient(165deg, ${toolboxHx("sombra", "900")} 0%, ${toolboxHx("sombra", "950")} 100%)`,
        borderTop: `1px solid ${toolboxHx("sombra", "700")}`,
      }
    case "bruma-ascendente":
      return {
        background: `color-mix(in srgb, ${toolboxHx("sombra", "950")} 88%, ${toolboxHx("bruma", "100")} 12%)`,
        borderTop: `1px solid color-mix(in srgb, ${toolboxHx("bruma", "200")} 22%, ${toolboxHx("sombra", "border")})`,
        backdropFilter: "blur(20px)",
      }
  }
}

/** Banda toolbox — altura + layout estructural de la propuesta (sin color). */
export function getLayoutsOperarToolboxProposalBandClass(
  id: LayoutsOperarToolboxProposalId,
): string {
  const proposal = getLayoutsOperarToolboxProposal(id)

  if (proposal.bandLayout === "flush") {
    return cn(
      "relative flex w-full flex-col overflow-hidden",
      `min-h-[${proposal.bandMinHeightPx}px] sm:min-h-[${proposal.bandMinHeightSmPx}px]`,
    )
  }

  return cn(
    "relative box-border w-full overflow-hidden",
    `min-h-[${proposal.bandMinHeightPx}px] sm:min-h-[${proposal.bandMinHeightSmPx}px]`,
  )
}

/** Props unificadas de la banda — fondo, borde y altura como parte de la propuesta. */
export function getLayoutsOperarToolboxProposalBandProps(id: LayoutsOperarToolboxProposalId) {
  return {
    className: getLayoutsOperarToolboxProposalBandClass(id),
    style: getLayoutsOperarToolboxProposalBandStyle(id),
  }
}

export type LayoutsOperarToolboxProposalSlotVariant = "pill" | "block" | "hinge"

export function getLayoutsOperarToolboxProposalSlotVariant(
  id: LayoutsOperarToolboxProposalId,
): LayoutsOperarToolboxProposalSlotVariant {
  if (id === "cubiertas-sombra") return "block"
  if (id === "bruma-ascendente") return "hinge"
  return "pill"
}

/** Slot toolbox — altura space.1000 · alineado a banda 104px / totales ticket. */
export const layoutsOperarToolboxSlotAnatomyClass =
  "flex h-full min-h-[var(--layouts-operar-toolbox-slot-min-h)] w-full items-center sm:min-h-[var(--layouts-operar-toolbox-slot-min-h-sm)]"

/** Grid interno toolbox con padding de banda desde anatomía. */
export const layoutsOperarToolboxProposalBarGridBaseClass =
  "box-border grid h-full min-h-0 grid-cols-2 lg:grid-cols-4"

/** Slot toolbox — altura desde la propuesta activa o vars de anatomía (inset). */
export function layoutsOperarToolboxProposalSlotAnatomyClass(
  id: LayoutsOperarToolboxProposalId,
): string {
  const proposal = getLayoutsOperarToolboxProposal(id)

  if (proposal.bandLayout === "flush") {
    return cn(
      "flex h-full w-full items-center",
      `min-h-[${proposal.slotMinHeightPx}px] sm:min-h-[${proposal.slotMinHeightSmPx}px]`,
    )
  }

  return cn(
    layoutsOperarToolboxSlotAnatomyClass,
  )
}

export function getLayoutsOperarToolboxProposalBarGridClass(
  id: LayoutsOperarToolboxProposalId,
): string {
  const proposal = getLayoutsOperarToolboxProposal(id)

  if (proposal.bandLayout === "flush") {
    return cn(
      layoutsOperarToolboxProposalBarGridBaseClass,
      "h-full min-h-0 flex-1 grid-rows-1 gap-0 p-0",
    )
  }

  return cn(
    layoutsOperarToolboxProposalBarGridBaseClass,
    "h-full min-h-0",
    "gap-2 p-[var(--layouts-operar-toolbox-band-py)] sm:gap-2.5 sm:p-[var(--layouts-operar-toolbox-band-py-sm)]",
  )
}

export function layoutsOperarToolboxProposalSlotClass(
  id: LayoutsOperarToolboxProposalId,
  configured: boolean,
  slotIndex: number,
  slotCount: number,
) {
  const isLast = slotIndex === slotCount - 1
  const focusRing =
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--rootsy-savia-400)_45%,transparent)] focus-visible:ring-inset"
  const slotSpacing = "gap-2.5 px-2.5 py-2 text-left sm:gap-3 sm:px-3"
  const slotAnatomy = layoutsOperarToolboxProposalSlotAnatomyClass(id)

  if (id === "cubiertas-sombra") {
    return cn(
      slotAnatomy,
      "group relative rounded-none border-0 transition-colors duration-150",
      slotSpacing,
      focusRing,
      !isLast && "border-r border-[color-mix(in_srgb,var(--rootsy-sombra-border)_55%,transparent)]",
      configured
        ? "bg-[color-mix(in_srgb,var(--rootsy-sombra-800)_52%,transparent)] text-[#f4f8f6] shadow-[inset_3px_0_0_0_var(--rootsy-savia-400)]"
        : "bg-transparent text-[color-mix(in_srgb,var(--rootsy-sombra-300)_78%,transparent)] hover:bg-[color-mix(in_srgb,var(--rootsy-sombra-900)_38%,transparent)]",
    )
  }

  if (id === "bruma-ascendente") {
    return cn(
      slotAnatomy,
      "group rounded-lg border-0 transition-[background-color,box-shadow] duration-150",
      slotSpacing,
      focusRing,
      isLast &&
        "shadow-[inset_-1px_0_0_color-mix(in_srgb,var(--rootsy-bruma-200)_16%,transparent)]",
      configured
        ? "bg-[color-mix(in_srgb,var(--rootsy-bruma-100)_10%,transparent)] shadow-[inset_0_1px_0_color-mix(in_srgb,var(--rootsy-bruma-100)_18%,transparent)]"
        : "bg-[color-mix(in_srgb,var(--rootsy-sombra-900)_22%,transparent)] hover:bg-[color-mix(in_srgb,var(--rootsy-bruma-100)_6%,var(--rootsy-sombra-950))]",
    )
  }

  return cn(
    slotAnatomy,
    "group rounded-xl border-0 transition-[background-color,box-shadow] duration-150",
    slotSpacing,
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--rootsy-savia-400)]/45",
    "focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--rootsy-sombra-950)]",
    configured
      ? "bg-[color-mix(in_srgb,var(--rootsy-savia-600)_14%,var(--rootsy-sombra-950))] shadow-[inset_0_1px_0_color-mix(in_srgb,var(--rootsy-savia-400)_14%,transparent)] hover:bg-[color-mix(in_srgb,var(--rootsy-savia-600)_18%,var(--rootsy-sombra-950))]"
      : "bg-white/[0.02] hover:bg-[color-mix(in_srgb,var(--rootsy-sombra-900)_32%,transparent)]",
  )
}

export function layoutsOperarToolboxProposalIconWrapClass(
  id: LayoutsOperarToolboxProposalId,
  configured: boolean,
) {
  if (id === "cubiertas-sombra") {
    return cn(
      "flex size-10 shrink-0 items-center justify-center rounded-md transition-colors duration-150",
      configured
        ? "bg-[color-mix(in_srgb,var(--rootsy-savia-600)_28%,transparent)] text-[color-mix(in_srgb,var(--rootsy-savia-200)_92%,white)]"
        : "bg-[color-mix(in_srgb,var(--rootsy-sombra-900)_42%,transparent)] text-[color-mix(in_srgb,var(--rootsy-sombra-300)_82%,white)] group-hover:bg-[color-mix(in_srgb,var(--rootsy-sombra-900)_55%,transparent)]",
    )
  }

  if (id === "bruma-ascendente") {
    return cn(
      "flex size-10 shrink-0 items-center justify-center rounded-lg transition-colors duration-150",
      configured
        ? "bg-[color-mix(in_srgb,var(--rootsy-savia-600)_30%,transparent)] text-[color-mix(in_srgb,var(--rootsy-savia-200)_92%,white)]"
        : "bg-[color-mix(in_srgb,var(--rootsy-sombra-900)_35%,transparent)] text-[color-mix(in_srgb,var(--rootsy-bruma-300)_78%,white)] group-hover:text-[color-mix(in_srgb,var(--rootsy-bruma-100)_88%,white)]",
    )
  }

  return cn(
    "flex size-10 shrink-0 items-center justify-center rounded-lg transition-colors duration-150",
    configured
      ? "bg-[color-mix(in_srgb,var(--rootsy-savia-600)_32%,transparent)] text-[color-mix(in_srgb,var(--rootsy-savia-200)_92%,white)]"
      : "bg-[color-mix(in_srgb,var(--rootsy-sombra-900)_38%,transparent)] text-[color-mix(in_srgb,var(--rootsy-sombra-300)_88%,white)] group-hover:bg-[color-mix(in_srgb,var(--rootsy-sombra-900)_52%,transparent)] group-hover:text-[color-mix(in_srgb,var(--rootsy-bruma-100)_92%,white)]",
  )
}

export function layoutsOperarToolboxProposalSlotLabelClass(id: LayoutsOperarToolboxProposalId) {
  if (id === "bruma-ascendente") {
    return "mb-0.5 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[color-mix(in_srgb,var(--rootsy-bruma-300)_72%,transparent)]"
  }
  if (id === "cubiertas-sombra") {
    return "mb-0.5 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[color-mix(in_srgb,var(--rootsy-sombra-400)_82%,transparent)]"
  }
  return "mb-0.5 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[color-mix(in_srgb,var(--rootsy-sombra-300)_55%,transparent)]"
}

export function layoutsOperarToolboxProposalSlotValueClass(
  id: LayoutsOperarToolboxProposalId,
  configured: boolean,
) {
  if (id === "bruma-ascendente") {
    return cn(
      "block truncate text-sm font-semibold leading-snug",
      configured
        ? "text-[color-mix(in_srgb,var(--rootsy-bruma-100)_94%,white)]"
        : "text-[color-mix(in_srgb,var(--rootsy-sombra-400)_72%,transparent)]",
    )
  }
  if (id === "cubiertas-sombra") {
    return cn(
      "block truncate text-sm font-semibold leading-snug",
      configured ? "text-[#f4f8f6]" : "text-[color-mix(in_srgb,var(--rootsy-sombra-300)_68%,transparent)]",
    )
  }
  return cn(
    "block truncate text-sm font-semibold leading-snug",
    configured ? "text-[#f4f8f6]" : "text-[color-mix(in_srgb,var(--rootsy-sombra-300)_68%,transparent)]",
  )
}

export type { LayoutsOperarToolboxProposal, LayoutsOperarToolboxProposalId }

export function getLayoutsOperarProductCardProposal(
  id: LayoutsOperarProductCardProposalId,
): LayoutsOperarProductCardProposal {
  const proposal = ROOTSY_LAYOUTS_OPERAR_PRODUCT_CARD_PROPOSALS.find((p) => p.id === id)
  if (!proposal) throw new Error(`Unknown product card proposal: ${id}`)
  return proposal
}

export function layoutsOperarProductCardProposalGridShellClass(id: LayoutsOperarProductCardProposalId) {
  if (id === "plano-dosel") return layoutsOperarProductCardClass

  if (id === "losa-sombra") {
    return cn(
      "layouts-operar-product-card group relative grid h-[318px] w-full grid-rows-[152px_1fr] overflow-hidden rounded-xl text-left",
      "border border-[color-mix(in_srgb,var(--rootsy-sombra-border)_55%,transparent)] bg-[var(--rootsy-sombra-700)]",
      "shadow-none transition-colors duration-200 hover:bg-[color-mix(in_srgb,var(--rootsy-sombra-600)_38%,var(--rootsy-sombra-700))]",
    )
  }

  return cn(
    "layouts-operar-product-card group relative grid h-[318px] w-full grid-rows-[152px_1fr] overflow-hidden rounded-2xl text-left",
    "border border-[color-mix(in_srgb,var(--rootsy-sombra-border)_65%,transparent)] bg-[var(--rootsy-sombra-600)]",
    "shadow-[inset_0_1px_0_color-mix(in_srgb,#ffffff_6%,transparent)]",
    "ring-1 ring-[color-mix(in_srgb,var(--rootsy-savia-400)_14%,transparent)]",
    "transition-[box-shadow,transform,ring-color] duration-200 ease-out hover:-translate-y-0.5",
    "hover:ring-[color-mix(in_srgb,var(--rootsy-savia-400)_32%,transparent)]",
    "hover:shadow-[inset_0_1px_0_color-mix(in_srgb,#ffffff_9%,transparent),0_8px_22px_color-mix(in_srgb,var(--rootsy-sombra-950)_36%,transparent)]",
  )
}

export function layoutsOperarProductCardProposalListShellClass(id: LayoutsOperarProductCardProposalId) {
  if (id === "plano-dosel") return layoutsOperarProductCardListClass

  if (id === "losa-sombra") {
    return cn(
      "layouts-operar-product-card group relative flex min-h-[152px] w-full items-stretch overflow-hidden rounded-xl text-left",
      "border border-[color-mix(in_srgb,var(--rootsy-sombra-border)_55%,transparent)] bg-[var(--rootsy-sombra-700)]",
      "shadow-none transition-colors duration-200 hover:bg-[color-mix(in_srgb,var(--rootsy-sombra-600)_38%,var(--rootsy-sombra-700))]",
    )
  }

  return cn(
    "layouts-operar-product-card group relative flex min-h-[152px] w-full items-stretch overflow-hidden rounded-2xl text-left",
    "border border-[color-mix(in_srgb,var(--rootsy-sombra-border)_65%,transparent)] bg-[var(--rootsy-sombra-600)]",
    "shadow-[inset_0_1px_0_color-mix(in_srgb,#ffffff_6%,transparent)]",
    "ring-1 ring-[color-mix(in_srgb,var(--rootsy-savia-400)_14%,transparent)]",
    "transition-[box-shadow,transform,ring-color] duration-200 ease-out hover:-translate-y-0.5",
    "hover:ring-[color-mix(in_srgb,var(--rootsy-savia-400)_32%,transparent)]",
  )
}

export function layoutsOperarProductCardProposalMediaClass(
  id: LayoutsOperarProductCardProposalId,
  variant: "grid" | "list",
) {
  if (id === "plano-dosel") {
    return variant === "grid" ? layoutsOperarProductCardMediaClass : layoutsOperarProductCardListMediaClass
  }

  const base = "relative shrink-0 overflow-hidden"

  if (variant === "list") {
    return cn(base, "h-[152px] w-48")
  }

  return cn(base, "min-h-0")
}

export function layoutsOperarProductCardProposalMediaStyle(
  id: LayoutsOperarProductCardProposalId,
): CSSProperties | undefined {
  if (id === "plano-dosel") return undefined

  if (id === "losa-sombra") {
    return {
      backgroundColor: toolboxHx("sombra", "800"),
      borderRight: `1px solid ${getLayoutsOperarBorderCss("darkHairline")}`,
    }
  }

  return {
    backgroundColor: toolboxHx("sombra", "950"),
    boxShadow: `inset 0 0 0 1px ${getLayoutsOperarBorderCss("darkHairline")}`,
  }
}

export function layoutsOperarProductCardProposalBodyClass(
  id: LayoutsOperarProductCardProposalId,
  variant: "grid" | "list",
) {
  if (id === "plano-dosel") {
    return variant === "grid" ? layoutsOperarProductCardGridBodyClass : layoutsOperarProductCardListBodyClass
  }

  const pad = variant === "grid" ? "p-5" : "flex min-h-0 min-w-0 flex-1 flex-col justify-between gap-2 p-5"
  return variant === "grid"
    ? cn("grid h-full min-h-0 grid-rows-[minmax(0,1fr)_auto] gap-2", pad)
    : pad
}

export function layoutsOperarProductCardProposalTitleClass(id: LayoutsOperarProductCardProposalId) {
  if (id === "plano-dosel") return layoutsOperarProductCardTitleClass

  if (id === "losa-sombra") {
    return "line-clamp-2 text-sm font-semibold leading-tight text-[#f4f8f6]"
  }

  return "line-clamp-2 text-sm font-bold leading-tight text-[color-mix(in_srgb,var(--rootsy-bruma-100)_94%,white)]"
}

export function layoutsOperarProductCardProposalDescClass(id: LayoutsOperarProductCardProposalId) {
  if (id === "plano-dosel") return layoutsOperarProductCardDescClass

  if (id === "losa-sombra") {
    return "line-clamp-2 text-xs leading-relaxed text-[color-mix(in_srgb,var(--rootsy-sombra-400)_82%,transparent)]"
  }

  return "line-clamp-2 text-xs leading-relaxed text-[color-mix(in_srgb,var(--rootsy-sombra-300)_68%,transparent)]"
}

export function layoutsOperarProductCardProposalPriceClass(id: LayoutsOperarProductCardProposalId) {
  if (id === "plano-dosel") return layoutsOperarProductCardPriceClass

  if (id === "losa-sombra") {
    return "text-lg font-semibold tabular-nums text-[color-mix(in_srgb,var(--rootsy-savia-300)_88%,white)]"
  }

  return "text-lg font-bold tabular-nums text-[color-mix(in_srgb,var(--rootsy-savia-200)_92%,white)]"
}

export function layoutsOperarProductCardProposalPlaceholderWrapClass(id: LayoutsOperarProductCardProposalId) {
  if (id === "plano-dosel") return layoutsOperarProductCardMediaPlaceholderClass

  return cn(
    "flex size-full flex-col items-center justify-center gap-2",
    id === "losa-sombra" ? "bg-[var(--rootsy-sombra-800)]" : "bg-[var(--rootsy-sombra-950)]",
  )
}

export function layoutsOperarProductCardProposalPlaceholderIconClass(id: LayoutsOperarProductCardProposalId) {
  if (id === "plano-dosel") return layoutsOperarProductCardMediaPlaceholderIconClass

  return cn(
    "flex size-11 items-center justify-center rounded-lg",
    id === "losa-sombra"
      ? "bg-[color-mix(in_srgb,var(--rootsy-sombra-900)_55%,transparent)] text-[color-mix(in_srgb,var(--rootsy-sombra-400)_75%,white)] ring-1 ring-[color-mix(in_srgb,var(--rootsy-sombra-border)_50%,transparent)]"
      : "bg-[color-mix(in_srgb,var(--rootsy-sombra-900)_62%,transparent)] text-[color-mix(in_srgb,var(--rootsy-savia-400)_55%,white)] ring-1 ring-[color-mix(in_srgb,var(--rootsy-savia-400)_22%,transparent)]",
  )
}

export function layoutsOperarProductCardProposalPlaceholderLabelClass(id: LayoutsOperarProductCardProposalId) {
  if (id === "plano-dosel") return layoutsOperarProductCardMediaPlaceholderLabelClass

  return cn(
    "text-[10px] font-semibold uppercase tracking-[0.12em]",
    id === "losa-sombra"
      ? "text-[color-mix(in_srgb,var(--rootsy-sombra-400)_72%,transparent)]"
      : "text-[color-mix(in_srgb,var(--rootsy-sombra-400)_62%,var(--rootsy-savia-400))]",
  )
}

export function layoutsOperarProductCardProposalOfferClass(id: LayoutsOperarProductCardProposalId) {
  if (id === "plano-dosel") return layoutsOperarProductCardOfferClass
  return layoutsOperarProductCardOfferClass
}

export function layoutsOperarProductCardProposalAddClass(id: LayoutsOperarProductCardProposalId) {
  if (id === "plano-dosel") return layoutsOperarProductCardAddClass

  if (id === "losa-sombra") {
    return cn(
      "pointer-events-none absolute right-2 bottom-2 z-10 flex size-8 items-center justify-center rounded-full",
      "border border-[color-mix(in_srgb,var(--rootsy-savia-400)_45%,transparent)]",
      "bg-[color-mix(in_srgb,var(--rootsy-sombra-900)_55%,transparent)]",
      "text-[color-mix(in_srgb,var(--rootsy-savia-300)_92%,white)]",
      "opacity-100 transition-colors duration-200 group-hover:bg-[var(--rootsy-savia-500)] group-hover:text-[var(--rootsy-savia-950)]",
    )
  }

  return cn(
    "pointer-events-none absolute right-2 bottom-2 z-10 flex size-8 items-center justify-center rounded-full",
    "border border-[color-mix(in_srgb,var(--rootsy-savia-300)_45%,transparent)]",
    "bg-[var(--rootsy-savia-500)] text-[var(--rootsy-savia-950)]",
    "opacity-60 transition-[opacity,transform] duration-200",
    "group-hover:translate-y-0 group-hover:scale-100 group-hover:opacity-100",
  )
}

export type { LayoutsOperarProductCardProposal, LayoutsOperarProductCardProposalId }
