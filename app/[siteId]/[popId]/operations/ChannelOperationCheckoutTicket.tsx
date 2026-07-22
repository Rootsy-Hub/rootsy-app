"use client"

import type { OperationSaleRow } from "@/app/[siteId]/[popId]/operations/actions"
import { getChannelOperationTicketDisplay } from "@/app/[siteId]/[popId]/operations/actions"
import type { ChannelCheckoutTicketDisplay } from "@/lib/buildChannelCheckoutTicketDisplay"
import { MostradorCartLineDisplay } from "@/components/sale-operation/MostradorCartLineDisplay"
import { MostradorCartTicketGroup } from "@/components/sale-operation/MostradorCartTicketGroup"
import { saleOpFmt } from "@/components/sale-operation/saleOperationStyles"
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
}

export function ChannelOperationCheckoutTicket({ popId, siteId, sale }: Props) {
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

  if (loading) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        Cargando ticket del pedido…
      </p>
    )
  }

  if (error || !ticket) {
    return (
      <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
        {error ?? "No se pudo cargar el ticket del pedido."}
      </p>
    )
  }

  return (
    <>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Ticket del pedido
      </p>
      <div className="overflow-hidden rounded-lg border border-border bg-white">
        {groups.length === 0 ? (
          <p className="px-3 py-6 text-center text-sm text-muted-foreground">
            Sin líneas en el pedido.
          </p>
        ) : (
          <div className="border-b border-slate-200/90 bg-white">
            {groups.map((group) => (
              <MostradorCartTicketGroup
                key={group.key}
                group={group}
                renderRow={(row) => {
                  const paymentStatus = getRowPaymentStatus(
                    row,
                    ticket.paidPartialUnits,
                  )
                  const pricing = pricingForMostradorRow(row, EMPTY_OVERRIDES)
                  return (
                    <div
                      key={row.rowKey}
                      className={cn(
                        paymentStatus.isFullyPaid && "bg-emerald-50/70",
                        paymentStatus.isPartiallyPaid && "bg-emerald-50/35",
                      )}
                    >
                      <div className="flex items-start gap-2 px-3 py-2.5">
                        <MostradorCartLineDisplay
                          row={row}
                          pricing={{
                            precioBase: pricing.precioBase,
                            precioFinal: pricing.precioFinal,
                          }}
                        />
                        {paymentStatus.isFullyPaid ? (
                          <span className="mt-0.5 inline-flex shrink-0 items-center gap-0.5 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-800">
                            <CheckCircle2 className="size-3" aria-hidden />
                            Pagado
                          </span>
                        ) : null}
                      </div>
                    </div>
                  )
                }}
              />
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 rounded-lg border border-border bg-muted/20 px-4 py-3 text-sm">
        <div className="flex justify-between gap-4 py-1">
          <span className="text-muted-foreground">Total del pedido</span>
          <span className="font-semibold tabular-nums">
            {saleOpFmt.format(ticket.orderTotal)}
          </span>
        </div>
        {ticket.paidTotal > 0 ? (
          <div className="flex justify-between gap-4 py-1 text-emerald-800">
            <span>Pagado</span>
            <span className="font-medium tabular-nums">
              {saleOpFmt.format(ticket.paidTotal)}
            </span>
          </div>
        ) : null}
        {ticket.pendingTotal > 0.009 ? (
          <div className="flex justify-between gap-4 py-1">
            <span className="font-medium text-foreground">Pendiente</span>
            <span className="font-semibold tabular-nums text-primary">
              {saleOpFmt.format(ticket.pendingTotal)}
            </span>
          </div>
        ) : null}
      </div>
    </>
  )
}
