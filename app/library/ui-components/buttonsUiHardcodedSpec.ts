/**
 * Specs hardcodeadas Botones UI — 100% fundamentos actuales.
 *
 * Fuentes autorizadas:
 * - rootsyButtonSystem (appearances, icon-button theme/emphasis)
 * - lib/design-system (colors, themes, spacing, typography)
 * - rootsyRadiusSystem · rootsyElevationSystem
 */

import {
  ROOTSY_BUTTON_APPEARANCES,
  ROOTSY_BUTTON_COLOR_TOKENS,
  ROOTSY_BUTTON_SIZES,
  ROOTSY_ICON_BUTTON_ROW_INTENTS,
  ROOTSY_ICON_BUTTON_SIZES,
  ROOTSY_ICON_BUTTON_VARIANTS,
  type IconButtonEmphasisId,
  type IconButtonRowIntentId,
  type IconButtonSizeId,
  type IconButtonThemeId,
} from "@/app/library/button/rootsyButtonSystem"
import { ROOTSY_ELEVATION_SURFACES_DARK } from "@/app/library/elevation/rootsyElevationSystem"
import { ROOTSY_RADIUS_TOKENS } from "@/app/library/radius/rootsyRadiusSystem"
import {
  ROOTSY_COLOR_SEMANTIC,
  getRootsyTheme,
  rootsyColorHex,
  rootsySpacePx,
} from "@/lib/design-system"
import { ROOTSY_FONT_WEIGHTS, ROOTSY_TEXT_STYLES } from "@/lib/design-system/tokens/typography"
import {
  isRootsButtonAtmosphereDark,
  resolveRootsButtonAtmosphere,
  type RootsButtonAtmosphere,
} from "@/components/rootsy-button/rootsButtonAtmosphere"

const hx = rootsyColorHex
const pos = getRootsyTheme("pos")

const WHITE = ROOTSY_COLOR_SEMANTIC.white
const TEXT_ON_DARK = ROOTSY_COLOR_SEMANTIC.textOnDark

function elevationSurfaceDark(token: string): string {
  return ROOTSY_ELEVATION_SURFACES_DARK.find((item) => item.token === token)!.value
}

function radiusPx(tokenId: "medium" | "large" | "full"): number {
  return Number.parseInt(ROOTSY_RADIUS_TOKENS.find((item) => item.id === tokenId)!.value, 10)
}

function colorTokenHex(appearance: string, label: string): string {
  const group = ROOTSY_BUTTON_COLOR_TOKENS.find((item) => item.appearance === appearance)
  const token = group?.tokens.find((item) => item.label === label)
  if (!token || token.hex === "—") {
    throw new Error(`Missing color token: ${appearance}.${label}`)
  }
  return token.hex
}

function iconButtonSize(id: IconButtonSizeId) {
  return ROOTSY_ICON_BUTTON_SIZES.find((item) => item.id === id)!
}

function iconButtonVariant(theme: IconButtonThemeId, emphasis: IconButtonEmphasisId) {
  return ROOTSY_ICON_BUTTON_VARIANTS.find(
    (item) => item.theme === theme && item.emphasis === emphasis,
  )!
}

// ─── Text buttons ────────────────────────────────────────────────────────────

export type ButtonsUiAppearanceId =
  | "primary"
  | "default"
  | "subtle"
  | "danger"
  | "danger-subtle"
  | "link"
export type ButtonsUiSizeId = "compact" | "default" | "large"
export type ButtonsUiShapeId = "default" | "pill"

export const BUTTONS_UI_APPEARANCE_LABELS: Record<ButtonsUiAppearanceId, string> = {
  primary: "Guardar",
  default: "Exportar",
  subtle: "Cancelar",
  danger: "Eliminar",
  "danger-subtle": "Eliminar de la compra",
  link: "Ver detalle",
}

export const BUTTONS_UI_APPEARANCE_META = ROOTSY_BUTTON_APPEARANCES.map((item) => ({
  id: item.appearance as ButtonsUiAppearanceId,
  title: item.appearance,
  natureName: item.natureName,
  token: item.rootsyVariant,
}))

export const BUTTONS_UI_SIZE_SPECS: Record<
  ButtonsUiSizeId,
  {
    id: ButtonsUiSizeId
    token: string
    heightPx: number
    paddingXPx: number
    fontSize: string
    lineHeight: string
    radiusPx: number
    fontWeight: number
  }
