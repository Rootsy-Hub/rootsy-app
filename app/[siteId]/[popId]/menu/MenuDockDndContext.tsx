"use client"

import {
  canUseMenuDockItem,
  DEFAULT_MENU_DOCK_IDS,
  getMenuCatalogItem,
  type MenuCatalogItem,
  type MenuDockItemId,
  type MenuItemDef,
} from "@/lib/menuCatalog"
import {
  listResolvedMenuDockItems,
  MAX_MENU_DOCK_ITEMS,
  MIN_MENU_DOCK_ITEMS,
  persistMenuDockIds,
  resolveMenuDockIds,
} from "@/lib/menuDockPreference"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  pointerWithin,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

type DragKind = "menu" | "dock"

export type MenuDockDragItem = MenuCatalogItem | MenuItemDef

export const DOCK_SLOT_SHIFT_PX = 54

const dockCollisionDetection: CollisionDetection = (args) => {
  const pointerHits = pointerWithin(args)
  if (pointerHits.length > 0) return pointerHits
  return closestCenter(args)
}

type MenuDockEditContextValue = {
  editing: boolean
  setEditing: (editing: boolean) => void
  dockIdSet: Set<MenuDockItemId>
  dockIds: MenuDockItemId[]
  dockItems: MenuCatalogItem[]
  previewDockIds: MenuDockItemId[]
  dragging: boolean
  draggingItem: MenuDockDragItem | null
  draggingItemId: MenuDockItemId | null
  activeDragKind: DragKind | null
  dropPreviewIndex: number | null
  canAddMore: boolean
  canRemove: boolean
  isInDock: (id: MenuDockItemId) => boolean
  canDragMenuItem: (link: MenuItemDef["link"]) => boolean
  removeFromDock: (id: MenuDockItemId) => void
  resetDock: () => void
}

const MenuDockEditContext = createContext<MenuDockEditContextValue | null>(null)

export function useMenuDockEdit() {
  const ctx = useContext(MenuDockEditContext)
  if (!ctx) {
    throw new Error("useMenuDockEdit debe usarse dentro de MenuDockDndProvider")
  }
  return ctx
}

export function menuDragId(id: MenuDockItemId) {
  return `menu:${id}`
}

export function dockDragId(id: MenuDockItemId) {
  return `dock:${id}`
}

export function dockInsertId(index: number) {
  return `dock-insert-${index}`
}

export const DOCK_BAR_DROP_ID = "dock-bar"

export function resolveDockInsertIndex(
  overId: string | number | undefined,
  dockIds: readonly MenuDockItemId[],
): number | null {
  if (overId == null) return null
  const raw = String(overId)

  const insert = parseInsertIndex(raw)
  if (insert !== null) return insert

  if (raw === DOCK_BAR_DROP_ID) return dockIds.length

  if (raw.startsWith("dock:")) {
    const itemId = raw.slice("dock:".length) as MenuDockItemId
    const idx = dockIds.indexOf(itemId)
    if (idx >= 0) return idx
  }

  return null
}

export function parseDragMeta(
  id: string | number,
): { kind: DragKind; itemId: MenuDockItemId } | null {
  const raw = String(id)
  if (raw.startsWith("menu:")) {
    return { kind: "menu", itemId: raw.slice("menu:".length) as MenuDockItemId }
  }
  if (raw.startsWith("dock:")) {
    return { kind: "dock", itemId: raw.slice("dock:".length) as MenuDockItemId }
  }
  return null
}

export function parseInsertIndex(overId: string | number): number | null {
  const raw = String(overId)
  if (!raw.startsWith("dock-insert-")) return null
  const index = Number.parseInt(raw.slice("dock-insert-".length), 10)
  return Number.isFinite(index) ? index : null
}

export function getDockItemShiftX(
  itemId: MenuDockItemId,
  index: number,
  dockIds: readonly MenuDockItemId[],
  previewDockIds: readonly MenuDockItemId[],
  activeDragKind: DragKind | null,
  dropPreviewIndex: number | null,
  draggingItemId: MenuDockItemId | null,
): number {
  if (dropPreviewIndex === null || !draggingItemId || itemId === draggingItemId) {
    return 0
  }

  if (activeDragKind === "menu") {
    return index >= dropPreviewIndex ? DOCK_SLOT_SHIFT_PX : 0
  }

  const origIdx = dockIds.indexOf(itemId)
  const previewIdx = previewDockIds.indexOf(itemId)
  if (origIdx < 0 || previewIdx < 0) return 0
  return (previewIdx - origIdx) * DOCK_SLOT_SHIFT_PX
}

