/**
 * Sistema de formulario Rootsy — fuente de verdad del design system.
 * Colores: bruma (controles claros) · savia (foco) · funcional (error).
 */

import { rootsyColorHex } from "@/lib/design-system"

const hx = rootsyColorHex

export type FormControlTypeId =
  | "text"
  | "textarea"
  | "select"
  | "checkbox"
  | "switch"
  | "prefix-money"
  | "prefix-quantity"
  | "date"
  | "date-prefix"
  | "image-upload"

export type FormImageUploadModeId = "empty" | "filled"

/** Estado extra de imagen — solo galería (drag over). */
export type FormImageUploadDisplayStateId = FormControlStateId | "drag"

export type FormControlStateId =
  | "default"
  | "hover"
  | "focus"
  | "disabled"
  | "error"
  | "readonly"

export type FormAssistVariantId = "hint" | "error" | "warning" | "success"

export const ROOTSY_FORM_MANIFESTO =
  "Un campo es label + control + ayuda en un mismo tallo — space.100 entre piezas. Savia solo en foco; danger funcional solo en error. Controles claros sobre bruma, sin inventar grises sueltos."

export const ROOTSY_FORM_PRINCIPLES = [
  {
    title: "Stack de campo",
    detail: "Label → control → hint/error con space.100 — nunca separar label del control.",
  },
  {
    title: "Foco savia",
    detail: "border.width.focused + color.border.focused — ring savia-400/45, no zinc genérico.",
  },
  {
    title: "Error funcional",
    detail: "aria-invalid → border danger + ring danger/25 — mensaje debajo en el mismo stack.",
  },
  {
    title: "Light form",
    detail: "radius.large · fondo blanco · h-11 en una línea — misma curva que botones default.",
  },
] as const

export const ROOTSY_FORM_COLOR_TOKENS = [
  {
    role: "Control · fondo",
    token: "workspace.surface",
    hex: "#FFFFFF",
  },
  {
    role: "Control · borde",
    token: "color.border",
    hex: hx("bruma", "200"),
  },
  {
    role: "Control · borde hover",
    token: "bruma-300",
    hex: hx("bruma", "300"),
  },
  {
    role: "Control · foco",
    token: "color.border.focused",
    hex: hx("savia", "400"),
  },
  {
    role: "Label",
    token: "bruma-500",
    hex: hx("bruma", "500"),
  },
  {
    role: "Texto · control",
    token: "bruma-900",
    hex: hx("bruma", "900"),
  },
  {
    role: "Placeholder",
    token: "bruma-500",
    hex: hx("bruma", "500"),
  },
  {
    role: "Hint",
    token: "bruma-500",
    hex: hx("bruma", "500"),
  },
  {
    role: "Error",
    token: "color.border.danger",
    hex: "#DC2626",
  },
  {
    role: "Switch · track on",
    token: "savia-600",
    hex: hx("savia", "600"),
  },
  {
    role: "Prefijo · fondo",
    token: "elevation.surface.sunken",
    hex: hx("bruma", "50"),
  },
  {
    role: "Prefijo · borde",
    token: "bruma-200",
    hex: hx("bruma", "200"),
  },
  {
    role: "Prefijo · texto",
    token: "bruma-600",
    hex: hx("bruma", "600"),
  },
  {
    role: "Imagen · drag",
    token: "savia-600",
    hex: hx("savia", "600"),
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
    usage: "Nombre, referencia, búsqueda — h-11 · px-3.",
  },
  {
    id: "textarea",
    token: "form.control.textarea",
    label: "Multilínea",
    usage: "Descripción, notas — min-height 84px · resize-y.",
  },
  {
    id: "select",
    token: "form.control.select",
    label: "Select",
    usage: "Trigger con chevron — misma shell que texto.",
  },
  {
    id: "checkbox",
    token: "form.control.checkbox",
    label: "Checkbox",
    usage: "Booleanos explícitos, listas de permisos.",
  },
  {
    id: "switch",
    token: "form.control.switch",
    label: "Switch",
    usage: "Toggle inmediato — on/off sin confirmación.",
  },
  {
    id: "prefix-money",
    token: "form.control.prefix",
    label: "Monto · prefijo $",
    usage: "Shell affix h-11 · slot w-11 · focus-within savia.",
  },
  {
    id: "prefix-quantity",
    token: "form.control.prefix",
    label: "Cantidad · prefijo uds.",
    usage: "Misma shell que montos — prefijo centrado w-11.",
  },
  {
    id: "date",
    token: "form.control.date",
    label: "Fecha",
    usage: "Trigger h-11 · formato largo en español.",
  },
  {
    id: "date-prefix",
    token: "form.control.date.prefix",
    label: "Fecha · prefijo calendario",
    usage: "Shell affix · ícono calendario en slot w-11.",
  },
  {
    id: "image-upload",
    token: "form.control.image-upload",
    label: "Carga de imagen",
    usage: "Miniatura 56px · empty dashed · drag savia.",
  },
]

