/**
 * Specs hardcodeadas Layout · Tablas — 100% fundamentos actuales.
 */

import {
  ROOTSY_ELEVATION_SURFACES_LIGHT,
} from "@/app/[siteId]/[popId]/library/elevation/rootsyElevationSystem"
import {
  ROOTSY_LAYOUTS_TABLES_ANATOMY,
  ROOTSY_LAYOUTS_TABLES_BODY,
  ROOTSY_LAYOUTS_TABLES_CHROME,
  ROOTSY_LAYOUTS_TABLES_FOOTER,
  ROOTSY_LAYOUTS_TABLES_STATUS,
  ROOTSY_LAYOUTS_TABLES_TOOLBAR,
  type LayoutsTablesStatusId,
} from "@/app/[siteId]/[popId]/library/layouts/rootsyLayoutsTablesSystem"
import { ROOTSY_FORM_CONTROL_HEIGHT_PX } from "@/app/[siteId]/[popId]/library/form/rootsyFormSystem"
import {
  getIconButtonUiRowSurface,
  getIconButtonUiSurface,
  ICON_BUTTON_UI_RADIUS_PX,
  type IconButtonUiInteractionState,
} from "@/app/[siteId]/[popId]/library/ui-components/buttonsUiHardcodedSpec"
import {
  getFormControlUiSurface,
} from "@/app/[siteId]/[popId]/library/ui-components/formsUiHardcodedSpec"
import { ROOTSY_COLOR_SEMANTIC, rootsyColorHex, rootsySpacePx } from "@/lib/design-system"
import { ROOTSY_FONT_WEIGHTS, ROOTSY_TEXT_STYLES } from "@/lib/design-system/tokens/typography"

const hx = rootsyColorHex

export type { LayoutsTablesStatusId } from "@/app/[siteId]/[popId]/library/layouts/rootsyLayoutsTablesSystem"

export const LAYOUTS_TABLES_ANATOMY = ROOTSY_LAYOUTS_TABLES_ANATOMY

export function getLayoutsTablesShellStyle(composed = false) {
  return {
    backgroundColor: ROOTSY_LAYOUTS_TABLES_BODY.canvasBackground,
    border: composed ? undefined : ROOTSY_LAYOUTS_TABLES_ANATOMY.shellBorder,
    boxShadow: composed ? undefined : ROOTSY_LAYOUTS_TABLES_ANATOMY.shellShadow,
    borderRadius: composed ? undefined : ROOTSY_LAYOUTS_TABLES_ANATOMY.shellRadiusPx,
    overflow: "hidden" as const,
  }
}

export function getLayoutsTablesHeaderShellStyle() {
  return {
    height: ROOTSY_LAYOUTS_TABLES_ANATOMY.headerHeightPx,
    background: ROOTSY_LAYOUTS_TABLES_CHROME.headerBackground,
    flexShrink: 0,
  }
}

export function getLayoutsTablesHeaderGridStyle() {
  return {
    display: "grid" as const,
    gridTemplateColumns: "1fr 1fr 1fr",
    alignItems: "center" as const,
    gap: rootsySpacePx("200"),
    height: "100%",
    paddingLeft: ROOTSY_LAYOUTS_TABLES_ANATOMY.headerPaddingXPx,
    paddingRight: ROOTSY_LAYOUTS_TABLES_ANATOMY.headerPaddingXPx,
  }
}

export function getLayoutsTablesHeaderDividerStyle() {
  return {
    width: 1,
    height: rootsySpacePx("300"),
    backgroundColor: ROOTSY_LAYOUTS_TABLES_ANATOMY.headerDividerColor,
    flexShrink: 0,
  }
}

export function getLayoutsTablesChromeIconButtonStyle(kind: "ghost" | "outlined" | "primary") {
  const sizePx = rootsySpacePx("500")

  if (kind === "primary") {
    const surface = getIconButtonUiSurface("pos", "primary")
    return {
      display: "inline-flex" as const,
      alignItems: "center" as const,
      justifyContent: "center" as const,
      width: sizePx,
      height: sizePx,
      backgroundColor: surface.backgroundColor,
      color: surface.iconColor,
      border: surface.border,
      borderRadius: surface.borderRadiusPx,
      padding: 0,
      cursor: "default" as const,
      flexShrink: 0,
    }
  }

  const surface = getIconButtonUiSurface("pos", kind === "ghost" ? "ghost" : "outlined")

  return {
    display: "inline-flex" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    width: sizePx,
    height: sizePx,
    backgroundColor: surface.backgroundColor,
    color: surface.iconColor,
    border: surface.border,
    boxShadow: surface.boxShadow,
    borderRadius: surface.borderRadiusPx,
    padding: 0,
    cursor: "default" as const,
    flexShrink: 0,
  }
}

