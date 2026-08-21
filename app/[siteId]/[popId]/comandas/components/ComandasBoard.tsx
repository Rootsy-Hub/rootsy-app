"use client"

import { canDragComanda, canMoveComandaTo } from "@/app/[siteId]/[popId]/comandas/comandasLogic"
import {
  comandasBrisaBoardShellClass,
  comandasBrisaBodyRowClass,
  comandasBrisaColumnHeaderClass,
  comandasBrisaColumnIconClass,
  comandasBrisaColumnTitleClass,
  comandasBrisaCountPillClass,
  comandasBrisaCountPillWideClass,
  comandasBrisaDropZoneBlockedClass,
  comandasBrisaDropZoneClass,
  comandasBrisaDropZoneOverClass,
  comandasBrisaHeaderRowClass,
  comandasBrisaSkeletonBarClass,
  comandasBrisaSkeletonBoxClass,
  comandasBrisaTicketBadgeClass,
  comandasBrisaTicketBodyClass,
  comandasBrisaTicketCardClass,
  comandasBrisaTicketCardIdleClass,
  comandasBrisaTicketDetailClass,
  comandasBrisaTicketEyebrowClass,
  comandasBrisaTicketHeaderClass,
  comandasBrisaTicketListClass,
  comandasBrisaTicketMetaClass,
  comandasBrisaTicketOverlayClass,
  comandasBrisaTicketTitleClass,
} from "@/app/[siteId]/[popId]/comandas/comandasBrisaStyles"
import {
  COMANDA_BOARD_COLUMNS,
  COMANDA_STATUS_LABELS,
  type ComandaStatus,
  type ComandaTicket,
} from "@/app/[siteId]/[popId]/comandas/comandasTypes"
import { DataWorkspaceDetailEmptyState } from "@/components/data-workspace/DataWorkspaceDetailEmptyState"
import { RootsBanner } from "@/components/rootsy-banner"
import { cn } from "@/lib/utils"
import { useMemo, useState } from "react"
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
import {
  CheckCircle2,
  ChefHat,
  ClipboardList,
  CookingPot,
  UtensilsCrossed,
} from "lucide-react"

const BOARD_COLUMNS: {
  id: ComandaStatus
  label: string
  icon: typeof ChefHat
}[] = [
  { id: "sent", label: COMANDA_STATUS_LABELS.sent, icon: ClipboardList },
  { id: "preparing", label: COMANDA_STATUS_LABELS.preparing, icon: CookingPot },
  { id: "ready", label: COMANDA_STATUS_LABELS.ready, icon: ChefHat },
  { id: "delivered", label: COMANDA_STATUS_LABELS.delivered, icon: CheckCircle2 },
]

const EMPTY_COPY: Record<(typeof BOARD_COLUMNS)[number]["id"], string> = {
  sent: "Nada comandado",
  preparing: "Nada en preparación",
  ready: "Nada listo",
  delivered: "Nada entregado",
}

type Props = {
  tickets: ComandaTicket[]
  loading: boolean
  error?: string | null
  canUpdate: boolean
  onMoveTicket: (
    ticketId: string,
    status: ComandaStatus,
  ) => Promise<boolean> | boolean
}

function ticketAgo(ticket: ComandaTicket): string {
  return formatDistanceToNow(new Date(ticket.statusChangedAt || ticket.createdAt), {
    addSuffix: true,
    locale: es,
  })
}

function ColumnHeader({
  column,
  count,
}: {
  column: (typeof BOARD_COLUMNS)[number]
  count: number
}) {
  const countLabel = `${count} comanda${count === 1 ? "" : "s"}`

  return (
    <div
      className={comandasBrisaColumnHeaderClass}
      aria-label={`${column.label}. ${countLabel}`}
    >
      <column.icon className={comandasBrisaColumnIconClass} aria-hidden />
      <h2 className={cn("min-w-0 flex-1 truncate", comandasBrisaColumnTitleClass)}>
        {column.label}
      </h2>
      <span
        className={cn(
          comandasBrisaCountPillClass,
          String(count).length > 1 && comandasBrisaCountPillWideClass,
        )}
        aria-label={countLabel}
      >
        {count}
      </span>
    </div>
  )
}

function TicketCardContent({ ticket }: { ticket: ComandaTicket }) {
  const qtyLabel = ticket.quantity > 1 ? `${ticket.quantity}× ` : ""

  return (
    <>
      <div className={comandasBrisaTicketHeaderClass}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className={cn(comandasBrisaTicketEyebrowClass, "truncate")}>
              {ticket.sourceKind === "table" ? "Mesa" : "Mostrador"}
            </p>
            <p className={cn("mt-0.5 truncate", comandasBrisaTicketTitleClass)}>
              {qtyLabel}
              {ticket.recipeName}
            </p>
          </div>
          <span className={cn(comandasBrisaTicketBadgeClass, "shrink-0")}>
            {ticketAgo(ticket)}
          </span>
        </div>
      </div>
      <div className={comandasBrisaTicketBodyClass}>
        <p className={cn("flex items-center gap-1.5", comandasBrisaTicketMetaClass)}>
          <UtensilsCrossed className="size-3.5 shrink-0" aria-hidden />
          <span className="truncate">{ticket.originLabel}</span>
        </p>
        {ticket.customerName ? (
          <p className={cn("mt-2", comandasBrisaTicketDetailClass)}>
            {ticket.customerName}
          </p>
        ) : null}
        {ticket.comment ? (
          <p className={cn("mt-1 line-clamp-3", comandasBrisaTicketDetailClass)}>
            {ticket.comment}
          </p>
        ) : null}
      </div>
    </>
  )
}

