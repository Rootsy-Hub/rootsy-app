import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { collectCartCatalogEnsureIds } from "./menuCatalogProduct"

describe("collectCartCatalogEnsureIds", () => {
  it("separa artículos y recetas; no pide el mismo id en ambos", () => {
    const ids = collectCartCatalogEnsureIds([
      { productoId: "art-1", kind: "article" },
      { productoId: "rec-1", kind: "recipe" },
      { productoId: "promo-1", kind: "promotion" },
      { productoId: "art-2" },
    ])
    assert.deepEqual(ids.articleIds, ["art-1", "art-2"])
    assert.deepEqual(ids.recipeIds, ["rec-1"])
  })
})
