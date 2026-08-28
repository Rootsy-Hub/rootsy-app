import {
  rootsIconButtonNightChromeClass,
  rootsIconButtonNightFocusRingClass,
} from "@/components/rootsy-button/rootsIconButtonNightStyles"
import {
  rootsDropdownContentDarkClass,
  rootsDropdownContentLightClass,
  rootsDropdownDestructiveItemClass,
  rootsDropdownDestructiveItemDarkClass,
  rootsDropdownItemClassForTheme,
  rootsDropdownItemDarkClass,
  rootsDropdownItemDarkSelectedClass,
  rootsDropdownItemLightClass,
  rootsDropdownItemLightSelectedClass,
  rootsDropdownLabelDarkClass,
  rootsDropdownLabelLightClass,
  rootsDropdownSeparatorDarkClass,
  rootsDropdownSeparatorLightClass,
} from "@/components/rootsy-dropdown/rootsDropdownStyles"
import {
  layoutsTablesChromeIconButtonClass,
  layoutsTablesChromeSurfaceClass,
} from "@/components/layouts-tables/rootsLayoutsTablesProductStyles"
import { cn } from "@/lib/utils"
import { popHeaderGlassBorderClass } from "@/components/layouts/popHeaderBackdropStyles"
import {
  eterHeaderBodyClass,
  eterHeaderDropdownSurfaceClass,
  eterHeaderMutedClass,
} from "@/lib/eter/eterChrome"

export type DataWorkspaceHeaderVariant = "default" | "dark" | "night" | "tables"
export const nightForestSurfaceClass =
  "border-[#263530]/90 bg-[linear-gradient(165deg,#060908_0%,#0c1210_52%,#141c19_100%)]"

export const nightForestPanelClass = "border-[#263530]/90 bg-[#141c19]"
export const nightForestPanelHoverClass = "hover:border-[#33443d]/70 hover:bg-[#1c2824]"

/** IconButton oscuro — gama noche (cristal + hairline). */
export const nightForestIconButtonStarSkinClass = rootsIconButtonNightChromeClass

/** Focus en iconos nocturnos — halo lunar, no emerald duro. */
export const nightForestIconButtonFocusRingClass =
  rootsIconButtonNightFocusRingClass
export const nightForestBorderClass = "border-[color:var(--rootsy-sombra-600)]/90"
export const nightForestDividerClass = "bg-[color:var(--rootsy-sombra-600)]/80"
export const nightForestMutedTextClass = "text-[color:var(--rootsy-bruma-500)]"
export const nightForestFocusRingClass =
  "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[color:var(--rootsy-savia-400)]/25"

/** Header oscuro operativo — bosque nocturno (`dark` y `night` son equivalentes). */
export function isNightForestHeader(
  headerVariant: DataWorkspaceHeaderVariant = "default",
): boolean {
  return headerVariant === "dark" || headerVariant === "night"
}

/** Header chrome oscuro — incluye layout tablas (sombra) y bosque nocturno. */
export function isDarkChromeHeader(
  headerVariant: DataWorkspaceHeaderVariant = "default",
): boolean {
  return isNightForestHeader(headerVariant) || headerVariant === "tables"
}

export function isLayoutsTablesHeader(
  headerVariant: DataWorkspaceHeaderVariant = "default",
): boolean {
  return headerVariant === "tables"
}

/** @deprecated Usar isNightForestHeader */
export const isNightSkyHeader = isNightForestHeader

export function isDataWorkspaceTintedHeader(
  headerVariant: DataWorkspaceHeaderVariant = "default",
): boolean {
  return isDarkChromeHeader(headerVariant)
}

/** Superficie bosque nocturno — carbón vegetal. */
export const dataWorkspaceNightHeaderSurfaceClass = nightForestSurfaceClass

/** @deprecated Alias de dataWorkspaceNightHeaderSurfaceClass */
export const dataWorkspaceDarkHeaderSurfaceClass =
  dataWorkspaceNightHeaderSurfaceClass

const dataWorkspaceHeaderButtonFocusClass =
  "outline-none focus:outline-none focus-visible:outline-none"

