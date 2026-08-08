"use client"

import {
  INVOICE_STATUS_LABEL,
  INVOICE_STATUS_VALUES,
  type InvoiceStatusValue,
} from "@/app/[siteId]/[popId]/invoices/invoiceConstants"
import { dataWorkspaceListFiltersFieldClass } from "@/components/data-workspace/dataWorkspaceTablesLayout"
import { lightToolbarPanelClass, listToolbarFilterTriggerActiveClass } from "@/components/data-workspace/dataWorkspaceListStyles"
import {
  RootsFormSelectField,
  RootsFormSelectItem,
} from "@/components/rootsy-form"
import { cn } from "@/lib/utils"
import { CircleDot } from "lucide-react"

export type InvoiceStatusFilterId = "all" | InvoiceStatusValue

const FILTER_ITEMS: { id: InvoiceStatusFilterId; label: string }[] = [
  { id: "all", label: "Todos" },
  ...INVOICE_STATUS_VALUES.map((value) => ({
    id: value as InvoiceStatusFilterId,
    label: INVOICE_STATUS_LABEL[value],
  })),
]

export function resolveInvoiceStatusFilterId(
  status: InvoiceStatusValue | "",
): InvoiceStatusFilterId {
  return status === "" ? "all" : status
}

export function invoiceStatusFilterToQuery(
  id: InvoiceStatusFilterId,
): InvoiceStatusValue | "" {
  return id === "all" ? "" : id
}

export function InvoiceStatusToolbarFilter({
  value,
  onChange,
  className,
  variant = "layout",
}: {
  value: InvoiceStatusFilterId
  onChange: (value: InvoiceStatusFilterId) => void
  className?: string
  variant?: "panel" | "layout"
}) {
  return (
    <RootsFormSelectField
      label="Estado"
      value={value}
      onValueChange={(next) => onChange(next as InvoiceStatusFilterId)}
      prefix={<CircleDot className="size-4" aria-hidden />}
      prefixVariant="inline"
      className={cn(
        variant === "layout"
          ? dataWorkspaceListFiltersFieldClass()
          : lightToolbarPanelClass,
        className,
      )}
      triggerClassName={value !== "all" ? listToolbarFilterTriggerActiveClass : undefined}
    >
      {FILTER_ITEMS.map((item) => (
        <RootsFormSelectItem key={item.id} value={item.id}>
          {item.label}
        </RootsFormSelectItem>
      ))}
    </RootsFormSelectField>
  )
}
