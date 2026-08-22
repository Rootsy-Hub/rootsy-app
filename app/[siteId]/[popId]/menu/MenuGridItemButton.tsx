"use client"

import {
  menuDragId,
  menuLinkToDockId,
  useMenuDockEdit,
} from "@/app/[siteId]/[popId]/menu/MenuDockDndContext"
import "@/app/[siteId]/[popId]/menu/menuPlanetLife.css"
import {
  menuHoloFloatLiftClass,
  menuHoloFocusRingForSection,
  menuHoloGlyphClass,
  menuHoloIconHoverForSection,
  menuHoloIconShellForSection,
  menuHoloLabelClass,
  menuHoloLabelDockPlacedClass,
  menuHoloPlanetLifeClass,
  menuHoloRealmWorldRimClass,
  menuHoloTileMotionClass,
  menuPlanetLifeStyle,
} from "@/lib/menu/menuHoloStyles"
import {
  menuPlanetIconGlyphClass,
  menuPlanetIconShellClass,
  menuPlanetTileClass,
  menuPlanetTileLabelClass,
} from "@/app/[siteId]/[popId]/menu/menuPlanetGridStyles"
import { MenuApiReadyBadge } from "@/app/[siteId]/[popId]/menu/MenuApiReadyBadge"
import { MenuIconChrome } from "@/app/[siteId]/[popId]/menu/MenuIconChrome"
import {
  isOptimisticNavTarget,
  usePopOptimisticNav,
} from "@/context/PopOptimisticNavContext"
import { RootsSpinner } from "@/components/rootsy-spinner"
import { isMenuApiReady } from "@/lib/menuApiReady"
import type { MenuItemDef, MenuSectionKey } from "@/lib/menuCatalog"
import { cn } from "@/lib/utils"
import { useDraggable } from "@dnd-kit/core"
import Link from "next/link"
import { useEffect, useLayoutEffect, useRef, useState } from "react"

function MenuPlanetTileLabel({
  children,
  className,
}: {
  children: string
  className: string
}) {
  const textRef = useRef<HTMLSpanElement>(null)
  const [singleLine, setSingleLine] = useState(false)

  useLayoutEffect(() => {
    const el = textRef.current
    if (!el) return

    const measure = () => {
      const styles = getComputedStyle(el)
      const fontSize = parseFloat(styles.fontSize)
      const parsedLineHeight = parseFloat(styles.lineHeight)
      const row = Number.isFinite(parsedLineHeight)
        ? parsedLineHeight
        : fontSize * 1.25
      setSingleLine(el.getBoundingClientRect().height <= row * 1.35)
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [children])

  return (
    <span className={className}>
      <span
        ref={textRef}
        className={cn(
          "block w-full text-center",
          singleLine && "max-md:mt-2",
        )}
      >
        {children}
      </span>
    </span>
  )
}

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
  const { pending, start: startOptimisticNav } = usePopOptimisticNav()
  const isLeaving = isOptimisticNavTarget(href, pending)
  const {
    editing,
    canDragMenuItem,
    isInDock,
    activeDragKind,
    draggingItemId,
    isCompactDock,
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
  const skipClickAfterDrag = useRef(false)

  useEffect(() => {
    if (isDragging) skipClickAfterDrag.current = true
  }, [isDragging])

  const isThisMenuDrag =
    isDragging && activeDragKind === "menu" && dockId === draggingItemId
  const showDockPlacedStyle =
    (editing || isCompactDock) && alreadyInDock && !isThisMenuDrag
  const isDragGhost = isThisMenuDrag
  const isAlive = !showDockPlacedStyle && !isDragGhost
  const lifeSeed = `${sectionKey}-${item.link}-${item.name}`
  const lifeStyle = menuPlanetLifeStyle(lifeSeed)

  const shellVariant = showDockPlacedStyle || isDragGhost ? "placed" : "default"

  const Icon = item.icon
  const tileClassName = cn(
    menuPlanetTileClass,
    !editing && menuHoloTileMotionClass,
  )

  const tileInner = (
    <>
      <div
        className={cn(
          "relative overflow-visible p-1 -m-1",
          isAlive && menuHoloPlanetLifeClass,
        )}
        style={isAlive ? lifeStyle : undefined}
      >
        <div
          className={cn(
            menuPlanetIconShellClass,
            menuHoloIconShellForSection(sectionKey, shellVariant),
            !isDragGhost &&
              menuHoloRealmWorldRimClass(sectionKey, showDockPlacedStyle),
            !showDockPlacedStyle &&
              !isDragGhost &&
              cn(menuHoloFloatLiftClass, menuHoloIconHoverForSection(sectionKey)),
          )}
        >
          {!isDragGhost ? (
            <MenuIconChrome sectionKey={sectionKey} alive={isAlive} />
          ) : null}
          {isLeaving ? (
            <RootsSpinner
              size="default"
              tone="dark"
              className={menuPlanetIconGlyphClass}
              label={`Abriendo ${item.name}`}
            />
          ) : (
            <Icon className={cn(menuPlanetIconGlyphClass, menuHoloGlyphClass)} />
          )}
        </div>
        {!isDragGhost && !isLeaving && isMenuApiReady(item.link) ? (
          <MenuApiReadyBadge />
        ) : null}
      </div>

      <MenuPlanetTileLabel
        className={cn(
          "flex h-7 w-full items-start justify-center text-center line-clamp-2 md:h-8 md:items-center",
          menuPlanetTileLabelClass,
          showDockPlacedStyle || isDragGhost
            ? menuHoloLabelDockPlacedClass
            : menuHoloLabelClass,
          "max-md:!text-[11px] max-md:leading-tight",
        )}
      >
        {item.name}
      </MenuPlanetTileLabel>
    </>
  )

  return (
    <div
      ref={setNodeRef}
      {...(draggable ? listeners : {})}
      {...(draggable ? attributes : {})}
      style={{
        animationDelay:
          editing && draggable
            ? `${(item.name.length % 5) * 45}ms`
            : undefined,
      }}
      className={cn(
        "justify-self-center transition-[opacity,transform] duration-200",
        (editing || isDragging) && draggable && "touch-none",
        editing && draggable && "animate-dock-wiggle",
        showDockPlacedStyle && "scale-[0.985]",
        isDragGhost && "scale-[0.96] opacity-55",
        editing && draggable && "cursor-grab active:cursor-grabbing",
      )}
    >
      {href && !editing && !disabled ? (
        <Link
          href={href}
          onClick={(event) => {
            if (skipClickAfterDrag.current) {
              event.preventDefault()
              skipClickAfterDrag.current = false
              return
            }
            if (
              event.metaKey ||
              event.ctrlKey ||
              event.shiftKey ||
              event.altKey
            ) {
              return
            }
            if (pending && !isLeaving) {
              event.preventDefault()
              return
            }
            startOptimisticNav({ href, title: item.name })
          }}
          aria-busy={isLeaving || undefined}
          className={cn(tileClassName, menuHoloFocusRingForSection(sectionKey))}
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
            "border-0 bg-transparent p-0",
            menuHoloFocusRingForSection(sectionKey),
            disabled && "cursor-default opacity-70",
          )}
        >
          {tileInner}
        </button>
      )}
    </div>
  )
}
