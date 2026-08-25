import type { DomainEvent } from "@/lib/realtime/protocol"

type CatalogEventHandler = (event: DomainEvent) => void | Promise<void>

let epoch = 0
let depth = 0
const queue: DomainEvent[] = []
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
  queue.length = 0
}

export function setCatalogArticleEventApplier(
  handler: CatalogEventHandler | null,
) {
  applyQueued = handler
}

export function enqueueOrApplyCatalogArticleEvent(event: DomainEvent) {
  if (depth > 0) {
    queue.push(event)
    return
  }
  runApply(event)
}

function runApply(event: DomainEvent) {
  const handler = applyQueued
  if (!handler) return
  applyChain = applyChain
    .then(() => handler(event))
    .then(() => undefined)
    .catch(() => undefined)
}

function flushQueuedCatalogArticleEvents() {
  const pending = queue.splice(0)
  if (!applyQueued) return
  for (const event of pending) runApply(event)
}

export function waitCatalogArticleApplies(): Promise<void> {
  return applyChain
}
