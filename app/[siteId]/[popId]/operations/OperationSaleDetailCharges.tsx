"use client"

import type { OperationSaleChargeRow } from "@/app/[siteId]/[popId]/operations/actions"
import { formatOperationDetailTimestamp } from "@/app/[siteId]/[popId]/operations/operationSaleDetailUi"
import { saleOpImporteBaseClass } from "@/components/sale-operation/saleOperationStyles"
import { cn } from "@/lib/utils"
import { FileText } from "lucide-react"

const fmt = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 2,
})

type Props = {
  charges: OperationSaleChargeRow[]
  loading?: boolean
  error?: string | null
  timeZone?: string
  onOpenComprobante: (charge: OperationSaleChargeRow) => void
}

export function OperationSaleDetailCharges({
  charges,
  loading = false,
  error = null,
  timeZone,
  onOpenComprobante,
}: Props) {
  if (loading) {
    return (
      <p className="text-sm text-muted-foreground">Cargando cobros…</p>
    )
  }

  if (error) {
    return (
      <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
        {error}
      </p>
    )
  }

  if (charges.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No hay cobros registrados.
      </p>
    )
  }

  return (
    <ul className="divide-y divide-border/45 rounded-lg border border-border/60 bg-background">
      {charges.map((charge) => (
        <li key={charge.saleId} className="px-3 py-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium leading-snug text-foreground">
                {charge.methodName}
              </p>
              <p className="mt-1 text-xs leading-snug text-muted-foreground">
                {formatOperationDetailTimestamp(charge.soldAt, timeZone)}
              </p>
            </div>
            <span
              className={cn(
                "shrink-0 pt-0.5 text-sm font-semibold text-foreground",
                saleOpImporteBaseClass,
              )}
            >
              {fmt.format(charge.amount)}
            </span>
          </div>
          {charge.hasComprobante ? (
            <button
              type="button"
              onClick={() => onOpenComprobante(charge)}
              className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
            >
              <FileText className="size-3.5 shrink-0" aria-hidden />
              <span>
                Ver comprobante
                {charge.comprobanteLabel
                  ? ` · ${charge.comprobanteLabel}`
                  : ""}
              </span>
            </button>
          ) : null}
        </li>
      ))}
    </ul>
  )
}