> = {
  compact: {
    id: "compact",
    token: ROOTSY_BUTTON_SIZES.find((s) => s.id === "compact")!.token,
    heightPx: rootsySpacePx("400"),
    paddingXPx: rootsySpacePx("150"),
    fontSize: ROOTSY_TEXT_STYLES.body.fontSize,
    lineHeight: ROOTSY_TEXT_STYLES.body.lineHeight,
    radiusPx: radiusPx("medium"),
    fontWeight: ROOTSY_FONT_WEIGHTS.semibold.value,
  },
  default: {
    id: "default",
    token: ROOTSY_BUTTON_SIZES.find((s) => s.id === "default")!.token,
    heightPx: rootsySpacePx("500"),
    paddingXPx: rootsySpacePx("200"),
    fontSize: ROOTSY_TEXT_STYLES.body.fontSize,
    lineHeight: ROOTSY_TEXT_STYLES.body.lineHeight,
    radiusPx: radiusPx("large"),
    fontWeight: ROOTSY_FONT_WEIGHTS.semibold.value,
  },
  large: {
    id: "large",
    token: ROOTSY_BUTTON_SIZES.find((s) => s.id === "large")!.token,
    heightPx: rootsySpacePx("600"),
    paddingXPx: rootsySpacePx("300"),
    fontSize: ROOTSY_TEXT_STYLES["body.large"].fontSize,
    lineHeight: ROOTSY_TEXT_STYLES["body.large"].lineHeight,
    radiusPx: radiusPx("large"),
    fontWeight: ROOTSY_FONT_WEIGHTS.semibold.value,
  },
}

export const BUTTONS_UI_PILL_RADIUS_PX = radiusPx("full")

export function getButtonsUiRadiusPx(
  sizeId: ButtonsUiSizeId,
  shape: ButtonsUiShapeId = "default",
): number {
  if (shape === "pill") return BUTTONS_UI_PILL_RADIUS_PX
  return (BUTTONS_UI_SIZE_SPECS[sizeId] ?? BUTTONS_UI_SIZE_SPECS.compact).radiusPx
}

export type HardcodedButtonSurface = {
  backgroundColor: string
  color: string
  border: string
  boxShadow?: string
  fontWeight: number
  textDecoration?: string
  opacity?: number
  loadingLabel?: string
}

export type ButtonsUiInteractionState =
  | "default"
  | "hover"
  | "active"
  | "focus"
  | "disabled"
  | "loading"

export const BUTTONS_UI_INTERACTION_STATES: readonly {
  id: ButtonsUiInteractionState
  label: string
}[] = [
  { id: "default", label: "default" },
  { id: "hover", label: "hover" },
  { id: "active", label: "active" },
  { id: "focus", label: "focus" },
  { id: "disabled", label: "disabled" },
  { id: "loading", label: "loading" },
] as const

const FOCUS_RING_SAVIA = `0 0 0 2px ${WHITE}, 0 0 0 4px color-mix(in srgb, ${hx("savia", "600")} 45%, transparent)`
const FOCUS_RING_DANGER = `0 0 0 2px ${WHITE}, 0 0 0 4px color-mix(in srgb, ${colorTokenHex("danger", "Fondo")} 45%, transparent)`
const FOCUS_RING_NEUTRAL = `0 0 0 2px color-mix(in srgb, ${hx("savia", "600")} 25%, transparent)`
const FOCUS_RING_DARK = `0 0 0 2px color-mix(in srgb, ${TEXT_ON_DARK} 14%, ${hx("savia", "400")} 6%)`
const FOCUS_RING_ETER = `0 0 0 2px color-mix(in srgb, ${hx("eter", "100")} 22%, transparent)`

