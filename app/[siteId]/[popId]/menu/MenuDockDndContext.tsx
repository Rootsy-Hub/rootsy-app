"use client"

import type { PopAccessModule } from "@/app/home/homeUserDataTypes"
import {
  canUseMenuDockItemFromPopAccess,
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
  readCachedMenuDockIds,
  readInitialMenuDockIds,
  resolveMenuDockIds,
  sanitizeMenuDockIds,
  writeCachedMenuDockIds,
} from "@/lib/menuDockPreference"
import {
  getPopMenuDockPreference,
  savePopMenuDockPreference,
} from "@/app/[siteId]/[popId]/menu/menuDockActions"
import {
  menuHoloGlyphClass,
  menuHoloIconShellForSection,
  menuHoloRealmWorldRimClass,
} from "@/lib/menu/menuHoloStyles"
import {
  menuNatureShellClass,
} from "@/app/[siteId]/[popId]/menu/menuNatureStyles"
import { MenuIconChrome } from "@/app/[siteId]/[popId]/menu/MenuIconChrome"
import type { MenuSectionKey } from "@/lib/menuCatalog"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  pointerWithin,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import { snapCenterToCursor } from "@/lib/dndModifiers"
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

export const DOCK_ICON_SIZE_PX = 48
/** Espacio entre íconos del dock (horizontal). */
export const DOCK_ICON_GAP_PX = 16
export const DOCK_SLOT_SHIFT_PX = DOCK_ICON_SIZE_PX + DOCK_ICON_GAP_PX
export const DOCK_SLOT_INSET_X_PX = DOCK_ICON_GAP_PX / 2
/** Padding del bloque de cristal — compacto, el dock abraza los íconos. */
export const DOCK_SHELL_PADDING_X_PX = 4
export const DOCK_SHELL_PADDING_Y_PX = 2
/** Inset vertical dentro del track (badges arriba + alinear fila de íconos). */
export const DOCK_TRACK_INSET_Y_PX = 4
export const DOCK_TRACK_HEIGHT_PX =
  DOCK_ICON_SIZE_PX + DOCK_TRACK_INSET_Y_PX * 2
export const DOCK_EDIT_DIVIDER_HEIGHT_PX = 32
/** @deprecated Usar DOCK_SHELL_PADDING_X_PX */
export const DOCK_SHELL_PADDING_PX = DOCK_SHELL_PADDING_X_PX

export function getDockEditSlotCount(
  itemCount: number,
  canAddMore: boolean,
  dragging: boolean,
  activeDragKind: DragKind | null,
  dropPreviewIndex: number | null,
): number {
  if (itemCount === 0) {
    return dragging && activeDragKind === "menu" && dropPreviewIndex !== null
      ? 1
      : 0
  }

  if (
    dragging &&
    dropPreviewIndex !== null &&
    (activeDragKind === "dock" ||
      (activeDragKind === "menu" && canAddMore))
  ) {
    return itemCount + 1
  }

  return itemCount
}