export function getLayoutsTablesHeaderTitleStyle() {
  return {
    fontFamily: "var(--rootsy-font-ui)",
    fontSize: ROOTSY_TEXT_STYLES["heading.small"].fontSize,
    lineHeight: ROOTSY_TEXT_STYLES["heading.small"].lineHeight,
    fontWeight: ROOTSY_FONT_WEIGHTS.semibold.value,
    color: ROOTSY_LAYOUTS_TABLES_CHROME.titleColor,
    letterSpacing: "-0.01em",
  }
}

export function getLayoutsTablesPopNameStyle() {
  return {
    fontFamily: "var(--rootsy-font-ui)",
    fontSize: ROOTSY_TEXT_STYLES.body.fontSize,
    lineHeight: ROOTSY_TEXT_STYLES.body.lineHeight,
    fontWeight: ROOTSY_FONT_WEIGHTS.semibold.value,
    color: ROOTSY_LAYOUTS_TABLES_CHROME.titleColor,
  }
}

export function getLayoutsTablesUserNameStyle() {
  return getLayoutsTablesPopNameStyle()
}

export function getLayoutsTablesRoleStyle() {
  return {
    fontFamily: "var(--rootsy-font-ui)",
    fontSize: ROOTSY_TEXT_STYLES["body.small"].fontSize,
    lineHeight: ROOTSY_TEXT_STYLES["body.small"].lineHeight,
    fontWeight: ROOTSY_FONT_WEIGHTS.medium.value,
    color: ROOTSY_LAYOUTS_TABLES_CHROME.roleColor,
  }
}

export function getLayoutsTablesPopLogoStyle() {
  return {
    width: rootsySpacePx("400"),
    height: rootsySpacePx("400"),
    borderRadius: ROOTSY_LAYOUTS_TABLES_CHROME.popLogoRadiusPx,
    border: ROOTSY_LAYOUTS_TABLES_CHROME.popRingBorder,
    overflow: "hidden" as const,
    flexShrink: 0,
  }
}

export function getLayoutsTablesToolbarShellStyle() {
  return {
    height: ROOTSY_LAYOUTS_TABLES_ANATOMY.toolbarHeightPx,
    backgroundColor: ROOTSY_LAYOUTS_TABLES_TOOLBAR.backgroundColor,
    borderBottom: ROOTSY_LAYOUTS_TABLES_TOOLBAR.borderBottom,
    flexShrink: 0,
  }
}

export function getLayoutsTablesBodyCanvasStyle() {
  return {
    display: "flex" as const,
    flexDirection: "column" as const,
    minHeight: 0,
    flex: 1,
    backgroundColor: ROOTSY_LAYOUTS_TABLES_BODY.canvasBackground,
  }
}

export function getLayoutsTablesTableShellStyle(composed = false) {
  return {
    backgroundColor: ROOTSY_LAYOUTS_TABLES_BODY.tableBackground,
    minHeight: 0,
    flex: composed ? 1 : undefined,
    overflow: composed ? ("auto" as const) : ("hidden" as const),
    border: composed ? undefined : ROOTSY_LAYOUTS_TABLES_ANATOMY.shellBorder,
    borderRadius: composed ? undefined : ROOTSY_LAYOUTS_TABLES_ANATOMY.shellRadiusPx,
  }
}

export function getLayoutsTablesTableStyle() {
  return {
    width: "100%",
    borderCollapse: "collapse" as const,
    tableLayout: "fixed" as const,
  }
}

export function getLayoutsTablesHeadCellStyle() {
  return {
    height: ROOTSY_LAYOUTS_TABLES_ANATOMY.tableHeadHeightPx,
    paddingLeft: ROOTSY_LAYOUTS_TABLES_ANATOMY.tableCellPaddingXPx,
    paddingRight: ROOTSY_LAYOUTS_TABLES_ANATOMY.tableCellPaddingXPx,
    backgroundColor: ROOTSY_LAYOUTS_TABLES_BODY.headBackground,
    borderBottom: `1px solid ${ROOTSY_LAYOUTS_TABLES_ANATOMY.toolbarDividerColor}`,
    fontFamily: "var(--rootsy-font-ui)",
    fontSize: ROOTSY_TEXT_STYLES["body.small"].fontSize,
    lineHeight: ROOTSY_TEXT_STYLES["body.small"].lineHeight,
    fontWeight: ROOTSY_FONT_WEIGHTS.medium.value,
    color: ROOTSY_LAYOUTS_TABLES_BODY.headTextColor,
    textAlign: "left" as const,
    whiteSpace: "nowrap" as const,
  }
}

