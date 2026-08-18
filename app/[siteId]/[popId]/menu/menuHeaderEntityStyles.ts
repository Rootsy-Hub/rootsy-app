import { cn } from "@/lib/utils"

/** Universo exterior — noche profunda; la luz vive en las estrellas. */
export const menuHeaderEntityVeilClass =
  "pointer-events-none absolute inset-0 bg-[linear-gradient(168deg,rgba(255,255,255,0.03)_0%,transparent_42%)]"

/** Banda instalada — el espacio fuera del planeta. */
export const menuHeaderEntityClass = cn(
  "menu-header-entity relative z-20 w-full shrink-0",
)

const menuUniverseEntityBodySurfaceClass = cn(
  "menu-header-entity-body menu-planet-life relative w-full overflow-hidden",
  "bg-[linear-gradient(168deg,rgba(4,10,14,0.94)_0%,rgba(2,6,10,0.97)_52%,rgba(1,3,6,0.99)_100%)]",
  "backdrop-blur-[10px] backdrop-saturate-[1.01]",
  "shadow-[inset_0_1px_0_rgba(255,255,255,0.1),inset_0_-16px_28px_rgba(0,0,0,0.28)]",
)

export const menuHeaderEntityBodyClass = cn(
  menuUniverseEntityBodySurfaceClass,
  "border-b border-[rgba(228,242,248,0.1)]",
)

/** Misma noche, en el suelo — el horizonte mira a la hoja. */
export const menuFooterEntityBodyClass = cn(
  menuUniverseEntityBodySurfaceClass,
  "menu-header-entity-body--floor",
  "border-t border-[rgba(228,242,248,0.1)]",
)
