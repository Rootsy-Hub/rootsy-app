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
  RootsDialogLoadingState,
} from "@/components/rootsy-dialog"
import {
  RootsFormSelectField,
  RootsFormSelectItem,
  RootsFormTextField,
} from "@/components/rootsy-form"
import { saleOpDialogPrimaryBtn } from "@/components/sale-operation/saleOperationStyles"
import { Dialog } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  banner: string | null
  loading?: boolean
  categories: RecipeCategoryOption[]
  boardKey: number
  canCreate: boolean
  canUpdate: boolean
  canDelete: boolean
  newCategoryName: string
  newCategoryStationId: string | null
  newCategorySaving: boolean
  onNewCategoryNameChange: (value: string) => void
  onNewCategoryStationChange: (stationId: string | null) => void
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
  editingStationId: string | null
  onEditingStationChange: (stationId: string | null) => void
}

export function RecipeCategoriesDialog({
  open,
  onOpenChange,
  banner,
  loading = false,
  categories,
  boardKey,
  canCreate,
  canUpdate,
  canDelete,
  newCategoryName,
  newCategoryStationId,
  newCategorySaving,
  onNewCategoryNameChange,
  onNewCategoryStationChange,
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
  editingStationId,
  onEditingStationChange,
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
            <div className="mb-4 grid grid-cols-1 items-end gap-3 sm:grid-cols-[minmax(0,1fr)_11rem_auto]">
              <RootsFormTextField
                label="Nueva categoría"
                id="recipe-new-category"
                value={newCategoryName}
                onChange={(event) => onNewCategoryNameChange(event.target.value)}
                placeholder="Nombre"
                className="min-w-0"
                disabled={newCategorySaving}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault()
                    onCreateCategory()
                  }
                }}
              />
              <RootsFormSelectField
                label="Comanda"
                id="recipe-new-category-station"
                value={newCategoryStationId ?? "__none__"}
                onValueChange={(value) =>
                  onNewCategoryStationChange(value === "__none__" ? null : value)
                }
                className="min-w-0"
                disabled={newCategorySaving}
              >
                <RootsFormSelectItem value="__none__">Sin comanda</RootsFormSelectItem>
                {stations.map((station) => (
                  <RootsFormSelectItem key={station.id} value={station.id}>
                    {station.name || "—"}
                  </RootsFormSelectItem>
                ))}
              </RootsFormSelectField>
              <RootsProgressButton
                type="button"
                variant={rootsButtonVariant.primary}
                className={cn(
                  saleOpDialogPrimaryBtn,
                  rootsButtonClassForVariant("primary"),
                  "h-11 w-full shrink-0 sm:w-auto",
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
          {loading && categories.length === 0 ? (
            <RootsDialogLoadingState message="Cargando categorías" />
          ) : (
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
            editingStationId={editingStationId}
            onEditingStationChange={onEditingStationChange}
          />
          )}
        </RootsDialogBody>
      </RootsDialogContent>
    </Dialog>
  )
}