export type LayoutsTablesSortDirection = "none" | "asc" | "desc"

export function getLayoutsTablesSortHeadInnerStyle(
  align: "left" | "right" = "left",
) {
  return {
    display: "inline-flex" as const,
    alignItems: "center" as const,
    gap: rootsySpacePx("050"),
    width: "100%" as const,
    minWidth: 0,
    justifyContent: align === "right" ? ("flex-end" as const) : ("flex-start" as const),
  }
}

export function getLayoutsTablesSortHeadLabelStyle(
  direction: LayoutsTablesSortDirection = "none",
) {
  return {
    fontFamily: "var(--rootsy-font-ui)",
    fontSize: ROOTSY_TEXT_STYLES["body.small"].fontSize,
    lineHeight: ROOTSY_TEXT_STYLES["body.small"].lineHeight,
    fontWeight: ROOTSY_FONT_WEIGHTS.medium.value,
    color:
      direction === "none"
        ? ROOTSY_LAYOUTS_TABLES_BODY.sortInactiveLabelColor
        : ROOTSY_LAYOUTS_TABLES_BODY.sortActiveLabelColor,
    margin: 0,
    overflow: "hidden" as const,
    textOverflow: "ellipsis" as const,
    whiteSpace: "nowrap" as const,
  }
}

export function getLayoutsTablesSortButtonStyle(
  direction: LayoutsTablesSortDirection = "none",
  interaction: IconButtonUiInteractionState = "default",
) {
  const intent = direction === "none" ? "neutral" : "edit"
  const surface = getIconButtonUiRowSurface(intent, interaction)
  const sizePx = rootsySpacePx("400")

  return {
    display: "inline-flex" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    width: sizePx,
    height: sizePx,
    flexShrink: 0,
    backgroundColor: surface.backgroundColor,
    color: surface.iconColor,
    border: surface.border,
    borderRadius: ICON_BUTTON_UI_RADIUS_PX,
    boxShadow: surface.boxShadow,
    opacity: surface.opacity,
    padding: 0,
    cursor: "default" as const,
  }
}

export function getLayoutsTablesRowBackground(index: number, options?: { noHover?: boolean }) {
  if (options?.noHover) {
    return index % 2 === 0
      ? ROOTSY_LAYOUTS_TABLES_BODY.rowEvenBackground
      : ROOTSY_LAYOUTS_TABLES_BODY.rowOddBackground
  }
  return index % 2 === 0
    ? ROOTSY_LAYOUTS_TABLES_BODY.rowEvenBackground
    : ROOTSY_LAYOUTS_TABLES_BODY.rowOddBackground
}

export function getLayoutsTablesBodyCellStyle() {
  return {
    height: ROOTSY_LAYOUTS_TABLES_ANATOMY.tableRowHeightPx,
    paddingLeft: ROOTSY_LAYOUTS_TABLES_ANATOMY.tableCellPaddingXPx,
    paddingRight: ROOTSY_LAYOUTS_TABLES_ANATOMY.tableCellPaddingXPx,
    verticalAlign: "middle" as const,
    borderBottom: `1px solid ${ROOTSY_LAYOUTS_TABLES_ANATOMY.toolbarDividerColor}`,
  }
}

export function getLayoutsTablesPrimaryCellStyle() {
  return {
    fontFamily: "var(--rootsy-font-ui)",
    fontSize: ROOTSY_TEXT_STYLES.body.fontSize,
    lineHeight: ROOTSY_TEXT_STYLES.body.lineHeight,
    fontWeight: ROOTSY_FONT_WEIGHTS.medium.value,
    color: ROOTSY_LAYOUTS_TABLES_BODY.primaryTextColor,
    margin: 0,
    overflow: "hidden" as const,
    textOverflow: "ellipsis" as const,
    whiteSpace: "nowrap" as const,
  }
}

