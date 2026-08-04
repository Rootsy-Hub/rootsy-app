"use client"

import {
  RootsDialogBody,
  RootsDialogContent,
  RootsDialogDualActionFooter,
  RootsDialogHeader,
} from "@/components/rootsy-dialog"
import { RootsFormCheckboxField } from "@/components/rootsy-form"
import { Dialog } from "@/components/ui/dialog"

export type SuppliersModalFilters = {
  withEmail: boolean
  withTaxId: boolean
  soloActivos: boolean
}

export const defaultSuppliersModalFilters = (): SuppliersModalFilters => ({
  withEmail: false,
  withTaxId: false,
  soloActivos: false,
})

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  draft: SuppliersModalFilters
  onDraftChange: (next: SuppliersModalFilters) => void
  onApply: () => void
}

export function SuppliersFiltersDialog({
  open,
  onOpenChange,
  draft,
  onDraftChange,
  onApply,
}: Props) {
  const setDraft = (patch: Partial<SuppliersModalFilters>) => {
    onDraftChange({ ...draft, ...patch })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <RootsDialogContent size="default" className="sm:max-w-md">
        <RootsDialogHeader
          title="Filtros"
          description="Refiná el listado por datos cargados. Se combinan con la búsqueda."
        />
        <RootsDialogBody>
          <div className="flex flex-col gap-2">
            <RootsFormCheckboxField
              label="Solo proveedores con e-mail"
              checked={draft.withEmail}
              onCheckedChange={(checked) => setDraft({ withEmail: checked })}
            />
            <RootsFormCheckboxField
              label="Solo con CUIT / ID fiscal"
              checked={draft.withTaxId}
              onCheckedChange={(checked) => setDraft({ withTaxId: checked })}
            />
            <RootsFormCheckboxField
              label="Solo proveedores activos"
              checked={draft.soloActivos}
              onCheckedChange={(checked) => setDraft({ soloActivos: checked })}
            />
          </div>
        </RootsDialogBody>
        <RootsDialogDualActionFooter
          cancelLabel="Restablecer"
          confirmLabel="Aplicar"
          onCancel={() => onDraftChange(defaultSuppliersModalFilters())}
          onConfirm={onApply}
        />
      </RootsDialogContent>
    </Dialog>
  )
}
