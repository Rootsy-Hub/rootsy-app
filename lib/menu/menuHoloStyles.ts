import type { MenuSectionKey } from "@/lib/menuCatalog"
import { cn } from "@/lib/utils"

type MenuHoloIconVariant = "default" | "dock" | "muted" | "overlay" | "placed"

/** Easing orgánico — aceleración y reposo como en la naturaleza. */
const menuHoloEase = "duration-500 ease-[cubic-bezier(0.33,1,0.68,1)]"

/**
 * Tres planetas del mismo reinado — cada uno con su color y atmósfera,
 * compartiendo el mismo vidrio perfecto (translúcido, sin neón).
 *
 * Operar      → savia / césped   (verde vivo)
 * Administrar → mar / agua       (celeste profundo)
 * Configurar  → dusk / ocaso     (violeta crepuscular)
 */
const menuHoloGlassBase = cn(
  "relative isolate overflow-hidden border backdrop-blur-[4px]",
)

const menuHoloPlanetShellDepthClass =
  "shadow-[inset_0_1px_0_rgba(255,255,255,0.34),inset_0_-14px_22px_rgba(0,0,0,0.1)]"

/** Cierre del mundo — borde que resalta el color del reinado. */
export function menuHoloRealmWorldRimClass(
  section: MenuSectionKey,
  soft = false,
): string {
  return cn(
    "menu-planet-world-rim",
    `menu-planet-world-rim--${section}`,
    soft && "menu-planet-world-rim--soft",
  )
}

/** Planeta dormido — cristal bruma, sin reinado asignado. */
export const menuHoloDormantPlanetShellClass = cn(
  menuHoloGlassBase,
  "backdrop-saturate-[1.02]",
  "border-[rgba(228,242,248,0.11)]",
  "bg-[linear-gradient(168deg,rgba(255,255,255,0.035)_0%,rgba(8,28,38,0.07)_46%,rgba(5,12,16,0.12)_100%)]",
  "shadow-[0_2px_4px_rgba(0,0,0,0.07),0_8px_20px_rgba(0,0,0,0.1)]",
  menuHoloPlanetShellDepthClass,
)

export const menuHoloDormantDockShellClass = cn(
  menuHoloGlassBase,
  "backdrop-saturate-[1.02]",
  "border-[rgba(228,242,248,0.1)]",
  "bg-[linear-gradient(168deg,rgba(255,255,255,0.03)_0%,rgba(8,28,38,0.06)_46%,rgba(5,12,16,0.1)_100%)]",
  "shadow-[0_2px_4px_rgba(0,0,0,0.06),0_6px_16px_rgba(0,0,0,0.08)]",
  menuHoloPlanetShellDepthClass,
)

export const menuHoloDormantRimClass = cn(
  "menu-planet-dormant-rim",
  "menu-planet-dormant-rim--soft",
)

const menuHoloShellBySection: Record<
  MenuSectionKey,
  Record<MenuHoloIconVariant, string>
