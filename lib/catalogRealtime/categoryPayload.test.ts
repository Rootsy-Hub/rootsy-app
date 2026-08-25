import assert from "node:assert/strict"
import { describe, it } from "node:test"
import type { ArticleCategoryOption } from "../../app/[siteId]/[popId]/articles/actions"
import { applyCategoryPatchToSaleBoard } from "./categoryPayload"

const rail: ArticleCategoryOption[] = [
  {
    id: "cat-1",
    name: "Bebidas",
    itemKind: "merchandise",
    sortOrder: 1,
    showInSale: true,
  },
]

describe("category realtime patch", () => {
  it("actualiza sortOrder del rail sin name", () => {
    const next = applyCategoryPatchToSaleBoard(
      rail,
      { id: "cat-1", sortOrder: 9 },
      "categories.updated",
    )
    assert.notEqual(next, "invalidate")
    if (next === "invalidate") return
    assert.equal(next[0]?.sortOrder, 9)
    assert.equal(next[0]?.name, "Bebidas")
  })

  it("saca del rail si showInSale es false", () => {
    const next = applyCategoryPatchToSaleBoard(
      rail,
      { id: "cat-1", showInSale: false },
      "categories.updated",
    )
    assert.deepEqual(next, [])
  })

  it("pide invalidate si es nueva y no trae name", () => {
    const next = applyCategoryPatchToSaleBoard(
      rail,
      { id: "cat-2", sortOrder: 2, showInSale: true },
      "categories.updated",
    )
    assert.equal(next, "invalidate")
  })

  it("borra del rail", () => {
    const next = applyCategoryPatchToSaleBoard(
      rail,
      { id: "cat-1" },
      "categories.deleted",
    )
    assert.deepEqual(next, [])
  })
})
