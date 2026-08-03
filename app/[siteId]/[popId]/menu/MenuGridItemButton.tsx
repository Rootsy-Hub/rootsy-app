"use client"

import {
  menuDragId,
  menuLinkToDockId,
  useMenuDockEdit,
} from "@/app/[siteId]/[popId]/menu/MenuDockDndContext"
import type { MenuItemDef } from "@/lib/menuCatalog"
import { cn } from "@/lib/utils"
import { useDraggable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"

type Props = {
  item: MenuItemDef
  disabled?: boolean
  onActivate: () => void
}

export function MenuGridItemButton({ item, disabled, onActivate }: Props) {
  const { editing, canDragMenuItem, isInDock } = useMenuDockEdit()
  const dockId = menuLinkToDockId(item.link)
  const draggable = dockId != null && canDragMenuItem(item.link)
  const alreadyInDock = dockId != null && isInDock(dockId)

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id:
        dockId != null
          ? menuDragId(dockId)
          : `menu-disabled-${item.link}-${item.name}`,
      data: { kind: "menu" as const, itemId: dockId, menuItem: item },
      disabled: !draggable,
    })

  const Icon = item.icon

  return (
    <div
      ref={setNodeRef}
      style={{
        ...(transform ? { transform: CSS.Translate.toString(transform) } : undefined),
        animationDelay: editing && draggable ? `${(item.name.length % 5) * 40}ms` : undefined,
      }}
      className={cn(
        "justify-self-center touch-none",
        isDragging && "z-20 opacity-40",
        editing && draggable && "animate-dock-wiggle",
        editing && alreadyInDock && "opacity-45",
      )}
    >
      <button
        type="button"
        {...(draggable ? listeners : {})}
        {...(draggable ? attributes : {})}
        onClick={() => {
          if (!editing && !disabled) onActivate()
        }}
        disabled={disabled}
        className={cn(
          "group flex w-24 flex-col items-center gap-2.5 transition-all duration-200",
          !editing && !disabled && "hover:scale-105 active:scale-95",
          draggable && "cursor-grab active:cursor-grabbing",
          disabled && "pointer-events-none opacity-40",
        )}
      >
        <div className="relative">
          {!editing ? (
            <div className="absolute inset-1 rounded-[20px] bg-emerald-500/40 blur-md opacity-0 transition-opacity duration-300 group-hover:opacity-50" />
          ) : null}

          <div
            className={cn(
              "relative flex size-[72px] items-center justify-center overflow-hidden rounded-[20px] bg-gradient-to-br from-emerald-500/90 to-teal-600/90 shadow-md shadow-emerald-900/10 transition-all",
              !editing && "group-hover:shadow-emerald-500/20",
              editing &&
                draggable &&
                "ring-2 ring-primary/25 ring-offset-2 ring-offset-background/80",
            )}
          >
            {!editing ? (
              <>
                <div className="absolute inset-0 translate-x-[-100%] bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 transition-all duration-500 group-hover:translate-x-[100%] group-hover:opacity-100" />
                <div className="absolute inset-px rounded-[19px] border border-white/20" />
              </>
            ) : null}
            <Icon
              className={cn(
                "relative size-8 text-white drop-shadow-sm transition-transform duration-200",
                !editing && "group-hover:scale-110",
              )}
            />
          </div>

          {item.badge && !editing ? (
            <div
              className={cn(
                "absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[9px] font-semibold shadow-sm",
                item.badge === "HOT" || item.badge === "NEW"
                  ? "animate-pulse bg-gradient-to-r from-amber-500 to-orange-500 text-white"
                  : "bg-gradient-to-r from-red-500 to-rose-500 text-white",
              )}
            >
              {item.badge}
            </div>
          ) : null}
        </div>

        <span
          className={cn(
            "text-center text-xs font-medium leading-tight drop-shadow-sm transition-colors",
            editing
              ? "text-foreground/55"
              : "text-foreground/70 group-hover:text-foreground",
          )}
        >
          {item.name}
        </span>
      </button>
    </div>
  )
}
