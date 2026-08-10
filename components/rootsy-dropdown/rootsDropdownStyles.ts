/**
 * Estilos RootsDropdown — radius.xlarge panel (16px) · space.050 ítems (4px).
 * Hover/selección: bruma-50 · savia-100 · motion.duration.short (150ms).
 */

import { ROOTSY_SEMANTIC_TOKENS } from "@/app/library/color/rootsyColorSystem"
import { cn } from "@/lib/utils"

const statusDangerHex =
  ROOTSY_SEMANTIC_TOKENS.find((token) => token.id === "status-danger")!.hex

/** radius.xlarge — 16px (ROOTSY_DROPDOWN_ANATOMY.panelRadiusPx). */
export const rootsDropdownPanelRadiusClass = "rounded-[16px]"

/** space.050 — 4px en hover/selección de ítem. */
export const rootsDropdownItemRadiusClass = "rounded-[4px]"

/** space.025 — separación entre pastillas de ítem. */
export const rootsDropdownItemStackGapClass = "gap-0.5"

/** motion.duration.short — hover/selected en ítems. */
export const rootsDropdownItemMotionClass =
  "transition-[color,background-color] duration-150 ease-out"

/** Check trailing — savia-600 light · savia-400 dark. */
export const rootsDropdownCheckIconLightClass = "size-4 shrink-0 text-[var(--rootsy-savia-600)]"
export const rootsDropdownCheckIconDarkClass = "size-4 shrink-0 text-[var(--rootsy-savia-400)]"

export function rootsDropdownCheckIconClassForTheme(theme: "light" | "dark" = "light") {
  return theme === "dark" ? rootsDropdownCheckIconDarkClass : rootsDropdownCheckIconLightClass
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
  "px-1 py-2",
)

export const rootsDropdownContentSurfaceLightClass = cn(
  rootsDropdownPanelRadiusClass,
  "border border-[var(--rootsy-bruma-200)] bg-white",
  "shadow-[0_22px_70px_-18px_rgba(0,0,0,0.28)]",
)

export const rootsDropdownContentSurfaceDarkClass = cn(
  rootsDropdownPanelRadiusClass,
  "border border-black/[0.04] bg-[#121816]",
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
  "text-[var(--rootsy-white)]",
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

/** dropdown.item.hover dark — sombra-600. */
const dropdownItemDarkHoverClass = cn(
  "focus:bg-[var(--rootsy-sombra-600)] focus:text-[var(--rootsy-white)]",
  "data-[highlighted]:bg-[var(--rootsy-sombra-600)] data-[highlighted]:text-[var(--rootsy-white)]",
)

/** dropdown.item.selected dark — savia tint sobre elevation.surface.overlay (#121816). */
const dropdownItemDarkSelectedSurfaceClass = cn(
  "bg-[color-mix(in_srgb,var(--rootsy-savia-500)_18%,#121816)] font-medium text-[var(--rootsy-white)]",
  "focus:bg-[color-mix(in_srgb,var(--rootsy-savia-500)_18%,#121816)] focus:text-[var(--rootsy-white)]",
  "data-[highlighted]:bg-[color-mix(in_srgb,var(--rootsy-savia-500)_18%,#121816)] data-[highlighted]:text-[var(--rootsy-white)]",
)

export const rootsDropdownItemDarkClass = cn(
  dropdownItemBaseClass,
  "min-h-10 text-[var(--rootsy-white)]",
  "[&_svg:not([class*='text-'])]:text-[var(--rootsy-bruma-400)]",
  dropdownItemDarkHoverClass,
)

export const rootsDropdownItemDarkCompactClass = cn(rootsDropdownItemDarkClass, "min-h-8")

export const rootsDropdownItemDarkSelectedClass = cn(
  dropdownItemBaseClass,
  "min-h-10 text-[var(--rootsy-white)]",
  "[&_svg:not([class*='text-'])]:text-[var(--rootsy-bruma-400)]",
  dropdownItemDarkSelectedSurfaceClass,
)

export const rootsDropdownItemDarkSelectedCompactClass = cn(
  rootsDropdownItemDarkSelectedClass,
  "min-h-8",
)

export const rootsDropdownLabelLightClass =
  "px-3 pb-1 pt-2 font-canopy text-xs font-medium leading-4 text-[var(--rootsy-bruma-500)]"

export const rootsDropdownLabelDarkClass =
  "px-3 pb-1 pt-2 font-canopy text-xs font-medium leading-4 text-[var(--rootsy-bruma-400)]"

export const rootsDropdownSeparatorLightClass =
  "mx-2 my-1 h-px shrink-0 bg-[var(--rootsy-bruma-200)]"

export const rootsDropdownSeparatorDarkClass =
  "mx-2 my-1 h-px shrink-0 bg-[var(--rootsy-sombra-600)]"

export const rootsDropdownDestructiveItemClass = cn(
  "text-[var(--color-status-danger,#dc2626)]",
  "focus:bg-[color-mix(in_srgb,var(--color-status-danger,#dc2626)_8%,var(--rootsy-white))]",
  "data-[highlighted]:bg-[color-mix(in_srgb,var(--color-status-danger,#dc2626)_8%,var(--rootsy-white))]",
  "focus:text-[var(--color-status-danger,#dc2626)] data-[highlighted]:text-[var(--color-status-danger,#dc2626)]",
  "[&_svg]:!text-[var(--color-status-danger,#dc2626)]",
)

export const rootsDropdownDestructiveItemDarkClass = cn(
  "text-[var(--color-status-danger,#dc2626)]",
  `focus:bg-[color-mix(in_srgb,${statusDangerHex}_8%,#121816)]`,
  `data-[highlighted]:bg-[color-mix(in_srgb,${statusDangerHex}_8%,#121816)]`,
  "focus:text-[var(--color-status-danger,#dc2626)] data-[highlighted]:text-[var(--color-status-danger,#dc2626)]",
  "[&_svg]:!text-[var(--color-status-danger,#dc2626)]",
)

export function rootsDropdownContentClassForTheme(theme: "light" | "dark" = "light") {
  return theme === "dark" ? rootsDropdownContentDarkClass : rootsDropdownContentLightClass
}

export function rootsDropdownItemClassForTheme(
  theme: "light" | "dark" = "light",
  density: "default" | "compact" = "default",
  options?: { selected?: boolean },
) {
  const selected = options?.selected ?? false

  if (theme === "dark") {
    if (selected) {
      return density === "compact"
        ? rootsDropdownItemDarkSelectedCompactClass
        : rootsDropdownItemDarkSelectedClass
    }
    return density === "compact" ? rootsDropdownItemDarkCompactClass : rootsDropdownItemDarkClass
  }

  if (selected) {
    return density === "compact"
      ? rootsDropdownItemLightSelectedCompactClass
      : rootsDropdownItemLightSelectedClass
  }
  return density === "compact" ? rootsDropdownItemLightCompactClass : rootsDropdownItemLightClass
}

export function rootsDropdownLabelClassForTheme(theme: "light" | "dark" = "light") {
  return theme === "dark" ? rootsDropdownLabelDarkClass : rootsDropdownLabelLightClass
}

export function rootsDropdownSeparatorClassForTheme(theme: "light" | "dark" = "light") {
  return theme === "dark" ? rootsDropdownSeparatorDarkClass : rootsDropdownSeparatorLightClass
}
