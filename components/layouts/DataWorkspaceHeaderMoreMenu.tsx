"use client"

import { DataWorkspaceHeaderIconButton } from "@/components/layouts/DataWorkspaceHeaderIconButton"
import {
  dataWorkspaceHeaderDropdownContentClassForVariant,
  isDarkChromeHeader,
  type DataWorkspaceHeaderVariant,
} from "@/components/layouts/dataWorkspaceHeaderStyles"
import {
  RootsDropdownContent,
  RootsDropdownItem,
  RootsDropdownMenu,
  RootsDropdownTrigger,
} from "@/components/rootsy-dropdown"
import { EllipsisVertical, type LucideIcon } from "lucide-react"

export type DataWorkspaceHeaderMoreAction = {
  label: string
  onClick: () => void
  icon: LucideIcon
}

export type DataWorkspaceHeaderMorePresentation = "icons" | "menu"

type DataWorkspaceHeaderMoreMenuProps = {
  actions: readonly DataWorkspaceHeaderMoreAction[]
  headerVariant?: DataWorkspaceHeaderVariant
  /** `icons` = fila desktop. `menu` = ⋯ mobile. Nunca las dos en el mismo árbol. */
  presentation?: DataWorkspaceHeaderMorePresentation
}

/** Desktop: íconos en fila. Mobile: menú “más”. */
export function DataWorkspaceHeaderMoreMenu({
  actions,
  headerVariant = "dark",
  presentation = "icons",
}: DataWorkspaceHeaderMoreMenuProps) {
  if (actions.length === 0) return null

  if (presentation === "menu") {
    const theme = isDarkChromeHeader(headerVariant) ? "dark" : "light"
    const dropdownClass =
      dataWorkspaceHeaderDropdownContentClassForVariant(headerVariant)

    return (
      <RootsDropdownMenu>
        <RootsDropdownTrigger asChild>
          <DataWorkspaceHeaderIconButton
            label="Más acciones"
            headerVariant={headerVariant}
          >
            <EllipsisVertical className="size-5" aria-hidden />
          </DataWorkspaceHeaderIconButton>
        </RootsDropdownTrigger>
        <RootsDropdownContent
          theme={theme}
          align="end"
          side="bottom"
          sideOffset={8}
          className={dropdownClass}
        >
          {actions.map((action) => {
            const Icon = action.icon
            return (
              <RootsDropdownItem
                key={action.label}
                theme={theme}
                className="gap-2"
                onSelect={action.onClick}
              >
                <Icon className="size-4 shrink-0 opacity-70" aria-hidden />
                <span className="min-w-0 flex-1 truncate">{action.label}</span>
              </RootsDropdownItem>
            )
          })}
        </RootsDropdownContent>
      </RootsDropdownMenu>
    )
  }

  return (
    <div className="flex items-center gap-1">
      {actions.map((action) => {
        const Icon = action.icon
        return (
          <DataWorkspaceHeaderIconButton
            key={action.label}
            label={action.label}
            headerVariant={headerVariant}
            onClick={action.onClick}
          >
            <Icon className="size-5" aria-hidden />
          </DataWorkspaceHeaderIconButton>
        )
      })}
    </div>
  )
}
