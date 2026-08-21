"use client"

import type {
  ComandaStationOption,
  RecipeCategoryLayoutUpdate,
  RecipeCategoryOption,
} from "@/app/[siteId]/[popId]/recipes/actions"
import { RecipeCategoryStationSelect } from "@/app/[siteId]/[popId]/recipes/components/RecipeCategoryStationSelect"
import {
  RootsSortableActionList,
  rootsSortableListFooterHintClass,
  type RootsSortableActionListItem,
} from "@/components/rootsy-list"
import { useCallback, useEffect, useRef, useState } from "react"

type Props = {
  categories: RecipeCategoryOption[]
  canUpdate: boolean
  canDelete: boolean
  editingCategoryId: string | null
  editingCategoryName: string
  categorySaveBusy: boolean
  onStartEdit: (category: RecipeCategoryOption) => void
  onCancelEdit: () => void
  onEditingNameChange: (name: string) => void
  onSaveEdit: () => void
  onDelete: (id: string, name: string) => void
  onLayoutChange: (updates: RecipeCategoryLayoutUpdate[]) => void
  stations: ComandaStationOption[]
  editingStationId: string | null
  onEditingStationChange: (stationId: string | null) => void
}

function sortByOrder(a: RecipeCategoryOption, b: RecipeCategoryOption) {
  return a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, "es")
}

function layoutSignature(categories: RecipeCategoryOption[]): string {
  return categories
    .map((c) => `${c.id}:${c.sortOrder}:${c.showInMenu ? 1 : 0}`)
    .join("|")
}

function categoryIdSetKey(categories: RecipeCategoryOption[]): string {
  return categories
    .map((c) => c.id)
    .sort()
    .join("|")
}

function idsFromLayoutSignature(sig: string): string {
  return sig
    .split("|")
    .map((part) => part.split(":")[0] ?? "")
    .filter(Boolean)
    .sort()
    .join("|")
}

function updatesFromItems(
  items: RecipeCategoryOption[],
): RecipeCategoryLayoutUpdate[] {
  return items.map((c, index) => ({
    id: c.id,
    sortOrder: index,
    showInMenu: c.showInMenu,
  }))
}

function toListItems(
  categories: RecipeCategoryOption[],
): RootsSortableActionListItem[] {
  return categories.map((category) => ({
    id: category.id,
    label: category.name,
    visible: category.showInMenu,
  }))
}

function mergeListOrder(
  categories: RecipeCategoryOption[],
  orderedIds: string[],
): RecipeCategoryOption[] {
  const byId = new Map(categories.map((category) => [category.id, category]))
  return orderedIds
    .map((id) => byId.get(id))
    .filter((category): category is RecipeCategoryOption => category != null)
    .map((category, sortOrder) => ({ ...category, sortOrder }))
}

export function RecipeCategoriesMenuBoard({
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
  stations,
  editingStationId,
  onEditingStationChange,
}: Props) {
  const [items, setItems] = useState(() => [...categories].sort(sortByOrder))
  const pendingLayoutSigRef = useRef<string | null>(null)

  useEffect(() => {
    const incomingSig = layoutSignature(categories)
    const pending = pendingLayoutSigRef.current
    const incomingIds = categoryIdSetKey(categories)

    if (pending) {
      if (incomingSig === pending) {
        pendingLayoutSigRef.current = null
      } else if (idsFromLayoutSignature(pending) === incomingIds) {
        return
      } else {
        pendingLayoutSigRef.current = null
      }
    }
    setItems([...categories].sort(sortByOrder))
  }, [categories])

  const persistLayout = useCallback(
    (nextItems: RecipeCategoryOption[]) => {
      pendingLayoutSigRef.current = layoutSignature(nextItems)
      onLayoutChange(updatesFromItems(nextItems))
    },
    [onLayoutChange],
  )

  const handleReorder = useCallback(
    (ordered: RootsSortableActionListItem[]) => {
      const nextItems = mergeListOrder(
        items,
        ordered.map((item) => item.id),
      )
      setItems(nextItems)
      persistLayout(nextItems)
    },
    [items, persistLayout],
  )

  const toggleVisibility = useCallback(
    (id: string) => {
      if (!canUpdate) return
      const nextItems = items.map((item) =>
        item.id === id ? { ...item, showInMenu: !item.showInMenu } : item,
      )
      setItems(nextItems)
      persistLayout(nextItems)
    },
    [canUpdate, items, persistLayout],
  )

  const categoryById = useCallback(
    (id: string) => items.find((item) => item.id === id) ?? null,
    [items],
  )

  const editingCategory = editingCategoryId
    ? categoryById(editingCategoryId)
    : null
  const editHasChanges =
    editingCategory != null &&
    (editingCategoryName.trim() !== editingCategory.name.trim() ||
      editingStationId !== editingCategory.stationId)

  return (
    <div className="space-y-3">
      <RootsSortableActionList
        listId="recipe-categories"
        rowSize="comfortable"
        items={toListItems(items)}
        onReorder={handleReorder}
        emptyMessage="Todavía no hay categorías."
        canReorder={canUpdate}
        canToggleVisibility={canUpdate}
        canEdit={canUpdate}
        canDelete={canDelete}
        editingId={editingCategoryId}
        editingValue={editingCategoryName}
        editSaveBusy={categorySaveBusy}
        editHasChanges={editHasChanges}
        onStartEdit={(item) => {
          const category = categoryById(item.id)
          if (category) onStartEdit(category)
        }}
        onCancelEdit={onCancelEdit}
        onEditingValueChange={onEditingNameChange}
        onSaveEdit={onSaveEdit}
        onDelete={(item) => onDelete(item.id, item.label)}
        onToggleVisibility={toggleVisibility}
        renderAccessory={(item) => {
          const category = categoryById(item.id)
          if (!category) return null
          if (editingCategoryId === category.id) {
            return (
              <RecipeCategoryStationSelect
                id={`recipe-category-station-${category.id}`}
                label={`Comanda de ${category.name || "categoría"}`}
                value={editingStationId}
                stations={stations}
                disabled={!canUpdate || categorySaveBusy}
                onChange={onEditingStationChange}
              />
            )
          }
          return (
            <span className="flex w-40 shrink-0 items-center truncate text-sm text-[var(--rootsy-bruma-500)]">
              {category.stationName || "Sin comanda"}
            </span>
          )
        }}
      />
      {canUpdate ? (
        <p className={rootsSortableListFooterHintClass}>
          Los cambios de orden y visibilidad se guardan al soltar o al tocar el
          ojo.
        </p>
      ) : null}
    </div>
  )
}