export function getLayoutsTablesSecondaryCellStyle() {
  return {
    fontFamily: "var(--rootsy-font-ui)",
    fontSize: ROOTSY_TEXT_STYLES["body.small"].fontSize,
    lineHeight: ROOTSY_TEXT_STYLES["body.small"].lineHeight,
    fontWeight: ROOTSY_FONT_WEIGHTS.regular.value,
    color: ROOTSY_LAYOUTS_TABLES_BODY.secondaryTextColor,
    margin: 0,
    overflow: "hidden" as const,
    textOverflow: "ellipsis" as const,
    whiteSpace: "nowrap" as const,
  }
}

export function getLayoutsTablesMetaCellStyle() {
  return {
    ...getLayoutsTablesSecondaryCellStyle(),
    fontWeight: ROOTSY_FONT_WEIGHTS.medium.value,
    color: ROOTSY_LAYOUTS_TABLES_BODY.metaTextColor,
  }
}

export function getLayoutsTablesLinkCellStyle() {
  return {
    fontFamily: "var(--rootsy-font-ui)",
    fontSize: ROOTSY_TEXT_STYLES["body.small"].fontSize,
    lineHeight: ROOTSY_TEXT_STYLES["body.small"].lineHeight,
    fontWeight: ROOTSY_FONT_WEIGHTS.regular.value,
    color: ROOTSY_LAYOUTS_TABLES_BODY.linkColor,
    margin: 0,
  }
}

export function getLayoutsTablesMoneyCellStyle() {
  return {
    fontFamily: "var(--rootsy-font-numeric)",
    fontSize: ROOTSY_TEXT_STYLES.body.fontSize,
    lineHeight: ROOTSY_TEXT_STYLES.body.lineHeight,
    fontWeight: ROOTSY_FONT_WEIGHTS.regular.value,
    color: ROOTSY_LAYOUTS_TABLES_BODY.moneyColor,
    fontVariantNumeric: "tabular-nums" as const,
    letterSpacing: "-0.01em",
    textAlign: "right" as const,
  }
}

export function getLayoutsTablesStatusBadgeStyle(status: LayoutsTablesStatusId) {
  const spec = ROOTSY_LAYOUTS_TABLES_STATUS[status]
  return {
    display: "inline-flex" as const,
    alignItems: "center" as const,
    padding: `${rootsySpacePx("050")}px ${rootsySpacePx("100")}px`,
    borderRadius: rootsySpacePx("050"),
    backgroundColor: spec.backgroundColor,
    border: spec.border,
    fontFamily: "var(--rootsy-font-ui)",
    fontSize: ROOTSY_TEXT_STYLES["body.small"].fontSize,
    lineHeight: ROOTSY_TEXT_STYLES["body.small"].lineHeight,
    fontWeight: ROOTSY_FONT_WEIGHTS.medium.value,
    color: spec.color,
  }
}

export function getLayoutsTablesCheckboxStyle() {
  const sizePx = rootsySpacePx("200")
  const overlay = ROOTSY_ELEVATION_SURFACES_LIGHT.find((item) => item.token === "elevation.surface.overlay")!.value
  return {
    width: sizePx,
    height: sizePx,
    borderRadius: rootsySpacePx("050"),
    border: `1px solid ${hx("bruma", "300")}`,
    backgroundColor: overlay,
    flexShrink: 0,
  }
}

export function getLayoutsTablesFooterShellStyle(composed = false) {
  return {
    height: ROOTSY_LAYOUTS_TABLES_ANATOMY.footerHeightPx,
    background: ROOTSY_LAYOUTS_TABLES_CHROME.footerBackground,
    flexShrink: 0,
    borderRadius: composed ? undefined : ROOTSY_LAYOUTS_TABLES_ANATOMY.shellRadiusPx,
    overflow: "hidden" as const,
  }
}

export function getLayoutsTablesFooterGridStyle() {
  return {
    display: "grid" as const,
    gridTemplateColumns: "1fr auto 1fr",
    alignItems: "center" as const,
    height: "100%",
    paddingLeft: ROOTSY_LAYOUTS_TABLES_ANATOMY.headerPaddingXPx,
    paddingRight: ROOTSY_LAYOUTS_TABLES_ANATOMY.headerPaddingXPx,
    gap: rootsySpacePx("200"),
  }
}

export function getLayoutsTablesFooterTextStyle(muted = false) {
  return {
    fontFamily: "var(--rootsy-font-ui)",
    fontSize: ROOTSY_TEXT_STYLES["body.small"].fontSize,
    lineHeight: ROOTSY_TEXT_STYLES["body.small"].lineHeight,
    fontWeight: ROOTSY_FONT_WEIGHTS.regular.value,
    color: muted ? ROOTSY_LAYOUTS_TABLES_FOOTER.mutedColor : ROOTSY_LAYOUTS_TABLES_FOOTER.textColor,
  }
}

