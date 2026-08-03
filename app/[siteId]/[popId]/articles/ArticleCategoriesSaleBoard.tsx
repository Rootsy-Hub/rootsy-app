"use client"

import type {
  ArticleCategoryOption,
  CategoryLayoutUpdate,
} from "@/app/[siteId]/[popId]/articles/actions"
import { DataWorkspaceTableIconAction } from "@/components/data-workspace/DataWorkspaceListTablePrimitives"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  pointerWithin,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import type { DraggableAttributes } from "@dnd-kit/core"
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities"
import { snapGrabPointToCursor } from "@/lib/dndModifiers"
import { Check, Eye, EyeOff, GripVertical, Pencil, Trash2, X } from "lucide-react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

const CATEGORY_ROW_HEIGHT_PX = 44
const CATEGORY_ROW_GAP_PX = 6
const CATEGORY_SLOT_SHIFT_PX = CATEGORY_ROW_HEIGHT_PX + CATEGORY_ROW_GAP_PX

const LAYOUT_TRANSITION =
  "transform 320ms cubic-bezier(0.32, 0.72, 0, 1)"

type Props = {
  categories: ArticleCategoryOption[]
  canUpdate: boolean
  canDelete: boolean
  editingCategoryId: string | null
  editingCategoryName: string
  categorySaveBusy: boolean
  onStartEdit: (category: ArticleCategoryOption) => void
  onCancelEdit: () => void
  onEditingNameChange: (name: string) => void
  onSaveEdit: () => void
  onDelete: (id: string, name: string) => void
  onLayoutChange: (updates: CategoryLayoutUpdate[]) => void
}

function sortByOrder(a: ArticleCategoryOption, b: ArticleCategoryOption) {
  return a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, "es")
}

function layoutSignature(categories: ArticleCategoryOption[]): string {
  return categories
    .map((c) => `${c.id}:${c.sortOrder}:${c.showInSale ? 1 : 0}`)
    .join("|")
}

function updatesFromItems(items: ArticleCategoryOption[]): CategoryLayoutUpdate[] {
  return items.map((c, index) => ({
    id: c.id,
    sortOrder: index,
    showInSale: c.showInSale,
  }))
}

function categoryInsertId(index: number) {
  return `cat-insert-${index}`
}

function categoryDragId(id: string) {
  return `cat-drag-${id}`
}

function parseInsertIndex(overId: string | number | undefined): number | null {
  if (overId == null) return null
  const raw = String(overId)
  if (!raw.startsWith("cat-insert-")) return null
  const index = Number.parseInt(raw.slice("cat-insert-".length), 10)
  return Number.isFinite(index) ? index : null
}

function moveCategoryInList(
  items: ArticleCategoryOption[],
  itemId: string,
  index: number,
): ArticleCategoryOption[] {
  const from = items.findIndex((item) => item.id === itemId)
  if (from < 0) return items
  const next = items.filter((item) => item.id !== itemId)
  const target = Math.max(0, Math.min(index, next.length))
  next.splice(target, 0, items[from]!)
  return next.map((item, sortOrder) => ({ ...item, sortOrder }))
}

function getCategoryShiftY(
  itemId: string,
  items: ArticleCategoryOption[],
  previewItems: ArticleCategoryOption[],
  dropPreviewIndex: number | null,
  draggingItemId: string | null,
): number {
  if (dropPreviewIndex === null || !draggingItemId || itemId === draggingItemId) {
    return 0
  }
  const origIdx = items.findIndex((item) => item.id === itemId)
  const previewIdx = previewItems.findIndex((item) => item.id === itemId)
  if (origIdx < 0 || previewIdx < 0) return 0
  return (previewIdx - origIdx) * CATEGORY_SLOT_SHIFT_PX
}

function listTrackHeight(itemCount: number) {
  if (itemCount <= 0) return 0
  return (itemCount - 1) * CATEGORY_SLOT_SHIFT_PX + CATEGORY_ROW_HEIGHT_PX
}

