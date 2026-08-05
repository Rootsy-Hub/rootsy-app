/**
 * Specs hardcodeadas Formulario UI — fundamentos actuales.
 */

import {
  ROOTSY_FORM_ASSIST_VARIANTS,
  ROOTSY_FORM_COLOR_TOKENS,
  ROOTSY_FORM_CONTROL_SPECS,
  ROOTSY_FORM_CONTROL_STATES,
  ROOTSY_FORM_CONTROL_TYPES,
  ROOTSY_FORM_FIELD_STACK,
  type FormAssistVariantId,
  type FormControlStateId,
  type FormControlTypeId,
  type FormImageUploadModeId,
  type FormImageUploadDisplayStateId,
} from "@/app/[siteId]/[popId]/library/form/rootsyFormSystem"
import { ROOTSY_RADIUS_TOKENS } from "@/app/[siteId]/[popId]/library/radius/rootsyRadiusSystem"
import { getRootsyTheme, rootsyColorHex, rootsySpacePx } from "@/lib/design-system"
import { ROOTSY_FONT_WEIGHTS, ROOTSY_TEXT_STYLES } from "@/lib/design-system/tokens/typography"

const hx = rootsyColorHex
const workspace = getRootsyTheme("workspace")

function colorHex(token: string): string {
  return ROOTSY_FORM_COLOR_TOKENS.find((item) => item.token === token)!.hex
}

function radiusPx(): number {
  return Number.parseInt(
    ROOTSY_RADIUS_TOKENS.find((item) => item.id === "large")!.value,
    10,
  )
}

const FOCUS_RING = `0 0 0 2px color-mix(in srgb, ${hx("savia", "400")} 45%, transparent)`
const ERROR_RING = `0 0 0 2px color-mix(in srgb, #DC2626 25%, transparent)`

export type FormControlUiSurface = {
  backgroundColor: string
  color: string
  border: string
  boxShadow?: string
  opacity?: number
  placeholderColor?: string
}

export const FORM_UI_INTERACTION_STATES = ROOTSY_FORM_CONTROL_STATES

export const FORM_UI_CONTROL_TYPES = ROOTSY_FORM_CONTROL_TYPES

export const FORM_UI_FIELD_STACK = {
  ...ROOTSY_FORM_FIELD_STACK,
  gapPx: rootsySpacePx("100"),
}

export const FORM_UI_LABEL_STYLE = {
  fontFamily: "var(--rootsy-font-ui)",
  fontSize: "10px",
  lineHeight: "14px",
  fontWeight: ROOTSY_FONT_WEIGHTS.semibold.value,
  letterSpacing: "0.12em",
  textTransform: "uppercase" as const,
  color: colorHex("bruma-500"),
}

export const FORM_UI_CONTROL_TYPOGRAPHY = {
  fontFamily: "var(--rootsy-font-ui)",
  fontSize: ROOTSY_TEXT_STYLES.body.fontSize,
  lineHeight: ROOTSY_TEXT_STYLES.body.lineHeight,
  fontWeight: ROOTSY_FONT_WEIGHTS.regular.value,
}

function getDefaultControlSurface(): FormControlUiSurface {
  return {
    backgroundColor: colorHex("workspace.surface"),
    color: colorHex("bruma-900"),
    border: `1px solid ${colorHex("color.border")}`,
    placeholderColor: colorHex("bruma-500"),
  }
}

export function getFormControlUiSurface(
  state: FormControlStateId = "default",
): FormControlUiSurface {
  const base = getDefaultControlSurface()

  switch (state) {
    case "default":
      return base
    case "hover":
      return {
        ...base,
        border: `1px solid ${colorHex("bruma-300")}`,
      }
    case "focus":
      return {
        ...base,
        border: `1px solid ${colorHex("color.border.focused")}`,
        boxShadow: FOCUS_RING,
      }
    case "disabled":
      return { ...base, opacity: 0.5 }
    case "error":
      return {
        ...base,
        border: `1px solid ${colorHex("color.border.danger")}`,
        boxShadow: ERROR_RING,
      }
    case "readonly":
      return {
        ...base,
        backgroundColor: hx("bruma", "50"),
        color: workspace.textPrimary,
      }
  }
}

export function getFormAssistUiStyle(variant: FormAssistVariantId): CSSPropertiesLike {
  const base = {
    fontFamily: "var(--rootsy-font-ui)",
    fontSize: ROOTSY_TEXT_STYLES["body.small"].fontSize,
    lineHeight: ROOTSY_TEXT_STYLES["body.small"].lineHeight,
    fontWeight: ROOTSY_FONT_WEIGHTS.regular.value,
  }

  switch (variant) {
    case "hint":
      return { ...base, color: colorHex("bruma-500") }
    case "error":
      return { ...base, color: colorHex("color.border.danger") }
    case "warning":
      return { ...base, color: "#D97706" }
    case "success":
      return { ...base, color: hx("savia", "700") }
  }
}

type CSSPropertiesLike = {
  fontFamily: string
  fontSize: string
  lineHeight: string
  fontWeight: number
  color: string
}

