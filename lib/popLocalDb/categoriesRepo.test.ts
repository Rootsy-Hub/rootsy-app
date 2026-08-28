import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { applyPopLocalSchema } from "./database"
import { upsertArticleSnapshots } from "./articlesRepo"
import {
  deleteCategoryById,
  getCategoryById,
  listAllCategories,
  listSaleBoardCategories,
  replaceAllCategories,
  upsertCategorySnapshots,
} from "./categoriesRepo"
import { createPopLocalDatabase } from "./engine"
import { countLocalArticles } from "./articlesRepo"
import type { ArticleSnapshot, CategorySnapshot } from "./types"

function cat(
  partial: Partial<CategorySnapshot> & Pick<CategorySnapshot, "id" | "name">,
): CategorySnapshot {
  return {
    itemKind: "merchandise",
    sortOrder: 0,
    showInSale: true,
    visible: true,
    showInMenu: true,
    ...partial,
  }
}

function articleSnap(
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
    stockOnHand: 0,
    listPrices: [],
    ...partial,
  }
}

describe("pop local db categories", () => {
  it("el rail solo lista merchandise visible en venta, ordenado", async () => {
    const db = await createPopLocalDatabase()
    replaceAllCategories(db, [
      cat({ id: "c2", name: "Snacks", sortOrder: 2 }),
      cat({ id: "c1", name: "Bebidas", sortOrder: 1 }),
      cat({
        id: "c3",
        name: "Insumos",
        itemKind: "supply",
        sortOrder: 0,
      }),
      cat({
        id: "c4",
        name: "Oculta",
        sortOrder: 0,
        showInSale: false,
      }),
    ])

    const rail = listSaleBoardCategories(db)
    assert.deepEqual(
      rail.map((row) => row.id),
      ["c1", "c2"],
    )
    const all = listAllCategories(db)
    assert.equal(all.length, 4)
  })

  it("upsert y delete mantienen el resto", async () => {
    const db = await createPopLocalDatabase()
    upsertCategorySnapshots(db, [
      cat({ id: "c1", name: "Bebidas", sortOrder: 1 }),
    ])
    upsertCategorySnapshots(db, [
      cat({ id: "c1", name: "Bebidas frías", sortOrder: 1 }),
      cat({ id: "c2", name: "Snacks", sortOrder: 2 }),
    ])
    assert.equal(getCategoryById(db, "c1")?.name, "Bebidas frías")
    deleteCategoryById(db, "c2")
    assert.equal(listAllCategories(db).length, 1)
  })

  it("migra schema v1 a v2 sin borrar artículos", async () => {
    const db = await createPopLocalDatabase()
    upsertArticleSnapshots(db, [
      articleSnap({ id: "a1", name: "Coca" }),
    ])
    db.exec("DROP TABLE IF EXISTS categories")
    db.setMeta("schema_version", "1")
    applyPopLocalSchema(db)

    assert.equal(countLocalArticles(db), 1)
    assert.equal(listAllCategories(db).length, 0)
    upsertCategorySnapshots(db, [cat({ id: "c1", name: "Bebidas" })])
    assert.equal(listSaleBoardCategories(db)[0]?.name, "Bebidas")
  })
})
