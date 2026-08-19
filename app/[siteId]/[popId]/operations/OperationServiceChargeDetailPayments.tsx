"use client"

import type { OperationServiceChargeRow } from "@/app/[siteId]/[popId]/operations/actions"
import { operationTableFmt } from "@/app/[siteId]/[popId]/operations/operationsTableCells"
import { formatIsoDateShort } from "@/lib/dataWorkspaceDateFilter"
import { operationPaymentKindLabel } from "@/lib/operationPaymentKinds"
import { saleOpImporteBaseClass } from "@/components/sale-operation/saleOperationStyles"
import { cn } from "@/lib/utils"

const fmt = operationTableFmt

type Props = {
  charge: OperationServiceChargeRow
}

export function OperationServiceChargeDetailPayments({ charge }: Props) {
  if (charge.payments.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">Todavía no hay cobros.</p>
    )
  }

  return (
    <ul className="divide-y divide-border/45 rounded-lg border border-border/60 bg-background">
      {charge.payments.map((payment) => (
        <li key={payment.id} className="px-3 py-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium leading-snug text-foreground">
                {payment.paymentKind
                  ? operationPaymentKindLabel(payment.paymentKind)
                  : "Cobro"}
              </p>
              <p className="mt-1 text-xs leading-snug text-muted-foreground">
                {formatIsoDateShort(payment.paidAt)}
                {payment.notes.trim() ? ` · ${payment.notes.trim()}` : ""}
              </p>
            </div>
            <span
              className={cn(
                "shrink-0 pt-0.5 text-sm font-semibold text-foreground",
                saleOpImporteBaseClass,
              )}
            >
              {fmt.format(payment.amount)}
            </span>
          </div>
        </li>
      ))}
    </ul>
  )
}
