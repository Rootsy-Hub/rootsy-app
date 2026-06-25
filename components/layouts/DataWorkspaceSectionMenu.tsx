"use client"

import { dataWorkspaceHeaderIconButtonClass } from "@/components/layouts/dataWorkspaceHeaderStyles"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { Check, ChevronDown, LayoutGrid, Sparkles } from "lucide-react"
import type {
  DataWorkspaceSidebarCreationItem,
  DataWorkspaceSidebarViewItem,
} from "./DataWorkspaceSidebar"

export type DataWorkspaceSectionMenuProps = {
  /** Acciones de creación en el menú (preferí `headerActions` con íconos). */
  creationItems?: readonly DataWorkspaceSidebarCreationItem[]
  viewItems: readonly DataWorkspaceSidebarViewItem[]
  activeId: string
  onSelect: (id: string) => void
  creationSectionLabel?: string
  viewsSectionLabel?: string
  headerVariant?: "default" | "dark"
}

export function DataWorkspaceSectionMenu({
  creationItems = [],
  viewItems,
  activeId,
  onSelect,
  creationSectionLabel = "Nuevo",
  viewsSectionLabel = "Vista",
  headerVariant = "default",
}: DataWorkspaceSectionMenuProps) {
  const isDarkHeader = headerVariant === "dark"
  const activeView =
    viewItems.find((item) => item.id === activeId) ??
    viewItems[0] ??
    null
  const activeCreation = creationItems.find((item) => item.id === activeId)
  const displayItem = activeView ?? activeCreation
  const displayLabel = displayItem?.label ?? "Vista"
  const DisplayIcon = displayItem?.icon ?? LayoutGrid

  const triggerClass = cn(
    dataWorkspaceHeaderIconButtonClass(isDarkHeader ? "dark" : "default"),
    "h-10 w-auto max-w-[min(100%,11rem)] gap-2 px-2.5 text-sm font-medium",
  )

  if (viewItems.length === 0 && creationItems.length === 0) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={triggerClass}
          aria-label={`Vista actual: ${displayLabel}`}
        >
          <DisplayIcon className="size-4 shrink-0 opacity-85" aria-hidden />
          <span className="min-w-0 truncate">{displayLabel}</span>
          <ChevronDown className="size-4 shrink-0 opacity-60" aria-hidden />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {creationItems.length > 0 ? (
          <>
            <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {creationSectionLabel}
            </DropdownMenuLabel>
            {creationItems.map((item) => {
              const Icon = item.icon ?? Sparkles
              const selected = activeId === item.id
              return (
                <DropdownMenuItem
                  key={item.id}
                  className="gap-2"
                  onClick={() => onSelect(item.id)}
                >
                  <Icon className="size-4 shrink-0 opacity-70" aria-hidden />
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                  {selected ? (
                    <Check className="size-4 shrink-0 text-primary" aria-hidden />
                  ) : null}
                </DropdownMenuItem>
              )
            })}
            {viewItems.length > 0 ? <DropdownMenuSeparator /> : null}
          </>
        ) : null}
        {viewItems.length > 0 ? (
          <>
            <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {viewsSectionLabel}
            </DropdownMenuLabel>
            {viewItems.map((item) => {
              const Icon = item.icon
              const selected = activeId === item.id
              return (
                <DropdownMenuItem
                  key={item.id}
                  className="gap-2"
                  onClick={() => onSelect(item.id)}
                >
                  {Icon ? (
                    <Icon className="size-4 shrink-0 opacity-70" aria-hidden />
                  ) : (
                    <span className="size-4 shrink-0" aria-hidden />
                  )}
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                  {selected ? (
                    <Check className="size-4 shrink-0 text-primary" aria-hidden />
                  ) : null}
                </DropdownMenuItem>
              )
            })}
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
