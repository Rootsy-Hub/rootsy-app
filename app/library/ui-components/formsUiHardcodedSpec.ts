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
import { rootsyColorHex, rootsySpacePx } from "@/lib/design-system"
import {
  getRootsFormAtmosphereRecipe,
  type RootsFormStyleOptions,
} from "@/app/library/ui-components/rootsFormAtmosphere"
import { ROOTSY_FONT_WEIGHTS, ROOTSY_TEXT_STYLES } from "@/lib/design-system/tokens/typography"

export type { RootsFormAtmosphere, RootsFormStyleOptions, RootsFormTone } from "@/app/library/ui-components/rootsFormAtmosphere"
export {
  getRootsFormAtmosphereRecipe,
  isRootsFormToneDark,
  resolveRootsFormAtmosphere,
} from "@/app/library/ui-components/rootsFormAtmosphere"

const hx = rootsyColorHex

function borderHex(token: string): string {
  return ROOTSY_BORDER_COLOR_TOKENS.find((item) => item.token === token)!.value
}

function elevationHex(token: string): string {
  return ROOTSY_ELEVATION_SURFACES_LIGHT.find((item) => item.token === token)!.value
}

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

/** Label — font.body medium · muted de la atmósfera · sin all-caps. */
export const FORM_UI_LABEL_STYLE = {
  fontFamily: "var(--rootsy-font-ui)",
  fontSize: ROOTSY_TEXT_STYLES.body.fontSize,
  lineHeight: ROOTSY_TEXT_STYLES.body.lineHeight,
  fontWeight: ROOTSY_FONT_WEIGHTS.medium.value,
  color: "var(--rootsy-bruma-700)",
}

export const FORM_UI_LABEL_STYLE_DARK = {
  ...FORM_UI_LABEL_STYLE,
  color: "var(--rootsy-sombra-300)",
}

export function getFormLabelUiStyle(options?: RootsFormStyleOptions) {
  const recipe = getRootsFormAtmosphereRecipe(options?.tone)
  return {
    ...FORM_UI_LABEL_STYLE,
    color: recipe.label,
  }
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
  color: "var(--rootsy-bruma-700)",
}

function getDefaultControlSurface(options?: RootsFormStyleOptions): FormControlUiSurface {
  const recipe = getRootsFormAtmosphereRecipe(options?.tone)
  return {
    backgroundColor: recipe.surface,
    color: recipe.text,
    border: `1px solid ${recipe.border}`,
    placeholderColor: recipe.textMuted,
  }
}

export function getFormControlUiSurface(
  state: FormControlStateId = "default",
  options?: RootsFormStyleOptions,
): FormControlUiSurface {
  const recipe = getRootsFormAtmosphereRecipe(options?.tone)
  const base = getDefaultControlSurface(options)

  switch (state) {
    case "default":
      return base
    case "hover":
      return {
        ...base,
        border: `1px solid ${recipe.borderHover}`,
      }
    case "focus":
      return {
        ...base,
        border: `1px solid ${recipe.focus}`,
        boxShadow: recipe.focusRing,
      }
    case "disabled":
      return { ...base, opacity: 0.5 }
    case "error":
      return {
        ...base,
        border: `1px solid ${recipe.error}`,
        boxShadow: recipe.errorRing,
      }
    case "readonly":
      return {
        ...base,
        backgroundColor: recipe.surfaceSunken,
        color: recipe.text,
      }
  }
}

