"use client"

import type {
  RecipeCategoryLayoutUpdate,
  RecipeCategoryOption,
} from "@/app/[siteId]/[popId]/recipes/actions"
import { DataWorkspaceTableIconAction } from "@/components/data-workspace/DataWorkspaceListTablePrimitives"
import { Input } from "@/components/ui/input"
import { recipeFormFieldClass } from "@/app/[siteId]/[popId]/recipes/recipeConstants"
import { cn } from "@/lib/utils"
import { Check, GripVertical, Pencil, Trash2, X } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"

type ColumnId = "visible" | "hidden"

type DragState = {
  id: string
  source: ColumnId
}

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
}

function sortByOrder(a: RecipeCategoryOption, b: RecipeCategoryOption) {
  return a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, "es")
}

function layoutFromCategories(categories: RecipeCategoryOption[]) {
  const visible = categories.filter((c) => c.showInMenu).sort(sortByOrder)
  const hidden = categories.filter((c) => !c.showInMenu).sort(sortByOrder)
  return { visible, hidden }
}

function layoutSignature(categories: RecipeCategoryOption[]): string {
  return categories
    .map((c) => `${c.id}:${c.sortOrder}:${c.showInMenu ? 1 : 0}`)
    .join("|")
}

function signatureFromColumns(
  visible: RecipeCategoryOption[],
  hidden: RecipeCategoryOption[],
): string {
  return layoutSignature([
    ...visible.map((c, i) => ({ ...c, sortOrder: i, showInMenu: true })),
    ...hidden.map((c, i) => ({ ...c, sortOrder: i, showInMenu: false })),
  ])
}

function moveCategory(
  visible: RecipeCategoryOption[],
  hidden: RecipeCategoryOption[],
  drag: DragState,
  target: ColumnId,
  targetIndex: number,
): { visible: RecipeCategoryOption[]; hidden: RecipeCategoryOption[] } {
  let nextVisible = [...visible]
  let nextHidden = [...hidden]
  const sourceList = drag.source === "visible" ? nextVisible : nextHidden
  const fromIndex = sourceList.findIndex((c) => c.id === drag.id)
  if (fromIndex < 0) {
    return { visible: nextVisible, hidden: nextHidden }
  }

  const [moved] = sourceList.splice(fromIndex, 1)
  if (drag.source === "visible") nextVisible = sourceList
  else nextHidden = sourceList

  const destList = target === "visible" ? [...nextVisible] : [...nextHidden]
  let insertAt = Math.max(0, Math.min(targetIndex, destList.length))
  if (drag.source === target && fromIndex < targetIndex) insertAt -= 1
  destList.splice(insertAt, 0, moved)

  if (target === "visible") nextVisible = destList
  else nextHidden = destList

  return { visible: nextVisible, hidden: nextHidden }
}

function columnsWithOrder(
  visible: RecipeCategoryOption[],
  hidden: RecipeCategoryOption[],
) {
  return {
    visible: visible.map((c, i) => ({ ...c, sortOrder: i, showInMenu: true })),
    hidden: hidden.map((c, i) => ({ ...c, sortOrder: i, showInMenu: false })),
  }
}

function updatesFromColumns(
  visible: RecipeCategoryOption[],
  hidden: RecipeCategoryOption[],
): RecipeCategoryLayoutUpdate[] {
  const ordered = columnsWithOrder(visible, hidden)
  return [...ordered.visible, ...ordered.hidden].map((c) => ({
    id: c.id,
    sortOrder: c.sortOrder,
    showInMenu: c.showInMenu,
  }))
}

