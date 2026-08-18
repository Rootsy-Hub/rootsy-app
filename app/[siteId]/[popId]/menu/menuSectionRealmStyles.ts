import {
  menuRealmLightMutedClass,
  menuRealmLightStaticClass,
} from "@/lib/menu/menuHoloStyles"
import type { MenuSectionKey } from "@/lib/menuCatalog"
import { cn } from "@/lib/utils"

/** Rail de mundos — cristal tenue, tipografía precisa. */
export const menuSectionRealmRailClass = cn(
  "inline-flex items-stretch overflow-hidden rounded-lg border",
  "border-[rgba(228,242,248,0.11)]",
  "bg-[linear-gradient(165deg,rgba(255,255,255,0.035)_0%,rgba(8,28,38,0.05)_100%)]",
  "backdrop-blur-[6px] backdrop-saturate-[1.06]",
  "shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]",
)

export const menuSectionRealmTabClass = cn(
  "relative min-w-[5.5rem] px-4 py-2 text-center sm:min-w-[6.25rem] sm:px-5",
  "text-[11px] font-medium uppercase tracking-[0.1em] antialiased",
  "transition-[color,background-color] duration-300 ease-[cubic-bezier(0.33,1,0.68,1)]",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(255,255,255,0.18)] focus-visible:ring-offset-0",
)

export const menuSectionRealmTabSelectedClass = menuRealmLightStaticClass

export const menuSectionRealmTabIdleClass = cn(
  menuRealmLightMutedClass,
  "text-[rgba(255,255,255,0.34)] hover:bg-white/[0.03] hover:text-[rgba(255,255,255,0.52)]",
)

export const menuSectionRealmDividerClass =
  "w-px shrink-0 self-stretch bg-[rgba(228,242,248,0.08)]"

export function menuSectionRealmIndicatorClass(section: MenuSectionKey): string {
  const tone: Record<MenuSectionKey, string> = {
    operar: "bg-[rgba(111,216,156,0.88)] shadow-[0_0_10px_rgba(36,173,106,0.22)]",
    administrar:
      "bg-[rgba(251,191,36,0.88)] shadow-[0_0_10px_rgba(217,119,6,0.22)]",
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
