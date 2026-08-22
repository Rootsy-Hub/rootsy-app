import {
  menuRealmLightMutedClass,
  menuRealmLightStaticClass,
} from "@/lib/menu/menuHoloStyles"
import type { MenuSectionKey } from "@/lib/menuCatalog"
import { cn } from "@/lib/utils"

/** Radio del selector de reinado — rounded-lg, como antes. */
export const menuSectionRealmRadiusClass = "rounded-lg"

/** Cristal del selector de reinado — mismo material para el dock. */
export const menuSectionRealmSurfaceClass = cn(
  "border",
  "border-[rgba(228,242,248,0.11)]",
  "bg-[linear-gradient(165deg,rgba(255,255,255,0.035)_0%,rgba(8,28,38,0.05)_100%)]",
  "backdrop-blur-[6px] backdrop-saturate-[1.06]",
  "shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]",
)

/** Rail de mundos — cristal tenue, tipografía precisa. */
export const menuSectionRealmRailClass = cn(
  "inline-flex w-auto max-w-full items-stretch overflow-hidden",
  menuSectionRealmRadiusClass,
  menuSectionRealmSurfaceClass,
)

export const menuSectionRealmTabClass = cn(
  "relative min-h-8 min-w-0 flex-none px-2.5 py-1.5 text-center sm:min-h-0 sm:min-w-[5.5rem] sm:px-4 md:min-w-[6.25rem] md:px-5",
  "text-[10px] font-medium uppercase tracking-[0.08em] antialiased sm:text-[11px] sm:tracking-[0.1em]",
  "transition-[color,background-color] duration-300 ease-[cubic-bezier(0.33,1,0.68,1)]",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(255,255,255,0.18)] focus-visible:ring-offset-0",
)

export const menuSectionRealmTabSelectedClass = menuRealmLightStaticClass

export const menuSectionRealmTabIdleClass = cn(
  menuRealmLightMutedClass,
  "text-[rgba(255,255,255,0.34)] hover:bg-white/[0.03] hover:text-[rgba(255,255,255,0.52)]",
)

export const menuSectionRealmTabDormantClass = cn(
  menuRealmLightMutedClass,
  "text-[rgba(255,255,255,0.26)]",
)

export const menuSectionRealmDividerClass =
  "w-px shrink-0 self-stretch bg-[rgba(228,242,248,0.08)]"

export function menuSectionRealmIndicatorClass(section: MenuSectionKey): string {
  const tone: Record<MenuSectionKey, string> = {
    operar: "bg-[rgba(111,216,156,0.88)] shadow-[0_0_10px_rgba(36,173,106,0.22)]",
    administrar:
      "bg-[rgba(103,232,249,0.88)] shadow-[0_0_10px_rgba(8,145,178,0.22)]",
    configurar:
      "bg-[rgba(167,139,250,0.88)] shadow-[0_0_10px_rgba(124,58,237,0.22)]",
  }

  return cn(
    "absolute inset-x-3 bottom-0 h-[2px] rounded-full",
    "transition-opacity duration-300",
    tone[section],
  )
}

export const menuSectionRealmSelectedWellClass = cn(
  "bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.02)_100%)]",
)
