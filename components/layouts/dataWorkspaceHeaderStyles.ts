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
import { cn } from "@/lib/utils"
import { popHeaderGlassBorderClass } from "@/components/layouts/popHeaderBackdropStyles"

export type DataWorkspaceHeaderVariant = "default" | "dark" | "night"
export const nightForestSurfaceClass =
  "border-[#263530]/90 bg-[linear-gradient(165deg,#060908_0%,#0c1210_52%,#141c19_100%)]"

export const nightForestPanelClass = "border-[#263530]/90 bg-[#141c19]"
export const nightForestPanelHoverClass = "hover:border-[#33443d]/70 hover:bg-[#1c2824]"

/** IconButton oscuro — gama noche (cristal + hairline). */
export const nightForestIconButtonStarSkinClass = rootsIconButtonNightChromeClass

/** Focus en iconos nocturnos — halo lunar, no emerald duro. */
export const nightForestIconButtonFocusRingClass =
  rootsIconButtonNightFocusRingClass
export const nightForestBorderClass = "border-[#263530]/90"
export const nightForestDividerClass = "bg-[#263530]/80"
export const nightForestMutedTextClass = "text-[#78716c]"
export const nightForestFocusRingClass =
  "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-400/25"

/** Header oscuro operativo — bosque nocturno (`dark` y `night` son equivalentes). */
export function isNightForestHeader(
  headerVariant: DataWorkspaceHeaderVariant = "default",
): boolean {
  return headerVariant === "dark" || headerVariant === "night"
}

/** @deprecated Usar isNightForestHeader */
export const isNightSkyHeader = isNightForestHeader