/** Subtle sobre Sombra — rampa del dosel. No usa 500 ni savia en hover. */
function getSombraSubtleAppearanceSurface(
  state: ButtonsUiInteractionState,
): HardcodedButtonSurface {
  const base: HardcodedButtonSurface = {
    backgroundColor: "transparent",
    color: hx("sombra", "300"),
    border: "1px solid transparent",
    fontWeight: ROOTSY_FONT_WEIGHTS.medium.value,
  }

  switch (state) {
    case "default":
      return base
    case "hover":
      return {
        ...base,
        backgroundColor: hx("sombra", "950"),
        color: hx("sombra", "50"),
      }
    case "active":
      return {
        ...base,
        backgroundColor: hx("sombra", "900"),
        color: hx("sombra", "50"),
      }
    case "focus":
      return { ...base, boxShadow: FOCUS_RING_DARK }
    case "disabled":
      return { ...base, opacity: 0.5 }
    case "loading":
      return { ...base, loadingLabel: "Cancelando…", opacity: 0.92 }
  }
}

/** Subtle sobre éter — rampa neutra. No usa elevación de sombra. */
function getEterSubtleAppearanceSurface(
  state: ButtonsUiInteractionState,
): HardcodedButtonSurface {
  const base: HardcodedButtonSurface = {
    backgroundColor: "transparent",
    color: hx("eter", "300"),
    border: "1px solid transparent",
    fontWeight: ROOTSY_FONT_WEIGHTS.medium.value,
  }

  switch (state) {
    case "default":
      return base
    case "hover":
      return {
        ...base,
        backgroundColor: hx("eter", "800"),
        color: hx("eter", "50"),
      }
    case "active":
      return {
        ...base,
        backgroundColor: hx("eter", "700"),
        color: hx("eter", "50"),
      }
    case "focus":
      return { ...base, boxShadow: FOCUS_RING_ETER }
    case "disabled":
      return { ...base, opacity: 0.5 }
    case "loading":
      return { ...base, loadingLabel: "Cancelando…", opacity: 0.92 }
  }
}

function mergeShadow(base: string | undefined, ring: string): string {
  return base ? `${base}, ${ring}` : ring
}

function getButtonsUiDefaultSurface(appearance: ButtonsUiAppearanceId): HardcodedButtonSurface {
  switch (appearance) {
    case "primary":
      return {
        backgroundColor: colorTokenHex("primary", "Fondo"),
        color: colorTokenHex("primary", "Texto"),
        border: "1px solid transparent",
        fontWeight: ROOTSY_FONT_WEIGHTS.semibold.value,
      }
    case "default":
      return {
        backgroundColor: colorTokenHex("default", "Fondo"),
        color: colorTokenHex("default", "Texto"),
        border: `1px solid ${colorTokenHex("default", "Borde")}`,
        fontWeight: ROOTSY_FONT_WEIGHTS.semibold.value,
      }
    case "subtle":
      return {
        backgroundColor: "transparent",
        color: colorTokenHex("subtle", "Texto"),
        border: "1px solid transparent",
        fontWeight: ROOTSY_FONT_WEIGHTS.medium.value,
      }
    case "danger":
      return {
        backgroundColor: colorTokenHex("danger", "Fondo"),
        color: colorTokenHex("danger", "Texto"),
        border: "1px solid transparent",
        fontWeight: ROOTSY_FONT_WEIGHTS.semibold.value,
      }
    case "danger-subtle":
      return {
        backgroundColor: "transparent",
        color: hx("lava", "700"),
        border: "1px solid transparent",
        fontWeight: ROOTSY_FONT_WEIGHTS.medium.value,
      }
    case "link":
      return {
        backgroundColor: "transparent",
        color: colorTokenHex("link", "Default"),
        border: "1px solid transparent",
        fontWeight: ROOTSY_FONT_WEIGHTS.medium.value,
        textDecoration: "underline",
      }
  }
}

export const BUTTONS_UI_POS_TEXT_APPEARANCES = [
  "default",
  "subtle",
  "link",
  "danger-subtle",
] as const satisfies readonly ButtonsUiAppearanceId[]

function darkInkMuted(atmosphere: Exclude<RootsButtonAtmosphere, "bruma">) {
  return atmosphere === "eter" ? hx("eter", "300") : hx("sombra", "300")
}