function categoryInsertZoneTop(index: number, itemCount: number) {
  if (index >= itemCount) {
    return (itemCount - 1) * CATEGORY_SLOT_SHIFT_PX + CATEGORY_ROW_HEIGHT_PX
  }
  return index * CATEGORY_SLOT_SHIFT_PX
}

const categoryCollisionDetection: CollisionDetection = (args) => {
  const collisions = pointerWithin(args)
  if (collisions.length === 0) return collisions

  const insertHits = collisions.filter((entry) =>
    String(entry.id).startsWith("cat-insert-"),
  )
  if (insertHits.length === 0) return collisions
  if (insertHits.length === 1) return insertHits

  const pointer = args.pointerCoordinates
  if (!pointer) return insertHits

  const sorted = [...insertHits].sort((a, b) => {
    const rectA = args.droppableRects.get(a.id)
    const rectB = args.droppableRects.get(b.id)
    if (!rectA || !rectB) return 0
    const centerA = rectA.top + rectA.height / 2
    const centerB = rectB.top + rectB.height / 2
    return Math.abs(pointer.y - centerA) - Math.abs(pointer.y - centerB)
  })

  return [sorted[0]!]
}

function CategoryInsertZone({
  index,
  itemCount,
  active,
}: {
  index: number
  itemCount: number
  active: boolean
}) {
  const { setNodeRef } = useDroppable({
    id: categoryInsertId(index),
    data: { index },
    disabled: !active,
  })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "absolute left-0 right-0 z-10",
        !active && "pointer-events-none",
      )}
      style={{
        top: categoryInsertZoneTop(index, itemCount),
        height: CATEGORY_SLOT_SHIFT_PX,
      }}
      aria-hidden
    />
  )
}

function CategoryRowCard({
  category,
  isEditing,
  editingCategoryName,
  categorySaveBusy,
  canUpdate,
  canDelete,
  dragHandleProps,
  onStartEdit,
  onCancelEdit,
  onEditingNameChange,
  onSaveEdit,
  onDelete,
  onToggleVisibility,
}: {
  category: ArticleCategoryOption
  isEditing: boolean
  editingCategoryName: string
  categorySaveBusy: boolean
  canUpdate: boolean
  canDelete: boolean
  dragHandleProps?: {
    attributes: DraggableAttributes
    listeners: SyntheticListenerMap | undefined
  }
  onStartEdit: () => void
  onCancelEdit: () => void
  onEditingNameChange: (name: string) => void
  onSaveEdit: () => void
  onDelete: () => void
  onToggleVisibility: () => void
}) {
  return (
    <div
      className={cn(
        "flex h-11 items-center gap-2 rounded-lg border border-border/70 bg-background px-2 shadow-sm",
        !category.showInSale && "opacity-60",
      )}
    >
      {canUpdate && dragHandleProps ? (
        <button
          type="button"
          className="inline-flex size-8 shrink-0 cursor-grab items-center justify-center rounded-lg text-muted-foreground/70 active:cursor-grabbing"
          aria-label={`Reordenar ${category.name || "categoría"}`}
          {...dragHandleProps.attributes}
          {...dragHandleProps.listeners}
        >
          <GripVertical className="size-4" aria-hidden />
        </button>
      ) : canUpdate ? (
        <GripVertical
          className="size-4 shrink-0 text-muted-foreground/70"
          aria-hidden
        />
      ) : null}
      <div className="min-w-0 flex-1">
        {isEditing ? (
          <Input
            value={editingCategoryName}
            onChange={(event) => onEditingNameChange(event.target.value)}
            className="h-8 bg-background"
            autoFocus
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault()
                onSaveEdit()
              }
              if (event.key === "Escape") {
                event.preventDefault()
                onCancelEdit()
              }
            }}
          />
        ) : (
          <p className="truncate text-sm font-medium text-foreground">
            {category.name || "—"}
          </p>
        )}
      </div>
      {canUpdate || canDelete ? (
        <div className="flex shrink-0 items-center justify-end gap-0.5">
          {isEditing ? (
            <>
              <DataWorkspaceTableIconAction
                label="Cancelar edición"
                icon={X}
                variant="neutral"
                onClick={onCancelEdit}
              />
              <DataWorkspaceTableIconAction
                label={`Guardar ${category.name || "categoría"}`}
                icon={Check}
                variant="edit"
                disabled={categorySaveBusy || !editingCategoryName.trim()}
                onClick={onSaveEdit}
              />
            </>
          ) : (
            <>
              {canUpdate ? (
                <DataWorkspaceTableIconAction
                  label={
                    category.showInSale
                      ? `Ocultar ${category.name || "categoría"} en ventas`
                      : `Mostrar ${category.name || "categoría"} en ventas`
                  }
                  icon={category.showInSale ? Eye : EyeOff}
                  variant="neutral"
                  onClick={onToggleVisibility}
                />
              ) : null}
              {canUpdate ? (
                <DataWorkspaceTableIconAction
                  label={`Editar ${category.name || "categoría"}`}
                  icon={Pencil}
                  onClick={onStartEdit}
                />
              ) : null}
              {canDelete ? (
                <DataWorkspaceTableIconAction
                  label={`Eliminar ${category.name || "categoría"}`}
                  icon={Trash2}
                  variant="destructive"
                  onClick={onDelete}
                />
              ) : null}
            </>
          )}
        </div>
      ) : null}
    </div>
  )
}

