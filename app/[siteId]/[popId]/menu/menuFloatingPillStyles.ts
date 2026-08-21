import { menuRealmChromeShellClass } from "@/lib/menu/menuHoloStyles"
import { cn } from "@/lib/utils"

/** Cristal del header — mismo material que los botones del reinado. */
export const menuHeaderChromeClass = cn("menu-pop-chrome", menuRealmChromeShellClass)

export const menuHeaderBorderClass = "border-[rgba(228,242,248,0.14)]"

/** Altura del header de menú — 64px mobile · 80px desktop. */
export const menuHeaderHeightClass = "h-16 shrink-0 md:h-20"

/** Header de módulo — más bajo que home: deja aire para listados y losetas (68px). */
export const menuModuleHeaderHeightClass = "h-17 shrink-0"

export const menuHeaderRowClass = cn(
  "grid h-full min-h-0 grid-cols-[minmax(0,1fr)_minmax(0,280px)_minmax(0,1fr)] items-center gap-4 px-6 sm:gap-6 sm:px-8",
)

/** Header de módulo — mismo grid, menos aire a los costados. */
export const menuModuleHeaderRowClass = cn(
  "grid h-full min-h-0 grid-cols-[minmax(0,1fr)_minmax(0,280px)_minmax(0,1fr)] items-center gap-3 px-3 sm:gap-4 sm:px-4",
)

/** Fila simple del header home — misma altura fija, layout de una sola banda. */
export const menuHeaderFlexRowClass = cn(
  "flex h-full min-h-0 items-center justify-between px-6 sm:px-8",
)

export const menuFloatingPillShellClass = cn(
  "menu-floating-pill rounded-xl",
  menuRealmChromeShellClass,
)

/** @deprecated Usar menuSectionPlanetDotClass */
export const menuFloatingPillDotSelectedClass =
  "menu-floating-pill-dot--selected size-2 rounded-full"

/** @deprecated Usar menuSectionPlanetDotClass */
export const menuFloatingPillDotIdleClass = "size-1.5 rounded-full bg-foreground/45"
