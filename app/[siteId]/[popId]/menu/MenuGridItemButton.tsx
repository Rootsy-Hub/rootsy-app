"use client"

import {
  menuDragId,
  menuLinkToDockId,
  useMenuDockEdit,
} from "@/app/[siteId]/[popId]/menu/MenuDockDndContext"
import {
  menuBadgeDefaultClass,
  menuBadgeHotClass,
  menuIconGlyphClass,
  menuIconGradientForSection,
  menuIconHoverShadowForSection,
} from "@/app/[siteId]/[popId]/menu/menuNatureStyles"
import { MenuIconChrome } from "@/app/[siteId]/[popId]/menu/MenuIconChrome"
import type { MenuItemDef, MenuSectionKey } from "@/lib/menuCatalog"
import { cn } from "@/lib/utils"
import { useDraggable } from "@dnd-kit/core"

type Props = {
  item: MenuItemDef
  sectionKey: MenuSectionKey
  disabled?: boolean
  onActivate: () => void
}

export function MenuGridItemButton({ item, sectionKey, disabled, onActivate }: Props) {
  const {
    editing,
    canDragMenuItem,
    isInDock,
    activeDragKind,
    draggingItemId,
  } = useMenuDockEdit()
  const dockId = menuLinkToDockId(item.link)
  const draggable = dockId != null && canDragMenuItem(item.link)
  const alreadyInDock = dockId != null && isInDock(dockId)

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id:
      dockId != null
        ? menuDragId(dockId)
        : `menu-disabled-${item.link}-${item.name}`,
    data: { kind: "menu" as const, itemId: dockId, menuItem: item },
    disabled: !draggable,
  })

  const isThisMenuDrag =
    isDragging && activeDragKind === "menu" && dockId === draggingItemId
  const showInsertedStyle =
    editing && (alreadyInDock || isThisMenuDrag)

  const Icon = item.icon

  return (
    <div
      ref={setNodeRef}
      {...(draggable ? listeners : {})}
      {...(draggable ? attributes : {})}
      style={{
        animationDelay:
          editing && draggable && !showInsertedStyle
            ? `${(item.name.length % 5) * 45}ms`
            : undefined,
      }}
      className={cn(
        "justify-self-center transition-[opacity,transform] duration-200",
        editing && draggable && "touch-none",
        editing && draggable && !showInsertedStyle && "animate-dock-wiggle",
        showInsertedStyle && "scale-[0.97] opacity-45",
        editing && draggable && "cursor-grab active:cursor-grabbing",
      )}
    >
      <button
        type="button"
        onClick={() => {
          if (!editing && !disabled) onActivate()
        }}
        disabled={disabled}
        className={cn(
          "group flex w-24 flex-col items-center gap-2.5 transition-all duration-200",
          !editing && !disabled && "hover:scale-[1.02] active:scale-[0.98]",
          disabled && "pointer-events-none opacity-40",
        )}
      >
        <div className="relative">
          <div
            className={cn(
              "relative flex size-[72px] items-center justify-center overflow-hidden rounded-[20px] transition-all duration-200",
              showInsertedStyle
                ? cn(menuIconGradientForSection(sectionKey, "muted"), "ring-1 ring-foreground/10")
                : menuIconGradientForSection(sectionKey),
              !editing && !showInsertedStyle && menuIconHoverShadowForSection(sectionKey),
              editing && draggable && !showInsertedStyle &&
                "ring-2 ring-primary/25 ring-offset-2 ring-offset-background/80",
            )}
          >
            {!editing ? <MenuIconChrome /> : null}
            <Icon
              className={cn(
                "relative size-8 transition-transform duration-200",
                menuIconGlyphClass,
                !editing && "group-hover:scale-[1.02]",
              )}
            />
          </div>

          {item.badge && !editing ? (
            <div
              className={cn(
                "absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[9px] font-semibold shadow-sm",
                item.badge === "HOT" || item.badge === "NEW"
                  ? menuBadgeHotClass
                  : menuBadgeDefaultClass,
              )}
            >
              {item.badge}
            </div>
          ) : null}
        </div>

        <span
          className={cn(
            "text-center text-xs font-normal leading-tight transition-colors duration-200",
            showInsertedStyle
              ? "text-foreground/35"
              : editing
                ? "text-foreground/55"
                : "text-foreground/80 group-hover:text-foreground/95",
          )}
        >
          {item.name}
        </span>
      </button>
    </div>
  )
}
