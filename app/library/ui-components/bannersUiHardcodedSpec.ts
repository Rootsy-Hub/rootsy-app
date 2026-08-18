/**
 * Specs hardcodeadas Banners UI — 100% fundamentos actuales.
 */

import {
  ROOTSY_BANNER_ANATOMY,
  ROOTSY_BANNER_DENSITIES,
  ROOTSY_BANNER_INTENTS,
  ROOTSY_BANNER_LAYOUTS,
  getBannerDensityPadding,
  getBannerIntentAccentHex,
  getBannerIntentMessageHex,
  getBannerSurfaceColors,
  type BannerDensityId,
  type BannerIntentId,
  type BannerLayoutId,
  type BannerTone,
} from "@/app/library/banner/rootsyBannerSystem"
import { rootsyColorHex } from "@/lib/design-system"
import { ROOTSY_FONT_WEIGHTS, ROOTSY_TEXT_STYLES } from "@/lib/design-system/tokens/typography"

export type {
  BannerDensityId,
  BannerIntentId,
  BannerLayoutId,
  BannerTone,
} from "@/app/library/banner/rootsyBannerSystem"

const hx = rootsyColorHex

export const BANNERS_UI_INTENTS = ROOTSY_BANNER_INTENTS
export const BANNERS_UI_DENSITIES = ROOTSY_BANNER_DENSITIES
export const BANNERS_UI_LAYOUTS = ROOTSY_BANNER_LAYOUTS
export const BANNERS_UI_ANATOMY = ROOTSY_BANNER_ANATOMY

export const BANNERS_UI_DEMO_COPY = {
  neutral: {
    title: "Sincronización pendiente",
    message: "Los cambios se aplicarán cuando vuelva la conexión.",
    action: "Ver detalle",
  },
  info: {
    title: "Operación en curso",
    message: "Estamos procesando la venta — no cierres esta pantalla.",
    action: "Actualizar estado",
  },
  success: {
    title: "Artículo guardado",
    message: "Los cambios ya están disponibles en el catálogo.",
    action: "Ver artículo",
  },
  warning: {
    title: "Stock bajo",
    message: "Quedan 3 unidades — revisá el inventario antes de vender.",
    action: "Ir a stock",
  },
  danger: {
    title: "No se pudo guardar",
    message: "Revisá los campos marcados e intentá de nuevo.",
    action: "Reintentar",
  },
  messageOnly: {
    neutral: "Los precios se actualizan cada noche a las 03:00.",
    danger: "Completá el nombre del cliente para continuar.",
  },
} as const

export function getBannerTitleUiStyle(tone: BannerTone = "light") {
  return {
    fontFamily: "var(--rootsy-font-ui)",
    fontSize: ROOTSY_TEXT_STYLES.body.fontSize,
    lineHeight: ROOTSY_TEXT_STYLES.body.lineHeight,
    fontWeight: ROOTSY_FONT_WEIGHTS.medium.value,
    color: tone === "dark" ? "var(--rootsy-white)" : hx("bruma", "900"),
  }
}

export function getBannerMessageUiStyle(
  intent: BannerIntentId,
  tone: BannerTone = "light",
) {
  return {
    fontFamily: "var(--rootsy-font-ui)",
    fontSize: ROOTSY_TEXT_STYLES["body.small"].fontSize,
    lineHeight: ROOTSY_TEXT_STYLES["body.small"].lineHeight,
    fontWeight: ROOTSY_FONT_WEIGHTS.regular.value,
    color: getBannerIntentMessageHex(intent, tone),
  }
}

export function getBannerActionUiStyle(
  intent: BannerIntentId,
  tone: BannerTone = "light",
) {
  return {
    fontFamily: "var(--rootsy-font-ui)",
    fontSize: ROOTSY_TEXT_STYLES["body.small"].fontSize,
    lineHeight: ROOTSY_TEXT_STYLES["body.small"].lineHeight,
    fontWeight: ROOTSY_FONT_WEIGHTS.medium.value,
    color:
      intent === "neutral"
        ? tone === "dark"
          ? "var(--rootsy-savia-400)"
          : hx("savia", "600")
        : getBannerIntentAccentHex(intent, tone),
    whiteSpace: "nowrap" as const,
  }
}

export function getBannerDismissUiStyle(tone: BannerTone = "light") {
  return {
    sizePx: ROOTSY_BANNER_ANATOMY.dismissHitPx,
    color: tone === "dark" ? "var(--rootsy-sombra-300)" : hx("bruma", "500"),
    borderRadiusPx: ROOTSY_BANNER_ANATOMY.dismissRadiusPx,
  }
}

export type BannerUiSurface = {
  backgroundColor: string
  border: string
  borderRadiusPx: number
  paddingLeft: number
  paddingRight: number
  paddingTop: number
  paddingBottom: number
  maxWidthPx: number
}

export function getBannerUiSurface(
  intent: BannerIntentId,
  density: BannerDensityId = "default",
  tone: BannerTone = "light",
): BannerUiSurface {
  const surface = getBannerSurfaceColors(intent, tone)
  const padding = getBannerDensityPadding(density)

  return {
    ...surface,
    borderRadiusPx: ROOTSY_BANNER_ANATOMY.borderRadiusPx,
    ...padding,
    maxWidthPx: ROOTSY_BANNER_ANATOMY.maxWidthPx,
  }
}

/** Shell CSS — mapea borderRadiusPx → borderRadius (radius.large · 12px). */
export function getBannerShellUiStyle(
  intent: BannerIntentId,
  density: BannerDensityId = "default",
  options?: { fullWidth?: boolean; tone?: BannerTone },
) {
  const surface = getBannerUiSurface(intent, density, options?.tone)

  return {
    backgroundColor: surface.backgroundColor,
    border: surface.border,
    borderRadius: surface.borderRadiusPx,
    paddingLeft: surface.paddingLeft,
    paddingRight: surface.paddingRight,
    paddingTop: surface.paddingTop,
    paddingBottom: surface.paddingBottom,
    maxWidth: options?.fullWidth ? undefined : surface.maxWidthPx,
    width: options?.fullWidth ? ("100%" as const) : undefined,
    boxSizing: "border-box" as const,
  }
}

export function getBannerIconUiStyle(
  intent: BannerIntentId,
  tone: BannerTone = "light",
) {
  return {
    width: ROOTSY_BANNER_ANATOMY.iconSlotPx,
    height: ROOTSY_BANNER_ANATOMY.iconSlotPx,
    color: getBannerIntentAccentHex(intent, tone),
    flexShrink: 0,
  }
}

export function getBannerRowUiStyle() {
  return {
    display: "flex" as const,
    alignItems: "flex-start" as const,
    gap: ROOTSY_BANNER_ANATOMY.rowGapPx,
  }
}

export function getBannerContentStackUiStyle() {
  return {
    display: "flex" as const,
    flexDirection: "column" as const,
    gap: ROOTSY_BANNER_ANATOMY.titleMessageGapPx,
    flex: 1,
    minWidth: 0,
  }
}

export type BannerUiSpecOptions = {
  intent?: BannerIntentId
  density?: BannerDensityId
  layout?: BannerLayoutId
  showIcon?: boolean
}
