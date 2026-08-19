import { cn } from "@/lib/utils"

/** Universo exterior — noche profunda; la luz vive en las estrellas. */
export const menuHeaderEntityVeilClass =
  "pointer-events-none absolute inset-0 bg-[linear-gradient(168deg,rgba(255,255,255,0.03)_0%,transparent_42%)]"

/** Humedad del suelo — brillo oscuro, casi negro. */
export const menuFooterEntityVeilClass =
  "pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--rootsy-savia-800)_8%,transparent)_0%,transparent_40%)]"

/** Banda instalada — el espacio fuera del planeta. */
export const menuHeaderEntityClass = cn(
  "menu-header-entity relative z-20 w-full shrink-0",
)

const menuUniverseEntityBodySurfaceClass = cn(
  "menu-header-entity-body relative w-full overflow-hidden",
  "bg-[linear-gradient(168deg,rgba(4,10,14,0.94)_0%,rgba(2,6,10,0.97)_52%,rgba(1,3,6,0.99)_100%)]",
  "backdrop-blur-[10px] backdrop-saturate-[1.01]",
  "shadow-[inset_0_1px_0_rgba(255,255,255,0.1),inset_0_-16px_28px_rgba(0,0,0,0.28)]",
)

export const menuHeaderEntityBodyClass = cn(
  menuUniverseEntityBodySurfaceClass,
  "border-b border-[rgba(228,242,248,0.1)]",
)

/** Tierra empapada — casi negra, con humedad de savia. */
export const menuFooterEntityBodyClass = cn(
  "menu-header-entity-body menu-header-entity-body--floor relative w-full overflow-hidden",
  "bg-[linear-gradient(180deg,color-mix(in_srgb,var(--nature-earth-900,#292524)_52%,var(--rootsy-sombra-900))_0%,color-mix(in_srgb,var(--nature-earth-900,#292524)_22%,var(--rootsy-sombra-950))_55%,color-mix(in_srgb,var(--rootsy-savia-990)_38%,var(--rootsy-sombra-950))_100%)]",
  "backdrop-blur-[8px] backdrop-saturate-[1.04]",
  "border-t border-[color-mix(in_srgb,var(--nature-earth-800,#44403C)_28%,transparent)]",
  "shadow-[inset_0_1px_0_color-mix(in_srgb,var(--nature-earth-700,#57534E)_14%,transparent),inset_0_18px_36px_color-mix(in_srgb,var(--rootsy-savia-950)_22%,transparent)]",
)
