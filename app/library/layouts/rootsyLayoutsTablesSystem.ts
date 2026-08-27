/**
 * Sistema layout · tablas Rootsy — fuente de verdad del design system.
 * Derivado de: sombra · bruma · savia · spacing · border · elevation · tipografía.
 */

import { ROOTSY_BORDER_COLOR_TOKENS } from "@/app/library/border/rootsyBorderSystem"
import { ROOTSY_SEMANTIC_TOKENS } from "@/app/library/color/rootsyColorSystem"
import {
  ROOTSY_ELEVATION_SHADOW_TOKENS,
} from "@/app/library/elevation/rootsyElevationSystem"
import { ROOTSY_RADIUS_TOKENS } from "@/app/library/radius/rootsyRadiusSystem"
import { ROOTSY_COLOR_SEMANTIC, rootsyColorHex, rootsySpacePx } from "@/lib/design-system"

const hx = rootsyColorHex

function borderHex(token: string): string {
  return ROOTSY_BORDER_COLOR_TOKENS.find((item) => item.token === token)!.value
}

function elevationShadow(token: string): string {
  return ROOTSY_ELEVATION_SHADOW_TOKENS.find((item) => item.token === token)!.value
}

function radiusPx(id: "medium" | "large" | "xlarge"): number {
  return Number.parseInt(ROOTSY_RADIUS_TOKENS.find((item) => item.id === id)!.value, 10)
}

function semanticHex(id: string): string {
  return ROOTSY_SEMANTIC_TOKENS.find((item) => item.id === id)!.hex
}

export type LayoutsTablesStatusId = "activo" | "inactivo" | "pendiente" | "vencido"

export const ROOTSY_LAYOUTS_TABLES_MANIFESTO =
  "Listado workspace — header éter, filtros y tabla bruma, pie sombra. Scroll infinito de a 20."

export const ROOTSY_LAYOUTS_TABLES_PRINCIPLES = [
  {
    title: "Éter y claro",
    detail: "Header éter · h-17. Filtros y tabla en bruma. El pie es sombra.",
  },
  {
    title: "Filtros bruma",
    detail: "Bruma a todo el ancho · superficie 50 · form.control.shell.inline-icon · umbral entre noche y claro.",
  },
  {
    title: "Tabla bruma",
    detail: "Head space.500 · filas space.600+100 · alternancia bruma-50 / bruma-100 · selección savia-100.",
  },
  {
    title: "Claro opaco",
    detail: "Lienzo bruma-100. Superficie y filas pares en bruma-50. El pie es sombra.",
  },
  {
    title: "Acciones por capa",
    detail: "Chrome ghost POS · acciones outlined · primaria savia-600 · fila ⋮ icon-button compact · sort row neutral/edit · destructive aislado.",
  },
] as const

export const ROOTSY_LAYOUTS_TABLES_ANATOMY = {
  headerHeightPx: rootsySpacePx("800") + rootsySpacePx("050"),
  toolbarHeightPx: rootsySpacePx("600") + rootsySpacePx("400") + rootsySpacePx("150"),
  tableHeadHeightPx: rootsySpacePx("500"),
  tableRowHeightPx: rootsySpacePx("600") + rootsySpacePx("100"),
  footerHeightPx: rootsySpacePx("800") + rootsySpacePx("050"),
  headerPaddingXPx: rootsySpacePx("200"),
  toolbarCellPaddingXPx: rootsySpacePx("200"),
  tableCellPaddingXPx: rootsySpacePx("150"),
  shellRadiusPx: radiusPx("xlarge"),
  shellBorder: `1px solid ${borderHex("color.border")}`,
  shellShadow: elevationShadow("elevation.shadow.overlay"),
  headerDividerColor: hx("sombra", "600"),
  /** Columnas chrome/footer — sombra-600 70% · layoutsTablesFooterSurfaceClass border-t */
  columnDividerColor: `color-mix(in srgb, ${hx("sombra", "600")} 70%, transparent)`,
  /** Toolbar · head · filas — bruma-200 · --wt-border · color.border */
  toolbarDividerColor: borderHex("color.border"),
  contentBorderColor: borderHex("color.border"),
} as const

