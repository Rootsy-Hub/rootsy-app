"use client"

import {
  canAckComandaVoid,
  canDragComanda,
  canMoveComandaTo,
  groupComandasForBoard,
} from "@/app/[siteId]/[popId]/comandas/comandasLogic"
import {
  comandasBrisaBoardIdentityClass,
  comandasBrisaBoardIdentityCopyClass,
  comandasBrisaBoardIdentityEyebrowClass,
  comandasBrisaBoardIdentityTitleClass,
  comandasBrisaBoardShellClass,
  comandasBrisaBodyRowClass,
  comandasBrisaColumnBodyClass,
  comandasBrisaColumnHeaderClass,
  comandasBrisaColumnIconClass,
  comandasBrisaColumnTitleClass,
  comandasBrisaDropZoneBlockedClass,
  comandasBrisaDropZoneClass,
  comandasBrisaDropZoneOverClass,
  comandasBrisaHeaderRowClass,
  comandasBrisaSkeletonBarClass,
  comandasBrisaSkeletonBoxClass,
  comandasBrisaTicketCardClass,
  comandasBrisaTicketCardIdleClass,
  comandasBrisaTicketCardVoidClass,
  comandasBrisaTicketListClass,
  comandasBrisaTicketOverlayClass,
  comandasBrisaTicketVoidActionClass,
} from "@/app/[siteId]/[popId]/comandas/comandasBrisaStyles"
import {
  COMANDA_BOARD_COLUMNS,
  COMANDA_STATUS_LABELS,
  type ComandaBoardCard,
  type ComandaStatus,
  type ComandaTicket,
} from "@/app/[siteId]/[popId]/comandas/comandasTypes"
import { comandaStatusPillVariant } from "@/app/[siteId]/[popId]/comandas/comandaStatusWorlds"
import { DataWorkspaceDetailEmptyState } from "@/components/data-workspace/DataWorkspaceDetailEmptyState"
import { RootsBanner } from "@/components/rootsy-banner"
import { ComandaTicketCardBody } from "@/app/[siteId]/[popId]/comandas/components/ComandaTicketCardBody"
import { ComandasDeliveredHistoryDialog } from "@/app/[siteId]/[popId]/comandas/components/ComandasDeliveredHistoryDialog"
import { RootsDefaultButton, RootsIconButton, RootsPrimaryButton } from "@/components/rootsy-button"
import { RootsNaturePill } from "@/components/rootsy-pill/RootsNaturePill"
import { cn } from "@/lib/utils"
import { useCallback, useEffect, useMemo, useState } from "react"
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
import {
  CheckCircle2,
  ChefHat,
  ClipboardList,
  CookingPot,
  Minimize2,
} from "lucide-react"

function useDocumentFullscreen() {
  const [active, setActive] = useState(false)

  useEffect(() => {
    const sync = () => setActive(Boolean(document.fullscreenElement))
    sync()
    document.addEventListener("fullscreenchange", sync)
    return () => document.removeEventListener("fullscreenchange", sync)
  }, [])

  const exit = useCallback(async () => {
    if (!document.fullscreenElement) return
    try {
      await document.exitFullscreen()
    } catch {
      setActive(Boolean(document.fullscreenElement))
    }
  }, [])

  return { active, exit }
}

function BoardExitFullscreenButton({
  onExit,
}: {
  onExit: () => void
}) {
  return (
    <RootsIconButton
      theme="workspace"
      emphasis="ghost"
      size="default"
      label="Salir de pantalla completa"
      onClick={onExit}
    >
      <Minimize2 aria-hidden />
    </RootsIconButton>
  )
}

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
  stationName?: string
  boardClock?: number
  onMoveTicket: (
    ticketId: string,
    status: ComandaStatus,
  ) => Promise<boolean> | boolean
}

function BoardIdentity({
  stationName,
  showExitFullscreen,
  onExitFullscreen,
  onOpenDeliveredHistory,
}: {
  stationName: string
  showExitFullscreen?: boolean
  onExitFullscreen?: () => void
  onOpenDeliveredHistory: () => void
}) {
  return (
    <div className={comandasBrisaBoardIdentityClass}>
      <div className={comandasBrisaBoardIdentityCopyClass}>
        <p className={comandasBrisaBoardIdentityEyebrowClass}>Comandas</p>
        <h1 className={comandasBrisaBoardIdentityTitleClass}>{stationName}</h1>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <RootsDefaultButton
          size="compact"
          icon={CheckCircle2}
          onClick={onOpenDeliveredHistory}
        >
          Entregados
        </RootsDefaultButton>
        {showExitFullscreen && onExitFullscreen ? (
          <BoardExitFullscreenButton onExit={onExitFullscreen} />
        ) : null}
      </div>
    </div>
  )
}