export const ROOTSY_FORM_CONTROL_STATES: {
  id: FormControlStateId
  label: string
  description: string
}[] = [
  { id: "default", label: "default", description: "Reposo — borde bruma-200." },
  { id: "hover", label: "hover", description: "Borde bruma-300 — feedback leve." },
  { id: "focus", label: "focus", description: "Borde + ring savia-400/45." },
  { id: "disabled", label: "disabled", description: "opacity-50 · eventos bloqueados." },
  { id: "error", label: "error", description: "border danger · ring danger/25." },
  { id: "readonly", label: "readonly", description: "Fondo bruma-50 · sin edición." },
]

export const ROOTSY_FORM_FIELD_STACK = {
  gapToken: "space.100",
  gapPx: 8,
  labelToken: "form.field.label",
  controlToken: "form.field.control",
  assistToken: "form.field.assist",
} as const

export const ROOTSY_FORM_CONTROL_SPECS = {
  text: {
    heightPx: 44,
    paddingXPx: 12,
    radiusToken: "radius.large",
    radiusPx: 12,
  },
  textarea: {
    minHeightPx: 84,
    paddingXPx: 12,
    paddingYPx: 10,
    radiusToken: "radius.large",
    radiusPx: 12,
  },
  select: {
    heightPx: 44,
    paddingXPx: 12,
    radiusToken: "radius.large",
    radiusPx: 12,
  },
  checkbox: {
    sizePx: 16,
    radiusPx: 4,
  },
  switch: {
    widthPx: 36,
    heightPx: 20,
    thumbPx: 16,
  },
  affix: {
    heightPx: 44,
    prefixWidthPx: 44,
    inputPaddingXPx: 12,
    radiusToken: "radius.large",
    radiusPx: 12,
  },
  date: {
    heightPx: 44,
    prefixWidthPx: 44,
    paddingXPx: 12,
    radiusToken: "radius.large",
    radiusPx: 12,
  },
  "image-upload": {
    thumbPx: 56,
    shellPaddingPx: 8,
    gapPx: 12,
    radiusToken: "radius.large",
    radiusPx: 12,
  },
} as const

export const ROOTSY_FORM_ASSIST_VARIANTS: {
  id: FormAssistVariantId
  token: string
  usage: string
}[] = [
  { id: "hint", token: "form.assist.hint", usage: "Ayuda neutral debajo del control." },
  { id: "error", token: "form.assist.error", usage: "Validación — mismo stack, danger funcional." },
  { id: "warning", token: "form.assist.warning", usage: "Aviso no bloqueante." },
  { id: "success", token: "form.assist.success", usage: "Confirmación puntual." },
]

export const FORM_RELATED_LINKS = [
  { sectionId: "border", label: "Borde", hint: "border.form.control · focus savia." },
  { sectionId: "radius", label: "Radio", hint: "radius.large en controles." },
  { sectionId: "spacing", label: "Espaciado", hint: "field-stack · space.100." },
  { sectionId: "typography", label: "Tipografía", hint: "Labels y body en campos." },
  { sectionId: "ui-components-buttons", label: "Botones UI", hint: "Footers y submits." },
] as const
