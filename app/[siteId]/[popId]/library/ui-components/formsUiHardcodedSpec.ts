/**
 * Specs hardcodeadas Formulario UI — 100% fundamentos actuales.
 *
 * Fuentes autorizadas:
 * - rootsyFormSystem
 * - rootsyBorderSystem · rootsyElevationSystem · rootsyRadiusSystem · rootsySpacingScale
 * - rootsyColorSystem (semánticos funcionales)
 * - lib/design-system (themes, spacing, typography)
 */

import {
  ROOTSY_FORM_ASSIST_VARIANTS,
  ROOTSY_FORM_CONTROL_SPECS,
  ROOTSY_FORM_CONTROL_STATES,
  ROOTSY_FORM_CONTROL_TYPES,
  ROOTSY_FORM_FIELD_STACK,
  ROOTSY_FORM_LABEL_SPEC,
  ROOTSY_FORM_TOOLBAR_CONTEXT,
  ROOTSY_FORM_TOOLBAR_VARIANTS,
  type FormAssistVariantId,
  type FormControlStateId,
  type FormControlTypeId,
  type FormImageUploadDisplayStateId,
  type FormImageUploadModeId,
  type FormToolbarContextVariantId,
} from "@/app/[siteId]/[popId]/library/form/rootsyFormSystem"
import { ROOTSY_BORDER_COLOR_TOKENS } from "@/app/[siteId]/[popId]/library/border/rootsyBorderSystem"
import { ROOTSY_RADIUS_TOKENS } from "@/app/[siteId]/[popId]/library/radius/rootsyRadiusSystem"
import { ROOTSY_ELEVATION_SURFACES_LIGHT } from "@/app/[siteId]/[popId]/library/elevation/rootsyElevationSystem"
import { ROOTSY_SEMANTIC_TOKENS } from "@/app/[siteId]/[popId]/library/color/rootsyColorSystem"
import { getRootsyTheme, rootsyColorHex, rootsySpacePx } from "@/lib/design-system"
import { ROOTSY_FONT_WEIGHTS, ROOTSY_TEXT_STYLES } from "@/lib/design-system/tokens/typography"

const hx = rootsyColorHex
const workspace = getRootsyTheme("workspace")

function borderHex(token: string): string {
  return ROOTSY_BORDER_COLOR_TOKENS.find((item) => item.token === token)!.value
}

function elevationHex(token: string): string {
  return ROOTSY_ELEVATION_SURFACES_LIGHT.find((item) => item.token === token)!.value
}

function semanticHex(id: string): string {
  return ROOTSY_SEMANTIC_TOKENS.find((item) => item.id === id)!.hex
}

function semanticTextHex(id: string): string {
  const row = ROOTSY_SEMANTIC_TOKENS.find((item) => item.id === id)!
  return "textHex" in row && row.textHex ? row.textHex : row.hex
}

const FOCUS_RING = `0 0 0 2px color-mix(in srgb, ${borderHex("color.border.focused")} 45%, transparent)`
const ERROR_RING = `0 0 0 2px color-mix(in srgb, ${semanticHex("status-danger")} 25%, transparent)`

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

/** Label — font.body medium · bruma-700 · sin all-caps (typography guidelines). */
export const FORM_UI_LABEL_STYLE = {
  fontFamily: "var(--rootsy-font-ui)",
  fontSize: ROOTSY_TEXT_STYLES.body.fontSize,
  lineHeight: ROOTSY_TEXT_STYLES.body.lineHeight,
  fontWeight: ROOTSY_FONT_WEIGHTS.medium.value,
  color: hx("bruma", "700"),
}

export const FORM_UI_CONTROL_TYPOGRAPHY = {
  fontFamily: "var(--rootsy-font-ui)",
  fontSize: ROOTSY_TEXT_STYLES.body.fontSize,
  lineHeight: ROOTSY_TEXT_STYLES.body.lineHeight,
  fontWeight: ROOTSY_FONT_WEIGHTS.regular.value,
}

export const FORM_UI_LEADING_SLOT_TYPOGRAPHY = {
  ...FORM_UI_CONTROL_TYPOGRAPHY,
  fontWeight: ROOTSY_FONT_WEIGHTS.medium.value,
  color: hx("bruma", "600"),
}

