"use client"

import {
  dataWorkspaceHeaderDropdownContentClassForVariant,
  dataWorkspaceHeaderDropdownLabelClassForVariant,
  dataWorkspaceHeaderDropdownSeparatorClassForVariant,
  dataWorkspaceSectionMenuTriggerClass,
  isDarkChromeHeader,
  type DataWorkspaceHeaderVariant,
} from "@/components/layouts/dataWorkspaceHeaderStyles"
import {
  RootsDropdownContent,
  RootsDropdownItem,
  RootsDropdownLabel,
  RootsDropdownMenu,
  RootsDropdownSeparator,
  RootsDropdownTrigger,
} from "@/components/rootsy-dropdown"
import { ChevronDown, LayoutGrid, Sparkles } from "lucide-react"
import type {
  DataWorkspaceSidebarCreationItem,
  DataWorkspaceSidebarViewItem,
} from "./dataWorkspaceNavItems"

export type DataWorkspaceSectionMenuProps = {
  /** Acciones de creación en el menú (preferí `headerActions` con íconos). */
  creationItems?: readonly DataWorkspaceSidebarCreationItem[]
  viewItems: readonly DataWorkspaceSidebarViewItem[]
  activeId: string
  onSelect: (id: string) => void
  creationSectionLabel?: string
  viewsSectionLabel?: string
  headerVariant?: DataWorkspaceHeaderVariant
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
  const theme = isDarkChromeHeader(headerVariant) ? "dark" : "light"
  const activeView =
    viewItems.find((item) => item.id === activeId) ??
    viewItems[0] ??
    null
  const activeCreation = creationItems.find((item) => item.id === activeId)
  const displayItem = activeView ?? activeCreation
  const displayLabel = displayItem?.label ?? "Vista"
  const DisplayIcon = displayItem?.icon ?? LayoutGrid

  const triggerClass = dataWorkspaceSectionMenuTriggerClass(headerVariant)
  const dropdownContentClass = dataWorkspaceHeaderDropdownContentClassForVariant(headerVariant)
  const dropdownLabelClass = dataWorkspaceHeaderDropdownLabelClassForVariant(headerVariant)
  const dropdownSeparatorClass = dataWorkspaceHeaderDropdownSeparatorClassForVariant(headerVariant)

  if (viewItems.length === 0 && creationItems.length === 0) {
    return null
  }

  return (
    <RootsDropdownMenu>
      <RootsDropdownTrigger asChild>
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
      </RootsDropdownTrigger>
      <RootsDropdownContent theme={theme} align="end" className={dropdownContentClass}>
        {creationItems.length > 0 ? (
          <>
            <RootsDropdownLabel theme={theme} className={dropdownLabelClass}>
              {creationSectionLabel}
            </RootsDropdownLabel>
            {creationItems.map((item) => {
              const Icon = item.icon ?? Sparkles
              const selected = activeId === item.id
              return (
                <RootsDropdownItem
                  key={item.id}
                  theme={theme}
                  selected={selected}
                  className="gap-2"
                  onSelect={() => onSelect(item.id)}
                >
                  <Icon className="size-4 shrink-0 opacity-70" aria-hidden />
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                </RootsDropdownItem>
              )
            })}
            {viewItems.length > 0 ? (
              <RootsDropdownSeparator theme={theme} className={dropdownSeparatorClass} />
            ) : null}
          </>
        ) : null}
        {viewItems.length > 0 ? (
          <>
            <RootsDropdownLabel theme={theme} className={dropdownLabelClass}>
              {viewsSectionLabel}
            </RootsDropdownLabel>
            {viewItems.map((item) => {
              const Icon = item.icon
              const selected = activeId === item.id
              return (
                <RootsDropdownItem
                  key={item.id}
                  theme={theme}
                  selected={selected}
                  className="gap-2"
                  onSelect={() => onSelect(item.id)}
                >
                  {Icon ? (
                    <Icon className="size-4 shrink-0 opacity-70" aria-hidden />
                  ) : (
                    <span className="size-4 shrink-0" aria-hidden />
                  )}
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                </RootsDropdownItem>
              )
            })}
          </>
        ) : null}
      </RootsDropdownContent>
    </RootsDropdownMenu>
  )
}
