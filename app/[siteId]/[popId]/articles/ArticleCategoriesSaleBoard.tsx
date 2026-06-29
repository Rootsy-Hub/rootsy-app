"use client"

import type {
  ArticleCategoryOption,
  CategoryLayoutUpdate,
} from "@/app/[siteId]/[popId]/articles/actions"
import { DataWorkspaceTableIconAction } from "@/components/data-workspace/DataWorkspaceListTablePrimitives"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Check, GripVertical, Pencil, Trash2, X } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"

type ColumnId = "visible" | "hidden"

type DragState = {
  id: string
  source: ColumnId
}

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

function layoutFromCategories(categories: ArticleCategoryOption[]) {
  const visible = categories.filter((c) => c.showInSale).sort(sortByOrder)
  const hidden = categories.filter((c) => !c.showInSale).sort(sortByOrder)
  return { visible, hidden }
}

function layoutSignature(categories: ArticleCategoryOption[]): string {
  return categories
    .map((c) => `${c.id}:${c.sortOrder}:${c.showInSale ? 1 : 0}`)
    .join("|")
}

function signatureFromColumns(
  visible: ArticleCategoryOption[],
  hidden: ArticleCategoryOption[],
): string {
  return layoutSignature([
    ...visible.map((c, i) => ({ ...c, sortOrder: i, showInSale: true })),
    ...hidden.map((c, i) => ({ ...c, sortOrder: i, showInSale: false })),
  ])
}

function moveCategory(
  visible: ArticleCategoryOption[],
  hidden: ArticleCategoryOption[],
  drag: DragState,
  target: ColumnId,
  targetIndex: number,
): { visible: ArticleCategoryOption[]; hidden: ArticleCategoryOption[] } {
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
  let insertIndex = targetIndex
  if (drag.source === target && fromIndex < targetIndex) {
    insertIndex -= 1
  }
  insertIndex = Math.max(0, Math.min(insertIndex, destList.length))
  destList.splice(insertIndex, 0, {
    ...moved,
    showInSale: target === "visible",
  })

  if (target === "visible") nextVisible = destList
  else nextHidden = destList

  return { visible: nextVisible, hidden: nextHidden }
}

function updatesFromColumns(
  visible: ArticleCategoryOption[],
  hidden: ArticleCategoryOption[],
): CategoryLayoutUpdate[] {
  return [
    ...visible.map((c, i) => ({ id: c.id, sortOrder: i, showInSale: true })),
    ...hidden.map((c, i) => ({ id: c.id, sortOrder: i, showInSale: false })),
  ]
}

function columnsWithOrder(
  visible: ArticleCategoryOption[],
  hidden: ArticleCategoryOption[],
) {
  return {
    visible: visible.map((c, i) => ({ ...c, sortOrder: i, showInSale: true })),
    hidden: hidden.map((c, i) => ({ ...c, sortOrder: i, showInSale: false })),
  }
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
  items: ArticleCategoryOption[]
  canUpdate: boolean
  canDelete: boolean
  editingCategoryId: string | null
  editingCategoryName: string
  categorySaveBusy: boolean
  dragOverIndex: number | null
  onStartEdit: (category: ArticleCategoryOption) => void
  onCancelEdit: () => void
  onEditingNameChange: (name: string) => void
  onSaveEdit: () => void
  onDelete: (id: string, name: string) => void
  onDragStart: (id: string, source: ColumnId) => void
  onDragOverIndex: (index: number | null) => void
  onDropAt: (target: ColumnId, index: number) => void
  onDragEnd: () => void
}) {
  return (
    <div className="flex min-h-[16rem] min-w-0 flex-1 flex-col rounded-xl border border-border bg-muted/10">
      <div className="border-b border-border/70 px-3 py-2.5">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </div>
      <div
        className="min-h-0 flex-1 space-y-1.5 overflow-y-auto p-2"
        onDragOver={(e) => {
          if (!canUpdate) return
          e.preventDefault()
          onDragOverIndex(items.length)
        }}
        onDrop={(e) => {
          if (!canUpdate) return
          e.preventDefault()
          onDropAt(columnId, items.length)
        }}
      >
        {items.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border/80 px-3 py-6 text-center text-xs text-muted-foreground">
            Arrastrá categorías acá
          </p>
        ) : (
          items.map((c, index) => {
            const isEditing = editingCategoryId === c.id
            const showDropBefore =
              dragOverIndex === index && canUpdate
            return (
              <div key={c.id}>
                {showDropBefore ? (
                  <div className="mb-1.5 h-0.5 rounded-full bg-primary/70" aria-hidden />
                ) : null}
                <div
                  draggable={canUpdate && !isEditing}
                  onDragStart={() => onDragStart(c.id, columnId)}
                  onDragEnd={onDragEnd}
                  onDragOver={(e) => {
                    if (!canUpdate) return
                    e.preventDefault()
                    e.stopPropagation()
                    onDragOverIndex(index)
                  }}
                  onDrop={(e) => {
                    if (!canUpdate) return
                    e.preventDefault()
                    e.stopPropagation()
                    onDropAt(columnId, index)
                  }}
                  className={cn(
                    "flex items-center gap-2 rounded-lg border border-border/70 bg-background px-2 py-2 shadow-sm",
                    canUpdate &&
                      !isEditing &&
                      "cursor-grab active:cursor-grabbing",
                  )}
                >
                  {canUpdate ? (
                    <GripVertical
                      className="size-4 shrink-0 text-muted-foreground/70"
                      aria-hidden
                    />
                  ) : null}
                  <div className="min-w-0 flex-1">
                    {isEditing ? (
                      <Input
                        value={editingCategoryName}
                        onChange={(e) => onEditingNameChange(e.target.value)}
                        className="h-8 bg-background"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            onSaveEdit()
                          }
                          if (e.key === "Escape") {
                            e.preventDefault()
                            onCancelEdit()
                          }
                        }}
                      />
                    ) : (
                      <p className="truncate text-sm font-medium text-foreground">
                        {c.name || "—"}
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
                            label={`Guardar ${c.name || "categoría"}`}
                            icon={Check}
                            variant="edit"
                            disabled={
                              categorySaveBusy || !editingCategoryName.trim()
                            }
                            onClick={onSaveEdit}
                          />
                        </>
                      ) : (
                        <>
                          {canUpdate ? (
                            <DataWorkspaceTableIconAction
                              label={`Editar ${c.name || "categoría"}`}
                              icon={Pencil}
                              onClick={() => onStartEdit(c)}
                            />
                          ) : null}
                          {canDelete ? (
                            <DataWorkspaceTableIconAction
                              label={`Eliminar ${c.name || "categoría"}`}
                              icon={Trash2}
                              variant="destructive"
                              onClick={() => onDelete(c.id, c.name)}
                            />
                          ) : null}
                        </>
                      )}
                    </div>
                  ) : null}
                </div>
              </div>
            )
          })
        )}
      </div>
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
      if (incomingSig === pending) {
        pendingLayoutSigRef.current = null
      } else {
        return
      }
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
          title="Visibles en venta"
          description="Aparecen en el catálogo de ventas, en este orden."
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
          title="Ocultas en venta"
          description="No se muestran en ventas; podés reordenarlas o volver a hacerlas visibles."
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
      {canUpdate ? (
        <p className="text-xs text-muted-foreground">
          Arrastrá para cambiar el orden o mover entre columnas. Los cambios se guardan al soltar.
        </p>
      ) : null}
    </div>
  )
}
