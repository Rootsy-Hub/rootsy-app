"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { Check, ChevronDown, Sparkles } from "lucide-react"
import type {
  DataWorkspaceSidebarCreationItem,
  DataWorkspaceSidebarViewItem,
} from "./DataWorkspaceSidebar"

export type DataWorkspaceSectionMenuProps = {
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
  viewsSectionLabel = "En esta sección",
  headerVariant = "default",
}: DataWorkspaceSectionMenuProps) {
  const isDarkHeader = headerVariant === "dark"
  const allItems = [...creationItems, ...viewItems]
  const activeItem = allItems.find((item) => item.id === activeId)
  const activeLabel = activeItem?.label ?? "Opciones"
  const ActiveIcon = activeItem?.icon

  const triggerClass = cn(
    "inline-flex h-9 max-w-[min(100%,12rem)] items-center gap-2 rounded-xl border px-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/45",
    isDarkHeader
      ? "border-white/10 bg-zinc-900 text-zinc-200 hover:border-white/15 hover:bg-zinc-800 hover:text-white"
      : "border-foreground/10 bg-secondary text-foreground/80 hover:border-primary/25 hover:bg-muted hover:text-foreground",
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={triggerClass}
          aria-label={`Opciones de sección: ${activeLabel}`}
        >
          {ActiveIcon ? (
            <ActiveIcon className="size-4 shrink-0 opacity-80" aria-hidden />
          ) : (
            <Sparkles className="size-4 shrink-0 opacity-70" aria-hidden />
          )}
          <span className="min-w-0 truncate">{activeLabel}</span>
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
