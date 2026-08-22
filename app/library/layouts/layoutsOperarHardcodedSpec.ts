import {
  layoutsOperarProductCardAddClass,
  layoutsOperarProductCardClass,
  layoutsOperarProductCardDescClass,
  layoutsOperarProductCardGridBodyClass,
  layoutsOperarProductCardListBodyClass,
  layoutsOperarProductCardListClass,
  layoutsOperarProductCardListMediaClass,
  layoutsOperarProductCardMediaClass,
  layoutsOperarProductCardMediaEmptyStateClass,
  layoutsOperarProductCardMediaEmptyStateGrainClass,
  layoutsOperarProductCardOfferClass,
  layoutsOperarProductCardPriceClass,
  layoutsOperarProductCardTitleClass,
  layoutsOperarTicketCircleActionsRowClass,
  layoutsOperarSummaryCartHeadingClass,
  layoutsOperarSummaryCartMetaClass,
  layoutsOperarSummarySectionTitleClass,
  layoutsOperarSummaryCartRowClass,
  layoutsOperarSummaryHeaderRowClass,
  layoutsOperarSummaryPanelClass,
  layoutsOperarSummaryPanelStandaloneClass,
  layoutsOperarSummaryPanelSurfaceClass,
  layoutsOperarSummaryTotalRowClass,
  layoutsOperarSummaryTotalsAmountClass,
  layoutsOperarSummaryTotalsLabelClass,
  layoutsOperarSummaryTotalsSurfaceClass,
} from "@/app/library/layouts/layoutsOperarStyles"
import {
  getLayoutsOperarBorderCss,
  getLayoutsOperarDoselContinuoToolboxBandBackground,
  getLayoutsOperarPosTotalsGradient,
  getLayoutsOperarWireframeHeaderStyle,
  LAYOUTS_OPERAR_DEFAULT_TOOLBOX_PROPOSAL,
  ROOTSY_LAYOUTS_OPERAR_ANATOMY,
  ROOTSY_LAYOUTS_OPERAR_PRODUCT_CARD_PROPOSALS,
  ROOTSY_LAYOUTS_OPERAR_TICKET_PROPOSALS,
  ROOTSY_LAYOUTS_OPERAR_SURFACES,
  ROOTSY_LAYOUTS_OPERAR_TOOLBOX_PROPOSALS,
  type LayoutsOperarProductCardProposal,
  type LayoutsOperarProductCardProposalId,
  type LayoutsOperarTicketProposal,
  type LayoutsOperarTicketProposalId,
  type LayoutsOperarSurfaceId,
  type LayoutsOperarToolboxProposal,
  type LayoutsOperarToolboxProposalId,
} from "@/app/library/layouts/rootsyLayoutsOperarSystem"
import {
  ROOTSY_LAYOUTS_EARTH_FLOOR,
  rootsyLayoutsEarthFloorSlotClass,
  rootsyLayoutsEarthFloorSlotConfiguredClass,
  rootsyLayoutsEarthFloorSlotIconClass,
  rootsyLayoutsEarthFloorSlotLabelClass,
  rootsyLayoutsEarthFloorSlotValueClass,
} from "@/app/library/layouts/rootsyLayoutsEarthFloor"
import { rootsyColorHex } from "@/lib/design-system"
import { cn } from "@/lib/utils"
import type { CSSProperties } from "react"

const toolboxHx = rootsyColorHex

export const LAYOUTS_OPERAR_ANATOMY = ROOTSY_LAYOUTS_OPERAR_ANATOMY

