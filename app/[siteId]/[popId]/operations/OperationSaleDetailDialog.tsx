"use client"

import type {
  OperationSaleChargeRow,
  OperationSaleDetailContext,
  OperationSaleRow,
} from "@/app/[siteId]/[popId]/operations/actions"
import {
  getOperationSaleDetailCharges,
  getOperationSaleDetailContext,
} from "@/app/[siteId]/[popId]/operations/actions"
import { ChannelOperationCheckoutTicket } from "@/app/[siteId]/[popId]/operations/ChannelOperationCheckoutTicket"
import { OperationSaleDetailCharges } from "@/app/[siteId]/[popId]/operations/OperationSaleDetailCharges"
import { OperationSaleDetailMeta } from "@/app/[siteId]/[popId]/operations/OperationSaleDetailMeta"
import { OperationSaleInvoiceDialog } from "@/app/[siteId]/[popId]/operations/OperationSaleInvoiceDialog"
import {
  operationSaleDetailTitle,
  resolveOperationSaleChannel,
} from "@/app/[siteId]/[popId]/operations/operationSaleDetailUi"
import { SaleDetailTicketView } from "@/app/[siteId]/[popId]/operations/SaleDetailTicketView"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
const opsDialogLight = "rootsy-app-light text-foreground"
const opsDialogSurfaceMd = cn(
  opsDialogLight,
  "gap-0 overflow-hidden rounded-2xl border border-border/60 bg-card p-0 shadow-2xl ring-1 ring-black/[0.04] sm:max-w-[calc(21rem+380px+3rem)]",
  "max-h-[min(90vh,820px)] flex flex-col overflow-hidden",
)
const opsDialogHeader =
  "shrink-0 border-b border-border/50 bg-muted/25 px-6 pb-4 pt-5 text-left"
const opsDialogSectionTitle =
  "mb-3 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500"

type Props = {
  sale: OperationSaleRow | null
  context?: OperationSaleDetailContext | null
  open: boolean
  onOpenChange: (open: boolean) => void
  siteId: string
  popId: string
  timeZone?: string
  loading?: boolean
  loadingMessage?: string
  error?: string | null
}

function isChannelOperationSale(sale: OperationSaleRow): boolean {
  return Boolean(
    sale.tableSessionId ||
      sale.counterOrderId ||
      sale.isChannelGrouped ||
      sale.channelOrderTotal != null ||
      sale.status === "partial",
  )
}

export function OperationSaleDetailDialog({
  sale,
  context: contextProp = null,
  open,
  onOpenChange,
  siteId,
  popId,
  timeZone,
  loading = false,
  loadingMessage = "Cargando venta…",
  error = null,
}: Props) {
  const [context, setContext] = useState<OperationSaleDetailContext | null>(
    contextProp,
  )
  const [contextLoading, setContextLoading] = useState(false)
  const [contextError, setContextError] = useState<string | null>(null)
  const [charges, setCharges] = useState<OperationSaleChargeRow[]>([])
  const [chargesLoading, setChargesLoading] = useState(false)
  const [chargesError, setChargesError] = useState<string | null>(null)
  const [invoiceSale, setInvoiceSale] = useState<OperationSaleRow | null>(null)

  useEffect(() => {
    setContext(contextProp)
  }, [contextProp])

  useEffect(() => {
    if (!open) {
      setContext(null)
      setContextError(null)
      setContextLoading(false)
      setCharges([])
      setChargesError(null)
      setChargesLoading(false)
      setInvoiceSale(null)
      return
    }
    if (!sale?.id) return

    let cancelled = false

    if (!contextProp) {
      setContextLoading(true)
      setContextError(null)
      void getOperationSaleDetailContext(popId, sale.id).then((res) => {
        if (cancelled) return
        setContextLoading(false)
        if (!res.success) {
          setContextError(res.error)
          setContext(null)
          return
        }
        setContext(res.context)
      })
    }

    setChargesLoading(true)
    setChargesError(null)
    void getOperationSaleDetailCharges(popId, {
      saleId: sale.id,
      groupedSaleIds: sale.groupedSaleIds,
    }).then((res) => {
      if (cancelled) return
      setChargesLoading(false)
      if (!res.success) {
        setChargesError(res.error)
        setCharges([])
        return
      }
      setCharges(res.charges)
    })

    return () => {
      cancelled = true
    }
  }, [open, sale?.id, sale?.groupedSaleIds, popId, contextProp])

  const channel = sale
    ? (context?.channel ??
      resolveOperationSaleChannel({
        saleChannel: sale.saleChannel,
        tableSessionId: sale.tableSessionId,
        counterOrderId: sale.counterOrderId,
      }))
    : "pos"
  const title = operationSaleDetailTitle(channel)
  const isChannelOperation = sale ? isChannelOperationSale(sale) : false

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className={opsDialogSurfaceMd}>
          <DialogHeader className={opsDialogHeader}>
            <DialogTitle className="text-base font-semibold tracking-tight">
              {title}
            </DialogTitle>
            {loading || error || !sale ? (
              <DialogDescription className="sr-only">
                {loading ? loadingMessage : (error ?? "Venta no disponible")}
              </DialogDescription>
            ) : (
              <DialogDescription className="sr-only">{title}</DialogDescription>
            )}
          </DialogHeader>

          {loading ? (
            <div className="px-6 py-8">
              <p className="text-center text-sm text-muted-foreground">
                {loadingMessage}
              </p>
            </div>
          ) : error ? (
            <div className="px-6 py-4">
              <p className="rounded-lg border border-destructive/25 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            </div>
          ) : sale ? (
            <div className="grid min-h-0 flex-1 items-start lg:grid-cols-[minmax(17rem,21rem)_minmax(380px,1fr)]">
              <div className="min-h-0 overflow-y-auto overscroll-contain border-b border-border/50 bg-muted/20 px-5 py-4 lg:border-b-0 lg:border-r">
                <section>
                  <h3 className={opsDialogSectionTitle}>Detalles</h3>
                  {contextLoading ? (
                    <p className="text-sm text-muted-foreground">
                      Cargando datos…
                    </p>
                  ) : context ? (
                    <OperationSaleDetailMeta
                      saleId={sale.id}
                      context={context}
                      timeZone={timeZone}
                    />
                  ) : contextError ? (
                    <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                      {contextError}
                    </p>
                  ) : null}
                </section>

                <section className="mt-6">
                  <h3 className={opsDialogSectionTitle}>
                    Cobros
                    {sale.groupedSaleIds && sale.groupedSaleIds.length > 1
                      ? ` (${sale.groupedSaleIds.length})`
                      : charges.length > 1
                        ? ` (${charges.length})`
                        : ""}
                  </h3>
                  <OperationSaleDetailCharges
                    charges={charges}
                    loading={chargesLoading}
                    error={chargesError}
                    timeZone={timeZone}
                    onOpenComprobante={(charge) =>
                      setInvoiceSale(charge.sale)
                    }
                  />
                </section>
              </div>

              <div className="px-5 py-4 lg:pl-4">
                <div className="mx-auto w-full max-w-[380px]">
                  {isChannelOperation ? (
                    <ChannelOperationCheckoutTicket
                      popId={popId}
                      siteId={siteId}
                      sale={sale}
                      showHeading={false}
                    />
                  ) : (
                    <SaleDetailTicketView
                      sale={sale}
                      showPaymentDetails={false}
                      showHeading={false}
                    />
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <OperationSaleInvoiceDialog
        sale={invoiceSale}
        open={invoiceSale != null}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setInvoiceSale(null)
        }}
      />
    </>
  )
}
