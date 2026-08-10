/**
 * Runtime de specs Dropdown UI — misma resolución que dropdownUiHardcodedSpec.
 */

import {
  getDropdownCheckUiStyle,
  getDropdownItemInteractiveLayoutStyle,
  getDropdownItemShellUiStyle,
  getDropdownLabelUiStyle,
  getDropdownPanelShellUiStyle,
  getDropdownSeparatorUiStyle,
  type DropdownDensityId,
  type DropdownItemStateId,
  type DropdownThemeId,
} from "@/app/library/ui-components/dropdownUiHardcodedSpec"
import { ROOTSY_DROPDOWN_ANATOMY } from "@/app/library/dropdown/rootsyDropdownSystem"
import type { CSSProperties } from "react"

export type {
  DropdownDensityId,
  DropdownItemStateId,
  DropdownThemeId,
  DropdownTriggerId,
} from "@/app/library/ui-components/dropdownUiHardcodedSpec"

export {
  getDropdownItemShellUiStyle,
  getDropdownPanelShellUiStyle,
} from "@/app/library/ui-components/dropdownUiHardcodedSpec"

export { ROOTSY_DROPDOWN_ANATOMY }

export function getDropdownContentStyle(
  theme: DropdownThemeId = "light",
  density: DropdownDensityId = "default",
): CSSProperties {
  return getDropdownPanelShellUiStyle(theme, density)
}

export function getDropdownItemLayoutStyle(
  _theme: DropdownThemeId = "light",
  density: DropdownDensityId = "default",
  _options?: {
    state?: DropdownItemStateId
    selected?: boolean
    destructive?: boolean
    highlighted?: boolean
    disabled?: boolean
  },
): CSSProperties {
  return getDropdownItemInteractiveLayoutStyle(density)
}

/** Estilo completo incl. colores — previews estáticas (galería / spec panel). */
export function getDropdownItemStyle(
  theme: DropdownThemeId = "light",
  density: DropdownDensityId = "default",
  options?: {
    state?: DropdownItemStateId
    selected?: boolean
    destructive?: boolean
    highlighted?: boolean
  },
): CSSProperties {
  const state = resolveDropdownItemState(options)
  return getDropdownItemShellUiStyle(theme, state, density)
}

export function getDropdownLabelStyle(theme: DropdownThemeId = "light"): CSSProperties {
  return getDropdownLabelUiStyle(theme)
}

export function getDropdownSeparatorStyle(theme: DropdownThemeId = "light"): CSSProperties {
  return getDropdownSeparatorUiStyle(theme)
}

export function getDropdownCheckStyle(theme: DropdownThemeId = "light"): CSSProperties {
  return getDropdownCheckUiStyle(theme)
}

export function resolveDropdownItemState(options?: {
  state?: DropdownItemStateId
  selected?: boolean
  destructive?: boolean
  highlighted?: boolean
  disabled?: boolean
}): DropdownItemStateId {
  if (options?.state) return options.state
  if (options?.disabled) return "disabled"
  if (options?.destructive && options?.highlighted) return "destructive-hover"
  if (options?.destructive) return "destructive"
  if (options?.selected) return "selected"
  if (options?.highlighted) return "hover"
  return "default"
}

export const ROOTSY_DROPDOWN_CONTENT_SIDE_OFFSET = ROOTSY_DROPDOWN_ANATOMY.anchorGapPx
