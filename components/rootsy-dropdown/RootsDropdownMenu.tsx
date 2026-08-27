"use client"

import {
  resolveRootsButtonAtmosphere,
  type RootsButtonAtmosphere,
} from "@/components/rootsy-button/rootsButtonAtmosphere"
import { useRootsButtonAtmosphere } from "@/components/rootsy-button/rootsButtonAtmosphereContext"
import {
  getDropdownContentStyle,
  getDropdownItemLayoutStyle,
  getDropdownLabelStyle,
  getDropdownSeparatorStyle,
  ROOTSY_DROPDOWN_CONTENT_SIDE_OFFSET,
  type DropdownDensityId,
  type DropdownThemeId,
} from "@/components/rootsy-dropdown/rootsDropdownSpecRuntime"
import {
  rootsDropdownCheckIconClassForAtmosphere,
  rootsDropdownContentClassForAtmosphere,
  rootsDropdownDestructiveItemClassForAtmosphere,
  rootsDropdownItemClassForAtmosphere,
  rootsDropdownLabelClassForAtmosphere,
  rootsDropdownSeparatorClassForAtmosphere,
} from "@/components/rootsy-dropdown/rootsDropdownStyles"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { CheckIcon } from "lucide-react"
import type { ComponentProps, CSSProperties } from "react"

type ThemeProps = {
  /** Luz del handbook. Si no viene, hereda del provider o de `theme`. */
  atmosphere?: RootsButtonAtmosphere
  /** @deprecated Preferí `atmosphere`. light = bruma · dark = sombra. */
  theme?: DropdownThemeId
  density?: DropdownDensityId
}

function useResolvedDropdownAtmosphere(
  atmosphere?: RootsButtonAtmosphere,
  theme?: DropdownThemeId,
) {
  const inherited = useRootsButtonAtmosphere(atmosphere)
  return resolveRootsButtonAtmosphere({
    atmosphere: inherited,
    theme: theme === "dark" ? "pos" : "workspace",
  })
}

type RootsDropdownContentProps = ComponentProps<typeof DropdownMenuContent> & ThemeProps

export function RootsDropdownContent({
  atmosphere,
  theme,
  density = "default",
  className,
  style,
  sideOffset = ROOTSY_DROPDOWN_CONTENT_SIDE_OFFSET,
  ...props
}: RootsDropdownContentProps) {
  const resolvedAtmosphere = useResolvedDropdownAtmosphere(atmosphere, theme)
  const panelStyle = getDropdownContentStyle(theme, density, resolvedAtmosphere)

  return (
    <DropdownMenuContent
      data-rootsy-atmosphere={resolvedAtmosphere}
      sideOffset={sideOffset}
      className={cn(rootsDropdownContentClassForAtmosphere(resolvedAtmosphere), className)}
      style={{ ...panelStyle, ...style }}
      {...props}
    />
  )
}

type RootsDropdownItemProps = ComponentProps<typeof DropdownMenuItem> &
  ThemeProps & {
    selected?: boolean
    /** Check trailing savia — default true cuando selected. */
    showCheck?: boolean
    itemStyle?: CSSProperties
  }

export function RootsDropdownItem({
  atmosphere,
  theme,
  density = "default",
  selected = false,
  showCheck,
  variant = "default",
  className,
  style,
  itemStyle,
  asChild,
  children,
  ...props
}: RootsDropdownItemProps) {
  const resolvedAtmosphere = useResolvedDropdownAtmosphere(atmosphere, theme)
  const destructive = variant === "destructive"
  const shouldShowCheck = !asChild && (showCheck ?? selected)

  return (
    <DropdownMenuItem
      asChild={asChild}
      variant={variant}
      data-rootsy-atmosphere={resolvedAtmosphere}
      className={cn(
        rootsDropdownItemClassForAtmosphere(resolvedAtmosphere, density, { selected }),
        destructive && rootsDropdownDestructiveItemClassForAtmosphere(resolvedAtmosphere),
        className,
      )}
      style={{
        ...getDropdownItemLayoutStyle(theme, density),
        ...itemStyle,
        ...style,
      }}
      {...props}
    >
      {asChild ? (
        children
      ) : (
        <>
          {children}
          {shouldShowCheck ? (
            <CheckIcon
              className={rootsDropdownCheckIconClassForAtmosphere(resolvedAtmosphere)}
              aria-hidden
            />
          ) : null}
        </>
      )}
    </DropdownMenuItem>
  )
}

type RootsDropdownLabelProps = ComponentProps<typeof DropdownMenuLabel> & ThemeProps

export function RootsDropdownLabel({
  atmosphere,
  theme,
  className,
  style,
  ...props
}: RootsDropdownLabelProps) {
  const resolvedAtmosphere = useResolvedDropdownAtmosphere(atmosphere, theme)
  return (
    <DropdownMenuLabel
      data-rootsy-atmosphere={resolvedAtmosphere}
      className={cn(rootsDropdownLabelClassForAtmosphere(resolvedAtmosphere), className)}
      style={{ ...getDropdownLabelStyle(theme, resolvedAtmosphere), ...style }}
      {...props}
    />
  )
}

type RootsDropdownSeparatorProps = ComponentProps<typeof DropdownMenuSeparator> & ThemeProps

export function RootsDropdownSeparator({
  atmosphere,
  theme,
  className,
  style,
  ...props
}: RootsDropdownSeparatorProps) {
  const resolvedAtmosphere = useResolvedDropdownAtmosphere(atmosphere, theme)
  return (
    <DropdownMenuSeparator
      data-rootsy-atmosphere={resolvedAtmosphere}
      className={cn(rootsDropdownSeparatorClassForAtmosphere(resolvedAtmosphere), className)}
      style={{ ...getDropdownSeparatorStyle(theme, resolvedAtmosphere), ...style }}
      {...props}
    />
  )
}

type RootsDropdownCheckboxItemProps = ComponentProps<typeof DropdownMenuCheckboxItem> & ThemeProps

export function RootsDropdownCheckboxItem({
  atmosphere,
  theme,
  density = "default",
  className,
  children,
  checked,
  ...props
}: RootsDropdownCheckboxItemProps) {
  const resolvedAtmosphere = useResolvedDropdownAtmosphere(atmosphere, theme)
  return (
    <DropdownMenuCheckboxItem
      checked={checked}
      data-rootsy-atmosphere={resolvedAtmosphere}
      className={cn(
        rootsDropdownItemClassForAtmosphere(resolvedAtmosphere, density, {
          selected: Boolean(checked),
        }),
        "pr-3 pl-3 [&>span:first-child]:hidden",
        className,
      )}
      style={getDropdownItemLayoutStyle(theme, density)}
      {...props}
    >
      <span className="flex w-full items-center gap-3">
        <span className="min-w-0 flex-1">{children}</span>
        {checked ? (
          <CheckIcon
            className={rootsDropdownCheckIconClassForAtmosphere(resolvedAtmosphere)}
            aria-hidden
          />
        ) : null}
      </span>
    </DropdownMenuCheckboxItem>
  )
}

export {
  DropdownMenu as RootsDropdownMenu,
  DropdownMenuTrigger as RootsDropdownTrigger,
  DropdownMenuGroup as RootsDropdownGroup,
  DropdownMenuPortal as RootsDropdownPortal,
  DropdownMenuShortcut as RootsDropdownShortcut,
  DropdownMenuSub as RootsDropdownSub,
  DropdownMenuSubTrigger as RootsDropdownSubTrigger,
  DropdownMenuSubContent as RootsDropdownSubContent,
}
