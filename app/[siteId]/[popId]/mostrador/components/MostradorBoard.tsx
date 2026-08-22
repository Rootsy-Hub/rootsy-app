"use client"

import type {
  CounterBoardTab,
  CounterOrder,
  CounterOrderStatus,
} from "@/app/[siteId]/[popId]/mostrador/mostradorTypes"
import {
  canMoveMostradorOrderTo,
  MOSTRADOR_BOARD_COLUMNS,
  mostradorOrderSubtitle,
} from "@/app/[siteId]/[popId]/mostrador/mostradorBoardModel"
import { MostradorMobileBoard } from "@/app/[siteId]/[popId]/mostrador/components/MostradorMobileBoard"
import {
  mostradorBoardColumnBodyBg,
  mostradorEmptyTextClass,
  mostradorErrorBannerClass,
  mostradorOrderDetailClass,
  mostradorOrderMetaClass,
  mostradorOrderNumberClass,
  mostradorOrderSubtitleClass,
} from "@/app/[siteId]/[popId]/mostrador/mostradorOperarStyles"
import {
  mostradorBoardDropZoneClass,
  mostradorFulfillmentBadgeClass,
  mostradorOrderCardClass,
  mostradorOrderDragOverlayClass,
  mostradorPaymentBadgeClass,
} from "@/app/[siteId]/[popId]/mostrador/mostradorOrderStyles"
import {
  OperarCanvasToolbarColumnHeader,
  OperarCanvasToolbarColumnHeaderRow,
} from "@/components/sale-operation/OperarCanvasToolbar"
import { MostradorBoardSkeleton } from "@/components/sale-operation/OperarChannelCanvasSkeletons"
import { cn } from "@/lib/utils"
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
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

function OrderCardContent({
  order,
  selected,
  showPayment,
}: {
  order: CounterOrder
  selected?: boolean
  showPayment?: boolean
}) {
  const openedAgo = formatDistanceToNow(new Date(order.openedAt), {
    addSuffix: true,
    locale: es,
  })

  return (
    <>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className={mostradorOrderNumberClass}>#{order.orderNumber}</p>
          <p className={mostradorOrderMetaClass}>{openedAgo}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={mostradorFulfillmentBadgeClass()}>
            {order.fulfillmentType === "delivery" ? "Delivery" : "Mostrador"}
          </span>
          {showPayment ? (
            <span className={mostradorPaymentBadgeClass(order.isPaid)}>
              {order.isPaid ? "Pagado" : "Sin pagar"}
            </span>
          ) : null}
        </div>
      </div>
      <p className={cn("mt-2", mostradorOrderSubtitleClass)}>
        {mostradorOrderSubtitle(order)}
      </p>
      <p className={cn("mt-1", mostradorOrderDetailClass)}>
        Listo en {order.estimatedMinutes} min
        {order.fulfillmentType === "delivery" && order.driverName
          ? ` · ${order.driverName}`
          : ""}
      </p>
      {selected ? (
        <span className="sr-only">Pedido seleccionado</span>
      ) : null}
    </>
  )
}

function KanbanOrderCard({
  order,
  selected,
  columnId,
  onSelect,
}: {
  order: CounterOrder
  selected: boolean
  columnId: CounterBoardTab
  onSelect: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: order.id,
      data: { order, columnId },
    })

  const style =
    transform && !isDragging
      ? { transform: CSS.Translate.toString(transform) }
      : undefined

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn(isDragging && "opacity-30")}
    >
      <button
        type="button"
        onClick={onSelect}
        {...listeners}
        {...attributes}
        className={mostradorOrderCardClass({ selected })}
      >
        <OrderCardContent
          order={order}
          selected={selected}
          showPayment
        />
      </button>
    </li>
  )
}

