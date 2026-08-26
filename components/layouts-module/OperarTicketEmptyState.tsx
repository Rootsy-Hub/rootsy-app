"use client"

import {
  RootsyEmptyState,
  ROOTSY_EMPTY_STATE_COPY,
} from "@/components/rootsy-empty-state"
import { cn } from "@/lib/utils"
import { ListPlus } from "lucide-react"

export type OperarTicketEmptyKind = "order" | "purchase" | "service"

type Props = {
  kind?: OperarTicketEmptyKind
  title?: string
  description?: string
  className?: string
}

/** Pedido vacío de Operar — mundo Bruma. Ícono de insertar líneas. */
export function OperarTicketEmptyState({
  kind = "order",
  title,
  description,
  className,
}: Props) {
  const copy = ROOTSY_EMPTY_STATE_COPY.ticket[kind]

  return (
    <div
      className={cn("layouts-operar-ticket-empty flex min-h-0 flex-1 flex-col", className)}
      data-ticket-empty="true"
    >
      <RootsyEmptyState
        world="bruma"
        icon={ListPlus}
        title={title ?? copy.title}
        description={description ?? copy.description}
      />
    </div>
  )
}