function KanbanTicketCard({
  ticket,
  canUpdate,
}: {
  ticket: ComandaTicket
  canUpdate: boolean
}) {
  const draggable = canUpdate && canDragComanda(ticket.status)
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: ticket.id,
      data: { ticket },
      disabled: !draggable,
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
      <article
        {...(draggable ? listeners : {})}
        {...(draggable ? attributes : {})}
        className={cn(
          comandasBrisaTicketCardClass,
          !draggable && comandasBrisaTicketCardIdleClass,
        )}
      >
        <TicketCardContent ticket={ticket} />
      </article>
    </li>
  )
}

function KanbanColumnBody({
  column,
  tickets,
  canUpdate,
  draggingTicket,
}: {
  column: (typeof BOARD_COLUMNS)[number]
  tickets: ComandaTicket[]
  canUpdate: boolean
  draggingTicket: ComandaTicket | null
}) {
  const dropDisabled =
    draggingTicket != null &&
    !canMoveComandaTo(draggingTicket.status, column.id)

  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: { columnId: column.id },
    disabled: dropDisabled,
  })

  const canDrop =
    draggingTicket == null || canMoveComandaTo(draggingTicket.status, column.id)

  return (
    <div
      ref={setNodeRef}
      className={cn(
        comandasBrisaDropZoneClass,
        isOver && canDrop && comandasBrisaDropZoneOverClass,
        draggingTicket != null && !canDrop && comandasBrisaDropZoneBlockedClass,
      )}
    >
      {tickets.length === 0 ? (
        <DataWorkspaceDetailEmptyState
          icon={column.icon}
          title={EMPTY_COPY[column.id]}
          className="py-10"
        />
      ) : (
        <ul className={comandasBrisaTicketListClass}>
          {tickets.map((ticket) => (
            <KanbanTicketCard
              key={ticket.id}
              ticket={ticket}
              canUpdate={canUpdate}
            />
          ))}
        </ul>
      )}
    </div>
  )
}

function ComandasBoardSkeleton() {
  return (
    <div className={comandasBrisaBoardShellClass} aria-hidden>
      <div className={comandasBrisaHeaderRowClass}>
        {BOARD_COLUMNS.map((column) => (
          <div key={column.id} className={comandasBrisaColumnHeaderClass}>
            <span className={cn(comandasBrisaSkeletonBarClass, "h-3 w-24")} />
            <span className={cn(comandasBrisaSkeletonBoxClass, "ml-auto size-5 rounded-full")} />
          </div>
        ))}
      </div>
      <div className={comandasBrisaBodyRowClass}>
        {BOARD_COLUMNS.map((column) => (
          <div key={column.id} className="flex flex-col gap-4 p-4">
            <span className={cn(comandasBrisaSkeletonBoxClass, "h-36 w-full rounded-[1.375rem]")} />
            <span className={cn(comandasBrisaSkeletonBoxClass, "h-28 w-full rounded-[1.375rem]")} />
          </div>
        ))}
      </div>
    </div>
  )
}

export function ComandasBoard({
  tickets,
  loading,
  error,
  canUpdate,
  onMoveTicket,
}: Props) {
  const [draggingTicketId, setDraggingTicketId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  )

  const ticketsByColumn = useMemo(() => {
    const grouped: Record<(typeof BOARD_COLUMNS)[number]["id"], ComandaTicket[]> = {
      sent: [],
      preparing: [],
      ready: [],
      delivered: [],
    }
    for (const ticket of tickets) {
      if (ticket.status === "pending") continue
      grouped[ticket.status].push(ticket)
    }
    return grouped
  }, [tickets])

  const draggingTicket = useMemo(
    () => tickets.find((ticket) => ticket.id === draggingTicketId) ?? null,
    [tickets, draggingTicketId],
  )

  const handleDragStart = (event: DragStartEvent) => {
    setDraggingTicketId(String(event.active.id))
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setDraggingTicketId(null)
    const { active, over } = event
    if (!over) return
    const ticket = tickets.find((row) => row.id === String(active.id))
    if (!ticket || !canDragComanda(ticket.status)) return

    const overId = String(over.id)
    const targetColumn = COMANDA_BOARD_COLUMNS.includes(overId as ComandaStatus)
      ? (overId as ComandaStatus)
      : tickets.find((row) => row.id === overId)?.status

    if (!targetColumn || !canMoveComandaTo(ticket.status, targetColumn)) return
    void onMoveTicket(ticket.id, targetColumn)
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setDraggingTicketId(null)}
    >
      <div className={comandasBrisaBoardShellClass}>
        {error ? (
          <div className="shrink-0 px-4 pt-3 sm:px-6">
            <RootsBanner intent="danger" layout="message" message={error} />
          </div>
        ) : null}
        {loading ? (
          <ComandasBoardSkeleton />
        ) : (
          <>
            <div className={comandasBrisaHeaderRowClass}>
              {BOARD_COLUMNS.map((column) => (
                <ColumnHeader
                  key={column.id}
                  column={column}
                  count={ticketsByColumn[column.id].length}
                />
              ))}
            </div>
            <div className={comandasBrisaBodyRowClass}>
              {BOARD_COLUMNS.map((column) => (
                <KanbanColumnBody
                  key={column.id}
                  column={column}
                  tickets={ticketsByColumn[column.id]}
                  canUpdate={canUpdate}
                  draggingTicket={draggingTicket}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <DragOverlay dropAnimation={null}>
        {draggingTicket ? (
          <div className={comandasBrisaTicketOverlayClass}>
            <TicketCardContent ticket={draggingTicket} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