export function getCheckboxUiSurface(
  checked: boolean,
  state: FormControlStateId = "default",
): FormControlUiSurface {
  const base = getFormControlUiSurface(state)

  if (checked) {
    return {
      backgroundColor: state === "disabled" ? hx("savia", "400") : hx("savia", "600"),
      color: "#FFFFFF",
      border: `1px solid ${state === "error" ? colorHex("color.border.danger") : hx("savia", "600")}`,
      boxShadow: base.boxShadow,
      opacity: base.opacity,
    }
  }

  return {
    ...base,
    backgroundColor: workspace.surface,
  }
}

export function getSwitchUiSurface(
  on: boolean,
  state: FormControlStateId = "default",
): {
  trackColor: string
  thumbColor: string
  opacity?: number
  boxShadow?: string
} {
  const control = getFormControlUiSurface(state)

  return {
    trackColor: on ? hx("savia", "600") : hx("bruma", "200"),
    thumbColor: "#FFFFFF",
    opacity: control.opacity,
    boxShadow: control.boxShadow,
  }
}

export type AffixPrefixUiStyle = {
  backgroundColor: string
  color: string
  borderRight: string
  fontWeight: number
  fontSize: string
  lineHeight: string
  fontFamily: string
  opacity?: number
}

export function getAffixShellUiSurface(state: FormControlStateId = "default"): FormControlUiSurface {
  const base = getDefaultControlSurface()

  switch (state) {
    case "default":
      return base
    case "hover":
      return {
        ...base,
        border: `1px solid ${colorHex("bruma-300")}`,
      }
    case "focus":
      return {
        ...base,
        border: `1px solid ${colorHex("color.border.focused")}`,
        boxShadow: FOCUS_RING,
      }
    case "disabled":
      return { ...base, opacity: 0.5 }
    case "error":
      return {
        ...base,
        border: `1px solid ${colorHex("color.border.danger")}`,
        boxShadow: ERROR_RING,
      }
    case "readonly":
      return {
        ...base,
        backgroundColor: hx("bruma", "50"),
      }
  }
}

export function getAffixPrefixUiStyle(state: FormControlStateId = "default"): AffixPrefixUiStyle {
  const shell = getAffixShellUiSurface(state)
  const borderColor =
    state === "hover"
      ? colorHex("bruma-300")
      : state === "error"
        ? colorHex("color.border.danger")
        : state === "focus"
          ? colorHex("color.border.focused")
          : colorHex("bruma-200")

  return {
    fontFamily: "var(--rootsy-font-ui)",
    fontSize: ROOTSY_TEXT_STYLES.body.fontSize,
    lineHeight: ROOTSY_TEXT_STYLES.body.lineHeight,
    fontWeight: ROOTSY_FONT_WEIGHTS.semibold.value,
    backgroundColor: colorHex("elevation.surface.sunken"),
    color: colorHex("bruma-600"),
    borderRight: `1px solid ${borderColor}`,
    opacity: shell.opacity,
  }
}

export function getDateControlUiSurface(
  state: FormControlStateId = "default",
  withPrefix = false,
): FormControlUiSurface {
  return withPrefix ? getAffixShellUiSurface(state) : getFormControlUiSurface(state)
}

export type ImageUploadUiSurface = FormControlUiSurface & {
  borderStyle: "solid" | "dashed"
}

export function getImageUploadUiSurface(
  mode: FormImageUploadModeId,
  state: FormImageUploadDisplayStateId = "default",
): ImageUploadUiSurface {
  const base = getDefaultControlSurface()

  if (state === "drag") {
    return {
      backgroundColor: `color-mix(in srgb, ${hx("savia", "600")} 4%, #FFFFFF)`,
      color: colorHex("bruma-900"),
      border: `1px solid ${hx("savia", "600")}`,
      borderStyle: mode === "empty" ? "dashed" : "solid",
      boxShadow: `0 0 0 2px color-mix(in srgb, ${hx("savia", "600")} 20%, transparent)`,
    }
  }

  const borderStyle: "solid" | "dashed" = mode === "empty" ? "dashed" : "solid"

  switch (state) {
    case "default":
      return { ...base, borderStyle }
    case "hover":
      return {
        ...base,
        border: `1px solid ${colorHex("bruma-300")}`,
        backgroundColor: mode === "empty" ? hx("bruma", "50") : base.backgroundColor,
        borderStyle,
      }
    case "focus":
      return {
        ...base,
        border: `1px solid ${colorHex("color.border.focused")}`,
        boxShadow: FOCUS_RING,
        borderStyle,
      }
    case "disabled":
      return { ...base, opacity: 0.5, borderStyle }
    case "error":
      return {
        ...base,
        border: `1px solid ${colorHex("color.border.danger")}`,
        boxShadow: ERROR_RING,
        borderStyle,
      }
    case "readonly":
      return {
        ...base,
        backgroundColor: hx("bruma", "50"),
        borderStyle: "solid",
      }
  }
}

