/**
 * Sistema banner / inline feedback Rootsy — fuente de verdad del design system.
 * Derivado de: color semántico · border · radius · spacing · elevation · tipografía.
 */

import { ROOTSY_BORDER_COLOR_TOKENS } from "@/app/library/border/rootsyBorderSystem"
import { ROOTSY_SEMANTIC_TOKENS } from "@/app/library/color/rootsyColorSystem"
import { ROOTSY_ELEVATION_SURFACES_LIGHT } from "@/app/library/elevation/rootsyElevationSystem"
import { ROOTSY_RADIUS_TOKENS } from "@/app/library/radius/rootsyRadiusSystem"
import { ROOTSY_SPACING_SEMANTIC_ROLES } from "@/app/library/spacing/rootsySpacingScale"
import { rootsyColorHex, rootsySpacePx } from "@/lib/design-system"

const hx = rootsyColorHex

function borderHex(token: string): string {
  return ROOTSY_BORDER_COLOR_TOKENS.find((item) => item.token === token)!.value
}

function elevationHex(token: string): string {
  return ROOTSY_ELEVATION_SURFACES_LIGHT.find((item) => item.token === token)!.value
}

function radiusPx(id: "large" | "full"): number {
  return Number.parseInt(ROOTSY_RADIUS_TOKENS.find((item) => item.id === id)!.value, 10)
}

function semanticHex(id: string): string {
  return ROOTSY_SEMANTIC_TOKENS.find((item) => item.id === id)!.hex
}

function semanticTextHex(id: string): string {
  const row = ROOTSY_SEMANTIC_TOKENS.find((item) => item.id === id)!
  return "textHex" in row && row.textHex ? row.textHex : row.hex
}

function spacingRolePx(roleId: string): number {
  return ROOTSY_SPACING_SEMANTIC_ROLES.find((item) => item.id === roleId)!.px
}

export type BannerIntentId = "neutral" | "info" | "success" | "warning" | "danger"

export type BannerTone = "light" | "dark"

export type BannerDensityId = "default" | "compact"

export type BannerLayoutId = "message" | "title-message" | "with-action" | "dismissible"

export const ROOTSY_BANNER_MANIFESTO =
  "Un banner informa en contexto — borde bruma o tint semántico, sin sombra. radius.large · space.150 entre ícono y texto · body.small en mensaje. Savia para éxito/info positivo; funcional para aviso y peligro."

export const ROOTSY_BANNER_PRINCIPLES = [
  {
    title: "Sin elevación",
    detail: "Borde + tint — no shadow. La elevación vive en cards y modales, no en feedback inline.",
  },
  {
    title: "Intent semántico",
    detail: "neutral sunken · info/success savia · warning/danger funcional — tint 8% · borde 25%.",
  },
  {
    title: "Tipografía clara",
    detail: "Título font.body medium · bruma-900 — mensaje body.small · bruma-500 o textHex del intent.",
  },
  {
    title: "Densidad compartida",
    detail: "default space.150×200 · compact space.100×150 — alineado a field-stack y controles.",
  },
] as const

export const ROOTSY_BANNER_COLOR_TOKENS = [
  {
    role: "Neutral · fondo",
    token: "elevation.surface.sunken",
    hex: elevationHex("elevation.surface.sunken"),
  },
  {
    role: "Neutral · borde",
    token: "color.border",
    hex: borderHex("color.border"),
  },
  {
    role: "Semántico · éxito",
    token: "status-success",
    hex: semanticHex("status-success"),
  },
  {
    role: "Semántico · aviso",
    token: "status-warning",
    hex: semanticHex("status-warning"),
  },
  {
    role: "Semántico · peligro",
    token: "status-danger",
    hex: semanticHex("status-danger"),
  },
  {
    role: "Semántico · info",
    token: "status-info",
    hex: semanticHex("status-info"),
  },
  {
    role: "Título",
    token: "font.body · bruma-900",
    hex: hx("bruma", "900"),
  },
  {
    role: "Mensaje neutral",
    token: "body.small · bruma-500",
    hex: hx("bruma", "500"),
  },
] as const

export const ROOTSY_BANNER_INTENTS: {
  id: BannerIntentId
  token: string
  label: string
  semanticId?: "status-info" | "status-success" | "status-warning" | "status-danger"
  usage: string
}[] = [
  {
    id: "neutral",
    token: "banner.intent.neutral",
    label: "Neutral / hint",
    usage: "Contexto, tips, ayuda secundaria — sunken + color.border.",
  },
  {
    id: "info",
    token: "banner.intent.info",
    label: "Información",
    semanticId: "status-info",
    usage: "Estado en curso, contexto operativo — savia teal.",
  },
  {
    id: "success",
    token: "banner.intent.success",
    label: "Éxito",
    semanticId: "status-success",
    usage: "Confirmación, operación completada — savia 500/800.",
  },
  {
    id: "warning",
    token: "banner.intent.warning",
    label: "Aviso",
    semanticId: "status-warning",
    usage: "Atención requerida, datos incompletos — ámbar funcional.",
  },
  {
    id: "danger",
    token: "banner.intent.danger",
    label: "Error / peligro",
    semanticId: "status-danger",
    usage: "Fallo de validación, bloqueo — rojo funcional.",
  },
]

export const ROOTSY_BANNER_DENSITIES: {
  id: BannerDensityId
  token: string
  label: string
  paddingXToken: string
  paddingYToken: string
  usage: string
}[] = [
  {
    id: "default",
    token: "banner.density.default",
    label: "Default",
    paddingXToken: "space.200",
    paddingYToken: "space.150",
    usage: "Feedback estándar en formularios y paneles.",
  },
  {
    id: "compact",
    token: "banner.density.compact",
    label: "Compacto",
    paddingXToken: "space.150",
    paddingYToken: "space.100",
    usage: "Listados densos, hints bajo campos.",
  },
]

