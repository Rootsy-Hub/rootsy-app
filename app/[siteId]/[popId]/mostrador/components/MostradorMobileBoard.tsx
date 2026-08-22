"use client"

import type {
  CounterBoardTab,
  CounterOrder,
  CounterOrderStatus,
} from "@/app/[siteId]/[popId]/mostrador/mostradorTypes"
import {
  MOSTRADOR_BOARD_COLUMNS,
  mostradorMoveTargets,
  mostradorOrderSubtitle,
} from "@/app/[siteId]/[popId]/mostrador/mostradorBoardModel"
import {
  mostradorEmptyTextClass,
  mostradorErrorBannerClass,
  mostradorOrderDetailClass,
  mostradorOrderMetaClass,
  mostradorOrderNumberClass,
  mostradorOrderSubtitleClass,
} from "@/app/[siteId]/[popId]/mostrador/mostradorOperarStyles"
import {
  mostradorFulfillmentBadgeClass,
  mostradorOrderCardClass,
  mostradorPaymentBadgeClass,
} from "@/app/[siteId]/[popId]/mostrador/mostradorOrderStyles"
import {
  layoutsOperarCatalogToolbarControlFocusClass,
  layoutsOperarCatalogToolbarControlShellClass,
} from "@/app/library/layouts/layoutsOperarStyles"
import {
  RootsAlertDialogContent,
  RootsAlertDialogFooter,
  RootsAlertDialogPanel,
} from "@/components/rootsy-dialog/RootsAlertDialog"
import { AlertDialog } from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { useMemo, useState } from "react"

type Props = {
  orders: CounterOrder[]
  loading: boolean
  orderError?: string | null
  selectedOrderId: string | null
  onSelectOrder: (orderId: string) => void
  onMoveOrder: (
    orderId: string,
    status: CounterOrderStatus,
  ) => Promise<boolean> | boolean
}

function StatusTab({
  label,
  selected,
  onClick,
}: {
  label: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={(event) => {
        onClick()
        event.currentTarget.blur()
      }}
      className={cn(
        layoutsOperarCatalogToolbarControlShellClass,
        layoutsOperarCatalogToolbarControlFocusClass,
        "inline-flex h-10 max-h-10 min-w-0 flex-1 items-center justify-center px-2",
        "text-xs font-medium",
        selected
          ? "text-[var(--rootsy-bruma-50)]"
          : "text-[var(--rootsy-sombra-300)]",
        "hover:!border-[var(--layouts-operar-border-dark-hairline)] hover:!bg-transparent",
        "focus:!border-[var(--layouts-operar-border-dark-hairline)] focus:!bg-transparent",
        "focus-visible:!border-[var(--layouts-operar-border-dark-hairline)] focus-visible:!bg-transparent",
        "active:!bg-transparent",
      )}
    >
      {label}
    </button>
  )
}

