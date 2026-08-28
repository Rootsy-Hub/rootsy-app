"use client"

import {
  menuDragId,
  menuLinkToDockId,
  useMenuDockEdit,
} from "@/app/[siteId]/[popId]/menu/MenuDockDndContext"
import "@/app/[siteId]/[popId]/menu/menuPlanetLife.css"
import "@/app/[siteId]/[popId]/menu/menuPlanetFlat.css"
import "@/app/[siteId]/[popId]/menu/menuPlanetPiedra.css"
import "@/app/[siteId]/[popId]/menu/menuPlanetGlass.css"
import { MenuPlanetGlassLayers } from "@/app/[siteId]/[popId]/menu/MenuPlanetGlassLayers"
import {
  menuFlatGlyphClass,
  menuFlatIconShellForSection,
  menuFlatLabelClass,
  type MenuPlanetFinish,
} from "@/lib/menu/menuFlatStyles"
import {
  menuGlassGlyphClass,
  menuGlassIconShellForSection,
  menuGlassLabelClass,
} from "@/lib/menu/menuGlassStyles"
import {
  menuPiedraGlyphClass,
  menuPiedraIconShellForSection,
  menuPiedraLabelClass,
} from "@/lib/menu/menuPiedraStyles"
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
import { shouldShowMenuApiReadyBadge } from "@/lib/menuApiReady"
import type { MenuItemDef, MenuSectionKey } from "@/lib/menuCatalog"
import { cn } from "@/lib/utils"
import { useDraggable } from "@dnd-kit/core"
import { PopLink as Link } from "@/lib/pop-spa/PopLink"
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
  /** Acabado — `holo` vidrio, `flat` tecla, `piedra` canto, `glass` cristal Herramientas. */
  finish?: MenuPlanetFinish
}

export function MenuGridItemButton({
  item,
  sectionKey,
  disabled,
  href,
  onActivate,
  finish = "holo",
}: Props) {
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
  const tileClassName = menuPlanetTileClass
  const isHolo = finish === "holo"
  const isFlat = finish === "flat"
  const isPiedra = finish === "piedra"
  const isGlass = finish === "glass"
  const isInteractive =
    !editing && !showDockPlacedStyle && !isDragGhost && !disabled

  const finishShellClass = isGlass
    ? menuGlassIconShellForSection(sectionKey, shellVariant, isInteractive)
    : isPiedra
      ? menuPiedraIconShellForSection(
          sectionKey,
          shellVariant,
          isInteractive,
          `${item.link}-${item.name}`,
        )
      : isFlat
        ? menuFlatIconShellForSection(sectionKey, shellVariant, isInteractive)
        : menuHoloIconShellForSection(sectionKey, shellVariant)

  const finishGlyphClass = isGlass
    ? menuGlassGlyphClass
    : isPiedra
      ? menuPiedraGlyphClass
      : isFlat
        ? menuFlatGlyphClass
        : menuHoloGlyphClass

  const finishLabelClass = isGlass
    ? menuGlassLabelClass
    : isPiedra
      ? menuPiedraLabelClass
      : isFlat
        ? menuFlatLabelClass
        : menuHoloLabelClass

  const tileInner = (
    <>
      <div
        className={cn(
          "relative overflow-visible p-1 -m-1",
          isHolo && isAlive && menuHoloPlanetLifeClass,
        )}
        style={isHolo && isAlive ? lifeStyle : undefined}
      >
        <div
          className={cn(
            menuPlanetIconShellClass,
            finishShellClass,
            isHolo &&
              !isDragGhost &&
              menuHoloRealmWorldRimClass(sectionKey, showDockPlacedStyle),
            editing && draggable && "animate-dock-wiggle",
            isHolo &&
              isInteractive &&
              cn(
                menuHoloFloatLiftClass,
                menuHoloTileMotionClass,
                menuHoloIconHoverForSection(sectionKey),
              ),
          )}
          style={
            editing && draggable
              ? { animationDelay: `${(item.name.length % 5) * 45}ms` }
              : undefined
          }
        >
          {isHolo && !isDragGhost ? (
            <MenuIconChrome sectionKey={sectionKey} alive={isAlive} />
          ) : null}
          {isGlass && !isDragGhost ? <MenuPlanetGlassLayers /> : null}
          <Icon
            className={cn(menuPlanetIconGlyphClass, finishGlyphClass)}
          />
        </div>
        {!isDragGhost && shouldShowMenuApiReadyBadge(item.link) ? (
          <MenuApiReadyBadge />
        ) : null}
      </div>

      <MenuPlanetTileLabel
        className={cn(
          "flex h-7 w-full items-start justify-center text-center line-clamp-2 md:h-8 md:items-center",
          menuPlanetTileLabelClass,
          showDockPlacedStyle || isDragGhost
            ? menuHoloLabelDockPlacedClass
            : finishLabelClass,
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
      onContextMenu={(event) => {
        if (draggable) event.preventDefault()
      }}
      className={cn(
        "justify-self-center transition-[opacity,transform] duration-200",
        draggable && "select-none [-webkit-touch-callout:none]",
        (editing || isDragging) && draggable && "touch-none",
        showDockPlacedStyle && "scale-[0.985]",
        isDragGhost && "scale-[0.96] opacity-55",
        editing && draggable && "cursor-grab active:cursor-grabbing",
      )}
    >
      {href && !editing && !disabled ? (
        <Link
          href={href}
          draggable={false}
          onContextMenu={(event) => {
            if (draggable) event.preventDefault()
          }}
          onClick={(event) => {
            if (skipClickAfterDrag.current) {
              event.preventDefault()
              skipClickAfterDrag.current = false
            }
          }}
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
