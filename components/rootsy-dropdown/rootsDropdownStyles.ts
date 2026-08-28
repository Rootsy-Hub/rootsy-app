/**
 * Estilos RootsDropdown — radius.xlarge panel (16px).
 * Hover inset · radius.large (12px).
 * Bruma: overlay claro. Sombra / Éter: fondo 950 de cada familia.
 */

import type { RootsButtonAtmosphere } from "@/components/rootsy-button/rootsButtonAtmosphere"
import { cn } from "@/lib/utils"

/** radius.xlarge — 16px (ROOTSY_DROPDOWN_ANATOMY.panelRadiusPx). */
export const rootsDropdownPanelRadiusClass = "rounded-[16px]"

/** Hover inset — radius.large, un paso bajo el xlarge del panel. */
export const rootsDropdownItemRadiusClass = "rounded-[12px]"

/** space.025 — separación entre pastillas de ítem. */
export const rootsDropdownItemStackGapClass = "gap-0.5"

/** motion.duration.short — hover/selected en ítems. */
export const rootsDropdownItemMotionClass =
  "transition-[color,background-color] duration-150 ease-out"

/** Check trailing — savia-600 luz · savia-500 Sombra. */
export const rootsDropdownCheckIconLightClass = "size-4 shrink-0 text-[var(--rootsy-savia-600)]"
export const rootsDropdownCheckIconDarkClass = "size-4 shrink-0 text-[var(--rootsy-savia-500)]"

export const rootsDropdownCheckIconEterClass = "size-4 shrink-0 text-[var(--rootsy-savia-500)]"

export function rootsDropdownCheckIconClassForAtmosphere(
  atmosphere: RootsButtonAtmosphere = "bruma",
) {
  if (atmosphere === "sombra") return rootsDropdownCheckIconDarkClass
  if (atmosphere === "eter") return rootsDropdownCheckIconEterClass
  return rootsDropdownCheckIconLightClass
}

export function rootsDropdownCheckIconClassForTheme(theme: "light" | "dark" = "light") {
  return rootsDropdownCheckIconClassForAtmosphere(theme === "dark" ? "sombra" : "bruma")
}

/** Reset shadcn dropdown content — spec inline aplica bg/border/shadow/radius/padding. */
export const rootsDropdownContentResetClass =
  "max-h-(--radix-dropdown-menu-content-available-height) min-w-0 border-0 bg-transparent p-0 shadow-none"

export const rootsDropdownContentMotionClass = cn(
  "z-50 overflow-x-hidden overflow-y-auto outline-none ring-0",
  "origin-(--radix-dropdown-menu-content-transform-origin)",
  "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
  "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-top-2",
)

export const rootsDropdownContentListClass = cn(
  "flex flex-col",
  rootsDropdownItemStackGapClass,
  "px-2 py-2",
)

export const rootsDropdownContentSurfaceLightClass = cn(
  "rootsy-app-light",
  rootsDropdownPanelRadiusClass,
  "border border-[var(--rootsy-bruma-200)] bg-[var(--rootsy-blanco)]",
  "shadow-[0_22px_70px_-18px_rgba(0,0,0,0.28)]",
)

export const rootsDropdownContentSurfaceDarkClass = cn(
  rootsDropdownPanelRadiusClass,
  "border border-[var(--rootsy-sombra-400)] bg-[var(--rootsy-sombra-950)]",
  "shadow-[0_24px_80px_-16px_oklch(0_0_0/0.65)]",
)

export const rootsDropdownContentLightClass = cn(
  rootsDropdownContentResetClass,
  rootsDropdownContentMotionClass,
  rootsDropdownContentSurfaceLightClass,
  rootsDropdownContentListClass,
  "text-[var(--rootsy-bruma-900)]",
)

export const rootsDropdownContentDarkClass = cn(
  rootsDropdownContentResetClass,
  rootsDropdownContentMotionClass,
  rootsDropdownContentSurfaceDarkClass,
  rootsDropdownContentListClass,
  "text-[var(--rootsy-sombra-50)]",
)

export const rootsDropdownContentSurfaceEterClass = cn(
  rootsDropdownPanelRadiusClass,
  "border border-[var(--rootsy-eter-700)] bg-[var(--rootsy-eter-950)]",
  "shadow-[0_24px_80px_-16px_oklch(0_0_0/0.65)]",
)