export function MostradorMobileBoard({
  orders,
  loading,
  orderError,
  selectedOrderId,
  onSelectOrder,
  onMoveOrder,
}: Props) {
  const [status, setStatus] = useState<CounterBoardTab>("preparing")
  const [pendingMove, setPendingMove] = useState<{
    order: CounterOrder
    target: (typeof MOSTRADOR_BOARD_COLUMNS)[number]
  } | null>(null)
  const [moving, setMoving] = useState(false)

  const visibleOrders = useMemo(
    () => orders.filter((order) => order.status === status),
    [orders, status],
  )

  const confirmMove = async () => {
    if (!pendingMove) return
    setMoving(true)
    try {
      await onMoveOrder(pendingMove.order.id, pendingMove.target.id)
      setPendingMove(null)
    } finally {
      setMoving(false)
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {orderError ? (
        <p className={cn("shrink-0", mostradorErrorBannerClass)}>{orderError}</p>
      ) : null}

      <div
        className={cn(
          "flex min-w-0 shrink-0 items-center gap-2 px-4 py-2",
          "bg-[var(--rootsy-sombra-700)]",
          "border-b border-[var(--layouts-operar-border-dark-hairline)]",
        )}
        role="tablist"
        aria-label="Estados del mostrador"
      >
        {MOSTRADOR_BOARD_COLUMNS.map((column) => (
          <StatusTab
            key={column.id}
            label={column.label}
            selected={status === column.id}
            onClick={() => setStatus(column.id)}
          />
        ))}
      </div>

      {loading ? (
        <MostradorMobileBoardSkeleton />
      ) : visibleOrders.length === 0 ? (
        <p className={cn("px-4 py-10 text-center text-sm", mostradorEmptyTextClass)}>
          Sin pedidos
        </p>
      ) : (
        <ul className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
          {visibleOrders.map((order) => {
            const openedAgo = formatDistanceToNow(new Date(order.openedAt), {
              addSuffix: true,
              locale: es,
            })
            const targets = mostradorMoveTargets(order)

            return (
              <li key={order.id}>
                <div
                  className={cn(
                    mostradorOrderCardClass({
                      selected: selectedOrderId === order.id,
                      draggable: false,
                    }),
                    "relative",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => onSelectOrder(order.id)}
                    className="absolute inset-0 z-0"
                    aria-label={`Abrir pedido #${order.orderNumber}`}
                  />
                  <div className="pointer-events-none relative">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className={mostradorOrderNumberClass}>
                          #{order.orderNumber}
                        </p>
                        <p className={mostradorOrderMetaClass}>{openedAgo}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={mostradorFulfillmentBadgeClass()}>
                          {order.fulfillmentType === "delivery"
                            ? "Delivery"
                            : "Mostrador"}
                        </span>
                        <span className={mostradorPaymentBadgeClass(order.isPaid)}>
                          {order.isPaid ? "Pagado" : "Sin pagar"}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 flex items-end justify-between gap-2">
                      <div className="min-w-0">
                        <p className={mostradorOrderSubtitleClass}>
                          {mostradorOrderSubtitle(order)}
                        </p>
                        <p className={cn("mt-1", mostradorOrderDetailClass)}>
                          Listo en {order.estimatedMinutes} min
                          {order.fulfillmentType === "delivery" && order.driverName
                            ? ` · ${order.driverName}`
                            : ""}
                        </p>
                      </div>
                      {targets.length > 0 ? (
                        <div className="pointer-events-auto relative z-10 flex shrink-0 items-center gap-1.5">
                          {targets.map((target) => {
                            const Icon = target.icon
                            return (
                              <button
                                key={target.id}
                                type="button"
                                aria-label={`Mover a ${target.label}`}
                                onClick={() => setPendingMove({ order, target })}
                                className={cn(
                                  "inline-flex size-9 items-center justify-center rounded-lg",
                                  "bg-[color-mix(in_srgb,var(--rootsy-savia-400)_18%,var(--rootsy-sombra-800))]",
                                  "text-[var(--rootsy-savia-400)]",
                                  "ring-1 ring-[color-mix(in_srgb,var(--rootsy-savia-400)_34%,transparent)]",
                                )}
                              >
                                <Icon className="size-4" aria-hidden />
                              </button>
                            )
                          })}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <AlertDialog
        open={pendingMove != null}
        onOpenChange={(open) => {
          if (!open && !moving) setPendingMove(null)
        }}
      >
        <RootsAlertDialogContent>
          <RootsAlertDialogPanel
            title="Mover pedido"
            description={
              pendingMove
                ? `¿Pasar el pedido #${pendingMove.order.orderNumber} a ${pendingMove.target.label.toLowerCase()}?`
                : undefined
            }
          />
          <RootsAlertDialogFooter
            cancelLabel="Cancelar"
            confirmLabel={moving ? "Moviendo…" : "Mover"}
            confirmDisabled={moving}
            cancelDisabled={moving}
            onCancel={() => setPendingMove(null)}
            onConfirm={() => void confirmMove()}
          />
        </RootsAlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function MostradorMobileBoardSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Cargando pedidos"
      className="min-h-0 flex-1 space-y-2 overflow-hidden p-3"
    >
      {Array.from({ length: 3 }, (_, index) => (
        <div
          key={index}
          className="h-28 animate-pulse rounded-2xl bg-[color-mix(in_srgb,var(--rootsy-sombra-600)_14%,var(--rootsy-sombra-800))]"
        />
      ))}
      <span className="sr-only">Cargando pedidos…</span>
    </div>
  )
}