> = {
  operar: {
    default: cn(
      menuHoloGlassBase,
      "backdrop-saturate-[1.36]",
      "border-[rgba(111,216,156,0.32)]",
      "bg-[linear-gradient(168deg,rgba(111,216,156,0.19)_0%,rgba(36,173,106,0.15)_46%,rgba(10,64,48,0.24)_100%)]",
      "shadow-[0_1px_0_rgba(255,255,255,0.12)_inset,0_1px_3px_rgba(0,0,0,0.22),0_6px_16px_rgba(0,0,0,0.16),0_10px_28px_rgba(14,87,57,0.2)]",
      menuHoloPlanetShellDepthClass,
    ),
    dock: cn(
      menuHoloGlassBase,
      "backdrop-saturate-[1.26]",
      "border-[rgba(111,216,156,0.24)]",
      "bg-[linear-gradient(168deg,rgba(111,216,156,0.13)_0%,rgba(36,173,106,0.1)_46%,rgba(10,64,48,0.18)_100%)]",
      "shadow-[0_2px_4px_rgba(0,0,0,0.07),0_8px_18px_rgba(14,87,57,0.18)]",
      menuHoloPlanetShellDepthClass,
    ),
    muted: cn(
      menuHoloGlassBase,
      "backdrop-saturate-[1.1]",
      "border-[rgba(111,216,156,0.14)]",
      "bg-[rgba(10,64,48,0.1)]",
      "backdrop-blur-[2px]",
      "shadow-none",
    ),
    placed: cn(
      menuHoloGlassBase,
      "backdrop-saturate-[1.28]",
      "border-[rgba(111,216,156,0.26)]",
      "bg-[linear-gradient(168deg,rgba(111,216,156,0.14)_0%,rgba(36,173,106,0.11)_46%,rgba(10,64,48,0.16)_100%)]",
      "shadow-[0_2px_4px_rgba(0,0,0,0.07),0_8px_20px_rgba(14,87,57,0.16)]",
      menuHoloPlanetShellDepthClass,
    ),
    overlay: cn(
      menuHoloGlassBase,
      "backdrop-saturate-[1.36]",
      "border-[rgba(127,224,168,0.34)]",
      "bg-[linear-gradient(168deg,rgba(127,224,168,0.19)_0%,rgba(36,173,106,0.15)_46%,rgba(10,64,48,0.26)_100%)]",
      "shadow-[0_4px_8px_rgba(0,0,0,0.1),0_12px_28px_rgba(14,87,57,0.26)]",
      menuHoloPlanetShellDepthClass,
    ),
  },
  administrar: {
    default: cn(
      menuHoloGlassBase,
      "backdrop-saturate-[1.34]",
      "border-[rgba(125,211,252,0.32)]",
      "bg-[linear-gradient(168deg,rgba(186,230,253,0.19)_0%,rgba(8,145,178,0.15)_46%,rgba(21,94,117,0.24)_100%)]",
      "shadow-[0_1px_0_rgba(255,255,255,0.12)_inset,0_1px_3px_rgba(0,0,0,0.22),0_6px_16px_rgba(0,0,0,0.16),0_10px_28px_rgba(14,78,99,0.2)]",
      menuHoloPlanetShellDepthClass,
    ),
    dock: cn(
      menuHoloGlassBase,
      "backdrop-saturate-[1.24]",
      "border-[rgba(125,211,252,0.24)]",
      "bg-[linear-gradient(168deg,rgba(186,230,253,0.13)_0%,rgba(8,145,178,0.1)_46%,rgba(21,94,117,0.18)_100%)]",
      "shadow-[0_2px_4px_rgba(0,0,0,0.07),0_8px_18px_rgba(14,78,99,0.18)]",
      menuHoloPlanetShellDepthClass,
    ),
    muted: cn(
      menuHoloGlassBase,
      "backdrop-saturate-[1.1]",
      "border-[rgba(125,211,252,0.14)]",
      "bg-[rgba(21,94,117,0.1)]",
      "backdrop-blur-[2px]",
      "shadow-none",
    ),
    placed: cn(
      menuHoloGlassBase,
      "backdrop-saturate-[1.26]",
      "border-[rgba(125,211,252,0.26)]",
      "bg-[linear-gradient(168deg,rgba(186,230,253,0.14)_0%,rgba(8,145,178,0.11)_46%,rgba(21,94,117,0.16)_100%)]",
      "shadow-[0_2px_4px_rgba(0,0,0,0.07),0_8px_20px_rgba(14,78,99,0.16)]",
      menuHoloPlanetShellDepthClass,
    ),
    overlay: cn(
      menuHoloGlassBase,
      "backdrop-saturate-[1.34]",
      "border-[rgba(103,232,249,0.34)]",
      "bg-[linear-gradient(168deg,rgba(103,232,249,0.19)_0%,rgba(8,145,178,0.15)_46%,rgba(21,94,117,0.26)_100%)]",
      "shadow-[0_4px_8px_rgba(0,0,0,0.1),0_12px_28px_rgba(14,78,99,0.26)]",
      menuHoloPlanetShellDepthClass,
    ),
  },
  configurar: {
    default: cn(
      menuHoloGlassBase,
      "backdrop-saturate-[1.34]",
      "border-[rgba(167,139,250,0.32)]",
      "bg-[linear-gradient(168deg,rgba(196,181,253,0.19)_0%,rgba(124,58,237,0.15)_46%,rgba(52,28,100,0.24)_100%)]",
      "shadow-[0_1px_0_rgba(255,255,255,0.12)_inset,0_1px_3px_rgba(0,0,0,0.22),0_6px_16px_rgba(0,0,0,0.16),0_10px_28px_rgba(76,29,149,0.2)]",
      menuHoloPlanetShellDepthClass,
    ),
    dock: cn(
      menuHoloGlassBase,
      "backdrop-saturate-[1.24]",
      "border-[rgba(167,139,250,0.24)]",
      "bg-[linear-gradient(168deg,rgba(196,181,253,0.13)_0%,rgba(124,58,237,0.1)_46%,rgba(52,28,100,0.18)_100%)]",
      "shadow-[0_2px_4px_rgba(0,0,0,0.07),0_8px_18px_rgba(76,29,149,0.18)]",
      menuHoloPlanetShellDepthClass,
    ),
    muted: cn(
      menuHoloGlassBase,
      "backdrop-saturate-[1.1]",
      "border-[rgba(167,139,250,0.14)]",
      "bg-[rgba(52,28,100,0.1)]",
      "backdrop-blur-[2px]",
      "shadow-none",
    ),
    placed: cn(
      menuHoloGlassBase,
      "backdrop-saturate-[1.26]",
      "border-[rgba(167,139,250,0.26)]",
      "bg-[linear-gradient(168deg,rgba(196,181,253,0.14)_0%,rgba(124,58,237,0.11)_46%,rgba(52,28,100,0.16)_100%)]",
      "shadow-[0_2px_4px_rgba(0,0,0,0.07),0_8px_20px_rgba(76,29,149,0.16)]",
      menuHoloPlanetShellDepthClass,
    ),
    overlay: cn(
      menuHoloGlassBase,
      "backdrop-saturate-[1.34]",
      "border-[rgba(196,181,253,0.34)]",
      "bg-[linear-gradient(168deg,rgba(196,181,253,0.19)_0%,rgba(124,58,237,0.15)_46%,rgba(52,28,100,0.26)_100%)]",
      "shadow-[0_4px_8px_rgba(0,0,0,0.1),0_12px_28px_rgba(76,29,149,0.26)]",
      menuHoloPlanetShellDepthClass,
    ),
  },
}

