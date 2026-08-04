"use client"

import {
  INVOICE_REGIMEN_LABEL,
  INVOICE_REGIMEN_VALUES,
  type InvoiceRegimenValue,
} from "@/app/[siteId]/[popId]/invoices/invoiceConstants"
import {
  defaultInvoicesFilters,
  type InvoicesAppliedFilters,
} from "@/app/[siteId]/[popId]/invoices/invoiceFormState"
import {
  RootsDialogBody,
  RootsDialogContent,
  RootsDialogDualActionFooter,
  RootsDialogHeader,
} from "@/components/rootsy-dialog"
import {
  RootsFormSelectField,
  RootsFormSelectItem,
} from "@/components/rootsy-form"
import { Dialog } from "@/components/ui/dialog"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  draft: InvoicesAppliedFilters
  onDraftChange: (next: InvoicesAppliedFilters) => void
  onApply: () => void
}

export function InvoicesFiltersDialog({
  open,
  onOpenChange,
  draft,
  onDraftChange,
  onApply,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <RootsDialogContent size="default" className="sm:max-w-md">
        <RootsDialogHeader
          title="Filtros"
          description="Combinan con la búsqueda y el estado del toolbar. El listado se pagina en el servidor."
        />
        <RootsDialogBody>
          <RootsFormSelectField
            label="Régimen"
            id="invoices-filter-regimen"
            value={draft.regimen.trim() || "__all__"}
            onValueChange={(value) =>
              onDraftChange({
                ...draft,
                regimen:
                  value === "__all__" ? "" : (value as InvoiceRegimenValue),
              })
            }
            placeholder="Todos"
          >
            <RootsFormSelectItem value="__all__">Todos</RootsFormSelectItem>
            {INVOICE_REGIMEN_VALUES.map((regimen) => (
              <RootsFormSelectItem key={regimen} value={regimen}>
                {INVOICE_REGIMEN_LABEL[regimen]}
              </RootsFormSelectItem>
            ))}
          </RootsFormSelectField>
        </RootsDialogBody>
        <RootsDialogDualActionFooter
          cancelLabel="Restablecer"
          confirmLabel="Aplicar"
          onCancel={() => onDraftChange(defaultInvoicesFilters())}
          onConfirm={onApply}
        />
      </RootsDialogContent>
    </Dialog>
  )
}
