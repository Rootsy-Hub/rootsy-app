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
  resolveOperationSaleOutstanding,
} from "@/app/[siteId]/[popId]/operations/operationSaleDetailUi"
import { SaleDetailTicketView } from "@/app/[siteId]/[popId]/operations/SaleDetailTicketView"
import "@/app/library/layouts/layoutsOperarTheme.css"
import {
  layoutsOperarBodyScopeClass,
  layoutsOperarScrollMinimalClass,
} from "@/app/library/layouts/layoutsOperarStyles"
import {
  RootsDialogBody,
  RootsDialogContent,
  RootsDialogErrorBanner,
  RootsDialogHeader,
  RootsDialogLoadingState,
  rootsDialogPanelPaddingXClass,
} from "@/components/rootsy-dialog"
import {
  saleOpFmt,
  saleOpImporteBaseClass,
} from "@/components/sale-operation/saleOperationStyles"
import { Dialog } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

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

const sectionTitleClass =
  "mb-3 font-canopy text-xs font-semibold tracking-[0.01em] text-[var(--rootsy-bruma-500)]"

const columnScrollClass = cn(
  layoutsOperarScrollMinimalClass,
  "h-full min-h-0 overflow-y-auto overscroll-contain",
)

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
      tableSessionId: sale.tableSessionId,
      counterOrderId: sale.counterOrderId,
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
  }, [
    open,
    sale?.id,
    sale?.groupedSaleIds,
    sale?.tableSessionId,
    sale?.counterOrderId,
    popId,
    contextProp,
  ])

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
  const outstandingAmount = sale
    ? resolveOperationSaleOutstanding(sale, charges)
    : 0
  const description =
    channel === "table"
      ? "Mesa · operación y pedido"
      : channel === "counter"
        ? "Mostrador · operación y pedido"
        : "Venta · operación y pedido"

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <RootsDialogContent
          size="twoCol"
          className="sm:max-w-[min(92vw,calc(21rem+400px))]"
        >
          <RootsDialogHeader
            open={open}
            title={title}
            description={description}
          />

          {loading ? (
            <RootsDialogBody>
              <RootsDialogLoadingState message={loadingMessage} />
            </RootsDialogBody>
          ) : error ? (
            <RootsDialogBody>
              <RootsDialogErrorBanner>{error}</RootsDialogErrorBanner>
            </RootsDialogBody>
          ) : sale ? (
            <div
              className={cn(
                "rootsy-theme-pos",
                layoutsOperarBodyScopeClass,
                "grid min-h-0 flex-1 overflow-y-auto",
                "lg:h-0 lg:grid-cols-[minmax(17rem,1fr)_400px] lg:grid-rows-[minmax(0,1fr)] lg:overflow-hidden",
              )}
            >
              <aside className="flex h-full min-h-0 flex-col overflow-hidden">
                <div
                  className={cn(
                    columnScrollClass,
                    rootsDialogPanelPaddingXClass,
                    "py-[var(--rootsy-space-200)] lg:pr-[var(--rootsy-space-300)]",
                  )}
                >
                <section>
                  <h3 className={sectionTitleClass}>Detalles</h3>
                  {contextLoading ? (
                    <p className="font-canopy text-sm text-[var(--rootsy-bruma-500)]">
                      Cargando datos…
                    </p>
                  ) : context ? (
                    <OperationSaleDetailMeta
                      saleId={sale.id}
                      context={context}
                      timeZone={timeZone}
                    />
                  ) : contextError ? (
                    <RootsDialogErrorBanner>{contextError}</RootsDialogErrorBanner>
                  ) : null}
                </section>

                <section className="mt-6">
                  <h3 className={sectionTitleClass}>
                    Cobros
                    {sale.groupedSaleIds && sale.groupedSaleIds.length > 1
                      ? ` · ${sale.groupedSaleIds.length}`
                      : charges.length > 1
                        ? ` · ${charges.length}`
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

                {!chargesLoading && outstandingAmount > 0.009 ? (
                  <section className="mt-6">
                    <h3 className={sectionTitleClass}>Por cobrar</h3>
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-canopy text-sm leading-snug text-[var(--rootsy-bruma-900)]">
                        Pendiente
                      </p>
                      <span
                        className={cn(
                          "shrink-0 text-sm font-semibold text-[var(--rootsy-bruma-900)]",
                          saleOpImporteBaseClass,
                        )}
                      >
                        {saleOpFmt.format(outstandingAmount)}
                      </span>
                    </div>
                  </section>
                ) : null}
                </div>
              </aside>

              <section
                className={cn(
                  "rootsy-app-light layouts-operar-ticket-shell",
                  "flex h-full min-h-0 min-w-0 flex-col overflow-hidden",
                  "border-t border-[var(--rootsy-bruma-200)] bg-[var(--rootsy-bruma-50)]",
                  "lg:border-t-0 lg:border-l",
                )}
              >
                <div className={columnScrollClass}>
                  {isChannelOperation ? (
                    <ChannelOperationCheckoutTicket
                      popId={popId}
                      siteId={siteId}
                      sale={sale}
                      showHeading={false}
                      ticketTone="operar"
                      ticketScrollClassName="overflow-visible"
                    />
                  ) : (
                    <SaleDetailTicketView
                      sale={sale}
                      showPaymentDetails={false}
                      showHeading={false}
                      ticketTone="operar"
                      ticketScrollClassName="overflow-visible"
                    />
                  )}
                </div>
              </section>
            </div>
          ) : null}
        </RootsDialogContent>
      </Dialog>

      <OperationSaleInvoiceDialog
        sale={invoiceSale}
        open={invoiceSale != null}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setInvoiceSale(null)
        }}
        siteId={siteId}
        popId={popId}
      />
    </>
  )
}
