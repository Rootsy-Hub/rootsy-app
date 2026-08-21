import { cn } from "@/lib/utils"

/** Éter — velo sobre el espacio fuera del planeta. */
export const menuHeaderEntityVeilClass =
  "pointer-events-none absolute inset-0 bg-[linear-gradient(168deg,rgba(255,255,255,0.03)_0%,transparent_42%)]"

/** Humedad del suelo — brillo oscuro, casi negro. */
export const menuFooterEntityVeilClass =
  "pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--rootsy-savia-800)_8%,transparent)_0%,transparent_40%)]"

/** Banda instalada — éter arriba, suelo abajo. */
export const menuHeaderEntityClass = cn(
  "menu-header-entity relative z-20 w-full shrink-0",
)

const menuUniverseEntityBodySurfaceClass = cn(
  "menu-header-entity-body relative w-full overflow-hidden",
  "bg-[linear-gradient(168deg,var(--rootsy-eter-800)_0%,var(--rootsy-eter-900)_52%,var(--rootsy-eter-950)_100%)]",
  "backdrop-blur-[10px] backdrop-saturate-[1.01]",
  "shadow-[inset_0_1px_0_color-mix(in_srgb,var(--rootsy-eter-100)_10%,transparent),inset_0_-16px_28px_color-mix(in_srgb,var(--rootsy-eter-950)_28%,transparent)]",
)

export const menuHeaderEntityBodyClass = cn(
  menuUniverseEntityBodySurfaceClass,
  "border-b border-[color-mix(in_srgb,var(--rootsy-eter-100)_10%,transparent)]",
)

/** Tierra mojada — humus oliva, humedad de savia. */
export const menuFooterEntityBodyClass = cn(
  "menu-header-entity-body menu-header-entity-body--floor relative w-full overflow-hidden",
  "bg-[linear-gradient(180deg,color-mix(in_srgb,var(--rootsy-suelo-900)_56%,var(--rootsy-sombra-900))_0%,color-mix(in_srgb,var(--rootsy-suelo-900)_28%,var(--rootsy-sombra-950))_52%,color-mix(in_srgb,var(--rootsy-savia-900)_22%,var(--rootsy-sombra-950))_100%)]",
  "backdrop-blur-[8px] backdrop-saturate-[1.04]",
  "border-t border-[color-mix(in_srgb,var(--rootsy-suelo-700)_32%,transparent)]",
  "shadow-[inset_0_1px_0_color-mix(in_srgb,var(--rootsy-suelo-400)_14%,transparent),inset_0_18px_36px_color-mix(in_srgb,var(--rootsy-savia-950)_26%,transparent)]",
)