/** Variables CSS del grid — fuente única para wireframe y vista previa. */
export function getLayoutsOperarGridCssVariables(): CSSProperties {
  const a = ROOTSY_LAYOUTS_OPERAR_ANATOMY

  return {
    ["--layouts-operar-grid-cols" as string]: `minmax(0, 1fr) ${a.summaryPanelWidthPx}px`,
    ["--layouts-operar-grid-rows" as string]: `minmax(0, 1fr)`,
    ["--layouts-operar-operation-rows" as string]: `minmax(0, 1fr) minmax(${a.toolboxRowMinHeightPx}px, auto)`,
    ["--layouts-operar-catalog-rows" as string]: `${a.catalogToolbarHeightPx}px minmax(0, 1fr)`,
    ["--layouts-operar-catalog-toolbar-h" as string]: `${a.catalogToolbarHeightPx}px`,
    ["--layouts-operar-catalog-sidebar-w" as string]: `${a.catalogSidebarWidthPx}px`,
    ["--layouts-operar-catalog-card-min" as string]: `${a.catalogCardMinWidthPx}px`,
    ["--layouts-operar-catalog-card-max" as string]: `${a.catalogCardMaxWidthPx}px`,
    ["--layouts-operar-catalog-grid-gap" as string]: `${a.catalogGridGapPx}px`,
    ["--layouts-operar-toolbox-min-h" as string]: `${a.toolboxRowMinHeightPx}px`,
    ["--layouts-operar-toolbox-min-h-sm" as string]: `${a.toolboxRowMinHeightSmPx}px`,
    ["--layouts-operar-toolbox-slot-min-h" as string]: `${a.toolboxSlotMinHeightPx}px`,
    ["--layouts-operar-toolbox-slot-min-h-sm" as string]: `${a.toolboxSlotMinHeightSmPx}px`,
    ["--layouts-operar-toolbox-band-py" as string]: `${a.toolboxBandPaddingYPx}px`,
    ["--layouts-operar-toolbox-band-py-sm" as string]: `${a.toolboxBandPaddingYSmPx}px`,
    ["--layouts-operar-ticket-w" as string]: `${a.summaryPanelWidthPx}px`,
    ["--layouts-operar-ticket-header-h" as string]: `${a.ticketHeaderHeightPx}px`,
    ["--layouts-operar-ticket-rows" as string]: `minmax(0, 1fr) ${a.ticketActionsHeightPx}px`,
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
        backgroundColor: surfaces.rail.css,
        borderBottom: `1px solid ${border("darkHairline")}`,
      }
    case "card":
      return {
        backgroundColor: surfaces.productCard.css,
        border: `1px solid ${border("darkCard")}`,
        borderRadius: 16,
      }
    case "toolbox":
      return {
        background: surfaces.footer.css,
        borderTop: ROOTSY_LAYOUTS_EARTH_FLOOR.borderTop,
      }
    case "toolbox-slot":
      return {
        backgroundColor: `color-mix(in srgb, ${ROOTSY_LAYOUTS_EARTH_FLOOR.baseCss} 32%, transparent)`,
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
        backgroundColor: surfaces.lightPanel.css,
        borderTop: `1px solid ${border("lightHairline")}`,
        borderBottom: `1px solid ${border("lightHairline")}`,
      }
    case "ticket-total":
      return {
        backgroundColor: surfaces.lightPanel.css,
        borderTop: `1px solid ${border("lightHairline")}`,
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

export function getLayoutsOperarMainGridRowsClass() {
  return "grid-rows-[minmax(0,1fr)]"
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
        background: getLayoutsOperarDoselContinuoToolboxBandBackground(),
        borderTop: ROOTSY_LAYOUTS_EARTH_FLOOR.borderTop,
        boxShadow: `inset 0 1px 0 color-mix(in srgb, ${ROOTSY_LAYOUTS_EARTH_FLOOR.mutedColor} 14%, transparent), inset 0 18px 36px color-mix(in srgb, ${ROOTSY_LAYOUTS_EARTH_FLOOR.moistureColor} 18%, transparent)`,
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
    rootsyLayoutsEarthFloorSlotClass,
    "group rounded-xl border-0",
    slotSpacing,
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--rootsy-savia-400)]/45",
    "focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--rootsy-sombra-950)]",
    configured && rootsyLayoutsEarthFloorSlotConfiguredClass,
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
    rootsyLayoutsEarthFloorSlotIconClass,
    "flex size-10 shrink-0 items-center justify-center rounded-lg",
  )
}