export const rootsDropdownContentEterClass = cn(
  rootsDropdownContentResetClass,
  rootsDropdownContentMotionClass,
  rootsDropdownContentSurfaceEterClass,
  rootsDropdownContentListClass,
  "text-[var(--rootsy-eter-50)]",
)

const dropdownItemResetClass = cn(
  "gap-3 px-3 py-0 outline-none select-none",
  rootsDropdownItemRadiusClass,
  rootsDropdownItemMotionClass,
  "w-full overflow-hidden",
)

const dropdownItemBaseClass = cn(
  "relative flex cursor-default items-center",
  "font-canopy text-sm font-normal leading-5",
  dropdownItemResetClass,
  "data-[disabled]:pointer-events-none data-[disabled]:opacity-[0.55]",
  "[&_svg:not([class*='text-'])]:text-[var(--rootsy-bruma-500)] [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
)

/** dropdown.item.hover — bruma-50 · texto bruma-900. */
const dropdownItemLightHoverClass = cn(
  "focus:bg-[var(--rootsy-bruma-50)] focus:text-[var(--rootsy-bruma-900)]",
  "data-[highlighted]:bg-[var(--rootsy-bruma-50)] data-[highlighted]:text-[var(--rootsy-bruma-900)]",
)

/** dropdown.item.selected — savia-100 · medium · check trailing. */
const dropdownItemLightSelectedSurfaceClass = cn(
  "bg-[var(--rootsy-savia-100)] font-medium text-[var(--rootsy-bruma-900)]",
  "focus:bg-[var(--rootsy-savia-100)] focus:text-[var(--rootsy-bruma-900)]",
  "data-[highlighted]:bg-[var(--rootsy-savia-100)] data-[highlighted]:text-[var(--rootsy-bruma-900)]",
)

export const rootsDropdownItemLightClass = cn(
  dropdownItemBaseClass,
  "min-h-10 text-[var(--rootsy-bruma-900)]",
  dropdownItemLightHoverClass,
)

export const rootsDropdownItemLightCompactClass = cn(rootsDropdownItemLightClass, "min-h-8")

export const rootsDropdownItemLightSelectedClass = cn(
  dropdownItemBaseClass,
  "min-h-10",
  dropdownItemLightSelectedSurfaceClass,
)

export const rootsDropdownItemLightSelectedCompactClass = cn(
  rootsDropdownItemLightSelectedClass,
  "min-h-8",
)

/** dropdown.item.hover Sombra — 800 sobre fondo 950. */
const dropdownItemDarkHoverClass = cn(
  "focus:bg-[var(--rootsy-sombra-800)] focus:text-[var(--rootsy-sombra-50)]",
  "data-[highlighted]:bg-[var(--rootsy-sombra-800)] data-[highlighted]:text-[var(--rootsy-sombra-50)]",
)

/** dropdown.item.selected Sombra — savia 500 vivo sobre fondo 950. */
const dropdownItemDarkSelectedSurfaceClass = cn(
  "bg-[color-mix(in_srgb,var(--rootsy-savia-500)_16%,var(--rootsy-sombra-950))] font-medium text-[var(--rootsy-sombra-50)]",
  "focus:bg-[color-mix(in_srgb,var(--rootsy-savia-500)_16%,var(--rootsy-sombra-950))] focus:text-[var(--rootsy-sombra-50)]",
  "data-[highlighted]:bg-[color-mix(in_srgb,var(--rootsy-savia-500)_16%,var(--rootsy-sombra-950))] data-[highlighted]:text-[var(--rootsy-sombra-50)]",
)

export const rootsDropdownItemDarkClass = cn(
  dropdownItemBaseClass,
  "min-h-10 text-[var(--rootsy-sombra-50)]",
  "[&_svg:not([class*='text-'])]:text-[var(--rootsy-sombra-300)]",
  dropdownItemDarkHoverClass,
)

export const rootsDropdownItemDarkCompactClass = cn(rootsDropdownItemDarkClass, "min-h-8")

