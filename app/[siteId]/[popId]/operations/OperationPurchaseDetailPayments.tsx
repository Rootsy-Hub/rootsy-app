"use client"

import type { OperationPurchaseRow } from "@/app/[siteId]/[popId]/operations/actions"
import { formatOperationDetailTimestamp } from "@/app/[siteId]/[popId]/operations/operationSaleDetailUi"
import { operationTableFmt } from "@/app/[siteId]/[popId]/operations/operationsTableCells"
import { saleOpImporteBaseClass } from "@/components/sale-operation/saleOperationStyles"
import { cn } from "@/lib/utils"

const fmt = operationTableFmt

type Props = {
  purchase: OperationPurchaseRow
  timeZone?: string
}

function formatLedgerDate(d: string) {
  if (!d || d.length < 10) return null
  const y = Number(d.slice(0, 4))
  const m = Number(d.slice(5, 7))
  const day = Number(d.slice(8, 10))
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(day)) {
    return null
  }
  return new Date(y, m - 1, day).toLocaleDateString("es-AR")
}

export function OperationPurchaseDetailPayments({
  purchase,
  timeZone,
}: Props) {
  if (purchase.payments.length === 0) {
    return (
      <p className="text-sm text-foreground">{purchase.paymentMethodLabel}</p>
    )
  }

  return (
    <ul className="divide-y divide-border/45 rounded-lg border border-border/60 bg-background">
      {purchase.payments.map((payment, index) => {
        const paidAtLabel = payment.paidAt
          ? formatLedgerDate(payment.paidAt)
          : null
        return (
          <li key={`${purchase.id}-pay-${index}`} className="px-3 py-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium leading-snug text-foreground">
                  {payment.methodName}
                </p>
                {paidAtLabel ? (
                  <p className="mt-1 text-xs leading-snug text-muted-foreground">
                    {paidAtLabel}
                  </p>
                ) : (
                  <p className="mt-1 text-xs leading-snug text-muted-foreground">
                    {formatOperationDetailTimestamp(
                      purchase.operationAt,
                      timeZone,
                    )}
                  </p>
                )}
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
        )
      })}
    </ul>
  )
}
