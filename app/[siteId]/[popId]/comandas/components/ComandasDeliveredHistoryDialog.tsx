"use client"

import { groupComandasDeliveredHistory } from "@/app/[siteId]/[popId]/comandas/comandasLogic"
import {
  comandasBrisaHistoryClockClass,
  comandasBrisaHistoryDialogClass,
  comandasBrisaHistoryIconClass,
  comandasBrisaHistoryIconVoidClass,
  comandasBrisaHistoryItemClass,
  comandasBrisaHistoryListClass,
  comandasBrisaHistoryNoteClass,
  comandasBrisaHistoryOriginClass,
  comandasBrisaHistoryRelativeClass,
  comandasBrisaHistoryRowClass,
  comandasBrisaHistoryRowVoidClass,
  comandasBrisaHistoryTitleClass,
} from "@/app/[siteId]/[popId]/comandas/comandasBrisaStyles"
import type { ComandaBoardCard, ComandaTicket } from "@/app/[siteId]/[popId]/comandas/comandasTypes"
import { DataWorkspaceDetailEmptyState } from "@/components/data-workspace/DataWorkspaceDetailEmptyState"
import {
  RootsDialogBody,
  RootsDialogContent,
  RootsDialogHeader,
} from "@/components/rootsy-dialog"
import { Dialog } from "@/components/ui/dialog"
import { formatLocaleTime } from "@/lib/popTimezone"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { Ban, CheckCircle2 } from "lucide-react"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  stationName: string
  tickets: ComandaTicket[]
}

function historyWhen(iso: string): { clock: string; relative: string } {
  const date = new Date(iso)
  if (!Number.isFinite(date.getTime())) {
    return { clock: "—", relative: "" }
  }
  return {
    clock: formatLocaleTime(date),
    relative: formatDistanceToNow(date, { addSuffix: true, locale: es }),
  }
}

function HistoryRow({ card }: { card: ComandaBoardCard }) {
  const isVoid = card.sendKind === "void"
  const when = historyWhen(card.statusChangedAt || card.createdAt)
  const origin =
    isVoid ? "Anulación" : card.sourceKind === "table" ? "Mesa" : "Mostrador"
  const Icon = isVoid ? Ban : CheckCircle2

  return (
    <article
      className={cn(
        comandasBrisaHistoryRowClass,
        isVoid && comandasBrisaHistoryRowVoidClass,
      )}
    >
      <div className="flex items-start gap-3">
        <Icon
          aria-hidden
          className={cn(
            comandasBrisaHistoryIconClass,
            isVoid && comandasBrisaHistoryIconVoidClass,
          )}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className={comandasBrisaHistoryOriginClass}>{origin}</p>
              <h3 className={cn("mt-0.5 truncate", comandasBrisaHistoryTitleClass)}>
                {card.originLabel}
              </h3>
            </div>
            <p className="shrink-0 text-right">
              <span className={comandasBrisaHistoryClockClass}>{when.clock}</span>
              {when.relative ? (
                <span className={cn("mt-0.5 block", comandasBrisaHistoryRelativeClass)}>
                  {when.relative}
                </span>
              ) : null}
            </p>
          </div>
          <ul className="mt-2.5 space-y-1">
            {card.items.map((item) => {
              const qtyLabel = item.quantity > 1 ? `${item.quantity}× ` : ""
              return (
                <li key={item.id}>
                  <p
                    className={cn(
                      comandasBrisaHistoryItemClass,
                      isVoid && "text-rootsy-lava-700",
                    )}
                  >
                    {isVoid ? "Anular " : ""}
                    {qtyLabel}
                    {item.recipeName}
                  </p>
                  {item.comment ? (
                    <p className={cn("mt-0.5", comandasBrisaHistoryNoteClass)}>
                      {item.comment}
                    </p>
                  ) : null}
                </li>
              )
            })}
          </ul>
          {card.customerName ? (
            <p className={cn("mt-2", comandasBrisaHistoryNoteClass)}>
              {card.customerName}
            </p>
          ) : null}
          {card.sendComment ? (
            <p className={cn("mt-1", comandasBrisaHistoryNoteClass)}>
              {card.sendComment}
            </p>
          ) : null}
        </div>
      </div>
    </article>
  )
}

export function ComandasDeliveredHistoryDialog({
  open,
  onOpenChange,
  stationName,
  tickets,
}: Props) {
  const cards = groupComandasDeliveredHistory(tickets)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <RootsDialogContent size="wide" className={comandasBrisaHistoryDialogClass}>
        <RootsDialogHeader
          open={open}
          title="Entregados"
          description={`Últimas 24 horas · ${stationName || "Estación"}`}
        />
        <RootsDialogBody className="min-h-0 flex-1 overflow-y-auto pb-5">
          {cards.length === 0 ? (
            <DataWorkspaceDetailEmptyState
              icon={CheckCircle2}
              title="Nada entregado en las últimas 24 horas"
            />
          ) : (
            <ul className={comandasBrisaHistoryListClass}>
              {cards.map((card) => (
                <li key={card.id}>
                  <HistoryRow card={card} />
                </li>
              ))}
            </ul>
          )}
        </RootsDialogBody>
      </RootsDialogContent>
    </Dialog>
  )
}
