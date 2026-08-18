/**
 * Spec hardcodeada Bloques — grid · fondo módulo · tarjetas entidad.
 * @see components/data-workspace/dataWorkspaceListStyles.ts
 */

import { ROOTSY_LAYOUTS_MODULE_SHELL } from "@/app/library/layouts/rootsyLayoutsModuleSystem"
import { rootsySpacePx } from "@/lib/design-system"

/** Ancho mínimo legible de columna / tarjeta (18rem). */
export const LAYOUTS_BLOCKS_COLUMN_MIN_PX = 288

/** Ancho máximo de columna — evita tarjetas demasiado anchas en pantallas grandes. */
export const LAYOUTS_BLOCKS_COLUMN_MAX_PX = 352

/** Gap entre tarjetas — space.200 · 16px. */
export const LAYOUTS_BLOCKS_GRID_GAP_PX = rootsySpacePx("200")

export const LAYOUTS_BLOCKS_GRID_SPEC = {
  columnMinToken: "18rem",
  columnMinPx: LAYOUTS_BLOCKS_COLUMN_MIN_PX,
  columnMaxToken: "22rem",
  columnMaxPx: LAYOUTS_BLOCKS_COLUMN_MAX_PX,
  gapToken: "space.200",
  gapPx: LAYOUTS_BLOCKS_GRID_GAP_PX,
  gridTemplate: "repeat(auto-fill, minmax(min(100%, 18rem), 1fr))",
  contentBackgroundToken: ROOTSY_LAYOUTS_MODULE_SHELL.contentBackgroundToken,
  contentBackground: ROOTSY_LAYOUTS_MODULE_SHELL.contentBackground,
} as const

export const LAYOUTS_BLOCKS_CARD_SPEC = {
  surfaceToken: "elevation.surface.raised",
  radiusToken: "radius.xxlarge",
  radiusClass: "rounded-[1.375rem]",
  borderToken: "color.border · bruma-200",
  shadowToken: "elevation.shadow.raised",
  shadowRest: "rootsyElevationRaisedRestClass",
  shadowHover: "rootsyElevationRaisedHoverClass",
} as const

export const LAYOUTS_BLOCKS_LAYOUT_SPEC_ROWS = [
  {
    role: "Fondo contenido",
    token: LAYOUTS_BLOCKS_GRID_SPEC.contentBackgroundToken,
    value: LAYOUTS_BLOCKS_GRID_SPEC.contentBackground,
    product: "layout.module.content · bruma-50 · planeta en susurro",
  },
  {
    role: "Fondo · neblina",
    token: "layout.blocks.atmosphere.mist",
    value: "bruma-100 radial · cielo",
    product: "data-workspace-blocks-atmosphere",
  },
  {
    role: "Fondo · planeta",
    token: "layout.blocks.atmosphere.planet",
    value: "rootsyplanet · 22% · blur 22 · horizonte",
    product: "data-workspace-blocks-atmosphere::before",
  },
  {
    role: "Fondo · velo",
    token: "layout.blocks.atmosphere.veil",
    value: "máscara a bruma · el valle no se lee",
    product: "data-workspace-blocks-atmosphere::before",
  },
  {
    role: "Grid · columnas",
    token: "layout.blocks.grid",
    value: LAYOUTS_BLOCKS_GRID_SPEC.gridTemplate,
    product: "auto-fill · min 18rem · 1fr fluido · w-full",
  },
  {
    role: "Grid · gap",
    token: LAYOUTS_BLOCKS_GRID_SPEC.gapToken,
    value: `${LAYOUTS_BLOCKS_GRID_SPEC.gapPx}px`,
    product: "gap-4",
  },
  {
    role: "Tarjeta · radio",
    token: LAYOUTS_BLOCKS_CARD_SPEC.radiusToken,
    value: "22px",
    product: LAYOUTS_BLOCKS_CARD_SPEC.radiusClass,
  },
  {
    role: "Tarjeta · superficie",
    token: LAYOUTS_BLOCKS_CARD_SPEC.surfaceToken,
    value: "#FFFFFF",
    product: "dataWorkspaceEntityCardLosetaClass",
  },
] as const
