/**
 * Sistema layout · tablas Rootsy — fuente de verdad del design system.
 * Derivado de: sombra · bruma · savia · spacing · border · elevation · tipografía.
 */

import { ROOTSY_BORDER_COLOR_TOKENS } from "@/app/library/border/rootsyBorderSystem"
import { ROOTSY_SEMANTIC_TOKENS } from "@/app/library/color/rootsyColorSystem"
import {
  ROOTSY_ELEVATION_SHADOW_TOKENS,
  ROOTSY_ELEVATION_SURFACES_LIGHT,
} from "@/app/library/elevation/rootsyElevationSystem"
import { ROOTSY_RADIUS_TOKENS } from "@/app/library/radius/rootsyRadiusSystem"
import { ROOTSY_COLOR_SEMANTIC, rootsyColorHex, rootsySpacePx } from "@/lib/design-system"

const hx = rootsyColorHex

function borderHex(token: string): string {
  return ROOTSY_BORDER_COLOR_TOKENS.find((item) => item.token === token)!.value
}

function elevationHex(token: string): string {
  return ROOTSY_ELEVATION_SURFACES_LIGHT.find((item) => item.token === token)!.value
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
  "Listado workspace — header universo, toolbar alba, tabla flush al suelo, footer universo. Sin paleta Nature en las celdas: bruma · savia · sombra · funcional."

export const ROOTSY_LAYOUTS_TABLES_PRINCIPLES = [
  {
    title: "Chrome sombra",
    detail: "Header universo · h-17. Footer universo al suelo — misma noche, invita al cambio.",
  },
  {
    title: "Toolbar alba",
    detail: "Bruma a todo el ancho · el mundo se ve a través · form.control.shell.inline-icon · umbral entre noche y claro.",
  },
  {
    title: "Tabla bruma",
    detail: "Head space.500 · filas space.600+100 · alternancia bruma-50/white · selección savia-100.",
  },
  {
    title: "Mundo en el lienzo",
    detail: "Planeta en el gutter de filtros — la tabla ocupa el claro, de lado a lado hasta el pie.",
  },
  {
    title: "Acciones por capa",
    detail: "Chrome ghost POS · primaria savia-600 · fila ⋮ icon-button compact · sort row neutral/edit · destructive aislado.",
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
  footerBackground: `linear-gradient(168deg, color-mix(in srgb, ${hx("sombra", "950")} 94%, transparent) 0%, ${hx("sombra", "950")} 100%)`,
  titleColor: ROOTSY_COLOR_SEMANTIC.textOnDark,
  subtitleColor: hx("sombra", "300"),
  roleColor: hx("sombra", "400"),
  popRingBorder: `1px solid color-mix(in srgb, ${ROOTSY_COLOR_SEMANTIC.textOnDark} 12%, ${hx("sombra", "700")})`,
  popLogoRadiusPx: radiusPx("medium"),
  onlineDotColor: semanticHex("status-success"),
  onlineDotRing: hx("sombra", "950"),
} as const

export const ROOTSY_LAYOUTS_TABLES_TOOLBAR = {
  backgroundColor: `linear-gradient(180deg, color-mix(in srgb, ${hx("sombra", "800")} 10%, transparent) 0%, color-mix(in srgb, ${hx("bruma", "100")} 46%, transparent) 42%, color-mix(in srgb, ${elevationHex("elevation.surface.overlay")} 56%, transparent) 100%)`,
  borderBottom: `1px solid color-mix(in srgb, ${hx("savia", "400")} 22%, ${hx("bruma", "200")})`,
  chromeToken: "alba · blur 14 · mundo a través",
} as const

/** Lienzo detrás de la hoja — planeta más callado que en bloques. */
export const ROOTSY_LAYOUTS_TABLES_ATMOSPHERE = {
  mistToken: "bruma-100 radial · cielo",
  planetToken: "rootsyplanet · 16% · blur 24 · respira 14s",
  veilToken: "máscara a bruma · el valle no se lee",
  horizonToken: "savia/bruma · 1px · glow 11s",
  productClass: "data-workspace-tables-atmosphere",
} as const

export const ROOTSY_LAYOUTS_TABLES_BODY = {
  canvasBackground: elevationHex("elevation.surface"),
  tableBackground: elevationHex("elevation.surface.overlay"),
  headBackground: elevationHex("elevation.surface.sunken"),
  headTextColor: hx("bruma", "700"),
  rowEvenBackground: elevationHex("elevation.surface.overlay"),
  rowOddBackground: hx("bruma", "100"),
  rowHoverBackground: hx("savia", "50"),
  rowSelectedBackground: hx("savia", "100"),
  primaryTextColor: hx("bruma", "900"),
  secondaryTextColor: hx("bruma", "600"),
  metaTextColor: hx("bruma", "600"),
  linkColor: hx("savia", "700"),
  moneyColor: hx("bruma", "900"),
  /** Columna ordenable — label activo · ícono savia · reposo bruma-600. */
  sortActiveLabelColor: hx("bruma", "800"),
  sortInactiveLabelColor: hx("bruma", "600"),
  sortActiveIconColor: hx("savia", "700"),
  sortInactiveIconColor: hx("bruma", "600"),
} as const

export const ROOTSY_LAYOUTS_TABLES_STATUS: Record<
  LayoutsTablesStatusId,
  { label: string; backgroundColor: string; border: string; color: string }
> = {
  activo: {
    label: "Activo",
    backgroundColor: `color-mix(in srgb, ${semanticHex("status-success")} 10%, ${elevationHex("elevation.surface.overlay")})`,
    border: `1px solid color-mix(in srgb, ${semanticHex("status-success")} 25%, ${borderHex("color.border")})`,
    color: hx("savia", "800"),
  },
  inactivo: {
    label: "Inactivo",
    backgroundColor: hx("bruma", "100"),
    border: `1px solid ${hx("bruma", "300")}`,
    color: hx("bruma", "700"),
  },
  pendiente: {
    label: "Pendiente",
    backgroundColor: `color-mix(in srgb, ${semanticHex("status-warning")} 10%, ${elevationHex("elevation.surface.overlay")})`,
    border: `1px solid color-mix(in srgb, ${semanticHex("status-warning")} 25%, ${borderHex("color.border")})`,
    color: "#78350F",
  },
  vencido: {
    label: "Vencido",
    backgroundColor: `color-mix(in srgb, ${semanticHex("status-danger")} 10%, ${elevationHex("elevation.surface.overlay")})`,
    border: `1px solid color-mix(in srgb, ${semanticHex("status-danger")} 25%, ${borderHex("color.border")})`,
    color: semanticHex("status-danger"),
  },
}

export const ROOTSY_LAYOUTS_TABLES_FOOTER = {
  background: `linear-gradient(168deg, color-mix(in srgb, ${hx("sombra", "950")} 94%, transparent) 0%, ${hx("sombra", "950")} 100%)`,
  borderTop: `1px solid color-mix(in srgb, ${ROOTSY_COLOR_SEMANTIC.textOnDark} 10%, transparent)`,
  textColor: ROOTSY_COLOR_SEMANTIC.textOnDark,
  mutedColor: hx("sombra", "300"),
  dotColor: hx("sombra", "400"),
} as const
