/**
 * Runtime de specs Banners UI — misma resolución que bannersUiHardcodedSpec.
 */

import {
  getBannerActionUiStyle,
  getBannerContentStackUiStyle,
  getBannerDismissUiStyle,
  getBannerIconUiStyle,
  getBannerMessageUiStyle,
  getBannerRowUiStyle,
  getBannerShellUiStyle,
  getBannerTitleUiStyle,
  type BannerDensityId,
  type BannerIntentId,
  type BannerLayoutId,
  type BannerTone,
} from "@/app/library/ui-components/bannersUiHardcodedSpec"
import { ROOTSY_BANNER_ANATOMY } from "@/app/library/banner/rootsyBannerSystem"
import type { CSSProperties } from "react"

export type {
  BannerDensityId,
  BannerIntentId,
  BannerLayoutId,
  BannerTone,
} from "@/app/library/ui-components/bannersUiHardcodedSpec"

export {
  BANNERS_UI_DEMO_COPY,
  BANNERS_UI_DENSITIES,
  BANNERS_UI_INTENTS,
  BANNERS_UI_LAYOUTS,
} from "@/app/library/ui-components/bannersUiHardcodedSpec"

export function getBannerShellStyle(
  intent: BannerIntentId = "neutral",
  density: BannerDensityId = "default",
  options?: { fullWidth?: boolean; strip?: boolean; tone?: BannerTone },
): CSSProperties {
  const shell = getBannerShellUiStyle(intent, density, {
    fullWidth: options?.fullWidth,
    tone: options?.tone,
  })

  if (options?.strip) {
    return {
      ...shell,
      borderRadius: 0,
      borderLeft: "none",
      borderRight: "none",
      borderTop: "none",
    }
  }

  return {
    ...shell,
    borderRadius: `${ROOTSY_BANNER_ANATOMY.borderRadiusPx}px`,
  }
}

export function getBannerTitleStyle(tone: BannerTone = "light"): CSSProperties {
  return { ...getBannerTitleUiStyle(tone), margin: 0 }
}

export function getBannerMessageStyle(
  intent: BannerIntentId,
  tone: BannerTone = "light",
): CSSProperties {
  return { ...getBannerMessageUiStyle(intent, tone), margin: 0 }
}

export function getBannerActionStyle(
  intent: BannerIntentId,
  tone: BannerTone = "light",
): CSSProperties {
  return {
    ...getBannerActionUiStyle(intent, tone),
    border: "none",
    background: "transparent",
    padding: 0,
    cursor: "pointer",
    flexShrink: 0,
  }
}

export function getBannerDismissButtonStyle(tone: BannerTone = "light"): CSSProperties {
  const dismiss = getBannerDismissUiStyle(tone)

  return {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: dismiss.sizePx,
    height: dismiss.sizePx,
    border: "none",
    background: "transparent",
    color: dismiss.color,
    borderRadius: `${ROOTSY_BANNER_ANATOMY.dismissRadiusPx}px`,
    cursor: "pointer",
    flexShrink: 0,
    padding: 0,
  }
}

export function getBannerIconStyle(
  intent: BannerIntentId,
  tone: BannerTone = "light",
): CSSProperties {
  return getBannerIconUiStyle(intent, tone)
}

export function getBannerRowStyle(): CSSProperties {
  return getBannerRowUiStyle()
}

export function getBannerContentStackStyle(): CSSProperties {
  return getBannerContentStackUiStyle()
}

export function resolveBannerRole(intent: BannerIntentId): "alert" | "status" {
  return intent === "danger" || intent === "warning" ? "alert" : "status"
}

export function resolveBannerLayout(
  layout: BannerLayoutId | undefined,
  options: {
    title?: string
    actionLabel?: string
    onDismiss?: () => void
  },
): BannerLayoutId {
  if (layout) return layout
  if (options.onDismiss) return "dismissible"
  if (options.actionLabel) return "with-action"
  if (options.title) return "title-message"
  return "message"
}
