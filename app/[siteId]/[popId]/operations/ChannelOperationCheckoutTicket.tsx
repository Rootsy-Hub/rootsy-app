"use client"

import type { OperationSaleRow } from "@/app/[siteId]/[popId]/operations/actions"
import { getChannelOperationTicketDisplay } from "@/app/[siteId]/[popId]/operations/actions"
import { MostradorCartLineDisplay } from "@/components/sale-operation/MostradorCartLineDisplay"
import { SaleReadonlyTicketPanel } from "@/components/sale-operation/SaleReadonlyTicketPanel"
import type { ChannelCheckoutTicketDisplay } from "@/lib/buildChannelCheckoutTicketDisplay"
import {
  groupMostradorCartDisplayRows,
  pricingForMostradorRow,
} from "@/lib/mostradorCartDisplay"
import { getRowPaymentStatus } from "@/lib/partialCheckoutSelection"
import { cn } from "@/lib/utils"
import { CheckCircle2 } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

const EMPTY_OVERRIDES = {
  itemDescuentoModo: {},
  itemDescuentoDraft: {},
  itemDescuentoSuprimido: {},
  itemComentarios: {},
}

type Props = {
  popId: string
  siteId: string
  sale: OperationSaleRow
  showHeading?: boolean
}

function resolveChannelTicketTotals(
  ticket: ChannelCheckoutTicketDisplay,
  sale: OperationSaleRow,
) {
  const orderTotal = sale.channelOrderTotal ?? ticket.orderTotal
  const paidFromPayments = sale.payments.reduce(
    (sum, payment) => sum + payment.amount,
    0,
  )
  const paidFromSale = sale.channelPaidTotal ?? paidFromPayments
  const paidTotal = Math.max(ticket.paidTotal, paidFromSale, paidFromPayments)
  const pendingTotal = Math.max(0, orderTotal - paidTotal)
  return { orderTotal, paidTotal, pendingTotal }
}

function PaidBadge() {
  return (
    <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-800">
      <CheckCircle2 className="size-3" aria-hidden />
      Pagado
    </span>
  )
}

export function ChannelOperationCheckoutTicket({
  popId,
  siteId,
  sale,
  showHeading = true,
}: Props) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [ticket, setTicket] = useState<ChannelCheckoutTicketDisplay | null>(
    null,
  )

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    void getChannelOperationTicketDisplay(popId, {
      siteId,
      tableSessionId: sale.tableSessionId,
      counterOrderId: sale.counterOrderId,
    }).then((res) => {
      if (cancelled) return
      setLoading(false)
      if (!res.success) {
        setError(res.error)
        setTicket(null)
        return
      }
      setTicket(res.ticket)
    })
    return () => {
      cancelled = true
    }
  }, [popId, siteId, sale.tableSessionId, sale.counterOrderId])

  const groups = useMemo(
    () => (ticket ? groupMostradorCartDisplayRows(ticket.rows) : []),
    [ticket],
  )
  const lineCount = useMemo(
    () => groups.reduce((sum, group) => sum + group.rows.length, 0),
    [groups],
  )

  if (loading) {
    return (
      <p className="px-4 py-8 text-center text-sm text-muted-foreground">
        Cargando ticket del pedido…
      </p>
    )
  }

  if (error || !ticket) {
    return (
      <p className="mx-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
        {error ?? "No se pudo cargar el ticket del pedido."}
      </p>
    )
  }

  const totals = resolveChannelTicketTotals(ticket, sale)
  const hasPending = totals.pendingTotal > 0.009

  return (
    <>
      {showHeading ? (
        <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Ticket del pedido
        </p>
      ) : null}

      <SaleReadonlyTicketPanel
        groups={groups}
        lineCount={lineCount}
        emptyTitle="Sin líneas en el pedido."
        totalBarTone="modal"
        renderRow={(row) => {
          const paymentStatus = getRowPaymentStatus(
            row,
            ticket.paidPartialUnits,
          )
          const pricing = pricingForMostradorRow(row, EMPTY_OVERRIDES)
          return (
            <MostradorCartLineDisplay
              key={row.rowKey}
              row={row}
              pricing={{
                precioBase: pricing.precioBase,
                precioFinal: pricing.precioFinal,
              }}
              omitHiddenPricePlaceholder
              paymentBadge={
                paymentStatus.isFullyPaid ? <PaidBadge /> : null
              }
              rowClassName={cn(
                paymentStatus.isFullyPaid && "bg-emerald-50/70",
                paymentStatus.isPartiallyPaid && "bg-emerald-50/35",
              )}
            />
          )
        }}
        totalBar={{
          total: hasPending ? totals.pendingTotal : totals.orderTotal,
          subtotal: ticket.subtotalOriginal,
          subtotalOriginal: ticket.subtotalOriginal,
          promocionesAplicadasMonto: ticket.promocionesAplicadasMonto,
          promocionesAplicadasCount: ticket.promocionesAplicadasCount,
          descuentoItemsMonto: ticket.descuentoItemsMonto,
          hayDescuentoItems: ticket.hayDescuentoItems,
          descuentoMonto: ticket.descuentoGeneralMonto,
          hayDescuento: ticket.hayDescuentoGeneral,
          totalPagado: 0,
          totalLabel: hasPending ? "Total a cobrar" : "Total",
          flush: true,
        }}
      />
    </>
  )
}
