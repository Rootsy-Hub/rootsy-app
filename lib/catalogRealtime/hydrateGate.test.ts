import assert from "node:assert/strict"
import { beforeEach, describe, it } from "node:test"
import type { DomainEvent } from "../realtime/protocol"
import { RealtimeHydrateSupersededError } from "../realtime/durableEventPipeline"
import {
  beginCatalogArticleHydrate,
  bumpCatalogHydrateEpoch,
  catalogHydrateEpochIsCurrent,
  endCatalogArticleHydrate,
  enqueueOrApplyCatalogArticleEvent,
  setCatalogArticleEventApplier,
  waitCatalogArticleApplies,
} from "./hydrateGate"

function event(id: string): DomainEvent {
  return {
    id,
    seq: 1,
    type: "articles.updated",
    popId: "pop-1",
    actorId: "u1",
    occurredAt: new Date().toISOString(),
    payload: { articleId: id },
  }
}

describe("catalog hydrate gate", () => {
  beforeEach(() => {
    bumpCatalogHydrateEpoch()
    setCatalogArticleEventApplier(null)
  })

  it("aplica al toque y vuelve a aplicar al terminar el GET", async () => {
    const applied: string[] = []
    setCatalogArticleEventApplier((e) => {
      applied.push(e.id)
    })
    const epoch = beginCatalogArticleHydrate()
    await enqueueOrApplyCatalogArticleEvent(event("a"))
    await enqueueOrApplyCatalogArticleEvent(event("b"))
    assert.deepEqual(applied, ["a", "b"])
    endCatalogArticleHydrate(epoch)
    await waitCatalogArticleApplies()
    assert.deepEqual(applied, ["a", "b", "a", "b"])
  })

  it("no marca current si hubo resync a mitad", () => {
    const started = beginCatalogArticleHydrate()
    bumpCatalogHydrateEpoch()
    assert.equal(catalogHydrateEpochIsCurrent(started), false)
    assert.equal(endCatalogArticleHydrate(started), false)
  })

  it("descarta el replay si hay resync", async () => {
    const applied: string[] = []
    setCatalogArticleEventApplier((e) => {
      applied.push(e.id)
    })
    beginCatalogArticleHydrate()
    await enqueueOrApplyCatalogArticleEvent(event("a"))
    assert.deepEqual(applied, ["a"])
    bumpCatalogHydrateEpoch()
    await waitCatalogArticleApplies()
    assert.deepEqual(applied, ["a"])
  })
})
