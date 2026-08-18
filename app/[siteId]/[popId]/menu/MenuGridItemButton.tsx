"use client"

import {
  menuDragId,
  menuLinkToDockId,
  useMenuDockEdit,
} from "@/app/[siteId]/[popId]/menu/MenuDockDndContext"
import {
  menuIconGlyphClass,
  menuIconGradientForSection,
  menuIconHoverShadowForSection,
} from "@/app/[siteId]/[popId]/menu/menuNatureStyles"
import { MenuIconChrome } from "@/app/[siteId]/[popId]/menu/MenuIconChrome"
import { usePopOptimisticNav } from "@/context/PopOptimisticNavContext"
import type { MenuItemDef, MenuSectionKey } from "@/lib/menuCatalog"
import { cn } from "@/lib/utils"
import { useDraggable } from "@dnd-kit/core"
import Link from "next/link"

type Props = {
  item: MenuItemDef
  sectionKey: MenuSectionKey
  disabled?: boolean
  href?: string | null
  onActivate?: () => void
}

export function MenuGridItemButton({
  item,
  sectionKey,
  disabled,
  href,
  onActivate,
}: Props) {
  const { start: startOptimisticNav } = usePopOptimisticNav()
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
  const showDockInsertedStyle =
    editing && (alreadyInDock || isThisMenuDrag)

  const Icon = item.icon
  const tileClassName =
    "group flex h-[7.125rem] w-24 flex-col items-center gap-2.5 transition-all duration-200"

  const tileInner = (
    <>
      <div className="relative">
        <div
          className={cn(
            "relative flex size-[72px] items-center justify-center overflow-hidden rounded-[20px] transition-all duration-200",
            showDockInsertedStyle
              ? cn(
                  menuIconGradientForSection(sectionKey, "muted"),
                  "ring-1 ring-foreground/10",
                )
              : cn(
                  menuIconGradientForSection(sectionKey),
                  menuIconHoverShadowForSection(sectionKey),
                ),
          )}
        >
          {!showDockInsertedStyle ? <MenuIconChrome /> : null}
          <Icon
            className={cn(
              "relative size-8 transition-transform duration-200",
              menuIconGlyphClass,
              !editing && "group-hover:scale-[1.02]",
            )}
          />
        </div>
      </div>

      <span
        className={cn(
          "flex h-8 w-full items-center justify-center text-center text-xs font-normal leading-tight line-clamp-2 transition-colors duration-200",
          showDockInsertedStyle
            ? "text-foreground/35"
            : "text-foreground/80 group-hover:text-foreground/95",
        )}
      >
        {item.name}
      </span>
    </>
  )

  return (
    <div
      ref={setNodeRef}
      {...(draggable ? listeners : {})}
      {...(draggable ? attributes : {})}
      style={{
        animationDelay:
          editing && draggable && !showDockInsertedStyle
            ? `${(item.name.length % 5) * 45}ms`
            : undefined,
      }}
      className={cn(
        "justify-self-center transition-[opacity,transform] duration-200",
        editing && draggable && "touch-none",
        editing && draggable && !showDockInsertedStyle && "animate-dock-wiggle",
        showDockInsertedStyle && "scale-[0.97] opacity-45",
        editing && draggable && "cursor-grab active:cursor-grabbing",
      )}
    >
      {href && !editing && !disabled ? (
        <Link
          href={href}
          onClick={(event) => {
            if (
              event.metaKey ||
              event.ctrlKey ||
              event.shiftKey ||
              event.altKey
            ) {
              return
            }
            startOptimisticNav({ href, title: item.name })
          }}
          className={cn(
            tileClassName,
            "hover:scale-[1.02] active:scale-[0.98]",
          )}
        >
          {tileInner}
        </Link>
      ) : (
        <button
          type="button"
          onClick={() => {
            if (!editing && !disabled) onActivate?.()
          }}
          disabled={disabled}
          className={cn(
            tileClassName,
            !editing && !disabled && "hover:scale-[1.02] active:scale-[0.98]",
            disabled && "cursor-default opacity-70",
          )}
        >
          {tileInner}
        </button>
      )}
    </div>
  )
}
