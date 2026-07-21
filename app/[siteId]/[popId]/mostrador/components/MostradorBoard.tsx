"use client"

import type {
  CounterBoardTab,
  CounterOrder,
  CounterOrderStatus,
} from "@/app/[siteId]/[popId]/mostrador/mostradorTypes"
import { MESAS_FLOOR_PLAN_BG } from "@/app/[siteId]/[popId]/mesas/components/MesaFloorDecorNode"
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
import { Bike, CheckCircle2, ChefHat } from "lucide-react"
import { useMemo, useState } from "react"

const BOARD_SECTION_BG = "#20262e"

const BOARD_COLUMNS: {
  id: CounterBoardTab
  label: string
  icon: typeof ChefHat
}[] = [
  { id: "preparing", label: "Preparando", icon: ChefHat },
  { id: "dispatched", label: "Enviados", icon: Bike },
  { id: "delivered", label: "Entregados", icon: CheckCircle2 },
]

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

function orderSubtitle(order: CounterOrder): string {
  if (order.fulfillmentType === "delivery") {
    return order.phone || order.deliveryAddress || "Delivery"
  }
  return "Mostrador"
}

function canMoveOrderTo(
  order: CounterOrder,
  targetColumn: CounterBoardTab,
): boolean {
  if (order.status === targetColumn) return false
  if (targetColumn === "dispatched" && order.fulfillmentType !== "delivery") {
    return false
  }
  return true
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
          <p className="text-sm font-bold text-white">#{order.orderNumber}</p>
          <p className="text-xs text-white/60">{openedAgo}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/80">
            {order.fulfillmentType === "delivery" ? "Delivery" : "Mostrador"}
          </span>
          {showPayment ? (
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                order.isPaid
                  ? "bg-emerald-500/20 text-emerald-200"
                  : "bg-amber-500/20 text-amber-100",
              )}
            >
              {order.isPaid ? "Pagado" : "Sin pagar"}
            </span>
          ) : null}
        </div>
      </div>
      <p className="mt-2 truncate text-sm text-white/85">{orderSubtitle(order)}</p>
      <p className="mt-1 text-xs text-white/55">
        ETA {order.estimatedMinutes} min
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
        className={cn(
          "w-full cursor-grab rounded-xl border px-3 py-3 text-left transition-colors active:cursor-grabbing",
          selected
            ? "border-emerald-400/80 bg-emerald-500/15 ring-1 ring-emerald-400/40"
            : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10",
        )}
      >
        <OrderCardContent
          order={order}
          selected={selected}
          showPayment={columnId === "delivered"}
        />
      </button>
    </li>
  )
}

function KanbanColumn({
  column,
  orders,
  selectedOrderId,
  draggingOrder,
  onSelectOrder,
}: {
  column: (typeof BOARD_COLUMNS)[number]
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
      !canMoveOrderTo(draggingOrder, column.id),
  })

  const Icon = column.icon
  const canDrop =
    draggingOrder == null || canMoveOrderTo(draggingOrder, column.id)

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <div
        className="flex shrink-0 items-center gap-2 border-b border-white/10 px-3 py-3"
        style={{ backgroundColor: BOARD_SECTION_BG }}
      >
        <Icon className="size-4 text-white/70" aria-hidden />
        <h2 className="text-sm font-semibold text-white">{column.label}</h2>
        <span className="ml-auto rounded-full bg-white/10 px-2 py-0.5 text-xs font-semibold text-white/70">
          {orders.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          "min-h-0 flex-1 overflow-x-hidden overflow-y-auto p-2 transition-colors",
          isOver &&
            canDrop &&
            "bg-emerald-500/10 ring-1 ring-inset ring-emerald-400/30",
          draggingOrder && !canDrop && "opacity-60",
        )}
        style={{ backgroundColor: MESAS_FLOOR_PLAN_BG }}
      >
        {orders.length === 0 ? (
          <p className="px-2 py-8 text-center text-xs text-white/45">
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
    const targetColumn = BOARD_COLUMNS.some((c) => c.id === overId)
      ? (overId as CounterBoardTab)
      : (orders.find((o) => o.id === overId)?.status as CounterBoardTab | undefined)

    if (!targetColumn || !canMoveOrderTo(order, targetColumn)) return

    void onMoveOrder(orderId, targetColumn)
  }

  const handleDragCancel = () => {
    setDraggingOrderId(null)
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="flex min-h-0 flex-1 flex-col">
        {orderError ? (
          <p className="shrink-0 border-b border-red-500/30 bg-red-500/15 px-4 py-2 text-sm text-red-100">
            {orderError}
          </p>
        ) : null}
        {loading ? (
          <p className="px-4 py-8 text-center text-sm text-white/60">
            Cargando pedidos…
          </p>
        ) : (
          <div className="grid min-h-0 flex-1 grid-cols-3 divide-x divide-white/10 overflow-hidden">
            {BOARD_COLUMNS.map((column) => (
              <KanbanColumn
                key={column.id}
                column={column}
                orders={ordersByColumn[column.id]}
                selectedOrderId={selectedOrderId}
                draggingOrder={draggingOrder}
                onSelectOrder={onSelectOrder}
              />
            ))}
          </div>
        )}
      </div>

      <DragOverlay dropAnimation={null}>
        {draggingOrder ? (
          <div className="w-[220px] rounded-xl border border-emerald-400/50 bg-[#2a323c] px-3 py-3 shadow-xl">
            <OrderCardContent
              order={draggingOrder}
              showPayment={draggingOrder.status === "delivered"}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