export const ROOTSY_LAYOUTS_TABLES_CHROME = {
  headerBackground: `linear-gradient(180deg, ${hx("sombra", "950")} 0%, ${hx("sombra", "800")} 100%)`,
  footerBackground: `linear-gradient(180deg, ${hx("sombra", "600")} 0%, ${hx("sombra", "700")} 100%)`,
  titleColor: ROOTSY_COLOR_SEMANTIC.textOnDark,
  subtitleColor: hx("sombra", "300"),
  roleColor: hx("sombra", "400"),
  popRingBorder: `1px solid color-mix(in srgb, ${ROOTSY_COLOR_SEMANTIC.textOnDark} 12%, ${hx("sombra", "700")})`,
  popLogoRadiusPx: radiusPx("medium"),
  onlineDotColor: semanticHex("status-success"),
  onlineDotRing: hx("sombra", "950"),
} as const

export const ROOTSY_LAYOUTS_TABLES_TOOLBAR = {
  backgroundColor: hx("bruma", "50"),
  borderBottom: `1px solid ${borderHex("color.border")}`,
  chromeToken: "superficie bruma-50",
} as const

/** Lienzo detrás de la hoja — bruma, sin planeta oculto bajo la tabla. */
export const ROOTSY_LAYOUTS_TABLES_ATMOSPHERE = {
  mistToken: "bruma-100 · fondo del listado",
  planetToken: "sin planeta — la hoja es bruma",
  veilToken: "toolbar superficie bruma-50",
  horizonToken: "footer sombra · superficie 600",
  productClass: "data-workspace-tables-atmosphere",
} as const

export const ROOTSY_LAYOUTS_TABLES_BODY = {
  canvasBackground: hx("bruma", "100"),
  tableBackground: hx("bruma", "50"),
  headBackground: hx("bruma", "100"),
  headTextColor: hx("bruma", "700"),
  rowEvenBackground: hx("bruma", "50"),
  rowOddBackground: hx("bruma", "100"),
  rowHoverBackground: hx("savia", "50"),
  rowSelectedBackground: hx("savia", "100"),
  primaryTextColor: hx("bruma", "900"),
  secondaryTextColor: hx("bruma", "700"),
  metaTextColor: hx("bruma", "700"),
  linkColor: hx("savia", "700"),
  moneyColor: hx("bruma", "900"),
  /** Columna ordenable — label activo · ícono savia · reposo bruma-700. */
  sortActiveLabelColor: hx("bruma", "700"),
  sortInactiveLabelColor: hx("bruma", "700"),
  sortActiveIconColor: hx("savia", "700"),
  sortInactiveIconColor: hx("bruma", "700"),
} as const

export const ROOTSY_LAYOUTS_TABLES_STATUS: Record<
  LayoutsTablesStatusId,
  { label: string; backgroundColor: string; border: string; color: string }
> = {
  activo: {
    label: "Activo",
    backgroundColor: hx("savia", "50"),
    border: `1px solid ${hx("savia", "200")}`,
    color: hx("savia", "800"),
  },
  inactivo: {
    label: "Inactivo",
    backgroundColor: hx("bruma", "100"),
    border: `1px solid ${hx("bruma", "200")}`,
    color: hx("bruma", "700"),
  },
  pendiente: {
    label: "Pendiente",
    backgroundColor: hx("sol", "50"),
    border: `1px solid ${hx("sol", "200")}`,
    color: hx("sol", "900"),
  },
  vencido: {
    label: "Vencido",
    backgroundColor: hx("lava", "50"),
    border: `1px solid ${hx("lava", "200")}`,
    color: hx("lava", "800"),
  },
}

/** Pie · atmósfera sombra — superficie 600 · texto 50 · muted 300. */
export const ROOTSY_LAYOUTS_TABLES_FOOTER = {
  background: `linear-gradient(180deg, ${hx("sombra", "600")} 0%, ${hx("sombra", "700")} 100%)`,
  borderTop: `1px solid color-mix(in srgb, ${hx("sombra", "400")} 55%, transparent)`,
  dividerColor: hx("sombra", "400"),
  textColor: hx("sombra", "50"),
  mutedColor: hx("sombra", "300"),
  moistureColor: hx("sombra", "400"),
  chromeToken: "sombra · superficie 600 · texto 50 · muted 300",
} as const