/** Contorno, link y subtle sobre Sombra o Éter — ink vivo. El primario no cambia. */
function getButtonsUiDarkTextBase(
  appearance: (typeof BUTTONS_UI_POS_TEXT_APPEARANCES)[number],
  atmosphere: Exclude<RootsButtonAtmosphere, "bruma">,
): HardcodedButtonSurface {
  switch (appearance) {
    case "default":
      return {
        backgroundColor: "transparent",
        color: hx("savia", "500"),
        border: `1px solid ${hx("savia", "500")}`,
        fontWeight: ROOTSY_FONT_WEIGHTS.semibold.value,
      }
    case "subtle":
      return {
        backgroundColor: "transparent",
        color: darkInkMuted(atmosphere),
        border: "1px solid transparent",
        fontWeight: ROOTSY_FONT_WEIGHTS.medium.value,
      }
    case "link":
      return {
        backgroundColor: "transparent",
        color: hx("savia", "500"),
        border: "1px solid transparent",
        fontWeight: ROOTSY_FONT_WEIGHTS.medium.value,
        textDecoration: "underline",
      }
    case "danger-subtle":
      return {
        backgroundColor: "transparent",
        color: hx("lava", "500"),
        border: "1px solid transparent",
        fontWeight: ROOTSY_FONT_WEIGHTS.medium.value,
      }
  }
}

export function getButtonsUiAppearanceSurface(
  appearance: ButtonsUiAppearanceId,
  state: ButtonsUiInteractionState = "default",
  theme: IconButtonThemeId = "workspace",
  atmosphere?: RootsButtonAtmosphere,
): HardcodedButtonSurface {
  const resolvedAtmosphere = resolveRootsButtonAtmosphere({ atmosphere, theme })
  if (appearance === "subtle" && resolvedAtmosphere === "sombra") {
    return getSombraSubtleAppearanceSurface(state)
  }
  if (appearance === "subtle" && resolvedAtmosphere === "eter") {
    return getEterSubtleAppearanceSurface(state)
  }
  const darkInk =
    isRootsButtonAtmosphereDark(resolvedAtmosphere) &&
    (BUTTONS_UI_POS_TEXT_APPEARANCES as readonly string[]).includes(appearance)
  const base = darkInk
    ? getButtonsUiDarkTextBase(
        appearance as (typeof BUTTONS_UI_POS_TEXT_APPEARANCES)[number],
        resolvedAtmosphere as Exclude<RootsButtonAtmosphere, "bruma">,
      )
    : getButtonsUiDefaultSurface(appearance)

  switch (state) {
    case "default":
      return base
    case "hover":
      switch (appearance) {
        case "primary":
          return {
            ...base,
            backgroundColor: isRootsButtonAtmosphereDark(resolvedAtmosphere)
              ? colorTokenHex("primary", "Hover oscuro")
              : colorTokenHex("primary", "Hover"),
          }
        case "default":
          return {
            ...base,
            backgroundColor: darkInk
              ? `color-mix(in srgb, ${hx("savia", "500")} 16%, transparent)`
              : colorTokenHex("default", "Hover"),
          }
        case "subtle":
          return {
            ...base,
            backgroundColor: darkInk
              ? elevationSurfaceDark("elevation.surface.raised")
              : colorTokenHex("subtle", "Hover"),
          }
        case "danger":
          return { ...base, backgroundColor: colorTokenHex("danger", "Hover") }
        case "danger-subtle":
          return {
            ...base,
            backgroundColor: darkInk
              ? `color-mix(in srgb, ${hx("lava", "500")} 16%, transparent)`
              : hx("lava", "50"),
            color: darkInk ? hx("lava", "500") : hx("lava", "700"),
          }
        case "link":
          return {
            ...base,
            color: darkInk ? hx("savia", "300") : colorTokenHex("link", "Hover"),
            textDecoration: "underline",
          }
      }
    case "active":
      switch (appearance) {
        case "primary":
          return { ...base, backgroundColor: colorTokenHex("primary", "Active") }
        case "default":
          return {
            ...base,
            backgroundColor: darkInk
              ? `color-mix(in srgb, ${hx("savia", "500")} 22%, transparent)`
              : hx("savia", "100"),
          }
        case "subtle":
          return {
            ...base,
            backgroundColor: darkInk
              ? elevationSurfaceDark("elevation.surface.sunken")
              : hx("bruma", "100"),
          }
        case "danger":
          return { ...base, backgroundColor: colorTokenHex("danger", "Active") }
        case "danger-subtle":
          return {
            ...base,
            backgroundColor: darkInk
              ? `color-mix(in srgb, ${hx("lava", "500")} 22%, transparent)`
              : hx("lava", "100"),
            color: darkInk ? hx("lava", "400") : hx("lava", "800"),
          }
        case "link":
          return {
            ...base,
            color: darkInk ? hx("savia", "500") : colorTokenHex("link", "Active"),
            textDecoration: "underline",
          }
      }
    case "focus":
      switch (appearance) {
        case "primary":
          return { ...base, boxShadow: mergeShadow(base.boxShadow, FOCUS_RING_SAVIA) }
        case "default":
        case "subtle":
          return { ...base, boxShadow: darkInk ? FOCUS_RING_DARK : FOCUS_RING_NEUTRAL }
        case "danger":
          return { ...base, boxShadow: mergeShadow(base.boxShadow, FOCUS_RING_DANGER) }
        case "danger-subtle":
          return { ...base, boxShadow: FOCUS_RING_DANGER }
        case "link":
          return { ...base, boxShadow: darkInk ? FOCUS_RING_DARK : FOCUS_RING_NEUTRAL }
      }
    case "disabled":
      return { ...base, opacity: 0.5 }
    case "loading": {
      const loadingLabel = (() => {
        switch (appearance) {
          case "primary":
            return "Guardando…"
          case "default":
            return "Creando…"
          case "subtle":
            return "Cancelando…"
          case "danger":
            return "Eliminando…"
          case "danger-subtle":
            return "Eliminando…"
          case "link":
            return "Cargando…"
        }
      })()
      return { ...base, loadingLabel, opacity: 0.92 }
    }
  }
}

