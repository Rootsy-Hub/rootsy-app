"use client"

import {
  comandasBrisaTicketBadgeClass,
  comandasBrisaTicketBodyClass,
  comandasBrisaTicketDetailClass,
  comandasBrisaTicketEyebrowClass,
  comandasBrisaTicketHeaderClass,
  comandasBrisaTicketMetaClass,
  comandasBrisaTicketTitleClass,
} from "@/app/[siteId]/[popId]/comandas/comandasBrisaStyles"
import { formatComandaElapsed } from "@/app/[siteId]/[popId]/comandas/comandasLogic"
import type { ComandaBoardCard } from "@/app/[siteId]/[popId]/comandas/comandasTypes"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

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

export function ComandaTicketCardBody({ card }: { card: ComandaBoardCard }) {
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
                    card.sendKind === "void" && "text-rootsy-lava-700",
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