function dataWorkspaceHeaderButtonOpenClass(
  headerVariant: DataWorkspaceHeaderVariant = "default",
): string {
  if (isLayoutsTablesHeader(headerVariant)) {
    return cn(
      "data-[state=open]:border-[color-mix(in_srgb,var(--rootsy-white)_14%,var(--rootsy-sombra-500))]",
      "data-[state=open]:bg-[color-mix(in_srgb,var(--rootsy-sombra-700)_72%,transparent)]",
      "data-[state=open]:text-white",
      "data-[state=open]:ring-0 data-[state=open]:outline-none",
      "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[color-mix(in_srgb,var(--rootsy-white)_14%,var(--rootsy-savia-400)_6%)]",
    )
  }
  if (isNightForestHeader(headerVariant)) {
    return cn(
      "data-[state=open]:border-[color:var(--rootsy-sombra-500)] data-[state=open]:bg-[color:var(--rootsy-sombra-700)] data-[state=open]:text-[color:var(--rootsy-bruma-200)]",
      "data-[state=open]:ring-0 data-[state=open]:outline-none",
      nightForestFocusRingClass,
    )
  }
  return cn(
    "data-[state=open]:border-primary/20 data-[state=open]:bg-muted data-[state=open]:text-foreground",
    "data-[state=open]:ring-0 data-[state=open]:outline-none",
    "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/15",
  )
}

export function dataWorkspaceHeaderChromeButtonClass(
  headerVariant: DataWorkspaceHeaderVariant = "default",
): string {
  if (isLayoutsTablesHeader(headerVariant)) {
    return cn(
      "group",
      layoutsTablesChromeIconButtonClass,
      dataWorkspaceHeaderButtonFocusClass,
      dataWorkspaceHeaderButtonOpenClass(headerVariant),
    )
  }
  if (isNightForestHeader(headerVariant)) {
    return cn(
      "group inline-flex size-10 shrink-0 items-center justify-center rounded-xl border transition-all",
      dataWorkspaceHeaderButtonFocusClass,
      dataWorkspaceHeaderButtonOpenClass(headerVariant),
      nightForestIconButtonStarSkinClass,
    )
  }
  return cn(
    "group inline-flex size-10 shrink-0 items-center justify-center rounded-xl border transition-all",
    dataWorkspaceHeaderButtonFocusClass,
    dataWorkspaceHeaderButtonOpenClass(headerVariant),
    "border-foreground/10 bg-secondary text-foreground/70 hover:border-primary/25 hover:bg-muted hover:text-foreground",
  )
}

const dataWorkspaceSectionMenuTriggerLayoutClass = cn(
  "group inline-flex h-10 w-10 shrink-0 items-center justify-center gap-0 rounded-xl border px-0 text-sm font-semibold transition-all",
  "md:h-10 md:w-auto md:max-w-[min(100%,13rem)] md:justify-start md:gap-2 md:px-2.5",
  "[&>span]:sr-only md:[&>span]:not-sr-only md:[&>span]:min-w-0 md:[&>span]:truncate",
  "[&>svg:last-child]:hidden md:[&>svg:last-child]:block",
)

