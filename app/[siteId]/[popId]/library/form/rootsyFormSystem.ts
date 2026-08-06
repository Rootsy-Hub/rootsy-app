/**
 * Sistema de formulario Rootsy — fuente de verdad del design system.
 * Derivado de: spacing · border · radius · elevation · color semántico · tipografía.
 */

import { ROOTSY_BORDER_COLOR_TOKENS } from "@/app/[siteId]/[popId]/library/border/rootsyBorderSystem"
import { ROOTSY_ELEVATION_SURFACES_LIGHT } from "@/app/[siteId]/[popId]/library/elevation/rootsyElevationSystem"
import { ROOTSY_RADIUS_TOKENS } from "@/app/[siteId]/[popId]/library/radius/rootsyRadiusSystem"
import { ROOTSY_SPACING_SEMANTIC_ROLES } from "@/app/[siteId]/[popId]/library/spacing/rootsySpacingScale"
import { ROOTSY_SEMANTIC_TOKENS } from "@/app/[siteId]/[popId]/library/color/rootsyColorSystem"
import { ROOTSY_COLOR_SEMANTIC, rootsyColorHex, rootsySpacePx } from "@/lib/design-system"

const hx = rootsyColorHex

function borderHex(token: string): string {
  return ROOTSY_BORDER_COLOR_TOKENS.find((item) => item.token === token)!.value
}

function elevationHex(token: string): string {
  return ROOTSY_ELEVATION_SURFACES_LIGHT.find((item) => item.token === token)!.value
}

function radiusPx(id: "xsmall" | "medium" | "large"): number {
  return Number.parseInt(ROOTSY_RADIUS_TOKENS.find((item) => item.id === id)!.value, 10)
}

function semanticHex(id: string): string {
  return ROOTSY_SEMANTIC_TOKENS.find((item) => item.id === id)!.hex
}

function spacingRolePx(roleId: string): number {
  return ROOTSY_SPACING_SEMANTIC_ROLES.find((item) => item.id === roleId)!.px
}

/** Altura de control — alineada a botón default (space.500). */
export const ROOTSY_FORM_CONTROL_HEIGHT_PX = rootsySpacePx("500")

/** Padding horizontal de control — space.150 (control-inset). */
export const ROOTSY_FORM_CONTROL_INSET_PX = rootsySpacePx("150")

/** Gap label → control → assist — space.100 (field-stack). */
export const ROOTSY_FORM_FIELD_STACK_GAP_PX = rootsySpacePx("100")

/** Slot leading en controles compuestos — cuadrado space.500 × space.500. */
export const ROOTSY_FORM_LEADING_SLOT_PX = rootsySpacePx("500")

export type FormControlTypeId =
  | "text"
  | "textarea"
  | "select"
  | "select-leading"
  | "checkbox"
  | "switch"
  | "leading-currency"
  | "leading-unit"
  | "date"
  | "date-leading"
  | "period-filter"
  | "image-upload"

export type FormImageUploadModeId = "empty" | "filled"

export type FormImageUploadDisplayStateId = FormControlStateId | "drag"

export type FormControlStateId =
  | "default"
  | "hover"
  | "focus"
  | "disabled"
  | "error"
  | "readonly"

export type FormAssistVariantId = "hint" | "error" | "warning" | "success"

export type FormToolbarContextVariantId = "flush" | "compact"

export type FormToolbarControlShellId = "inline-icon" | "leading-sunken"

export type FormToolbarFieldRoleId = "period" | "filters" | "search"

export const ROOTSY_FORM_MANIFESTO =
  "Un campo es stack vertical — space.100 entre label, control y assist. Controles space.500 de alto, radius.large, borde bruma; savia solo en foco. Sin sombra en inputs — la elevación vive en cards, no en campos densos."

export const ROOTSY_FORM_PRINCIPLES = [
  {
    title: "Stack de campo",
    detail: "field-stack · space.100 — label → control → hint/error en un mismo tallo.",
  },
  {
    title: "Altura compartida",
    detail: "space.500 (40px) en texto, select, date y botón default — misma línea base en formularios.",
  },
  {
    title: "Foco savia",
    detail: "border.width.focused + color.border.focused — ring savia-400/45 desde border system.",
  },
  {
    title: "Sin elevación en control",
    detail: "Borde bruma, fondo blanco — sunken solo en readonly y slot leading.",
  },
  {
    title: "Contexto toolbar",
    detail: "form.context.toolbar-list — inline-icon en listados · leading-sunken en formularios densos.",
  },
] as const

