/**
 * Sistema dropdown Rootsy — fuente de verdad del design system.
 * Derivado de: elevation · border · radius · spacing · color semántico · tipografía.
 */

import { ROOTSY_BORDER_COLOR_TOKENS } from "@/app/library/border/rootsyBorderSystem"
import { ROOTSY_SEMANTIC_TOKENS } from "@/app/library/color/rootsyColorSystem"
import {
  ROOTSY_ELEVATION_SHADOW_TOKENS,
  ROOTSY_ELEVATION_SURFACES_DARK,
  ROOTSY_ELEVATION_SURFACES_LIGHT,
} from "@/app/library/elevation/rootsyElevationSystem"
import { ROOTSY_RADIUS_TOKENS } from "@/app/library/radius/rootsyRadiusSystem"
import { ROOTSY_COLOR_SEMANTIC, rootsyColorHex, rootsySpacePx } from "@/lib/design-system"

const hx = rootsyColorHex

function borderHex(token: string): string {
  return ROOTSY_BORDER_COLOR_TOKENS.find((item) => item.token === token)!.value
}

function elevationHexLight(token: string): string {
  return ROOTSY_ELEVATION_SURFACES_LIGHT.find((item) => item.token === token)!.value
}

function elevationHexDark(token: string): string {
  return ROOTSY_ELEVATION_SURFACES_DARK.find((item) => item.token === token)!.value
}

function elevationShadow(token: string): string {
  return ROOTSY_ELEVATION_SHADOW_TOKENS.find((item) => item.token === token)!.value
}

function radiusPx(id: "medium" | "large" | "xlarge" | "full"): number {
  return Number.parseInt(ROOTSY_RADIUS_TOKENS.find((item) => item.id === id)!.value, 10)
}

function semanticHex(id: string): string {
  return ROOTSY_SEMANTIC_TOKENS.find((item) => item.id === id)!.hex
}

export type DropdownThemeId = "light" | "dark"

export type DropdownDensityId = "default" | "compact"

export type DropdownTriggerId = "icon-button" | "button-default" | "button-subtle"

export type DropdownItemStateId =
  | "default"
  | "hover"
  | "selected"
  | "disabled"
  | "destructive"
  | "destructive-hover"

export type DropdownAlignId = "start" | "end"

export const ROOTSY_DROPDOWN_MANIFESTO =
  "Un dropdown agrupa acciones secundarias — overlay + shadow.overlay, radius.xlarge. Ítems space.500 de alto, hover bruma-50, selección savia tint. Triggers desde Botones UI; filtros con valor visible → Select, no dropdown."

export const ROOTSY_DROPDOWN_PRINCIPLES = [
  {
    title: "Overlay emparejado",
    detail: "elevation.surface.overlay + elevation.shadow.overlay — la capa flotante siempre lleva sombra.",
  },
  {
    title: "Select ≠ Dropdown",
    detail: "Valor visible en toolbar → Formulario UI · select. Dropdown solo para menús de acción o navegación oculta.",
  },
  {
    title: "Destructive aislado",
    detail: "status-danger al final, después de color.border separator — nunca mezclado con acciones frecuentes.",
  },
  {
    title: "Triggers de librería",
    detail: "icon-button compact en filas · button default/subtle con chevron en headers — sin triggers inventados.",
  },
] as const

export const ROOTSY_DROPDOWN_COLOR_TOKENS = [
  {
    role: "Panel · fondo claro",
    token: "elevation.surface.overlay",
    hex: elevationHexLight("elevation.surface.overlay"),
  },
  {
    role: "Panel · fondo oscuro",
    token: "elevation.surface.overlay (dark)",
    hex: elevationHexDark("elevation.surface.overlay"),
  },
  {
    role: "Panel · borde",
    token: "color.border",
    hex: borderHex("color.border"),
  },
  {
    role: "Ítem · hover claro",
    token: "bruma-50",
    hex: hx("bruma", "50"),
  },
  {
    role: "Ítem · seleccionado",
    token: "savia-100",
    hex: hx("savia", "100"),
  },
  {
    role: "Ítem · destructive",
    token: "status-danger",
    hex: semanticHex("status-danger"),
  },
  {
    role: "Sombra",
    token: "elevation.shadow.overlay",
    hex: elevationShadow("elevation.shadow.overlay"),
  },
] as const

export const ROOTSY_DROPDOWN_THEMES: {
  id: DropdownThemeId
  token: string
  label: string
  surfaceToken: string
  usage: string
}[] = [
  {
    id: "light",
    token: "dropdown.theme.light",
    label: "Workspace claro",
    surfaceToken: "elevation.surface.overlay",
    usage: "Tablas, tarjetas, formularios — bruma + savia en selección.",
  },
  {
    id: "dark",
    token: "dropdown.theme.dark",
    label: "Shell sombra",
    surfaceToken: "elevation.surface.overlay",
    usage: "Header nocturno, POS — texto on-dark · hover sombra-600.",
  },
]

export const ROOTSY_DROPDOWN_DENSITIES: {
  id: DropdownDensityId
  token: string
  label: string
  minWidthPx: number
  itemHeightPx: number
  usage: string
}[] = [
  {
    id: "default",
    token: "dropdown.density.default",
    label: "Default",
    minWidthPx: rootsySpacePx("400") * 5.5,
    itemHeightPx: rootsySpacePx("500"),
    usage: "Menús de cuenta, navegación de sección.",
  },
  {
    id: "compact",
    token: "dropdown.density.compact",
    label: "Compacto",
    minWidthPx: rootsySpacePx("400") * 4.4,
    itemHeightPx: rootsySpacePx("400"),
    usage: "Acciones de fila ⋮ — alineado a icon-button compact.",
  },
]

