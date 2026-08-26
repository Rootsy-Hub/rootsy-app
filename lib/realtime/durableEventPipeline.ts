import type { DomainEvent } from "@/lib/realtime/protocol"

export class RealtimeHydrateSupersededError extends Error {
  constructor() {
    super("catalog-hydrate-superseded")
    this.name = "RealtimeHydrateSupersededError"
  }
}

export function isRealtimeHydrateSupersededError(error: unknown) {
  return (
    error instanceof RealtimeHydrateSupersededError ||
    (error instanceof Error && error.name === "RealtimeHydrateSupersededError")
  )
}

type DurableEventPipelineOptions = {
  persistSeq: (seq: number) => void | Promise<void>
  onApplyFailure?: (event: DomainEvent, error: unknown) => void | Promise<void>
}

export function createDurableEventPipeline(options: DurableEventPipelineOptions) {
  let durableSeq: number | null = null
  let chain: Promise<void> = Promise.resolve()

  function getDurableSeq() {
    return durableSeq
  }

  function resetDurableSeq(seq: number | null) {
    durableSeq = seq
  }

  function push(
    event: DomainEvent,
    apply: (event: DomainEvent) => void | Promise<void>,
  ) {
    chain = chain.then(async () => {
      if (durableSeq != null && event.seq <= durableSeq) return
      try {
        await apply(event)
      } catch (error) {
        if (isRealtimeHydrateSupersededError(error)) return
        if (durableSeq != null && event.seq <= durableSeq) return
        await options.onApplyFailure?.(event, error)
      }
      if (durableSeq != null && event.seq <= durableSeq) return
      await options.persistSeq(event.seq)
      if (durableSeq == null || event.seq > durableSeq) {
        durableSeq = event.seq
      }
    })
    return chain
  }

  function wait(): Promise<void> {
    return chain
  }

  return { getDurableSeq, resetDurableSeq, push, wait }
}

export type DurableEventPipeline = ReturnType<typeof createDurableEventPipeline>
