"use client"

import {
  defaultOperationsModalFilters,
  OPERATIONS_COUNTER_FULFILLMENT_FILTER_LABELS,
  OPERATIONS_COUNTER_FULFILLMENT_FILTERS,
  OPERATIONS_COUNTER_STATUS_FILTER_LABELS,
  OPERATIONS_COUNTER_STATUS_FILTERS,
  OPERATIONS_EXPENSE_SOURCE_FILTER_LABELS,
  OPERATIONS_EXPENSE_SOURCE_FILTERS,
  OPERATIONS_PURCHASE_KIND_FILTERS,
  OPERATIONS_SALE_STATUS_FILTER_LABELS,
  OPERATIONS_SALE_STATUS_FILTERS,
  OPERATIONS_SERVICE_SCOPE_FILTERS,
  OPERATIONS_SERVICE_STATUS_FILTERS,
  OPERATIONS_TABLE_SESSION_FILTER_LABELS,
  OPERATIONS_TABLE_SESSION_FILTERS,
  type OperationsModalFilters,
} from "@/app/[siteId]/[popId]/operations/operationsFilters"
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
import type { OperationsViewId } from "@/lib/operationsViewPreference"
import { PURCHASE_KIND_LABEL } from "@/lib/purchaseKind"
import {
  SERVICE_CHARGE_BILLING_SCOPE_LABELS,
  SERVICE_CHARGE_STATUS_LABELS,
} from "@/lib/serviceChargeTypes"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  view: OperationsViewId
  draft: OperationsModalFilters
  onDraftChange: (next: OperationsModalFilters) => void
  onApply: () => void
}

function AllSelectField({
  id,
  label,
  value,
  onValueChange,
  options,
}: {
  id: string
  label: string
  value: string
  onValueChange: (value: string) => void
  options: ReadonlyArray<{ value: string; label: string }>
}) {
  return (
    <RootsFormSelectField
      label={label}
      id={id}
      value={value.trim() || "__all__"}
      onValueChange={(next) => onValueChange(next === "__all__" ? "" : next)}
      placeholder="Todos"
    >
      <RootsFormSelectItem value="__all__">Todos</RootsFormSelectItem>
      {options.map((option) => (
        <RootsFormSelectItem key={option.value} value={option.value}>
          {option.label}
        </RootsFormSelectItem>
      ))}
    </RootsFormSelectField>
  )
}