function getDefaultControlSurface(): FormControlUiSurface {
  return {
    backgroundColor: elevationHex("elevation.surface.overlay"),
    color: hx("bruma", "900"),
    border: `1px solid ${borderHex("color.border")}`,
    placeholderColor: hx("bruma", "500"),
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
        border: `1px solid ${hx("bruma", "300")}`,
      }
    case "focus":
      return {
        ...base,
        border: `1px solid ${borderHex("color.border.focused")}`,
        boxShadow: FOCUS_RING,
      }
    case "disabled":
      return { ...base, opacity: 0.5 }
    case "error":
      return {
        ...base,
        border: `1px solid ${semanticHex("status-danger")}`,
        boxShadow: ERROR_RING,
      }
    case "readonly":
      return {
        ...base,
        backgroundColor: elevationHex("elevation.surface.sunken"),
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
      return { ...base, color: hx("bruma", "500") }
    case "error":
      return { ...base, color: semanticHex("status-danger") }
    case "warning":
      return { ...base, color: semanticTextHex("status-warning") }
    case "success":
      return { ...base, color: semanticTextHex("status-success") }
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
      color: elevationHex("elevation.surface.overlay"),
      border: `1px solid ${state === "error" ? semanticHex("status-danger") : hx("savia", "600")}`,
      boxShadow: base.boxShadow,
      opacity: base.opacity,
    }
  }

  return {
    ...base,
    backgroundColor: elevationHex("elevation.surface.overlay"),
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
    thumbColor: elevationHex("elevation.surface.overlay"),
    opacity: control.opacity,
    boxShadow: control.boxShadow,
  }
}

export type LeadingSlotUiStyle = {
  backgroundColor: string
  color: string
  borderRight: string
  fontFamily: string
  fontSize: string
  lineHeight: string
  fontWeight: number
  opacity?: number
}

export function getCompositeShellUiSurface(state: FormControlStateId = "default"): FormControlUiSurface {
  return getFormControlUiSurface(state)
}

export function getLeadingSlotUiStyle(state: FormControlStateId = "default"): LeadingSlotUiStyle {
  const shell = getCompositeShellUiSurface(state)
  const dividerColor =
    state === "hover"
      ? hx("bruma", "300")
      : state === "error"
        ? semanticHex("status-danger")
        : state === "focus"
          ? borderHex("color.border.focused")
          : borderHex("color.border")

  return {
    ...FORM_UI_LEADING_SLOT_TYPOGRAPHY,
    backgroundColor: elevationHex("elevation.surface.sunken"),
    borderRight: `1px solid ${dividerColor}`,
    opacity: shell.opacity,
  }
}

export function getCompositeValueUiStyle(state: FormControlStateId = "default"): {
  backgroundColor: string
  opacity?: number
} {
  const shell = getCompositeShellUiSurface(state)

  if (state === "readonly") {
    return {
      backgroundColor: elevationHex("elevation.surface.sunken"),
      opacity: shell.opacity,
    }
  }

  return {
    backgroundColor: "transparent",
    opacity: shell.opacity,
  }
}