export const BUTTONS_WITH_ICON_SPECS = {
  gapPx: rootsySpacePx("100"),
  iconPx: 16,
  iconToken: "icon.size.medium",
  iconBefore: [
    { appearance: "primary" as const, label: "Guardar cambios", icon: "save" as const },
    { appearance: "default" as const, label: "Nuevo artículo", icon: "plus" as const },
    { appearance: "danger" as const, label: "Eliminar", icon: "trash" as const },
  ],
  iconAfter: [
    { appearance: "primary" as const, label: "Continuar", icon: "arrowRight" as const },
    { appearance: "link" as const, label: "Ver detalle", icon: "arrowRight" as const },
    { appearance: "danger" as const, label: "Eliminar definitivamente", icon: "trash" as const },
  ],
} as const

export const BUTTONS_WITH_ICON_FONT_WEIGHT = ROOTSY_FONT_WEIGHTS.semibold.value

// ─── Icon buttons · theme + emphasis ─────────────────────────────────────────

export type { IconButtonSizeId, IconButtonThemeId, IconButtonEmphasisId, IconButtonRowIntentId }

export const ICON_BUTTON_UI_RADIUS_PX = radiusPx("medium")
export const ICON_BUTTON_UI_RADIUS_TOKEN =
  ROOTSY_RADIUS_TOKENS.find((item) => item.id === "medium")!.token

export const ICON_BUTTON_UI_WORKSPACE_VARIANTS = ROOTSY_ICON_BUTTON_VARIANTS.filter(
  (item) => item.theme === "workspace",
).map((item) => ({
  ...item,
  icon: (item.emphasis === "outlined"
    ? "plus"
    : item.emphasis === "filled"
      ? "home"
      : "arrowLeft") as "plus" | "home" | "arrowLeft",
}))

export const ICON_BUTTON_UI_POS_VARIANTS = ROOTSY_ICON_BUTTON_VARIANTS.filter(
  (item) => item.theme === "pos",
).map((item) => ({
  ...item,
  icon: (item.emphasis === "primary"
    ? "plus"
    : item.emphasis === "outlined"
      ? "arrowLeft"
      : item.emphasis === "filled"
        ? "home"
        : "bell") as "plus" | "arrowLeft" | "home" | "bell",
}))

export const ICON_BUTTON_UI_ROW_INTENTS = ROOTSY_ICON_BUTTON_ROW_INTENTS.map((item) => ({
  ...item,
  icon: (item.id === "neutral" ? "eye" : item.id === "edit" ? "pencil" : "trash") as
    | "eye"
    | "pencil"
    | "trash",
}))

export const ICON_BUTTON_UI_POS_PANEL = {
  background: `linear-gradient(180deg, ${pos.shell} 0%, ${elevationSurfaceDark("elevation.surface")} 100%)`,
  border: `1px solid ${pos.border}`,
} as const

