import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { upsertArticleSnapshots } from "./articlesRepo"
import { createPopLocalDatabase } from "./engine"
import {
  backfillArticlesHydratedMarks,
  clearArticlesHydratedMarks,
  isArticlesCategoryHydrated,
  markArticlesCategoryHydrated,
} from "./hydrateMarks"
import type { ArticleSnapshot } from "./types"

function snap(
  partial: Partial<ArticleSnapshot> & Pick<ArticleSnapshot, "id" | "name">,
): ArticleSnapshot {
  return {
    description: "",
    imageUrl: null,
    barcode: null,
    sku: null,
    itemKind: "merchandise",
    categoryId: "cat-1",
    categoryName: "Bebidas",
    salePrice: 100,
    iva: 21,
    discountMode: null,
    discountValue: null,
    unitOfMeasure: "unidad",
    isSellable: true,
    isActive: true,
    allowNegativeStock: false,
    stockOnHand: 5,
    listPrices: [],
    ...partial,
  }
}

describe("hydrate marks", () => {
  it("marca categorías que ya están en un dump viejo y no las vuelve a pedir", async () => {
    const db = await createPopLocalDatabase()
    upsertArticleSnapshots(db, [
      snap({ id: "a1", name: "Coca", categoryId: "cat-1" }),
      snap({ id: "a2", name: "Agua", categoryId: "cat-2" }),
    ])
    assert.equal(backfillArticlesHydratedMarks(db), true)
    assert.equal(backfillArticlesHydratedMarks(db), false)
    assert.equal(isArticlesCategoryHydrated(db, "cat-1"), true)
    assert.equal(isArticlesCategoryHydrated(db, "cat-2"), true)
    assert.equal(isArticlesCategoryHydrated(db, "cat-3"), false)
  })

  it("al invalidar borra las marcas y hay que hidratar de nuevo", async () => {
    const db = await createPopLocalDatabase()
    markArticlesCategoryHydrated(db, "cat-1", "2026-01-01T00:00:00.000Z")
    assert.equal(isArticlesCategoryHydrated(db, "cat-1"), true)
    clearArticlesHydratedMarks(db)
    assert.equal(isArticlesCategoryHydrated(db, "cat-1"), false)
  })
})
