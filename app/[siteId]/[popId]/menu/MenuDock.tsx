"use client"

import {
  DOCK_BAR_DROP_ID,
  DOCK_EDIT_DIVIDER_HEIGHT_PX,
  DOCK_ICON_SIZE_PX,
  DOCK_CHROME_INSET_PX,
  DOCK_SHELL_PADDING_X_PX,
  DOCK_SHELL_PADDING_Y_PX,
  DOCK_SLOT_INSET_X_PX,
  DOCK_SLOT_SHIFT_PX,
  DOCK_TRACK_HEIGHT_PX,
  DOCK_TRACK_INSET_Y_PX,
  dockDragId,
  dockInsertId,
  DockIconVisual,
  getDockEditSlotCount,
  getDockItemShiftX,
  useMenuDockEdit,
} from "@/app/[siteId]/[popId]/menu/MenuDockDndContext"
import type { MenuCatalogItem, MenuDockItemId } from "@/lib/menuCatalog"
import { isMenuApiReady } from "@/lib/menuApiReady"
import {
  isOptimisticNavTarget,
  usePopOptimisticNav,
} from "@/context/PopOptimisticNavContext"
import { popScopedHref } from "@/lib/popRoutes"
import { cn } from "@/lib/utils"
import { menuDockEditBadgeClass } from "@/app/[siteId]/[popId]/menu/menuNatureStyles"
import { menuRealmDividerClass } from "@/lib/menu/menuHoloStyles"
import { RootsIconButton } from "@/components/rootsy-button"
import { useDraggable, useDroppable } from "@dnd-kit/core"
import { Check, Minus, Pencil } from "lucide-react"
import Link from "next/link"
import { useEffect, useRef } from "react"

type Props = {
  siteId: string
  popId: string
}

const DOCK_LAYOUT_TRANSITION =
  "transform 320ms cubic-bezier(0.32, 0.72, 0, 1)"

const DOCK_WIDTH_TRANSITION =
  "width 320ms cubic-bezier(0.32, 0.72, 0, 1), min-width 320ms cubic-bezier(0.32, 0.72, 0, 1), max-width 320ms cubic-bezier(0.32, 0.72, 0, 1)"

function routeForDockItem(
  siteId: string,
  popId: string,
  item: MenuCatalogItem,
): string | null {
  if (item.href === "home") return "/home"
  if (!item.link || item.link === "section") return null
  return popScopedHref(siteId, popId, item.link)
}

function DockInsertZone({
  index,
  left,
  active,
}: {
  index: number
  left: number
  active: boolean
}) {
  const { setNodeRef } = useDroppable({
    id: dockInsertId(index),
    data: { index },
    disabled: !active,
  })

  return (
    <div
      ref={setNodeRef}
      className={cn("absolute z-10", !active && "pointer-events-none")}
      style={{
        top: DOCK_TRACK_INSET_Y_PX,
        bottom: DOCK_TRACK_INSET_Y_PX,
        left,
        width: DOCK_SLOT_SHIFT_PX,
      }}
      aria-hidden
    />
  )
}

