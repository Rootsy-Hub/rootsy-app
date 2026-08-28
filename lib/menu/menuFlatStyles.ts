import type { MenuPlanetRealm } from "@/lib/menu/menuHoloStyles"
import { cn } from "@/lib/utils"

export type MenuPlanetFinish = "holo" | "flat" | "piedra" | "glass"

export type MenuFlatIconVariant = "default" | "dock" | "muted" | "overlay" | "placed"

export function menuFlatIconShellForSection(
  section: MenuPlanetRealm,
  variant: MenuFlatIconVariant = "default",
  interactive = false,
): string {
  return cn(
    "menu-planet-flat",
    `menu-planet-flat--${section}`,
    variant !== "default" && `menu-planet-flat--${variant}`,
    interactive && "menu-planet-flat--interactive",
  )
}

/** Ícono de tecla — blanco nítido, sin halo. */
export const menuFlatGlyphClass = cn(
  "relative z-[1] shrink-0 stroke-[2] text-[var(--rootsy-blanco)]",
  "[stroke-linecap:round] [stroke-linejoin:round]",
)

export const menuFlatLabelClass = cn(
  "text-xs font-normal leading-tight tracking-[0.01em] antialiased",
  "text-[var(--rootsy-blanco)]",
)