function KanbanColumnBody({
  column,
  orders,
  selectedOrderId,
  draggingOrder,
  onSelectOrder,
}: {
  column: (typeof MOSTRADOR_BOARD_COLUMNS)[number]
  orders: CounterOrder[]
  selectedOrderId: string | null
  draggingOrder: CounterOrder | null
  onSelectOrder: (orderId: string) => void
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: { columnId: column.id },
    disabled:
      draggingOrder != null &&
      !canMoveMostradorOrderTo(draggingOrder, column.id),
  })

  const canDrop =
    draggingOrder == null || canMoveMostradorOrderTo(draggingOrder, column.id)

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <div
        ref={setNodeRef}
        className={mostradorBoardDropZoneClass({
          isOver,
          canDrop,
          dragging: draggingOrder != null,
        })}
        style={{ backgroundColor: mostradorBoardColumnBodyBg }}
      >
        {orders.length === 0 ? (
          <p className={cn("px-2 py-8 text-center text-xs", mostradorEmptyTextClass)}>
            Sin pedidos
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {orders.map((order) => (
              <KanbanOrderCard
                key={order.id}
                order={order}
                columnId={column.id}
                selected={selectedOrderId === order.id}
                onSelect={() => onSelectOrder(order.id)}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export function MostradorBoard({
  orders,
  loading,
  orderError,
  selectedOrderId,
  onSelectOrder,
  onMoveOrder,
}: Props) {
  const [draggingOrderId, setDraggingOrderId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  )

  const ordersByColumn = useMemo(() => {
    const grouped: Record<CounterBoardTab, CounterOrder[]> = {
      preparing: [],
      dispatched: [],
      delivered: [],
    }
    for (const order of orders) {
      if (order.status in grouped) {
        grouped[order.status as CounterBoardTab].push(order)
      }
    }
    return grouped
  }, [orders])

  const draggingOrder = useMemo(
    () => orders.find((o) => o.id === draggingOrderId) ?? null,
    [orders, draggingOrderId],
  )

  const handleDragStart = (event: DragStartEvent) => {
    setDraggingOrderId(String(event.active.id))
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setDraggingOrderId(null)
    const { active, over } = event
    if (!over) return

    const orderId = String(active.id)
    const order = orders.find((o) => o.id === orderId)
    if (!order) return

    const overId = String(over.id)
    const targetColumn = MOSTRADOR_BOARD_COLUMNS.some((c) => c.id === overId)
      ? (overId as CounterBoardTab)
      : (orders.find((o) => o.id === overId)?.status as CounterBoardTab | undefined)

    if (!targetColumn || !canMoveMostradorOrderTo(order, targetColumn)) return

    void onMoveOrder(orderId, targetColumn)
  }

  const handleDragCancel = () => {
    setDraggingOrderId(null)
  }

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col md:hidden">
        <MostradorMobileBoard
          orders={orders}
          loading={loading}
          orderError={orderError}
          selectedOrderId={selectedOrderId}
          onSelectOrder={onSelectOrder}
          onMoveOrder={onMoveOrder}
        />
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="hidden min-h-0 flex-1 flex-col md:flex">
          {orderError ? (
            <p className={cn("shrink-0", mostradorErrorBannerClass)}>{orderError}</p>
          ) : null}
          {loading ? (
            <MostradorBoardSkeleton />
          ) : (
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <OperarCanvasToolbarColumnHeaderRow>
                {MOSTRADOR_BOARD_COLUMNS.map((column) => (
                  <OperarCanvasToolbarColumnHeader
                    key={column.id}
                    icon={column.icon}
                    label={column.label}
                    count={ordersByColumn[column.id].length}
                  />
                ))}
              </OperarCanvasToolbarColumnHeaderRow>
              <div
                className={cn(
                  "grid min-h-0 flex-1 grid-cols-3 overflow-hidden",
                  "divide-x divide-[var(--layouts-operar-border-dark-hairline)]",
                )}
              >
                {MOSTRADOR_BOARD_COLUMNS.map((column) => (
                  <div
                    key={column.id}
                    className="flex min-h-0 min-w-0 flex-col"
                  >
                    <KanbanColumnBody
                      column={column}
                      orders={ordersByColumn[column.id]}
                      selectedOrderId={selectedOrderId}
                      draggingOrder={draggingOrder}
                      onSelectOrder={onSelectOrder}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DragOverlay dropAnimation={null}>
          {draggingOrder ? (
            <div className={mostradorOrderDragOverlayClass()}>
              <OrderCardContent
                order={draggingOrder}
                showPayment
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </>
  )
}
