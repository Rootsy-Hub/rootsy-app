/**
 * Spec de superficie overlay — scrim · borde · sombra.
 * Fuente compartida Modales UI + overlays del producto.
 */

import {
  ROOTSY_MODAL_ANATOMY,
  ROOTSY_MODAL_SPECS,
} from "@/app/library/modal/rootsyModalSystem"
import { ROOTSY_BORDER_COLOR_TOKENS } from "@/app/library/border/rootsyBorderSystem"
import {
  ROOTSY_ELEVATION_SHADOW_TOKENS,
  ROOTSY_ELEVATION_SURFACES_LIGHT,
} from "@/app/library/elevation/rootsyElevationSystem"
import { ROOTSY_RADIUS_TOKENS } from "@/app/library/radius/rootsyRadiusSystem"
import { rootsyColorHex, rootsySpacePx } from "@/lib/design-system"

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

function radiusPx(id: "xlarge" | "xxlarge"): number {
  return Number.parseInt(ROOTSY_RADIUS_TOKENS.find((item) => item.id === id)!.value, 10)
}

export type OverlaySurfaceSpecRow = {
  role: string
  token: string
  value: string
  product?: string
}

/** Scrim — viewport completo al abrir modal / alert. */
export const MODAL_UI_SCRIM_SPEC = {
  token: ROOTSY_MODAL_ANATOMY.scrimToken,
  background: `color-mix(in srgb, ${hx("sombra", "950")} 40%, transparent)`,
  position: "fixed",
  inset: "0",
  zIndex: ROOTSY_MODAL_ANATOMY.zIndex,
  note:
    "Velo sombra-950 al 40% — atenúa la página, no la congela en cristal. Sin backdrop-blur en el scrim.",
} as const

/** Panel flotante — siempre emparejado surface.overlay + shadow.overlay. */
export const MODAL_UI_PANEL_SURFACE_SPEC = {
  surfaceToken: ROOTSY_MODAL_SPECS.modal.surfaceToken,
  surfaceValue: elevationHex(ROOTSY_MODAL_SPECS.modal.surfaceToken),
  borderToken: "none",
  borderWidthToken: "0",
  borderCss: "none",
  shadowToken: ROOTSY_MODAL_SPECS.modal.shadowToken,
  shadowValue: elevationShadow(ROOTSY_MODAL_SPECS.modal.shadowToken),
  pairRule: "elevation.surface.overlay + elevation.shadow.overlay — nunca mezclar con shadow.raised.",
  radiusModalToken: ROOTSY_MODAL_SPECS.modal.radiusToken,
  radiusModalPx: ROOTSY_MODAL_SPECS.modal.radiusPx,
  radiusAlertToken: ROOTSY_MODAL_SPECS.alert.radiusToken,
  radiusAlertPx: ROOTSY_MODAL_SPECS.alert.radiusPx,
  bodySunkenToken: ROOTSY_MODAL_SPECS.modal.bodySurfaceToken,
  bodySunkenValue: elevationHex(ROOTSY_MODAL_SPECS.modal.bodySurfaceToken),
  dividerToken: "color.border",
  dividerCss: `1px solid ${borderHex("color.border")}`,
} as const

export const MODAL_UI_OVERLAY_SPEC = {
  scrim: MODAL_UI_SCRIM_SPEC,
  panel: MODAL_UI_PANEL_SURFACE_SPEC,
} as const

export function getModalUiOverlaySpecRows(kind: "modal" | "alert" = "modal"): OverlaySurfaceSpecRow[] {
  const radius =
    kind === "modal"
      ? `${MODAL_UI_PANEL_SURFACE_SPEC.radiusModalToken} · ${MODAL_UI_PANEL_SURFACE_SPEC.radiusModalPx}px`
      : `${MODAL_UI_PANEL_SURFACE_SPEC.radiusAlertToken} · ${MODAL_UI_PANEL_SURFACE_SPEC.radiusAlertPx}px`

  return [
    {
      role: "Scrim · fondo",
      token: MODAL_UI_SCRIM_SPEC.token,
      value: MODAL_UI_SCRIM_SPEC.background,
      product: `fixed inset-0 · z-${MODAL_UI_SCRIM_SPEC.zIndex} · sin backdrop-blur`,
    },
    {
      role: "Panel · superficie",
      token: MODAL_UI_PANEL_SURFACE_SPEC.surfaceToken,
      value: MODAL_UI_PANEL_SURFACE_SPEC.surfaceValue,
      product: "bg-white · elevation.surface.overlay",
    },
    {
      role: "Panel · borde",
      token: MODAL_UI_PANEL_SURFACE_SPEC.borderToken,
      value: MODAL_UI_PANEL_SURFACE_SPEC.borderCss,
      product: "sin borde · el bloque lo dibuja la sombra",
    },
    {
      role: "Panel · sombra",
      token: MODAL_UI_PANEL_SURFACE_SPEC.shadowToken,
      value: MODAL_UI_PANEL_SURFACE_SPEC.shadowValue,
      product: "shadow-[elevation.shadow.overlay]",
    },
    {
      role: "Panel · radio",
      token: kind === "modal" ? MODAL_UI_PANEL_SURFACE_SPEC.radiusModalToken : MODAL_UI_PANEL_SURFACE_SPEC.radiusAlertToken,
      value: radius,
      product: kind === "modal" ? "rounded-[1.375rem]" : "rounded-xl",
    },
    ...(kind === "modal"
      ? [
          {
            role: "Clima · claro",
            token: "dialog.climate.valley",
            value: MODAL_UI_PANEL_SURFACE_SPEC.bodySunkenValue,
            product: "bruma + savia · un solo mundo en todo el bloque",
          } satisfies OverlaySurfaceSpecRow,
          {
            role: "Horizonte",
            token: "dialog.horizon.line",
            value: "savia-400 18% · bruma-200 · 76%",
            product: "velo header · suelo footer · sin banda alba",
          } satisfies OverlaySurfaceSpecRow,
        ]
      : [
          {
            role: "Horizonte footer",
            token: "dialog.horizon.line",
            value: "savia-400 18% · bruma-200 · 76%",
            product: "suelo de acompañamiento · mismo clima",
          } satisfies OverlaySurfaceSpecRow,
        ]),
  ]
}

/** Espacio extra bajo el panel para elevation.shadow.overlay (≈70px de blur). */
export const MODAL_UI_PREVIEW_SHADOW_BLEED_PX = 72

/** Altura mínima de preview en librería — evita recortes. */
export function getDialogPreviewMinHeightPx(
  kind: "modal" | "alert",
  options?: {
    size?: "default" | "wide" | "two-column"
    bodyTone?: "default" | "compact" | "loading"
    alertVariant?: "confirm" | "destructive" | "typed-confirmation"
  },
): number {
  if (kind === "alert") {
    if (options?.alertVariant === "typed-confirmation") return 560
    return 400
  }

  if (options?.size === "two-column") return 420
  if (options?.bodyTone === "loading") return 380
  if (options?.bodyTone === "compact") return 340
  return 460
}

export { radiusPx as modalUiRadiusPx }
