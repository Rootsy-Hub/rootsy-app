import type { CollisionDetection } from "@dnd-kit/core"
import { pointerWithin } from "@dnd-kit/core"
import {
  rootsSortableRowMetrics,
  type RootsSortableRowSize,
} from "@/components/rootsy-list/rootsListStyles"

export function rootsSortableDragId(listId: string, itemId: string) {
  return `${listId}-drag-${itemId}`
}

export function rootsSortableInsertId(listId: string, index: number) {
  return `${listId}-insert-${index}`
}

export function parseRootsSortableInsertIndex(
  listId: string,
  overId: string | number | undefined,
): number | null {
  if (overId == null) return null
  const raw = String(overId)
  const prefix = `${listId}-insert-`
  if (!raw.startsWith(prefix)) return null
  const index = Number.parseInt(raw.slice(prefix.length), 10)
  return Number.isFinite(index) ? index : null
}

export function parseRootsSortableDragItemId(
  listId: string,
  activeId: string | number,
): string | null {
  const raw = String(activeId)
  const prefix = `${listId}-drag-`
  if (!raw.startsWith(prefix)) return null
  return raw.slice(prefix.length)
}

export function moveRootsSortableItem<T extends { id: string }>(
  items: T[],
  itemId: string,
  index: number,
): T[] {
  const from = items.findIndex((item) => item.id === itemId)
  if (from < 0) return items
  const next = items.filter((item) => item.id !== itemId)
  const target = Math.max(0, Math.min(index, next.length))
  next.splice(target, 0, items[from]!)
  return next
}

export function rootsSortableListTrackHeight(
  itemCount: number,
  rowSize: RootsSortableRowSize = "default",
) {
  if (itemCount <= 0) return 0
  const { rowHeightPx, slotShiftPx } = rootsSortableRowMetrics(rowSize)
  return (itemCount - 1) * slotShiftPx + rowHeightPx
}

export function rootsSortableInsertZoneTop(
  index: number,
  itemCount: number,
  rowSize: RootsSortableRowSize = "default",
) {
  const { slotShiftPx } = rootsSortableRowMetrics(rowSize)
  if (index >= itemCount) {
    const trackHeight = rootsSortableListTrackHeight(itemCount, rowSize)
    return Math.max(0, trackHeight - slotShiftPx)
  }
  return index * slotShiftPx
}

export function rootsSortableInsertZoneHeight(
  index: number,
  itemCount: number,
  rowSize: RootsSortableRowSize = "default",
) {
  const { slotShiftPx } = rootsSortableRowMetrics(rowSize)
  if (index >= itemCount) {
    const trackHeight = rootsSortableListTrackHeight(itemCount, rowSize)
    const top = rootsSortableInsertZoneTop(index, itemCount, rowSize)
    return Math.min(slotShiftPx, trackHeight - top)
  }
  return slotShiftPx
}

export function getRootsSortableShiftY<T extends { id: string }>(
  itemId: string,
  items: T[],
  previewItems: T[],
  dropPreviewIndex: number | null,
  draggingItemId: string | null,
  rowSize: RootsSortableRowSize = "default",
): number {
  if (dropPreviewIndex === null || !draggingItemId || itemId === draggingItemId) {
    return 0
  }
  const origIdx = items.findIndex((item) => item.id === itemId)
  const previewIdx = previewItems.findIndex((item) => item.id === itemId)
  if (origIdx < 0 || previewIdx < 0) return 0
  return (previewIdx - origIdx) * rootsSortableRowMetrics(rowSize).slotShiftPx
}

export function createRootsSortableCollisionDetection(
  listId: string,
): CollisionDetection {
  return (args) => {
    const collisions = pointerWithin(args)
    if (collisions.length === 0) return collisions

    const insertPrefix = `${listId}-insert-`
    const insertHits = collisions.filter((entry) =>
      String(entry.id).startsWith(insertPrefix),
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
}
