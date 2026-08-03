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
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
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

type MenuDockEditContextValue = {
  editing: boolean
  setEditing: (editing: boolean) => void
  dockIdSet: Set<MenuDockItemId>
  dockIds: MenuDockItemId[]
  dockItems: MenuCatalogItem[]
  dragging: boolean
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

function parseInsertIndex(overId: string | number): number | null {
  const raw = String(overId)
  if (!raw.startsWith("dock-insert-")) return null
  const index = Number.parseInt(raw.slice("dock-insert-".length), 10)
  return Number.isFinite(index) ? index : null
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

function menuLinkToDockId(link: MenuItemDef["link"]): MenuDockItemId | null {
  if (link === "section") return null
  return link
}

function resolveDragCatalogItem(
  itemId: MenuDockItemId,
): MenuCatalogItem | undefined {
  return getMenuCatalogItem(itemId)
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
  const [dockIds, setDockIds] = useState<MenuDockItemId[]>(() =>
    resolveMenuDockIds(popId, permissionKeys),
  )

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
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

  const handleDragStart = (event: DragStartEvent) => {
    const meta = parseDragMeta(event.active.id)
    if (!meta) return

    const catalog = resolveDragCatalogItem(meta.itemId)
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
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setDraggingItem(null)
    const { active, over } = event
    if (!over) return

    const dragMeta = parseDragMeta(active.id)
    const insertIndex = parseInsertIndex(over.id)
    if (!dragMeta || insertIndex === null) return

    if (dragMeta.kind === "menu") {
      if (!canAddMore || dockIdSet.has(dragMeta.itemId)) return
      if (!canUseMenuDockItem(dragMeta.itemId, permissionKeys)) return
      handleDockIdsChange(insertDockId(dockIds, dragMeta.itemId, insertIndex))
      return
    }

    handleDockIdsChange(moveDockId(dockIds, dragMeta.itemId, insertIndex))
  }

  const contextValue = useMemo<MenuDockEditContextValue>(
    () => ({
      editing,
      setEditing,
      dockIdSet,
      dockIds,
      dockItems,
      dragging: draggingItem != null,
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
      draggingItem,
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
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {children}
        <DragOverlay dropAnimation={{ duration: 180, easing: "ease-out" }}>
          {draggingItem ? (
            <MenuDragOverlayPreview item={draggingItem} />
          ) : null}
        </DragOverlay>
      </DndContext>
    </MenuDockEditContext.Provider>
  )
}

function MenuDragOverlayPreview({ item }: { item: MenuDockDragItem }) {
  const Icon = item.icon
  return (
    <div className="cursor-grabbing drop-shadow-2xl">
      <div className="relative flex size-[72px] items-center justify-center overflow-hidden rounded-[20px] bg-gradient-to-br from-emerald-500/95 to-teal-600/95 shadow-lg ring-2 ring-white/25">
        <div className="absolute inset-px rounded-[19px] border border-white/25" />
        <Icon className="relative size-8 text-white drop-shadow-sm" />
      </div>
    </div>
  )
}

export { menuLinkToDockId }
