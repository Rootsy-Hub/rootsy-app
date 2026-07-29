"use client"

import { CounterOrderForm } from "@/app/[siteId]/[popId]/mostrador/components/CounterOrderForm"
import type {
  CounterOrder,
  CreateCounterOrderInput,
  UpdateCounterOrderInput,
} from "@/app/[siteId]/[popId]/mostrador/mostradorTypes"
import {
  ChannelDataActions,
  ChannelDataEmptyState,
  ChannelDataErrorBanner,
  ChannelDataField,
  ChannelDataFields,
  ChannelDataHeader,
  ChannelDataHint,
  ChannelDataPanel,
  ChannelDataPrimaryAction,
  ChannelDataSecondaryAction,
  ChannelDataSection,
  ChannelDataStatusBadge,
  ChannelDataWarningBanner,
} from "@/components/sale-operation/ChannelOperationDataPanel"
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
      <ChannelDataEmptyState
        icon={Monitor}
        title="Seleccioná un pedido o creá uno nuevo"
        description="Los pedidos activos aparecen en el tablero de la izquierda."
      />
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
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <ChannelDataPanel>
        {orderError ? (
          <ChannelDataErrorBanner>{orderError}</ChannelDataErrorBanner>
        ) : null}

        <ChannelDataSection>
          <ChannelDataHeader
            title={`#${order.orderNumber}`}
            meta={openedAgo}
            badge={
              <ChannelDataStatusBadge>
                {order.fulfillmentType === "delivery" ? "Delivery" : "Mostrador"}
              </ChannelDataStatusBadge>
            }
          />

          <ChannelDataFields>
            {order.fulfillmentType === "delivery" ? (
              <>
                <ChannelDataField label="Dirección">
                  {order.deliveryAddress || "—"}
                </ChannelDataField>
                <ChannelDataField label="Celular">
                  {order.phone || "—"}
                </ChannelDataField>
              </>
            ) : null}
            {order.fulfillmentType === "delivery" && order.driverName ? (
              <ChannelDataField label="Repartidor">
                {order.driverName}
              </ChannelDataField>
            ) : null}
            <ChannelDataField label="Tiempo estimado">
              {order.estimatedMinutes} min
            </ChannelDataField>
            {clientLabel ? (
              <ChannelDataField label="Cliente">{clientLabel}</ChannelDataField>
            ) : null}
            {order.notes ? (
              <ChannelDataField label="Notas">{order.notes}</ChannelDataField>
            ) : null}
            <ChannelDataField label="Pago">
              <span className={order.isPaid ? "text-emerald-700" : "text-amber-700"}>
                {order.isPaid ? "Pagado" : "Sin pagar"}
              </span>
            </ChannelDataField>
          </ChannelDataFields>
        </ChannelDataSection>

        <ChannelDataActions>
          {onCloseOrder ? (
            <>
              <ChannelDataPrimaryAction
                disabled={!canCloseOrder || busy || closeOrderLoading || order.isPaid}
                title={closeOrderBlockReason ?? undefined}
                onClick={() => void run(onCloseOrder)}
                className={cn(
                  (!canCloseOrder || order.isPaid) &&
                    "cursor-not-allowed bg-muted text-muted-foreground opacity-70 hover:bg-muted",
                )}
              >
                {closeOrderLoading ? "Cerrando…" : closeButtonLabel}
              </ChannelDataPrimaryAction>
              {!canCloseOrder && closeOrderBlockReason && !order.isPaid ? (
                <ChannelDataWarningBanner>
                  {closeOrderBlockReason}
                </ChannelDataWarningBanner>
              ) : null}
            </>
          ) : null}
          {order.status === "preparing" && order.fulfillmentType === "delivery" ? (
            <ChannelDataPrimaryAction
              disabled={busy || order.isPaid}
              onClick={() => void run(() => onMoveOrder(order.id, "dispatched"))}
            >
              Marcar enviado
            </ChannelDataPrimaryAction>
          ) : null}
          {order.status === "preparing" || order.status === "dispatched" ? (
            <ChannelDataSecondaryAction
              disabled={busy}
              onClick={() => void run(() => onMoveOrder(order.id, "delivered"))}
            >
              Marcar entregado
            </ChannelDataSecondaryAction>
          ) : null}
          {!order.isPaid && order.status !== "cancelled" ? (
            <ChannelDataSecondaryAction
              tone="destructive"
              disabled={busy || !canCancelOrder}
              title={
                !canCancelOrder
                  ? "No se puede cancelar un pedido con cobros registrados."
                  : undefined
              }
              onClick={() => void run(() => onCancelOrder(order.id))}
            >
              Cancelar pedido
            </ChannelDataSecondaryAction>
          ) : null}
        </ChannelDataActions>

        <ChannelDataHint icon={Package}>
          Usá la pestaña Carrito para cargar productos y cobrar.
        </ChannelDataHint>
      </ChannelDataPanel>
    </div>
  )
}
