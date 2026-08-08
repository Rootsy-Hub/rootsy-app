/**
 * Specs hardcodeadas Modales UI — 100% fundamentos actuales.
 */

import {
  ROOTSY_ALERT_DIALOG_VARIANTS,
  ROOTSY_DIALOG_KINDS,
  ROOTSY_MODAL_ANATOMY,
  ROOTSY_MODAL_BODY_TONES,
  ROOTSY_MODAL_FOOTER_VARIANTS,
  ROOTSY_MODAL_PANEL_PADDING_X_PX,
  ROOTSY_MODAL_SPECS,
  ROOTSY_MODAL_SURFACE_SIZES,
  type AlertDialogVariantId,
  type DialogKindId,
  type ModalBodyToneId,
  type ModalFooterVariantId,
  type ModalSurfaceSizeId,
} from "@/app/[siteId]/[popId]/library/modal/rootsyModalSystem"
import { ROOTSY_BORDER_COLOR_TOKENS } from "@/app/[siteId]/[popId]/library/border/rootsyBorderSystem"
import {
  ROOTSY_ELEVATION_SHADOW_TOKENS,
  ROOTSY_ELEVATION_SURFACES_LIGHT,
} from "@/app/[siteId]/[popId]/library/elevation/rootsyElevationSystem"
import { ROOTSY_RADIUS_TOKENS } from "@/app/[siteId]/[popId]/library/radius/rootsyRadiusSystem"
import { ROOTSY_SEMANTIC_TOKENS } from "@/app/[siteId]/[popId]/library/color/rootsyColorSystem"
import { rootsyColorHex, rootsySpacePx } from "@/lib/design-system"
import { ROOTSY_FONT_WEIGHTS, ROOTSY_TEXT_STYLES } from "@/lib/design-system/tokens/typography"

const hx = rootsyColorHex

function borderHex(token: string): string {
  return ROOTSY_BORDER_COLOR_TOKENS.find((item) => item.token === token)!.value
}

function elevationHex(token: string): string {
  return ROOTSY_ELEVATION_SURFACES_LIGHT.find((item) => item.token === token)!.value
}

function elevationShadow(token: string): string {
  return ROOTSY_ELEVATION_SHADOW_TOKENS.find((item) => item.token === token)!.value
}

function radiusPx(id: "full"): number {
  return Number.parseInt(ROOTSY_RADIUS_TOKENS.find((item) => item.id === id)!.value, 10)
}

function regionDivider(kind: DialogKindId, edge: "top" | "bottom"): string | undefined {
  if (kind === "alert" && edge === "bottom") return undefined
  return `1px solid ${borderHex("color.border")}`
}

export type DialogPanelUiSurface = {
  backgroundColor: string
  border: string
  boxShadow: string
  borderRadiusPx: number
  maxWidthPx: number
}

export type DialogScrimUiStyle = {
  backgroundColor: string
  minHeightPx: number
  paddingPx: number
  borderRadiusPx: number
}

export type DialogRegionUiStyle = {
  backgroundColor: string
  borderBottom?: string
  borderTop?: string
  paddingLeft: number
  paddingRight: number
  paddingTop: number
  paddingBottom: number
}

export const MODAL_UI_SURFACE_SIZES = ROOTSY_MODAL_SURFACE_SIZES
export const MODAL_UI_FOOTER_VARIANTS = ROOTSY_MODAL_FOOTER_VARIANTS
export const MODAL_UI_BODY_TONES = ROOTSY_MODAL_BODY_TONES
export const MODAL_UI_ALERT_VARIANTS = ROOTSY_ALERT_DIALOG_VARIANTS
export const MODAL_UI_DIALOG_KINDS = ROOTSY_DIALOG_KINDS
export const MODAL_UI_ANATOMY = ROOTSY_MODAL_ANATOMY

export function getModalTitleUiStyle(kind: DialogKindId = "modal") {
  const isModal = kind === "modal"

  return {
    fontFamily: "var(--rootsy-font-ui)",
    fontSize: isModal
      ? ROOTSY_TEXT_STYLES["heading.medium"].fontSize
      : ROOTSY_TEXT_STYLES["heading.small"].fontSize,
    lineHeight: isModal
      ? ROOTSY_TEXT_STYLES["heading.medium"].lineHeight
      : ROOTSY_TEXT_STYLES["heading.small"].lineHeight,
    fontWeight: ROOTSY_FONT_WEIGHTS.bold.value,
    letterSpacing: "-0.01em",
    color: hx("bruma", "900"),
  }
}

