import type { MenuSectionKey } from "@/lib/menuCatalog"
import { cn } from "@/lib/utils"

/** Scope del menú — tokens de mundos (éter · savia · cielo · suelo). */
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
 * Tres mundos del menú: savia · cielo · suelo.
 */
const menuSectionIconGradientByVariant: Record<
  MenuSectionKey,
  Record<MenuIconGradientVariant, string>
> = {
  operar: {
    default: cn(
      "bg-gradient-to-br from-[color:var(--rootsy-savia-400)] to-[color:var(--rootsy-savia-600)]",
      menuIconMacShadowClass,
    ),
    dock: "bg-gradient-to-br from-[color:var(--rootsy-savia-400)] to-[color:var(--rootsy-savia-600)]",
    muted:
      "bg-gradient-to-br from-[color:var(--rootsy-savia-400)]/50 to-[color:var(--rootsy-savia-600)]/50 shadow-none",
    overlay:
      "bg-gradient-to-br from-[color:var(--rootsy-savia-300)] to-[color:var(--rootsy-savia-500)]",
  },
  administrar: {
    default: cn(
      "bg-gradient-to-br from-[color:var(--rootsy-cielo-400)] to-[color:var(--rootsy-cielo-700)]",
      menuIconMacShadowClass,
    ),
    dock: "bg-gradient-to-br from-[color:var(--rootsy-cielo-400)] to-[color:var(--rootsy-cielo-700)]",
    muted:
      "bg-gradient-to-br from-[color:var(--rootsy-cielo-400)]/50 to-[color:var(--rootsy-cielo-700)]/50 shadow-none",
    overlay:
      "bg-gradient-to-br from-[color:var(--rootsy-cielo-400)] to-[color:var(--rootsy-cielo-600)]",
  },
  configurar: {
    default: cn(
      "bg-gradient-to-br from-[color:var(--rootsy-suelo-400)] to-[color:var(--rootsy-suelo-700)]",
      menuIconMacShadowClass,
    ),
    dock: "bg-gradient-to-br from-[color:var(--rootsy-suelo-400)] to-[color:var(--rootsy-suelo-700)]",
    muted:
      "bg-gradient-to-br from-[color:var(--rootsy-suelo-400)]/50 to-[color:var(--rootsy-suelo-700)]/50 shadow-none",
    overlay:
      "bg-gradient-to-br from-[color:var(--rootsy-suelo-300)] to-[color:var(--rootsy-suelo-600)]",
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
  "bg-[radial-gradient(ellipse_at_center,color-mix(in_srgb,var(--rootsy-eter-100)_6%,transparent)_0%,transparent_72%)]"

/** Resplandor planetario — el mundo activo ilumina el éter. */
const menuPlanetAmbientBySection: Record<MenuSectionKey, string> = {
  operar:
    "bg-[radial-gradient(ellipse_at_center,color-mix(in_srgb,var(--rootsy-savia-500)_20%,transparent)_0%,color-mix(in_srgb,var(--rootsy-savia-800)_8%,transparent)_38%,transparent_72%)]",
  administrar:
    "bg-[radial-gradient(ellipse_at_center,color-mix(in_srgb,var(--rootsy-cielo-500)_20%,transparent)_0%,color-mix(in_srgb,var(--rootsy-cielo-700)_8%,transparent)_38%,transparent_72%)]",
  configurar:
    "bg-[radial-gradient(ellipse_at_center,color-mix(in_srgb,var(--rootsy-suelo-400)_20%,transparent)_0%,color-mix(in_srgb,var(--rootsy-suelo-800)_8%,transparent)_38%,transparent_72%)]",
}

/** Orbes fijos — los tres mundos siempre presentes en el éter. */
const menuPlanetOrbBySection: Record<MenuSectionKey, string> = {
  operar: "bg-[color-mix(in_srgb,var(--rootsy-savia-500)_14%,transparent)]",
  administrar: "bg-[color-mix(in_srgb,var(--rootsy-cielo-500)_12%,transparent)]",
  configurar: "bg-[color-mix(in_srgb,var(--rootsy-suelo-400)_12%,transparent)]",
}

export function menuPlanetAmbientWashClass(section: MenuSectionKey): string {
  return menuPlanetAmbientBySection[section]
}

export function menuPlanetOrbClass(section: MenuSectionKey): string {
  return menuPlanetOrbBySection[section]
}

export const menuVignetteClass =
  "bg-[radial-gradient(ellipse_at_center,transparent_0%,color-mix(in_srgb,var(--rootsy-eter-950)_62%,transparent)_100%)]"

export const menuVignetteSoftClass =
  "bg-[radial-gradient(ellipse_at_center,transparent_0%,color-mix(in_srgb,var(--rootsy-eter-950)_58%,transparent)_100%)]"

/** Home — armonía de savia, cielo y suelo en el éter. */
export const homeHarmonyWashClass =
  "bg-[radial-gradient(ellipse_90%_75%_at_50%_52%,color-mix(in_srgb,var(--rootsy-savia-500)_16%,transparent)_0%,color-mix(in_srgb,var(--rootsy-cielo-500)_10%,transparent)_40%,color-mix(in_srgb,var(--rootsy-suelo-400)_11%,transparent)_62%,transparent_78%)]"

/** Halo local — el planeta ilumina su claro en el éter. */
const homePlanetHaloBySection: Record<MenuSectionKey, string> = {
  operar:
    "bg-[radial-gradient(circle,color-mix(in_srgb,var(--rootsy-savia-500)_42%,transparent)_0%,color-mix(in_srgb,var(--rootsy-savia-800)_14%,transparent)_48%,transparent_74%)]",
  administrar:
    "bg-[radial-gradient(circle,color-mix(in_srgb,var(--rootsy-cielo-500)_38%,transparent)_0%,color-mix(in_srgb,var(--rootsy-cielo-700)_12%,transparent)_48%,transparent_74%)]",
  configurar:
    "bg-[radial-gradient(circle,color-mix(in_srgb,var(--rootsy-suelo-400)_38%,transparent)_0%,color-mix(in_srgb,var(--rootsy-suelo-800)_12%,transparent)_48%,transparent_74%)]",
}

export function homePlanetHaloClass(section: MenuSectionKey): string {
  return homePlanetHaloBySection[section]
}

/** Horizonte — suelo y cielo se encuentran abajo. */
export const homeHorizonGlowClass =
  "bg-[radial-gradient(ellipse_130%_90%_at_50%_100%,color-mix(in_srgb,var(--rootsy-suelo-400)_12%,transparent)_0%,color-mix(in_srgb,var(--rootsy-cielo-500)_7%,transparent)_38%,transparent_68%)]"

/** Viñeta más abierta — deja respirar la luz. */
export const homeVignetteClass =
  "bg-[radial-gradient(ellipse_at_center,transparent_0%,color-mix(in_srgb,var(--rootsy-eter-950)_46%,transparent)_100%)]"

export const menuRoleLabelClass =
  "text-[color:var(--rootsy-savia-300)]"

export const menuBadgeHotClass =
  "animate-pulse bg-gradient-to-r from-[color:var(--rootsy-sol-500)] to-[color:var(--rootsy-sol-600)] text-[color:var(--rootsy-sol-800)]"

export const menuBadgeDefaultClass =
  "bg-gradient-to-r from-[#DC2626] to-[#EF4444] text-white"

/** Conteo plano — un aviso, un color, se lee al toque. */
export const menuNotificationCountClass = cn(
  "bg-[color:var(--color-status-danger,#DC2626)] text-white",
)

export const menuDockEditBadgeClass =
  "bg-white text-[color:var(--rootsy-bruma-900)] ring-black/10"

export const menuDockEditDoneIconClass = "text-[color:var(--rootsy-bruma-900)]"

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