function insertDockId(
  ids: readonly MenuDockItemId[],
  itemId: MenuDockItemId,
  index: number,
): MenuDockItemId[] {
  const next = [...ids]
  const clamped = Math.max(0, Math.min(index, next.length))
  if (next.includes(itemId)) return next
  next.splice(clamped, 0, itemId)
  return next.slice(0, MAX_MENU_DOCK_ITEMS)
}

function moveDockId(
  ids: readonly MenuDockItemId[],
  itemId: MenuDockItemId,
  index: number,
): MenuDockItemId[] {
  const from = ids.indexOf(itemId)
  if (from < 0) return [...ids]
  const next = ids.filter((id) => id !== itemId)
  const target = Math.max(0, Math.min(index, next.length))
  next.splice(target, 0, itemId)
  return next
}

export function menuLinkToDockId(link: MenuItemDef["link"]): MenuDockItemId | null {
  if (link === "section") return null
  return link
}

function getDragItemId(item: MenuDockDragItem | null): MenuDockItemId | null {
  if (!item) return null
  if ("id" in item && typeof item.id === "string") return item.id
  if ("link" in item && item.link) return menuLinkToDockId(item.link)
  return null
}

export function DockIconVisual({
  icon: Icon,
  className,
  size = "md",
}: {
  icon: LucideIcon
  className?: string
  size?: "md" | "sm" | "lg"
}) {
  const dim =
    size === "sm" ? "size-10" : size === "lg" ? "size-[72px]" : "size-12"
  const iconDim =
    size === "sm" ? "size-5" : size === "lg" ? "size-8" : "size-6"
  const radius = size === "lg" ? "rounded-[20px]" : "rounded-[22%]"
  const innerRadius = size === "lg" ? "rounded-[19px]" : "rounded-[20%]"
  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-500/80 to-teal-600/80 shadow-md",
        dim,
        radius,
        className,
      )}
    >
      <div className={cn("absolute inset-px border border-white/20", innerRadius)} />
      <Icon className={cn("relative text-white drop-shadow-sm", iconDim)} />
    </div>
  )
}

type ProviderProps = {
  popId: string
  permissionKeys: readonly string[]
  children: ReactNode
}

