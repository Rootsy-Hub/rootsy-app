/**
 * Specs hardcodeadas Dropdown UI — 100% fundamentos actuales.
 */

import {
  ROOTSY_DROPDOWN_ANATOMY,
  ROOTSY_DROPDOWN_DENSITIES,
  ROOTSY_DROPDOWN_ITEM_STATES,
  ROOTSY_DROPDOWN_THEMES,
  ROOTSY_DROPDOWN_TRIGGERS,
  getDropdownCheckHex,
  getDropdownDensitySpec,
  getDropdownItemBackground,
  getDropdownItemLabelHex,
  getDropdownLabelHex,
  getDropdownPanelBackground,
  getDropdownPanelShadow,
  getDropdownSeparatorColor,
  type DropdownDensityId,
  type DropdownItemStateId,
  type DropdownThemeId,
  type DropdownTriggerId,
} from "@/app/[siteId]/[popId]/library/dropdown/rootsyDropdownSystem"
import { rootsyColorHex, rootsySpacePx } from "@/lib/design-system"
import { ROOTSY_FONT_WEIGHTS, ROOTSY_TEXT_STYLES } from "@/lib/design-system/tokens/typography"

const hx = rootsyColorHex

export type { DropdownDensityId, DropdownItemStateId, DropdownThemeId, DropdownTriggerId } from "@/app/[siteId]/[popId]/library/dropdown/rootsyDropdownSystem"

export const DROPDOWN_UI_THEMES = ROOTSY_DROPDOWN_THEMES
export const DROPDOWN_UI_DENSITIES = ROOTSY_DROPDOWN_DENSITIES
export const DROPDOWN_UI_TRIGGERS = ROOTSY_DROPDOWN_TRIGGERS
export const DROPDOWN_UI_ITEM_STATES = ROOTSY_DROPDOWN_ITEM_STATES
export const DROPDOWN_UI_ANATOMY = ROOTSY_DROPDOWN_ANATOMY

export const DROPDOWN_UI_DEMO_COPY = {
  sectionLabel: "Sección",
  groupLabel: "Acciones",
  items: {
    edit: "Editar artículo",
    duplicate: "Duplicar",
    export: "Exportar CSV",
    archive: "Archivar",
    delete: "Eliminar",
  },
  sections: ["Artículos", "Recetas", "Proveedores"],
  triggerLabels: {
    section: "Artículos",
    actions: "Más acciones",
  },
} as const

export type DropdownPanelUiSurface = {
  backgroundColor: string
  border: string
  boxShadow: string
  borderRadiusPx: number
  minWidthPx: number
  paddingTop: number
  paddingBottom: number
}

export type DropdownItemUiStyle = {
  backgroundColor: string
  color: string
  fontFamily: string
  fontSize: string
  lineHeight: string
  fontWeight: number
  minHeightPx: number
  paddingLeft: number
  paddingRight: number
  opacity?: number
  borderRadiusPx: number
}

export function getDropdownPanelUiSurface(
  theme: DropdownThemeId = "light",
  density: DropdownDensityId = "default",
): DropdownPanelUiSurface {
  const densitySpec = getDropdownDensitySpec(density)

  return {
    backgroundColor: getDropdownPanelBackground(theme),
    border: ROOTSY_DROPDOWN_ANATOMY.panelBorder,
    boxShadow: getDropdownPanelShadow(),
    borderRadiusPx: ROOTSY_DROPDOWN_ANATOMY.panelRadiusPx,
    minWidthPx: densitySpec.minWidthPx,
    paddingTop: ROOTSY_DROPDOWN_ANATOMY.panelPaddingYPx,
    paddingBottom: ROOTSY_DROPDOWN_ANATOMY.panelPaddingYPx,
  }
}

export function getDropdownLabelUiStyle(theme: DropdownThemeId = "light") {
  return {
    fontFamily: "var(--rootsy-font-ui)",
    fontSize: ROOTSY_TEXT_STYLES["body.small"].fontSize,
    lineHeight: ROOTSY_TEXT_STYLES["body.small"].lineHeight,
    fontWeight: ROOTSY_FONT_WEIGHTS.medium.value,
    color: getDropdownLabelHex(theme),
    paddingLeft: ROOTSY_DROPDOWN_ANATOMY.labelPaddingXPx,
    paddingRight: ROOTSY_DROPDOWN_ANATOMY.labelPaddingXPx,
    paddingTop: ROOTSY_DROPDOWN_ANATOMY.labelPaddingTopPx,
    paddingBottom: ROOTSY_DROPDOWN_ANATOMY.labelPaddingBottomPx,
  }
}

export function getDropdownItemUiStyle(
  theme: DropdownThemeId = "light",
  state: DropdownItemStateId = "default",
  density: DropdownDensityId = "default",
): DropdownItemUiStyle {
  const densitySpec = getDropdownDensitySpec(density)
  const isSelected = state === "selected"

  return {
    backgroundColor: getDropdownItemBackground(theme, state),
    color: getDropdownItemLabelHex(theme, state),
    fontFamily: "var(--rootsy-font-ui)",
    fontSize: ROOTSY_TEXT_STYLES.body.fontSize,
    lineHeight: ROOTSY_TEXT_STYLES.body.lineHeight,
    fontWeight: isSelected ? ROOTSY_FONT_WEIGHTS.medium.value : ROOTSY_FONT_WEIGHTS.regular.value,
    minHeightPx: densitySpec.itemHeightPx,
    paddingLeft: ROOTSY_DROPDOWN_ANATOMY.itemPaddingXPx,
    paddingRight: ROOTSY_DROPDOWN_ANATOMY.itemPaddingXPx,
    opacity: state === "disabled" ? 0.55 : undefined,
    borderRadiusPx: rootsySpacePx("050"),
  }
}

export function getDropdownSeparatorUiStyle(theme: DropdownThemeId = "light") {
  return {
    height: ROOTSY_DROPDOWN_ANATOMY.separatorHeightPx,
    backgroundColor: getDropdownSeparatorColor(theme),
    marginTop: ROOTSY_DROPDOWN_ANATOMY.separatorMarginYPx,
    marginBottom: ROOTSY_DROPDOWN_ANATOMY.separatorMarginYPx,
    marginLeft: ROOTSY_DROPDOWN_ANATOMY.itemPaddingXPx,
    marginRight: ROOTSY_DROPDOWN_ANATOMY.itemPaddingXPx,
  }
}

export function getDropdownCheckUiStyle(theme: DropdownThemeId = "light") {
  return {
    width: ROOTSY_DROPDOWN_ANATOMY.checkSlotPx,
    height: ROOTSY_DROPDOWN_ANATOMY.checkSlotPx,
    color: getDropdownCheckHex(theme),
    flexShrink: 0,
  }
}

export function getDropdownItemRowUiStyle() {
  return {
    display: "flex" as const,
    alignItems: "center" as const,
    gap: ROOTSY_DROPDOWN_ANATOMY.itemGapPx,
    width: "100%",
  }
}

export function getDropdownChevronUiStyle(theme: DropdownThemeId = "light") {
  return {
    width: ROOTSY_DROPDOWN_ANATOMY.iconSlotPx,
    height: ROOTSY_DROPDOWN_ANATOMY.iconSlotPx,
    color: theme === "light" ? hx("bruma", "500") : hx("bruma", "400"),
    flexShrink: 0,
  }
}