export function dataWorkspaceSectionMenuTriggerClass(
  headerVariant: DataWorkspaceHeaderVariant = "default",
): string {
  if (isLayoutsTablesHeader(headerVariant)) {
    return cn(
      dataWorkspaceSectionMenuTriggerLayoutClass,
      dataWorkspaceHeaderButtonFocusClass,
      "border-[color-mix(in_srgb,var(--rootsy-white)_12%,var(--rootsy-savia-600))]",
      "bg-[color-mix(in_srgb,var(--rootsy-savia-600)_12%,transparent)] text-[var(--rootsy-savia-300)]",
      "hover:border-[color-mix(in_srgb,var(--rootsy-white)_16%,var(--rootsy-savia-500))]",
      "hover:bg-[color-mix(in_srgb,var(--rootsy-savia-600)_18%,transparent)] hover:text-white",
      "data-[state=open]:border-[color-mix(in_srgb,var(--rootsy-white)_18%,var(--rootsy-savia-500))]",
      "data-[state=open]:bg-[color-mix(in_srgb,var(--rootsy-savia-600)_22%,transparent)] data-[state=open]:text-white",
      "data-[state=open]:ring-0 data-[state=open]:outline-none",
      "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[color-mix(in_srgb,var(--rootsy-white)_12%,var(--rootsy-savia-400)_8%)]",
      "[&_svg]:text-[var(--rootsy-savia-400)]",
    )
  }
  if (isNightForestHeader(headerVariant)) {
    return cn(
      dataWorkspaceSectionMenuTriggerLayoutClass,
      dataWorkspaceHeaderButtonFocusClass,
      "border-[color-mix(in_srgb,var(--rootsy-white)_12%,var(--rootsy-savia-600))]",
      "bg-[color-mix(in_srgb,var(--rootsy-savia-600)_12%,transparent)] text-[var(--rootsy-savia-300)]",
      "shadow-[inset_0_1px_0_color-mix(in_srgb,var(--rootsy-savia-300)_10%,transparent)]",
      "hover:border-[color-mix(in_srgb,var(--rootsy-white)_16%,var(--rootsy-savia-500))]",
      "hover:bg-[color-mix(in_srgb,var(--rootsy-savia-600)_18%,transparent)] hover:text-white",
      "data-[state=open]:border-[color-mix(in_srgb,var(--rootsy-white)_18%,var(--rootsy-savia-500))]",
      "data-[state=open]:bg-[color-mix(in_srgb,var(--rootsy-savia-600)_22%,transparent)] data-[state=open]:text-white",
      "data-[state=open]:ring-0 data-[state=open]:outline-none",
      "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[color-mix(in_srgb,var(--rootsy-white)_12%,var(--rootsy-savia-400)_8%)]",
      "[&_svg]:text-[var(--rootsy-savia-400)]",
    )
  }
  return cn(
    dataWorkspaceSectionMenuTriggerLayoutClass,
    "md:max-w-[min(100%,11rem)]",
    dataWorkspaceHeaderButtonFocusClass,
    "border-primary/30 bg-primary/10 text-foreground",
    "hover:border-primary/40 hover:bg-primary/14",
    "data-[state=open]:border-primary/45 data-[state=open]:bg-primary/16 data-[state=open]:text-foreground",
    "data-[state=open]:ring-0 data-[state=open]:outline-none",
    "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/20",
    "[&_svg]:text-primary/85",
  )
}

export function dataWorkspaceSectionMenuDropdownItemClass(
  headerVariant: DataWorkspaceHeaderVariant = "default",
  selected = false,
): string {
  const theme = isDarkChromeHeader(headerVariant) ? "dark" : "light"
  return cn("gap-2", rootsDropdownItemClassForTheme(theme, "default", { selected }))
}

/** Check trailing en ítem seleccionado — savia-600 light · savia-400 dark. */
export function dataWorkspaceDropdownCheckIconClass(
  headerVariant: DataWorkspaceHeaderVariant = "default",
): string {
  return isDarkChromeHeader(headerVariant)
    ? "text-[var(--rootsy-savia-400)]"
    : "text-[var(--rootsy-savia-600)]"
}

const dataWorkspaceHeaderDropdownMotionClass =
  "data-[side=bottom]:slide-in-from-top-0 data-[side=top]:slide-in-from-bottom-0 data-[side=left]:slide-in-from-right-0 data-[side=right]:slide-in-from-left-0"

export const dataWorkspaceNightHeaderDropdownContentClass = cn(
  "relative w-56",
  rootsDropdownContentDarkClass,
  eterHeaderDropdownSurfaceClass,
  dataWorkspaceHeaderDropdownMotionClass,
)

export const dataWorkspaceTablesHeaderDropdownContentClass = cn(
  "relative w-56",
  rootsDropdownContentDarkClass,
  dataWorkspaceHeaderDropdownMotionClass,
)

/** @deprecated Alias de dataWorkspaceNightHeaderDropdownContentClass */
export const dataWorkspaceHeaderDropdownContentClass =
  dataWorkspaceNightHeaderDropdownContentClass

export function dataWorkspaceHeaderDropdownContentClassForVariant(
  headerVariant: DataWorkspaceHeaderVariant = "default",
): string {
  if (isLayoutsTablesHeader(headerVariant)) {
    return dataWorkspaceTablesHeaderDropdownContentClass
  }
  if (isNightForestHeader(headerVariant)) {
    return dataWorkspaceNightHeaderDropdownContentClass
  }
  return dataWorkspaceLightDropdownContentClass
}

export const dataWorkspaceNightHeaderUserDropdownContentClass = cn(
  dataWorkspaceNightHeaderDropdownContentClass,
  "origin-top-right",
)

