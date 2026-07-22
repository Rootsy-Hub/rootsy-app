"use client"

import { CounterOrderForm } from "@/app/[siteId]/[popId]/mostrador/components/CounterOrderForm"
import type {
  CounterOrder,
  CreateCounterOrderInput,
  UpdateCounterOrderInput,
} from "@/app/[siteId]/[popId]/mostrador/mostradorTypes"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import type { ChannelCloseMode } from "@/lib/channelCheckoutClose"
import { Monitor, Package } from "lucide-react"
import { useState } from "react"

type Props = {
  order: CounterOrder | null
  orderError?: string | null
  creating: boolean
  onCancelCreate: () => void
  onCreateOrder: (input: CreateCounterOrderInput) => Promise<boolean> | boolean
  onUpdateOrder: (
    orderId: string,
    input: UpdateCounterOrderInput,
  ) => Promise<boolean> | boolean
  onMoveOrder: (
    orderId: string,
    status: CounterOrder["status"],
  ) => Promise<boolean> | boolean
  onCancelOrder: (orderId: string) => Promise<boolean> | boolean
  canCancelOrder?: boolean
  onCloseOrder?: () => Promise<boolean> | boolean
  canCloseOrder?: boolean
  closeOrderBlockReason?: string | null
  closeOrderMode?: ChannelCloseMode | null
  closeOrderLoading?: boolean
  clientLabel?: string | null
}

export function CounterOrderPanel({
  order,
  orderError,
  creating,
  onCancelCreate,
  onCreateOrder,
  onMoveOrder,
  onCancelOrder,
  canCancelOrder = true,
  onCloseOrder,
  canCloseOrder = false,
  closeOrderBlockReason = null,
  closeOrderMode = null,
  closeOrderLoading = false,
  clientLabel,
}: Props) {
  const [busy, setBusy] = useState(false)

  if (creating) {
    return (
      <CounterOrderForm
        onSubmit={onCreateOrder}
        onCancel={onCancelCreate}
        submitLabel="Crear pedido"
      />
    )
  }

  if (!order) {
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-slate-200/80 text-slate-500">
          <Monitor className="size-8" aria-hidden />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-700">
            Seleccioná un pedido o creá uno nuevo
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Los pedidos activos aparecen en el tablero de la izquierda.
          </p>
        </div>
      </div>
    )
  }

  const openedAgo = formatDistanceToNow(new Date(order.openedAt), {
    addSuffix: true,
    locale: es,
  })

  const run = async (fn: () => Promise<boolean> | boolean) => {
    setBusy(true)
    try {
      await fn()
    } finally {
      setBusy(false)
    }
  }

  const closeButtonLabel =
    closeOrderMode === "release" ? "Liberar pedido" : "Cerrar pedido"

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      {orderError ? (
        <p className="border-b border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
          {orderError}
        </p>
      ) : null}

      <div className="border-b border-slate-200/90 bg-white px-3 py-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-lg font-bold text-slate-900">#{order.orderNumber}</p>
            <p className="text-xs text-slate-500">{openedAgo}</p>
          </div>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
            {order.fulfillmentType === "delivery" ? "Delivery" : "Mostrador"}
          </span>
        </div>

        <dl className="mt-4 grid gap-2 text-sm">
          {order.fulfillmentType === "delivery" ? (
            <>
              <div>
                <dt className="text-xs font-semibold uppercase text-slate-500">
                  Dirección
                </dt>
                <dd className="text-slate-800">{order.deliveryAddress || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase text-slate-500">
                  Celular
                </dt>
                <dd className="text-slate-800">{order.phone || "—"}</dd>
              </div>
            </>
          ) : null}
          {order.fulfillmentType === "delivery" && order.driverName ? (
            <div>
              <dt className="text-xs font-semibold uppercase text-slate-500">
                Repartidor
              </dt>
              <dd className="text-slate-800">{order.driverName}</dd>
            </div>
          ) : null}
          <div>
            <dt className="text-xs font-semibold uppercase text-slate-500">
              Tiempo estimado
            </dt>
            <dd className="text-slate-800">{order.estimatedMinutes} min</dd>
          </div>
          {clientLabel ? (
            <div>
              <dt className="text-xs font-semibold uppercase text-slate-500">
                Cliente
              </dt>
              <dd className="text-slate-800">{clientLabel}</dd>
            </div>
          ) : null}
          {order.notes ? (
            <div>
              <dt className="text-xs font-semibold uppercase text-slate-500">
                Notas
              </dt>
              <dd className="text-slate-800">{order.notes}</dd>
            </div>
          ) : null}
          <div>
            <dt className="text-xs font-semibold uppercase text-slate-500">
              Pago
            </dt>
            <dd className={order.isPaid ? "text-emerald-700" : "text-amber-700"}>
              {order.isPaid ? "Pagado" : "Sin pagar"}
            </dd>
          </div>
        </dl>
      </div>

      <div className="grid gap-0 border-b border-slate-200/90 bg-white">
        {onCloseOrder ? (
          <>
            <Button
              type="button"
              disabled={!canCloseOrder || busy || closeOrderLoading || order.isPaid}
              title={closeOrderBlockReason ?? undefined}
              onClick={() => void run(onCloseOrder)}
              className={cn(
                "h-12 w-full rounded-none border-0 border-b border-slate-200/90",
                canCloseOrder && !order.isPaid
                  ? "bg-emerald-600 text-white hover:bg-emerald-500"
                  : "cursor-not-allowed bg-slate-100 text-slate-400",
              )}
            >
              {closeOrderLoading ? "Cerrando…" : closeButtonLabel}
            </Button>
            {!canCloseOrder && closeOrderBlockReason && !order.isPaid ? (
              <p className="border-b border-slate-200/90 px-3 py-2 text-xs leading-relaxed text-amber-800">
                {closeOrderBlockReason}
              </p>
            ) : null}
          </>
        ) : null}
        {order.status === "preparing" && order.fulfillmentType === "delivery" ? (
          <Button
            type="button"
            disabled={busy || order.isPaid}
            onClick={() => void run(() => onMoveOrder(order.id, "dispatched"))}
            className="h-12 w-full rounded-none border-0 border-b border-slate-200/90 bg-emerald-600 text-white hover:bg-emerald-500"
          >
            Marcar enviado
          </Button>
        ) : null}
        {order.status === "preparing" || order.status === "dispatched" ? (
          <Button
            type="button"
            variant="ghost"
            disabled={busy}
            onClick={() => void run(() => onMoveOrder(order.id, "delivered"))}
            className="h-12 w-full rounded-none border-0 border-b border-slate-200/90 text-slate-800 hover:bg-slate-50 hover:text-slate-950"
          >
            Marcar entregado
          </Button>
        ) : null}
        {!order.isPaid && order.status !== "cancelled" ? (
          <Button
            type="button"
            variant="ghost"
            disabled={busy || !canCancelOrder}
            title={
              !canCancelOrder
                ? "No se puede cancelar un pedido con cobros registrados."
                : undefined
            }
            onClick={() => void run(() => onCancelOrder(order.id))}
            className={cn(
              "h-12 w-full rounded-none border-0 text-rose-700 hover:bg-rose-50 hover:text-rose-800",
            )}
          >
            Cancelar pedido
          </Button>
        ) : null}
      </div>

      <div className="flex items-center gap-2 border-b border-slate-200/90 bg-slate-50/80 px-3 py-2.5 text-xs text-slate-500">
        <Package className="size-4 shrink-0" aria-hidden />
        Usá la pestaña Carrito para cargar productos y cobrar.
      </div>
    </div>
  )
}
