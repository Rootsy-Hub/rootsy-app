"use client"

import type {
  ComandaStationOption,
  RecipeCategoryLayoutUpdate,
  RecipeCategoryOption,
} from "@/app/[siteId]/[popId]/recipes/actions"
import { RecipeCategoriesMenuBoard } from "@/app/[siteId]/[popId]/recipes/components/RecipeCategoriesMenuBoard"
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
} from "@/components/rootsy-dialog"
import { RootsFormTextField } from "@/components/rootsy-form"
import { saleOpDialogPrimaryBtn } from "@/components/sale-operation/saleOperationStyles"
import { Dialog } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  banner: string | null
  categories: RecipeCategoryOption[]
  boardKey: number
  canCreate: boolean
  canUpdate: boolean
  canDelete: boolean
  newCategoryName: string
  newCategorySaving: boolean
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
  stations: ComandaStationOption[]
  onStationChange: (categoryId: string, stationId: string | null) => void
}

export function RecipeCategoriesDialog({
  open,
  onOpenChange,
  banner,
  categories,
  boardKey,
  canCreate,
  canUpdate,
  canDelete,
  newCategoryName,
  newCategorySaving,
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
  stations,
  onStationChange,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <RootsDialogContent
        size="wide"
        className="max-h-[min(90vh,720px)] sm:max-w-2xl"
      >
        <RootsDialogHeader
          title="Categorías"
          description="Ordená las categorías, cuáles se muestran en el menú y a qué estación va la comanda."
        />
        <RootsDialogBody>
          {banner ? <RootsDialogErrorBanner>{banner}</RootsDialogErrorBanner> : null}
          {canCreate ? (
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end">
              <RootsFormTextField
                label="Nueva categoría"
                id="recipe-new-category"
                value={newCategoryName}
                onChange={(event) => onNewCategoryNameChange(event.target.value)}
                placeholder="Nombre"
                className="min-w-0 flex-1"
                disabled={newCategorySaving}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault()
                    onCreateCategory()
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
                loading={newCategorySaving}
                loadingLabel="Agregando…"
                onClick={onCreateCategory}
              >
                Agregar
              </RootsProgressButton>
            </div>
          ) : null}
          <RecipeCategoriesMenuBoard
            key={boardKey}
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
            stations={stations}
            onStationChange={onStationChange}
          />
        </RootsDialogBody>
      </RootsDialogContent>
    </Dialog>
  )
}