function CategorySortableSlot({
  category,
  index,
  shiftY,
  dragAnimating,
  canUpdate,
  canDelete,
  editingCategoryId,
  editingCategoryName,
  categorySaveBusy,
  onStartEdit,
  onCancelEdit,
  onEditingNameChange,
  onSaveEdit,
  onDelete,
  onToggleVisibility,
}: {
  category: ArticleCategoryOption
  index: number
  shiftY: number
  dragAnimating: boolean
  canUpdate: boolean
  canDelete: boolean
  editingCategoryId: string | null
  editingCategoryName: string
  categorySaveBusy: boolean
  onStartEdit: (category: ArticleCategoryOption) => void
  onCancelEdit: () => void
  onEditingNameChange: (name: string) => void
  onSaveEdit: () => void
  onDelete: (id: string, name: string) => void
  onToggleVisibility: (id: string) => void
}) {
  const isEditing = editingCategoryId === category.id
  const {
    attributes,
    listeners,
    setNodeRef,
    isDragging,
  } = useDraggable({
    id: categoryDragId(category.id),
    data: { itemId: category.id },
    disabled: !canUpdate || isEditing,
  })

  return (
    <div
      ref={setNodeRef}
      className="absolute left-0 right-0 z-20"
      style={{
        top: index * CATEGORY_SLOT_SHIFT_PX,
        height: CATEGORY_ROW_HEIGHT_PX,
        transform: !isDragging ? `translateY(${shiftY}px)` : undefined,
        transition: dragAnimating ? LAYOUT_TRANSITION : undefined,
      }}
    >
      <div className={cn(isDragging && "opacity-0")}>
        <CategoryRowCard
          category={category}
          isEditing={isEditing}
          editingCategoryName={editingCategoryName}
          categorySaveBusy={categorySaveBusy}
          canUpdate={canUpdate}
          canDelete={canDelete}
          dragHandleProps={
            canUpdate && !isEditing
              ? { attributes, listeners }
              : undefined
          }
          onStartEdit={() => onStartEdit(category)}
          onCancelEdit={onCancelEdit}
          onEditingNameChange={onEditingNameChange}
          onSaveEdit={onSaveEdit}
          onDelete={() => onDelete(category.id, category.name)}
          onToggleVisibility={() => onToggleVisibility(category.id)}
        />
      </div>
    </div>
  )
}