export const ROOTSY_BANNER_LAYOUTS: {
  id: BannerLayoutId
  token: string
  label: string
  usage: string
}[] = [
  {
    id: "message",
    token: "banner.layout.message",
    label: "Solo mensaje",
    usage: "Una línea — ícono opcional + body.small.",
  },
  {
    id: "title-message",
    token: "banner.layout.title-message",
    label: "Título + mensaje",
    usage: "Título medium + cuerpo — stack space.050.",
  },
  {
    id: "with-action",
    token: "banner.layout.with-action",
    label: "Con acción",
    usage: "Link o botón subtle alineado a la derecha.",
  },
  {
    id: "dismissible",
    token: "banner.layout.dismissible",
    label: "Descartable",
    usage: "Close space.400 — bruma-500, radius.full.",
  },
]

export const ROOTSY_BANNER_ANATOMY = {
  borderRadiusPx: radiusPx("large"),
  iconSlotPx: rootsySpacePx("200"),
  rowGapPx: rootsySpacePx("150"),
  titleMessageGapPx: rootsySpacePx("050"),
  dismissHitPx: rootsySpacePx("400"),
  dismissRadiusPx: radiusPx("full"),
  tintMixPercent: 8,
  borderMixPercent: 25,
  maxWidthPx: spacingRolePx("panel-padding") * 14,
} as const

export const ROOTSY_BANNER_SPECS = {
  neutral: {
    backgroundToken: "elevation.surface.sunken",
    borderToken: "color.border",
  },
  semantic: {
    backgroundMixToken: "elevation.surface.overlay",
    tintPercent: ROOTSY_BANNER_ANATOMY.tintMixPercent,
    borderMixPercent: ROOTSY_BANNER_ANATOMY.borderMixPercent,
  },
} as const

export function getBannerIntentSemanticId(
  intent: BannerIntentId,
): "status-info" | "status-success" | "status-warning" | "status-danger" | undefined {
  return ROOTSY_BANNER_INTENTS.find((item) => item.id === intent)?.semanticId
}

export function getBannerIntentAccentHex(
  intent: BannerIntentId,
  tone: BannerTone = "light",
): string {
  const semanticId = getBannerIntentSemanticId(intent)
  const accent = semanticId ? semanticHex(semanticId) : hx("bruma", "500")
  if (tone === "dark") {
    if (!semanticId) return "var(--rootsy-sombra-300)"
    if (semanticId === "status-success" || semanticId === "status-info") {
      return "var(--rootsy-savia-300)"
    }
    return `color-mix(in srgb, ${accent} 72%, white)`
  }
  return semanticId ? accent : hx("bruma", "500")
}

export function getBannerIntentMessageHex(
  intent: BannerIntentId,
  tone: BannerTone = "light",
): string {
  if (tone === "dark") {
    return getBannerIntentAccentHex(intent, "dark")
  }

  const semanticId = getBannerIntentSemanticId(intent)
  if (!semanticId) return hx("bruma", "500")

  // Banners: fondo tint claro — status-danger.textHex es blanco (botón sólido).
  if (semanticId === "status-danger") {
    return semanticHex("status-danger")
  }

  return semanticTextHex(semanticId)
}

export function getBannerSurfaceColors(
  intent: BannerIntentId,
  tone: BannerTone = "light",
): {
  backgroundColor: string
  border: string
} {
  if (tone === "dark") {
    if (intent === "neutral") {
      return {
        backgroundColor: "var(--rootsy-sombra-800)",
        border: "1px solid var(--rootsy-sombra-border)",
      }
    }

    const semanticId = getBannerIntentSemanticId(intent)!
    const accent = semanticHex(semanticId)
    return {
      backgroundColor: `color-mix(in srgb, ${accent} 18%, var(--rootsy-sombra-800))`,
      border: `1px solid color-mix(in srgb, ${accent} 32%, var(--rootsy-sombra-border))`,
    }
  }

  if (intent === "neutral") {
    return {
      backgroundColor: elevationHex(ROOTSY_BANNER_SPECS.neutral.backgroundToken),
      border: `1px solid ${borderHex(ROOTSY_BANNER_SPECS.neutral.borderToken)}`,
    }
  }

  const semanticId = getBannerIntentSemanticId(intent)!
  const accent = semanticHex(semanticId)
  const overlay = elevationHex(ROOTSY_BANNER_SPECS.semantic.backgroundMixToken)

  return {
    backgroundColor: `color-mix(in srgb, ${accent} ${ROOTSY_BANNER_SPECS.semantic.tintPercent}%, ${overlay})`,
    border: `1px solid color-mix(in srgb, ${accent} ${ROOTSY_BANNER_SPECS.semantic.borderMixPercent}%, ${borderHex("color.border")})`,
  }
}

export function getBannerDensityPadding(density: BannerDensityId): {
  paddingLeft: number
  paddingRight: number
  paddingTop: number
  paddingBottom: number
} {
  const spec = ROOTSY_BANNER_DENSITIES.find((item) => item.id === density)!
  const paddingX = rootsySpacePx(spec.paddingXToken.replace("space.", "") as "150" | "200")
  const paddingY = rootsySpacePx(spec.paddingYToken.replace("space.", "") as "100" | "150")

  return {
    paddingLeft: paddingX,
    paddingRight: paddingX,
    paddingTop: paddingY,
    paddingBottom: paddingY,
  }
}
