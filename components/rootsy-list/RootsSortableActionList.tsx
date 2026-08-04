"use client"

import { RootsSortableActionListRow } from "@/components/rootsy-list/RootsSortableActionListRow"
import type { RootsSortableActionListItem } from "@/components/rootsy-list/RootsSortableActionListRow"
import {
  ROOTS_SORTABLE_LAYOUT_TRANSITION,
  ROOTS_SORTABLE_ROW_HEIGHT_PX,
  ROOTS_SORTABLE_SLOT_SHIFT_PX,
  rootsSortableListEmptyClass,
} from "@/components/rootsy-list/rootsListStyles"
import {
  createRootsSortableCollisionDetection,
  getRootsSortableShiftY,
  moveRootsSortableItem,
  parseRootsSortableDragItemId,
  parseRootsSortableInsertIndex,
  rootsSortableDragId,
  rootsSortableInsertId,
  rootsSortableInsertZoneTop,
  rootsSortableInsertZoneHeight,
  rootsSortableListTrackHeight,
} from "@/components/rootsy-list/rootsSortableListUtils"
import { snapGrabPointToCursor } from "@/lib/dndModifiers"
import { cn } from "@/lib/utils"
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import { useCallback, useMemo, useState } from "react"

export type { RootsSortableActionListItem } from "@/components/rootsy-list/RootsSortableActionListRow"

type SharedRowProps = {
  canReorder: boolean
  canToggleVisibility: boolean
  canEdit: boolean
  canDelete: boolean
  editingId: string | null
  editingValue: string
  editSaveBusy: boolean
  onStartEdit: (item: RootsSortableActionListItem) => void
  onCancelEdit: () => void
  onEditingValueChange: (value: string) => void
  onSaveEdit: () => void
  onDelete: (item: RootsSortableActionListItem) => void
  onToggleVisibility: (id: string) => void
}

type Props = SharedRowProps & {
  listId?: string
  items: RootsSortableActionListItem[]
  onReorder: (items: RootsSortableActionListItem[]) => void
  emptyMessage?: string
  className?: string
}

function SortableInsertZone({
  listId,
  index,
  itemCount,
  active,
}: {
  listId: string
  index: number
  itemCount: number
  active: boolean
}) {
  const { setNodeRef } = useDroppable({
    id: rootsSortableInsertId(listId, index),
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
        top: rootsSortableInsertZoneTop(index, itemCount),
        height: rootsSortableInsertZoneHeight(index, itemCount),
      }}
      aria-hidden
    />
  )
}

function SortableSlot({
  listId,
  item,
  index,
  shiftY,
  dragAnimating,
  ...rowProps
}: SharedRowProps & {
  listId: string
  item: RootsSortableActionListItem
  index: number
  shiftY: number
  dragAnimating: boolean
}) {
  const isEditing = rowProps.editingId === item.id
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: rootsSortableDragId(listId, item.id),
    data: { itemId: item.id },
    disabled: !rowProps.canReorder || isEditing,
  })

  return (
    <div
      ref={setNodeRef}
      className="absolute left-0 right-0 z-20"
      style={{
        top: index * ROOTS_SORTABLE_SLOT_SHIFT_PX,
        height: ROOTS_SORTABLE_ROW_HEIGHT_PX,
        transform: !isDragging ? `translateY(${shiftY}px)` : undefined,
        transition: dragAnimating ? ROOTS_SORTABLE_LAYOUT_TRANSITION : undefined,
      }}
    >
      <div className={cn(isDragging && "opacity-0")}>
        <RootsSortableActionListRow
          item={item}
          isEditing={isEditing}
          editingValue={rowProps.editingValue}
          editSaveBusy={rowProps.editSaveBusy}
          canReorder={rowProps.canReorder}
          canToggleVisibility={rowProps.canToggleVisibility}
          canEdit={rowProps.canEdit}
          canDelete={rowProps.canDelete}
          dragHandleProps={
            rowProps.canReorder && !isEditing
              ? { attributes, listeners }
              : undefined
          }
          onStartEdit={() => rowProps.onStartEdit(item)}
          onCancelEdit={rowProps.onCancelEdit}
          onEditingValueChange={rowProps.onEditingValueChange}
          onSaveEdit={rowProps.onSaveEdit}
          onDelete={() => rowProps.onDelete(item)}
          onToggleVisibility={() => rowProps.onToggleVisibility(item.id)}
        />
      </div>
    </div>
  )
}

