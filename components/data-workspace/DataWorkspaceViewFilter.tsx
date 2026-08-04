"use client"

import { lightToolbarPanelClass } from "@/components/data-workspace/dataWorkspaceListStyles"
import type { DataWorkspaceSidebarViewItem } from "@/components/layouts/DataWorkspaceSidebar"
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
      className={cn(lightToolbarPanelClass, className)}
    >
      {viewItems.map((item) => (
        <RootsFormSelectItem key={item.id} value={item.id}>
          {item.label}
        </RootsFormSelectItem>
      ))}
    </RootsFormSelectField>
  )
}
