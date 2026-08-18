import { cn } from "@/lib/utils"

type MenuHoloIconVariant = "default" | "dock" | "muted" | "overlay"

/**
 * Panel HUD cyan — vidrio denso, sin emisión ni bloom.
 */
const menuHoloCrystalShellClass = cn(
  "relative isolate overflow-hidden border-2",
  "border-[rgba(103,232,249,0.44)]",
  "bg-[linear-gradient(180deg,rgba(34,211,238,0.18)_0%,rgba(6,182,212,0.12)_48%,rgba(8,51,68,0.18)_100%)]",
  "shadow-[0_4px_14px_rgba(0,0,0,0.16),inset_0_1px_0_rgba(255,255,255,0.08),inset_0_-1px_0_rgba(0,0,0,0.07)]",
)

const menuHoloIconVariantClass: Record<MenuHoloIconVariant, string> = {
  default: menuHoloCrystalShellClass,
  dock: cn(
    menuHoloCrystalShellClass,
    "border-[rgba(103,232,249,0.36)]",
    "bg-[linear-gradient(180deg,rgba(34,211,238,0.15)_0%,rgba(6,182,212,0.1)_48%,rgba(8,51,68,0.14)_100%)]",
    "shadow-[0_3px_10px_rgba(0,0,0,0.14),inset_0_1px_0_rgba(255,255,255,0.06),inset_0_-1px_0_rgba(0,0,0,0.06)]",
  ),
  muted: cn(
    "relative isolate overflow-hidden border-2",
    "border-[rgba(103,232,249,0.12)]",
    "bg-[rgba(6,182,212,0.04)]",
    "shadow-[inset_0_1px_0_rgba(255,255,255,0.04),inset_0_-1px_0_rgba(0,0,0,0.04)]",
  ),
  overlay: cn(
    menuHoloCrystalShellClass,
    "border-[rgba(165,243,252,0.52)]",
    "bg-[linear-gradient(180deg,rgba(34,211,238,0.22)_0%,rgba(6,182,212,0.15)_48%,rgba(8,51,68,0.2)_100%)]",
    "shadow-[0_6px_18px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.1),inset_0_-1px_0_rgba(0,0,0,0.08)]",
  ),
}

export function menuHoloIconShellForVariant(
  variant: MenuHoloIconVariant = "default",
): string {
  return menuHoloIconVariantClass[variant]
}

export const menuHoloFloatLiftClass = cn(
  "relative z-[1] transition-[transform,box-shadow,border-color,background-color] duration-300 ease-out",
  "group-hover:-translate-y-0.5",
)

export const menuHoloIconHoverClass = cn(
  "group-hover:border-[rgba(165,243,252,0.54)]",
  "group-hover:bg-[linear-gradient(180deg,rgba(34,211,238,0.22)_0%,rgba(6,182,212,0.14)_48%,rgba(8,51,68,0.2)_100%)]",
  "group-hover:shadow-[0_5px_16px_rgba(0,0,0,0.17),inset_0_1px_0_rgba(255,255,255,0.1),inset_0_-1px_0_rgba(0,0,0,0.06)]",
)

export const menuHoloGlyphClass = cn(
  "relative z-[1] text-white/96",
  "drop-shadow-[0_1px_1px_rgba(0,0,0,0.22)]",
  "transition-[color] duration-300 ease-out",
  "group-hover:text-white",
)

export const menuHoloLabelClass = cn(
  "font-light tracking-[0.025em] text-white/74 transition-colors duration-300 ease-out",
  "group-hover:text-white/92",
)

export const menuHoloLabelMutedClass = "font-light text-white/22"

export const menuHoloTileSkeletonIconClass = cn(
  "size-[72px] rounded-[20px] border-2 border-[rgba(103,232,249,0.22)]",
  "bg-[linear-gradient(180deg,rgba(34,211,238,0.1)_0%,rgba(8,51,68,0.12)_100%)]",
  "animate-pulse shadow-[0_3px_10px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.05)]",
)

export const menuHoloTileSkeletonLabelClass = cn(
  "h-8 rounded-sm border border-[rgba(103,232,249,0.08)]",
  "bg-[rgba(34,211,238,0.03)] animate-pulse",
)

export const menuHoloFocusRingClass = cn(
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(103,232,249,0.45)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
)
