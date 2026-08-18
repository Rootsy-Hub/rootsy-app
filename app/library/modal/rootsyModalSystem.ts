/**
 * Sistema modal / dialog Rootsy — fuente de verdad del design system.
 * Derivado de: elevation · border · radius · spacing · color semántico · tipografía.
 */

import { ROOTSY_BORDER_COLOR_TOKENS } from "@/app/library/border/rootsyBorderSystem"
import { ROOTSY_SEMANTIC_TOKENS } from "@/app/library/color/rootsyColorSystem"
import {
  ROOTSY_ELEVATION_SHADOW_TOKENS,
  ROOTSY_ELEVATION_SURFACES_LIGHT,
} from "@/app/library/elevation/rootsyElevationSystem"
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

function elevationShadow(token: string): string {
  return ROOTSY_ELEVATION_SHADOW_TOKENS.find((item) => item.token === token)!.value
}

function radiusPx(id: "xlarge" | "xxlarge" | "full"): number {
  return Number.parseInt(ROOTSY_RADIUS_TOKENS.find((item) => item.id === id)!.value, 10)
}

function semanticHex(id: string): string {
  return ROOTSY_SEMANTIC_TOKENS.find((item) => item.id === id)!.hex
}

function spacingRolePx(roleId: string): number {
  return ROOTSY_SPACING_SEMANTIC_ROLES.find((item) => item.id === roleId)!.px
}

/** Padding horizontal de panel — role panel-padding · space.400. */
export const ROOTSY_MODAL_PANEL_PADDING_X_PX = spacingRolePx("panel-padding")

export type DialogKindId = "modal" | "alert"

export type ModalSurfaceSizeId = "default" | "wide" | "two-column"

export type ModalFooterVariantId = "none" | "single" | "dual" | "destructive-dual"

export type ModalBodyToneId = "default" | "compact" | "loading"

export type AlertDialogVariantId = "confirm" | "destructive" | "typed-confirmation"

export const ROOTSY_MODAL_MANIFESTO =
  "Un diálogo es un bloque vivo opaco — header y footer claros, body bruma. Sin vidrio ni borde: lo define elevation.shadow.overlay · radius.xxlarge. Tipografía heading.medium; danger funcional solo en botones."

export const ROOTSY_MODAL_PRINCIPLES = [
  {
    title: "Chrome claro",
    detail: "Header y footer blancos — el título y las acciones se leen en el claro.",
  },
  {
    title: "Body bruma",
    detail: "Valle con bruma y savia — el formulario vive en el clima, entre dos claros.",
  },
  {
    title: "Scrim suave",
    detail: "sombra-950 40% — atenúa la página, no la apaga.",
  },
  {
    title: "Alert compacto",
    detail: "Mensaje en el claro · footer alba · radius.xlarge · heading.small.",
  },
] as const

export const ROOTSY_MODAL_COLOR_TOKENS = [
  {
    role: "Panel · fondo",
    token: "elevation.surface.overlay",
    hex: elevationHex("elevation.surface.overlay"),
  },
  {
    role: "Body · fondo",
    token: "elevation.surface.overlay",
    hex: elevationHex("elevation.surface.overlay"),
  },
  {
    role: "Scrim",
    token: "scrim.sombra.950",
    hex: `color-mix(in srgb, ${hx("sombra", "950")} 40%, transparent)`,
  },
  {
    role: "Chrome · alba",
    token: "dialog.chrome.alba",
    hex: hx("bruma", "100"),
  },
  {
    role: "Divisor",
    token: "color.border",
    hex: borderHex("color.border"),
  },
  {
    role: "Título · modal",
    token: "font.heading.medium",
    hex: hx("bruma", "900"),
  },
  {
    role: "Título · alert",
    token: "font.heading.small",
    hex: hx("bruma", "900"),
  },
  {
    role: "Descripción",
    token: "body.small",
    hex: hx("bruma", "500"),
  },
  {
    role: "Alert · danger",
    token: "status-danger",
    hex: semanticHex("status-danger"),
  },
  {
    role: "Sombra panel",
    token: "elevation.shadow.overlay",
    hex: elevationShadow("elevation.shadow.overlay"),
  },
] as const

export const ROOTSY_MODAL_SURFACE_SIZES: {
  id: ModalSurfaceSizeId
  token: string
  label: string
  maxWidthPx: number
  maxHeightPx: number
  maxHeightToken: string
  usage: string
}[] = [
  {
    id: "default",
    token: "dialog.width.default",
    label: "Default",
    maxWidthPx: 448,
    maxHeightPx: rootsySpacePx("1000") * 8,
    maxHeightToken: "space.1000 × 8",
    usage: "Formularios cortos · confirmaciones.",
  },
  {
    id: "wide",
    token: "dialog.width.wide",
    label: "Wide",
    maxWidthPx: 512,
    maxHeightPx: rootsySpacePx("500") * 14,
    maxHeightToken: "space.500 × 14",
    usage: "Formularios con más campos.",
  },
  {
    id: "two-column",
    token: "dialog.width.two-column",
    label: "Dos columnas",
    maxWidthPx: 896,
    maxHeightPx: rootsySpacePx("500") * 21 + rootsySpacePx("300"),
    maxHeightToken: "space.500 × 21 + space.300",
    usage: "Upsert · datos + precios en grilla.",
  },
]

