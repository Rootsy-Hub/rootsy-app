"use client"

import {
  dockDragId,
  dockInsertId,
  useMenuDockEdit,
} from "@/app/[siteId]/[popId]/menu/MenuDockDndContext"
import type { MenuCatalogItem } from "@/lib/menuCatalog"
import { popScopedHref } from "@/lib/popRoutes"
import { cn } from "@/lib/utils"
import { useDraggable, useDroppable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { Check, Minus, Pencil, RotateCcw } from "lucide-react"
import { useRouter } from "next/navigation"

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

function DockIconVisual({
  item,
  className,
}: {
  item: MenuCatalogItem
  className?: string
}) {
  const Icon = item.icon
  return (
    <div
      className={cn(
        "relative flex size-12 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500/80 to-teal-600/80 shadow-md",
        className,
      )}
    >
      <div className="absolute inset-px rounded-[10px] border border-white/20" />
      <Icon className="relative size-6 text-white drop-shadow-sm" />
    </div>
  )
}

function DockInsertSlot({
  index,
  active,
  variant = "gap",
}: {
  index: number
  active: boolean
  variant?: "gap" | "empty"
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: dockInsertId(index),
    data: { index },
  })

  if (variant === "empty") {
    return (
      <div
        ref={setNodeRef}
        className={cn(
          "mb-1.5 size-12 shrink-0 rounded-xl border-2 border-dashed transition-colors duration-150",
          isOver
            ? "border-primary/55 bg-primary/10 shadow-[0_0_16px_hsl(var(--primary)/0.2)]"
            : "border-primary/20",
        )}
        aria-hidden
      />
    )
  }

  if (!active) return null

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "mb-1.5 w-2 shrink-0 self-center rounded-full transition-all duration-150",
        isOver
          ? "h-12 w-3 bg-primary/55 shadow-[0_0_12px_hsl(var(--primary)/0.35)]"
          : "h-8 bg-transparent",
      )}
      aria-hidden
    />
  )
}

function DraggableDockItem({
  item,
  canRemove,
  onRemove,
}: {
  item: MenuCatalogItem
  canRemove: boolean
  onRemove: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: dockDragId(item.id),
      data: { kind: "dock" as const, itemId: item.id },
    })

  return (
    <div
      ref={setNodeRef}
      style={{
        ...(transform ? { transform: CSS.Translate.toString(transform) } : undefined),
        animationDelay: `${(item.id.length % 5) * 40}ms`,
      }}
      className={cn(
        "relative animate-dock-wiggle touch-none",
        isDragging && "z-10 opacity-35",
      )}
    >
      <button
        type="button"
        {...listeners}
        {...attributes}
        className="relative cursor-grab scale-[0.96] transition-transform active:cursor-grabbing"
        aria-label={item.name}
      >
        <DockIconVisual
          item={item}
          className="from-emerald-500/70 to-teal-600/70 ring-2 ring-background"
        />
      </button>
      <button
        type="button"
        disabled={!canRemove}
        onPointerDown={(event) => event.stopPropagation()}
        onClick={onRemove}
        className={cn(
          "absolute -right-1.5 -top-1.5 z-10 flex size-5 items-center justify-center rounded-full border-2 border-background bg-destructive text-white shadow-md transition-transform",
          "hover:scale-110 active:scale-95",
          !canRemove && "cursor-not-allowed opacity-40",
        )}
        aria-label={`Quitar ${item.name}`}
      >
        <Minus className="size-3" strokeWidth={2.5} aria-hidden />
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
      className="group relative flex flex-col items-center gap-1 transition-all duration-200 hover:scale-110 hover:-translate-y-1 active:scale-95"
      aria-label={item.name}
    >
      <div className="absolute -bottom-2 left-1/2 h-2 w-8 -translate-x-1/2 rounded-full bg-primary/30 opacity-0 blur-md transition-opacity group-hover:opacity-100" />
      <div className="relative flex size-12 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500/80 to-teal-600/80 shadow-md transition-all group-hover:from-emerald-500 group-hover:to-teal-600 group-hover:shadow-emerald-500/30">
        <div className="absolute inset-0 translate-x-[-100%] bg-gradient-to-tr from-transparent via-white/25 to-transparent opacity-0 transition-all duration-500 group-hover:translate-x-[100%] group-hover:opacity-100" />
        <div className="absolute inset-px rounded-[10px] border border-white/20" />
        <Icon className="relative size-6 text-white drop-shadow-sm" />
      </div>
      <div className="pointer-events-none absolute -top-8 left-1/2 z-10 -translate-x-1/2 scale-90 whitespace-nowrap rounded-md bg-black/80 px-2 py-1 text-[10px] font-medium text-white opacity-0 backdrop-blur-sm transition-all group-hover:scale-100 group-hover:opacity-100">
        {item.name}
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
    dragging,
    canAddMore,
    canRemove,
    removeFromDock,
    resetDock,
  } = useMenuDockEdit()

  return (
    <div className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2">
      <div
        className={cn(
          "flex items-end gap-1 rounded-2xl border bg-muted px-3 py-2.5 backdrop-blur-2xl transition-all sm:gap-2 sm:px-4",
          editing ? "border-primary/35 ring-2 ring-primary/15" : "border-border",
        )}
      >
        {editing ? (
          <>
            <DockInsertSlot index={0} active={dragging} />
            {dockItems.map((item, index) => (
              <div key={item.id} className="flex items-end gap-1">
                <DraggableDockItem
                  item={item}
                  canRemove={canRemove}
                  onRemove={() => removeFromDock(item.id)}
                />
                <DockInsertSlot index={index + 1} active={dragging} />
              </div>
            ))}
            {dockItems.length === 0 && canAddMore ? (
              <DockInsertSlot index={0} active={dragging} variant="empty" />
            ) : null}
          </>
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

        <div className="mx-0.5 mb-1.5 h-8 w-px self-center bg-border/80" aria-hidden />

        {editing ? (
          <>
            <button
              type="button"
              onClick={resetDock}
              className="mb-1.5 flex size-10 items-center justify-center rounded-xl border border-border/70 bg-background/60 transition-all hover:border-border hover:bg-muted active:scale-95"
              aria-label="Restaurar accesos directos"
            >
              <RotateCcw className="size-4 text-muted-foreground" />
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="mb-1.5 flex size-10 items-center justify-center rounded-xl border border-primary/35 bg-primary/10 transition-all hover:bg-primary/15 active:scale-95"
              aria-label="Listo"
            >
              <Check className="size-4 text-primary" />
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className={cn(
              "mb-1.5 flex size-10 items-center justify-center rounded-xl border border-border/70 bg-background/60 transition-all",
              "hover:border-primary/35 hover:bg-primary/8 active:scale-95",
            )}
            aria-label="Editar accesos directos"
          >
            <Pencil className="size-4 text-muted-foreground transition-colors hover:text-primary" />
          </button>
        )}
      </div>
    </div>
  )
}
