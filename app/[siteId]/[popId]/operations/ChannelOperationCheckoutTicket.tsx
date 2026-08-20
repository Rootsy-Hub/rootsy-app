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
  ticketTone?: "pos" | "modal" | "operar"
  className?: string
  ticketScrollClassName?: string
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
  ticketTone = "modal",
  className,
  ticketScrollClassName,
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
      <div className="flex h-full min-h-0 flex-1 items-center justify-center px-4 py-8">
        <p className="text-center font-canopy text-sm text-[var(--rootsy-bruma-500)]">
          Cargando ticket del pedido…
        </p>
      </div>
    )
  }

  if (error || !ticket) {
    return (
      <div className="flex h-full min-h-0 flex-1 items-center px-4 py-6">
        <p className="w-full rounded-lg border border-[var(--rootsy-bruma-200)] bg-white px-3 py-2 font-canopy text-sm text-[var(--rootsy-bruma-700)]">
          {error ?? "No se pudo cargar el ticket del pedido."}
        </p>
      </div>
    )
  }

  const orderTotal = sale.channelOrderTotal ?? ticket.orderTotal

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
        totalBarTone={ticketTone}
        className={className}
        ticketScrollClassName={ticketScrollClassName}
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
              variant={ticketTone === "operar" ? "operar" : "legacy"}
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
          total: orderTotal,
          subtotal: ticket.subtotalOriginal,
          subtotalOriginal: ticket.subtotalOriginal,
          promocionesAplicadasMonto: ticket.promocionesAplicadasMonto,
          promocionesAplicadasCount: ticket.promocionesAplicadasCount,
          descuentoItemsMonto: ticket.descuentoItemsMonto,
          hayDescuentoItems: ticket.hayDescuentoItems,
          descuentoMonto: ticket.descuentoGeneralMonto,
          hayDescuento: ticket.hayDescuentoGeneral,
          totalPagado: 0,
          totalLabel: "Total",
          flush: true,
        }}
      />
    </>
  )
}
