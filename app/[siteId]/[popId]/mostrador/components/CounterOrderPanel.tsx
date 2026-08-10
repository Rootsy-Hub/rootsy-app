"use client"

import { CounterOrderForm } from "@/app/[siteId]/[popId]/mostrador/components/CounterOrderForm"
import type {
  CounterOrder,
  CreateCounterOrderInput,
  UpdateCounterOrderInput,
} from "@/app/[siteId]/[popId]/mostrador/mostradorTypes"
import { DataWorkspaceTableIconAction } from "@/components/data-workspace/DataWorkspaceListTablePrimitives"
import {
  ChannelDataEmptyState,
  ChannelDataErrorBanner,
  ChannelDataField,
  ChannelDataFields,
  ChannelDataHeader,
  ChannelDataHint,
  ChannelDataOperarFooterBar,
  ChannelDataPanel,
  ChannelDataSection,
  ChannelDataStatusBadge,
  ChannelDataWarningBanner,
  type ChannelOperarFooterAction,
} from "@/components/sale-operation/ChannelOperationDataPanel"
import {
  mostradorPaymentPaidTextClass,
  mostradorPaymentUnpaidTextClass,
} from "@/app/[siteId]/[popId]/mostrador/mostradorOperarStyles"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import type { ChannelCloseMode } from "@/lib/channelCheckoutClose"
import { Monitor, Package, Pencil } from "lucide-react"
import { useEffect, useState } from "react"

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

function orderToFormInitial(order: CounterOrder): Partial<CreateCounterOrderInput> {
  return {
    fulfillmentType: order.fulfillmentType,
    deliveryAddress: order.deliveryAddress,
    phone: order.phone,
    driverName: order.driverName,
    estimatedMinutes: order.estimatedMinutes,
    notes: order.notes,
  }
}

export function CounterOrderPanel({
  order,
  orderError,
  creating,
  onCancelCreate,
  onCreateOrder,
  onUpdateOrder,
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
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    setEditing(false)
  }, [order?.id])

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
      />
    )
  }

  const canEdit = !order.isPaid && order.status !== "cancelled"

  if (editing) {
    return (
      <CounterOrderForm
        key={order.id}
        initial={orderToFormInitial(order)}
        showImmediateFulfillment={false}
        submitLabel="Guardar cambios"
        onCancel={() => setEditing(false)}
        onSubmit={async (input) => {
          const ok = await onUpdateOrder(order.id, input)
          if (ok) setEditing(false)
          return ok
        }}
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

  const footerActions: ChannelOperarFooterAction[] = []

  if (!order.isPaid && order.status !== "cancelled") {
    footerActions.push({
      variant: "discard",
      label: "Cancelar pedido",
      disabled: busy || !canCancelOrder,
      title: !canCancelOrder
        ? "No se puede cancelar un pedido con cobros registrados."
        : undefined,
      onClick: () => void run(() => onCancelOrder(order.id)),
    })
  }

  if (onCloseOrder) {
    footerActions.push({
      variant: "primary",
      label: closeOrderLoading ? "Cerrando…" : closeButtonLabel,
      disabled: !canCloseOrder || busy || closeOrderLoading || order.isPaid,
      loading: closeOrderLoading,
      loadingLabel: "Cerrando…",
      title: closeOrderBlockReason ?? undefined,
      onClick: () => void run(onCloseOrder),
    })
  } else if (
    order.status === "preparing" &&
    order.fulfillmentType === "delivery"
  ) {
    footerActions.push({
      variant: "primary",
      label: "Marcar enviado",
      disabled: busy || order.isPaid,
      onClick: () => void run(() => onMoveOrder(order.id, "dispatched")),
    })
  }

  if (order.status === "preparing" || order.status === "dispatched") {
    footerActions.push({
      variant: "secondary",
      label: "Marcar entregado",
      disabled: busy,
      onClick: () => void run(() => onMoveOrder(order.id, "delivered")),
    })
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <ChannelDataPanel className="flex-1">
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
            actions={
              canEdit ? (
                <DataWorkspaceTableIconAction
                  label="Editar pedido"
                  icon={Pencil}
                  variant="edit"
                  onClick={() => setEditing(true)}
                />
              ) : null
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
              <span
                className={
                  order.isPaid
                    ? mostradorPaymentPaidTextClass
                    : mostradorPaymentUnpaidTextClass
                }
              >
                {order.isPaid ? "Pagado" : "Sin pagar"}
              </span>
            </ChannelDataField>
          </ChannelDataFields>
        </ChannelDataSection>

        {onCloseOrder &&
        !canCloseOrder &&
        closeOrderBlockReason &&
        !order.isPaid ? (
          <ChannelDataWarningBanner>{closeOrderBlockReason}</ChannelDataWarningBanner>
        ) : null}

        <ChannelDataHint icon={Package}>
          Usá la pestaña Pedido para cargar productos y cobrar.
        </ChannelDataHint>
      </ChannelDataPanel>

      <ChannelDataOperarFooterBar actions={footerActions} />
    </div>
  )
}