export const ROOTSY_DROPDOWN_TRIGGERS: {
  id: DropdownTriggerId
  token: string
  label: string
  usage: string
}[] = [
  {
    id: "icon-button",
    token: "dropdown.trigger.icon-button",
    label: "Icon button",
    usage: "⋮ en filas — icon-button.row.neutral · compact · aria-label.",
  },
  {
    id: "button-default",
    token: "dropdown.trigger.button-default",
    label: "Botón default",
    usage: "Selector de sección con chevron — appearance default.",
  },
  {
    id: "button-subtle",
    token: "dropdown.trigger.button-subtle",
    label: "Botón subtle",
    usage: "Acciones terciarias en toolbar — appearance subtle.",
  },
]

export const ROOTSY_DROPDOWN_ITEM_STATES: {
  id: DropdownItemStateId
  token: string
  label: string
  usage: string
}[] = [
  { id: "default", token: "dropdown.item.default", label: "Default", usage: "body · bruma-900." },
  { id: "hover", token: "dropdown.item.hover", label: "Hover", usage: "Fondo bruma-50 · sombra-600 en dark." },
  { id: "selected", token: "dropdown.item.selected", label: "Seleccionado", usage: "savia-100 + medium + check trailing." },
  { id: "disabled", token: "dropdown.item.disabled", label: "Deshabilitado", usage: "bruma-400 · pointer none." },
  { id: "destructive", token: "dropdown.item.destructive", label: "Destructive", usage: "status-danger · después de separator." },
  {
    id: "destructive-hover",
    token: "dropdown.item.destructive-hover",
    label: "Destructive hover",
    usage: "Tint danger 8% · texto danger.",
  },
]

export const ROOTSY_DROPDOWN_ANATOMY = {
  panelRadiusPx: radiusPx("xlarge"),
  panelPaddingYPx: rootsySpacePx("100"),
  panelPaddingXPx: rootsySpacePx("050"),
  panelBorder: `1px solid ${borderHex("color.border")}`,
  shadowToken: "elevation.shadow.overlay",
  anchorGapPx: rootsySpacePx("100"),
  itemPaddingXPx: rootsySpacePx("150"),
  itemGapPx: rootsySpacePx("150"),
  iconSlotPx: rootsySpacePx("200"),
  checkSlotPx: rootsySpacePx("200"),
  labelPaddingXPx: rootsySpacePx("150"),
  labelPaddingTopPx: rootsySpacePx("100"),
  labelPaddingBottomPx: rootsySpacePx("050"),
  separatorHeightPx: 1,
  separatorMarginYPx: rootsySpacePx("050"),
  separatorInsetXPx: rootsySpacePx("100"),
  itemStackGapPx: rootsySpacePx("025"),
  destructiveTintPercent: 8,
} as const

export function getDropdownPanelBackground(theme: DropdownThemeId): string {
  return theme === "light"
    ? elevationHexLight("elevation.surface.overlay")
    : elevationHexDark("elevation.surface.overlay")
}

export function getDropdownPanelShadow(): string {
  return elevationShadow(ROOTSY_DROPDOWN_ANATOMY.shadowToken)
}

export function getDropdownDensitySpec(density: DropdownDensityId) {
  return ROOTSY_DROPDOWN_DENSITIES.find((item) => item.id === density)!
}

export function getDropdownItemLabelHex(theme: DropdownThemeId, state: DropdownItemStateId): string {
  if (state === "disabled") {
    return theme === "light" ? hx("bruma", "400") : hx("bruma", "500")
  }
  if (state === "destructive" || state === "destructive-hover") {
    return semanticHex("status-danger")
  }
  return theme === "light" ? hx("bruma", "900") : ROOTSY_COLOR_SEMANTIC.textOnDark
}

export function getDropdownItemBackground(
  theme: DropdownThemeId,
  state: DropdownItemStateId,
): string {
  if (state === "hover") {
    return theme === "light" ? hx("bruma", "50") : hx("sombra", "600")
  }
  if (state === "selected") {
    return theme === "light"
      ? hx("savia", "100")
      : `color-mix(in srgb, ${hx("savia", "500")} 18%, ${elevationHexDark("elevation.surface.overlay")})`
  }
  if (state === "destructive-hover") {
    const danger = semanticHex("status-danger")
    const base = getDropdownPanelBackground(theme)
    return `color-mix(in srgb, ${danger} ${ROOTSY_DROPDOWN_ANATOMY.destructiveTintPercent}%, ${base})`
  }
  return "transparent"
}

export function getDropdownLabelHex(theme: DropdownThemeId): string {
  return theme === "light" ? hx("bruma", "500") : hx("bruma", "400")
}

export function getDropdownSeparatorColor(theme: DropdownThemeId): string {
  return theme === "light" ? borderHex("color.border") : hx("sombra", "600")
}

export function getDropdownCheckHex(theme: DropdownThemeId): string {
  return theme === "light" ? hx("savia", "600") : hx("savia", "400")
}
