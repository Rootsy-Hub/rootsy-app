import { cn } from "@/lib/utils"

/**
 * IconButton · gama noche — cristal sobre sombra, hairline frío, iconos neutros.
 */

export const rootsIconButtonNightFocusRingClass =
  "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[color-mix(in_srgb,#ffffff_14%,var(--rootsy-savia-300)_6%)]"

/** Superficie demo / docs — éter sin verde dominante. */
export const rootsIconButtonNightDemoSurfaceClass = cn(
  "border-[color-mix(in_srgb,#ffffff_5%,var(--rootsy-eter-700)_32%)]",
  "bg-[radial-gradient(ellipse_120%_70%_at_50%_-30%,color-mix(in_srgb,var(--rootsy-eter-800)_35%,transparent),transparent_58%),linear-gradient(180deg,var(--rootsy-eter-950)_0%,var(--rootsy-eter-900)_42%,var(--rootsy-eter-800)_100%)]",
)

/** Chrome con borde — tone=dark · secondary surface=dark. */
export const rootsIconButtonNightChromeClass = cn(
  "border-[color-mix(in_srgb,#ffffff_8%,var(--rootsy-sombra-600)_26%)]",
  "bg-[color-mix(in_srgb,var(--rootsy-sombra-900)_52%,transparent)]",
  "shadow-[inset_0_1px_0_color-mix(in_srgb,#ffffff_7%,transparent)]",
  "backdrop-blur-xl backdrop-saturate-150",
  "supports-[backdrop-filter]:bg-[color-mix(in_srgb,var(--rootsy-sombra-900)_40%,transparent)]",
  "text-[color-mix(in_srgb,#ffffff_56%,var(--rootsy-bruma-500)_44%)]",
  "hover:border-[color-mix(in_srgb,#ffffff_12%,var(--rootsy-sombra-500)_20%)]",
  "hover:bg-[color-mix(in_srgb,var(--rootsy-sombra-800)_66%,transparent)]",
  "supports-[backdrop-filter]:hover:bg-[color-mix(in_srgb,var(--rootsy-sombra-800)_54%,transparent)]",
  "hover:text-[color-mix(in_srgb,#ffffff_84%,var(--rootsy-bruma-300)_16%)]",
  "active:border-[color-mix(in_srgb,#ffffff_5%,var(--rootsy-sombra-600)_34%)]",
  "active:bg-[color-mix(in_srgb,var(--rootsy-sombra-950)_78%,transparent)]",
  "active:text-white",
  "[&_svg:not([class*='text-'])]:text-[color-mix(in_srgb,#ffffff_50%,var(--rootsy-bruma-500)_50%)]",
  "hover:[&_svg:not([class*='text-'])]:text-[color-mix(in_srgb,#ffffff_82%,var(--rootsy-bruma-300)_18%)]",
  "active:[&_svg:not([class*='text-'])]:text-white",
)

/** Ghost · dark — utilidades sin borde sobre fondo nocturno. */
export const rootsIconButtonNightGhostClass = cn(
  "border-0 bg-transparent shadow-none",
  "text-[color-mix(in_srgb,#ffffff_40%,var(--rootsy-bruma-500)_60%)]",
  "hover:bg-[color-mix(in_srgb,var(--rootsy-sombra-700)_48%,transparent)]",
  "hover:text-[color-mix(in_srgb,#ffffff_76%,var(--rootsy-bruma-300)_24%)]",
  "active:bg-[color-mix(in_srgb,var(--rootsy-sombra-950)_65%,transparent)]",
  "active:text-white",
  "[&_svg:not([class*='text-'])]:text-[color-mix(in_srgb,#ffffff_40%,var(--rootsy-bruma-500)_60%)]",
  "hover:[&_svg:not([class*='text-'])]:text-[color-mix(in_srgb,#ffffff_76%,var(--rootsy-bruma-300)_24%)]",
  "active:[&_svg:not([class*='text-'])]:text-white",
)
