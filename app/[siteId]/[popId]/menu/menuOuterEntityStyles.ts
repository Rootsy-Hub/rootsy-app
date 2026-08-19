import {
  menuSectionRealmRadiusClass,
  menuSectionRealmSurfaceClass,
} from "@/app/[siteId]/[popId]/menu/menuSectionRealmStyles"
import { cn } from "@/lib/utils"

const menuOuterEntityShellClass = cn(
  "menu-outer-entity relative z-20 w-full shrink-0",
)

/** Cinturón bajo el header — umbral entre el espacio exterior y el planeta. */
export const menuOuterEntityBeltClass = cn(
  menuOuterEntityShellClass,
  "menu-outer-entity--belt",
)

/** Base inferior — mismo universo que el header, ancla el dock fuera del mundo. */
export const menuOuterEntityFootClass = cn(
  menuOuterEntityShellClass,
  "menu-outer-entity--foot",
)

/** Dock flotante — universo exterior sin consumir altura del planeta. */
export const menuOuterEntityFootFloatingClass = cn(
  "menu-outer-entity menu-outer-entity--foot menu-outer-entity--foot-floating",
  "pointer-events-none absolute bottom-3 left-1/2 z-30 w-auto max-w-[calc(100%-1.5rem)] -translate-x-1/2 overflow-visible",
)

export const menuOuterEntityVeilClass =
  "pointer-events-none absolute inset-0 bg-[linear-gradient(168deg,rgba(255,255,255,0.025)_0%,transparent_42%)]"

export const menuOuterEntityBodyClass = cn(
  "menu-outer-entity-body menu-planet-life relative w-full overflow-hidden",
  "bg-[linear-gradient(168deg,rgba(4,10,14,0.92)_0%,rgba(2,6,10,0.96)_52%,rgba(1,3,6,0.98)_100%)]",
  "backdrop-blur-[8px] backdrop-saturate-[1.02]",
  "shadow-[inset_0_1px_0_rgba(255,255,255,0.08),inset_0_-12px_24px_rgba(0,0,0,0.22)]",
)

export const menuOuterEntityBeltContentClass = cn(
  "relative z-[1] flex h-12 w-full items-center justify-center px-4 sm:px-8",
)

export const menuOuterEntityFootContentClass = cn(
  "relative z-[1] flex w-full items-center justify-center px-4 py-2.5",
)

/** Cuerpo flotante — overflow visible para tooltips y drag; el radio vive en el cromo. */
export const menuOuterEntityBodyFloatingClass = cn(
  "menu-outer-entity-body menu-planet-life relative w-full overflow-visible",
  menuSectionRealmRadiusClass,
)

/** Cristal del dock — mismo radio y material que Operar / Administrar / Configurar. */
export const menuOuterEntityFootFloatingChromeClass = cn(
  "pointer-events-none absolute inset-0 overflow-hidden",
  menuSectionRealmSurfaceClass,
)

export const menuOuterEntityFootFloatingContentClass = cn(
  "relative z-[1] flex items-center justify-center overflow-visible pointer-events-auto py-1",
)
