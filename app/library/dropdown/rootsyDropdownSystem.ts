/**
 * Sistema dropdown Rootsy — fuente de verdad del design system.
 * Derivado de: elevation · border · radius · spacing · color semántico · tipografía.
 */

import { ROOTSY_BORDER_COLOR_TOKENS } from "@/app/library/border/rootsyBorderSystem"
import { ROOTSY_SEMANTIC_TOKENS } from "@/app/library/color/rootsyColorSystem"
import {
  ROOTSY_ELEVATION_SHADOW_TOKENS,
  ROOTSY_ELEVATION_SURFACES_LIGHT,
} from "@/app/library/elevation/rootsyElevationSystem"
import { ROOTSY_RADIUS_TOKENS } from "@/app/library/radius/rootsyRadiusSystem"
import {
  resolveRootsButtonAtmosphere,
  type RootsButtonAtmosphere,
} from "@/components/rootsy-button/rootsButtonAtmosphere"
import { rootsyColorHex, rootsySpacePx } from "@/lib/design-system"

const hx = rootsyColorHex

function borderHex(token: string): string {
  return ROOTSY_BORDER_COLOR_TOKENS.find((item) => item.token === token)!.value
}

function elevationHexLight(token: string): string {
  return ROOTSY_ELEVATION_SURFACES_LIGHT.find((item) => item.token === token)!.value
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
    token: "sombra-950",
    hex: hx("sombra", "950"),
  },
  {
    role: "Panel · borde claro",
    token: "color.border",
    hex: borderHex("color.border"),
  },
  {
    role: "Panel · borde sombra",
    token: "sombra-400",
    hex: hx("sombra", "400"),
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
    usage: "Sotobosque · Sombra — fondo 950 · texto 50 · mute 300 · hover 800.",
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
  { id: "hover", token: "dropdown.item.hover", label: "Hover", usage: "Fondo bruma-50 · sombra-600 en Sombra." },
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
  panelPaddingXPx: rootsySpacePx("100"),
  panelBorder: `1px solid ${borderHex("color.border")}`,
  shadowToken: "elevation.shadow.overlay",
  anchorGapPx: rootsySpacePx("100"),
  itemPaddingXPx: rootsySpacePx("150"),
  itemRadiusPx: radiusPx("large"),
  itemGapPx: rootsySpacePx("150"),
  iconSlotPx: rootsySpacePx("200"),
  checkSlotPx: rootsySpacePx("200"),
  labelPaddingXPx: rootsySpacePx("150"),
  labelPaddingTopPx: rootsySpacePx("100"),
  labelPaddingBottomPx: rootsySpacePx("050"),
  separatorHeightPx: 1,
  separatorMarginYPx: rootsySpacePx("050"),
  separatorInsetXPx: 0,
  itemStackGapPx: rootsySpacePx("025"),
  destructiveTintPercent: 8,
} as const

export function resolveDropdownAtmosphere(
  theme: DropdownThemeId = "light",
  atmosphere?: RootsButtonAtmosphere,
): RootsButtonAtmosphere {
  return resolveRootsButtonAtmosphere({
    atmosphere,
    theme: theme === "dark" ? "pos" : "workspace",
  })
}

export function getDropdownPanelBackground(
  theme: DropdownThemeId = "light",
  atmosphere?: RootsButtonAtmosphere,
): string {
  switch (resolveDropdownAtmosphere(theme, atmosphere)) {
    case "sombra":
      return hx("sombra", "950")
    case "eter":
      return hx("eter", "950")
    default:
      return elevationHexLight("elevation.surface.overlay")
  }
}

export function getDropdownPanelBorder(
  theme: DropdownThemeId = "light",
  atmosphere?: RootsButtonAtmosphere,
): string {
  switch (resolveDropdownAtmosphere(theme, atmosphere)) {
    case "sombra":
      return `1px solid ${hx("sombra", "400")}`
    case "eter":
      return `1px solid ${hx("eter", "700")}`
    default:
      return `1px solid ${borderHex("color.border")}`
  }
}

export function getDropdownPanelShadow(): string {
  return elevationShadow(ROOTSY_DROPDOWN_ANATOMY.shadowToken)
}

export function getDropdownDensitySpec(density: DropdownDensityId) {
  return ROOTSY_DROPDOWN_DENSITIES.find((item) => item.id === density)!
}

export function getDropdownItemLabelHex(
  theme: DropdownThemeId,
  state: DropdownItemStateId,
  atmosphere?: RootsButtonAtmosphere,
): string {
  const resolved = resolveDropdownAtmosphere(theme, atmosphere)
  if (state === "disabled") {
    if (resolved === "sombra") return hx("sombra", "300")
    if (resolved === "eter") return hx("eter", "300")
    return hx("bruma", "400")
  }
  if (state === "destructive" || state === "destructive-hover") {
    return resolved === "bruma" ? semanticHex("status-danger") : hx("lava", "500")
  }
  if (resolved === "sombra") return hx("sombra", "50")
  if (resolved === "eter") return hx("eter", "50")
  return hx("bruma", "900")
}

export function getDropdownItemBackground(
  theme: DropdownThemeId,
  state: DropdownItemStateId,
  atmosphere?: RootsButtonAtmosphere,
): string {
  const resolved = resolveDropdownAtmosphere(theme, atmosphere)
  if (state === "hover") {
    if (resolved === "sombra") return hx("sombra", "800")
    if (resolved === "eter") return hx("eter", "800")
    return hx("bruma", "50")
  }
  if (state === "selected") {
    if (resolved === "bruma") return hx("savia", "100")
    const base = resolved === "eter" ? hx("eter", "950") : hx("sombra", "950")
    return `color-mix(in srgb, ${hx("savia", "500")} 16%, ${base})`
  }
  if (state === "destructive-hover") {
    const danger = resolved === "bruma" ? semanticHex("status-danger") : hx("lava", "500")
    const tint = resolved === "bruma" ? ROOTSY_DROPDOWN_ANATOMY.destructiveTintPercent : 16
    const base = getDropdownPanelBackground(theme, atmosphere)
    return `color-mix(in srgb, ${danger} ${tint}%, ${base})`
  }
  return "transparent"
}

export function getDropdownLabelHex(
  theme: DropdownThemeId,
  atmosphere?: RootsButtonAtmosphere,
): string {
  switch (resolveDropdownAtmosphere(theme, atmosphere)) {
    case "sombra":
      return hx("sombra", "300")
    case "eter":
      return hx("eter", "300")
    default:
      return hx("bruma", "500")
  }
}

export function getDropdownSeparatorColor(
  theme: DropdownThemeId,
  atmosphere?: RootsButtonAtmosphere,
): string {
  switch (resolveDropdownAtmosphere(theme, atmosphere)) {
    case "sombra":
      return hx("sombra", "400")
    case "eter":
      return hx("eter", "700")
    default:
      return borderHex("color.border")
  }
}

export function getDropdownCheckHex(
  theme: DropdownThemeId,
  atmosphere?: RootsButtonAtmosphere,
): string {
  return resolveDropdownAtmosphere(theme, atmosphere) === "bruma"
    ? hx("savia", "600")
    : hx("savia", "500")
}