const dockCollisionDetection: CollisionDetection = (args) => {
  const collisions = pointerWithin(args)
  if (collisions.length === 0) return collisions

  const insertHits = collisions.filter((entry) =>
    String(entry.id).startsWith("dock-insert-"),
  )
  if (insertHits.length === 0) return collisions

  if (insertHits.length === 1) return insertHits

  const pointer = args.pointerCoordinates
  if (!pointer) return insertHits

  const sorted = [...insertHits].sort((a, b) => {
    const rectA = args.droppableRects.get(a.id)
    const rectB = args.droppableRects.get(b.id)
    if (!rectA || !rectB) return 0
    const centerA = rectA.left + rectA.width / 2
    const centerB = rectB.left + rectB.width / 2
    return (
      Math.abs(pointer.x - centerA) - Math.abs(pointer.x - centerB)
    )
  })

  return [sorted[0]]
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

export function isDockDropZone(overId: string | number | undefined): boolean {
  if (overId == null) return false
  const raw = String(overId)
  return (
    raw.startsWith("dock-insert-") ||
    raw === DOCK_BAR_DROP_ID ||
    raw.startsWith("dock:")
  )
}

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

function getSectionKeyFromDragItem(
  item: MenuDockDragItem | null,
): MenuSectionKey {
  if (!item) return "operar"
  if ("sectionKey" in item && item.sectionKey) return item.sectionKey
  const id = getDragItemId(item)
  return id ? (getMenuCatalogItem(id)?.sectionKey ?? "operar") : "operar"
}

function MenuDockDragPreview({
  item,
  sectionKey,
  kind,
}: {
  item: MenuDockDragItem
  sectionKey: MenuSectionKey
  kind: DragKind
}) {
  const fromMenu = kind === "menu"
  return (
    <div
      className={cn(
        "dark",
        menuNatureShellClass,
        "pointer-events-none cursor-grabbing",
        fromMenu ? "scale-[1.1]" : "scale-100",
        "drop-shadow-[0_6px_14px_rgba(0,0,0,0.16)]",
      )}
    >
      <DockIconVisual
        icon={item.icon}
        sectionKey={sectionKey}
        variant="overlay"
        size={fromMenu ? "md" : "lg"}
      />
    </div>
  )
}

export function DockIconVisual({
  icon: Icon,
  sectionKey = "operar",
  variant = "dock",
  className,
  size = "md",
}: {
  icon: LucideIcon
  sectionKey?: MenuSectionKey
  variant?: "default" | "dock" | "muted" | "overlay"
  className?: string
  size?: "md" | "sm" | "lg"
}) {
  const dim =
    size === "sm" ? "size-10" : size === "lg" ? "size-[72px]" : "size-12"
  const iconDim =
    size === "sm" ? "size-5" : size === "lg" ? "size-8" : "size-6"
  const radius = size === "lg" ? "rounded-[20px]" : "rounded-[22%]"
  return (
    <div className="relative flex items-center justify-center">
      <div
        className={cn(
          "relative flex items-center justify-center",
          menuHoloIconShellForSection(sectionKey, variant),
          variant !== "muted" &&
            menuHoloRealmWorldRimClass(sectionKey, variant === "dock"),
          dim,
          radius,
          className,
        )}
      >
        {variant !== "muted" ? (
          <MenuIconChrome sectionKey={sectionKey} />
        ) : null}
        <Icon className={cn(menuHoloGlyphClass, iconDim)} />
      </div>
    </div>
  )
}

type ProviderProps = {
  popId: string
  enabledModules: readonly PopAccessModule[]
  children: ReactNode
}

export function MenuDockDndProvider({
  popId,
  enabledModules,
  children,
}: ProviderProps) {
  const [editing, setEditing] = useState(false)
  const [draggingItem, setDraggingItem] = useState<MenuDockDragItem | null>(null)
  const [activeDragKind, setActiveDragKind] = useState<DragKind | null>(null)
  const [dropPreviewIndex, setDropPreviewIndex] = useState<number | null>(null)
  const [dockIds, setDockIds] = useState<MenuDockItemId[]>(() =>
    readInitialMenuDockIds(popId),
  )

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 4 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 120, tolerance: 6 },
    }),
  )

  useEffect(() => {
    if (enabledModules.length === 0) return
    setDockIds((current) => resolveMenuDockIds(popId, enabledModules, current))
  }, [popId, enabledModules])

  useEffect(() => {
    if (enabledModules.length === 0) return

    let cancelled = false

    async function loadDockPreference() {
      try {
        const fromDb = await getPopMenuDockPreference(popId)
        if (cancelled) return

        if (fromDb?.length) {
          const resolved = resolveMenuDockIds(popId, enabledModules, fromDb)
          setDockIds(resolved)
          writeCachedMenuDockIds(popId, resolved)
          return
        }

        const cached = readCachedMenuDockIds(popId)
        if (cached?.length) {
          const migrated = resolveMenuDockIds(popId, enabledModules, cached)
          setDockIds(migrated)
          void savePopMenuDockPreference(popId, migrated)
          return
        }

        setDockIds(resolveMenuDockIds(popId, enabledModules))
      } catch {
        if (!cancelled) {
          setDockIds(resolveMenuDockIds(popId, enabledModules))
        }
      }
    }

    void loadDockPreference()

    return () => {
      cancelled = true
    }
  }, [popId, enabledModules])

  useEffect(() => {
    if (!editing) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setEditing(false)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [editing])

  useEffect(() => {
    if (editing) return
    setDraggingItem(null)
    setActiveDragKind(null)
    setDropPreviewIndex(null)
  }, [editing])

  const dockItems = useMemo(
    () => listResolvedMenuDockItems(popId, enabledModules, dockIds),
    [popId, enabledModules, dockIds],
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
      if (!canUseMenuDockItemFromPopAccess(draggingItemId, enabledModules)) return dockIds
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
    enabledModules,
  ])

  const handleDockIdsChange = useCallback(
    (next: MenuDockItemId[]) => {
      const persisted = persistMenuDockIds(popId, next, enabledModules)
      setDockIds(persisted)
      void savePopMenuDockPreference(popId, persisted)
    },
    [popId, enabledModules],
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
      return canUseMenuDockItemFromPopAccess(id, enabledModules)
    },
    [editing, dockIdSet, canAddMore, enabledModules],
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
          !canUseMenuDockItemFromPopAccess(dragMeta.itemId, enabledModules)
        ) {
          setDropPreviewIndex((prev) => (prev === null ? prev : null))
          return
        }
      }

      setDropPreviewIndex((prev) => (prev === insertIndex ? prev : insertIndex))
    },
    [dockIds, canAddMore, dockIdSet, enabledModules],
  )

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      const dragMeta = parseDragMeta(active.id)
      const previewIndex = dropPreviewIndex
      const canDrop =
        over != null &&
        isDockDropZone(over.id) &&
        previewIndex !== null &&
        dragMeta != null
      const insertIndex = canDrop
        ? resolveDockInsertIndex(over.id, dockIds)
        : null

      clearDragState()

      if (!canDrop || insertIndex === null || !dragMeta) return

      if (dragMeta.kind === "menu") {
        if (!canAddMore || dockIdSet.has(dragMeta.itemId)) return
        if (!canUseMenuDockItemFromPopAccess(dragMeta.itemId, enabledModules)) return
        handleDockIdsChange(insertDockId(dockIds, dragMeta.itemId, insertIndex))
        return
      }

      handleDockIdsChange(moveDockId(dockIds, dragMeta.itemId, insertIndex))
    },
    [
      dockIds,
      dropPreviewIndex,
      canAddMore,
      dockIdSet,
      enabledModules,
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

  const draggingSectionKey = getSectionKeyFromDragItem(draggingItem)

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
        <DragOverlay
          dropAnimation={null}
          zIndex={50}
          modifiers={[snapCenterToCursor]}
        >
          {showMenuDragOverlay && draggingItem ? (
            <MenuDockDragPreview
              item={draggingItem}
              sectionKey={draggingSectionKey}
              kind="menu"
            />
          ) : showDockDragOverlay && draggingItem ? (
            <MenuDockDragPreview
              item={draggingItem}
              sectionKey={draggingSectionKey}
              kind="dock"
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </MenuDockEditContext.Provider>
  )
}
