"use client"

import {
  defaultArticlesModalFilters,
  type ArticlesModalFilters,
} from "@/app/[siteId]/[popId]/articles/workspaceUrl"
import {
  RootsDialogBody,
  RootsDialogContent,
  RootsDialogDualActionFooter,
  RootsDialogHeader,
} from "@/components/rootsy-dialog"
import { RootsFormCheckboxField } from "@/components/rootsy-form"
import { Dialog } from "@/components/ui/dialog"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  draft: ArticlesModalFilters
  onDraftChange: (next: ArticlesModalFilters) => void
  onApply: () => void
}

export function ArticlesFiltersDialog({
  open,
  onOpenChange,
  draft,
  onDraftChange,
  onApply,
}: Props) {
  const setDraft = (patch: Partial<ArticlesModalFilters>) => {
    onDraftChange({ ...draft, ...patch })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <RootsDialogContent size="default" className="sm:max-w-md">
        <RootsDialogHeader title="Filtros" />
        <RootsDialogBody>
          <div className="flex flex-col gap-2">
            <RootsFormCheckboxField
              label="Activos"
              checked={draft.soloActivos}
              onCheckedChange={(checked) =>
                setDraft({
                  soloActivos: checked,
                  soloInactivos: checked ? false : draft.soloInactivos,
                })
              }
            />
            <RootsFormCheckboxField
              label="Inactivos"
              checked={draft.soloInactivos}
              onCheckedChange={(checked) =>
                setDraft({
                  soloInactivos: checked,
                  soloActivos: checked ? false : draft.soloActivos,
                })
              }
            />
            <RootsFormCheckboxField
              label="Con descuento"
              checked={draft.conDescuento}
              onCheckedChange={(checked) =>
                setDraft({
                  conDescuento: checked,
                  sinDescuento: checked ? false : draft.sinDescuento,
                })
              }
            />
            <RootsFormCheckboxField
              label="Sin descuento"
              checked={draft.sinDescuento}
              onCheckedChange={(checked) =>
                setDraft({
                  sinDescuento: checked,
                  conDescuento: checked ? false : draft.conDescuento,
                })
              }
            />
            <RootsFormCheckboxField
              label="Con stock"
              checked={draft.conStock}
              onCheckedChange={(checked) =>
                setDraft({
                  conStock: checked,
                  sinStock: checked ? false : draft.sinStock,
                })
              }
            />
            <RootsFormCheckboxField
              label="Sin stock (0)"
              checked={draft.sinStock}
              onCheckedChange={(checked) =>
                setDraft({
                  sinStock: checked,
                  conStock: checked ? false : draft.conStock,
                })
              }
            />
            <RootsFormCheckboxField
              label="Con stock negativo"
              checked={draft.stockNegativo}
              onCheckedChange={(checked) =>
                setDraft({ stockNegativo: checked })
              }
            />
            <RootsFormCheckboxField
              label="Venta sin stock"
              checked={draft.ventaSinStock}
              onCheckedChange={(checked) =>
                setDraft({ ventaSinStock: checked })
              }
            />
          </div>
        </RootsDialogBody>
        <RootsDialogDualActionFooter
          cancelLabel="Restablecer"
          confirmLabel="Aplicar"
          onCancel={() => onDraftChange(defaultArticlesModalFilters())}
          onConfirm={onApply}
        />
      </RootsDialogContent>
    </Dialog>
  )
}
