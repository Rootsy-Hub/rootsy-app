/**
 * Spec de panel dropdown — borde · sombra · superficie.
 */

import { ROOTSY_DROPDOWN_ANATOMY } from "@/app/[siteId]/[popId]/library/dropdown/rootsyDropdownSystem"
import {
  ROOTSY_ELEVATION_SHADOW_TOKENS,
  ROOTSY_ELEVATION_SURFACES_LIGHT,
} from "@/app/[siteId]/[popId]/library/elevation/rootsyElevationSystem"
import { ROOTSY_RADIUS_TOKENS } from "@/app/[siteId]/[popId]/library/radius/rootsyRadiusSystem"
import type { OverlaySurfaceSpecRow } from "@/app/[siteId]/[popId]/library/ui-components/modalsUiOverlaySpec"
import { rootsyColorHex } from "@/lib/design-system"

const hx = rootsyColorHex

function elevationHex(token: string): string {
  return ROOTSY_ELEVATION_SURFACES_LIGHT.find((item) => item.token === token)!.value
}

function elevationShadow(token: string): string {
  return ROOTSY_ELEVATION_SHADOW_TOKENS.find((item) => item.token === token)!.value
}

export const DROPDOWN_UI_PANEL_SPEC = {
  surfaceLightToken: "elevation.surface.overlay",
  surfaceLightValue: elevationHex("elevation.surface.overlay"),
  surfaceDarkToken: "elevation.surface.overlay",
  surfaceDarkValue: hx("sombra", "500"),
  borderToken: "color.border",
  borderCss: ROOTSY_DROPDOWN_ANATOMY.panelBorder,
  shadowToken: ROOTSY_DROPDOWN_ANATOMY.shadowToken,
  shadowValue: elevationShadow(ROOTSY_DROPDOWN_ANATOMY.shadowToken),
  radiusToken: "radius.xlarge",
  radiusPx: ROOTSY_DROPDOWN_ANATOMY.panelRadiusPx,
  pairRule: "Mismo par overlay + shadow.overlay que modal — anclado al trigger, sin scrim de viewport.",
  anchorGapToken: "space.100",
  anchorGapPx: ROOTSY_DROPDOWN_ANATOMY.anchorGapPx,
} as const

export function getDropdownUiPanelSpecRows(theme: "light" | "dark" = "light"): OverlaySurfaceSpecRow[] {
  return [
    {
      role: "Panel · superficie",
      token: DROPDOWN_UI_PANEL_SPEC.surfaceLightToken,
      value: theme === "light" ? DROPDOWN_UI_PANEL_SPEC.surfaceLightValue : DROPDOWN_UI_PANEL_SPEC.surfaceDarkValue,
      product: theme === "light" ? "bg-white" : "bg sombra-500",
    },
    {
      role: "Panel · borde",
      token: DROPDOWN_UI_PANEL_SPEC.borderToken,
      value: DROPDOWN_UI_PANEL_SPEC.borderCss,
      product: "border.width · bruma-200",
    },
    {
      role: "Panel · sombra",
      token: DROPDOWN_UI_PANEL_SPEC.shadowToken,
      value: DROPDOWN_UI_PANEL_SPEC.shadowValue,
      product: "shadow-[elevation.shadow.overlay]",
    },
    {
      role: "Panel · radio",
      token: DROPDOWN_UI_PANEL_SPEC.radiusToken,
      value: `${DROPDOWN_UI_PANEL_SPEC.radiusToken} · ${DROPDOWN_UI_PANEL_SPEC.radiusPx}px`,
      product: "rounded-xl",
    },
    {
      role: "Ancla al trigger",
      token: DROPDOWN_UI_PANEL_SPEC.anchorGapToken,
      value: `${DROPDOWN_UI_PANEL_SPEC.anchorGapPx}px`,
      product: "gap entre trigger y panel · sin scrim",
    },
  ]
}

export { ROOTSY_RADIUS_TOKENS }
