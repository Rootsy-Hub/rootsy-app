import type { MenuSectionKey } from "@/lib/menuCatalog"
import { cn } from "@/lib/utils"

/** Scope Nature en menú — usar con menuNaturePalette.css (no afecta Stock ni otros workspaces). */
export const menuNatureShellClass = "menu-nature-shell rootsy-nature-palette"

/** Cristal POP — misma regla CSS que header/dock del menú (menuNaturePalette.css). */
export const menuPopChromeClass = "menu-pop-chrome"

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
      "bg-gradient-to-br from-[color:var(--nature-sea-400)] to-[color:var(--nature-sea-700)]",
      menuIconMacShadowClass,
    ),
    dock: "bg-gradient-to-br from-[color:var(--nature-sea-400)] to-[color:var(--nature-sea-700)]",
    muted:
      "bg-gradient-to-br from-[color:var(--nature-sea-400)]/50 to-[color:var(--nature-sea-700)]/50 shadow-none",
    overlay: "bg-gradient-to-br from-[color:var(--nature-sea-300)] to-[color:var(--nature-sea-600)]",
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
  "bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.06)_0%,transparent_72%)]"

/** Resplandor planetario — el mundo activo ilumina el cielo del menú. */
const menuPlanetAmbientBySection: Record<MenuSectionKey, string> = {
  operar:
    "bg-[radial-gradient(ellipse_at_center,rgba(36,173,106,0.2)_0%,rgba(14,87,57,0.08)_38%,transparent_72%)]",
  administrar:
    "bg-[radial-gradient(ellipse_at_center,rgba(8,145,178,0.2)_0%,rgba(21,94,117,0.08)_38%,transparent_72%)]",
  configurar:
    "bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,0.2)_0%,rgba(76,29,149,0.08)_38%,transparent_72%)]",
}

/** Orbes fijos — los tres mundos siempre presentes en el firmamento. */
const menuPlanetOrbBySection: Record<MenuSectionKey, string> = {
  operar: "bg-[rgba(36,173,106,0.14)]",
  administrar: "bg-[rgba(8,145,178,0.12)]",
  configurar: "bg-[rgba(124,58,237,0.12)]",
}

export function menuPlanetAmbientWashClass(section: MenuSectionKey): string {
  return menuPlanetAmbientBySection[section]
}

export function menuPlanetOrbClass(section: MenuSectionKey): string {
  return menuPlanetOrbBySection[section]
}

export const menuVignetteClass =
  "bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(5,12,16,0.62)_100%)]"

export const menuVignetteSoftClass =
  "bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(5,12,16,0.58)_100%)]"

/** Home — armonía de los tres mundos en un mismo cielo. */
export const homeHarmonyWashClass =
  "bg-[radial-gradient(ellipse_90%_75%_at_50%_52%,rgba(36,173,106,0.16)_0%,rgba(8,145,178,0.1)_40%,rgba(124,58,237,0.11)_62%,transparent_78%)]"

/** Halo local — el planeta ilumina su claro en el firmamento. */
const homePlanetHaloBySection: Record<MenuSectionKey, string> = {
  operar:
    "bg-[radial-gradient(circle,rgba(36,173,106,0.42)_0%,rgba(14,87,57,0.14)_48%,transparent_74%)]",
  administrar:
    "bg-[radial-gradient(circle,rgba(8,145,178,0.38)_0%,rgba(21,94,117,0.12)_48%,transparent_74%)]",
  configurar:
    "bg-[radial-gradient(circle,rgba(124,58,237,0.38)_0%,rgba(76,29,149,0.12)_48%,transparent_74%)]",
}

export function homePlanetHaloClass(section: MenuSectionKey): string {
  return homePlanetHaloBySection[section]
}

/** Horizonte — tierra y cielo se encuentran abajo. */
export const homeHorizonGlowClass =
  "bg-[radial-gradient(ellipse_130%_90%_at_50%_100%,rgba(36,173,106,0.1)_0%,rgba(8,145,178,0.07)_38%,transparent_68%)]"

/** Viñeta más abierta — deja respirar la luz. */
export const homeVignetteClass =
  "bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(5,12,16,0.46)_100%)]"

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
