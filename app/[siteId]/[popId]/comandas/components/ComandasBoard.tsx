"use client"

import {
  canDragComanda,
  canMoveComandaTo,
  formatComandaElapsed,
  groupComandasForBoard,
} from "@/app/[siteId]/[popId]/comandas/comandasLogic"
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
  comandasBrisaTicketCardVoidClass,
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
  type ComandaBoardCard,
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
} from "lucide-react"

type BoardColumnId = Exclude<ComandaStatus, "pending" | "voided">

const BOARD_COLUMNS: {
  id: BoardColumnId
  label: string
  icon: typeof ChefHat
}[] = [
  { id: "sent", label: COMANDA_STATUS_LABELS.sent, icon: ClipboardList },
  { id: "preparing", label: COMANDA_STATUS_LABELS.preparing, icon: CookingPot },
  { id: "ready", label: COMANDA_STATUS_LABELS.ready, icon: ChefHat },
  { id: "delivered", label: COMANDA_STATUS_LABELS.delivered, icon: CheckCircle2 },
]

const EMPTY_COPY: Record<(typeof BOARD_COLUMNS)[number]["id"], string> = {
  sent: "Nada en comanda",
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

function ticketAgo(card: Pick<ComandaBoardCard, "statusChangedAt" | "createdAt">): string {
  return formatComandaElapsed(card.statusChangedAt || card.createdAt)
}

function ticketAgoLabel(
  card: Pick<ComandaBoardCard, "statusChangedAt" | "createdAt">,
): string {
  return formatDistanceToNow(new Date(card.statusChangedAt || card.createdAt), {
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
      className={comandasBrisaColumnHeaderClass(column.id)}
      aria-label={`${column.label}. ${countLabel}`}
    >
      <column.icon className={comandasBrisaColumnIconClass(column.id)} aria-hidden />
      <h2 className={cn("min-w-0 flex-1 truncate", comandasBrisaColumnTitleClass(column.id))}>
        {column.label}
      </h2>
      <span
        className={cn(
          comandasBrisaCountPillClass(column.id),
          String(count).length > 1 && comandasBrisaCountPillWideClass,
        )}
        aria-label={countLabel}
      >
        {count}
      </span>
    </div>
  )
}

function TicketCardContent({ card }: { card: ComandaBoardCard }) {
  return (
    <>
      <div className={comandasBrisaTicketHeaderClass}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className={cn(comandasBrisaTicketEyebrowClass, "truncate")}>
              {card.sendKind === "void"
                ? "Anulación"
                : card.sourceKind === "table"
                  ? "Mesa"
                  : "Mostrador"}
            </p>
            <p className={cn("mt-0.5 truncate", comandasBrisaTicketTitleClass)}>
              {card.originLabel}
            </p>
          </div>
          <span
            className={cn(comandasBrisaTicketBadgeClass, "shrink-0 tabular-nums")}
            title={ticketAgoLabel(card)}
            aria-label={ticketAgoLabel(card)}
          >
            {ticketAgo(card)}
          </span>
        </div>
      </div>
      <div className={comandasBrisaTicketBodyClass}>
        <ul className="space-y-1.5">
          {card.items.map((item) => {
            const qtyLabel = item.quantity > 1 ? `${item.quantity}× ` : ""
            return (
              <li key={item.id}>
                <p
                  className={cn(
                    "truncate",
                    comandasBrisaTicketMetaClass,
                    card.sendKind === "void" && "text-[var(--rootsy-danger-dark)]",
                  )}
                >
                  {card.sendKind === "void" ? "Anular " : ""}
                  {qtyLabel}
                  {item.recipeName}
                </p>
                {item.comment ? (
                  <p className={cn("mt-0.5 line-clamp-2", comandasBrisaTicketDetailClass)}>
                    {item.comment}
                  </p>
                ) : null}
              </li>
            )
          })}
        </ul>
        {card.customerName ? (
          <p className={cn("mt-2", comandasBrisaTicketDetailClass)}>
            {card.customerName}
          </p>
        ) : null}
        {card.sendComment ? (
          <p className={cn("mt-1 line-clamp-3", comandasBrisaTicketDetailClass)}>
            {card.sendComment}
          </p>
        ) : null}
      </div>
    </>
  )
}

function KanbanTicketCard({
  card,
  canUpdate,
}: {
  card: ComandaBoardCard
  canUpdate: boolean
}) {
  const draggable = canUpdate && canDragComanda(card.status)
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: card.id,
      data: { card },
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
          card.sendKind === "void" && comandasBrisaTicketCardVoidClass,
          !draggable && comandasBrisaTicketCardIdleClass,
        )}
      >
        <TicketCardContent card={card} />
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
  tickets: ComandaBoardCard[]
  canUpdate: boolean
  draggingTicket: ComandaBoardCard | null
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
          {tickets.map((card) => (
            <KanbanTicketCard
              key={card.id}
              card={card}
              canUpdate={canUpdate}
            />
          ))}
        </ul>
      )}
    </div>
  )
}

export function ComandasBoardSkeleton() {
  return (
    <div className={comandasBrisaBoardShellClass} aria-hidden>
      <div className={comandasBrisaHeaderRowClass}>
        {BOARD_COLUMNS.map((column) => (
          <div key={column.id} className={comandasBrisaColumnHeaderClass(column.id)}>
            <span className={cn(comandasBrisaSkeletonBarClass, "relative z-1 h-3 w-24")} />
            <span className={cn(comandasBrisaSkeletonBoxClass, "relative z-1 ml-auto size-5 rounded-full")} />
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

  const cards = useMemo(() => groupComandasForBoard(tickets), [tickets])

  const ticketsByColumn = useMemo(() => {
    const grouped: Record<BoardColumnId, ComandaBoardCard[]> = {
      sent: [],
      preparing: [],
      ready: [],
      delivered: [],
    }
    for (const card of cards) {
      if (card.status === "pending" || card.status === "voided") continue
      grouped[card.status].push(card)
    }
    return grouped
  }, [cards])

  const draggingTicket = useMemo(
    () => cards.find((card) => card.id === draggingTicketId) ?? null,
    [cards, draggingTicketId],
  )

  const handleDragStart = (event: DragStartEvent) => {
    setDraggingTicketId(String(event.active.id))
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setDraggingTicketId(null)
    const { active, over } = event
    if (!over) return
    const card = cards.find((row) => row.id === String(active.id))
    if (!card || !canDragComanda(card.status)) return

    const overId = String(over.id)
    const targetColumn = COMANDA_BOARD_COLUMNS.includes(overId as ComandaStatus)
      ? (overId as ComandaStatus)
      : cards.find((row) => row.id === overId)?.status

    if (!targetColumn || !canMoveComandaTo(card.status, targetColumn)) return
    void onMoveTicket(card.primaryItemId, targetColumn)
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
          <div
            className={cn(
              comandasBrisaTicketOverlayClass,
              draggingTicket.sendKind === "void" && comandasBrisaTicketCardVoidClass,
            )}
          >
            <TicketCardContent card={draggingTicket} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