export const ROOTSY_FORM_COMPOSITE_SHELLS: {
  id: FormToolbarControlShellId
  token: string
  label: string
  usage: string
}[] = [
  {
    id: "inline-icon",
    token: "form.control.shell.inline-icon",
    label: "Ícono inline",
    usage: "Fondo blanco · ícono + gap space.100 · sin casilla sunken — toolbar listados.",
  },
  {
    id: "leading-sunken",
    token: "form.control.shell.leading-sunken",
    label: "Slot leading sunken",
    usage: "Casilla bruma-50 space.500 · divisor vertical · shell compuesta.",
  },
]

export const ROOTSY_FORM_COLOR_TOKENS = [
  {
    role: "Control · fondo",
    token: "elevation.surface.overlay",
    hex: elevationHex("elevation.surface.overlay"),
  },
  {
    role: "Control · borde",
    token: "color.border",
    hex: borderHex("color.border"),
  },
  {
    role: "Control · borde hover",
    token: "bruma-300",
    hex: hx("bruma", "300"),
  },
  {
    role: "Control · foco",
    token: "color.border.focused",
    hex: borderHex("color.border.focused"),
  },
  {
    role: "Label",
    token: "bruma-700",
    hex: hx("bruma", "700"),
  },
  {
    role: "Texto · control",
    token: "bruma-900",
    hex: hx("bruma", "900"),
  },
  {
    role: "Placeholder · hint",
    token: "bruma-500",
    hex: hx("bruma", "500"),
  },
  {
    role: "Error",
    token: "status-danger",
    hex: semanticHex("status-danger"),
  },
  {
    role: "Warning",
    token: "status-warning",
    hex: semanticHex("status-warning"),
  },
  {
    role: "Success",
    token: "status-success",
    hex: semanticHex("status-success"),
  },
  {
    role: "Switch · track on",
    token: "savia-600",
    hex: hx("savia", "600"),
  },
  {
    role: "Leading · fondo",
    token: "elevation.surface.sunken",
    hex: elevationHex("elevation.surface.sunken"),
  },
  {
    role: "Readonly · fondo",
    token: "elevation.surface.sunken",
    hex: elevationHex("elevation.surface.sunken"),
  },
  {
    role: "Drag · borde",
    token: "color.border.selected",
    hex: borderHex("color.border.selected"),
  },
] as const

export const ROOTSY_FORM_CONTROL_TYPES: {
  id: FormControlTypeId
  token: string
  label: string
  usage: string
}[] = [
  {
    id: "text",
    token: "form.control.text",
    label: "Texto · una línea",
    usage: "space.500 · control-inset space.150 · radius.large.",
  },
  {
    id: "textarea",
    token: "form.control.textarea",
    label: "Multilínea",
    usage: "Min-height space.600 + space.300 · resize-y.",
  },
  {
    id: "select",
    token: "form.control.select",
    label: "Select",
    usage: "Trigger space.500 · chevron trailing · misma shell que texto.",
  },
  {
    id: "select-leading",
    token: "form.control.select.leading",
    label: "Select · slot leading",
    usage: "Shell compuesta · leading space.500 + valor · focus-within savia.",
  },
  {
    id: "checkbox",
    token: "form.control.checkbox",
    label: "Checkbox",
    usage: "space.200 · radius.xsmall · savia-600 cuando checked.",
  },
  {
    id: "switch",
    token: "form.control.switch",
    label: "Switch",
    usage: "space.600 × space.250 · thumb space.200 · radius.full.",
  },
  {
    id: "leading-currency",
    token: "form.control.leading",
    label: "Monto · leading $",
    usage: "Shell compuesta · slot leading space.500 · tabular-nums.",
  },
  {
    id: "leading-unit",
    token: "form.control.leading",
    label: "Cantidad · leading uds.",
    usage: "Misma shell · leading centrado · space.500 cuadrado.",
  },
  {
    id: "date",
    token: "form.control.date",
    label: "Fecha",
    usage: "Trigger space.500 · body · formato largo en español.",
  },
  {
    id: "date-leading",
    token: "form.control.date.leading",
    label: "Fecha · slot calendario",
    usage: "Shell compuesta · ícono en leading space.500.",
  },
  {
    id: "period-filter",
    token: "form.control.period-filter",
    label: "Filtro de período",
    usage:
      "RootsFormSelectField inline-icon · presets rápidos · rango custom en popover calendario · formato compacto dd/mm/yy.",
  },
  {
    id: "image-upload",
    token: "form.control.image-upload",
    label: "Carga de imagen",
    usage: "Fila inline · thumb space.500 · empty dashed · drag savia-600.",
  },
]

