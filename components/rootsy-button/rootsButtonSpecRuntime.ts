/**
 * Runtime de specs Botones UI — misma resolución que buttonsUiHardcodedSpec.
 */

import {
  BUTTONS_UI_SIZE_SPECS,
  BUTTONS_WITH_ICON_FONT_WEIGHT,
  BUTTONS_WITH_ICON_SPECS,
  getButtonsUiAppearanceSurface,
  getIconButtonUiRowSurface,
  getIconButtonUiSurface,
  iconButtonSize,
  type ButtonsUiAppearanceId,
  type ButtonsUiInteractionState,
  type ButtonsUiSizeId,
  type IconButtonEmphasisId,
  type IconButtonRowIntentId,
  type IconButtonSizeId,
  type IconButtonThemeId,
} from "@/app/[siteId]/[popId]/library/ui-components/buttonsUiHardcodedSpec"
import type { CSSProperties } from "react"
import type {
  RootsButtonSemanticVariant,
  RootsIconButtonActionIntent,
  RootsIconButtonSurface,
  RootsIconButtonTone,
} from "@/components/rootsy-button/rootsButtonStyles"

export type RootsButtonSpecSize = ButtonsUiSizeId

export type RootsButtonInteractionFlags = {
  disabled?: boolean
  loading?: boolean
  hovered?: boolean
  focusVisible?: boolean
  pressed?: boolean
}

/** Prioridad: disabled → loading → active → focus-visible → hover → default. */
export function resolveButtonInteractionState(
  flags: RootsButtonInteractionFlags,
): ButtonsUiInteractionState {
  if (flags.disabled) return "disabled"
  if (flags.loading) return "loading"
  if (flags.pressed) return "active"
  if (flags.focusVisible) return "focus"
  if (flags.hovered) return "hover"
  return "default"
}

export function resolveSemanticAppearance(
  semantic: RootsButtonSemanticVariant,
): ButtonsUiAppearanceId {
  switch (semantic) {
    case "primary":
      return "primary"
    case "secondary":
      return "default"
    case "tertiary":
      return "subtle"
    case "destructive":
      return "danger"
    case "link":
      return "link"
  }
}

export function getButtonAppearanceStyle(
  appearance: ButtonsUiAppearanceId,
  state: ButtonsUiInteractionState,
  sizeId: ButtonsUiSizeId = "default",
  options?: { withIcon?: boolean },
): CSSProperties {
  const size = BUTTONS_UI_SIZE_SPECS[sizeId] ?? BUTTONS_UI_SIZE_SPECS.compact
  const surface = getButtonsUiAppearanceSurface(appearance, state)

  return {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: options?.withIcon ? BUTTONS_WITH_ICON_SPECS.gapPx : undefined,
    height: size.heightPx,
    paddingLeft: size.paddingXPx,
    paddingRight: size.paddingXPx,
    borderRadius: size.radiusPx,
    fontFamily: "var(--rootsy-font-ui)",
    fontSize: size.fontSize,
    lineHeight: size.lineHeight,
    fontWeight:
      options?.withIcon && appearance !== "link"
        ? BUTTONS_WITH_ICON_FONT_WEIGHT
        : surface.fontWeight,
    backgroundColor: surface.backgroundColor,
    color: surface.color,
    border: surface.border,
    boxShadow: surface.boxShadow,
    textDecoration: surface.textDecoration,
    textUnderlineOffset: surface.textDecoration ? "4px" : undefined,
    opacity: surface.opacity,
    outline: "none",
    boxSizing: "border-box",
    whiteSpace: "nowrap",
    cursor: state === "disabled" ? "not-allowed" : "pointer",
    transition:
      "color 150ms, background-color 150ms, border-color 150ms, box-shadow 150ms, opacity 150ms",
  }
}

export function getIconButtonSpecStyle(
  options:
    | {
        theme: IconButtonThemeId
        emphasis: IconButtonEmphasisId
        sizeId?: IconButtonSizeId
        state?: ButtonsUiInteractionState
      }
    | {
        rowIntent: IconButtonRowIntentId
        sizeId?: IconButtonSizeId
        state?: ButtonsUiInteractionState
      },
): CSSProperties {
  const sizeId = options.sizeId ?? "default"
  const state = options.state ?? "default"
  const size = iconButtonSize(sizeId)
  const surface =
    "rowIntent" in options
      ? getIconButtonUiRowSurface(options.rowIntent, state)
      : getIconButtonUiSurface(options.theme, options.emphasis, state)

  return {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: size.hitAreaPx,
    height: size.hitAreaPx,
    borderRadius: surface.borderRadiusPx,
    backgroundColor: surface.backgroundColor,
    color: surface.iconColor,
    border: surface.border,
    boxShadow: surface.boxShadow,
    opacity: surface.opacity,
    outline: "none",
    boxSizing: "border-box",
    flexShrink: 0,
    cursor: state === "disabled" ? "not-allowed" : "pointer",
    transition:
      "color 150ms, background-color 150ms, border-color 150ms, box-shadow 150ms, opacity 150ms",
  }
}

export function resolveLegacyIconButtonSpec(options: {
  tone?: RootsIconButtonTone
  surface?: RootsIconButtonSurface
  intent?: RootsIconButtonActionIntent
}):
  | { kind: "theme"; theme: IconButtonThemeId; emphasis: IconButtonEmphasisId }
  | { kind: "row"; rowIntent: IconButtonRowIntentId } {
  const { tone = "light", surface = "light", intent = "edit" } = options

  if (tone === "action") {
    return { kind: "row", rowIntent: intent }
  }

  if (tone === "dark" || surface === "dark") {
    if (tone === "ghost") {
      return { kind: "theme", theme: "pos", emphasis: "ghost" }
    }
    if (tone === "secondary") {
      return { kind: "theme", theme: "pos", emphasis: "filled" }
    }
    return { kind: "theme", theme: "pos", emphasis: "outlined" }
  }

  if (tone === "ghost") {
    return { kind: "theme", theme: "workspace", emphasis: "ghost" }
  }
  if (tone === "secondary") {
    return { kind: "theme", theme: "workspace", emphasis: "outlined" }
  }
  return { kind: "theme", theme: "workspace", emphasis: "filled" }
}
