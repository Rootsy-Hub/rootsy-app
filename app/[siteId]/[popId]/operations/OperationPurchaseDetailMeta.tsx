"use client"

import type { OperationPurchaseRow } from "@/app/[siteId]/[popId]/operations/actions"
import { OperationSaleDetailField } from "@/app/[siteId]/[popId]/operations/OperationSaleDetailField"
import { purchaseKindLabel } from "@/app/[siteId]/[popId]/operations/operationPurchaseUi"
import { formatOperationDetailTimestamp } from "@/app/[siteId]/[popId]/operations/operationSaleDetailUi"

type Props = {
  purchase: OperationPurchaseRow
  timeZone?: string
}

export function OperationPurchaseDetailMeta({ purchase, timeZone }: Props) {
  return (
    <div className="divide-y divide-border/45">
      <OperationSaleDetailField label="ID">
        <span className="break-all text-[11px] leading-snug text-muted-foreground">
          {purchase.id}
        </span>
      </OperationSaleDetailField>
      <OperationSaleDetailField label="Fecha">
        {formatOperationDetailTimestamp(purchase.operationAt, timeZone)}
      </OperationSaleDetailField>
      {purchase.purchasedByName ? (
        <OperationSaleDetailField label="Usuario">
          {purchase.purchasedByName}
        </OperationSaleDetailField>
      ) : null}
      <OperationSaleDetailField label="Proveedor">
        {purchase.supplierName}
      </OperationSaleDetailField>
      <OperationSaleDetailField label="Tipo">
        {purchaseKindLabel(purchase.purchaseKind)}
      </OperationSaleDetailField>
      {purchase.documentKindLabel ? (
        <OperationSaleDetailField label="Comprobante">
          {purchase.documentKindLabel}
          {purchase.documentNumber
            ? ` · ${purchase.documentNumber}`
            : ""}
        </OperationSaleDetailField>
      ) : purchase.documentNumber ? (
        <OperationSaleDetailField label="Comprobante">
          {purchase.documentNumber}
        </OperationSaleDetailField>
      ) : null}
      {purchase.supplierIvaConditionLabel !== "—" ? (
        <OperationSaleDetailField label="Condición IVA">
          {purchase.supplierIvaConditionLabel}
        </OperationSaleDetailField>
      ) : null}
    </div>
  )
}
