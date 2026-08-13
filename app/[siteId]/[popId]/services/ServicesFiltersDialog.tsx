"use client"

import type { ServiceCategoryOption } from "@/app/[siteId]/[popId]/services/actions"
import {
  RootsDialogBody,
  RootsDialogContent,
  RootsDialogDualActionFooter,
  RootsDialogHeader,
} from "@/components/rootsy-dialog"
import {
  RootsFormCheckboxField,
  RootsFormSelectField,
  RootsFormSelectItem,
} from "@/components/rootsy-form"
import { Dialog } from "@/components/ui/dialog"

export type ServicesAppliedFilters = {
  soloActivos: boolean
  categoryId: string
}

export const defaultServicesFilters = (): ServicesAppliedFilters => ({
  soloActivos: false,
  categoryId: "",
})

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  draft: ServicesAppliedFilters
  onDraftChange: (next: ServicesAppliedFilters) => void
  categories: ServiceCategoryOption[]
  onApply: () => void
}

export function ServicesFiltersDialog({
  open,
  onOpenChange,
  draft,
  onDraftChange,
  categories,
  onApply,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <RootsDialogContent size="default" className="sm:max-w-md">
        <RootsDialogHeader
          title="Filtros"
          description="Combinan con la búsqueda. El listado se pagina en el servidor."
        />
        <RootsDialogBody>
          <div className="flex flex-col gap-4">
            <RootsFormCheckboxField
              label="Solo servicios activos"
              checked={draft.soloActivos}
              onCheckedChange={(checked) =>
                onDraftChange({ ...draft, soloActivos: checked })
              }
            />
            <RootsFormSelectField
              label="Categoría"
              id="services-filter-category"
              value={draft.categoryId.trim() || "__all__"}
              onValueChange={(value) =>
                onDraftChange({
                  ...draft,
                  categoryId: value === "__all__" ? "" : value,
                })
              }
              placeholder="Todas"
            >
              <RootsFormSelectItem value="__all__">Todas</RootsFormSelectItem>
              {categories.map((category) => (
                <RootsFormSelectItem key={category.id} value={category.id}>
                  {category.name || "—"}
                </RootsFormSelectItem>
              ))}
            </RootsFormSelectField>
          </div>
        </RootsDialogBody>
        <RootsDialogDualActionFooter
          cancelLabel="Restablecer"
          confirmLabel="Aplicar"
          onCancel={() => onDraftChange(defaultServicesFilters())}
          onConfirm={onApply}
        />
      </RootsDialogContent>
    </Dialog>
  )
}
