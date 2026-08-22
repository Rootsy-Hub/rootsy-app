"use client"

import {
  INVOICE_RECIBO_X_FILTER,
  type InvoiceCbteTipoFilter,
} from "@/app/[siteId]/[popId]/invoices/workspaceUrl"
import { dataWorkspaceListFiltersFieldClass } from "@/components/data-workspace/dataWorkspaceTablesLayout"
import { listToolbarFilterTriggerActiveClass } from "@/components/data-workspace/dataWorkspaceListStyles"
import {
  RootsFormSelectField,
  RootsFormSelectItem,
} from "@/components/rootsy-form"
import {
  getSaleComprobantePickerOptions,
  SALE_COMPROBANTE_RECIBO_X_LABEL,
  type SaleComprobantePickerOption,
} from "@/lib/saleComprobantePicker"
import type { PopEmisorIvaCondition } from "@/lib/saleComprobanteRules"
import { findSaleInvoiceTypeByArcaCbteTipo } from "@/lib/saleInvoiceTypes"
import { cn } from "@/lib/utils"
import { FileText } from "lucide-react"
import { useMemo } from "react"

const ALL_VALUE = "__all__"

export function invoiceTypeOptionsForPop(
  siteId: string,
  emisorIva: PopEmisorIvaCondition,
  hasValidFiscalCuit: boolean,
): Extract<SaleComprobantePickerOption, { kind: "arca" }>[] {
  return getSaleComprobantePickerOptions(
    siteId,
    emisorIva,
    hasValidFiscalCuit,
  ).filter(
    (opt): opt is Extract<SaleComprobantePickerOption, { kind: "arca" }> =>
      opt.kind === "arca",
  )
}

export function InvoiceTypeToolbarFilter({
  siteId,
  emisorIva,
  hasValidFiscalCuit,
  value,
  onChange,
  className,
}: {
  siteId: string
  emisorIva: PopEmisorIvaCondition
  hasValidFiscalCuit: boolean
  value: InvoiceCbteTipoFilter
  onChange: (value: InvoiceCbteTipoFilter) => void
  className?: string
}) {
  const options = useMemo(() => {
    const next = invoiceTypeOptionsForPop(siteId, emisorIva, hasValidFiscalCuit)
    if (
      typeof value === "number" &&
      !next.some((opt) => opt.arcaCbteTipo === value)
    ) {
      const fallback = findSaleInvoiceTypeByArcaCbteTipo(siteId, value)
      if (fallback) {
        next.push({
          kind: "arca",
          label: fallback.label,
          arcaCbteTipo: fallback.arcaCbteTipo,
          arcaRegimen: fallback.arcaRegimen,
        })
      }
    }
    return next
  }, [emisorIva, hasValidFiscalCuit, siteId, value])

  return (
    <RootsFormSelectField
      label="Tipo"
      value={value === "" ? ALL_VALUE : String(value)}
      onValueChange={(next) => {
        if (next === ALL_VALUE) {
          onChange("")
          return
        }
        if (next === INVOICE_RECIBO_X_FILTER) {
          onChange(INVOICE_RECIBO_X_FILTER)
          return
        }
        onChange(Number(next))
      }}
      prefix={<FileText className="size-4" aria-hidden />}
      prefixVariant="inline"
      className={cn(dataWorkspaceListFiltersFieldClass(), className)}
      triggerClassName={
        value !== "" ? listToolbarFilterTriggerActiveClass : undefined
      }
    >
      <RootsFormSelectItem value={ALL_VALUE}>Todos</RootsFormSelectItem>
      {options.map((item) => (
        <RootsFormSelectItem
          key={item.arcaCbteTipo}
          value={String(item.arcaCbteTipo)}
        >
          {item.label}
        </RootsFormSelectItem>
      ))}
      <RootsFormSelectItem value={INVOICE_RECIBO_X_FILTER}>
        {SALE_COMPROBANTE_RECIBO_X_LABEL}
      </RootsFormSelectItem>
    </RootsFormSelectField>
  )
}
