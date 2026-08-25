import assert from "node:assert/strict"
import { beforeEach, describe, it } from "node:test"
import type { DomainEvent } from "../realtime/protocol"
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

  it("encola avisos durante el GET y los aplica al terminar", async () => {
    const applied: string[] = []
    setCatalogArticleEventApplier((e) => {
      applied.push(e.id)
    })
    const epoch = beginCatalogArticleHydrate()
    enqueueOrApplyCatalogArticleEvent(event("a"))
    enqueueOrApplyCatalogArticleEvent(event("b"))
    assert.deepEqual(applied, [])
    endCatalogArticleHydrate(epoch)
    await waitCatalogArticleApplies()
    assert.deepEqual(applied, ["a", "b"])
  })

  it("no marca current si hubo resync a mitad", () => {
    const started = beginCatalogArticleHydrate()
    bumpCatalogHydrateEpoch()
    assert.equal(catalogHydrateEpochIsCurrent(started), false)
    assert.equal(endCatalogArticleHydrate(started), false)
  })
})
