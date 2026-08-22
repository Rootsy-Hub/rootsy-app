"use client"

import { ArticleCategoriesSaleBoard } from "@/app/[siteId]/[popId]/articles/ArticleCategoriesSaleBoard"
import type {
  ArticleCategoryOption,
  CategoryLayoutUpdate,
} from "@/app/[siteId]/[popId]/articles/actions"
import {
  RootsProgressButton,
  rootsButtonClassForVariant,
  rootsButtonVariant,
} from "@/components/rootsy-button"
import {
  RootsDialogBody,
  RootsDialogContent,
  RootsDialogErrorBanner,
  RootsDialogHeader,
  RootsDialogLoadingState,
} from "@/components/rootsy-dialog"
import { RootsFormTextField } from "@/components/rootsy-form"
import { saleOpDialogPrimaryBtn } from "@/components/sale-operation/saleOperationStyles"
import { Dialog } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  banner: string | null
  canCreate: boolean
  canUpdate: boolean
  canDelete: boolean
  loading: boolean
  categories: ArticleCategoryOption[]
  boardKey: number
  newCategoryName: string
  newCategorySaving: boolean
  pendingCreateName: string | null
  pendingDeleteId: string | null
  onNewCategoryNameChange: (value: string) => void
  onSubmitNewCategory: () => void
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

export function ArticleCategoriesDialog({
  open,
  onOpenChange,
  banner,
  canCreate,
  canUpdate,
  canDelete,
  loading,
  categories,
  boardKey,
  newCategoryName,
  newCategorySaving,
  pendingCreateName,
  pendingDeleteId,
  onNewCategoryNameChange,
  onSubmitNewCategory,
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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <RootsDialogContent size="wide">
        <RootsDialogHeader
          title="Categorías"
          description="Ordená las categorías y elegí cuáles se muestran en Vender, Mostrador y Mesas."
        />
        <RootsDialogBody>
          {banner ? <RootsDialogErrorBanner>{banner}</RootsDialogErrorBanner> : null}
          {canCreate ? (
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end">
              <RootsFormTextField
                label="Nueva categoría"
                id="new-cat-name"
                value={newCategoryName}
                onChange={(event) => onNewCategoryNameChange(event.target.value)}
                placeholder="Nombre"
                className="min-w-0 flex-1"
                disabled={newCategorySaving}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault()
                    onSubmitNewCategory()
                  }
                }}
              />
              <RootsProgressButton
                type="button"
                variant={rootsButtonVariant.primary}
                className={cn(
                  saleOpDialogPrimaryBtn,
                  rootsButtonClassForVariant("primary"),
                  "h-11 shrink-0",
                )}
                disabled={newCategorySaving || !newCategoryName.trim()}
                onClick={onSubmitNewCategory}
              >
                Agregar
              </RootsProgressButton>
            </div>
          ) : null}
          {loading && categories.length === 0 ? (
            <RootsDialogLoadingState message="Cargando categorías" />
          ) : (
            <ArticleCategoriesSaleBoard
              key={boardKey}
              embedded
              categories={categories}
              pendingCreateName={pendingCreateName}
              pendingDeleteId={pendingDeleteId}
              canUpdate={canUpdate}
              canDelete={canDelete}
              editingCategoryId={editingCategoryId}
              editingCategoryName={editingCategoryName}
              categorySaveBusy={categorySaveBusy}
              onStartEdit={onStartEdit}
              onCancelEdit={onCancelEdit}
              onEditingNameChange={onEditingNameChange}
              onSaveEdit={onSaveEdit}
              onDelete={onDelete}
              onLayoutChange={onLayoutChange}
            />
          )}
        </RootsDialogBody>
      </RootsDialogContent>
    </Dialog>
  )
}