export const ROOTSY_FORM_CONTROL_STATES: {
  id: FormControlStateId
  label: string
  description: string
}[] = [
  { id: "default", label: "default", description: "Reposo — color.border bruma-200." },
  { id: "hover", label: "hover", description: "Borde bruma-300 — feedback leve." },
  { id: "focus", label: "focus", description: "color.border.focused + ring savia-400/45." },
  { id: "disabled", label: "disabled", description: "opacity-50 · eventos bloqueados." },
  { id: "error", label: "error", description: "status-danger · ring danger/25." },
  { id: "readonly", label: "readonly", description: "elevation.surface.sunken · sin edición." },
]

export const ROOTSY_FORM_FIELD_STACK = {
  gapToken: "space.100",
  gapPx: ROOTSY_FORM_FIELD_STACK_GAP_PX,
  roleId: "field-stack",
  labelToken: "form.field.label",
  controlToken: "form.field.control",
  assistToken: "form.field.assist",
} as const

const radiusLarge = radiusPx("large")
const radiusMedium = radiusPx("medium")
const radiusXsmall = radiusPx("xsmall")

export const ROOTSY_FORM_CONTROL_SPECS = {
  text: {
    heightPx: ROOTSY_FORM_CONTROL_HEIGHT_PX,
    heightToken: "space.500",
    paddingXPx: ROOTSY_FORM_CONTROL_INSET_PX,
    paddingToken: "space.150",
    radiusToken: "radius.large",
    radiusPx: radiusLarge,
  },
  textarea: {
    minHeightPx: rootsySpacePx("600") + rootsySpacePx("300"),
    minHeightToken: "space.600 + space.300",
    paddingXPx: ROOTSY_FORM_CONTROL_INSET_PX,
    paddingYPx: rootsySpacePx("100"),
    radiusToken: "radius.large",
    radiusPx: radiusLarge,
  },
  select: {
    heightPx: ROOTSY_FORM_CONTROL_HEIGHT_PX,
    heightToken: "space.500",
    paddingXPx: ROOTSY_FORM_CONTROL_INSET_PX,
    radiusToken: "radius.large",
    radiusPx: radiusLarge,
  },
  checkbox: {
    sizePx: rootsySpacePx("200"),
    sizeToken: "space.200",
    radiusToken: "radius.xsmall",
    radiusPx: radiusXsmall,
  },
  switch: {
    widthPx: rootsySpacePx("600"),
    heightPx: rootsySpacePx("250"),
    thumbPx: rootsySpacePx("200"),
    widthToken: "space.600",
    heightToken: "space.250",
    thumbToken: "space.200",
  },
  leading: {
    heightPx: ROOTSY_FORM_CONTROL_HEIGHT_PX,
    heightToken: "space.500",
    leadingSlotPx: ROOTSY_FORM_LEADING_SLOT_PX,
    leadingToken: "space.500",
    inputPaddingXPx: ROOTSY_FORM_CONTROL_INSET_PX,
    radiusToken: "radius.large",
    radiusPx: radiusLarge,
  },
  date: {
    heightPx: ROOTSY_FORM_CONTROL_HEIGHT_PX,
    heightToken: "space.500",
    paddingXPx: ROOTSY_FORM_CONTROL_INSET_PX,
    radiusToken: "radius.large",
    radiusPx: radiusLarge,
  },
  "image-upload": {
    thumbPx: ROOTSY_FORM_CONTROL_HEIGHT_PX,
    thumbToken: "space.500",
    shellPaddingPx: rootsySpacePx("100"),
    shellPaddingToken: "space.100",
    gapPx: rootsySpacePx("150"),
    gapToken: "space.150",
    actionHitPx: rootsySpacePx("400"),
    actionHitToken: "space.400",
    thumbRadiusToken: "radius.medium",
    thumbRadiusPx: radiusMedium,
    radiusToken: "radius.large",
    radiusPx: radiusLarge,
  },
} as const

