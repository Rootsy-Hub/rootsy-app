"use client"

import {
  RootsDialogBody,
  RootsDialogContent,
  RootsDialogDualActionFooter,
  RootsDialogHeader,
} from "@/components/rootsy-dialog"
import { RootsFormCheckboxField } from "@/components/rootsy-form"
import { Dialog } from "@/components/ui/dialog"

export type ClientsModalFilters = {
  withEmail: boolean
  withTaxId: boolean
  soloActivos: boolean
}

export const defaultClientsModalFilters = (): ClientsModalFilters => ({
  withEmail: false,
  withTaxId: false,
  soloActivos: false,
})

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  draft: ClientsModalFilters
  onDraftChange: (next: ClientsModalFilters) => void
  onApply: () => void
}

export function ClientsFiltersDialog({
  open,
  onOpenChange,
  draft,
  onDraftChange,
  onApply,
}: Props) {
  const setDraft = (patch: Partial<ClientsModalFilters>) => {
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
              label="Solo clientes con e-mail"
              checked={draft.withEmail}
              onCheckedChange={(checked) => setDraft({ withEmail: checked })}
            />
            <RootsFormCheckboxField
              label="Solo con CUIT / DNI"
              checked={draft.withTaxId}
              onCheckedChange={(checked) => setDraft({ withTaxId: checked })}
            />
            <RootsFormCheckboxField
              label="Solo clientes activos"
              checked={draft.soloActivos}
              onCheckedChange={(checked) => setDraft({ soloActivos: checked })}
            />
          </div>
        </RootsDialogBody>
        <RootsDialogDualActionFooter
          cancelLabel="Restablecer"
          confirmLabel="Aplicar"
          onCancel={() => onDraftChange(defaultClientsModalFilters())}
          onConfirm={onApply}
        />
      </RootsDialogContent>
    </Dialog>
  )
}