function StaticActionList({
  items,
  ...rowProps
}: SharedRowProps & { items: RootsSortableActionListItem[] }) {
  return (
    <div className="space-y-1.5">
      {items.map((item) => (
        <RootsSortableActionListRow
          key={item.id}
          item={item}
          isEditing={rowProps.editingId === item.id}
          editingValue={rowProps.editingValue}
          editSaveBusy={rowProps.editSaveBusy}
          canReorder={rowProps.canReorder}
          canToggleVisibility={rowProps.canToggleVisibility}
          canEdit={rowProps.canEdit}
          canDelete={rowProps.canDelete}
          onStartEdit={() => rowProps.onStartEdit(item)}
          onCancelEdit={rowProps.onCancelEdit}
          onEditingValueChange={rowProps.onEditingValueChange}
          onSaveEdit={rowProps.onSaveEdit}
          onDelete={() => rowProps.onDelete(item)}
          onToggleVisibility={() => rowProps.onToggleVisibility(item.id)}
        />
      ))}
    </div>
  )
}

export function RootsSortableActionList({
  listId = "roots-sortable-list",
  items,
  onReorder,
  emptyMessage = "Todavía no hay ítems.",
  className,
  canReorder = true,
  canToggleVisibility = false,
  canEdit = true,
  canDelete = true,
  editingId = null,
  editingValue = "",
  editSaveBusy = false,
  onStartEdit,
  onCancelEdit,
  onEditingValueChange,
  onSaveEdit,
  onDelete,
  onToggleVisibility,
}: Props) {
  const [draggingItemId, setDraggingItemId] = useState<string | null>(null)
  const [dropPreviewIndex, setDropPreviewIndex] = useState<number | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 4 },
    }),
  )

  const collisionDetection = useMemo(
    () => createRootsSortableCollisionDetection(listId),
    [listId],
  )

  const previewItems = useMemo(() => {
    if (dropPreviewIndex === null || !draggingItemId) return items
    return moveRootsSortableItem(items, draggingItemId, dropPreviewIndex)
  }, [items, dropPreviewIndex, draggingItemId])

  const draggingItem = useMemo(
    () => items.find((item) => item.id === draggingItemId) ?? null,
    [items, draggingItemId],
  )

  const clearDrag = useCallback(() => {
    setDraggingItemId(null)
    setDropPreviewIndex(null)
  }, [])

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const itemId = parseRootsSortableDragItemId(listId, event.active.id)
      if (itemId) setDraggingItemId(itemId)
    },
    [listId],
  )

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const insertIndex = parseRootsSortableInsertIndex(listId, event.over?.id)
      if (insertIndex === null) {
        setDropPreviewIndex((prev) => (prev === null ? prev : null))
        return
      }
      const clamped = Math.max(0, Math.min(insertIndex, items.length))
      setDropPreviewIndex((prev) => (prev === clamped ? prev : clamped))
    },
    [items.length, listId],
  )

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const insertIndex = parseRootsSortableInsertIndex(listId, event.over?.id)
      const activeId = draggingItemId
      clearDrag()

      if (insertIndex === null || !activeId || !canReorder) return

      const clamped = Math.max(0, Math.min(insertIndex, items.length))
      onReorder(moveRootsSortableItem(items, activeId, clamped))
    },
    [canReorder, clearDrag, draggingItemId, items, listId, onReorder],
  )

  const rowProps: SharedRowProps = {
    canReorder,
    canToggleVisibility,
    canEdit,
    canDelete,
    editingId,
    editingValue,
    editSaveBusy,
    onStartEdit,
    onCancelEdit,
    onEditingValueChange,
    onSaveEdit,
    onDelete,
    onToggleVisibility,
  }

  if (items.length === 0) {
    return (
      <p className={cn(rootsSortableListEmptyClass, className)}>{emptyMessage}</p>
    )
  }

  if (!canReorder) {
    return (
      <div className={className}>
        <StaticActionList items={items} {...rowProps} />
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={clearDrag}
    >
      <div
        className={cn("relative overflow-visible", className)}
        style={{ height: rootsSortableListTrackHeight(items.length) }}
      >
        {Array.from({ length: items.length + 1 }, (_, index) => (
          <SortableInsertZone
            key={`insert-${index}`}
            listId={listId}
            index={index}
            itemCount={items.length}
            active={draggingItemId != null}
          />
        ))}

        {items.map((item, index) => (
          <SortableSlot
            key={item.id}
            listId={listId}
            item={item}
            index={index}
            shiftY={getRootsSortableShiftY(
              item.id,
              items,
              previewItems,
              dropPreviewIndex,
              draggingItemId,
            )}
            dragAnimating={draggingItemId != null}
            {...rowProps}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={null} modifiers={[snapGrabPointToCursor]}>
        {draggingItem ? (
          <div className="cursor-grabbing shadow-lg">
            <RootsSortableActionListRow
              item={draggingItem}
              isEditing={false}
              editingValue=""
              editSaveBusy={false}
              canReorder={canReorder}
              canToggleVisibility={false}
              canEdit={false}
              canDelete={false}
              onStartEdit={() => {}}
              onCancelEdit={() => {}}
              onEditingValueChange={() => {}}
              onSaveEdit={() => {}}
              onDelete={() => {}}
              onToggleVisibility={() => {}}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