export function menuHoloIconShellForSection(
  section: MenuSectionKey,
  variant: MenuHoloIconVariant = "default",
): string {
  return menuHoloShellBySection[section][variant]
}

/** @deprecated Usar menuHoloIconShellForSection */
export function menuHoloIconShellForVariant(
  variant: MenuHoloIconVariant = "default",
): string {
  return menuHoloIconShellForSection("operar", variant)
}

const menuHoloHoverBySection: Record<MenuSectionKey, string> = {
  operar: cn(
    "group-hover:border-[rgba(111,216,156,0.34)]",
    "group-hover:shadow-[0_1px_0_rgba(255,255,255,0.14)_inset,0_2px_5px_rgba(0,0,0,0.26),0_8px_20px_rgba(0,0,0,0.18),0_12px_32px_rgba(14,87,57,0.24),inset_0_1px_0_rgba(255,255,255,0.36),inset_0_-14px_22px_rgba(0,0,0,0.08)]",
  ),
  administrar: cn(
    "group-hover:border-[rgba(125,211,252,0.34)]",
    "group-hover:shadow-[0_1px_0_rgba(255,255,255,0.14)_inset,0_2px_5px_rgba(0,0,0,0.26),0_8px_20px_rgba(0,0,0,0.18),0_12px_32px_rgba(14,78,99,0.24),inset_0_1px_0_rgba(255,255,255,0.36),inset_0_-14px_22px_rgba(0,0,0,0.08)]",
  ),
  configurar: cn(
    "group-hover:border-[rgba(167,139,250,0.34)]",
    "group-hover:shadow-[0_1px_0_rgba(255,255,255,0.14)_inset,0_2px_5px_rgba(0,0,0,0.26),0_8px_20px_rgba(0,0,0,0.18),0_12px_32px_rgba(76,29,149,0.24),inset_0_1px_0_rgba(255,255,255,0.36),inset_0_-14px_22px_rgba(0,0,0,0.08)]",
  ),
}

