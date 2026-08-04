import type { MenuSectionKey } from "@/lib/menuCatalog"
import { cn } from "@/lib/utils"

/** Scope Nature en menú — usar con menuNaturePalette.css (no afecta Stock ni otros workspaces). */
export const menuNatureShellClass = "menu-nature-shell rootsy-nature-palette"

type MenuIconGradientVariant = "default" | "dock" | "muted" | "overlay"

/** Sombra suave macOS — una sola capa, sin dramatismo. */
export const menuIconMacShadowClass =
  "shadow-[0_2px_6px_rgba(0,0,0,0.16)]"

export const menuIconMacHoverShadowClass =
  "group-hover:shadow-[0_3px_10px_rgba(0,0,0,0.2)]"

export const menuIconGlyphClass = "text-white/95"

/**
 * Gradientes suaves tipo macOS Big Sur — poco contraste, sin highlight extremo.
 */
const menuSectionIconGradientByVariant: Record<
  MenuSectionKey,
  Record<MenuIconGradientVariant, string>
> = {
  operar: {
    default: cn(
      "bg-gradient-to-br from-[color:var(--nature-canopy-400)] to-[color:var(--nature-canopy-600)]",
      menuIconMacShadowClass,
    ),
    dock: "bg-gradient-to-br from-[color:var(--nature-canopy-400)] to-[color:var(--nature-canopy-600)]",
    muted:
      "bg-gradient-to-br from-[color:var(--nature-canopy-400)]/50 to-[color:var(--nature-canopy-600)]/50 shadow-none",
    overlay:
      "bg-gradient-to-br from-[color:var(--nature-canopy-300)] to-[color:var(--nature-canopy-500)]",
  },
  administrar: {
    default: cn(
      "bg-gradient-to-br from-[#FBBF24] to-[#D97706]",
      menuIconMacShadowClass,
    ),
    dock: "bg-gradient-to-br from-[#FBBF24] to-[#D97706]",
    muted:
      "bg-gradient-to-br from-[#FBBF24]/50 to-[#D97706]/50 shadow-none",
    overlay: "bg-gradient-to-br from-[#FCD34D] to-[#E08E0B]",
  },
  configurar: {
    default: cn(
      "bg-gradient-to-br from-[color:var(--nature-dusk-400)] to-[color:var(--nature-dusk-700)]",
      menuIconMacShadowClass,
    ),
    dock: "bg-gradient-to-br from-[color:var(--nature-dusk-400)] to-[color:var(--nature-dusk-700)]",
    muted:
      "bg-gradient-to-br from-[color:var(--nature-dusk-400)]/50 to-[color:var(--nature-dusk-700)]/50 shadow-none",
    overlay:
      "bg-gradient-to-br from-[color:var(--nature-dusk-300)] to-[color:var(--nature-dusk-500)]",
  },
}

/** @deprecated macOS flat — sin bloom en hover */
const menuSectionIconHoverGlowClass: Record<MenuSectionKey, string> = {
  operar: "",
  administrar: "",
  configurar: "",
}

export function menuIconGradientForSection(
  section: MenuSectionKey,
  variant: MenuIconGradientVariant = "default",
): string {
  return menuSectionIconGradientByVariant[section][variant]
}

export function menuIconHoverGlowForSection(section: MenuSectionKey): string {
  return menuSectionIconHoverGlowClass[section]
}

export function menuIconHoverShadowForSection(_section: MenuSectionKey): string {
  return menuIconMacHoverShadowClass
}

export const menuAmbientTopGlowClass =
  "bg-[color:var(--nature-canopy-600)]/5 blur-[120px]"

export const menuVignetteClass =
  "bg-[radial-gradient(ellipse_at_center,transparent_0%,color-mix(in_srgb,var(--nature-night-950)_70%,transparent)_100%)]"

export const menuVignetteSoftClass =
  "bg-[radial-gradient(ellipse_at_center,transparent_0%,color-mix(in_srgb,var(--nature-night-950)_55%,transparent)_100%)]"

export const menuRoleLabelClass =
  "text-[color:var(--nature-canopy-300)]"

export const menuBadgeHotClass =
  "animate-pulse bg-gradient-to-r from-[color:var(--nature-autumn-500)] to-[color:var(--nature-fire-500)] text-white"

export const menuBadgeDefaultClass =
  "bg-gradient-to-r from-[color:var(--nature-ember-600)] to-[color:var(--nature-ember-500)] text-white"

export const menuDockEditBadgeClass =
  "bg-white text-[color:var(--nature-earth-800)] ring-black/10"

export const menuDockEditDoneIconClass = "text-[color:var(--nature-earth-900)]"

/** @deprecated Usar menuIconGradientForSection */
export const menuIconGradientClass = menuSectionIconGradientByVariant.operar.default

/** @deprecated Usar menuIconGradientForSection */
export const menuIconGradientDockClass = menuSectionIconGradientByVariant.operar.dock

/** @deprecated Usar menuIconGradientForSection */
export const menuIconGradientMutedClass = menuSectionIconGradientByVariant.operar.muted

/** @deprecated Usar menuIconGradientForSection */
export const menuIconDragOverlayClass = menuSectionIconGradientByVariant.operar.overlay

/** @deprecated Usar menuIconHoverGlowForSection */
export const menuIconHoverGlowClass = menuSectionIconHoverGlowClass.operar

/** @deprecated Usar menuIconHoverShadowForSection */
export const menuIconHoverShadowClass = menuIconMacHoverShadowClass