export function getFormAssistUiStyle(
  variant: FormAssistVariantId,
  options?: RootsFormStyleOptions,
): CSSPropertiesLike {
  const recipe = getRootsFormAtmosphereRecipe(options?.tone)
  const base = {
    fontFamily: "var(--rootsy-font-ui)",
    fontSize: ROOTSY_TEXT_STYLES["body.small"].fontSize,
    lineHeight: ROOTSY_TEXT_STYLES["body.small"].lineHeight,
    fontWeight: ROOTSY_FONT_WEIGHTS.regular.value,
  }

  switch (variant) {
    case "hint":
      return { ...base, color: recipe.textMuted }
    case "error":
      return { ...base, color: recipe.errorText }
    case "warning":
      return { ...base, color: recipe.warningText }
    case "success":
      return { ...base, color: recipe.successText }
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
  const recipe = getRootsFormAtmosphereRecipe(options?.tone)
  const base = getFormControlUiSurface(state, options)

  if (checked) {
    return {
      backgroundColor: recipe.solidFill,
      color: recipe.solidInk,
      border: `1px solid ${state === "error" ? recipe.error : recipe.solidFill}`,
      boxShadow: base.boxShadow,
      opacity: base.opacity,
    }
  }

  return {
    ...base,
    backgroundColor: recipe.surface,
  }
}

export function getSwitchUiSurface(
  on: boolean,
  state: FormControlStateId = "default",
  options?: RootsFormStyleOptions,
): {
  trackColor: string
  thumbColor: string
  opacity?: number
  boxShadow?: string
} {
  const recipe = getRootsFormAtmosphereRecipe(options?.tone)
  const control = getFormControlUiSurface(state, options)

  return {
    trackColor: on ? recipe.solidFill : recipe.trackOff,
    thumbColor: on ? recipe.solidInk : recipe.thumbOff,
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
  const recipe = getRootsFormAtmosphereRecipe(options?.tone)
  const shell = getCompositeShellUiSurface(state, options)

  return {
    ...FORM_UI_LEADING_SLOT_TYPOGRAPHY,
    color: recipe.icon,
    backgroundColor: "transparent",
    borderRight: "none",
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
  const recipe = getRootsFormAtmosphereRecipe(options?.tone)
  const shell = getCompositeShellUiSurface(state, options)

  if (state === "readonly") {
    return {
      backgroundColor: recipe.surfaceSunken,
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
  borderColor: string,
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
  options?: RootsFormStyleOptions,
): ImageUploadUiSurface {
  const recipe = getRootsFormAtmosphereRecipe(options?.tone)
  const base = getDefaultControlSurface(options)
  const borderStyle: "solid" | "dashed" = mode === "empty" ? "dashed" : "solid"

  if (state === "drag") {
    return {
      backgroundColor: `color-mix(in srgb, ${recipe.focus} 8%, ${recipe.surface})`,
      color: recipe.text,
      ...imageUploadBorder(recipe.focus, borderStyle),
      boxShadow: recipe.focusRing,
    }
  }

  switch (state) {
    case "default":
      return imageUploadSurfaceFromBase(base, borderStyle, recipe.border)
    case "hover":
      return {
        ...imageUploadSurfaceFromBase(base, borderStyle, recipe.borderHover),
        backgroundColor: mode === "empty" ? recipe.surfaceSunken : base.backgroundColor,
      }
    case "focus":
      return {
        ...imageUploadSurfaceFromBase(base, borderStyle, recipe.focus),
        boxShadow: recipe.focusRing,
      }
    case "disabled":
      return { ...imageUploadSurfaceFromBase(base, borderStyle, recipe.border), opacity: 0.5 }
    case "error":
      return {
        ...imageUploadSurfaceFromBase(base, borderStyle, recipe.error),
        boxShadow: recipe.errorRing,
      }
    case "readonly":
      return {
        ...imageUploadSurfaceFromBase(base, "solid", recipe.border),
        backgroundColor: recipe.surfaceSunken,
      }
  }
}

export function getImageUploadThumbUiStyle(
  mode: FormImageUploadModeId,
  state: FormImageUploadDisplayStateId = "default",
  options?: RootsFormStyleOptions,
): {
  backgroundColor: string
  borderWidth: string
  borderStyle: "solid" | "dashed"
  borderColor: string
  borderRadiusPx: number
  opacity?: number
} {
  const recipe = getRootsFormAtmosphereRecipe(options?.tone)
  const shell = getImageUploadUiSurface(mode, state === "drag" ? "drag" : state, options)
  const borderColor =
    state === "error"
      ? recipe.error
      : state === "focus" || state === "drag"
        ? recipe.focus
        : recipe.border

  return {
    backgroundColor: mode === "filled" ? recipe.surfaceSunken : recipe.surfaceSunken,
    ...imageUploadBorder(borderColor, mode === "empty" ? "dashed" : "solid"),
    borderRadiusPx: ROOTSY_FORM_CONTROL_SPECS["image-upload"].thumbRadiusPx,
    opacity: shell.opacity,
  }
}

export function getImageUploadActionUiStyle(
  state: FormControlStateId = "default",
  options?: RootsFormStyleOptions,
): {
  sizePx: number
  color: string
  hoverBackground: string
  opacity?: number
} {
  const recipe = getRootsFormAtmosphereRecipe(options?.tone)
  const shell = getFormControlUiSurface(state, options)

  return {
    sizePx: ROOTSY_FORM_CONTROL_SPECS["image-upload"].actionHitPx,
    color: recipe.icon,
    hoverBackground: recipe.surfaceSunken,
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
  color: "var(--rootsy-bruma-700)",
}

export function getFormImageUploadCopyStyle(options?: RootsFormStyleOptions) {
  const recipe = getRootsFormAtmosphereRecipe(options?.tone)
  return {
    title: {
      ...FORM_UI_IMAGE_UPLOAD_TITLE_STYLE,
      color: recipe.text,
    },
    meta: {
      ...FORM_UI_IMAGE_UPLOAD_META_STYLE,
      color: recipe.textMuted,
    },
    icon: recipe.icon,
  }
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
  const recipe = getRootsFormAtmosphereRecipe(options?.tone)
  const spec = getFormControlSpec("text")
  const shell = getFormControlUiSurface(state, options)

  return {
    spec,
    shell,
    iconColor: recipe.icon,
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