export function getDateControlUiSurface(
  state: FormControlStateId = "default",
  withLeading = false,
): FormControlUiSurface {
  return withLeading ? getCompositeShellUiSurface(state) : getFormControlUiSurface(state)
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
      backgroundColor: `color-mix(in srgb, ${borderHex("color.border.selected")} 4%, ${elevationHex("elevation.surface.overlay")})`,
      color: hx("bruma", "900"),
      border: `1px solid ${borderHex("color.border.selected")}`,
      borderStyle: mode === "empty" ? "dashed" : "solid",
      boxShadow: `0 0 0 2px color-mix(in srgb, ${borderHex("color.border.selected")} 20%, transparent)`,
    }
  }

  const borderStyle: "solid" | "dashed" = mode === "empty" ? "dashed" : "solid"

  switch (state) {
    case "default":
      return { ...base, borderStyle }
    case "hover":
      return {
        ...base,
        border: `1px solid ${hx("bruma", "300")}`,
        backgroundColor:
          mode === "empty" ? elevationHex("elevation.surface.sunken") : base.backgroundColor,
        borderStyle,
      }
    case "focus":
      return {
        ...base,
        border: `1px solid ${borderHex("color.border.focused")}`,
        boxShadow: FOCUS_RING,
        borderStyle,
      }
    case "disabled":
      return { ...base, opacity: 0.5, borderStyle }
    case "error":
      return {
        ...base,
        border: `1px solid ${semanticHex("status-danger")}`,
        boxShadow: ERROR_RING,
        borderStyle,
      }
    case "readonly":
      return {
        ...base,
        backgroundColor: elevationHex("elevation.surface.sunken"),
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
  borderRadiusPx: number
  opacity?: number
} {
  const shell = getImageUploadUiSurface(mode, state === "drag" ? "drag" : state)
  const borderColor =
    state === "error"
      ? semanticHex("status-danger")
      : state === "focus" || state === "drag"
        ? borderHex("color.border.focused")
        : borderHex("color.border")

  return {
    backgroundColor:
      mode === "filled" ? hx("bruma", "100") : elevationHex("elevation.surface.sunken"),
    border: `1px solid ${borderColor}`,
    borderStyle: mode === "empty" ? "dashed" : "solid",
    borderRadiusPx: ROOTSY_FORM_CONTROL_SPECS["image-upload"].thumbRadiusPx,
    opacity: shell.opacity,
  }
}

export function getImageUploadActionUiStyle(state: FormControlStateId = "default"): {
  sizePx: number
  color: string
  hoverBackground: string
  opacity?: number
} {
  const shell = getFormControlUiSurface(state)

  return {
    sizePx: ROOTSY_FORM_CONTROL_SPECS["image-upload"].actionHitPx,
    color: hx("bruma", "500"),
    hoverBackground: elevationHex("elevation.surface.sunken"),
    opacity: shell.opacity,
  }
}

export const FORM_UI_IMAGE_UPLOAD_TITLE_STYLE = {
  ...FORM_UI_CONTROL_TYPOGRAPHY,
  fontWeight: ROOTSY_FONT_WEIGHTS.medium.value,
  lineHeight: ROOTSY_TEXT_STYLES.body.lineHeight,
}

export const FORM_UI_IMAGE_UPLOAD_META_STYLE = {
  fontFamily: "var(--rootsy-font-ui)",
  fontSize: ROOTSY_TEXT_STYLES["body.small"].fontSize,
  lineHeight: ROOTSY_TEXT_STYLES["body.small"].lineHeight,
  fontWeight: ROOTSY_FONT_WEIGHTS.regular.value,
  color: hx("bruma", "500"),
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
  selectLeading: {
    label: "Medio de pago",
    value: "Efectivo",
    placeholder: "Elegir medio",
  },
  checkbox: {
    label: "Disponible en mostrador",
  },
  switch: {
    label: "Activo en catálogo",
  },
  leadingCurrency: {
    label: "Precio de venta",
    value: "1.250",
    leading: "$",
  },
  leadingUnit: {
    label: "Stock inicial",
    value: "24",
    leading: "uds.",
  },
  date: {
    label: "Fecha de alta",
    value: "3 de agosto de 2026",
    placeholder: "Elegí una fecha",
  },
  dateLeading: {
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
  toolbar: {
    period: { label: "Período", placeholder: "Todas las fechas" },
    filters: { label: "Filtros", placeholder: "Estado y tipo" },
    search: { label: "Buscar", placeholder: "Título o referencia…" },
  },
} as const

export const FORM_UI_ASSIST_VARIANTS = ROOTSY_FORM_ASSIST_VARIANTS

export const FORM_UI_LABEL_SPEC = ROOTSY_FORM_LABEL_SPEC

export type {
  FormAssistVariantId,
  FormControlStateId,
  FormControlTypeId,
  FormImageUploadModeId,
  FormImageUploadDisplayStateId,
  FormToolbarContextVariantId,
  FormToolbarFieldRoleId,
} from "@/app/[siteId]/[popId]/library/form/rootsyFormSystem"

export {
  ROOTSY_FORM_TOOLBAR_CONTEXT,
  ROOTSY_FORM_TOOLBAR_FIELDS,
  ROOTSY_FORM_TOOLBAR_VARIANTS,
} from "@/app/[siteId]/[popId]/library/form/rootsyFormSystem"

export function getFormControlSpec(type: "text"): (typeof ROOTSY_FORM_CONTROL_SPECS)["text"]
export function getFormControlSpec(type: "textarea"): (typeof ROOTSY_FORM_CONTROL_SPECS)["textarea"]
export function getFormControlSpec(type: "select"): (typeof ROOTSY_FORM_CONTROL_SPECS)["select"]
export function getFormControlSpec(type: "checkbox"): (typeof ROOTSY_FORM_CONTROL_SPECS)["checkbox"]
export function getFormControlSpec(type: "switch"): (typeof ROOTSY_FORM_CONTROL_SPECS)["switch"]
export function getFormControlSpec(
  type: "leading-currency" | "leading-unit" | "date-leading" | "select-leading",
): (typeof ROOTSY_FORM_CONTROL_SPECS)["leading"]
export function getFormControlSpec(type: "date"): (typeof ROOTSY_FORM_CONTROL_SPECS)["date"]
export function getFormControlSpec(
  type: "image-upload",
): (typeof ROOTSY_FORM_CONTROL_SPECS)["image-upload"]
export function getFormControlSpec(type: FormControlTypeId) {
  if (
    type === "leading-currency" ||
    type === "leading-unit" ||
    type === "date-leading" ||
    type === "select-leading"
  ) {
    return ROOTSY_FORM_CONTROL_SPECS.leading
  }
  if (type === "date") {
    return ROOTSY_FORM_CONTROL_SPECS.date
  }
  if (type === "image-upload") {
    return ROOTSY_FORM_CONTROL_SPECS["image-upload"]
  }
  return ROOTSY_FORM_CONTROL_SPECS[type]
}

/** @deprecated Usar getCompositeShellUiSurface */
export const getAffixShellUiSurface = getCompositeShellUiSurface

/** @deprecated Usar getLeadingSlotUiStyle */
export const getAffixPrefixUiStyle = getLeadingSlotUiStyle

function toolbarRadiusPx(): number {
  return Number.parseInt(
    ROOTSY_RADIUS_TOKENS.find((item) => item.id === "xlarge")!.value,
    10,
  )
}

/** Shell de layout.toolbar — mismo contexto que Layouts · Tablas. */
export function getFormUiToolbarEmbedShellStyle() {
  return {
    height: ROOTSY_FORM_TOOLBAR_CONTEXT.embedHeightPx,
    backgroundColor: elevationHex(ROOTSY_FORM_TOOLBAR_CONTEXT.embedBackgroundToken),
    borderBottom: `1px solid ${borderHex("color.border")}`,
    display: "flex" as const,
    alignItems: "center" as const,
    width: "100%",
  }
}

export function getFormUiToolbarContextShellStyle(flush = true) {
  if (flush) {
    return {
      backgroundColor: elevationHex("elevation.surface.overlay"),
      width: "100%",
    } as const
  }

  return {
    backgroundColor: elevationHex("elevation.surface.overlay"),
    border: `1px solid ${borderHex("color.border")}`,
    borderRadius: toolbarRadiusPx(),
    overflow: "hidden" as const,
    width: "100%",
  }
}

export function getFormUiToolbarContextGridStyle() {
  return {
    display: "grid" as const,
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    width: "100%",
  }
}

export function getFormUiToolbarContextCellStyle(isLast = false) {
  return {
    display: "flex" as const,
    alignItems: "center" as const,
    padding: `${rootsySpacePx("200")}px ${rootsySpacePx("200")}px`,
    borderRight: isLast ? undefined : `1px solid ${borderHex("color.border")}`,
    minWidth: 0,
  }
}

export function getFormUiToolbarVariantOptions(variant: FormToolbarContextVariantId) {
  const spec = ROOTSY_FORM_TOOLBAR_VARIANTS.find((item) => item.id === variant)!
  return {
    hideLabels: !spec.showLabels,
    flush: spec.flush,
  }
}
