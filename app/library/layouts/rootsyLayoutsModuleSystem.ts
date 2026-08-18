/**
 * Layout módulo POP — fondo + grid header/contenido.
 * Espejo de PopWorkspaceBackdrop · DataWorkspaceLayout · menu/page.
 */

import { rootsyColorHex, rootsySpacePx } from "@/lib/design-system"

const hx = rootsyColorHex

export const ROOTSY_LAYOUTS_MODULE_MANIFESTO =
  "Módulos del POP — fondo POP a pantalla completa, header reutilizable y fila de contenido. Tablas · bloques · operaciones van dentro del contenido."

/** Capas del fondo con foto — espejo de menu/page · PopWorkspaceBackdrop · menuNatureStyles. */
export const ROOTSY_LAYOUTS_MODULE_BACKDROP = {
  scopeClass: "menu-nature-shell rootsy-nature-palette",
  paletteCss: "menuNaturePalette.css",
  /** Imagen del POP — cover centrado, pantalla completa. */
  imageObjectFit: "cover" as const,
  imageObjectPosition: "center" as const,
  imageOpacity: 0.4,
  /** Velo claro sobre la foto — usa --background del scope Nature. */
  scrimClass: "bg-background/32",
  /** Glow superior — nature-canopy (menuAmbientTopGlowClass). */
  ambientGlowToken: "nature-canopy-600 / 5%",
  ambientGlowWidthPx: 1000,
  ambientGlowHeightPx: 400,
  ambientBlurPx: 120,
  /** Viñeta perimetral — nature-night (menuVignetteClass). */
  vignetteToken: "nature-night-950 / 50% radial",
} as const

/** Sin imagen POP — gradiente sombra + bruma + savia (sin Nature). */
export const ROOTSY_LAYOUTS_MODULE_BACKDROP_FALLBACK = {
  baseGradient: `linear-gradient(165deg, ${hx("sombra", "950")} 0%, ${hx("sombra", "900")} 42%, ${hx("sombra", "800")} 100%)`,
  brumaMist: `radial-gradient(ellipse 85% 55% at 50% -8%, color-mix(in srgb, ${hx("bruma", "100")} 14%, transparent) 0%, transparent 68%)`,
  saviaAmbient: `color-mix(in srgb, ${hx("savia", "600")} 8%, transparent)`,
  vignette: `radial-gradient(ellipse at center, transparent 0%, color-mix(in srgb, ${hx("sombra", "950")} 55%, transparent) 100%)`,
} as const

/** Header módulo — mismo universo que el menú, más bajo para dejar aire al contenido. */
export const ROOTSY_LAYOUTS_MODULE_HEADER = {
  /** 68px · más bajo que home/menú (h-20) · Tailwind h-17 */
  heightPx: rootsySpacePx("800") + rootsySpacePx("050"),
  heightClass: "h-17",
  heightToken: "space.800 + space.050",
  innerGridClass:
    "grid h-full min-h-0 grid-cols-[minmax(0,1fr)_minmax(0,280px)_minmax(0,1fr)] items-center gap-4 px-6",
  chromeFundamentalsClass: "MenuHeaderEntity",
  chromeFundamentalsToken: "universo exterior · noche · estrellas · horizonte",
  chromeFundamentalsSupportsToken: "menu-header-entity-body · blur 10 · saturate 1.01",
  borderFundamentalsToken: "bruma 10% · puente al planeta",
  controlsFundamentalsVariant: "RootsIconButton · ghost · dark",
  actionsFundamentalsVariant: "RootsIconButton · pos outlined | primary",
  typographyFundamentalsToken: "menuRealmTitle · menuRealmMuted · rol dark",
  brandLogoClass: "size-9 rounded-xl",
  brandNameClass: "text-sm",
  brandAddressClass: "text-xs",
} as const

/** Grid de 2 filas — header fijo + contenido scrollable. */
export const ROOTSY_LAYOUTS_MODULE_SHELL = {
  headerHeightPx: ROOTSY_LAYOUTS_MODULE_HEADER.heightPx,
  headerToken: "layout.module.header · h-17 · universo menú",
  contentToken: "layout.module.content · flex-1 min-h-0",
  /** Default del row de contenido — excepciones documentadas por tipo. */
  contentBackground: hx("bruma", "50"),
  contentBackgroundToken: "elevation.surface.sunken · bruma-50",
} as const

export type LayoutsModuleContentTypeId = "tables" | "blocks" | "operar"

export const ROOTSY_LAYOUTS_MODULE_CONTENT_TYPES: Record<
  LayoutsModuleContentTypeId,
  { label: string; summary: string; librarySectionId: string }
> = {
  tables: {
    label: "Tablas",
    summary: "Filtros · tabla · footer paginador",
    librarySectionId: "layouts-tables",
  },
  blocks: {
    label: "Bloques",
    summary: "Grid de tarjetas — cuentas, cajas",
    librarySectionId: "layouts-blocks",
  },
  operar: {
    label: "Operar",
    summary: "Catálogo + toolbox + ticket — Vender, Mesas, Mostrador, Comprar",
    librarySectionId: "layouts-operar",
  },
}
