import type { MenuPlanetRealm } from "@/lib/menu/menuHoloStyles"
import { cn } from "@/lib/utils"

export type MenuPiedraIconVariant = "default" | "dock" | "muted" | "overlay" | "placed"

const PIEDRA_CUTS = ["a", "b", "c", "d", "e", "f"] as const

/** Corte del canto — cada semilla cae en una silueta distinta del lecho. */
export function menuPiedraCutClass(seed: string): string {
  let n = 5381
  for (let i = 0; i < seed.length; i += 1) {
    n = Math.imul(n, 33) ^ seed.charCodeAt(i)
  }
  return `menu-planet-piedra--cut-${PIEDRA_CUTS[Math.abs(n) % PIEDRA_CUTS.length]}`
}

export function menuPiedraIconShellForSection(
  section: MenuPlanetRealm,
  variant: MenuPiedraIconVariant = "default",
  interactive = false,
  seed?: string,
): string {
  return cn(
    "menu-planet-piedra",
    `menu-planet-piedra--${section}`,
    seed && menuPiedraCutClass(seed),
    variant !== "default" && `menu-planet-piedra--${variant}`,
    interactive && "menu-planet-piedra--interactive",
  )
}

/** Ícono tatuado — tinta en el mineral, grano por encima. */
export const menuPiedraGlyphClass = cn(
  "menu-planet-piedra-glyph",
  "relative z-[1] shrink-0 stroke-[2]",
  "[stroke-linecap:round] [stroke-linejoin:round]",
)

export const menuPiedraLabelClass = cn(
  "text-xs font-normal leading-tight tracking-[0.01em] antialiased",
  "text-[var(--rootsy-blanco)]",
)