export const MODAL_UI_DESCRIPTION_STYLE = {
  fontFamily: "var(--rootsy-font-ui)",
  fontSize: ROOTSY_TEXT_STYLES["body.small"].fontSize,
  lineHeight: ROOTSY_TEXT_STYLES["body.small"].lineHeight,
  fontWeight: ROOTSY_FONT_WEIGHTS.regular.value,
  color: hx("bruma", "500"),
}

export const MODAL_UI_BODY_TEXT_STYLE = {
  fontFamily: "var(--rootsy-font-ui)",
  fontSize: ROOTSY_TEXT_STYLES.body.fontSize,
  lineHeight: ROOTSY_TEXT_STYLES.body.lineHeight,
  fontWeight: ROOTSY_FONT_WEIGHTS.regular.value,
  color: hx("bruma", "700"),
}

/** @deprecated Usar getModalTitleUiStyle */
export const MODAL_UI_TITLE_STYLE = getModalTitleUiStyle("modal")

export function getDialogScrimUiStyle(kind: DialogKindId = "modal"): DialogScrimUiStyle {
  return {
    backgroundColor: `color-mix(in srgb, ${hx("sombra", "950")} 40%, transparent)`,
    minHeightPx:
      kind === "modal"
        ? ROOTSY_MODAL_ANATOMY.previewMinHeightModalPx
        : ROOTSY_MODAL_ANATOMY.previewMinHeightAlertPx,
    paddingPx: rootsySpacePx("300"),
    borderRadiusPx: rootsySpacePx("200"),
  }
}

export function getDialogPanelUiSurface(
  kind: DialogKindId = "modal",
  size: ModalSurfaceSizeId = "default",
): DialogPanelUiSurface {
  const spec = kind === "modal" ? ROOTSY_MODAL_SPECS.modal : ROOTSY_MODAL_SPECS.alert
  const sizeSpec =
    kind === "alert"
      ? { maxWidthPx: ROOTSY_MODAL_SPECS.alert.maxWidthPx }
      : ROOTSY_MODAL_SURFACE_SIZES.find((item) => item.id === size)!

  return {
    backgroundColor: elevationHex(spec.surfaceToken),
    border: `1px solid ${borderHex("color.border")}`,
    boxShadow: elevationShadow(spec.shadowToken),
    borderRadiusPx: spec.radiusPx,
    maxWidthPx: sizeSpec.maxWidthPx,
  }
}

/** Shell CSS — radius.xxlarge modal · radius.xlarge alert · overflow recorta regiones. */
export function getDialogPanelShellUiStyle(
  kind: DialogKindId = "modal",
  size: ModalSurfaceSizeId = "default",
) {
  const panel = getDialogPanelUiSurface(kind, size)

  return {
    width: "100%" as const,
    maxWidth: panel.maxWidthPx,
    backgroundColor: panel.backgroundColor,
    border: panel.border,
    boxShadow: panel.boxShadow,
    borderRadius: `${panel.borderRadiusPx}px`,
    overflow: "hidden" as const,
    flexShrink: 0,
    boxSizing: "border-box" as const,
  }
}

export function getDialogPanelShellRadiusClass(kind: DialogKindId = "modal") {
  return kind === "modal" ? "rounded-[1.375rem]" : "rounded-xl"
}

export function getDialogHeaderUiStyle(kind: DialogKindId = "modal"): DialogRegionUiStyle {
  return {
    backgroundColor: elevationHex("elevation.surface.overlay"),
    borderBottom: regionDivider(kind, "bottom"),
    paddingLeft: ROOTSY_MODAL_PANEL_PADDING_X_PX,
    paddingRight: ROOTSY_MODAL_PANEL_PADDING_X_PX,
    paddingTop: rootsySpacePx("400"),
    paddingBottom: rootsySpacePx("200"),
  }
}

export function getDialogBodyUiStyle(
  tone: ModalBodyToneId = "default",
  kind: DialogKindId = "modal",
): DialogRegionUiStyle {
  const backgroundColor =
    tone === "default" || tone === "loading"
      ? elevationHex("elevation.surface.sunken")
      : elevationHex("elevation.surface.overlay")

  return {
    backgroundColor,
    paddingLeft: ROOTSY_MODAL_PANEL_PADDING_X_PX,
    paddingRight: ROOTSY_MODAL_PANEL_PADDING_X_PX,
    paddingTop: rootsySpacePx("200"),
    paddingBottom: rootsySpacePx("200"),
    ...(kind === "alert" ? { borderBottom: undefined } : {}),
  }
}

