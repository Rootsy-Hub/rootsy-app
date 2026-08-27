"use client"

import type { DataWorkspaceSidebarViewItem } from "@/components/layouts/dataWorkspaceNavItems"
import { lightToolbarPanelClass } from "@/components/data-workspace/dataWorkspaceListStyles"
import { dataWorkspaceListFiltersFieldClass } from "@/components/data-workspace/dataWorkspaceTablesLayout"
import {
  RootsFormSelectField,
  RootsFormSelectItem,
} from "@/components/rootsy-form"
import { cn } from "@/lib/utils"
import { LayoutGrid } from "lucide-react"

export function DataWorkspaceViewFilter({
  viewItems,
  activeId,
  onSelect,
  label = "Tipo",
  className,
  triggerId,
  variant = "panel",
}: {
  viewItems: readonly DataWorkspaceSidebarViewItem[]
  activeId: string
  onSelect: (id: string) => void
  label?: string
  /** @deprecated El label usa htmlFor del prop `id` / triggerId. */
  sectionLabel?: string
  className?: string
  /** @deprecated Usar triggerId como `id` del campo. */
  labelId?: string
  triggerId?: string
  variant?: "panel" | "layout"
}) {
  if (viewItems.length === 0) {
    return null
  }

  return (
    <RootsFormSelectField
      id={triggerId}
      label={label}
      value={activeId}
      onValueChange={onSelect}
      prefix={<LayoutGrid className="size-4" aria-hidden />}
      prefixVariant="inline"
      className={cn(
        variant === "layout"
          ? dataWorkspaceListFiltersFieldClass()
          : lightToolbarPanelClass,
        className,
      )}
      triggerClassName="w-full max-w-full [&_[data-slot=select-value]]:truncate"
    >
      {viewItems.map((item) => (
        <RootsFormSelectItem key={item.id} value={item.id}>
          {item.label}
        </RootsFormSelectItem>
      ))}
    </RootsFormSelectField>
  )
}