export const rootsDropdownItemDarkSelectedClass = cn(
  dropdownItemBaseClass,
  "min-h-10 text-[var(--rootsy-sombra-50)]",
  "[&_svg:not([class*='text-'])]:text-[var(--rootsy-sombra-300)]",
  dropdownItemDarkSelectedSurfaceClass,
)

export const rootsDropdownItemDarkSelectedCompactClass = cn(
  rootsDropdownItemDarkSelectedClass,
  "min-h-8",
)

const dropdownItemEterHoverClass = cn(
  "focus:bg-[var(--rootsy-eter-800)] focus:text-[var(--rootsy-eter-50)]",
  "data-[highlighted]:bg-[var(--rootsy-eter-800)] data-[highlighted]:text-[var(--rootsy-eter-50)]",
)

const dropdownItemEterSelectedSurfaceClass = cn(
  "bg-[color-mix(in_srgb,var(--rootsy-savia-500)_16%,var(--rootsy-eter-950))] font-medium text-[var(--rootsy-eter-50)]",
  "focus:bg-[color-mix(in_srgb,var(--rootsy-savia-500)_16%,var(--rootsy-eter-950))] focus:text-[var(--rootsy-eter-50)]",
  "data-[highlighted]:bg-[color-mix(in_srgb,var(--rootsy-savia-500)_16%,var(--rootsy-eter-950))] data-[highlighted]:text-[var(--rootsy-eter-50)]",
)

export const rootsDropdownItemEterClass = cn(
  dropdownItemBaseClass,
  "min-h-10 text-[var(--rootsy-eter-50)]",
  "[&_svg:not([class*='text-'])]:text-[var(--rootsy-eter-300)]",
  dropdownItemEterHoverClass,
)

export const rootsDropdownItemEterCompactClass = cn(rootsDropdownItemEterClass, "min-h-8")

export const rootsDropdownItemEterSelectedClass = cn(
  dropdownItemBaseClass,
  "min-h-10 text-[var(--rootsy-eter-50)]",
  "[&_svg:not([class*='text-'])]:text-[var(--rootsy-eter-300)]",
  dropdownItemEterSelectedSurfaceClass,
)

export const rootsDropdownItemEterSelectedCompactClass = cn(
  rootsDropdownItemEterSelectedClass,
  "min-h-8",
)

export const rootsDropdownLabelLightClass =
  "px-3 pb-1 pt-2 font-canopy text-xs font-medium leading-4 text-[var(--rootsy-bruma-500)]"

export const rootsDropdownLabelDarkClass =
  "px-3 pb-1 pt-2 font-canopy text-xs font-medium leading-4 text-[var(--rootsy-sombra-300)]"

export const rootsDropdownLabelEterClass =
  "px-3 pb-1 pt-2 font-canopy text-xs font-medium leading-4 text-[var(--rootsy-eter-300)]"

export const rootsDropdownSeparatorLightClass =
  "mx-0 my-1 h-px shrink-0 bg-[var(--rootsy-bruma-200)]"

export const rootsDropdownSeparatorDarkClass =
  "mx-0 my-1 h-px shrink-0 bg-[var(--rootsy-sombra-400)]"

export const rootsDropdownSeparatorEterClass =
  "mx-0 my-1 h-px shrink-0 bg-[var(--rootsy-eter-700)]"

export const rootsDropdownDestructiveItemClass = cn(
  "text-[var(--color-status-danger,#dc2626)]",
  "focus:bg-[color-mix(in_srgb,var(--color-status-danger,#dc2626)_8%,var(--rootsy-white))]",
  "data-[highlighted]:bg-[color-mix(in_srgb,var(--color-status-danger,#dc2626)_8%,var(--rootsy-white))]",
  "focus:text-[var(--color-status-danger,#dc2626)] data-[highlighted]:text-[var(--color-status-danger,#dc2626)]",
  "[&_svg]:!text-[var(--color-status-danger,#dc2626)]",
)

export const rootsDropdownDestructiveItemDarkClass = cn(
  "text-[var(--rootsy-lava-500)]",
  "focus:bg-[color-mix(in_srgb,var(--rootsy-lava-500)_16%,var(--rootsy-sombra-950))]",
  "data-[highlighted]:bg-[color-mix(in_srgb,var(--rootsy-lava-500)_16%,var(--rootsy-sombra-950))]",
  "focus:text-[var(--rootsy-lava-500)] data-[highlighted]:text-[var(--rootsy-lava-500)]",
  "[&_svg]:!text-[var(--rootsy-lava-500)]",
)