export function menuHoloIconHoverForSection(section: MenuSectionKey): string {
  return menuHoloHoverBySection[section]
}

/** @deprecated Usar menuHoloIconHoverForSection */
export const menuHoloIconHoverClass = menuHoloHoverBySection.operar

/** Velo de vidrio — une capas sin apagar el color del planeta. */
export const menuHoloChromeVeilClass =
  "bg-[linear-gradient(168deg,rgba(255,255,255,0.09)_0%,rgba(255,255,255,0.025)_34%,transparent_66%)]"

/** Núcleo planetario — corazón del color, bajo el velo. */
const menuHoloChromeCoreBySection: Record<MenuSectionKey, string> = {
  operar:
    "bg-[radial-gradient(circle_at_50%_62%,rgba(63,200,126,0.22)_0%,rgba(36,173,106,0.1)_40%,transparent_66%)]",
  administrar:
    "bg-[radial-gradient(circle_at_50%_62%,rgba(103,232,249,0.22)_0%,rgba(8,145,178,0.1)_40%,transparent_66%)]",
  configurar:
    "bg-[radial-gradient(circle_at_50%_62%,rgba(167,139,250,0.22)_0%,rgba(124,58,237,0.1)_40%,transparent_66%)]",
}

/** Luz del cielo — reflejo que ilumina, no que tapa. */
const menuHoloChromeSkyBySection: Record<MenuSectionKey, string> = {
  operar:
    "bg-[radial-gradient(ellipse_110%_50%_at_50%_-6%,rgba(255,255,255,0.19)_0%,rgba(168,235,196,0.14)_30%,transparent_58%)]",
  administrar:
    "bg-[radial-gradient(ellipse_110%_50%_at_50%_-6%,rgba(255,255,255,0.19)_0%,rgba(186,230,253,0.14)_30%,transparent_58%)]",
  configurar:
    "bg-[radial-gradient(ellipse_110%_50%_at_50%_-6%,rgba(255,255,255,0.19)_0%,rgba(221,214,254,0.14)_30%,transparent_58%)]",
}

/** Peso al suelo — ancla el planeta sin apagar su color. */
const menuHoloChromeWeightBySection: Record<MenuSectionKey, string> = {
  operar:
    "bg-[linear-gradient(to_bottom,transparent_58%,rgba(0,0,0,0.14)_100%)]",
  administrar:
    "bg-[linear-gradient(to_bottom,transparent_58%,rgba(0,0,0,0.14)_100%)]",
  configurar:
    "bg-[linear-gradient(to_bottom,transparent_58%,rgba(0,0,0,0.14)_100%)]",
}

export function menuHoloChromeCoreClass(section: MenuSectionKey): string {
  return menuHoloChromeCoreBySection[section]
}

export function menuHoloChromeSkyClass(section: MenuSectionKey): string {
  return menuHoloChromeSkyBySection[section]
}

export function menuHoloChromeWeightClass(section: MenuSectionKey): string {
  return menuHoloChromeWeightBySection[section]
}

/** @deprecated Sin sombra de contacto — el peso vive en el shell, no debajo. */
export function menuHoloContactShadowForSection(_section: MenuSectionKey): string {
  return "hidden"
}

/** @deprecated Usar menuHoloContactShadowForSection */
export const menuHoloContactShadowClass = "hidden"

export const menuHoloFloatLiftClass = cn(
  "relative z-[1] transition-[transform,box-shadow,border-color]",
  menuHoloEase,
  "group-hover:-translate-y-[3px] group-active:translate-y-[-1px]",
)

/** Luz del reinado — blanca, legible, compartida por ícono y título. */
const menuHoloRealmLightClass = cn(
  "text-[rgba(255,255,255,0.97)]",
  "drop-shadow-[0_2px_3px_rgba(0,0,0,0.48)]",
  "[text-shadow:0_0_14px_rgba(255,255,255,0.12)]",
  "transition-[color,opacity,filter]",
  menuHoloEase,
  "group-hover:text-white",
  "group-hover:drop-shadow-[0_3px_5px_rgba(0,0,0,0.54)]",
  "group-hover:[text-shadow:0_0_18px_rgba(255,255,255,0.16)]",
)

