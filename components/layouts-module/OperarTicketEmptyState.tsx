"use client"

import {
  RootsyEmptyState,
  ROOTSY_EMPTY_STATE_COPY,
} from "@/components/rootsy-empty-state"
import { cn } from "@/lib/utils"

export type OperarTicketEmptyKind = "order" | "purchase" | "service"

type Props = {
  kind?: OperarTicketEmptyKind
  title?: string
  description?: string
  className?: string
}

/** Pedido vacío de Operar — mundo Bruma. Con el catálogo, es la misma conversación. */
export function OperarTicketEmptyState({
  kind = "order",
  title,
  description,
  className,
}: Props) {
  const copy = ROOTSY_EMPTY_STATE_COPY.ticket[kind]

  return (
    <div
      className={cn("flex min-h-0 flex-1 flex-col", className)}
      data-ticket-empty="true"
    >
      <RootsyEmptyState
        slot="ticket"
        world="bruma"
        title={title ?? copy.title}
        description={description ?? copy.description}
        className="h-full"
      />
    </div>
  )
}
