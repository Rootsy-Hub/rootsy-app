"use client"

import type {
  ArticleCategoryOption,
  CategoryLayoutUpdate,
} from "@/app/[siteId]/[popId]/articles/actions"
import {
  RootsSortableActionList,
  RootsSortableActionListPanel,
  rootsSortableListFooterHintClass,
  rootsSortableListRowClass,
  rootsSortableListRowLabelClass,
  type RootsSortableActionListItem,
} from "@/components/rootsy-list"
import { RootsSpinner } from "@/components/rootsy-spinner"
import { cn } from "@/lib/utils"
import { useCallback, useEffect, useRef, useState } from "react"

type Props = {
  categories: ArticleCategoryOption[]
  /** Sin panel propio — para usar dentro de un modal con header ya definido. */
  embedded?: boolean
  pendingCreateName?: string | null
  pendingDeleteId?: string | null
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

function categoryIdSetKey(categories: ArticleCategoryOption[]): string {
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

function updatesFromItems(items: ArticleCategoryOption[]): CategoryLayoutUpdate[] {
  return items.map((c, index) => ({
    id: c.id,
    sortOrder: index,
    showInSale: c.showInSale,
  }))
}

function toListItems(categories: ArticleCategoryOption[]): RootsSortableActionListItem[] {
  return categories.map((category) => ({
    id: category.id,
    label: category.name,
    visible: category.showInSale,
  }))
}

function mergeListOrder(
  categories: ArticleCategoryOption[],
  orderedIds: string[],
): ArticleCategoryOption[] {
  const byId = new Map(categories.map((category) => [category.id, category]))
  return orderedIds
    .map((id) => byId.get(id))
    .filter((category): category is ArticleCategoryOption => category != null)
    .map((category, sortOrder) => ({ ...category, sortOrder }))
}

export function ArticleCategoriesSaleBoard({
  categories,
  embedded = false,
  pendingCreateName = null,
  pendingDeleteId = null,
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
  const pendingLayoutSigRef = useRef<string | null>(null)

  useEffect(() => {
    const incomingSig = layoutSignature(categories)
    const pending = pendingLayoutSigRef.current
    const incomingIds = categoryIdSetKey(categories)

    if (pending) {
      if (incomingSig === pending) {
        pendingLayoutSigRef.current = null
      } else if (idsFromLayoutSignature(pending) === incomingIds) {
        // Mismo conjunto de categorías: optimismo de orden/visibilidad en curso.
        return
      } else {
        pendingLayoutSigRef.current = null
      }
    }
    setItems([...categories].sort(sortByOrder))
  }, [categories])

  const persistLayout = useCallback(
    (nextItems: ArticleCategoryOption[]) => {
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
        item.id === id ? { ...item, showInSale: !item.showInSale } : item,
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

  const pendingRow = pendingCreateName ? (
    <div
      className={cn(
        rootsSortableListRowClass,
        "pointer-events-none h-14 opacity-50",
      )}
      aria-busy="true"
      aria-disabled="true"
    >
      <p className={cn(rootsSortableListRowLabelClass, "min-w-0 flex-1")}>
        {pendingCreateName}
      </p>
      <RootsSpinner
        size="sm"
        className="shrink-0"
        label={`Creando ${pendingCreateName}`}
      />
    </div>
  ) : null

  const list =
    items.length === 0 && pendingCreateName ? null : (
      <RootsSortableActionList
        listId="article-categories"
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
        busyId={pendingDeleteId}
        onStartEdit={(item) => {
          const category = categoryById(item.id)
          if (category) onStartEdit(category)
        }}
        onCancelEdit={onCancelEdit}
        onEditingValueChange={onEditingNameChange}
        onSaveEdit={onSaveEdit}
        onDelete={(item) => onDelete(item.id, item.label)}
        onToggleVisibility={toggleVisibility}
      />
    )

  if (embedded) {
    return (
      <div className="space-y-3">
        <div className="flex flex-col gap-2">
          {list}
          {pendingRow}
        </div>
        {canUpdate ? (
          <p className={rootsSortableListFooterHintClass}>
            Los cambios de orden y visibilidad se guardan al soltar o al tocar
            el ojo.
          </p>
        ) : null}
      </div>
    )
  }

  return (
    <RootsSortableActionListPanel
      title="Categorías"
      description="Arrastrá para ordenar. Usá el ojo para mostrar u ocultar en ventas."
      footerHint={
        canUpdate
          ? "Los cambios de orden y visibilidad se guardan al soltar o al tocar el ojo."
          : undefined
      }
    >
      <div className="flex flex-col gap-2">
        {list}
        {pendingRow}
      </div>
    </RootsSortableActionListPanel>
  )
}