function StaticCategoryList({
  items,
  canUpdate,
  canDelete,
  editingCategoryId,
  editingCategoryName,
  categorySaveBusy,
  onStartEdit,
  onCancelEdit,
  onEditingNameChange,
  onSaveEdit,
  onDelete,
  onToggleVisibility,
}: {
  items: ArticleCategoryOption[]
  canUpdate: boolean
  canDelete: boolean
  editingCategoryId: string | null
  editingCategoryName: string
  categorySaveBusy: boolean
  onStartEdit: (category: ArticleCategoryOption) => void
  onCancelEdit: () => void
  onEditingNameChange: (name: string) => void
  onSaveEdit: () => void
  onDelete: (id: string, name: string) => void
  onToggleVisibility: (id: string) => void
}) {
  return (
    <div className="space-y-1.5">
      {items.map((category) => (
        <CategoryRowCard
          key={category.id}
          category={category}
          isEditing={editingCategoryId === category.id}
          editingCategoryName={editingCategoryName}
          categorySaveBusy={categorySaveBusy}
          canUpdate={canUpdate}
          canDelete={canDelete}
          onStartEdit={() => onStartEdit(category)}
          onCancelEdit={onCancelEdit}
          onEditingNameChange={onEditingNameChange}
          onSaveEdit={onSaveEdit}
          onDelete={() => onDelete(category.id, category.name)}
          onToggleVisibility={() => onToggleVisibility(category.id)}
        />
      ))}
    </div>
  )
}

