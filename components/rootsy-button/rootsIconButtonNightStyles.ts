import { cn } from "@/lib/utils"

/**
 * IconButton · gama noche — cristal sobre night-900, hairline frío, iconos neutros.
 * Hex alineados a `--nature-night-*` en rootsyNaturePalette.css.
 */

export const rootsIconButtonNightFocusRingClass =
  "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[color-mix(in_srgb,#ffffff_14%,#6dd99e_6%)]"

/** Superficie demo / docs — cielo nocturno sin verde dominante. */
export const rootsIconButtonNightDemoSurfaceClass = cn(
  "border-[color-mix(in_srgb,#ffffff_5%,#1c2824_32%)]",
  "bg-[radial-gradient(ellipse_120%_70%_at_50%_-30%,color-mix(in_srgb,#141c19_35%,transparent),transparent_58%),linear-gradient(180deg,#07090d_0%,#0b0f15_42%,#0f141c_100%)]",
)

/** Chrome con borde — tone=dark · secondary surface=dark. */
export const rootsIconButtonNightChromeClass = cn(
  "border-[color-mix(in_srgb,#ffffff_8%,#263530_26%)]",
  "bg-[color-mix(in_srgb,#0c1210_52%,transparent)]",
  "shadow-[inset_0_1px_0_color-mix(in_srgb,#ffffff_7%,transparent)]",
  "backdrop-blur-xl backdrop-saturate-150",
  "supports-[backdrop-filter]:bg-[color-mix(in_srgb,#0c1210_40%,transparent)]",
  "text-[color-mix(in_srgb,#ffffff_56%,#78716c_44%)]",
  "hover:border-[color-mix(in_srgb,#ffffff_12%,#33443d_20%)]",
  "hover:bg-[color-mix(in_srgb,#141c19_66%,transparent)]",
  "supports-[backdrop-filter]:hover:bg-[color-mix(in_srgb,#141c19_54%,transparent)]",
  "hover:text-[color-mix(in_srgb,#ffffff_84%,#d6d3d1_16%)]",
  "active:border-[color-mix(in_srgb,#ffffff_5%,#263530_34%)]",
  "active:bg-[color-mix(in_srgb,#060908_78%,transparent)]",
  "active:text-white",
  "[&_svg:not([class*='text-'])]:text-[color-mix(in_srgb,#ffffff_50%,#78716c_50%)]",
  "hover:[&_svg:not([class*='text-'])]:text-[color-mix(in_srgb,#ffffff_82%,#d6d3d1_18%)]",
  "active:[&_svg:not([class*='text-'])]:text-white",
)

/** Ghost · dark — utilidades sin borde sobre fondo nocturno. */
export const rootsIconButtonNightGhostClass = cn(
  "border-0 bg-transparent shadow-none",
  "text-[color-mix(in_srgb,#ffffff_40%,#78716c_60%)]",
  "hover:bg-[color-mix(in_srgb,#1c2824_48%,transparent)]",
  "hover:text-[color-mix(in_srgb,#ffffff_76%,#d6d3d1_24%)]",
  "active:bg-[color-mix(in_srgb,#060908_65%,transparent)]",
  "active:text-white",
  "[&_svg:not([class*='text-'])]:text-[color-mix(in_srgb,#ffffff_40%,#78716c_60%)]",
  "hover:[&_svg:not([class*='text-'])]:text-[color-mix(in_srgb,#ffffff_76%,#d6d3d1_24%)]",
  "active:[&_svg:not([class*='text-'])]:text-white",
)