/** @deprecated Alias de dataWorkspaceNightHeaderUserDropdownContentClass */
export const dataWorkspaceHeaderUserDropdownContentClass =
  dataWorkspaceNightHeaderUserDropdownContentClass

export function dataWorkspaceHeaderUserDropdownContentClassForVariant(
  headerVariant: DataWorkspaceHeaderVariant = "default",
): string {
  if (isLayoutsTablesHeader(headerVariant)) {
    return cn(dataWorkspaceTablesHeaderDropdownContentClass, "origin-top-right")
  }
  if (isNightForestHeader(headerVariant)) {
    return dataWorkspaceNightHeaderUserDropdownContentClass
  }
  return cn(dataWorkspaceLightDropdownContentClass, "origin-top-right")
}

export const dataWorkspaceLightDropdownContentClass = cn(
  "rootsy-app-light w-56",
  rootsDropdownContentLightClass,
  "origin-top-right",
  "data-[side=bottom]:slide-in-from-top-0 data-[side=top]:slide-in-from-bottom-0",
  "data-[side=left]:slide-in-from-right-0 data-[side=right]:slide-in-from-left-0",
)

export const dataWorkspaceLightDropdownItemClass = rootsDropdownItemLightClass

export const dataWorkspaceLightDropdownSeparatorClass = rootsDropdownSeparatorLightClass

/** Base ítem + tint destructivo — no usar solo rootsDropdownDestructiveItemClass. */
export const dataWorkspaceLightDropdownLogoutItemClass = cn(
  rootsDropdownItemLightClass,
  rootsDropdownDestructiveItemClass,
)

export const dataWorkspaceNightHeaderDropdownLabelClass = rootsDropdownLabelDarkClass

/** @deprecated Alias de dataWorkspaceNightHeaderDropdownLabelClass */
export const dataWorkspaceHeaderDropdownLabelClass =
  dataWorkspaceNightHeaderDropdownLabelClass

export function dataWorkspaceHeaderDropdownLabelClassForVariant(
  headerVariant: DataWorkspaceHeaderVariant = "default",
): string {
  if (isDarkChromeHeader(headerVariant)) {
    return dataWorkspaceNightHeaderDropdownLabelClass
  }
  return rootsDropdownLabelLightClass
}

export const dataWorkspaceNightHeaderDropdownItemClass = rootsDropdownItemDarkClass

/** @deprecated Alias de dataWorkspaceNightHeaderDropdownItemClass */
export const dataWorkspaceDarkHeaderDropdownItemClass =
  dataWorkspaceNightHeaderDropdownItemClass

export function dataWorkspaceHeaderDropdownItemClassForVariant(
  headerVariant: DataWorkspaceHeaderVariant = "default",
): string {
  if (isDarkChromeHeader(headerVariant)) {
    return dataWorkspaceNightHeaderDropdownItemClass
  }
  return dataWorkspaceLightDropdownItemClass
}

export const dataWorkspaceNightHeaderDropdownSeparatorClass = rootsDropdownSeparatorDarkClass

/** @deprecated Alias de dataWorkspaceNightHeaderDropdownSeparatorClass */
export const dataWorkspaceHeaderDropdownSeparatorClass =
  dataWorkspaceNightHeaderDropdownSeparatorClass

export function dataWorkspaceHeaderDropdownSeparatorClassForVariant(
  headerVariant: DataWorkspaceHeaderVariant = "default",
): string {
  if (isDarkChromeHeader(headerVariant)) {
    return dataWorkspaceNightHeaderDropdownSeparatorClass
  }
  return dataWorkspaceLightDropdownSeparatorClass
}

export const dataWorkspaceHeaderDropdownLogoutItemClass = rootsDropdownDestructiveItemDarkClass

export function dataWorkspaceHeaderDividerClass(
  headerVariant: DataWorkspaceHeaderVariant = "default",
): string {
  if (isLayoutsTablesHeader(headerVariant)) {
    return "bg-[var(--rootsy-sombra-600)]"
  }
  if (isNightForestHeader(headerVariant)) return nightForestDividerClass
  return "bg-border"
}

