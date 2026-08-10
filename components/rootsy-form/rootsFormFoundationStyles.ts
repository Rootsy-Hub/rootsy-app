/**
 * Clases Tailwind derivadas de fundamentos nuevos — misma resolución que formsUiHardcodedSpec.
 * Fuentes: border · elevation · color semántico · spacing · radius · typography.
 */

import { ROOTSY_BORDER_COLOR_TOKENS } from "@/app/library/border/rootsyBorderSystem"
import { ROOTSY_ELEVATION_SURFACES_LIGHT } from "@/app/library/elevation/rootsyElevationSystem"
import { ROOTSY_SEMANTIC_TOKENS } from "@/app/library/color/rootsyColorSystem"
import { rootsyColorHex } from "@/lib/design-system"

function borderHex(token: string): string {
  return ROOTSY_BORDER_COLOR_TOKENS.find((item) => item.token === token)!.value
}

function elevationHex(token: string): string {
  return ROOTSY_ELEVATION_SURFACES_LIGHT.find((item) => item.token === token)!.value
}

function semanticHex(id: string): string {
  return ROOTSY_SEMANTIC_TOKENS.find((item) => item.id === id)!.hex
}

/** Tokens resueltos — espejo de getFormControlUiSurface / getFormAssistUiStyle. */
export const ROOTSY_FORM_FOUNDATION = {
  borderDefault: borderHex("color.border"),
  borderHover: rootsyColorHex("bruma", "300"),
  borderFocused: borderHex("color.border.focused"),
  borderDanger: semanticHex("status-danger"),
  surfaceOverlay: elevationHex("elevation.surface.overlay"),
  surfaceSunken: elevationHex("elevation.surface.sunken"),
  textPrimary: rootsyColorHex("bruma", "900"),
  textMuted: rootsyColorHex("bruma", "500"),
  textLabel: rootsyColorHex("bruma", "700"),
  savia600: rootsyColorHex("savia", "600"),
  focusRing: `0 0 0 2px color-mix(in srgb, ${borderHex("color.border.focused")} 45%, transparent)`,
  errorRing: `0 0 0 2px color-mix(in srgb, ${semanticHex("status-danger")} 25%, transparent)`,
} as const
