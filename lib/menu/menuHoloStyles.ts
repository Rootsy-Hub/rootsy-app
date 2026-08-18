import { cn } from "@/lib/utils"

type MenuHoloIconVariant = "default" | "dock" | "muted" | "overlay"

/**
 * Cristal holográfico flotante — borde biselado (luz arriba, sombra abajo),
 * sin relleno opaco ni blur pesado.
 */
const menuHoloCrystalShellClass = cn(
  "relative isolate overflow-hidden border",
  "border-[rgba(255,255,255,0.22)]",
  "bg-[linear-gradient(162deg,rgba(255,255,255,0.1)_0%,rgba(255,255,255,0.018)_36%,rgba(168,228,255,0.045)_58%,rgba(255,255,255,0.012)_100%)]",
  "shadow-[0_10px_28px_rgba(0,0,0,0.2),0_0_16px_rgba(105,205,255,0.08),inset_0_0_0_1px_rgba(255,255,255,0.08),inset_0_-10px_18px_rgba(0,0,0,0.05)]",
)

const menuHoloIconVariantClass: Record<MenuHoloIconVariant, string> = {
  default: menuHoloCrystalShellClass,
  dock: cn(
    menuHoloCrystalShellClass,
    "border-[rgba(255,255,255,0.18)]",
    "shadow-[0_8px_22px_rgba(0,0,0,0.16),0_0_14px_rgba(100,200,255,0.07),inset_0_0_0_1px_rgba(255,255,255,0.07),inset_0_-8px_14px_rgba(0,0,0,0.04)]",
  ),
  muted: cn(
    "relative isolate overflow-hidden border",
    "border-[rgba(255,255,255,0.1)]",
    "bg-[linear-gradient(160deg,rgba(255,255,255,0.035)_0%,rgba(255,255,255,0.008)_100%)]",
    "shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06),inset_0_1px_0_rgba(255,255,255,0.04),inset_0_-1px_0_rgba(0,0,0,0.06)]",
  ),
  overlay: cn(
    menuHoloCrystalShellClass,
    "border-[rgba(255,255,255,0.34)]",
    "shadow-[0_14px_36px_rgba(0,0,0,0.24),0_0_28px_rgba(130,225,255,0.18),inset_0_0_0_1px_rgba(255,255,255,0.12),inset_0_0_28px_rgba(190,240,255,0.08)]",
  ),
}

export function menuHoloIconShellForVariant(
  variant: MenuHoloIconVariant = "default",
): string {
  return menuHoloIconVariantClass[variant]
}

/** Sombra de contacto bajo el cristal — sensación de flotación. */
export const menuHoloFloatShadowClass = cn(
  "pointer-events-none absolute left-1/2 top-[calc(100%-4px)] z-0 -translate-x-1/2",
  "h-2.5 w-[68%] rounded-[100%]",
  "bg-[radial-gradient(ellipse,rgba(95,190,255,0.26)_0%,rgba(95,190,255,0.08)_42%,transparent_72%)]",
  "opacity-75 transition-[opacity,transform,filter] duration-300 ease-out",
  "group-hover:opacity-95 group-hover:scale-[1.08]",
)

/** Elevación suave al hover — HUD flotante. */
export const menuHoloFloatLiftClass = cn(
  "relative z-[1] transition-[transform,box-shadow,border-color] duration-300 ease-out",
  "group-hover:-translate-y-1",
)

/** Hover — bisel más marcado + bloom volumétrico suave. */
export const menuHoloIconHoverClass = cn(
  "group-hover:border-[rgba(255,255,255,0.34)]",
  "group-hover:shadow-[0_14px_32px_rgba(0,0,0,0.22),0_0_24px_rgba(140,228,255,0.16),inset_0_0_0_1px_rgba(255,255,255,0.12),inset_0_0_26px_rgba(195,240,255,0.08)]",
)

/** Ícono HUD — blanco puro con bloom fino. */
export const menuHoloGlyphClass = cn(
  "text-white/94",
  "drop-shadow-[0_0_12px_rgba(190,240,255,0.45)]",
  "transition-[filter,transform] duration-300",
  "group-hover:drop-shadow-[0_0_16px_rgba(210,248,255,0.58)]",
)

export const menuHoloLabelClass = cn(
  "font-light tracking-[0.02em] text-white/68 transition-colors duration-300",
  "group-hover:text-white/96",
  "drop-shadow-[0_0_14px_rgba(150,220,255,0.16)]",
)

export const menuHoloLabelMutedClass = "font-light text-white/26"

export const menuHoloTileSkeletonIconClass = cn(
  "size-[72px] rounded-[20px] border border-[rgba(255,255,255,0.14)]",
  "bg-[linear-gradient(162deg,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0.008)_100%)]",
  "animate-pulse shadow-[0_8px_20px_rgba(0,0,0,0.12),0_0_12px_rgba(110,200,255,0.06),inset_0_0_0_1px_rgba(255,255,255,0.06),inset_0_1px_0_rgba(255,255,255,0.08),inset_0_-1px_0_rgba(0,0,0,0.06)]",
)

export const menuHoloTileSkeletonLabelClass = cn(
  "h-8 rounded-sm border border-[rgba(190,235,255,0.1)]",
  "bg-[rgba(255,255,255,0.02)] animate-pulse",
)
