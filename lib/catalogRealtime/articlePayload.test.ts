import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { articleSnapshotFromRealtimePayload } from "./articlePayload"

describe("article realtime payload", () => {
  it("arma el snapshot liviano desde el aviso", () => {
    const snap = articleSnapshotFromRealtimePayload({
      id: "a1",
      name: "Coca",
      salePrice: 150,
      iva: 21,
      itemKind: "merchandise",
      categoryId: "cat-1",
      categoryName: "Bebidas",
      stockOnHand: 4,
      listPrices: [{ listId: "lista-2", amount: 140 }],
    })
    assert.equal(snap?.id, "a1")
    assert.equal(snap?.salePrice, 150)
    assert.equal(snap?.stockOnHand, 0)
    assert.deepEqual(snap?.listPrices, [{ listId: "lista-2", amount: 140 }])
  })

  it("rechaza un aviso sin id o nombre", () => {
    assert.equal(articleSnapshotFromRealtimePayload({ name: "Coca" }), null)
    assert.equal(articleSnapshotFromRealtimePayload({ id: "a1" }), null)
  })
})
