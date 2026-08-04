import { cn } from "@/lib/utils"

/**
 * Elevación overlay — fuente compartida producto + librería.
 * @see app/.../library/elevation/rootsyElevationSystem.css · .rootsy-elevation-overlay
 */

/** elevation.surface.overlay + elevation.shadow.overlay — light */
export const rootsyElevationOverlayLightClass = cn(
  "rounded-[1.375rem] border border-black/[0.04] bg-white",
  "shadow-[0_22px_70px_-18px_rgba(0,0,0,0.28)]",
)

/** elevation.surface.overlay + elevation.shadow.overlay — dark */
export const rootsyElevationOverlayDarkClass = cn(
  "rounded-[1.375rem] border border-black/[0.04] bg-[#121816]",
  "shadow-[0_24px_80px_-16px_oklch(0_0_0/0.65)]",
)

/** Popover / dropdown / select content — light (elevation.popover.select) */
export const rootsyElevationPopoverContentLightClass = cn(
  "z-50 overflow-hidden outline-none ring-0",
  rootsyElevationOverlayLightClass,
)

/** Popover / dropdown / select content — dark header / footer */
export const rootsyElevationPopoverContentDarkClass = cn(
  "z-50 overflow-hidden outline-none ring-0",
  rootsyElevationOverlayDarkClass,
)

/** Radio de hover en ítems — anidado dentro del overlay con p-1.5 (≈ rounded-2xl). */
export const rootsyElevationPopoverMenuItemRadiusClass =
  "[&_[data-slot=dropdown-menu-item]]:rounded-2xl"