export function getImageUploadThumbUiStyle(
  mode: FormImageUploadModeId,
  state: FormImageUploadDisplayStateId = "default",
): {
  backgroundColor: string
  border: string
  borderStyle: "solid" | "dashed"
  opacity?: number
} {
  const shell = getImageUploadUiSurface(mode, state === "drag" ? "drag" : state)
  const borderColor =
    state === "error"
      ? colorHex("color.border.danger")
      : state === "focus" || state === "drag"
        ? hx("savia", "400")
        : hx("bruma", "200")

  return {
    backgroundColor:
      mode === "filled" ? hx("bruma", "100") : colorHex("elevation.surface.sunken"),
    border: `1px solid ${borderColor}`,
    borderStyle: mode === "empty" ? "dashed" : "solid",
    opacity: shell.opacity,
  }
}

export const FORM_UI_IMAGE_UPLOAD_TITLE_STYLE = {
  ...FORM_UI_CONTROL_TYPOGRAPHY,
  fontWeight: ROOTSY_FONT_WEIGHTS.medium.value,
  lineHeight: "1.25",
}

export const FORM_UI_IMAGE_UPLOAD_META_STYLE = {
  fontFamily: "var(--rootsy-font-ui)",
  fontSize: ROOTSY_TEXT_STYLES["body.small"].fontSize,
  lineHeight: ROOTSY_TEXT_STYLES["body.small"].lineHeight,
  fontWeight: ROOTSY_FONT_WEIGHTS.regular.value,
  color: colorHex("bruma-500"),
  marginTop: 2,
}

export const FORM_UI_DEMO_COPY = {
  text: {
    label: "Nombre del artículo",
    value: "Cola 500 ml",
    placeholder: "Nombre",
  },
  textarea: {
    label: "Descripción",
    value: "Descripción del artículo para el catálogo.",
    placeholder: "Opcional",
  },
  select: {
    label: "Categoría",
    value: "Bebidas",
    placeholder: "Seleccionar…",
  },
  checkbox: {
    label: "Disponible en mostrador",
  },
  switch: {
    label: "Activo en catálogo",
  },
  prefixMoney: {
    label: "Precio de venta",
    value: "1.250",
    prefix: "$",
  },
  prefixQuantity: {
    label: "Stock inicial",
    value: "24",
    prefix: "uds.",
  },
  date: {
    label: "Fecha de alta",
    value: "3 de agosto de 2026",
    placeholder: "Elegí una fecha",
  },
  datePrefix: {
    label: "Vencimiento",
    value: "3 de agosto de 2026",
    placeholder: "Elegí una fecha",
  },
  imageUpload: {
    label: "Imagen",
    emptyTitle: "Agregar foto",
    emptySubtitle: "Arrastrá o hacé clic · JPG, PNG o WebP",
    filledTitle: "foto-producto.jpg",
    filledMeta: "128 KB · JPG",
  },
  hint: "Texto de ayuda neutral debajo del control.",
  error: "Este campo es obligatorio.",
} as const

export const FORM_UI_ASSIST_VARIANTS = ROOTSY_FORM_ASSIST_VARIANTS

export type {
  FormAssistVariantId,
  FormControlStateId,
  FormControlTypeId,
  FormImageUploadModeId,
  FormImageUploadDisplayStateId,
} from "@/app/[siteId]/[popId]/library/form/rootsyFormSystem"

export function getFormControlSpec(type: "text"): (typeof ROOTSY_FORM_CONTROL_SPECS)["text"]
export function getFormControlSpec(type: "textarea"): (typeof ROOTSY_FORM_CONTROL_SPECS)["textarea"]
export function getFormControlSpec(type: "select"): (typeof ROOTSY_FORM_CONTROL_SPECS)["select"]
export function getFormControlSpec(type: "checkbox"): (typeof ROOTSY_FORM_CONTROL_SPECS)["checkbox"]
export function getFormControlSpec(type: "switch"): (typeof ROOTSY_FORM_CONTROL_SPECS)["switch"]
export function getFormControlSpec(
  type: "prefix-money" | "prefix-quantity" | "date-prefix",
): (typeof ROOTSY_FORM_CONTROL_SPECS)["affix"]
export function getFormControlSpec(type: "date"): (typeof ROOTSY_FORM_CONTROL_SPECS)["date"]
export function getFormControlSpec(
  type: "image-upload",
): (typeof ROOTSY_FORM_CONTROL_SPECS)["image-upload"]
export function getFormControlSpec(type: FormControlTypeId) {
  if (type === "prefix-money" || type === "prefix-quantity" || type === "date-prefix") {
    return ROOTSY_FORM_CONTROL_SPECS.affix
  }
  if (type === "date") {
    return ROOTSY_FORM_CONTROL_SPECS.date
  }
  if (type === "image-upload") {
    return ROOTSY_FORM_CONTROL_SPECS["image-upload"]
  }
  return ROOTSY_FORM_CONTROL_SPECS[type]
}

export { radiusPx as FORM_UI_CONTROL_RADIUS_PX }