export function getDialogFooterUiStyle(kind: DialogKindId = "modal"): DialogRegionUiStyle {
  return {
    backgroundColor: elevationHex("elevation.surface.overlay"),
    borderTop: regionDivider(kind, "top"),
    paddingLeft: ROOTSY_MODAL_PANEL_PADDING_X_PX,
    paddingRight: ROOTSY_MODAL_PANEL_PADDING_X_PX,
    paddingTop: rootsySpacePx("150"),
    paddingBottom: rootsySpacePx("150"),
  }
}

export function getAlertContentUiStyle(): DialogRegionUiStyle {
  return {
    backgroundColor: elevationHex("elevation.surface.overlay"),
    paddingLeft: ROOTSY_MODAL_PANEL_PADDING_X_PX,
    paddingRight: ROOTSY_MODAL_PANEL_PADDING_X_PX,
    paddingTop: rootsySpacePx("400"),
    paddingBottom: rootsySpacePx("200"),
  }
}

export function getDialogCloseButtonUiStyle(): {
  sizePx: number
  color: string
  borderRadiusPx: number
  insetPx: number
} {
  return {
    sizePx: ROOTSY_MODAL_ANATOMY.closeHitPx,
    color: hx("bruma", "500"),
    borderRadiusPx: radiusPx("full"),
    insetPx: rootsySpacePx("400"),
  }
}

export function getDialogLoadingUiStyle(): {
  minHeightPx: number
  spinnerColor: string
  trackColor: string
  spinnerSizePx: number
  spinnerBorderWidthPx: number
} {
  return {
    minHeightPx: ROOTSY_MODAL_SPECS.loading.minHeightPx,
    spinnerColor: hx("savia", "600"),
    trackColor: hx("bruma", "200"),
    spinnerSizePx: ROOTSY_MODAL_SPECS.spinner.sizePx,
    spinnerBorderWidthPx: ROOTSY_MODAL_SPECS.spinner.borderWidthPx,
  }
}

export function getAlertActionUiStyle(variant: AlertDialogVariantId): {
  confirmAppearance: "primary" | "danger"
} {
  switch (variant) {
    case "confirm":
      return { confirmAppearance: "primary" }
    case "destructive":
    case "typed-confirmation":
      return { confirmAppearance: "danger" }
  }
}

export const MODAL_UI_DEMO_COPY = {
  modal: {
    title: "Editar artículo",
    description: "Cambios en catálogo y precio de venta.",
    bodySummary: "Medialuna x2 · Café con leche x1",
    fieldName: "Nombre del artículo",
    fieldNameValue: "Cola 500 ml",
    fieldPrice: "Precio de venta",
    fieldPriceValue: "1.250",
  },
  alert: {
    confirm: {
      title: "Registrar venta",
      description: "¿Confirmás el ticket por $ 4.500?",
      body: "Medialuna x2 · Café con leche x1",
      cancel: "Cancelar",
      confirm: "Confirmar",
    },
    destructive: {
      title: "Eliminar artículo",
      description: "Esta acción no se puede deshacer.",
      body: "Se quitará \"Cola 500 ml\" del catálogo de la sucursal.",
      cancel: "Cancelar",
      confirm: "Eliminar",
    },
    typed: {
      title: "Eliminar categoría",
      description: "Escribí el nombre exacto para confirmar.",
      body: "Se eliminarán 12 artículos asociados.",
      cancel: "Cancelar",
      confirm: "Eliminar definitivamente",
      inputLabel: "Nombre de la categoría",
      inputPlaceholder: "Bebidas",
      inputValue: "Bebidas",
    },
  },
  footer: {
    cancel: "Cancelar",
    confirm: "Guardar",
    single: "Confirmar",
    delete: "Eliminar",
  },
} as const

export type {
  AlertDialogVariantId,
  DialogKindId,
  ModalBodyToneId,
  ModalFooterVariantId,
  ModalSurfaceSizeId,
} from "@/app/[siteId]/[popId]/library/modal/rootsyModalSystem"

export function getModalSurfaceSizeSpec(size: ModalSurfaceSizeId) {
  return ROOTSY_MODAL_SURFACE_SIZES.find((item) => item.id === size)!
}

export function getDialogPreviewWidthPx(panelMaxWidthPx: number, scale = 1): number {
  return panelMaxWidthPx * scale
}

export {
  MODAL_UI_OVERLAY_SPEC,
  MODAL_UI_PANEL_SURFACE_SPEC,
  MODAL_UI_SCRIM_SPEC,
  getDialogPreviewMinHeightPx,
  getModalUiOverlaySpecRows,
} from "@/app/[siteId]/[popId]/library/ui-components/modalsUiOverlaySpec"
export type { OverlaySurfaceSpecRow } from "@/app/[siteId]/[popId]/library/ui-components/modalsUiOverlaySpec"
