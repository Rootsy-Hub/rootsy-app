"use client"

import {
  menuDragId,
  menuLinkToDockId,
  useMenuDockEdit,
} from "@/app/[siteId]/[popId]/menu/MenuDockDndContext"
import {
  menuHoloContactShadowClass,
  menuHoloFloatLiftClass,
  menuHoloFocusRingClass,
  menuHoloGlyphClass,
  menuHoloIconHoverClass,
  menuHoloIconShellForVariant,
  menuHoloLabelClass,
  menuHoloLabelMutedClass,
  menuHoloTileMotionClass,
} from "@/lib/menu/menuHoloStyles"
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
  sectionKey: _sectionKey,
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
  const tileClassName = cn(
    "group flex h-[7.125rem] w-24 flex-col items-center gap-2.5",
    menuHoloTileMotionClass,
  )

  const tileInner = (
    <>
      <div className="relative flex flex-col items-center">
        <div aria-hidden className={menuHoloContactShadowClass} />
        <div
          className={cn(
            "flex size-[72px] items-center justify-center rounded-[20px]",
            showDockInsertedStyle
              ? menuHoloIconShellForVariant("muted")
              : cn(
                  menuHoloIconShellForVariant("default"),
                  menuHoloFloatLiftClass,
                  menuHoloIconHoverClass,
                ),
          )}
        >
          {!showDockInsertedStyle ? <MenuIconChrome /> : null}
          <Icon className={cn("relative size-8", menuHoloGlyphClass)} />
        </div>
      </div>

      <span
        className={cn(
          "flex h-8 w-full items-center justify-center text-center text-xs font-normal leading-tight line-clamp-2 transition-colors duration-200",
          showDockInsertedStyle ? menuHoloLabelMutedClass : menuHoloLabelClass,
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
          className={cn(tileClassName, menuHoloFocusRingClass)}
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
            menuHoloFocusRingClass,
            disabled && "cursor-default opacity-70",
          )}
        >
          {tileInner}
        </button>
      )}
    </div>
  )
}