export function dataWorkspaceHeaderPopRingClass(
  headerVariant: DataWorkspaceHeaderVariant = "default",
): string {
  if (isLayoutsTablesHeader(headerVariant)) {
    return "ring-[color-mix(in_srgb,var(--rootsy-white)_12%,var(--rootsy-sombra-700))]"
  }
  if (isNightForestHeader(headerVariant)) return "ring-[#33443d]"
  return "ring-border"
}

export function dataWorkspaceHeaderSurfaceClass(
  headerVariant: DataWorkspaceHeaderVariant = "default",
): string {
  if (isLayoutsTablesHeader(headerVariant)) {
    return cn(layoutsTablesChromeSurfaceClass, "text-white")
  }
  if (isNightForestHeader(headerVariant)) {
    return cn(dataWorkspaceNightHeaderSurfaceClass, "text-zinc-100")
  }
  return "border-rootsy-hairline bg-card/90"
}

export function dataWorkspaceHeaderToolbarClass(
  headerVariant: DataWorkspaceHeaderVariant = "default",
): string {
  if (isLayoutsTablesHeader(headerVariant)) {
    return cn(
      "border-t border-[color-mix(in_srgb,var(--rootsy-sombra-600)_70%,transparent)]",
      "bg-[color-mix(in_srgb,var(--rootsy-sombra-950)_42%,transparent)] backdrop-blur-xl",
    )
  }
  if (isNightForestHeader(headerVariant)) {
    return cn(
      popHeaderGlassBorderClass,
      "border-t bg-[color-mix(in_srgb,#0c1210_42%,transparent)] backdrop-blur-xl",
    )
  }
  return "border-border/60 bg-muted/20"
}

export function dataWorkspaceHeaderEdgeToggleClass(
  headerVariant: DataWorkspaceHeaderVariant = "default",
): string {
  if (isLayoutsTablesHeader(headerVariant)) {
    return cn(
      "border-[color-mix(in_srgb,var(--rootsy-white)_8%,var(--rootsy-sombra-600))]",
      "bg-[var(--rootsy-sombra-800)] text-[var(--rootsy-sombra-400)]",
      "hover:border-[color-mix(in_srgb,var(--rootsy-white)_12%,var(--rootsy-sombra-500))]",
      "hover:bg-[var(--rootsy-sombra-700)] hover:text-[var(--rootsy-sombra-300)]",
    )
  }
  if (isNightForestHeader(headerVariant)) {
    return cn(
      "border-white/8 bg-[color:var(--rootsy-sombra-800)] text-[color:var(--rootsy-bruma-500)]",
      nightForestPanelHoverClass,
      "hover:text-[color:var(--rootsy-bruma-300)]",
    )
  }
  return "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
}

export function dataWorkspaceHeaderIdentityNameClass(
  headerVariant: DataWorkspaceHeaderVariant = "default",
): string {
  if (isLayoutsTablesHeader(headerVariant)) {
    return "antialiased text-[var(--rootsy-sombra-50)]"
  }
  if (isNightForestHeader(headerVariant)) return eterHeaderBodyClass
  return "antialiased text-[var(--rootsy-bruma-950)]"
}

export function dataWorkspaceHeaderIdentityMutedClass(
  headerVariant: DataWorkspaceHeaderVariant = "default",
): string {
  if (isLayoutsTablesHeader(headerVariant)) {
    return "text-[var(--rootsy-sombra-300)]"
  }
  if (isNightForestHeader(headerVariant)) return eterHeaderMutedClass
  return "text-[var(--rootsy-bruma-700)]"
}

export function dataWorkspaceHeaderRoleLabelClass(
  headerVariant: DataWorkspaceHeaderVariant = "default",
  hasRole: boolean,
): string {
  if (hasRole) {
    if (isLayoutsTablesHeader(headerVariant)) return "text-[var(--rootsy-savia-400)]"
    if (isNightForestHeader(headerVariant)) return "text-emerald-300/90"
    return "text-emerald-700"
  }
  if (isLayoutsTablesHeader(headerVariant)) return "text-[var(--rootsy-sombra-400)]"
  if (isNightForestHeader(headerVariant)) return nightForestMutedTextClass
  return "text-muted-foreground"
}

/** @deprecated Usar dataWorkspaceHeaderDropdownItemClassForVariant */
export const dataWorkspaceHeaderDropdownItemClass =
  dataWorkspaceNightHeaderDropdownItemClass