export const ROOTSY_FORM_LABEL_SPEC = {
  token: "font.body",
  weightToken: "font.weight.medium",
  colorToken: "bruma-700",
  usage: "Label de campo — body medium, sin all-caps (typography guidelines).",
} as const

export const ROOTSY_FORM_ASSIST_VARIANTS: {
  id: FormAssistVariantId
  token: string
  usage: string
}[] = [
  { id: "hint", token: "form.assist.hint", usage: "body.small · bruma-500 debajo del control." },
  { id: "error", token: "form.assist.error", usage: "body.small · status-danger." },
  { id: "warning", token: "form.assist.warning", usage: "body.small · status-warning." },
  { id: "success", token: "form.assist.success", usage: "body.small · status-success." },
]

export const ROOTSY_FORM_TOOLBAR_CONTEXT = {
  token: "form.context.toolbar-list",
  label: "Toolbar · listado",
  gridColumns: 3,
  cellPaddingToken: "space.200",
  dividerToken: "color.border",
  embedShellToken: "layout.toolbar",
  embedHeightPx: rootsySpacePx("600") + rootsySpacePx("400") + rootsySpacePx("150"),
  embedBackgroundToken: "elevation.surface.overlay",
  defaultControlShell: "inline-icon" as FormToolbarControlShellId,
  usage:
    "Barra de filtros embebida en layout.toolbar — field-stack ×3 · inline-icon default · flush sin borde exterior.",
} as const

export const ROOTSY_FORM_TOOLBAR_VARIANTS: {
  id: FormToolbarContextVariantId
  token: string
  label: string
  usage: string
  showLabels: boolean
  flush: boolean
  controlShell: FormToolbarControlShellId
}[] = [
  {
    id: "flush",
    token: "form.context.toolbar-list.flush",
    label: "Flush",
    usage: "Embebido en layout.toolbar · labels visibles · inline-icon (Layouts · Tablas).",
    showLabels: true,
    flush: true,
    controlShell: "inline-icon",
  },
  {
    id: "compact",
    token: "form.context.toolbar-list.compact",
    label: "Compacto",
    usage: "Sin labels — solo controles space.500 en celdas densas.",
    showLabels: false,
    flush: true,
    controlShell: "inline-icon",
  },
]

export const ROOTSY_FORM_TOOLBAR_FIELDS: {
  id: FormToolbarFieldRoleId
  token: string
  label: string
  controlToken: string
  usage: string
}[] = [
  {
    id: "period",
    token: "form.context.toolbar-list.period",
    label: "Período",
    controlToken: "form.control.shell.inline-icon",
    usage:
      "DataWorkspacePeriodFilter · presets · rango personalizado en popover · default Este mes · activo cuando ≠ este mes.",
  },
  {
    id: "filters",
    token: "form.context.toolbar-list.filters",
    label: "Filtros",
    controlToken: "form.control.shell.inline-icon",
    usage: "Ícono filtro inline · chevron · estado y tipo.",
  },
  {
    id: "search",
    token: "form.context.toolbar-list.search",
    label: "Buscar",
    controlToken: "form.control.shell.inline-icon",
    usage: "Ícono lupa inline · sin chevron · texto libre.",
  },
]

export const FORM_RELATED_LINKS = [
  { sectionId: "border", label: "Borde", hint: "border.form · color.border.focused." },
  { sectionId: "radius", label: "Radio", hint: "radius.large en controles." },
  { sectionId: "spacing", label: "Espaciado", hint: "field-stack · control-inset." },
  { sectionId: "elevation", label: "Elevación", hint: "sunken en readonly · sin shadow en inputs." },
  { sectionId: "typography", label: "Tipografía", hint: "body en control · body.small en assist." },
  { sectionId: "ui-components-buttons", label: "Botones UI", hint: "space.500 · mismos tokens." },
  { sectionId: "ui-components-modals", label: "Modales UI", hint: "Scrim · overlay · alert." },
  { sectionId: "layouts-tables", label: "Layouts · Tablas", hint: "form.context.toolbar-list en layout.toolbar." },
] as const

export { ROOTSY_COLOR_SEMANTIC, spacingRolePx }
