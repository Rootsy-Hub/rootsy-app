import {
  ROOTSY_LAYOUTS_MODULE_BACKDROP,
  ROOTSY_LAYOUTS_MODULE_BACKDROP_FALLBACK,
  ROOTSY_LAYOUTS_MODULE_HEADER,
  ROOTSY_LAYOUTS_MODULE_SHELL,
} from "@/app/library/layouts/rootsyLayoutsModuleSystem"
import { ROOTSY_LAYOUTS_TABLES_ANATOMY } from "@/app/library/layouts/rootsyLayoutsTablesSystem"
import { rootsyColorHex } from "@/lib/design-system"

const hx = rootsyColorHex

const DEMO_POP_BG =
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1600&q=80&auto=format&fit=crop"

export type LayoutsModuleBackdropMode = "photo-only" | "photo-layers" | "fallback"

export function getLayoutsModuleBackdropLayerStyles(mode: LayoutsModuleBackdropMode = "fallback") {
  return {
    shell: {
      position: "absolute" as const,
      inset: 0,
      overflow: "hidden" as const,
      pointerEvents: "none" as const,
      background:
        mode === "fallback" ? ROOTSY_LAYOUTS_MODULE_BACKDROP_FALLBACK.baseGradient : undefined,
    },
    brumaMist:
      mode === "fallback"
        ? {
            position: "absolute" as const,
            inset: 0,
            background: ROOTSY_LAYOUTS_MODULE_BACKDROP_FALLBACK.brumaMist,
          }
        : undefined,
    ambient: {
      position: "absolute" as const,
      top: 0,
      left: "50%",
      transform: "translateX(-50%)",
      width: ROOTSY_LAYOUTS_MODULE_BACKDROP.ambientGlowWidthPx,
      height: ROOTSY_LAYOUTS_MODULE_BACKDROP.ambientGlowHeightPx,
      borderRadius: 9999,
      filter: `blur(${ROOTSY_LAYOUTS_MODULE_BACKDROP.ambientBlurPx}px)`,
      background: ROOTSY_LAYOUTS_MODULE_BACKDROP_FALLBACK.saviaAmbient,
    },
    vignette: {
      position: "absolute" as const,
      inset: 0,
      background: ROOTSY_LAYOUTS_MODULE_BACKDROP_FALLBACK.vignette,
    },
  }
}

export function getLayoutsModuleShellGridStyle() {
  return {
    display: "grid" as const,
    gridTemplateRows: `${ROOTSY_LAYOUTS_MODULE_SHELL.headerHeightPx}px minmax(0, 1fr)`,
    height: "100%",
    minHeight: 0,
    position: "relative" as const,
    zIndex: 1,
  }
}

export function getLayoutsModuleHeaderInnerStyle() {
  return {
    height: ROOTSY_LAYOUTS_MODULE_HEADER.heightPx,
    minHeight: ROOTSY_LAYOUTS_MODULE_HEADER.heightPx,
    maxHeight: ROOTSY_LAYOUTS_MODULE_HEADER.heightPx,
  } as const
}

export function getLayoutsModuleContentRowStyle(background = ROOTSY_LAYOUTS_MODULE_SHELL.contentBackground) {
  return {
    minHeight: 0,
    overflow: "hidden" as const,
    backgroundColor: background,
  }
}

export function getLayoutsModuleWireframeContentStyle() {
  return getLayoutsModuleContentRowStyle(hx("bruma", "50"))
}

export function getLayoutsModuleDemoPopBackgroundUrl() {
  return DEMO_POP_BG
}

export function getLayoutsModuleContentRowFrameStyle() {
  return {
    minHeight: 0,
    flex: 1,
    backgroundColor: ROOTSY_LAYOUTS_MODULE_SHELL.contentBackground,
    borderTop: `1px solid ${hx("bruma", "200")}`,
  }
}

export const LAYOUTS_MODULE_BACKDROP_SPEC_ROWS = [
  { token: "scope", value: "menu-nature-shell · menuNaturePalette.css" },
  { token: "pop.backgroundImage", value: "cover · center · opacity 40%" },
  { token: "backdrop.scrim", value: "background / 32% (nature-night-950)" },
  { token: "backdrop.ambient", value: "nature-canopy-600 / 5% · blur 120px" },
  { token: "backdrop.vignette", value: "nature-night-950 / 50% radial" },
] as const

export const LAYOUTS_MODULE_BACKDROP_FALLBACK_SPEC_ROWS = [
  { token: "backdrop.fallback.base", value: "sombra-950 → sombra-800 gradient" },
  { token: "backdrop.fallback.mist", value: "bruma-100 radial · 14%" },
  { token: "backdrop.fallback.ambient", value: "savia-600 / 8% · blur 120px" },
  { token: "backdrop.fallback.vignette", value: "sombra-950 / 55% radial" },
] as const

export const LAYOUTS_MODULE_HEADER_SPEC_ROWS = [
  {
    token: "layout.module.header",
    value: `${ROOTSY_LAYOUTS_MODULE_HEADER.heightPx}px · ${ROOTSY_LAYOUTS_MODULE_HEADER.heightClass} · ${ROOTSY_LAYOUTS_MODULE_HEADER.heightToken}`,
  },
  { token: "header.inner", value: ROOTSY_LAYOUTS_MODULE_HEADER.innerGridClass },
  { token: "header.glass", value: ROOTSY_LAYOUTS_MODULE_HEADER.chromeFundamentalsToken },
  {
    token: "header.glass.supports",
    value: ROOTSY_LAYOUTS_MODULE_HEADER.chromeFundamentalsSupportsToken,
  },
  { token: "header.border", value: ROOTSY_LAYOUTS_MODULE_HEADER.borderFundamentalsToken },
  {
    token: "header.controls",
    value: ROOTSY_LAYOUTS_MODULE_HEADER.controlsFundamentalsVariant,
  },
  {
    token: "header.controls.component",
    value: "RootsIconButton · theme pos · ghost | primary",
  },
  {
    token: "header.typography",
    value: ROOTSY_LAYOUTS_MODULE_HEADER.typographyFundamentalsToken,
  },
] as const

export const LAYOUTS_MODULE_SHELL_SPEC_ROWS = [
  { token: ROOTSY_LAYOUTS_MODULE_SHELL.headerToken, value: "cristal sobre capa 1" },
  { token: ROOTSY_LAYOUTS_MODULE_SHELL.contentToken, value: ROOTSY_LAYOUTS_MODULE_SHELL.contentBackgroundToken },
  { token: "layout.module.grid", value: "grid-rows: header · content" },
] as const

export { ROOTSY_LAYOUTS_TABLES_ANATOMY }