export function getLayoutsTablesFooterNavButtonStyle() {
  const surface = getIconButtonUiSurface("pos", "ghost")
  const sizePx = rootsySpacePx("400")

  return {
    display: "inline-flex" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    width: sizePx,
    height: sizePx,
    backgroundColor: surface.backgroundColor,
    color: surface.iconColor,
    border: surface.border,
    borderRadius: ICON_BUTTON_UI_RADIUS_PX,
    padding: 0,
    cursor: "default" as const,
  }
}

export function getLayoutsTablesFooterSelectStyle() {
  const surface = getFormControlUiSurface("default")
  return {
    display: "inline-flex" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    gap: rootsySpacePx("100"),
    minWidth: 72,
    height: ROOTSY_FORM_CONTROL_HEIGHT_PX,
    paddingLeft: rootsySpacePx("150"),
    paddingRight: rootsySpacePx("150"),
    backgroundColor: `color-mix(in srgb, ${hx("sombra", "700")} 65%, transparent)`,
    border: `1px solid color-mix(in srgb, ${ROOTSY_COLOR_SEMANTIC.textOnDark} 10%, ${hx("sombra", "600")})`,
    borderRadius: rootsySpacePx("050"),
    color: ROOTSY_LAYOUTS_TABLES_FOOTER.textColor,
    fontFamily: "var(--rootsy-font-ui)",
    fontSize: ROOTSY_TEXT_STYLES["body.small"].fontSize,
    lineHeight: ROOTSY_TEXT_STYLES["body.small"].lineHeight,
    boxShadow: surface.boxShadow,
  }
}

export function getLayoutsTablesWireframeColumnDividerColor(
  kind: "chrome" | "toolbar" | "head" | "footer",
) {
  return kind === "toolbar" || kind === "head"
    ? ROOTSY_LAYOUTS_TABLES_ANATOMY.contentBorderColor
    : ROOTSY_LAYOUTS_TABLES_ANATOMY.columnDividerColor
}

export function getLayoutsTablesWireframeZoneStyle(kind: "chrome" | "toolbar" | "head" | "row" | "footer") {
  const contentBorder = ROOTSY_LAYOUTS_TABLES_ANATOMY.contentBorderColor
  const chromeBorder = ROOTSY_LAYOUTS_TABLES_ANATOMY.columnDividerColor

  switch (kind) {
    case "chrome":
      return { background: ROOTSY_LAYOUTS_TABLES_CHROME.headerBackground }
    case "toolbar":
      return {
        backgroundColor: ROOTSY_LAYOUTS_TABLES_TOOLBAR.backgroundColor,
        borderBottom: `1px solid ${contentBorder}`,
      }
    case "head":
      return {
        backgroundColor: ROOTSY_LAYOUTS_TABLES_BODY.headBackground,
        borderBottom: `1px solid ${contentBorder}`,
      }
    case "row":
      return { backgroundColor: ROOTSY_LAYOUTS_TABLES_BODY.rowEvenBackground }
    case "footer":
      return {
        background: ROOTSY_LAYOUTS_TABLES_CHROME.footerBackground,
        borderTop: `1px solid ${chromeBorder}`,
      }
  }
}

export function getLayoutsTablesStructureCaptionStyle() {
  return {
    fontFamily: "var(--rootsy-font-ui)",
    fontSize: ROOTSY_TEXT_STYLES["body.small"].fontSize,
    lineHeight: ROOTSY_TEXT_STYLES["body.small"].lineHeight,
    fontWeight: ROOTSY_FONT_WEIGHTS.medium.value,
    color: hx("bruma", "500"),
    textAlign: "center" as const,
    margin: 0,
    padding: `${rootsySpacePx("100")}px ${rootsySpacePx("150")}px`,
  }
}

export function getLayoutsTablesStructureCaptionBandStyle() {
  return {
    display: "grid" as const,
    gridTemplateColumns: "1fr 1fr 1fr",
    borderTop: `1px solid ${ROOTSY_LAYOUTS_TABLES_ANATOMY.columnDividerColor}`,
    backgroundColor: `color-mix(in srgb, ${hx("sombra", "950")} 50%, transparent)`,
  }
}
