"use client"

import {
  DOCK_BAR_DROP_ID,
  DOCK_SLOT_SHIFT_PX,
  dockDragId,
  dockInsertId,
  DockIconVisual,
  getDockItemShiftX,
  useMenuDockEdit,
} from "@/app/[siteId]/[popId]/menu/MenuDockDndContext"
import type { MenuCatalogItem } from "@/lib/menuCatalog"
import { popScopedHref } from "@/lib/popRoutes"
import { cn } from "@/lib/utils"
import { useDraggable, useDroppable } from "@dnd-kit/core"
import { Minus, Pencil, RotateCcw } from "lucide-react"
import { useRouter } from "next/navigation"
import type { ReactNode } from "react"

type Props = {
  siteId: string
  popId: string
}

function routeForDockItem(
  siteId: string,
  popId: string,
  item: MenuCatalogItem,
): string | null {
  if (item.href === "home") return "/home"
  if (!item.link || item.link === "section") return null
  return popScopedHref(siteId, popId, item.link)
}

function DockInsertTarget({
  index,
  layoutAnimating,
  showEndGap,
}: {
  index: number
  layoutAnimating?: boolean
  showEndGap?: boolean
}) {
  const { setNodeRef } = useDroppable({
    id: dockInsertId(index),
    data: { index },
  })

  const width = showEndGap ? DOCK_SLOT_SHIFT_PX : 10

  return (
    <div
      ref={setNodeRef}
      style={{
        width,
        transition: layoutAnimating
          ? "width 280ms cubic-bezier(0.2, 0.85, 0.25, 1)"
          : undefined,
      }}
      className="mb-1.5 h-12 shrink-0 self-center"
      aria-hidden
    />
  )
}

function DockEmptyInsertTarget({
  layoutAnimating,
}: {
  layoutAnimating?: boolean
}) {
  const { setNodeRef } = useDroppable({
    id: dockInsertId(0),
    data: { index: 0 },
  })

  return (
    <div
      ref={setNodeRef}
      style={{
        width: DOCK_SLOT_SHIFT_PX,
        transition: layoutAnimating
          ? "width 280ms cubic-bezier(0.2, 0.85, 0.25, 1)"
          : undefined,
      }}
      className="mb-1.5 h-12 shrink-0 self-center"
      aria-hidden
    />
  )
}

function DockShortcutsDropRow({
  enabled,
  children,
}: {
  enabled: boolean
  children: ReactNode
}) {
  const { setNodeRef } = useDroppable({
    id: DOCK_BAR_DROP_ID,
    disabled: !enabled,
  })

  return (
    <div
      ref={setNodeRef}
      className="flex min-h-12 items-end gap-0.5 rounded-2xl px-0.5"
    >
      {children}
    </div>
  )
}

function mergeRefs<T>(...refs: Array<(node: T | null) => void>) {
  return (node: T | null) => {
    for (const ref of refs) ref(node)
  }
}

function DraggableDockItem({
  item,
  index,
  canRemove,
  shiftX,
  layoutAnimating,
  onRemove,
}: {
  item: MenuCatalogItem
  index: number
  canRemove: boolean
  shiftX: number
  layoutAnimating: boolean
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
      ref={mergeRefs(setDragRef, setDropRef)}
      style={{
        transform: isDragging ? undefined : `translateX(${shiftX}px)`,
        transition: layoutAnimating
          ? "transform 280ms cubic-bezier(0.2, 0.85, 0.25, 1)"
          : undefined,
        animationDelay: `${(index % 5) * 45}ms`,
      }}
      className={cn(
        "relative touch-none",
        !isDragging && !layoutAnimating && "animate-dock-wiggle",
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
          "absolute -left-1 -top-1 z-10 flex size-[18px] items-center justify-center rounded-full bg-white/90 text-[11px] font-bold text-neutral-700 shadow-sm",
          !canRemove && "cursor-not-allowed opacity-35",
        )}
        aria-label={`Quitar ${item.name}`}
      >
        <Minus className="size-2.5" strokeWidth={3} aria-hidden />
      </button>
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
    resetDock,
  } = useMenuDockEdit()

  const layoutAnimating = dragging && dropPreviewIndex !== null
  const insertAtEnd =
    layoutAnimating &&
    activeDragKind === "menu" &&
    dropPreviewIndex === dockItems.length

  return (
    <div className="pointer-events-none absolute bottom-4 left-1/2 z-30 -translate-x-1/2">
      <div
        className={cn(
          "pointer-events-auto flex items-end gap-1 rounded-[1.35rem] border border-white/15 px-3 py-2 shadow-[0_8px_32px_rgba(0,0,0,0.28)] backdrop-blur-2xl transition-all duration-200 sm:gap-1.5 sm:px-4",
          editing
            ? "bg-black/45 ring-1 ring-white/10"
            : "bg-black/35",
        )}
      >
        {editing ? (
          <DockShortcutsDropRow enabled={dragging}>
            <DockInsertTarget index={0} layoutAnimating={layoutAnimating} />
            {dockItems.map((item, index) => (
              <div key={item.id} className="flex items-end">
                <DraggableDockItem
                  item={item}
                  index={index}
                  canRemove={canRemove}
                  shiftX={getDockItemShiftX(
                    item.id,
                    index,
                    dockIds,
                    previewDockIds,
                    activeDragKind,
                    dropPreviewIndex,
                    draggingItemId,
                  )}
                  layoutAnimating={layoutAnimating}
                  onRemove={() => removeFromDock(item.id)}
                />
                <DockInsertTarget
                  index={index + 1}
                  layoutAnimating={layoutAnimating}
                  showEndGap={insertAtEnd && index === dockItems.length - 1}
                />
              </div>
            ))}
            {dockItems.length === 0 && canAddMore ? (
              <DockEmptyInsertTarget layoutAnimating={layoutAnimating} />
            ) : null}
          </DockShortcutsDropRow>
        ) : (
          dockItems.map((item) => {
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
          })
        )}

        <div className="mx-0.5 mb-1.5 h-8 w-px self-center bg-white/15" aria-hidden />

        {editing ? (
          <>
            <button
              type="button"
              onClick={resetDock}
              className="mb-1.5 flex size-9 items-center justify-center rounded-xl bg-white/10 transition-colors hover:bg-white/15 active:scale-95"
              aria-label="Restaurar accesos directos"
            >
              <RotateCcw className="size-4 text-white/70" />
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="mb-1.5 rounded-xl bg-white/90 px-3 py-1.5 text-xs font-semibold text-neutral-900 transition-transform active:scale-95"
            >
              Listo
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="mb-1.5 flex size-9 items-center justify-center rounded-xl bg-white/10 transition-colors hover:bg-white/15 active:scale-95"
            aria-label="Editar accesos directos"
          >
            <Pencil className="size-4 text-white/70" />
          </button>
        )}
      </div>
    </div>
  )
}
