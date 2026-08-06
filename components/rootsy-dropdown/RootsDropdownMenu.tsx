"use client"

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
  rootsDropdownCheckIconClassForTheme,
  rootsDropdownContentClassForTheme,
  rootsDropdownDestructiveItemClass,
  rootsDropdownDestructiveItemDarkClass,
  rootsDropdownItemClassForTheme,
  rootsDropdownLabelClassForTheme,
  rootsDropdownSeparatorClassForTheme,
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
  theme?: DropdownThemeId
  density?: DropdownDensityId
}

type RootsDropdownContentProps = ComponentProps<typeof DropdownMenuContent> & ThemeProps

export function RootsDropdownContent({
  theme = "light",
  density = "default",
  className,
  style,
  sideOffset = ROOTSY_DROPDOWN_CONTENT_SIDE_OFFSET,
  ...props
}: RootsDropdownContentProps) {
  const panelStyle = getDropdownContentStyle(theme, density)

  return (
    <DropdownMenuContent
      sideOffset={sideOffset}
      className={cn(rootsDropdownContentClassForTheme(theme), className)}
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
  theme = "light",
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
  const destructive = variant === "destructive"
  const shouldShowCheck = !asChild && (showCheck ?? selected)

  return (
    <DropdownMenuItem
      asChild={asChild}
      variant={variant}
      className={cn(
        rootsDropdownItemClassForTheme(theme, density, { selected }),
        destructive &&
          (theme === "dark"
            ? rootsDropdownDestructiveItemDarkClass
            : rootsDropdownDestructiveItemClass),
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
            <CheckIcon className={rootsDropdownCheckIconClassForTheme(theme)} aria-hidden />
          ) : null}
        </>
      )}
    </DropdownMenuItem>
  )
}

type RootsDropdownLabelProps = ComponentProps<typeof DropdownMenuLabel> & ThemeProps

export function RootsDropdownLabel({
  theme = "light",
  className,
  style,
  ...props
}: RootsDropdownLabelProps) {
  return (
    <DropdownMenuLabel
      className={cn(rootsDropdownLabelClassForTheme(theme), className)}
      style={{ ...getDropdownLabelStyle(theme), ...style }}
      {...props}
    />
  )
}

type RootsDropdownSeparatorProps = ComponentProps<typeof DropdownMenuSeparator> & ThemeProps

export function RootsDropdownSeparator({
  theme = "light",
  className,
  style,
  ...props
}: RootsDropdownSeparatorProps) {
  return (
    <DropdownMenuSeparator
      className={cn(rootsDropdownSeparatorClassForTheme(theme), className)}
      style={{ ...getDropdownSeparatorStyle(theme), ...style }}
      {...props}
    />
  )
}

type RootsDropdownCheckboxItemProps = ComponentProps<typeof DropdownMenuCheckboxItem> & ThemeProps

export function RootsDropdownCheckboxItem({
  theme = "light",
  density = "default",
  className,
  children,
  checked,
  ...props
}: RootsDropdownCheckboxItemProps) {
  return (
    <DropdownMenuCheckboxItem
      checked={checked}
      className={cn(
        rootsDropdownItemClassForTheme(theme, density, { selected: Boolean(checked) }),
        "pr-3 pl-3 [&>span:first-child]:hidden",
        className,
      )}
      style={getDropdownItemLayoutStyle(theme, density)}
      {...props}
    >
      <span className="flex w-full items-center gap-3">
        <span className="min-w-0 flex-1">{children}</span>
        {checked ? (
          <CheckIcon className={rootsDropdownCheckIconClassForTheme(theme)} aria-hidden />
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