export type IconButtonUiSurface = {
  backgroundColor: string
  iconColor: string
  border: string
  boxShadow?: string
  borderRadiusPx: number
  opacity?: number
}

export type IconButtonUiInteractionState = ButtonsUiInteractionState

export const ICON_BUTTON_UI_INTERACTION_STATES = BUTTONS_UI_INTERACTION_STATES

function mapIconButtonEmphasisToAppearance(
  emphasis: IconButtonEmphasisId,
): ButtonsUiAppearanceId {
  switch (emphasis) {
    case "primary":
      return "primary"
    case "ghost":
      return "subtle"
    case "outlined":
    case "filled":
      return "default"
  }
}

export function getIconButtonSemanticSurface(
  appearance: ButtonsUiAppearanceId,
  state: IconButtonUiInteractionState = "default",
  theme: IconButtonThemeId = "workspace",
  atmosphere?: RootsButtonAtmosphere,
  sizeId: IconButtonSizeId = "default",
  shape: ButtonsUiShapeId = "default",
): IconButtonUiSurface {
  const text = getButtonsUiAppearanceSurface(appearance, state, theme, atmosphere)
  return {
    backgroundColor: text.backgroundColor,
    iconColor: text.color,
    border: text.border,
    boxShadow: text.boxShadow,
    borderRadiusPx: getButtonsUiRadiusPx(sizeId, shape),
    opacity: text.opacity,
  }
}

export function getIconButtonUiSurface(
  theme: IconButtonThemeId,
  emphasis: IconButtonEmphasisId,
  state: IconButtonUiInteractionState = "default",
  extras?: {
    atmosphere?: RootsButtonAtmosphere
    sizeId?: IconButtonSizeId
    shape?: ButtonsUiShapeId
  },
): IconButtonUiSurface {
  return getIconButtonSemanticSurface(
    mapIconButtonEmphasisToAppearance(emphasis),
    state,
    theme,
    extras?.atmosphere,
    extras?.sizeId ?? "default",
    extras?.shape ?? "default",
  )
}

export function getIconButtonUiRowSurface(
  intent: IconButtonRowIntentId,
  state: IconButtonUiInteractionState = "default",
  extras?: {
    atmosphere?: RootsButtonAtmosphere
    theme?: IconButtonThemeId
    sizeId?: IconButtonSizeId
    shape?: ButtonsUiShapeId
  },
): IconButtonUiSurface {
  const theme = extras?.theme ?? "workspace"
  const atmosphere = extras?.atmosphere
  const sizeId = extras?.sizeId ?? "compact"
  const shape = extras?.shape ?? "default"

  if (intent === "destructive") {
    return getIconButtonSemanticSurface(
      "danger-subtle",
      state,
      theme,
      atmosphere,
      sizeId,
      shape,
    )
  }

  if (intent === "neutral") {
    return getIconButtonSemanticSurface(
      "subtle",
      state,
      theme,
      atmosphere,
      sizeId,
      shape,
    )
  }

  const base = getIconButtonSemanticSurface(
    "subtle",
    "default",
    theme,
    atmosphere,
    sizeId,
    shape,
  )
  const dark = isRootsButtonAtmosphereDark(
    resolveRootsButtonAtmosphere({ atmosphere, theme }),
  )

  switch (state) {
    case "default":
      return base
    case "hover":
      return {
        ...base,
        backgroundColor: dark
          ? `color-mix(in srgb, ${hx("savia", "500")} 16%, transparent)`
          : hx("savia", "50"),
        iconColor: dark ? hx("savia", "500") : hx("savia", "700"),
      }
    case "active":
      return {
        ...base,
        backgroundColor: dark
          ? `color-mix(in srgb, ${hx("savia", "500")} 22%, transparent)`
          : hx("savia", "100"),
        iconColor: dark ? hx("savia", "400") : hx("savia", "800"),
      }
    case "focus":
      return getIconButtonSemanticSurface(
        "subtle",
        "focus",
        theme,
        atmosphere,
        sizeId,
        shape,
      )
    case "disabled":
      return { ...base, opacity: 0.5 }
    case "loading":
      return { ...base, opacity: 0.92 }
  }
}

export { iconButtonSize, iconButtonVariant }
