import { cn } from "@/lib/utils"

type MenuHoloIconVariant = "default" | "dock" | "muted" | "overlay"

/** Easing orgánico — aceleración y reposo como en la naturaleza. */
const menuHoloEase = "duration-500 ease-[cubic-bezier(0.33,1,0.68,1)]"

/**
 * Vidrio vivo — translúcido, presente, sin artificio.
 * Deja respirar el paisaje; se nota por material, no por brillo.
 */
const menuHoloCrystalShellClass = cn(
  "relative isolate overflow-hidden border-2",
  "border-[rgba(228,242,248,0.26)]",
  "bg-[linear-gradient(165deg,rgba(255,255,255,0.09)_0%,rgba(14,42,54,0.06)_44%,rgba(8,28,38,0.14)_100%)]",
  "backdrop-blur-[4px] backdrop-saturate-[1.1]",
  "shadow-[0_2px_5px_rgba(0,0,0,0.08),0_10px_24px_rgba(0,0,0,0.1)]",
)

const menuHoloIconVariantClass: Record<MenuHoloIconVariant, string> = {
  default: menuHoloCrystalShellClass,
  dock: cn(
    menuHoloCrystalShellClass,
    "border-[rgba(228,242,248,0.22)]",
    "bg-[linear-gradient(165deg,rgba(255,255,255,0.07)_0%,rgba(14,42,54,0.05)_44%,rgba(8,28,38,0.11)_100%)]",
    "shadow-[0_2px_4px_rgba(0,0,0,0.07),0_8px_18px_rgba(0,0,0,0.08)]",
  ),
  muted: cn(
    "relative isolate overflow-hidden border-2",
    "border-[rgba(228,242,248,0.1)]",
    "bg-[rgba(8,28,38,0.08)]",
    "backdrop-blur-[2px]",
    "shadow-none",
  ),
  overlay: cn(
    menuHoloCrystalShellClass,
    "border-[rgba(238,248,252,0.32)]",
    "bg-[linear-gradient(165deg,rgba(255,255,255,0.11)_0%,rgba(14,42,54,0.07)_44%,rgba(8,28,38,0.16)_100%)]",
    "shadow-[0_4px_8px_rgba(0,0,0,0.1),0_12px_28px_rgba(0,0,0,0.12)]",
  ),
}

export function menuHoloIconShellForVariant(
  variant: MenuHoloIconVariant = "default",
): string {
  return menuHoloIconVariantClass[variant]
}

/** Sombra de apoyo — peso sobre la tierra. */
export const menuHoloContactShadowClass = cn(
  "pointer-events-none absolute left-1/2 top-[calc(100%-1px)] z-0 -translate-x-1/2",
  "h-2 w-[62%] rounded-full bg-black/14 blur-[2px]",
  "opacity-50 transition-opacity duration-500 ease-[cubic-bezier(0.33,1,0.68,1)]",
  "group-hover:opacity-65",
)

export const menuHoloFloatLiftClass = cn(
  "relative z-[1] transition-[transform,box-shadow,border-color,background-color]",
  menuHoloEase,
  "group-hover:-translate-y-px",
)

export const menuHoloIconHoverClass = cn(
  "group-hover:border-[rgba(240,249,252,0.34)]",
  "group-hover:bg-[linear-gradient(165deg,rgba(255,255,255,0.11)_0%,rgba(14,42,54,0.05)_44%,rgba(8,28,38,0.12)_100%)]",
  "group-hover:shadow-[0_3px_7px_rgba(0,0,0,0.09),0_12px_28px_rgba(0,0,0,0.11)]",
)

export const menuHoloGlyphClass = cn(
  "relative z-[1] text-white/93",
  "drop-shadow-[0_1px_2px_rgba(0,0,0,0.14)]",
  "transition-[color,opacity]",
  menuHoloEase,
  "group-hover:text-white/98",
)

export const menuHoloLabelClass = cn(
  "font-light tracking-[0.03em] text-white/78",
  "drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)]",
  "transition-[color,opacity]",
  menuHoloEase,
  "group-hover:text-white/95",
)

export const menuHoloLabelMutedClass = "font-light text-white/26"

export const menuHoloTileSkeletonIconClass = cn(
  "size-[72px] rounded-[20px] border-2 border-[rgba(228,242,248,0.16)]",
  "bg-[linear-gradient(165deg,rgba(255,255,255,0.05)_0%,rgba(8,28,38,0.1)_100%)]",
  "backdrop-blur-[3px]",
  "animate-pulse shadow-[0_2px_4px_rgba(0,0,0,0.07),0_8px_18px_rgba(0,0,0,0.08)]",
)

export const menuHoloTileSkeletonLabelClass = cn(
  "h-8 rounded-sm border border-[rgba(228,242,248,0.08)]",
  "bg-[rgba(8,28,38,0.05)] animate-pulse",
)

export const menuHoloFocusRingClass = cn(
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(228,242,248,0.32)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
)

export const menuHoloTileMotionClass = cn(
  "transition-transform",
  menuHoloEase,
  "hover:scale-[1.012] active:scale-[0.995]",
)
