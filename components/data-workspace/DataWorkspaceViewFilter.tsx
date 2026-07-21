"use client"

import {
  lightToolbarControlClass,
  lightToolbarFocusClass,
  lightToolbarPanelClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import { DataWorkspaceToolbarFieldLabel } from "@/components/data-workspace/DataWorkspaceToolbarFieldLabel"
import type { DataWorkspaceSidebarViewItem } from "@/components/layouts/DataWorkspaceSidebar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { Check, ChevronDown, LayoutGrid } from "lucide-react"
import { useId } from "react"

const viewFilterTriggerClass = cn(
  lightToolbarControlClass,
  "justify-between gap-2 px-3 font-normal",
  lightToolbarFocusClass,
)

export function DataWorkspaceViewFilter({
  viewItems,
  activeId,
  onSelect,
  label = "Tipo",
  sectionLabel = "Tipo de operación",
  className,
  labelId: labelIdProp,
  triggerId: triggerIdProp,
}: {
  viewItems: readonly DataWorkspaceSidebarViewItem[]
  activeId: string
  onSelect: (id: string) => void
  label?: string
  sectionLabel?: string
  className?: string
  labelId?: string
  triggerId?: string
}) {
  const autoLabelId = useId()
  const autoTriggerId = useId()
  const labelId = labelIdProp ?? autoLabelId
  const triggerId = triggerIdProp ?? autoTriggerId

  const activeView =
    viewItems.find((item) => item.id === activeId) ?? viewItems[0] ?? null
  const displayLabel = activeView?.label ?? "Vista"
  const DisplayIcon = activeView?.icon ?? LayoutGrid

  return (
    <div className={cn(lightToolbarPanelClass, className)}>
      <DataWorkspaceToolbarFieldLabel id={labelId} label={label} />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            id={triggerId}
            type="button"
            variant="outline"
            className={cn(viewFilterTriggerClass, "min-w-0 shadow-xs")}
            aria-haspopup="menu"
            aria-labelledby={labelId}
          >
            <span className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
              <DisplayIcon
                className="size-4 shrink-0 text-muted-foreground"
                aria-hidden
              />
              <span className="min-w-0 flex-1 truncate text-left text-sm text-foreground">
                {displayLabel}
              </span>
            </span>
            <ChevronDown
              className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180"
              aria-hidden
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" sideOffset={6} className="w-56">
          <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">
            {sectionLabel}
          </DropdownMenuLabel>
          {viewItems.map((item) => {
            const Icon = item.icon
            const selected = activeId === item.id
            return (
              <DropdownMenuItem
                key={item.id}
                onClick={() => onSelect(item.id)}
              >
                {Icon ? (
                  <Icon className="size-4 shrink-0 opacity-70" aria-hidden />
                ) : null}
                <span className="min-w-0 flex-1 truncate">{item.label}</span>
                {selected ? (
                  <Check className="size-4 shrink-0 text-primary" aria-hidden />
                ) : null}
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
