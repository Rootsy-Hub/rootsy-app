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
  ROOTSY_FORM_COMPOSITE_SHELLS,
  ROOTSY_FORM_TOOLBAR_CONTEXT,
  ROOTSY_FORM_TOOLBAR_VARIANTS,
  type FormToolbarControlShellId,
  type FormAssistVariantId,
  type FormControlStateId,
  type FormControlTypeId,
  type FormImageUploadDisplayStateId,
  type FormImageUploadModeId,
  type FormToolbarContextVariantId,
} from "@/app/library/form/rootsyFormSystem"
import { ROOTSY_BORDER_COLOR_TOKENS } from "@/app/library/border/rootsyBorderSystem"
import { ROOTSY_RADIUS_TOKENS } from "@/app/library/radius/rootsyRadiusSystem"
import { ROOTSY_ELEVATION_SURFACES_LIGHT } from "@/app/library/elevation/rootsyElevationSystem"
import { ROOTSY_SEMANTIC_TOKENS } from "@/app/library/color/rootsyColorSystem"
import { getRootsyTheme, rootsyColorHex, rootsySpacePx } from "@/lib/design-system"
import { LAYOUTS_OPERAR_FORM_DARK } from "@/app/library/layouts/layoutsOperarFormTokens"
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

export type RootsFormTone = "light" | "dark"

export type RootsFormStyleOptions = {
  tone?: RootsFormTone
}

const FORM_DARK_BORDER = LAYOUTS_OPERAR_FORM_DARK.border
const FORM_DARK_BORDER_HOVER = LAYOUTS_OPERAR_FORM_DARK.borderHover
const FORM_DARK_BORDER_FOCUS = LAYOUTS_OPERAR_FORM_DARK.borderFocus
const FORM_DARK_FOCUS_RING = LAYOUTS_OPERAR_FORM_DARK.focusRing

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

export const FORM_UI_LABEL_STYLE_DARK = {
  ...FORM_UI_LABEL_STYLE,
  color: LAYOUTS_OPERAR_FORM_DARK.label,
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
  color: hx("bruma", "500"),
}

function getDefaultControlSurface(): FormControlUiSurface {
  return {
    backgroundColor: elevationHex("elevation.surface.overlay"),
    color: hx("bruma", "900"),
    border: `1px solid ${borderHex("color.border")}`,
    placeholderColor: hx("bruma", "500"),
  }
}

function getDarkDefaultControlSurface(): FormControlUiSurface {
  return {
    backgroundColor: LAYOUTS_OPERAR_FORM_DARK.surface,
    color: LAYOUTS_OPERAR_FORM_DARK.text,
    border: `1px solid ${FORM_DARK_BORDER}`,
    placeholderColor: LAYOUTS_OPERAR_FORM_DARK.textMuted,
  }
}

export function getFormControlUiSurface(
  state: FormControlStateId = "default",
  options?: RootsFormStyleOptions,
): FormControlUiSurface {
  const tone = options?.tone ?? "light"
  const base =
    tone === "dark" ? getDarkDefaultControlSurface() : getDefaultControlSurface()

  switch (state) {
    case "default":
      return base
    case "hover":
      return {
        ...base,
        border:
          tone === "dark"
            ? `1px solid ${FORM_DARK_BORDER_HOVER}`
            : `1px solid ${hx("bruma", "300")}`,
      }
    case "focus":
      return {
        ...base,
        border:
          tone === "dark"
            ? `1px solid ${FORM_DARK_BORDER_FOCUS}`
            : `1px solid ${borderHex("color.border.focused")}`,
        boxShadow: tone === "dark" ? FORM_DARK_FOCUS_RING : FOCUS_RING,
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
        backgroundColor:
          tone === "dark"
            ? LAYOUTS_OPERAR_FORM_DARK.surfaceSunken
            : elevationHex("elevation.surface.sunken"),
        color: tone === "dark" ? LAYOUTS_OPERAR_FORM_DARK.text : workspace.textPrimary,
      }
  }
}

