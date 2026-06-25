"use client"

import {
  dataWorkspaceSectionMenuDropdownItemClass,
  dataWorkspaceSectionMenuTriggerClass,
  dataWorkspaceHeaderDropdownContentClass,
  dataWorkspaceHeaderDropdownItemClass,
  dataWorkspaceHeaderDropdownLabelClass,
  dataWorkspaceHeaderDropdownSeparatorClass,
} from "@/components/layouts/dataWorkspaceHeaderStyles"
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

  const triggerClass = dataWorkspaceSectionMenuTriggerClass(
    isDarkHeader ? "dark" : "default",
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
          aria-current="page"
        >
          <DisplayIcon className="size-4 shrink-0" aria-hidden />
          <span className="min-w-0 truncate">{displayLabel}</span>
          <ChevronDown
            className="size-4 shrink-0 opacity-70 transition-transform group-data-[state=open]:rotate-180"
            aria-hidden
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={6}
        className={
          isDarkHeader ? dataWorkspaceHeaderDropdownContentClass : "w-56"
        }
      >
        {creationItems.length > 0 ? (
          <>
            <DropdownMenuLabel
              className={
                isDarkHeader
                  ? dataWorkspaceHeaderDropdownLabelClass
                  : "text-[10px] uppercase tracking-wider text-muted-foreground"
              }
            >
              {creationSectionLabel}
            </DropdownMenuLabel>
            {creationItems.map((item) => {
              const Icon = item.icon ?? Sparkles
              const selected = activeId === item.id
              return (
                <DropdownMenuItem
                  key={item.id}
                  className={dataWorkspaceSectionMenuDropdownItemClass(
                    isDarkHeader ? "dark" : "default",
                    selected,
                  )}
                  onClick={() => onSelect(item.id)}
                >
                  <Icon className="size-4 shrink-0 opacity-70" aria-hidden />
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                  {selected ? (
                    <Check
                      className={cn(
                        "size-4 shrink-0",
                        isDarkHeader ? "text-emerald-400" : "text-primary",
                      )}
                      aria-hidden
                    />
                  ) : null}
                </DropdownMenuItem>
              )
            })}
            {viewItems.length > 0 ? (
              <DropdownMenuSeparator
                className={
                  isDarkHeader ? dataWorkspaceHeaderDropdownSeparatorClass : undefined
                }
              />
            ) : null}
          </>
        ) : null}
        {viewItems.length > 0 ? (
          <>
            <DropdownMenuLabel
              className={
                isDarkHeader
                  ? dataWorkspaceHeaderDropdownLabelClass
                  : "text-[10px] uppercase tracking-wider text-muted-foreground"
              }
            >
              {viewsSectionLabel}
            </DropdownMenuLabel>
            {viewItems.map((item) => {
              const Icon = item.icon
              const selected = activeId === item.id
              return (
                <DropdownMenuItem
                  key={item.id}
                  className={dataWorkspaceSectionMenuDropdownItemClass(
                    isDarkHeader ? "dark" : "default",
                    selected,
                  )}
                  onClick={() => onSelect(item.id)}
                >
                  {Icon ? (
                    <Icon className="size-4 shrink-0 opacity-70" aria-hidden />
                  ) : (
                    <span className="size-4 shrink-0" aria-hidden />
                  )}
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                  {selected ? (
                    <Check
                      className={cn(
                        "size-4 shrink-0",
                        isDarkHeader ? "text-emerald-400" : "text-primary",
                      )}
                      aria-hidden
                    />
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
