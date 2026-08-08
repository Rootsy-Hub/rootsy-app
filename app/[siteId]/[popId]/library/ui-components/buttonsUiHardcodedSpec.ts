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
} from "@/app/[siteId]/[popId]/library/button/rootsyButtonSystem"
import {
  ROOTSY_ELEVATION_SHADOW_TOKENS,
  ROOTSY_ELEVATION_SURFACES_DARK,
  ROOTSY_ELEVATION_SURFACES_LIGHT,
} from "@/app/[siteId]/[popId]/library/elevation/rootsyElevationSystem"
import { ROOTSY_RADIUS_TOKENS } from "@/app/[siteId]/[popId]/library/radius/rootsyRadiusSystem"
import {
  ROOTSY_COLOR_SEMANTIC,
  getRootsyTheme,
  rootsyColorHex,
  rootsySpacePx,
} from "@/lib/design-system"
import { ROOTSY_FONT_WEIGHTS, ROOTSY_TEXT_STYLES } from "@/lib/design-system/tokens/typography"

const hx = rootsyColorHex
const workspace = getRootsyTheme("workspace")
const pos = getRootsyTheme("pos")

const WHITE = ROOTSY_COLOR_SEMANTIC.white
const TEXT_ON_DARK = ROOTSY_COLOR_SEMANTIC.textOnDark

function elevationSurfaceLight(token: string): string {
  return ROOTSY_ELEVATION_SURFACES_LIGHT.find((item) => item.token === token)!.value
}

function elevationSurfaceDark(token: string): string {
  return ROOTSY_ELEVATION_SURFACES_DARK.find((item) => item.token === token)!.value
}