/** Luz estática — header, navigator y campos sin hover de grupo. */
export const menuRealmLightStaticClass = cn(
  "text-[rgba(255,255,255,0.96)]",
  "drop-shadow-[0_1px_2px_rgba(0,0,0,0.38)]",
  "[text-shadow:0_0_14px_rgba(255,255,255,0.1)]",
)

export const menuRealmLightMutedClass = cn(
  "text-[rgba(255,255,255,0.52)]",
  "drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]",
)

export const menuRealmTitleClass = cn(
  "font-semibold tracking-[0.02em] antialiased",
  menuRealmLightStaticClass,
)

export const menuRealmBodyClass = cn(
  "font-normal antialiased",
  menuRealmLightStaticClass,
)

/** Cristal del reinado — header, dock y navigator. */
export const menuRealmChromeShellClass = cn(
  "relative isolate overflow-hidden",
  "border-[rgba(228,242,248,0.22)]",
  "bg-[linear-gradient(165deg,rgba(255,255,255,0.08)_0%,rgba(14,42,54,0.06)_44%,rgba(8,28,38,0.14)_100%)]",
  "backdrop-blur-xl backdrop-saturate-[1.15]",
  "shadow-[0_2px_5px_rgba(0,0,0,0.08),0_12px_32px_rgba(0,0,0,0.14)]",
)

export const menuRealmDividerClass = "bg-[rgba(228,242,248,0.12)]"

export function menuSectionPlanetDotClass(
  section: MenuSectionKey,
  selected: boolean,
): string {
  const planetDot: Record<MenuSectionKey, { on: string; off: string }> = {
    operar: {
      on: "size-2 bg-[rgba(111,216,156,0.95)] shadow-[0_0_10px_rgba(36,173,106,0.42)]",
      off: "size-1.5 bg-[rgba(111,216,156,0.38)]",
    },
    administrar: {
      on: "size-2 bg-[rgba(103,232,249,0.95)] shadow-[0_0_10px_rgba(8,145,178,0.42)]",
      off: "size-1.5 bg-[rgba(103,232,249,0.38)]",
    },
    configurar: {
      on: "size-2 bg-[rgba(167,139,250,0.95)] shadow-[0_0_10px_rgba(124,58,237,0.42)]",
      off: "size-1.5 bg-[rgba(167,139,250,0.38)]",
    },
  }
  return cn(
    "rounded-full transition-all duration-500 ease-[cubic-bezier(0.33,1,0.68,1)]",
    selected ? planetDot[section].on : planetDot[section].off,
  )
}

/**
 * Íconos — mismo trazo y luz que el título; se leen como una sola pieza.
 */
export const menuHoloGlyphClass = cn(
  "relative z-[1] shrink-0 stroke-[2] [stroke-linecap:round] [stroke-linejoin:round]",
  menuHoloRealmLightClass,
  "drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]",
  "group-hover:drop-shadow-[0_3px_6px_rgba(0,0,0,0.56)]",
)

/** @deprecated Los íconos son del reinado — usar menuHoloGlyphClass */
export function menuHoloGlyphForSection(_section: MenuSectionKey): string {
  return menuHoloGlyphClass
}

/** Títulos — peso y luz alineados al trazo del ícono. */
export const menuHoloLabelClass = cn(
  "text-xs font-normal leading-tight tracking-[0.01em] antialiased",
  menuHoloRealmLightClass,
)

/** @deprecated Los labels son del reinado — usar menuHoloLabelClass */
export function menuHoloLabelForSection(_section: MenuSectionKey): string {
  return menuHoloLabelClass
}

export const menuHoloLabelMutedClass = "font-light text-white/26"

/** En dock — ya colocado, sigue vivo pero en reposo. */
export const menuHoloLabelDockPlacedClass = cn(
  "text-xs font-normal leading-tight tracking-[0.01em] antialiased",
  "text-[rgba(255,255,255,0.62)]",
  "drop-shadow-[0_1px_2px_rgba(0,0,0,0.32)]",
)