export function OperationsFiltersDialog({
  open,
  onOpenChange,
  view,
  draft,
  onDraftChange,
  onApply,
}: Props) {
  const setDraft = (patch: Partial<OperationsModalFilters>) => {
    onDraftChange({ ...draft, ...patch })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <RootsDialogContent size="default" className="sm:max-w-md">
        <RootsDialogHeader
          title="Filtros"
          description="Refiná el listado. Se combinan con el período y la búsqueda."
        />
        <RootsDialogBody>
          <div className="flex flex-col gap-4">
            {view === "sales" ? (
              <>
                <AllSelectField
                  id="operations-filter-sale-status"
                  label="Estado"
                  value={draft.saleStatus}
                  onValueChange={(saleStatus) =>
                    setDraft({
                      saleStatus:
                        saleStatus as OperationsModalFilters["saleStatus"],
                    })
                  }
                  options={OPERATIONS_SALE_STATUS_FILTERS.map((value) => ({
                    value,
                    label: OPERATIONS_SALE_STATUS_FILTER_LABELS[value],
                  }))}
                />
                <RootsFormCheckboxField
                  label="Solo con descuento"
                  checked={draft.saleWithDiscount}
                  onCheckedChange={(checked) =>
                    setDraft({ saleWithDiscount: checked })
                  }
                />
              </>
            ) : null}

            {view === "tables" ? (
              <AllSelectField
                id="operations-filter-table-session"
                label="Mesa"
                value={draft.tableSession}
                onValueChange={(tableSession) =>
                  setDraft({
                    tableSession:
                      tableSession as OperationsModalFilters["tableSession"],
                  })
                }
                options={OPERATIONS_TABLE_SESSION_FILTERS.map((value) => ({
                  value,
                  label: OPERATIONS_TABLE_SESSION_FILTER_LABELS[value],
                }))}
              />
            ) : null}

            {view === "counter" ? (
              <>
                <AllSelectField
                  id="operations-filter-counter-status"
                  label="Estado"
                  value={draft.counterStatus}
                  onValueChange={(counterStatus) =>
                    setDraft({
                      counterStatus:
                        counterStatus as OperationsModalFilters["counterStatus"],
                    })
                  }
                  options={OPERATIONS_COUNTER_STATUS_FILTERS.map((value) => ({
                    value,
                    label: OPERATIONS_COUNTER_STATUS_FILTER_LABELS[value],
                  }))}
                />
                <AllSelectField
                  id="operations-filter-counter-fulfillment"
                  label="Entrega"
                  value={draft.counterFulfillment}
                  onValueChange={(counterFulfillment) =>
                    setDraft({
                      counterFulfillment:
                        counterFulfillment as OperationsModalFilters["counterFulfillment"],
                    })
                  }
                  options={OPERATIONS_COUNTER_FULFILLMENT_FILTERS.map(
                    (value) => ({
                      value,
                      label:
                        OPERATIONS_COUNTER_FULFILLMENT_FILTER_LABELS[value],
                    }),
                  )}
                />
              </>
            ) : null}

            {view === "purchases" ? (
              <>
                <AllSelectField
                  id="operations-filter-purchase-kind"
                  label="Tipo de compra"
                  value={draft.purchaseKind}
                  onValueChange={(purchaseKind) =>
                    setDraft({
                      purchaseKind:
                        purchaseKind as OperationsModalFilters["purchaseKind"],
                    })
                  }
                  options={OPERATIONS_PURCHASE_KIND_FILTERS.map((value) => ({
                    value,
                    label: PURCHASE_KIND_LABEL[value],
                  }))}
                />
                <RootsFormCheckboxField
                  label="Solo crédito fiscal"
                  checked={draft.purchaseFiscalOnly}
                  onCheckedChange={(checked) =>
                    setDraft({ purchaseFiscalOnly: checked })
                  }
                />
              </>
            ) : null}

            {view === "expenses" ? (
              <AllSelectField
                id="operations-filter-expense-source"
                label="Movimiento"
                value={draft.expenseSource}
                onValueChange={(expenseSource) =>
                  setDraft({
                    expenseSource:
                      expenseSource as OperationsModalFilters["expenseSource"],
                  })
                }
                options={OPERATIONS_EXPENSE_SOURCE_FILTERS.map((value) => ({
                  value,
                  label: OPERATIONS_EXPENSE_SOURCE_FILTER_LABELS[value],
                }))}
              />
            ) : null}

            {view === "services" ? (
              <>
                <AllSelectField
                  id="operations-filter-service-status"
                  label="Estado"
                  value={draft.serviceStatus}
                  onValueChange={(serviceStatus) =>
                    setDraft({
                      serviceStatus:
                        serviceStatus as OperationsModalFilters["serviceStatus"],
                    })
                  }
                  options={OPERATIONS_SERVICE_STATUS_FILTERS.map((value) => ({
                    value,
                    label: SERVICE_CHARGE_STATUS_LABELS[value],
                  }))}
                />
                <AllSelectField
                  id="operations-filter-service-scope"
                  label="Modalidad"
                  value={draft.serviceScope}
                  onValueChange={(serviceScope) =>
                    setDraft({
                      serviceScope:
                        serviceScope as OperationsModalFilters["serviceScope"],
                    })
                  }
                  options={OPERATIONS_SERVICE_SCOPE_FILTERS.map((value) => ({
                    value,
                    label: SERVICE_CHARGE_BILLING_SCOPE_LABELS[value],
                  }))}
                />
              </>
            ) : null}
          </div>
        </RootsDialogBody>
        <RootsDialogDualActionFooter
          cancelLabel="Restablecer"
          confirmLabel="Aplicar"
          onCancel={() => onDraftChange(defaultOperationsModalFilters())}
          onConfirm={onApply}
        />
      </RootsDialogContent>
    </Dialog>
  )
}