export const ROOTSY_MODAL_FOOTER_VARIANTS: {
  id: ModalFooterVariantId
  token: string
  label: string
  usage: string
}[] = [
  {
    id: "none",
    token: "dialog.footer.none",
    label: "Sin footer",
    usage: "Cierre con × o scrim — contenido informativo.",
  },
  {
    id: "single",
    token: "dialog.footer.single",
    label: "Una acción",
    usage: "Primary alineado a la derecha.",
  },
  {
    id: "dual",
    token: "dialog.footer.dual",
    label: "Cancelar + confirmar",
    usage: "Subtle izq · primary der — justify-between.",
  },
  {
    id: "destructive-dual",
    token: "dialog.footer.destructive",
    label: "Cancelar + eliminar",
    usage: "Subtle izq · danger der — acciones irreversibles.",
  },
]

export const ROOTSY_MODAL_BODY_TONES: {
  id: ModalBodyToneId
  token: string
  label: string
  usage: string
}[] = [
  {
    id: "default",
    token: "dialog.body.default",
    label: "Formulario",
    usage: "Body sunken · scroll vertical · campos space.500.",
  },
  {
    id: "compact",
    token: "dialog.body.compact",
    label: "Compacto",
    usage: "Body overlay · texto o resumen sin formulario.",
  },
  {
    id: "loading",
    token: "dialog.body.loading",
    label: "Cargando",
    usage: "Spinner centrado · min-height space.600 × 4.",
  },
]

export const ROOTSY_ALERT_DIALOG_VARIANTS: {
  id: AlertDialogVariantId
  token: string
  label: string
  usage: string
}[] = [
  {
    id: "confirm",
    token: "alert.confirm",
    label: "Confirmación",
    usage: "Mensaje + cancelar / confirmar.",
  },
  {
    id: "destructive",
    token: "alert.destructive",
    label: "Destructivo",
    usage: "status-danger solo en botón de acción.",
  },
  {
    id: "typed-confirmation",
    token: "alert.typed-confirmation",
    label: "Confirmación escrita",
    usage: "Campo form + danger disabled hasta match.",
  },
]

export const ROOTSY_DIALOG_KINDS: {
  id: DialogKindId
  token: string
  label: string
  radiusToken: string
  titleToken: string
  usage: string
}[] = [
  {
    id: "modal",
    token: "dialog.modal",
    label: "Modal",
    radiusToken: "radius.xxlarge",
    titleToken: "font.heading.medium",
    usage: "Header + body + footer · radius.xxlarge · shadow.overlay.",
  },
  {
    id: "alert",
    token: "dialog.alert",
    label: "Alert dialog",
    radiusToken: "radius.xlarge",
    titleToken: "font.heading.small",
    usage: "Shell compacto · radius.xlarge · una columna de contenido.",
  },
]

export const ROOTSY_MODAL_ANATOMY = {
  scrimToken: "scrim.sombra.950",
  panelPaddingRole: "panel-padding",
  panelPaddingXToken: "space.400",
  panelPaddingXPx: ROOTSY_MODAL_PANEL_PADDING_X_PX,
  headerPaddingTopToken: "space.400",
  headerPaddingBottomToken: "space.200",
  headerGapToken: "space.100",
  bodyPaddingYToken: "space.200",
  footerPaddingYToken: "space.150",
  footerGapToken: "space.150",
  contentGapToken: "space.150",
  closeHitToken: "space.400",
  closeHitPx: rootsySpacePx("400"),
  closeRadiusToken: "radius.full",
  previewMinHeightModalPx: rootsySpacePx("800") * 5,
  previewMinHeightAlertPx: rootsySpacePx("800") * 4,
  zIndex: 500,
} as const

export const ROOTSY_MODAL_SPECS = {
  modal: {
    radiusToken: "radius.xxlarge",
    radiusPx: radiusPx("xxlarge"),
    shadowToken: "elevation.shadow.overlay",
    surfaceToken: "elevation.surface.overlay",
    bodySurfaceToken: "elevation.surface.overlay",
    titleToken: "font.heading.medium",
  },
  alert: {
    radiusToken: "radius.xlarge",
    radiusPx: radiusPx("xlarge"),
    shadowToken: "elevation.shadow.overlay",
    surfaceToken: "elevation.surface.overlay",
    maxWidthPx: 448,
    titleToken: "font.heading.small",
  },
  loading: {
    minHeightPx: rootsySpacePx("600") * 4,
    minHeightToken: "space.600 × 4",
  },
  spinner: {
    sizeToken: "space.400",
    sizePx: rootsySpacePx("400"),
    borderWidthPx: 2,
    borderWidthToken: "border.width.selected",
  },
} as const

export const MODAL_RELATED_LINKS = [
  { sectionId: "elevation", label: "Elevación", hint: "overlay · shadow.overlay." },
  { sectionId: "radius", label: "Radio", hint: "xxlarge modal · xlarge alert." },
  { sectionId: "spacing", label: "Espaciado", hint: "panel-padding · field-stack." },
  { sectionId: "typography", label: "Tipografía", hint: "heading.medium · body.small." },
  { sectionId: "motion", label: "Movimiento", hint: "motion.modal.enter 250ms." },
  { sectionId: "ui-components-buttons", label: "Botones UI", hint: "Footers dual y danger." },
  { sectionId: "ui-components-forms", label: "Formulario UI", hint: "Campos en body modal." },
] as const

export { spacingRolePx }