const menuHoloSkeletonIconBySection: Record<MenuSectionKey, string> = {
  operar: cn(
    "size-[72px] rounded-[20px] border border-[rgba(111,216,156,0.18)]",
    "bg-[linear-gradient(165deg,rgba(111,216,156,0.1)_0%,rgba(10,64,48,0.16)_100%)]",
    "backdrop-blur-[3px] animate-pulse shadow-[0_2px_4px_rgba(0,0,0,0.07),0_8px_18px_rgba(14,87,57,0.14)]",
  ),
  administrar: cn(
    "size-[72px] rounded-[20px] border border-[rgba(125,211,252,0.18)]",
    "bg-[linear-gradient(165deg,rgba(186,230,253,0.1)_0%,rgba(21,94,117,0.16)_100%)]",
    "backdrop-blur-[3px] animate-pulse shadow-[0_2px_4px_rgba(0,0,0,0.07),0_8px_18px_rgba(14,78,99,0.14)]",
  ),
  configurar: cn(
    "size-[72px] rounded-[20px] border border-[rgba(167,139,250,0.18)]",
    "bg-[linear-gradient(165deg,rgba(196,181,253,0.1)_0%,rgba(52,28,100,0.16)_100%)]",
    "backdrop-blur-[3px] animate-pulse shadow-[0_2px_4px_rgba(0,0,0,0.07),0_8px_18px_rgba(76,29,149,0.14)]",
  ),
}

export function menuHoloTileSkeletonIconForSection(
  section: MenuSectionKey,
): string {
  return menuHoloSkeletonIconBySection[section]
}

/** @deprecated Usar menuHoloTileSkeletonIconForSection */
export const menuHoloTileSkeletonIconClass =
  menuHoloSkeletonIconBySection.operar

export const menuHoloTileSkeletonLabelClass = cn(
  "h-8 rounded-sm border border-[rgba(228,242,248,0.08)]",
  "bg-[rgba(8,28,38,0.05)] animate-pulse",
)

const menuHoloFocusRingBySection: Record<MenuSectionKey, string> = {
  operar:
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(111,216,156,0.42)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
  administrar:
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(103,232,249,0.42)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
  configurar:
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(167,139,250,0.42)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
}

export function menuHoloFocusRingForSection(section: MenuSectionKey): string {
  return menuHoloFocusRingBySection[section]
}

/** @deprecated Usar menuHoloFocusRingForSection */
export const menuHoloFocusRingClass = menuHoloFocusRingBySection.operar

export const menuHoloTileMotionClass = cn(
  "transition-transform",
  menuHoloEase,
  "hover:scale-[1.015] active:scale-[0.992]",
)

/** Ritmo de vida único por ser — lento y delicado. */
export function menuPlanetLifeStyle(seed: string): {
  animationDelay: string
  animationDuration: string
} {
  const hash = [...seed].reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return {
    animationDelay: `${-((hash % 50) / 10)}s`,
    animationDuration: `${6.8 + (hash % 12) / 10}s`,
  }
}

export const menuHoloPlanetLifeClass = cn(
  "menu-planet-life relative flex flex-col items-center",
)

export const menuHoloChromeCoreLifeClass = "menu-planet-core-life"

const MENU_CORE_LIFE_DURATION: Record<MenuSectionKey, string> = {
  operar: "7.8s",
  administrar: "7.2s",
  configurar: "8.4s",
}

/** Pulso del núcleo — desfasado del cuerpo, como un corazón planetario. */
export function menuPlanetCoreLifeStyle(section: MenuSectionKey): {
  animationDelay: string
  animationDuration: string
} {
  const sectionOffset = { operar: 0, administrar: 1.1, configurar: 2.3 }[section]
  return {
    animationDelay: `${-sectionOffset}s`,
    animationDuration: MENU_CORE_LIFE_DURATION[section],
  }
}

const MENU_SECTIONS: MenuSectionKey[] = ["operar", "administrar", "configurar"]

export function menuHoloSectionForSkeletonIndex(index: number): MenuSectionKey {
  return MENU_SECTIONS[index % MENU_SECTIONS.length]!
}
