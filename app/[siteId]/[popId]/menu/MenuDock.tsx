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
import { useDraggable, useDroppable } from "@dnd-kit/core"
import { Check, Minus, Pencil } from "lucide-react"
import { useRouter } from "next/navigation"

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
      className={cn(
        "absolute inset-y-0 z-10",
        !active && "pointer-events-none",
      )}
      style={{ left, width: DOCK_SLOT_SHIFT_PX }}
      aria-hidden
    />
  )
}

function DockEditSlotGrid({
  enabled,
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
  enabled: boolean
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
    disabled: !enabled,
  })

  const rowWidth = slotCount * DOCK_SLOT_SHIFT_PX
  const insertZoneCount = dockItems.length + 1

  return (
    <div
      ref={setNodeRef}
      className="relative mb-1.5 min-h-12 shrink-0 overflow-visible pt-2.5"
      style={{
        width: rowWidth,
        minWidth: rowWidth,
        maxWidth: rowWidth,
        transition: dragAnimating ? DOCK_WIDTH_TRANSITION : undefined,
      }}
    >
      {Array.from({ length: insertZoneCount }, (_, index) => (
        <DockInsertZone
          key={`insert-${index}`}
          index={index}
          left={index * DOCK_SLOT_SHIFT_PX}
          active={enabled}
        />
      ))}

      {dockItems.map((item, index) => {
        const shiftX = getDockItemShiftX(
          item.id,
          index,
          dockIds,
          previewDockIds,
          activeDragKind,
          dropPreviewIndex,
          draggingItemId,
        )

        return (
          <DockEditSlotItem
            key={item.id}
            item={item}
            index={index}
            shiftX={shiftX}
            dragAnimating={dragAnimating}
            canRemove={canRemove}
            onRemove={() => onRemove(item.id)}
          />
        )
      })}
    </div>
  )
}

function DockEditSlotItem({
  item,
  index,
  shiftX,
  dragAnimating,
  canRemove,
  onRemove,
}: {
  item: MenuCatalogItem
  index: number
  shiftX: number
  dragAnimating: boolean
  canRemove: boolean
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
  })

  const { setNodeRef: setDropRef } = useDroppable({
    id: dockDragId(item.id),
    data: { kind: "dock-drop" as const, itemId: item.id },
  })

  return (
    <div
      ref={setDropRef}
      className="absolute bottom-0 z-20 flex justify-center"
      style={{
        left: index * DOCK_SLOT_SHIFT_PX,
        width: DOCK_SLOT_SHIFT_PX,
        transform: isDragging ? undefined : `translateX(${shiftX}px)`,
        transition: dragAnimating ? DOCK_LAYOUT_TRANSITION : undefined,
      }}
    >
      <div
        ref={setDragRef}
        style={{ animationDelay: `${(index % 5) * 45}ms` }}
        className={cn(
          "relative touch-none",
          !isDragging && !dragAnimating && "animate-dock-wiggle",
          isDragging && "opacity-0",
        )}
      >
        <button
          type="button"
          {...listeners}
          {...attributes}
          className="relative cursor-grab active:cursor-grabbing"
          aria-label={item.name}
        >
          <DockIconVisual
            icon={item.icon}
            className="from-emerald-500/85 to-teal-600/85"
          />
        </button>
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
      </div>
    </div>
  )
}

function StaticDockItem({
  item,
  onNavigate,
}: {
  item: MenuCatalogItem
  onNavigate: () => void
}) {
  const Icon = item.icon
  return (
    <button
      type="button"
      onClick={onNavigate}
      className="group relative flex flex-col items-center gap-1 transition-transform duration-200 hover:scale-110 active:scale-95"
      aria-label={item.name}
    >
      <div className="relative flex size-12 items-center justify-center overflow-hidden rounded-[22%] bg-gradient-to-br from-emerald-500/80 to-teal-600/80 shadow-md transition-all group-hover:from-emerald-500 group-hover:to-teal-600">
        <div className="absolute inset-px rounded-[20%] border border-white/20" />
        <Icon className="relative size-6 text-white drop-shadow-sm" />
      </div>
    </button>
  )
}

export function MenuDock({ siteId, popId }: Props) {
  const router = useRouter()
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

  const editSlotCount = getDockEditSlotCount(
    dockItems.length,
    canAddMore,
    dragging,
    activeDragKind,
    dropPreviewIndex,
  )

  return (
    <div className="pointer-events-none absolute bottom-4 left-1/2 z-30 -translate-x-1/2">
      <div
        className={cn(
          "pointer-events-auto flex items-end gap-1 overflow-visible rounded-[1.35rem] border border-white/15 px-3 shadow-[0_8px_32px_rgba(0,0,0,0.28)] backdrop-blur-2xl sm:gap-1.5 sm:px-4",
          editing ? "bg-black/45 pb-2 pt-3 ring-1 ring-white/10" : "bg-black/35 py-2",
          dragging && editing &&
            "transition-[width,padding,gap] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
        )}
      >
        {editing ? (
          <>
            <DockEditSlotGrid
              enabled={dragging}
              slotCount={editSlotCount}
              dockItems={dockItems}
              dockIds={dockIds}
              previewDockIds={previewDockIds}
              draggingItemId={draggingItemId}
              activeDragKind={activeDragKind}
              dropPreviewIndex={dropPreviewIndex}
              dragAnimating={dragging}
              canRemove={canRemove}
              onRemove={removeFromDock}
            />

            <div className="ml-1 flex shrink-0 items-end gap-1 self-end sm:ml-1.5">
              <div className="mb-1.5 h-8 w-px bg-white/15" aria-hidden />
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="mb-1.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/90 transition-colors hover:bg-white active:scale-95"
                aria-label="Listo"
              >
                <Check className="size-4 text-neutral-900" strokeWidth={2.5} />
              </button>
            </div>
          </>
        ) : (
          <>
            {dockItems.map((item) => {
              const target = routeForDockItem(siteId, popId, item)
              return (
                <StaticDockItem
                  key={item.id}
                  item={item}
                  onNavigate={() => {
                    if (target) router.push(target)
                  }}
                />
              )
            })}

            <div className="ml-1 flex shrink-0 items-end gap-1 self-end sm:ml-1.5">
              <div className="mb-1.5 h-8 w-px bg-white/15" aria-hidden />
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="mb-1.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/10 transition-colors hover:bg-white/15 active:scale-95"
                aria-label="Editar accesos directos"
              >
                <Pencil className="size-4 text-white/70" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
