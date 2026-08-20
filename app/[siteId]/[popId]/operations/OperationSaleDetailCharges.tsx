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
      <p className="font-canopy text-sm text-[var(--rootsy-bruma-500)]">
        Cargando cobros…
      </p>
    )
  }

  if (error) {
    return (
      <p className="font-canopy text-sm text-[var(--rootsy-bruma-700)]">{error}</p>
    )
  }

  if (charges.length === 0) {
    return (
      <p className="font-canopy text-sm text-[var(--rootsy-bruma-500)]">
        No hay cobros registrados.
      </p>
    )
  }

  return (
    <ul className="flex flex-col gap-4">
      {charges.map((charge) => (
        <li key={charge.saleId}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="font-canopy text-sm leading-snug text-[var(--rootsy-bruma-900)]">
                {charge.methodName}
              </p>
              <p className="mt-1 font-canopy text-xs leading-snug text-[var(--rootsy-bruma-500)]">
                {formatOperationDetailTimestamp(charge.soldAt, timeZone)}
              </p>
            </div>
            <span
              className={cn(
                "shrink-0 pt-0.5 text-sm font-semibold text-[var(--rootsy-bruma-900)]",
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
              className="mt-2 inline-flex items-center gap-1.5 font-canopy text-xs font-medium text-[var(--rootsy-savia-700)] hover:underline"
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