export function MenuDockDndProvider({
  popId,
  permissionKeys,
  children,
}: ProviderProps) {
  const [editing, setEditing] = useState(false)
  const [draggingItem, setDraggingItem] = useState<MenuDockDragItem | null>(null)
  const [activeDragKind, setActiveDragKind] = useState<DragKind | null>(null)
  const [dropPreviewIndex, setDropPreviewIndex] = useState<number | null>(null)
  const [dockIds, setDockIds] = useState<MenuDockItemId[]>(() =>
    resolveMenuDockIds(popId, permissionKeys),
  )

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
  )

  useEffect(() => {
    setDockIds(resolveMenuDockIds(popId, permissionKeys))
  }, [popId, permissionKeys])

  useEffect(() => {
    if (!editing) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setEditing(false)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [editing])

  const dockItems = useMemo(
    () => listResolvedMenuDockItems(popId, permissionKeys, dockIds),
    [popId, permissionKeys, dockIds],
  )

  const dockIdSet = useMemo(() => new Set(dockIds), [dockIds])
  const canAddMore = dockIds.length < MAX_MENU_DOCK_ITEMS
  const canRemove = dockIds.length > MIN_MENU_DOCK_ITEMS
  const draggingItemId = getDragItemId(draggingItem)

  const previewDockIds = useMemo(() => {
    if (dropPreviewIndex === null || !draggingItemId || !activeDragKind) {
      return dockIds
    }
    if (activeDragKind === "menu") {
      if (!canAddMore || dockIdSet.has(draggingItemId)) return dockIds
      if (!canUseMenuDockItem(draggingItemId, permissionKeys)) return dockIds
      return insertDockId(dockIds, draggingItemId, dropPreviewIndex)
    }
    return moveDockId(dockIds, draggingItemId, dropPreviewIndex)
  }, [
    dropPreviewIndex,
    draggingItemId,
    activeDragKind,
    dockIds,
    canAddMore,
    dockIdSet,
    permissionKeys,
  ])

  const handleDockIdsChange = useCallback(
    (next: MenuDockItemId[]) => {
      const persisted = persistMenuDockIds(popId, next, permissionKeys)
      setDockIds(persisted)
    },
    [popId, permissionKeys],
  )

  const removeFromDock = useCallback(
    (id: MenuDockItemId) => {
      if (!canRemove) return
      handleDockIdsChange(dockIds.filter((entry) => entry !== id))
    },
    [canRemove, dockIds, handleDockIdsChange],
  )

  const resetDock = useCallback(() => {
    handleDockIdsChange([...DEFAULT_MENU_DOCK_IDS])
  }, [handleDockIdsChange])

  const canDragMenuItem = useCallback(
    (link: MenuItemDef["link"]) => {
      if (!editing) return false
      const id = menuLinkToDockId(link)
      if (!id) return false
      if (dockIdSet.has(id)) return false
      if (!canAddMore) return false
      return canUseMenuDockItem(id, permissionKeys)
    },
    [editing, dockIdSet, canAddMore, permissionKeys],
  )

  const clearDragState = useCallback(() => {
    setDraggingItem(null)
    setActiveDragKind(null)
    setDropPreviewIndex(null)
  }, [])

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const meta = parseDragMeta(event.active.id)
    if (!meta) return

    setActiveDragKind(meta.kind)

    const catalog = getMenuCatalogItem(meta.itemId)
    if (catalog) {
      setDraggingItem(catalog)
      return
    }

    const data = event.active.data.current as
      | { menuItem?: MenuItemDef }
      | undefined
    if (data?.menuItem) {
      setDraggingItem(data.menuItem)
    }
  }, [])

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const insertIndex = resolveDockInsertIndex(event.over?.id, dockIds)

      if (insertIndex === null) {
        setDropPreviewIndex((prev) => (prev === null ? prev : null))
        return
      }

      const dragMeta = parseDragMeta(event.active.id)
      if (!dragMeta) {
        setDropPreviewIndex((prev) => (prev === null ? prev : null))
        return
      }

      if (dragMeta.kind === "menu") {
        if (
          !canAddMore ||
          dockIdSet.has(dragMeta.itemId) ||
          !canUseMenuDockItem(dragMeta.itemId, permissionKeys)
        ) {
          setDropPreviewIndex((prev) => (prev === null ? prev : null))
          return
        }
      }

      setDropPreviewIndex((prev) => (prev === insertIndex ? prev : insertIndex))
    },
    [dockIds, canAddMore, dockIdSet, permissionKeys],
  )

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      const dragMeta = parseDragMeta(active.id)
      const insertIndex = resolveDockInsertIndex(over?.id, dockIds)

      clearDragState()

      if (!over || !dragMeta || insertIndex === null) return

      if (dragMeta.kind === "menu") {
        if (!canAddMore || dockIdSet.has(dragMeta.itemId)) return
        if (!canUseMenuDockItem(dragMeta.itemId, permissionKeys)) return
        handleDockIdsChange(insertDockId(dockIds, dragMeta.itemId, insertIndex))
        return
      }

      handleDockIdsChange(moveDockId(dockIds, dragMeta.itemId, insertIndex))
    },
    [
      dockIds,
      canAddMore,
      dockIdSet,
      permissionKeys,
      clearDragState,
      handleDockIdsChange,
    ],
  )

  const handleDragCancel = useCallback(() => {
    clearDragState()
  }, [clearDragState])

  const showMenuDragOverlay =
    draggingItem != null && activeDragKind === "menu"

  const showDockDragOverlay =
    draggingItem != null && activeDragKind === "dock"

  const contextValue = useMemo<MenuDockEditContextValue>(
    () => ({
      editing,
      setEditing,
      dockIdSet,
      dockIds,
      dockItems,
      previewDockIds,
      dragging: draggingItem != null,
      draggingItem,
      draggingItemId,
      activeDragKind,
      dropPreviewIndex,
      canAddMore,
      canRemove,
      isInDock: (id) => dockIdSet.has(id),
      canDragMenuItem,
      removeFromDock,
      resetDock,
    }),
    [
      editing,
      dockIdSet,
      dockIds,
      dockItems,
      previewDockIds,
      draggingItem,
      draggingItemId,
      activeDragKind,
      dropPreviewIndex,
      canAddMore,
      canRemove,
      canDragMenuItem,
      removeFromDock,
      resetDock,
    ],
  )

  return (
    <MenuDockEditContext.Provider value={contextValue}>
      <DndContext
        sensors={sensors}
        collisionDetection={dockCollisionDetection}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        {children}
        <DragOverlay dropAnimation={null} zIndex={50}>
          {showMenuDragOverlay && draggingItem ? (
            <div className="cursor-grabbing scale-[1.18] drop-shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
              <DockIconVisual
                icon={draggingItem.icon}
                className="from-emerald-500 to-teal-600 ring-2 ring-white/40"
              />
            </div>
          ) : showDockDragOverlay && draggingItem ? (
            <div className="cursor-grabbing scale-[1.18] drop-shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
              <DockIconVisual
                icon={draggingItem.icon}
                className="from-emerald-500 to-teal-600 ring-2 ring-white/40"
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </MenuDockEditContext.Provider>
  )
}
