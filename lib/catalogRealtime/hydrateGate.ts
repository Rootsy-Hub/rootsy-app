import type { DomainEvent } from "../realtime/protocol"
import { RealtimeHydrateSupersededError } from "../realtime/durableEventPipeline"

type CatalogEventHandler = (event: DomainEvent) => void | Promise<void>

type QueuedCatalogEvent = {
  event: DomainEvent
  resolve: () => void
  reject: (error: unknown) => void
}

let epoch = 0
let depth = 0
const queue: QueuedCatalogEvent[] = []
let applyQueued: CatalogEventHandler | null = null
let applyChain: Promise<void> = Promise.resolve()

export function catalogHydrateEpochIsCurrent(startedEpoch: number) {
  return startedEpoch === epoch
}

export function beginCatalogArticleHydrate() {
  depth += 1
  return epoch
}

export function endCatalogArticleHydrate(startedEpoch: number) {
  depth = Math.max(0, depth - 1)
  const current = startedEpoch === epoch
  if (depth === 0) flushQueuedCatalogArticleEvents()
  return current
}

export function bumpCatalogHydrateEpoch() {
  epoch += 1
  depth = 0
  const pending = queue.splice(0)
  const error = new RealtimeHydrateSupersededError()
  for (const item of pending) item.reject(error)
}

export function setCatalogArticleEventApplier(
  handler: CatalogEventHandler | null,
) {
  applyQueued = handler
}

/** Si hay un GET de hidratación, re-aplica después para que no pise el aviso. */
export function scheduleCatalogArticleReplayIfHydrating(event: DomainEvent) {
  if (depth <= 0) return
  queue.push({
    event,
    resolve: () => undefined,
    reject: (error) => {
      if (error instanceof RealtimeHydrateSupersededError) return
    },
  })
}

export function enqueueOrApplyCatalogArticleEvent(
  event: DomainEvent,
): Promise<void> {
  const applied = runApply(event)
  scheduleCatalogArticleReplayIfHydrating(event)
  return applied
}

function runApply(event: DomainEvent): Promise<void> {
  const handler = applyQueued
  if (!handler) return Promise.resolve()
  const job = applyChain.then(
    () => Promise.resolve(handler(event)).then(() => undefined),
    () => Promise.resolve(handler(event)).then(() => undefined),
  )
  applyChain = job.catch(() => undefined)
  return job
}

function flushQueuedCatalogArticleEvents() {
  const pending = queue.splice(0)
  for (const item of pending) {
    void runApply(item.event).then(item.resolve, item.reject)
  }
}

export function waitCatalogArticleApplies(): Promise<void> {
  return applyChain
}