function BoardIdentitySkeleton({
  showExitFullscreen,
  onExitFullscreen,
}: {
  showExitFullscreen?: boolean
  onExitFullscreen?: () => void
}) {
  return (
    <div className={comandasBrisaBoardIdentityClass}>
      <div className={comandasBrisaBoardIdentityCopyClass} aria-hidden>
        <span className={cn(comandasBrisaSkeletonBarClass, "h-2.5 w-16")} />
        <span className={cn(comandasBrisaSkeletonBarClass, "mt-2 h-4 w-36")} />
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span className={cn(comandasBrisaSkeletonBoxClass, "h-8 w-28 rounded-lg")} />
        {showExitFullscreen && onExitFullscreen ? (
          <BoardExitFullscreenButton onExit={onExitFullscreen} />
        ) : null}
      </div>
    </div>
  )
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
      <RootsNaturePill
        atmosphere="bruma"
        variant={comandaStatusPillVariant(column.id, count)}
        className="relative z-1 min-w-6 justify-center"
        title={countLabel}
      >
        <span aria-label={countLabel}>{count}</span>
      </RootsNaturePill>
    </div>
  )
}

function KanbanTicketCard({
  card,
  canUpdate,
  onAckVoid,
}: {
  card: ComandaBoardCard
  canUpdate: boolean
  onAckVoid: (ticketId: string) => void
}) {
  const draggable = canUpdate && canDragComanda(card.status, card.sendKind)
  const showAck = canUpdate && canAckComandaVoid(card.sendKind, card.status)
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
        <ComandaTicketCardBody card={card} />
        {showAck ? (
          <div className={comandasBrisaTicketVoidActionClass}>
            <RootsPrimaryButton
              size="compact"
              className="w-full"
              aria-label="Quitar anulación de pantalla"
              onClick={() => onAckVoid(card.primaryItemId)}
            >
              OK
            </RootsPrimaryButton>
          </div>
        ) : null}
      </article>
    </li>
  )
}

function KanbanColumnBody({
  column,
  tickets,
  canUpdate,
  draggingTicket,
  onAckVoid,
}: {
  column: (typeof BOARD_COLUMNS)[number]
  tickets: ComandaBoardCard[]
  canUpdate: boolean
  draggingTicket: ComandaBoardCard | null
  onAckVoid: (ticketId: string) => void
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
    <div className={comandasBrisaColumnBodyClass(column.id)}>
      <div
        ref={setNodeRef}
        className={cn(
          comandasBrisaDropZoneClass,
          isOver && canDrop && comandasBrisaDropZoneOverClass(column.id),
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
                onAckVoid={onAckVoid}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export function ComandasBoardSkeleton({
  showExitFullscreen,
  onExitFullscreen,
}: {
  showExitFullscreen?: boolean
  onExitFullscreen?: () => void
} = {}) {
  return (
    <div className={comandasBrisaBoardShellClass}>
      <BoardIdentitySkeleton
        showExitFullscreen={showExitFullscreen}
        onExitFullscreen={onExitFullscreen}
      />
      <div className={comandasBrisaHeaderRowClass}>
        {BOARD_COLUMNS.map((column) => (
          <div key={column.id} className={comandasBrisaColumnHeaderClass(column.id)}>
            <span className={cn(comandasBrisaSkeletonBarClass, "relative z-1 h-3 w-24")} />
            <span className={cn(comandasBrisaSkeletonBoxClass, "relative z-1 ml-auto h-5 w-6 rounded-full")} />
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
  stationName,
  boardClock = 0,
  onMoveTicket,
}: Props) {
  const fullscreen = useDocumentFullscreen()
  const [draggingTicketId, setDraggingTicketId] = useState<string | null>(null)
  const [historyOpen, setHistoryOpen] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  )

  const cards = useMemo(
    () => groupComandasForBoard(tickets),
    [tickets, boardClock],
  )

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
    if (!card || !canDragComanda(card.status, card.sendKind)) return

    const overId = String(over.id)
    const targetColumn = COMANDA_BOARD_COLUMNS.includes(overId as ComandaStatus)
      ? (overId as ComandaStatus)
      : cards.find((row) => row.id === overId)?.status

    if (!targetColumn || !canMoveComandaTo(card.status, targetColumn)) return
    void onMoveTicket(card.primaryItemId, targetColumn)
  }

  return (
    <>
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
          <ComandasBoardSkeleton
            showExitFullscreen={fullscreen.active}
            onExitFullscreen={fullscreen.exit}
          />
        ) : (
          <>
            <BoardIdentity
              stationName={stationName || "Estación"}
              showExitFullscreen={fullscreen.active}
              onExitFullscreen={fullscreen.exit}
              onOpenDeliveredHistory={() => setHistoryOpen(true)}
            />
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
                  onAckVoid={(ticketId) => {
                    void onMoveTicket(ticketId, "voided")
                  }}
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
            <ComandaTicketCardBody card={draggingTicket} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
    <ComandasDeliveredHistoryDialog
      open={historyOpen}
      onOpenChange={setHistoryOpen}
      stationName={stationName || "Estación"}
      tickets={tickets}
    />
    </>
  )
}