function radiusPx(tokenId: "medium" | "large"): number {
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

export type ButtonsUiAppearanceId = "primary" | "default" | "subtle" | "danger" | "link"
export type ButtonsUiSizeId = "compact" | "default" | "large"

export const BUTTONS_UI_APPEARANCE_LABELS: Record<ButtonsUiAppearanceId, string> = {
  primary: "Guardar",
  default: "Exportar",
  subtle: "Cancelar",
  danger: "Eliminar",
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

function mergeShadow(base: string | undefined, ring: string): string {
  return base ? `${base}, ${ring}` : ring
}

function getButtonsUiDefaultSurface(appearance: ButtonsUiAppearanceId): HardcodedButtonSurface {
  const raisedShadow = ROOTSY_ELEVATION_SHADOW_TOKENS.find(
    (item) => item.token === "elevation.shadow.raised",
  )!.value

  switch (appearance) {
    case "primary":
      return {
        backgroundColor: colorTokenHex("primary", "Fondo"),
        color: colorTokenHex("primary", "Texto"),
        border: "1px solid transparent",
        boxShadow: raisedShadow,
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
        color: WHITE,
        border: "1px solid transparent",
        boxShadow: raisedShadow,
        fontWeight: ROOTSY_FONT_WEIGHTS.semibold.value,
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

export function getButtonsUiAppearanceSurface(
  appearance: ButtonsUiAppearanceId,
  state: ButtonsUiInteractionState = "default",
): HardcodedButtonSurface {
  const base = getButtonsUiDefaultSurface(appearance)

  switch (state) {
    case "default":
      return base
    case "hover":
      switch (appearance) {
        case "primary":
          return { ...base, backgroundColor: colorTokenHex("primary", "Hover") }
        case "default":
        case "subtle":
          return { ...base, backgroundColor: colorTokenHex("default", "Hover") }
        case "danger":
          return { ...base, backgroundColor: colorTokenHex("danger", "Hover") }
        case "link":
          return {
            ...base,
            color: colorTokenHex("link", "Hover"),
            textDecoration: "underline",
          }
      }
    case "active":
      switch (appearance) {
        case "primary":
          return { ...base, backgroundColor: colorTokenHex("primary", "Active") }
        case "default":
        case "subtle":
          return {
            ...base,
            backgroundColor: hx("bruma", "100"),
            border: `1px solid ${colorTokenHex("default", "Borde")}`,
          }
        case "danger":
          return { ...base, backgroundColor: colorTokenHex("danger", "Active") }
        case "link":
          return {
            ...base,
            color: colorTokenHex("link", "Active"),
            textDecoration: "underline",
          }
      }
    case "focus":
      switch (appearance) {
        case "primary":
          return { ...base, boxShadow: mergeShadow(base.boxShadow, FOCUS_RING_SAVIA) }
        case "default":
        case "subtle":
          return { ...base, boxShadow: FOCUS_RING_NEUTRAL }
        case "danger":
          return { ...base, boxShadow: mergeShadow(base.boxShadow, FOCUS_RING_DANGER) }
        case "link":
          return { ...base, boxShadow: FOCUS_RING_NEUTRAL }
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

function getIconButtonDefaultSurface(
  theme: IconButtonThemeId,
  emphasis: IconButtonEmphasisId,
): IconButtonUiSurface {
  const borderRadiusPx = ICON_BUTTON_UI_RADIUS_PX

  if (theme === "workspace") {
    switch (emphasis) {
      case "outlined":
        return {
          backgroundColor: workspace.surface,
          iconColor: workspace.textSecondary,
          border: `1px solid ${workspace.border}`,
          borderRadiusPx,
        }
      case "filled":
        return {
          backgroundColor: elevationSurfaceLight("elevation.surface.sunken"),
          iconColor: workspace.textPrimary,
          border: `1px solid ${workspace.border}`,
          borderRadiusPx,
        }
      case "ghost":
        return {
          backgroundColor: "transparent",
          iconColor: colorTokenHex("subtle", "Texto"),
          border: "1px solid transparent",
          borderRadiusPx,
        }
      case "primary":
        throw new Error("icon-button emphasis primary is POS-only")
    }
  }

  switch (emphasis) {
    case "primary":
      return {
        backgroundColor: hx("savia", "600"),
        iconColor: WHITE,
        border: `1px solid ${hx("savia", "700")}`,
        borderRadiusPx,
      }
    case "outlined":
      return {
        backgroundColor: elevationSurfaceDark("elevation.surface"),
        iconColor: pos.textSecondary,
        border: `1px solid ${pos.border}`,
        boxShadow: `inset 0 1px 0 color-mix(in srgb, ${TEXT_ON_DARK} 8%, transparent)`,
        borderRadiusPx,
      }
    case "filled":
      return {
        backgroundColor: elevationSurfaceDark("elevation.surface.raised"),
        iconColor: pos.textSecondary,
        border: `1px solid ${pos.border}`,
        boxShadow: `inset 0 1px 0 color-mix(in srgb, ${TEXT_ON_DARK} 8%, transparent)`,
        borderRadiusPx,
      }
    case "ghost":
      return {
        backgroundColor: "transparent",
        iconColor: hx("sombra", "400"),
        border: "1px solid transparent",
        borderRadiusPx,
      }
  }
}

export function getIconButtonUiSurface(
  theme: IconButtonThemeId,
  emphasis: IconButtonEmphasisId,
  state: IconButtonUiInteractionState = "default",
): IconButtonUiSurface {
  const base = getIconButtonDefaultSurface(theme, emphasis)

  switch (state) {
    case "default":
      return base
    case "hover":
      if (emphasis === "primary") {
        return {
          ...base,
          backgroundColor: hx("savia", "500"),
          iconColor: WHITE,
          border: `1px solid color-mix(in srgb, ${WHITE} 14%, ${hx("savia", "500")})`,
        }
      }
      if (theme === "workspace") {
        if (emphasis === "ghost") {
          return {
            ...base,
            backgroundColor: colorTokenHex("default", "Hover"),
            iconColor: workspace.textPrimary,
          }
        }
        return {
          ...base,
          backgroundColor: colorTokenHex("default", "Hover"),
          iconColor: workspace.textPrimary,
        }
      }
      if (emphasis === "ghost") {
        return {
          ...base,
          backgroundColor: `color-mix(in srgb, ${elevationSurfaceDark("elevation.surface.sunken")} 48%, transparent)`,
          iconColor: TEXT_ON_DARK,
        }
      }
      return {
        ...base,
        backgroundColor: elevationSurfaceDark("elevation.surface.raised"),
        iconColor: TEXT_ON_DARK,
        border: `1px solid color-mix(in srgb, ${TEXT_ON_DARK} 12%, ${pos.border} 88%)`,
      }
    case "active":
      if (emphasis === "primary") {
        return {
          ...base,
          backgroundColor: hx("savia", "700"),
          iconColor: WHITE,
          border: `1px solid ${hx("savia", "800")}`,
        }
      }
      if (theme === "workspace") {
        return {
          ...base,
          backgroundColor: hx("bruma", "100"),
          iconColor: workspace.textPrimary,
          border:
            emphasis === "ghost"
              ? "1px solid transparent"
              : `1px solid ${colorTokenHex("default", "Borde")}`,
        }
      }
      if (emphasis === "ghost") {
        return {
          ...base,
          backgroundColor: `color-mix(in srgb, ${pos.shell} 65%, transparent)`,
          iconColor: WHITE,
        }
      }
      return {
        ...base,
        backgroundColor: elevationSurfaceDark("elevation.surface.sunken"),
        iconColor: WHITE,
        border: `1px solid ${pos.border}`,
      }
    case "focus":
      return {
        ...base,
        boxShadow: mergeShadow(
          base.boxShadow,
          emphasis === "primary"
            ? FOCUS_RING_SAVIA
            : theme === "workspace"
              ? FOCUS_RING_NEUTRAL
              : FOCUS_RING_DARK,
        ),
      }
    case "disabled":
      return { ...base, opacity: 0.5 }
    case "loading":
      return { ...base, opacity: 0.92 }
  }
}

function getIconButtonRowDefaultSurface(intent: IconButtonRowIntentId): IconButtonUiSurface {
  const iconColor = (() => {
    switch (intent) {
      case "neutral":
        return workspace.textSecondary
      case "edit":
        return hx("savia", "600")
      case "destructive":
        return colorTokenHex("danger", "Fondo")
    }
  })()

  return {
    backgroundColor: "transparent",
    iconColor,
    border: "1px solid transparent",
    borderRadiusPx: ICON_BUTTON_UI_RADIUS_PX,
  }
}

export function getIconButtonUiRowSurface(
  intent: IconButtonRowIntentId,
  state: IconButtonUiInteractionState = "default",
): IconButtonUiSurface {
  const base = getIconButtonRowDefaultSurface(intent)

  switch (state) {
    case "default":
      return base
    case "hover":
      switch (intent) {
        case "neutral":
          return {
            ...base,
            backgroundColor: colorTokenHex("default", "Hover"),
            iconColor: workspace.textPrimary,
          }
        case "edit":
          return {
            ...base,
            backgroundColor: hx("savia", "50"),
            iconColor: hx("savia", "700"),
          }
        case "destructive":
          return {
            ...base,
            backgroundColor: `color-mix(in srgb, ${colorTokenHex("danger", "Fondo")} 10%, transparent)`,
            iconColor: colorTokenHex("danger", "Fondo"),
          }
      }
    case "active":
      switch (intent) {
        case "neutral":
          return {
            ...base,
            backgroundColor: hx("bruma", "100"),
            iconColor: workspace.textPrimary,
          }
        case "edit":
          return {
            ...base,
            backgroundColor: hx("savia", "100"),
            iconColor: hx("savia", "800"),
          }
        case "destructive":
          return {
            ...base,
            backgroundColor: `color-mix(in srgb, ${colorTokenHex("danger", "Fondo")} 15%, transparent)`,
            iconColor: colorTokenHex("danger", "Active"),
          }
      }
    case "focus":
      return { ...base, boxShadow: FOCUS_RING_NEUTRAL }
    case "disabled":
      return { ...base, opacity: 0.5 }
    case "loading":
      return { ...base, opacity: 0.92 }
  }
}

export { iconButtonSize, iconButtonVariant }
