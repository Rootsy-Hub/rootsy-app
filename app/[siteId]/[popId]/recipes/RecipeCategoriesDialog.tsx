"use client"

import type {
  RecipeCategoryLayoutUpdate,
  RecipeCategoryOption,
} from "@/app/[siteId]/[popId]/recipes/actions"
import { RecipeCategoriesMenuBoard } from "@/app/[siteId]/[popId]/recipes/components/RecipeCategoriesMenuBoard"
import {
  RootsDialogBody,
  RootsDialogContent,
  RootsDialogHeader,
  RootsDialogSingleActionFooter,
} from "@/components/rootsy-dialog"
import { RootsFormTextField } from "@/components/rootsy-form"
import { RootsPrimaryButton } from "@/components/rootsy-button"
import { Dialog } from "@/components/ui/dialog"
import { useEffect, useRef, useState } from "react"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  categories: RecipeCategoryOption[]
  canCreate: boolean
  canUpdate: boolean
  canDelete: boolean
  newCategoryName: string
  onNewCategoryNameChange: (value: string) => void
  onCreateCategory: () => void
  categoryBusy: boolean
  editingCategoryId: string | null
  editingCategoryName: string
  onEditingCategoryNameChange: (value: string) => void
  onStartEdit: (category: RecipeCategoryOption) => void
  onCancelEdit: () => void
  onSaveEdit: () => void
  onDeleteCategory: (id: string, name: string) => void
  onLayoutChange: (updates: RecipeCategoryLayoutUpdate[]) => void | Promise<void>
  onAfterClose?: () => void
}

export function RecipeCategoriesDialog({
  open,
  onOpenChange,
  categories,
  canCreate,
  canUpdate,
  canDelete,
  newCategoryName,
  onNewCategoryNameChange,
  onCreateCategory,
  categoryBusy,
  editingCategoryId,
  editingCategoryName,
  onEditingCategoryNameChange,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDeleteCategory,
  onLayoutChange,
  onAfterClose,
}: Props) {
  const wasOpenRef = useRef(false)
  const [mounted, setMounted] = useState(open)

  useEffect(() => {
    if (open) {
      wasOpenRef.current = true
      setMounted(true)
      return
    }
    if (!wasOpenRef.current) return
    const timer = window.setTimeout(() => {
      wasOpenRef.current = false
      setMounted(false)
      onAfterClose?.()
    }, 220)
    return () => window.clearTimeout(timer)
  }, [open, onAfterClose])

  if (!mounted) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <RootsDialogContent size="wide">
        <RootsDialogHeader
          title="Categorías de recetas"
          description="Organizá el menú de Mesas y Mostrador."
        />
        <RootsDialogBody>
          {canCreate ? (
            <div className="mb-4 flex flex-wrap items-end gap-2">
              <div className="min-w-[12rem] flex-1">
                <RootsFormTextField
                  label="Nueva categoría"
                  id="recipe-new-category"
                  value={newCategoryName}
                  onChange={(e) => onNewCategoryNameChange(e.target.value)}
                  placeholder="Nombre de la categoría"
                  disabled={categoryBusy}
                />
              </div>
              <RootsPrimaryButton
                type="button"
                className="shrink-0"
                disabled={categoryBusy || !newCategoryName.trim()}
                onClick={onCreateCategory}
              >
                Agregar
              </RootsPrimaryButton>
            </div>
          ) : null}
          <RecipeCategoriesMenuBoard
            categories={categories}
            canUpdate={canUpdate}
            canDelete={canDelete}
            editingCategoryId={editingCategoryId}
            editingCategoryName={editingCategoryName}
            categorySaveBusy={categoryBusy}
            onStartEdit={onStartEdit}
            onCancelEdit={onCancelEdit}
            onEditingNameChange={onEditingCategoryNameChange}
            onSaveEdit={onSaveEdit}
            onDelete={onDeleteCategory}
            onLayoutChange={onLayoutChange}
          />
        </RootsDialogBody>
        <RootsDialogSingleActionFooter
          label="Cerrar"
          onAction={() => onOpenChange(false)}
        />
      </RootsDialogContent>
    </Dialog>
  )
}