export function ArticleCategoriesSaleBoard({
  categories,
  canUpdate,
  canDelete,
  editingCategoryId,
  editingCategoryName,
  categorySaveBusy,
  onStartEdit,
  onCancelEdit,
  onEditingNameChange,
  onSaveEdit,
  onDelete,
  onLayoutChange,
}: Props) {
  const [items, setItems] = useState(() => [...categories].sort(sortByOrder))
  const [draggingItemId, setDraggingItemId] = useState<string | null>(null)
  const [dropPreviewIndex, setDropPreviewIndex] = useState<number | null>(null)
  const pendingLayoutSigRef = useRef<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 4 },
    }),
  )

  useEffect(() => {
    if (draggingItemId) return
    const incomingSig = layoutSignature(categories)
    const pending = pendingLayoutSigRef.current
    if (pending) {
      if (incomingSig === pending) {
        pendingLayoutSigRef.current = null
      } else {
        return
      }
    }
    setItems([...categories].sort(sortByOrder))
  }, [categories, draggingItemId])

  const persistLayout = useCallback(
    (nextItems: ArticleCategoryOption[]) => {
      pendingLayoutSigRef.current = layoutSignature(nextItems)
      onLayoutChange(updatesFromItems(nextItems))
    },
    [onLayoutChange],
  )

  const previewItems = useMemo(() => {
    if (dropPreviewIndex === null || !draggingItemId) return items
    return moveCategoryInList(items, draggingItemId, dropPreviewIndex)
  }, [items, dropPreviewIndex, draggingItemId])

  const draggingItem = useMemo(
    () => items.find((item) => item.id === draggingItemId) ?? null,
    [items, draggingItemId],
  )

  const clearDrag = useCallback(() => {
    setDraggingItemId(null)
    setDropPreviewIndex(null)
  }, [])

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const raw = String(event.active.id)
    if (!raw.startsWith("cat-drag-")) return
    setDraggingItemId(raw.slice("cat-drag-".length))
  }, [])

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const insertIndex = parseInsertIndex(event.over?.id)
      if (insertIndex === null) {
        setDropPreviewIndex((prev) => (prev === null ? prev : null))
        return
      }
      const clamped = Math.max(0, Math.min(insertIndex, items.length))
      setDropPreviewIndex((prev) => (prev === clamped ? prev : clamped))
    },
    [items.length],
  )

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const insertIndex = parseInsertIndex(event.over?.id)
      const activeId = draggingItemId
      clearDrag()

      if (insertIndex === null || !activeId || !canUpdate) return

      const clamped = Math.max(0, Math.min(insertIndex, items.length))
      const nextItems = moveCategoryInList(items, activeId, clamped)
      setItems(nextItems)
      persistLayout(nextItems)
    },
    [canUpdate, clearDrag, draggingItemId, items, persistLayout],
  )

  const toggleVisibility = (id: string) => {
    if (!canUpdate) return
    const nextItems = items.map((item) =>
      item.id === id ? { ...item, showInSale: !item.showInSale } : item,
    )
    setItems(nextItems)
    persistLayout(nextItems)
  }

  const listBody = (
    <div className="p-2">
      {items.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border/80 px-3 py-6 text-center text-xs text-muted-foreground">
          Todavía no hay categorías.
        </p>
      ) : canUpdate ? (
        <div
          className="relative overflow-visible"
          style={{ height: listTrackHeight(items.length) }}
        >
          {Array.from({ length: items.length + 1 }, (_, index) => (
            <CategoryInsertZone
              key={`insert-${index}`}
              index={index}
              itemCount={items.length}
              active={draggingItemId != null}
            />
          ))}

          {items.map((category, index) => (
            <CategorySortableSlot
              key={category.id}
              category={category}
              index={index}
              shiftY={getCategoryShiftY(
                category.id,
                items,
                previewItems,
                dropPreviewIndex,
                draggingItemId,
              )}
              dragAnimating={draggingItemId != null}
              canUpdate={canUpdate}
              canDelete={canDelete}
              editingCategoryId={editingCategoryId}
              editingCategoryName={editingCategoryName}
              categorySaveBusy={categorySaveBusy}
              onStartEdit={onStartEdit}
              onCancelEdit={onCancelEdit}
              onEditingNameChange={onEditingNameChange}
              onSaveEdit={onSaveEdit}
              onDelete={onDelete}
              onToggleVisibility={toggleVisibility}
            />
          ))}
        </div>
      ) : (
        <StaticCategoryList
          items={items}
          canUpdate={canUpdate}
          canDelete={canDelete}
          editingCategoryId={editingCategoryId}
          editingCategoryName={editingCategoryName}
          categorySaveBusy={categorySaveBusy}
          onStartEdit={onStartEdit}
          onCancelEdit={onCancelEdit}
          onEditingNameChange={onEditingNameChange}
          onSaveEdit={onSaveEdit}
          onDelete={onDelete}
          onToggleVisibility={toggleVisibility}
        />
      )}
    </div>
  )

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-border bg-muted/10">
        <div className="border-b border-border/70 px-3 py-2.5">
          <p className="text-sm font-semibold text-foreground">Categorías</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Arrastrá para ordenar. Usá el ojo para mostrar u ocultar en ventas.
          </p>
        </div>
        {canUpdate ? (
          <DndContext
            sensors={sensors}
            collisionDetection={categoryCollisionDetection}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            onDragCancel={clearDrag}
          >
            {listBody}
            <DragOverlay dropAnimation={null} modifiers={[snapGrabPointToCursor]}>
              {draggingItem ? (
                <div className="cursor-grabbing shadow-lg">
                  <CategoryRowCard
                    category={draggingItem}
                    isEditing={false}
                    editingCategoryName=""
                    categorySaveBusy={false}
                    canUpdate={canUpdate}
                    canDelete={false}
                    onStartEdit={() => {}}
                    onCancelEdit={() => {}}
                    onEditingNameChange={() => {}}
                    onSaveEdit={() => {}}
                    onDelete={() => {}}
                    onToggleVisibility={() => {}}
                  />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        ) : (
          listBody
        )}
      </div>
      {canUpdate ? (
        <p className="text-xs text-muted-foreground">
          Los cambios de orden y visibilidad se guardan al soltar o al tocar el ojo.
        </p>
      ) : null}
    </div>
  )
}