export const rootsDropdownDestructiveItemEterClass = cn(
  "text-[var(--rootsy-lava-500)]",
  "focus:bg-[color-mix(in_srgb,var(--rootsy-lava-500)_16%,var(--rootsy-eter-950))]",
  "data-[highlighted]:bg-[color-mix(in_srgb,var(--rootsy-lava-500)_16%,var(--rootsy-eter-950))]",
  "focus:text-[var(--rootsy-lava-500)] data-[highlighted]:text-[var(--rootsy-lava-500)]",
  "[&_svg]:!text-[var(--rootsy-lava-500)]",
)

export function rootsDropdownContentClassForAtmosphere(
  atmosphere: RootsButtonAtmosphere = "bruma",
) {
  if (atmosphere === "sombra") return rootsDropdownContentDarkClass
  if (atmosphere === "eter") return rootsDropdownContentEterClass
  return rootsDropdownContentLightClass
}

export function rootsDropdownContentClassForTheme(theme: "light" | "dark" = "light") {
  return rootsDropdownContentClassForAtmosphere(theme === "dark" ? "sombra" : "bruma")
}

export function rootsDropdownItemClassForAtmosphere(
  atmosphere: RootsButtonAtmosphere = "bruma",
  density: "default" | "compact" = "default",
  options?: { selected?: boolean },
) {
  const selected = options?.selected ?? false

  if (atmosphere === "sombra") {
    if (selected) {
      return density === "compact"
        ? rootsDropdownItemDarkSelectedCompactClass
        : rootsDropdownItemDarkSelectedClass
    }
    return density === "compact" ? rootsDropdownItemDarkCompactClass : rootsDropdownItemDarkClass
  }

  if (atmosphere === "eter") {
    if (selected) {
      return density === "compact"
        ? rootsDropdownItemEterSelectedCompactClass
        : rootsDropdownItemEterSelectedClass
    }
    return density === "compact" ? rootsDropdownItemEterCompactClass : rootsDropdownItemEterClass
  }

  if (selected) {
    return density === "compact"
      ? rootsDropdownItemLightSelectedCompactClass
      : rootsDropdownItemLightSelectedClass
  }
  return density === "compact" ? rootsDropdownItemLightCompactClass : rootsDropdownItemLightClass
}

export function rootsDropdownItemClassForTheme(
  theme: "light" | "dark" = "light",
  density: "default" | "compact" = "default",
  options?: { selected?: boolean },
) {
  return rootsDropdownItemClassForAtmosphere(
    theme === "dark" ? "sombra" : "bruma",
    density,
    options,
  )
}

export function rootsDropdownLabelClassForAtmosphere(
  atmosphere: RootsButtonAtmosphere = "bruma",
) {
  if (atmosphere === "sombra") return rootsDropdownLabelDarkClass
  if (atmosphere === "eter") return rootsDropdownLabelEterClass
  return rootsDropdownLabelLightClass
}

export function rootsDropdownLabelClassForTheme(theme: "light" | "dark" = "light") {
  return rootsDropdownLabelClassForAtmosphere(theme === "dark" ? "sombra" : "bruma")
}

export function rootsDropdownSeparatorClassForAtmosphere(
  atmosphere: RootsButtonAtmosphere = "bruma",
) {
  if (atmosphere === "sombra") return rootsDropdownSeparatorDarkClass
  if (atmosphere === "eter") return rootsDropdownSeparatorEterClass
  return rootsDropdownSeparatorLightClass
}

export function rootsDropdownSeparatorClassForTheme(theme: "light" | "dark" = "light") {
  return rootsDropdownSeparatorClassForAtmosphere(theme === "dark" ? "sombra" : "bruma")
}

export function rootsDropdownDestructiveItemClassForAtmosphere(
  atmosphere: RootsButtonAtmosphere = "bruma",
) {
  if (atmosphere === "sombra") return rootsDropdownDestructiveItemDarkClass
  if (atmosphere === "eter") return rootsDropdownDestructiveItemEterClass
  return rootsDropdownDestructiveItemClass
}
