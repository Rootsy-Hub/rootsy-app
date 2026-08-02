"use client"

import type { OperationSaleRow } from "@/app/[siteId]/[popId]/operations/actions"
import { ChannelOperationCheckoutTicket } from "@/app/[siteId]/[popId]/operations/ChannelOperationCheckoutTicket"
import { formatOperationSaleDateTime } from "@/app/[siteId]/[popId]/operations/OperationsSalesTable"
import { SaleDetailTicketView } from "@/app/[siteId]/[popId]/operations/SaleDetailTicketView"
import { tdMoneyClass } from "@/components/data-workspace/dataWorkspaceListStyles"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

const fmt = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 2,
})

const SALE_STATUS_LABEL: Record<string, string> = {
  draft: "Borrador",
  completed: "Completada",
  partial: "Cobro parcial",
  cancelled: "Anulada",
}

function saleStatusLabel(status: string) {
  return SALE_STATUS_LABEL[status] ?? status
}

const opsDialogLight = "rootsy-app-light text-foreground"
const opsDialogSurfaceMd = cn(
  opsDialogLight,
  "gap-0 overflow-hidden rounded-2xl border border-border/60 bg-card p-0 shadow-2xl ring-1 ring-black/[0.04] sm:max-w-2xl",
  "max-h-[min(90vh,760px)] flex flex-col overflow-hidden",
)
const opsDialogHeader =
  "shrink-0 space-y-1.5 border-b border-border/50 bg-muted/25 px-6 pb-4 pt-5 text-left"
const opsDialogBody =
  "min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-4"

type Props = {
  sale: OperationSaleRow | null
  open: boolean
  onOpenChange: (open: boolean) => void
  siteId: string
  popId: string
  timeZone?: string
  loading?: boolean
  loadingMessage?: string
  error?: string | null
}

export function OperationSaleDetailDialog({
  sale,
  open,
  onOpenChange,
  siteId,
  popId,
  timeZone,
  loading = false,
  loadingMessage = "Cargando venta…",
  error = null,
}: Props) {
  const when = sale ? formatOperationSaleDateTime(sale.soldAt, timeZone) : null
  const isChannelOperation = sale
    ? Boolean(sale.tableSessionId || sale.counterOrderId) &&
      (sale.isChannelGrouped ||
        sale.channelOrderTotal != null ||
        sale.status === "partial")
    : false

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={opsDialogSurfaceMd}>
        <DialogHeader className={opsDialogHeader}>
          <DialogTitle className="text-base font-semibold tracking-tight">
            Detalle de venta
          </DialogTitle>
          {sale && when ? (
            <DialogDescription className="text-sm leading-relaxed">
              {when.primary}
              {when.secondary ? ` · ${when.secondary}` : ""} ·{" "}
              {sale.customerName ?? "Consumidor final"} ·{" "}
              {saleStatusLabel(sale.status)}
            </DialogDescription>
          ) : (
            <DialogDescription className="text-sm leading-relaxed">
              {loading ? loadingMessage : (error ?? "Venta no disponible")}
            </DialogDescription>
          )}
        </DialogHeader>
        <div className={opsDialogBody}>
          {loading ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {loadingMessage}
            </p>
          ) : error ? (
            <p className="rounded-lg border border-destructive/25 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          ) : sale ? (
            <>
              {sale.groupedSaleIds && sale.groupedSaleIds.length > 1 ? (
                <p className="mb-3 text-xs text-muted-foreground">
                  Operación agrupada · {sale.groupedSaleIds.length} cobros
                </p>
              ) : null}

              {isChannelOperation ? (
                <ChannelOperationCheckoutTicket
                  popId={popId}
                  siteId={siteId}
                  sale={sale}
                />
              ) : (
                <SaleDetailTicketView sale={sale} />
              )}

              {sale.payments.length > 0 && isChannelOperation ? (
                <div className="mt-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Cobros
                  </p>
                  <ul className="space-y-1 rounded-lg border border-border bg-muted/30 px-3 py-2">
                    {sale.payments.map((payment, index) => (
                      <li
                        key={`${sale.id}-pay-${index}`}
                        className="flex justify-between text-sm text-foreground"
                      >
                        <span>{payment.methodName}</span>
                        <span className={tdMoneyClass}>
                          {fmt.format(payment.amount)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}
