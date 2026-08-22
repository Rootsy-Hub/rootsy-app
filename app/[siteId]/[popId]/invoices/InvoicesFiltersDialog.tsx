"use client"

import {
  INVOICE_STATUS_LABEL,
  INVOICE_STATUS_VALUES,
  type InvoiceStatusValue,
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
          description="Filtrá por el estado del comprobante. Combinan con el período y la búsqueda."
        />
        <RootsDialogBody>
          <RootsFormSelectField
            label="Estado"
            id="invoices-filter-status"
            value={draft.status.trim() || "__all__"}
            onValueChange={(value) =>
              onDraftChange({
                ...draft,
                status:
                  value === "__all__" ? "" : (value as InvoiceStatusValue),
              })
            }
            placeholder="Todos"
          >
            <RootsFormSelectItem value="__all__">Todos</RootsFormSelectItem>
            {INVOICE_STATUS_VALUES.map((status) => (
              <RootsFormSelectItem key={status} value={status}>
                {INVOICE_STATUS_LABEL[status]}
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