export function getFormAssistUiStyle(
  variant: FormAssistVariantId,
  options?: RootsFormStyleOptions,
): CSSPropertiesLike {
  const tone = options?.tone ?? "light"
  const base = {
    fontFamily: "var(--rootsy-font-ui)",
    fontSize: ROOTSY_TEXT_STYLES["body.small"].fontSize,
    lineHeight: ROOTSY_TEXT_STYLES["body.small"].lineHeight,
    fontWeight: ROOTSY_FONT_WEIGHTS.regular.value,
  }

  switch (variant) {
    case "hint":
      return {
        ...base,
        color:
          tone === "dark" ? LAYOUTS_OPERAR_FORM_DARK.textMuted : hx("bruma", "500"),
      }
    case "error":
      return {
        ...base,
        color:
          tone === "dark"
            ? `color-mix(in srgb, ${semanticHex("status-danger")} 72%, white)`
            : semanticHex("status-danger"),
      }
    case "warning":
      return { ...base, color: semanticTextHex("status-warning") }
    case "success":
      return {
        ...base,
        color:
          tone === "dark"
            ? "color-mix(in srgb, var(--rootsy-savia-300) 88%, white)"
            : semanticTextHex("status-success"),
      }
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
  options?: RootsFormStyleOptions,
): FormControlUiSurface {
  const tone = options?.tone ?? "light"
  const base = getFormControlUiSurface(state, options)

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
    backgroundColor:
      tone === "dark"
        ? LAYOUTS_OPERAR_FORM_DARK.surface
        : elevationHex("elevation.surface.overlay"),
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

export function getCompositeShellUiSurface(
  state: FormControlStateId = "default",
  options?: RootsFormStyleOptions,
): FormControlUiSurface {
  return getFormControlUiSurface(state, options)
}

export function getLeadingSlotUiStyle(
  state: FormControlStateId = "default",
  options?: RootsFormStyleOptions,
): LeadingSlotUiStyle {
  const tone = options?.tone ?? "light"
  const shell = getCompositeShellUiSurface(state, options)
  const dividerColor =
    tone === "dark"
      ? state === "hover"
        ? FORM_DARK_BORDER_HOVER
        : state === "error"
          ? semanticHex("status-danger")
          : state === "focus"
            ? FORM_DARK_BORDER_FOCUS
            : FORM_DARK_BORDER
      : state === "hover"
        ? hx("bruma", "300")
        : state === "error"
          ? semanticHex("status-danger")
          : state === "focus"
            ? borderHex("color.border.focused")
            : borderHex("color.border")

  return {
    ...FORM_UI_LEADING_SLOT_TYPOGRAPHY,
    color: tone === "dark" ? LAYOUTS_OPERAR_FORM_DARK.icon : FORM_UI_LEADING_SLOT_TYPOGRAPHY.color,
    backgroundColor:
      tone === "dark"
        ? LAYOUTS_OPERAR_FORM_DARK.surfaceSunken
        : elevationHex("elevation.surface.sunken"),
    borderRight: `1px solid ${dividerColor}`,
    opacity: shell.opacity,
  }
}

export function getCompositeValueUiStyle(
  state: FormControlStateId = "default",
  options?: RootsFormStyleOptions,
): {
  backgroundColor: string
  opacity?: number
} {
  const tone = options?.tone ?? "light"
  const shell = getCompositeShellUiSurface(state, options)

  if (state === "readonly") {
    return {
      backgroundColor:
        tone === "dark"
          ? LAYOUTS_OPERAR_FORM_DARK.surfaceSunken
          : elevationHex("elevation.surface.sunken"),
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
  options?: RootsFormStyleOptions,
): FormControlUiSurface {
  return withLeading
    ? getCompositeShellUiSurface(state, options)
    : getFormControlUiSurface(state, options)
}

export type ImageUploadUiSurface = Omit<FormControlUiSurface, "border"> & {
  borderWidth: string
  borderStyle: "solid" | "dashed"
  borderColor: string
}

function imageUploadBorder(
  color: string,
  style: "solid" | "dashed",
): Pick<ImageUploadUiSurface, "borderWidth" | "borderStyle" | "borderColor"> {
  return {
    borderWidth: "1px",
    borderStyle: style,
    borderColor: color,
  }
}

function imageUploadSurfaceFromBase(
  base: FormControlUiSurface,
  style: "solid" | "dashed",
  borderColor = borderHex("color.border"),
): ImageUploadUiSurface {
  const { border: _border, ...rest } = base
  return {
    ...rest,
    ...imageUploadBorder(borderColor, style),
  }
}

export function getImageUploadUiSurface(
  mode: FormImageUploadModeId,
  state: FormImageUploadDisplayStateId = "default",
): ImageUploadUiSurface {
  const base = getDefaultControlSurface()
  const borderStyle: "solid" | "dashed" = mode === "empty" ? "dashed" : "solid"

  if (state === "drag") {
    return {
      backgroundColor: `color-mix(in srgb, ${borderHex("color.border.selected")} 4%, ${elevationHex("elevation.surface.overlay")})`,
      color: hx("bruma", "900"),
      ...imageUploadBorder(borderHex("color.border.selected"), borderStyle),
      boxShadow: `0 0 0 2px color-mix(in srgb, ${borderHex("color.border.selected")} 20%, transparent)`,
    }
  }

  switch (state) {
    case "default":
      return imageUploadSurfaceFromBase(base, borderStyle)
    case "hover":
      return {
        ...imageUploadSurfaceFromBase(base, borderStyle, hx("bruma", "300")),
        backgroundColor:
          mode === "empty" ? elevationHex("elevation.surface.sunken") : base.backgroundColor,
      }
    case "focus":
      return {
        ...imageUploadSurfaceFromBase(base, borderStyle, borderHex("color.border.focused")),
        boxShadow: FOCUS_RING,
      }
    case "disabled":
      return { ...imageUploadSurfaceFromBase(base, borderStyle), opacity: 0.5 }
    case "error":
      return {
        ...imageUploadSurfaceFromBase(base, borderStyle, semanticHex("status-danger")),
        boxShadow: ERROR_RING,
      }
    case "readonly":
      return {
        ...imageUploadSurfaceFromBase(base, "solid"),
        backgroundColor: elevationHex("elevation.surface.sunken"),
      }
  }
}

export function getImageUploadThumbUiStyle(
  mode: FormImageUploadModeId,
  state: FormImageUploadDisplayStateId = "default",
): {
  backgroundColor: string
  borderWidth: string
  borderStyle: "solid" | "dashed"
  borderColor: string
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
    ...imageUploadBorder(borderColor, mode === "empty" ? "dashed" : "solid"),
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
  discount: {
    label: "Descuento",
    hint: "Tipo y valor en el mismo control.",
  },
  segmentDelivery: {
    label: "Tipo de entrega",
  },
  segmentItemKind: {
    label: "Tipo de artículo",
    hint: "Define cómo se descuenta stock al vender.",
  },
  phone: {
    label: "Teléfono",
    value: "3704 708043",
  },
  hint: "Texto de ayuda neutral debajo del control.",
  error: "Este campo es obligatorio.",
  toolbar: {
    period: { label: "Período", placeholder: "Este mes" },
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
  FormToolbarControlShellId,
  FormToolbarFieldRoleId,
} from "@/app/library/form/rootsyFormSystem"

export {
  ROOTSY_FORM_COMPOSITE_SHELLS,
  ROOTSY_FORM_TOOLBAR_CONTEXT,
  ROOTSY_FORM_TOOLBAR_FIELDS,
  ROOTSY_FORM_TOOLBAR_VARIANTS,
} from "@/app/library/form/rootsyFormSystem"

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
    width: "100%",
  }
}

export function getFormUiToolbarTableHeadPreviewStyle() {
  return {
    display: "grid" as const,
    gridTemplateColumns: "2fr 1fr 1fr 1fr",
    height: rootsySpacePx("500"),
    alignItems: "center" as const,
    paddingLeft: rootsySpacePx("150"),
    paddingRight: rootsySpacePx("150"),
    backgroundColor: elevationHex("elevation.surface.sunken"),
    borderBottom: `1px solid ${borderHex("color.border")}`,
    fontFamily: "var(--rootsy-font-ui)",
    fontSize: ROOTSY_TEXT_STYLES["body.small"].fontSize,
    lineHeight: ROOTSY_TEXT_STYLES["body.small"].lineHeight,
    fontWeight: ROOTSY_FONT_WEIGHTS.medium.value,
    color: hx("bruma", "500"),
  }
}

export function getFormUiToolbarContextShellStyle(flush = true) {
  if (flush) {
    return {
      backgroundColor: elevationHex("elevation.surface.overlay"),
      width: "100%",
      height: "100%",
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
    height: "100%",
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

export function getFormUiInlineIconShellStyle(
  state: FormControlStateId = "default",
  options?: RootsFormStyleOptions,
) {
  const tone = options?.tone ?? "light"
  const spec = getFormControlSpec("text")
  const shell = getFormControlUiSurface(state, options)

  return {
    spec,
    shell,
    iconColor: tone === "dark" ? LAYOUTS_OPERAR_FORM_DARK.icon : hx("bruma", "500"),
    gapPx: rootsySpacePx("100"),
    paddingXPx: spec.paddingXPx,
    typography: FORM_UI_CONTROL_TYPOGRAPHY,
  }
}

export function getFormUiToolbarVariantOptions(variant: FormToolbarContextVariantId) {
  const spec = ROOTSY_FORM_TOOLBAR_VARIANTS.find((item) => item.id === variant)!
  return {
    hideLabels: !spec.showLabels,
    flush: spec.flush,
    controlShell: spec.controlShell,
  }
}

export function getFormUiToolbarVariantOptionsWithShell(
  variant: FormToolbarContextVariantId,
  controlShell?: FormToolbarControlShellId,
) {
  const options = getFormUiToolbarVariantOptions(variant)
  return {
    ...options,
    controlShell: controlShell ?? options.controlShell,
  }
}