function DockSlotItem({
  item,
  index,
  editing,
  rearranging,
  shiftX,
  dragAnimating,
  canRemove,
  href,
  onRemove,
}: {
  item: MenuCatalogItem
  index: number
  editing: boolean
  rearranging: boolean
  shiftX: number
  dragAnimating: boolean
  canRemove: boolean
  href: string | null
  onRemove: () => void
}) {
  const { pending, start: startOptimisticNav } = usePopOptimisticNav()
  const isLeaving = isOptimisticNavTarget(href, pending)
  const {
    attributes,
    listeners,
    setNodeRef: setDragRef,
    isDragging,
  } = useDraggable({
    id: dockDragId(item.id),
    data: { kind: "dock" as const, itemId: item.id },
    disabled: !rearranging,
  })

  const { setNodeRef: setDropRef } = useDroppable({
    id: dockDragId(item.id),
    data: { kind: "dock-drop" as const, itemId: item.id },
    disabled: !rearranging,
  })

  const skipClickAfterDrag = useRef(false)

  useEffect(() => {
    if (isDragging) skipClickAfterDrag.current = true
  }, [isDragging])

  const setRefs = (node: HTMLDivElement | null) => {
    setDragRef(node)
    if (rearranging) setDropRef(node)
  }

  return (
    <div
      ref={setRefs}
      className="absolute z-20 flex justify-center"
      style={{
        bottom: DOCK_TRACK_INSET_Y_PX,
        left: index * DOCK_SLOT_SHIFT_PX,
        width: DOCK_SLOT_SHIFT_PX,
        transform:
          rearranging && !isDragging ? `translateX(${shiftX}px)` : undefined,
        transition: rearranging && dragAnimating ? DOCK_LAYOUT_TRANSITION : undefined,
      }}
    >
      <div
        style={{ animationDelay: `${(index % 5) * 45}ms` }}
        className={cn(
          "relative",
          rearranging && "touch-none",
          editing && !isDragging && !dragAnimating && "animate-dock-wiggle",
          rearranging && isDragging && "opacity-0",
        )}
      >
        {editing ? (
          <button
            type="button"
            {...listeners}
            {...attributes}
            className="relative cursor-grab active:cursor-grabbing"
            aria-label={item.name}
          >
            <DockIconVisual
              icon={item.icon}
              sectionKey={item.sectionKey}
              apiReady={isMenuApiReady(item.id)}
            />
          </button>
        ) : (
          <div
            className="group/dock-tip relative"
            {...(rearranging ? listeners : {})}
            {...(rearranging ? attributes : {})}
          >
            {href ? (
              <Link
                href={href}
                onClick={(event) => {
                  if (skipClickAfterDrag.current) {
                    event.preventDefault()
                    skipClickAfterDrag.current = false
                    return
                  }
                  if (
                    href === "/home" ||
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
                className="relative block transition-transform duration-200 hover:scale-110 active:scale-95"
                aria-label={item.name}
                aria-busy={isLeaving || undefined}
              >
                <DockIconVisual
                  icon={item.icon}
                  sectionKey={item.sectionKey}
                  apiReady={isMenuApiReady(item.id)}
                  busy={isLeaving}
                  busyLabel={`Abriendo ${item.name}`}
                />
              </Link>
            ) : (
              <button
                type="button"
                disabled
                className="relative cursor-default opacity-70"
                aria-label={item.name}
              >
                <DockIconVisual
                  icon={item.icon}
                  sectionKey={item.sectionKey}
                  apiReady={isMenuApiReady(item.id)}
                />
              </button>
            )}
            <span
              role="tooltip"
              className={cn(
                "pointer-events-none absolute bottom-full left-1/2 z-50 mb-2.5 -translate-x-1/2 whitespace-nowrap",
                "rounded-lg bg-foreground/90 px-2.5 py-1 text-[11px] font-medium text-background",
                "shadow-lg shadow-black/20 opacity-0",
                "transition-opacity duration-150 group-hover/dock-tip:opacity-100",
              )}
            >
              {item.name}
            </span>
          </div>
        )}

        {editing ? (
          <button
            type="button"
            disabled={!canRemove}
            onPointerDown={(event) => event.stopPropagation()}
            onClick={onRemove}
            className={cn(
              "absolute -left-0.5 -top-0.5 z-30 flex size-[18px] items-center justify-center rounded-full text-[11px] font-bold shadow-md ring-1",
              menuDockEditBadgeClass,
              !canRemove && "cursor-not-allowed opacity-35",
            )}
            aria-label={`Quitar ${item.name}`}
          >
            <Minus className="size-2.5" strokeWidth={3} aria-hidden />
          </button>
        ) : (
          <span
            className="pointer-events-none absolute -left-0.5 -top-0.5 size-[18px] opacity-0"
            aria-hidden
          />
        )}
      </div>
    </div>
  )
}

function DockIconsTrack({
  siteId,
  popId,
  editing,
  rearranging,
  slotCount,
  dockItems,
  dockIds,
  previewDockIds,
  draggingItemId,
  activeDragKind,
  dropPreviewIndex,
  dragAnimating,
  canRemove,
  onRemove,
}: {
  siteId: string
  popId: string
  editing: boolean
  rearranging: boolean
  slotCount: number
  dockItems: MenuCatalogItem[]
  dockIds: readonly MenuDockItemId[]
  previewDockIds: readonly MenuDockItemId[]
  draggingItemId: MenuDockItemId | null
  activeDragKind: ReturnType<typeof useMenuDockEdit>["activeDragKind"]
  dropPreviewIndex: number | null
  dragAnimating: boolean
  canRemove: boolean
  onRemove: (id: MenuDockItemId) => void
}) {
  const { setNodeRef } = useDroppable({
    id: DOCK_BAR_DROP_ID,
    disabled: !dragAnimating,
  })

  const rowWidth = slotCount * DOCK_SLOT_SHIFT_PX
  const insertZoneCount = dockItems.length + 1

  return (
    <div
      ref={setNodeRef}
      className="relative shrink-0 overflow-visible"
      style={{
        height: DOCK_TRACK_HEIGHT_PX,
        minHeight: DOCK_TRACK_HEIGHT_PX,
        width: rowWidth,
        minWidth: rowWidth,
        maxWidth: rowWidth,
        transition: dragAnimating ? DOCK_WIDTH_TRANSITION : undefined,
      }}
    >
      {rearranging
        ? Array.from({ length: insertZoneCount }, (_, index) => (
            <DockInsertZone
              key={`insert-${index}`}
              index={index}
              left={index * DOCK_SLOT_SHIFT_PX}
              active={dragAnimating}
            />
          ))
        : null}

      {dockItems.map((item, index) => {
        const target = routeForDockItem(siteId, popId, item)
        const shiftX = rearranging
          ? getDockItemShiftX(
              item.id,
              index,
              dockIds,
              previewDockIds,
              activeDragKind,
              dropPreviewIndex,
              draggingItemId,
            )
          : 0

        return (
          <DockSlotItem
            key={item.id}
            item={item}
            index={index}
            editing={editing}
            rearranging={rearranging}
            shiftX={shiftX}
            dragAnimating={dragAnimating}
            canRemove={canRemove}
            href={target}
            onRemove={() => onRemove(item.id)}
          />
        )
      })}
    </div>
  )
}

export function MenuDock({ siteId, popId }: Props) {
  const {
    editing,
    setEditing,
    dockItems,
    dockIds,
    previewDockIds,
    dragging,
    draggingItemId,
    activeDragKind,
    dropPreviewIndex,
    canAddMore,
    canRemove,
    removeFromDock,
    isCompactDock,
  } = useMenuDockEdit()

  const rearranging = editing || isCompactDock
  const dragLive = rearranging && dragging
  const slotCount = getDockEditSlotCount(
    dockItems.length,
    canAddMore,
    dragLive,
    dragLive ? activeDragKind : null,
    dragLive ? dropPreviewIndex : null,
  )

  return (
    <div className="flex w-full max-w-full justify-center overflow-x-auto overflow-y-visible overscroll-x-contain py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div
        className={cn(
          "flex items-end overflow-visible",
          dragLive &&
            "transition-[width,padding,gap] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
        )}
        style={{
          paddingTop: DOCK_SHELL_PADDING_Y_PX,
          paddingBottom: DOCK_SHELL_PADDING_Y_PX,
          paddingLeft: DOCK_SHELL_PADDING_X_PX,
          paddingRight: isCompactDock
            ? DOCK_SHELL_PADDING_X_PX
            : DOCK_CHROME_INSET_PX,
          gap: DOCK_SHELL_PADDING_X_PX,
        }}
      >
        {dockItems.length > 0 ? (
          <DockIconsTrack
            siteId={siteId}
            popId={popId}
            editing={editing}
            rearranging={rearranging}
            slotCount={slotCount}
            dockItems={dockItems}
            dockIds={dockIds}
            previewDockIds={previewDockIds}
            draggingItemId={draggingItemId}
            activeDragKind={activeDragKind}
            dropPreviewIndex={dropPreviewIndex}
            dragAnimating={dragLive}
            canRemove={canRemove}
            onRemove={removeFromDock}
          />
        ) : null}

        <div
          className="hidden shrink-0 items-center self-end md:flex"
          style={{
            height: DOCK_ICON_SIZE_PX,
            marginBottom: DOCK_TRACK_INSET_Y_PX,
            gap: DOCK_SLOT_INSET_X_PX,
          }}
        >
          <div
            className={cn("w-px shrink-0", menuRealmDividerClass)}
            style={{ height: DOCK_EDIT_DIVIDER_HEIGHT_PX }}
            aria-hidden
          />
          <RootsIconButton
            tone="ghost"
            surface="dark"
            size="compact"
            label={editing ? "Listo" : "Editar accesos directos"}
            onClick={() => setEditing(!editing)}
          >
            {editing ? (
              <Check aria-hidden strokeWidth={2.5} />
            ) : (
              <Pencil aria-hidden />
            )}
          </RootsIconButton>
        </div>
      </div>
    </div>
  )
}
