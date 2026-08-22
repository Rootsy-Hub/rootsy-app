import type { QueryClient } from "@tanstack/react-query"
import type { DomainEvent } from "./protocol"

export type RealtimeQueryStrategy = "patch" | "invalidate"

export type RealtimeQueryHandler = {
  eventType: string
  queryKey: (event: DomainEvent) => readonly unknown[]
  strategy: RealtimeQueryStrategy
  applyPatch?: (current: unknown, event: DomainEvent) => unknown
}

const handlers: RealtimeQueryHandler[] = []

export function registerRealtimeQueryHandler(handler: RealtimeQueryHandler) {
  handlers.push(handler)
}

/** Fase 0: registry vacío. Los dominios se registran desde la fase 1. */
export function applyRealtimeEventToQuery(
  queryClient: QueryClient,
  event: DomainEvent,
) {
  for (const handler of handlers) {
    if (handler.eventType !== event.type) continue
    const queryKey = handler.queryKey(event)
    if (handler.strategy === "invalidate") {
      void queryClient.invalidateQueries({ queryKey })
      continue
    }
    if (!handler.applyPatch) continue
    queryClient.setQueryData(queryKey, (current: unknown) =>
      handler.applyPatch!(current, event),
    )
  }
}
