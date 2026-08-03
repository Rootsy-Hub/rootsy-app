"use client"

import {
  DOCK_BAR_DROP_ID,
  DOCK_SLOT_SHIFT_PX,
  dockDragId,
  dockInsertId,
  DockIconVisual,
  getDockEditSlotCount,
  getDockItemShiftX,
  useMenuDockEdit,
} from "@/app/[siteId]/[popId]/menu/MenuDockDndContext"
import type { MenuCatalogItem, MenuDockItemId } from "@/lib/menuCatalog"
import { popScopedHref } from "@/lib/popRoutes"
import { cn } from "@/lib/utils"
import { menuFloatingPillShellClass } from "@/app/[siteId]/[popId]/menu/menuFloatingPillStyles"
import { useDraggable, useDroppable } from "@dnd-kit/core"
import { Check, Minus, Pencil } from "lucide-react"
import { useRouter } from "next/navigation"

type Props = {
  siteId: string
  popId: string
}

const DOCK_ICON_CLASS = "from-emerald-500/80 to-teal-600/80"

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
      className={cn(
        "absolute inset-y-0 z-10",
        !active && "pointer-events-none",
      )}
      style={{ left, width: DOCK_SLOT_SHIFT_PX }}
      aria-hidden
    />
  )
}

function DockSlotItem({
  item,
  index,
  editing,
  shiftX,
  dragAnimating,
  canRemove,
  onNavigate,
  onRemove,
}: {
  item: MenuCatalogItem
  index: number
  editing: boolean
  shiftX: number
  dragAnimating: boolean
  canRemove: boolean
  onNavigate: () => void
  onRemove: () => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef: setDragRef,
    isDragging,
  } = useDraggable({
    id: dockDragId(item.id),
    data: { kind: "dock" as const, itemId: item.id },
    disabled: !editing,
  })

  const { setNodeRef: setDropRef } = useDroppable({
    id: dockDragId(item.id),
    data: { kind: "dock-drop" as const, itemId: item.id },
    disabled: !editing,
  })

  const setRefs = (node: HTMLDivElement | null) => {
    setDragRef(node)
    if (editing) setDropRef(node)
  }

  return (
    <div
      ref={setRefs}
      className="absolute bottom-0 z-20 flex justify-center"
      style={{
        left: index * DOCK_SLOT_SHIFT_PX,
        width: DOCK_SLOT_SHIFT_PX,
        transform:
          editing && !isDragging ? `translateX(${shiftX}px)` : undefined,
        transition: editing && dragAnimating ? DOCK_LAYOUT_TRANSITION : undefined,
      }}
    >
      <div
        style={{ animationDelay: `${(index % 5) * 45}ms` }}
        className={cn(
          "relative",
          editing && "touch-none",
          editing && !isDragging && !dragAnimating && "animate-dock-wiggle",
          editing && isDragging && "opacity-0",
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
            <DockIconVisual icon={item.icon} className={DOCK_ICON_CLASS} />
          </button>
        ) : (
          <div className="group/dock-tip relative">
            <button
              type="button"
              onClick={onNavigate}
              className="relative transition-transform duration-200 hover:scale-110 active:scale-95"
              aria-label={item.name}
            >
              <DockIconVisual icon={item.icon} className={DOCK_ICON_CLASS} />
            </button>
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
              "absolute -left-0.5 -top-0.5 z-30 flex size-[18px] items-center justify-center rounded-full bg-white text-[11px] font-bold text-neutral-700 shadow-md ring-1 ring-black/10",
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
  const router = useRouter()
  const { setNodeRef } = useDroppable({
    id: DOCK_BAR_DROP_ID,
    disabled: !dragAnimating,
  })

  const rowWidth = slotCount * DOCK_SLOT_SHIFT_PX
  const insertZoneCount = dockItems.length + 1

  return (
    <div
      ref={setNodeRef}
      className="relative min-h-12 shrink-0 overflow-visible pt-2.5"
      style={{
        width: rowWidth,
        minWidth: rowWidth,
        maxWidth: rowWidth,
        transition: dragAnimating ? DOCK_WIDTH_TRANSITION : undefined,
      }}
    >
      {editing
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
        const shiftX = editing
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
            shiftX={shiftX}
            dragAnimating={dragAnimating}
            canRemove={canRemove}
            onNavigate={() => {
              if (target) router.push(target)
            }}
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
  } = useMenuDockEdit()

  const slotCount = getDockEditSlotCount(
    dockItems.length,
    canAddMore,
    editing ? dragging : false,
    editing ? activeDragKind : null,
    editing ? dropPreviewIndex : null,
  )

  return (
    <div className="pointer-events-none absolute bottom-4 left-1/2 z-30 -translate-x-1/2">
      <div
        className={cn(
          "pointer-events-auto flex items-end gap-1 overflow-visible px-2.5 py-2 sm:gap-1.5 sm:px-3",
          menuFloatingPillShellClass,
          editing && dragging &&
            "transition-[width,padding,gap] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
        )}
      >
        {dockItems.length > 0 ? (
          <DockIconsTrack
            siteId={siteId}
            popId={popId}
            editing={editing}
            slotCount={slotCount}
            dockItems={dockItems}
            dockIds={dockIds}
            previewDockIds={previewDockIds}
            draggingItemId={draggingItemId}
            activeDragKind={activeDragKind}
            dropPreviewIndex={dropPreviewIndex}
            dragAnimating={editing && dragging}
            canRemove={canRemove}
            onRemove={removeFromDock}
          />
        ) : null}

        <div className="ml-1 flex shrink-0 items-end gap-2.5 self-end sm:ml-1.5">
          <div className="mb-1.5 h-8 w-px bg-border" aria-hidden />
          <button
            type="button"
            onClick={() => setEditing(!editing)}
            className={cn(
              "mb-1.5 flex size-9 shrink-0 items-center justify-center rounded-xl transition-colors active:scale-95",
              editing
                ? "bg-white/90 hover:bg-white"
                : "bg-secondary hover:bg-muted",
            )}
            aria-label={editing ? "Listo" : "Editar accesos directos"}
          >
            {editing ? (
              <Check className="size-4 text-neutral-900" strokeWidth={2.5} />
            ) : (
              <Pencil className="size-4 text-muted-foreground" />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