function CategoryColumn({
  title,
  description,
  columnId,
  items,
  canUpdate,
  canDelete,
  editingCategoryId,
  editingCategoryName,
  categorySaveBusy,
  dragOverIndex,
  onStartEdit,
  onCancelEdit,
  onEditingNameChange,
  onSaveEdit,
  onDelete,
  onDragStart,
  onDragOverIndex,
  onDropAt,
  onDragEnd,
}: {
  title: string
  description: string
  columnId: ColumnId
  items: RecipeCategoryOption[]
  canUpdate: boolean
  canDelete: boolean
  editingCategoryId: string | null
  editingCategoryName: string
  categorySaveBusy: boolean
  dragOverIndex: number | null
  onStartEdit: (category: RecipeCategoryOption) => void
  onCancelEdit: () => void
  onEditingNameChange: (name: string) => void
  onSaveEdit: () => void
  onDelete: (id: string, name: string) => void
  onDragStart: (id: string, source: ColumnId) => void
  onDragOverIndex: (index: number) => void
  onDropAt: (target: ColumnId, targetIndex: number) => void
  onDragEnd: () => void
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
      <ul className="space-y-1.5">
        {items.map((category, index) => {
          const isEditing = editingCategoryId === category.id
          return (
            <li
              key={category.id}
              draggable={canUpdate && !isEditing}
              onDragStart={() => onDragStart(category.id, columnId)}
              onDragOver={(e) => {
                e.preventDefault()
                onDragOverIndex(index)
              }}
              onDrop={(e) => {
                e.preventDefault()
                onDropAt(columnId, index)
              }}
              onDragEnd={onDragEnd}
              className={cn(
                "flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2 py-2",
                dragOverIndex === index && canUpdate && "ring-2 ring-emerald-400/50",
              )}
            >
              {canUpdate ? (
                <GripVertical
                  className="size-4 shrink-0 cursor-grab text-slate-300"
                  aria-hidden
                />
              ) : null}
              {isEditing ? (
                <>
                  <Input
                    value={editingCategoryName}
                    onChange={(e) => onEditingNameChange(e.target.value)}
                    className={cn("h-8 flex-1", recipeFormFieldClass)}
                    autoFocus
                  />
                  <DataWorkspaceTableIconAction
                    label="Guardar"
                    icon={Check}
                    variant="edit"
                    onClick={onSaveEdit}
                    disabled={categorySaveBusy}
                  />
                  <DataWorkspaceTableIconAction
                    label="Cancelar"
                    icon={X}
                    variant="neutral"
                    onClick={onCancelEdit}
                    disabled={categorySaveBusy}
                  />
                </>
              ) : (
                <>
                  <span className="min-w-0 flex-1 truncate text-sm text-slate-800">
                    {category.name}
                  </span>
                  {canUpdate ? (
                    <DataWorkspaceTableIconAction
                      label={`Editar ${category.name || "categoría"}`}
                      icon={Pencil}
                      variant="edit"
                      onClick={() => onStartEdit(category)}
                    />
                  ) : null}
                  {canDelete ? (
                    <DataWorkspaceTableIconAction
                      label={`Eliminar ${category.name || "categoría"}`}
                      icon={Trash2}
                      variant="destructive"
                      onClick={() => onDelete(category.id, category.name)}
                    />
                  ) : null}
                </>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
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
}: Props) {
  const [visible, setVisible] = useState(() =>
    layoutFromCategories(categories).visible,
  )
  const [hidden, setHidden] = useState(() =>
    layoutFromCategories(categories).hidden,
  )
  const [drag, setDrag] = useState<DragState | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<ColumnId | null>(null)
  const pendingLayoutSigRef = useRef<string | null>(null)

  useEffect(() => {
    if (drag) return
    const incomingSig = layoutSignature(categories)
    const pending = pendingLayoutSigRef.current
    if (pending) {
      if (incomingSig === pending) pendingLayoutSigRef.current = null
      else return
    }
    const next = layoutFromCategories(categories)
    setVisible(next.visible)
    setHidden(next.hidden)
  }, [categories, drag])

  const clearDrag = useCallback(() => {
    setDrag(null)
    setDragOverIndex(null)
    setDragOverColumn(null)
  }, [])

  const handleDropAt = (target: ColumnId, targetIndex: number) => {
    if (!drag || !canUpdate) return
    const moved = moveCategory(visible, hidden, drag, target, targetIndex)
    const ordered = columnsWithOrder(moved.visible, moved.hidden)
    setVisible(ordered.visible)
    setHidden(ordered.hidden)
    pendingLayoutSigRef.current = signatureFromColumns(
      ordered.visible,
      ordered.hidden,
    )
    onLayoutChange(updatesFromColumns(ordered.visible, ordered.hidden))
    clearDrag()
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <CategoryColumn
          title="Visibles en menú"
          description="Aparecen en Mesas y Mostrador, en este orden."
          columnId="visible"
          items={visible}
          canUpdate={canUpdate}
          canDelete={canDelete}
          editingCategoryId={editingCategoryId}
          editingCategoryName={editingCategoryName}
          categorySaveBusy={categorySaveBusy}
          dragOverIndex={dragOverColumn === "visible" ? dragOverIndex : null}
          onStartEdit={onStartEdit}
          onCancelEdit={onCancelEdit}
          onEditingNameChange={onEditingNameChange}
          onSaveEdit={onSaveEdit}
          onDelete={onDelete}
          onDragStart={(id, source) => setDrag({ id, source })}
          onDragOverIndex={(index) => {
            setDragOverColumn("visible")
            setDragOverIndex(index)
          }}
          onDropAt={handleDropAt}
          onDragEnd={clearDrag}
        />
        <CategoryColumn
          title="Ocultas en menú"
          description="No se muestran al armar pedidos."
          columnId="hidden"
          items={hidden}
          canUpdate={canUpdate}
          canDelete={canDelete}
          editingCategoryId={editingCategoryId}
          editingCategoryName={editingCategoryName}
          categorySaveBusy={categorySaveBusy}
          dragOverIndex={dragOverColumn === "hidden" ? dragOverIndex : null}
          onStartEdit={onStartEdit}
          onCancelEdit={onCancelEdit}
          onEditingNameChange={onEditingNameChange}
          onSaveEdit={onSaveEdit}
          onDelete={onDelete}
          onDragStart={(id, source) => setDrag({ id, source })}
          onDragOverIndex={(index) => {
            setDragOverColumn("hidden")
            setDragOverIndex(index)
          }}
          onDropAt={handleDropAt}
          onDragEnd={clearDrag}
        />
      </div>
    </div>
  )
}