export function isDataWorkspaceTintedHeader(
  headerVariant: DataWorkspaceHeaderVariant = "default",
): boolean {
  return isNightForestHeader(headerVariant)
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
  if (isNightForestHeader(headerVariant)) {
    return cn(
      "data-[state=open]:border-[#33443d] data-[state=open]:bg-[#1c2824] data-[state=open]:text-[#e7e5e4]",
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

export function dataWorkspaceHeaderIconButtonClass(
  headerVariant: DataWorkspaceHeaderVariant = "default",
  options?: { primary?: boolean },
): string {
  const primary = options?.primary ?? false
  if (isNightForestHeader(headerVariant)) {
    return cn(
      "group inline-flex size-10 shrink-0 items-center justify-center rounded-xl border transition-all",
      dataWorkspaceHeaderButtonFocusClass,
      dataWorkspaceHeaderButtonOpenClass(headerVariant),
      nightForestIconButtonStarSkinClass,
      "disabled:pointer-events-none disabled:opacity-40",
    )
  }
  if (primary) {
    return cn(
      "group inline-flex size-10 shrink-0 items-center justify-center rounded-xl border transition-all",
      "border-primary/30 bg-primary/10 text-primary",
      "hover:border-primary/40 hover:bg-primary/15",
      "disabled:pointer-events-none disabled:opacity-40",
    )
  }
  return cn(
    "group inline-flex size-10 shrink-0 items-center justify-center rounded-xl border transition-all",
    dataWorkspaceHeaderButtonFocusClass,
    dataWorkspaceHeaderButtonOpenClass(headerVariant),
    "border-foreground/10 bg-secondary text-muted-foreground hover:border-primary/25 hover:bg-muted hover:text-foreground",
    "disabled:pointer-events-none disabled:opacity-40",
  )
}

export function dataWorkspaceSectionMenuTriggerClass(
  headerVariant: DataWorkspaceHeaderVariant = "default",
): string {
  if (isNightForestHeader(headerVariant)) {
    return cn(
      "group inline-flex h-10 w-auto max-w-[min(100%,13rem)] shrink-0 items-center gap-2 rounded-xl border px-2.5 text-sm font-semibold transition-all",
      dataWorkspaceHeaderButtonFocusClass,
      "border-emerald-500/35 bg-emerald-500/10 text-emerald-100",
      "shadow-[inset_0_1px_0_rgba(168,235,196,0.08)]",
      "hover:border-emerald-400/50 hover:bg-emerald-500/16 hover:text-white",
      "data-[state=open]:border-emerald-400/55 data-[state=open]:bg-emerald-500/18 data-[state=open]:text-white",
      "data-[state=open]:ring-0 data-[state=open]:outline-none",
      "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-400/30",
      "[&_svg]:text-emerald-300/95",
    )
  }
  return cn(
    "group inline-flex h-10 w-auto max-w-[min(100%,11rem)] shrink-0 items-center gap-2 rounded-xl border px-2.5 text-sm font-semibold transition-all",
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
  const theme = isNightForestHeader(headerVariant) ? "dark" : "light"
  return cn("gap-2", rootsDropdownItemClassForTheme(theme, "default", { selected }))
}

/** Check trailing en ítem seleccionado — savia-600 light · savia-400 dark. */
export function dataWorkspaceDropdownCheckIconClass(
  headerVariant: DataWorkspaceHeaderVariant = "default",
): string {
  return isNightForestHeader(headerVariant)
    ? "text-[var(--rootsy-savia-400)]"
    : "text-[var(--rootsy-savia-600)]"
}

export const dataWorkspaceNightHeaderDropdownContentClass = cn(
  "relative w-56",
  rootsDropdownContentDarkClass,
  "data-[side=bottom]:slide-in-from-top-0 data-[side=top]:slide-in-from-bottom-0",
  "data-[side=left]:slide-in-from-right-0 data-[side=right]:slide-in-from-left-0",
)

/** @deprecated Alias de dataWorkspaceNightHeaderDropdownContentClass */
export const dataWorkspaceHeaderDropdownContentClass =
  dataWorkspaceNightHeaderDropdownContentClass

export function dataWorkspaceHeaderDropdownContentClassForVariant(
  headerVariant: DataWorkspaceHeaderVariant = "default",
): string {
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

export const dataWorkspaceLightDropdownLogoutItemClass = rootsDropdownDestructiveItemClass

export const dataWorkspaceNightHeaderDropdownLabelClass = rootsDropdownLabelDarkClass

/** @deprecated Alias de dataWorkspaceNightHeaderDropdownLabelClass */
export const dataWorkspaceHeaderDropdownLabelClass =
  dataWorkspaceNightHeaderDropdownLabelClass

export function dataWorkspaceHeaderDropdownLabelClassForVariant(
  headerVariant: DataWorkspaceHeaderVariant = "default",
): string {
  if (isNightForestHeader(headerVariant)) {
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
  if (isNightForestHeader(headerVariant)) {
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
  if (isNightForestHeader(headerVariant)) {
    return dataWorkspaceNightHeaderDropdownSeparatorClass
  }
  return dataWorkspaceLightDropdownSeparatorClass
}

export const dataWorkspaceHeaderDropdownLogoutItemClass = rootsDropdownDestructiveItemDarkClass

export function dataWorkspaceHeaderDividerClass(
  headerVariant: DataWorkspaceHeaderVariant = "default",
): string {
  if (isNightForestHeader(headerVariant)) return nightForestDividerClass
  return "bg-border"
}

export function dataWorkspaceHeaderPopRingClass(
  headerVariant: DataWorkspaceHeaderVariant = "default",
): string {
  if (isNightForestHeader(headerVariant)) return "ring-[#33443d]"
  return "ring-border"
}

export function dataWorkspaceHeaderSurfaceClass(
  headerVariant: DataWorkspaceHeaderVariant = "default",
): string {
  if (isNightForestHeader(headerVariant)) {
    return cn(dataWorkspaceNightHeaderSurfaceClass, "text-zinc-100")
  }
  return "border-rootsy-hairline bg-card/90"
}

export function dataWorkspaceHeaderToolbarClass(
  headerVariant: DataWorkspaceHeaderVariant = "default",
): string {
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
  if (isNightForestHeader(headerVariant)) {
    return cn(
      "border-white/8 bg-[#141c19] text-[#78716c]",
      nightForestPanelHoverClass,
      "hover:text-[#d6d3d1]",
    )
  }
  return "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
}

export function dataWorkspaceHeaderRoleLabelClass(
  headerVariant: DataWorkspaceHeaderVariant = "default",
  hasRole: boolean,
): string {
  if (hasRole) {
    if (isNightForestHeader(headerVariant)) return "text-emerald-300/90"
    return "text-emerald-700"
  }
  if (isNightForestHeader(headerVariant)) return nightForestMutedTextClass
  return "text-muted-foreground"
}

/** @deprecated Usar dataWorkspaceHeaderDropdownItemClassForVariant */
export const dataWorkspaceHeaderDropdownItemClass =
  dataWorkspaceNightHeaderDropdownItemClass
