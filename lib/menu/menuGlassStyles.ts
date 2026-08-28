import type { MenuPlanetRealm } from "@/lib/menu/menuHoloStyles"
import { cn } from "@/lib/utils"

export type MenuGlassIconVariant = "default" | "dock" | "muted" | "overlay" | "placed"

export function menuGlassIconShellForSection(
  section: MenuPlanetRealm,
  variant: MenuGlassIconVariant = "default",
  interactive = false,
): string {
  return cn(
    "menu-planet-glass",
    `menu-planet-glass--${section}`,
    variant !== "default" && `menu-planet-glass--${variant}`,
    interactive && "menu-planet-glass--interactive",
  )
}

/** Ícono del cristal — tinta del mundo Herramientas. */
export const menuGlassGlyphClass = cn(
  "relative z-[3] shrink-0 stroke-[2] text-[var(--glass-ink,#e0feff)]",
  "[stroke-linecap:round] [stroke-linejoin:round]",
  "[filter:drop-shadow(0_1px_1px_rgb(0_11_21/0.32))]",
)

export const menuGlassLabelClass = cn(
  "text-xs font-normal leading-tight tracking-[0.01em] antialiased",
  "text-[var(--rootsy-blanco)]",
)