export function layoutsOperarToolboxProposalSlotLabelClass(id: LayoutsOperarToolboxProposalId) {
  if (id === "bruma-ascendente") {
    return "mb-0.5 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[color-mix(in_srgb,var(--rootsy-bruma-300)_72%,transparent)]"
  }
  if (id === "cubiertas-sombra") {
    return "mb-0.5 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[color-mix(in_srgb,var(--rootsy-sombra-400)_82%,transparent)]"
  }
  return cn(
    rootsyLayoutsEarthFloorSlotLabelClass,
    "mb-0.5 block text-[10px] font-semibold uppercase tracking-[0.12em]",
  )
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
    rootsyLayoutsEarthFloorSlotValueClass,
    "block truncate text-sm font-semibold leading-snug",
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
      "layouts-operar-product-card group relative grid h-[256px] w-full grid-rows-[120px_1fr] overflow-hidden rounded-xl text-left",
      "border border-[color-mix(in_srgb,var(--rootsy-sombra-border)_55%,transparent)] bg-[var(--rootsy-sombra-700)]",
      "shadow-none transition-colors duration-200 hover:bg-[color-mix(in_srgb,var(--rootsy-sombra-600)_38%,var(--rootsy-sombra-700))]",
    )
  }

  return cn(
    "layouts-operar-product-card group relative grid h-[256px] w-full grid-rows-[120px_1fr] overflow-hidden rounded-2xl text-left",
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
      "layouts-operar-product-card group relative flex min-h-[80px] w-full items-stretch overflow-hidden rounded-xl text-left",
      "border border-[color-mix(in_srgb,var(--rootsy-sombra-border)_55%,transparent)] bg-[var(--rootsy-sombra-700)]",
      "shadow-none transition-colors duration-200 hover:bg-[color-mix(in_srgb,var(--rootsy-sombra-600)_38%,var(--rootsy-sombra-700))]",
    )
  }

  return cn(
    "layouts-operar-product-card group relative flex min-h-[80px] w-full items-stretch overflow-hidden rounded-2xl text-left",
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
    return cn(base, "h-20 w-20")
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

  const pad =
    variant === "grid"
      ? "p-3"
      : "flex min-h-0 min-w-0 flex-1 items-center justify-between gap-3 px-3 py-2"
  return variant === "grid"
    ? cn("grid h-full min-h-0 grid-rows-[minmax(0,1fr)_auto] gap-1.5", pad)
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

function hashLayoutsOperarPhotoEmptySeed(seed: string) {
  let hash = 0
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

/** Capas foto ausente — luz de estudio + pools de color · variación por producto. */
export function getLayoutsOperarProductCardMediaEmptyPhotoLayers(seed = "product") {
  const hash = hashLayoutsOperarPhotoEmptySeed(seed)
  const poolAX = 42 + (hash % 30)
  const poolAY = 48 + ((hash >> 4) % 26)
  const poolBX = 58 + ((hash >> 8) % 24)
  const poolBY = 32 + ((hash >> 12) % 22)
  const saviaA = 4 + (hash % 5)
  const saviaB = 3 + ((hash >> 6) % 4)
  const brumaKey = 8 + ((hash >> 10) % 7)

  return {
    base: {
      position: "absolute" as const,
      inset: 0,
      background: `linear-gradient(152deg,
        color-mix(in srgb, var(--rootsy-sombra-800) 90%, var(--rootsy-bruma-100) 10%) 0%,
        var(--rootsy-sombra-900) 46%,
        color-mix(in srgb, var(--rootsy-sombra-950) 94%, var(--rootsy-savia-975) 6%) 100%)`,
    },
    keyLight: {
      position: "absolute" as const,
      inset: 0,
      background: `radial-gradient(ellipse 92% 72% at 16% 10%, color-mix(in srgb, var(--rootsy-bruma-100) ${brumaKey}%, transparent) 0%, transparent 70%)`,
    },
    colorPoolA: {
      position: "absolute" as const,
      inset: "-8%",
      background: `radial-gradient(ellipse 68% 52% at ${poolAX}% ${poolAY}%, color-mix(in srgb, var(--rootsy-savia-600) ${saviaA}%, transparent) 0%, transparent 74%)`,
      filter: "blur(10px)",
    },
    colorPoolB: {
      position: "absolute" as const,
      inset: "-6%",
      background: `radial-gradient(ellipse 58% 44% at ${poolBX}% ${poolBY}%, color-mix(in srgb, var(--rootsy-savia-500) ${saviaB}%, transparent) 0%, transparent 72%)`,
      filter: "blur(14px)",
    },
    depth: {
      position: "absolute" as const,
      inset: 0,
      background: `radial-gradient(ellipse 88% 62% at 50% 108%, color-mix(in srgb, var(--rootsy-sombra-950) 42%, transparent) 0%, transparent 68%)`,
    },
    vignette: {
      position: "absolute" as const,
      inset: 0,
      background: `radial-gradient(ellipse 108% 96% at 50% 46%, transparent 38%, color-mix(in srgb, var(--rootsy-sombra-950) 72%, transparent) 100%)`,
      opacity: 0.9,
    },
  }
}

export function layoutsOperarProductCardMediaEmptyStateShellClass(
  id: LayoutsOperarProductCardProposalId,
) {
  void id
  return layoutsOperarProductCardMediaEmptyStateClass
}

/** @deprecated Usar layoutsOperarProductCardMediaEmptyStateShellClass */
export function layoutsOperarProductCardProposalPlaceholderWrapClass(id: LayoutsOperarProductCardProposalId) {
  return layoutsOperarProductCardMediaEmptyStateShellClass(id)
}

/** @deprecated Eliminado — foto ausente sin tile */
export function layoutsOperarProductCardProposalPlaceholderIconClass(id: LayoutsOperarProductCardProposalId) {
  void id
  return ""
}

/** @deprecated Eliminado — foto ausente sin copy visible */
export function layoutsOperarProductCardProposalPlaceholderLabelClass(id: LayoutsOperarProductCardProposalId) {
  void id
  return ""
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

export function getLayoutsOperarTicketProposal(
  id: LayoutsOperarTicketProposalId,
): LayoutsOperarTicketProposal {
  const proposal = ROOTSY_LAYOUTS_OPERAR_TICKET_PROPOSALS.find((p) => p.id === id)
  if (!proposal) throw new Error(`Unknown ticket proposal: ${id}`)
  return proposal
}

export function layoutsOperarTicketProposalPanelClass(
  id: LayoutsOperarTicketProposalId,
  placement: "grid" | "standalone" = "standalone",
) {
  const shell = cn(
    layoutsOperarSummaryPanelSurfaceClass,
    id === "bruma-plana" &&
      "bg-[var(--rootsy-bruma-50)] text-[color-mix(in_srgb,var(--rootsy-bruma-900)_92%,black)]",
  )

  if (placement === "grid") {
    return cn(layoutsOperarSummaryPanelClass, shell)
  }

  return cn(layoutsOperarSummaryPanelStandaloneClass, shell, "h-full w-full")
}

export function layoutsOperarTicketProposalHeaderClass(id: LayoutsOperarTicketProposalId) {
  if (id === "bruma-ascendente") {
    return cn(
      layoutsOperarSummaryHeaderRowClass,
      "relative border-b border-[color-mix(in_srgb,var(--rootsy-bruma-200)_85%,transparent)]",
      "bg-[linear-gradient(180deg,color-mix(in_srgb,var(--rootsy-bruma-50)_92%,white)_0%,var(--rootsy-bruma-100)_100%)]",
    )
  }

  if (id === "bruma-plana") {
    return cn(
      layoutsOperarSummaryHeaderRowClass,
      "border-b border-[color-mix(in_srgb,var(--rootsy-bruma-200)_90%,transparent)] bg-[var(--rootsy-bruma-50)]",
    )
  }

  return layoutsOperarSummaryHeaderRowClass
}

export function layoutsOperarTicketProposalCartRowClass(id: LayoutsOperarTicketProposalId) {
  if (id === "bruma-plana") {
    return cn(
      layoutsOperarSummaryCartRowClass,
      "bg-[var(--rootsy-bruma-50)]",
    )
  }

  return layoutsOperarSummaryCartRowClass
}

export function layoutsOperarTicketProposalCartListClass(id: LayoutsOperarTicketProposalId) {
  if (id === "bruma-plana") {
    return "divide-y divide-[color-mix(in_srgb,var(--rootsy-bruma-200)_92%,transparent)]"
  }

  if (id === "bruma-ascendente") {
    return "divide-y divide-[var(--layouts-operar-light-cart-divider)]"
  }

  return ""
}

export function layoutsOperarTicketProposalLineGridClass(id: LayoutsOperarTicketProposalId) {
  return cn(
    "grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-x-2.5 px-3 py-2.5 text-left",
    id === "bruma-plana" && "py-2",
  )
}

export function layoutsOperarTicketProposalLineThumbClass(id: LayoutsOperarTicketProposalId) {
  void id
  return "relative size-14 shrink-0 overflow-hidden rounded-lg border border-[var(--layouts-operar-border-light)] bg-[var(--rootsy-bruma-200)]"
}

export function layoutsOperarTicketProposalQtyClass(id: LayoutsOperarTicketProposalId) {
  void id
  return "shrink-0 text-right text-sm font-bold tabular-nums text-[var(--rootsy-bruma-700)]"
}

export function layoutsOperarTicketProposalLineNameClass(id: LayoutsOperarTicketProposalId) {
  void id
  return "block text-sm font-normal leading-snug text-[var(--rootsy-bruma-900)]"
}

export function layoutsOperarTicketProposalLineMetaClass(id: LayoutsOperarTicketProposalId) {
  void id
  return "mt-0.5 block truncate text-xs leading-snug text-[var(--layouts-operar-light-cart-line-meta)]"
}

export function layoutsOperarTicketProposalLineAmountClass(id: LayoutsOperarTicketProposalId) {
  if (id === "bruma-plana") {
    return "text-sm font-semibold tabular-nums text-[color-mix(in_srgb,var(--rootsy-bruma-900)_88%,black)]"
  }

  return "text-sm font-semibold tabular-nums text-[var(--layouts-operar-light-cart-line-text)]"
}

export function layoutsOperarTicketProposalLineCommentClass(id: LayoutsOperarTicketProposalId) {
  if (id === "bruma-plana") {
    return cn(
      "border-t border-[color-mix(in_srgb,var(--rootsy-bruma-200)_92%,transparent)] bg-[color-mix(in_srgb,var(--rootsy-bruma-100)_55%,white)] px-3 py-2",
      "text-[11px] leading-snug text-[var(--layouts-operar-light-cart-line-meta)]",
    )
  }

  return cn(
    "border-t border-[var(--layouts-operar-light-cart-divider)] bg-[color-mix(in_srgb,var(--rootsy-bruma-50)_65%,white)] px-3 py-2",
    "text-[11px] leading-snug text-[var(--layouts-operar-light-cart-line-meta)]",
  )
}

export function layoutsOperarTicketProposalPromoBannerClass(
  id: LayoutsOperarTicketProposalId,
  variant: "promotion" | "discount",
) {
  const isDiscount = variant === "discount"

  if (id === "bruma-plana") {
    return cn(
      "grid w-full grid-cols-[minmax(0,2.25rem)_minmax(0,1fr)_auto] items-center gap-x-2 px-3 py-2 text-left",
      isDiscount
        ? "border-y border-[color-mix(in_srgb,var(--rootsy-savia-600)_22%,var(--rootsy-bruma-200))] bg-[color-mix(in_srgb,var(--rootsy-savia-600)_8%,var(--rootsy-bruma-50))] text-[var(--layouts-operar-light-cart-discount-banner-text)]"
        : "border-y border-[color-mix(in_srgb,var(--rootsy-savia-400)_24%,var(--rootsy-bruma-200))] bg-[color-mix(in_srgb,var(--rootsy-savia-400)_10%,var(--rootsy-bruma-50))] text-[var(--layouts-operar-light-cart-promo-banner-text)]",
    )
  }

  if (id === "bruma-ascendente") {
    return cn(
      "grid w-full grid-cols-[minmax(0,2.25rem)_minmax(0,1fr)_auto] items-center gap-x-2 px-3 py-2 text-left",
      isDiscount
        ? "bg-[color-mix(in_srgb,var(--rootsy-savia-600)_14%,var(--rootsy-bruma-100))] text-[var(--layouts-operar-light-cart-discount-banner-text)] ring-1 ring-inset ring-[color-mix(in_srgb,var(--rootsy-savia-500)_28%,transparent)]"
        : "bg-[color-mix(in_srgb,var(--rootsy-savia-400)_16%,var(--rootsy-bruma-100))] text-[var(--layouts-operar-light-cart-promo-banner-text)] ring-1 ring-inset ring-[color-mix(in_srgb,var(--rootsy-savia-400)_32%,transparent)]",
    )
  }

  return cn(
    "grid w-full grid-cols-[minmax(0,2.25rem)_minmax(0,1fr)_auto] items-center gap-x-2 px-3 py-2 text-left",
    isDiscount
      ? "bg-[var(--layouts-operar-light-cart-discount-banner-bg)] text-[var(--layouts-operar-light-cart-discount-banner-text)]"
      : "bg-[var(--layouts-operar-light-cart-promo-banner-bg)] text-[var(--layouts-operar-light-cart-promo-banner-text)]",
  )
}

export function layoutsOperarTicketProposalPromoBadgeClass(
  id: LayoutsOperarTicketProposalId,
  variant: "promotion" | "discount",
) {
  const isDiscount = variant === "discount"

  if (id === "bruma-plana") {
    return cn(
      "shrink-0 rounded px-1.5 py-0.5 text-[11px] font-bold tabular-nums",
      isDiscount
        ? "bg-[color-mix(in_srgb,var(--rootsy-savia-600)_14%,transparent)] text-[var(--rootsy-savia-950)]"
        : "bg-[color-mix(in_srgb,var(--rootsy-savia-500)_16%,transparent)] text-[var(--rootsy-savia-900)]",
    )
  }

  if (id === "bruma-ascendente") {
    return cn(
      "shrink-0 rounded-md px-2 py-0.5 text-[11px] font-bold tabular-nums",
      isDiscount
        ? "bg-[color-mix(in_srgb,var(--rootsy-savia-600)_18%,transparent)] text-[var(--rootsy-savia-950)] ring-1 ring-[color-mix(in_srgb,var(--rootsy-savia-500)_24%,transparent)]"
        : "bg-[color-mix(in_srgb,var(--rootsy-savia-500)_20%,transparent)] text-[var(--rootsy-savia-900)] ring-1 ring-[color-mix(in_srgb,var(--rootsy-savia-400)_28%,transparent)]",
    )
  }

  return cn(
    "shrink-0 rounded-md px-2 py-0.5 text-[11px] font-bold tabular-nums",
    isDiscount
      ? "bg-[var(--layouts-operar-light-cart-discount-badge-bg)] text-[var(--layouts-operar-light-cart-discount-badge-text)]"
      : "bg-[var(--layouts-operar-light-cart-promo-badge-bg)] text-[var(--layouts-operar-light-cart-promo-badge-text)]",
  )
}

export function layoutsOperarTicketProposalActionsClass(id: LayoutsOperarTicketProposalId) {
  if (id === "bruma-plana") {
    return cn(
      layoutsOperarTicketCircleActionsRowClass,
      "border-t border-[color-mix(in_srgb,var(--rootsy-bruma-200)_92%,transparent)] bg-[var(--rootsy-bruma-50)]",
    )
  }

  return layoutsOperarTicketCircleActionsRowClass
}

export function layoutsOperarTicketProposalActionDiscardClass(id: LayoutsOperarTicketProposalId) {
  void id
  return "flex items-center justify-center text-sm font-semibold text-rose-700"
}

export function layoutsOperarTicketProposalActionSellClass(id: LayoutsOperarTicketProposalId) {
  if (id === "bruma-plana") {
    return "flex items-center justify-center bg-[var(--rootsy-savia-975)] text-sm font-semibold text-[var(--rootsy-savia-50)]"
  }

  return "flex items-center justify-center bg-[var(--rootsy-savia-600)] text-sm font-semibold text-white"
}

export function layoutsOperarTicketProposalTotalsShellClass(id: LayoutsOperarTicketProposalId) {
  const proposal = getLayoutsOperarTicketProposal(id)

  if (proposal.totalsLayout === "plano") {
    return cn(
      "layouts-operar-summary-totals relative box-border flex w-full shrink-0 flex-col justify-center",
      "border-t border-[color-mix(in_srgb,var(--rootsy-savia-800)_35%,transparent)] px-4 py-3",
      "min-h-[var(--layouts-operar-toolbox-min-h)] sm:min-h-[var(--layouts-operar-toolbox-min-h-sm)]",
      "bg-[var(--rootsy-savia-975)] text-[var(--rootsy-savia-50)]",
    )
  }

  if (proposal.totalsLayout === "ring") {
    return cn(
      layoutsOperarSummaryTotalRowClass,
      layoutsOperarSummaryTotalsSurfaceClass,
      "layouts-operar-summary-totals relative box-border flex w-full shrink-0 flex-col justify-center px-4 py-3",
      "ring-1 ring-inset ring-[color-mix(in_srgb,var(--rootsy-savia-400)_38%,transparent)]",
    )
  }

  return cn(
    layoutsOperarSummaryTotalsSurfaceClass,
    "layouts-operar-summary-totals relative box-border flex w-full shrink-0 flex-col justify-center gap-2 px-4 py-3",
  )
}

export function layoutsOperarTicketProposalTotalsHeadingClass(id: LayoutsOperarTicketProposalId) {
  if (id === "bruma-savia") {
    return cn(layoutsOperarSummarySectionTitleClass, "m-0")
  }

  return cn(layoutsOperarSummaryCartHeadingClass, "m-0")
}

export function layoutsOperarTicketProposalTotalsGridClass(id: LayoutsOperarTicketProposalId) {
  return "relative z-10 grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1"
}

export function layoutsOperarTicketProposalTotalsDividerClass(id: LayoutsOperarTicketProposalId) {
  if (id === "bruma-plana") {
    return "col-span-2 mt-1.5 border-t border-[color-mix(in_srgb,var(--rootsy-savia-200)_20%,transparent)] pt-2"
  }

  if (id === "bruma-ascendente") {
    return "col-span-2 mt-1.5 border-t border-[color-mix(in_srgb,var(--rootsy-savia-300)_24%,transparent)] pt-2"
  }

  return "col-span-2 mt-1.5 border-t border-[var(--layouts-operar-border-light)] pt-2.5"
}

export function layoutsOperarTicketProposalTotalsBreakdownLabelClass(
  id: LayoutsOperarTicketProposalId,
) {
  if (id === "bruma-plana") {
    return "self-center text-[10px] font-medium uppercase tracking-[0.12em] text-[color-mix(in_srgb,var(--rootsy-savia-200)_62%,transparent)]"
  }

  if (id === "bruma-savia") {
    return "self-center text-sm font-normal text-[var(--rootsy-bruma-700)]"
  }

  return "self-center text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--layouts-operar-light-totals-breakdown-label)]"
}

export function layoutsOperarTicketProposalTotalsBreakdownAmountClass(
  id: LayoutsOperarTicketProposalId,
  kind: "normal" | "discount" = "normal",
) {
  if (id === "bruma-savia") {
    const base = "m-0 min-w-[6.5rem] text-right text-sm font-normal tabular-nums"

    if (kind === "discount") {
      return cn(base, "text-[var(--rootsy-bruma-600)]")
    }

    return cn(base, "text-[var(--rootsy-bruma-900)]")
  }

  const base = "m-0 min-w-[6.5rem] text-right text-sm font-normal tabular-nums"

  if (kind === "discount") {
    if (id === "bruma-plana") {
      return cn(base, "text-[var(--rootsy-savia-100)]")
    }

    return cn(base, "text-[var(--layouts-operar-light-totals-breakdown-discount)]")
  }

  if (id === "bruma-plana") {
    return cn(base, "text-[color-mix(in_srgb,var(--rootsy-savia-50)_78%,white)]")
  }

  return cn(base, "text-[color-mix(in_srgb,var(--rootsy-savia-50)_78%,white)]")
}

export function layoutsOperarTicketProposalTotalsMainLabelClass(id: LayoutsOperarTicketProposalId) {
  if (id === "bruma-savia") {
    return "m-0 self-center text-sm font-bold text-[var(--rootsy-bruma-900)]"
  }

  return cn(layoutsOperarSummaryTotalsLabelClass, "m-0 self-center")
}

export function layoutsOperarTicketProposalTotalsMainAmountClass(id: LayoutsOperarTicketProposalId) {
  if (id === "bruma-savia") {
    return "m-0 self-center min-w-[6.5rem] text-right text-sm font-bold tabular-nums leading-none text-[var(--rootsy-bruma-900)]"
  }

  return cn(
    layoutsOperarSummaryTotalsAmountClass,
    "m-0 self-center min-w-[6.5rem] text-right leading-none",
  )
}

export type { LayoutsOperarProductCardProposal, LayoutsOperarProductCardProposalId }
export type { LayoutsOperarTicketProposal, LayoutsOperarTicketProposalId }
