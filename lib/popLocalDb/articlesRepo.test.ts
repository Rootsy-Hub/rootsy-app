import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { createPopLocalDatabase } from "./engine"
import {
  countLocalArticles,
  deleteArticleById,
  deleteMerchandiseNotInCategory,
  listSaleBoardArticles,
  renameArticlesCategory,
  replaceMerchandiseArticles,
  upsertArticleSnapshots,
} from "./articlesRepo"
import { articleListItemToSnapshot, sqlArticleRowToSnapshot } from "./mapArticle"
import type { ArticleSnapshot } from "./types"

function snap(partial: Partial<ArticleSnapshot> & Pick<ArticleSnapshot, "id" | "name">): ArticleSnapshot {
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

describe("pop local db articles", () => {
  it("lista por categoría e incluye sin stock", async () => {
    const db = await createPopLocalDatabase()
    replaceMerchandiseArticles(db, [
      snap({ id: "a1", name: "Coca", categoryId: "cat-1", stockOnHand: 4 }),
      snap({ id: "a2", name: "Fanta", categoryId: "cat-1", stockOnHand: 0 }),
      snap({ id: "a3", name: "Agua", categoryId: "cat-2", stockOnHand: 9 }),
    ])

    const page = listSaleBoardArticles(db, {
      categoryId: "cat-1",
      page: 1,
      pageSize: 50,
    })
    assert.deepEqual(
      page.articles.map((row) => row.id),
      ["a1", "a2"],
    )
    assert.equal(page.totalCount, 2)
    assert.equal(page.articles[0]?.stockOnHand, 0)
  })

  it("busca por nombre y barcode sin categoría", async () => {
    const db = await createPopLocalDatabase()
    replaceMerchandiseArticles(db, [
      snap({ id: "a1", name: "Coca Cola", barcode: "7790001", categoryId: "cat-1" }),
      snap({ id: "a2", name: "Sprite", barcode: "7790002", categoryId: "cat-2" }),
    ])

    const byName = listSaleBoardArticles(db, {
      search: "coca",
      page: 1,
      pageSize: 50,
    })
    assert.deepEqual(
      byName.articles.map((row) => row.id),
      ["a1"],
    )

    const byBarcode = listSaleBoardArticles(db, {
      search: "7790002",
      page: 1,
      pageSize: 50,
    })
    assert.deepEqual(
      byBarcode.articles.map((row) => row.id),
      ["a2"],
    )
  })

  it("el snapshot reemplaza y borra los que ya no vienen", async () => {
    const db = await createPopLocalDatabase()
    replaceMerchandiseArticles(db, [
      snap({ id: "a1", name: "Coca" }),
      snap({ id: "a2", name: "Fanta" }),
    ])
    replaceMerchandiseArticles(db, [snap({ id: "a1", name: "Coca 2.0" })])

    const page = listSaleBoardArticles(db, {
      categoryId: "cat-1",
      page: 1,
      pageSize: 50,
    })
    assert.deepEqual(
      page.articles.map((row) => ({ id: row.id, name: row.name })),
      [{ id: "a1", name: "Coca 2.0" }],
    )
  })

  it("hidratar una categoría no borra las demás", async () => {
    const db = await createPopLocalDatabase()
    upsertArticleSnapshots(db, [
      snap({ id: "a1", name: "Coca", categoryId: "cat-1" }),
      snap({ id: "a2", name: "Agua", categoryId: "cat-2", stockOnHand: 9 }),
    ])
    upsertArticleSnapshots(db, [
      snap({ id: "a1", name: "Coca 2.0", categoryId: "cat-1" }),
    ])
    deleteMerchandiseNotInCategory(db, "cat-1", ["a1"])

    const cat1 = listSaleBoardArticles(db, {
      categoryId: "cat-1",
      page: 1,
      pageSize: 50,
    })
    const cat2 = listSaleBoardArticles(db, {
      categoryId: "cat-2",
      page: 1,
      pageSize: 50,
    })
    assert.deepEqual(
      cat1.articles.map((row) => ({ id: row.id, name: row.name })),
      [{ id: "a1", name: "Coca 2.0" }],
    )
    assert.deepEqual(
      cat2.articles.map((row) => row.id),
      ["a2"],
    )
  })

  it("persiste listPrices y redondea el round-trip SQL", async () => {
    const db = await createPopLocalDatabase()
    const row = snap({
      id: "a1",
      name: "Coca",
      listPrices: [{ listId: "lista-2", amount: 90 }],
      discountMode: "porcentaje",
      discountValue: 10,
    })
    replaceMerchandiseArticles(db, [row])
    const listed = listSaleBoardArticles(db, {
      categoryId: "cat-1",
      page: 1,
      pageSize: 50,
    })
    assert.deepEqual(listed.articles[0]?.listPrices, [
      { listId: "lista-2", amount: 90 },
    ])
    assert.equal(listed.articles[0]?.discountMode, "porcentaje")
    assert.equal(listed.articles[0]?.discountValue, 10)
  })

  it("crea las tablas de recetas y promociones junto a articles", async () => {
    const db = await createPopLocalDatabase()
    const recipes = db.get<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'recipes'",
    )
    const promotions = db.get<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'promotions'",
    )
    assert.equal(recipes?.name, "recipes")
    assert.equal(promotions?.name, "promotions")
  })

  it("borra un artículo por id y deja el resto", async () => {
    const db = await createPopLocalDatabase()
    upsertArticleSnapshots(db, [
      snap({ id: "a1", name: "Coca" }),
      snap({ id: "a2", name: "Fanta" }),
    ])
    deleteArticleById(db, "a1")
    assert.equal(countLocalArticles(db), 1)
    const page = listSaleBoardArticles(db, {
      categoryId: "cat-1",
      page: 1,
      pageSize: 50,
    })
    assert.deepEqual(page.articles.map((row) => row.id), ["a2"])
  })

  it("renombra category_name en sqlite sin borrar filas", async () => {
    const db = await createPopLocalDatabase()
    upsertArticleSnapshots(db, [
      snap({ id: "a1", name: "Coca", categoryId: "cat-1", categoryName: "Bebidas" }),
      snap({
        id: "a2",
        name: "Agua",
        categoryId: "cat-2",
        categoryName: "Gaseosas",
      }),
    ])
    assert.equal(renameArticlesCategory(db, "cat-1", "Bebidas frías"), true)
    const cat1 = listSaleBoardArticles(db, {
      categoryId: "cat-1",
      page: 1,
      pageSize: 50,
    })
    const cat2 = listSaleBoardArticles(db, {
      categoryId: "cat-2",
      page: 1,
      pageSize: 50,
    })
    assert.equal(cat1.articles[0]?.categoryName, "Bebidas frías")
    assert.equal(cat2.articles[0]?.categoryName, "Gaseosas")
    assert.equal(renameArticlesCategory(db, "cat-missing", "X"), false)
  })

  it("mapea un artículo de API al snapshot liviano", () => {
    const item = {
      id: "a1",
      name: "Coca",
      description: "500ml",
      imageUrl: null,
      brand: "",
      sku: "SKU-1",
      barcode: "123",
      itemKind: "merchandise",
      unitOfMeasure: "unidad",
      isSellable: true,
      defaultWastePct: null,
      minStockLevel: null,
      salePrice: 100,
      iva: 21,
      discountMode: null,
      discountValue: null,
      categoryId: "cat-1",
      categoryName: "Bebidas",
      isActive: true,
      allowNegativeStock: false,
      stockOnHand: 3,
      activeCostCount: 1,
      costs: [],
      listPrices: [{ listId: "lista-2", amount: 88 }],
    } as Parameters<typeof articleListItemToSnapshot>[0]
    const mapped = articleListItemToSnapshot(item)
    assert.equal(mapped.sku, "SKU-1")
    assert.equal(mapped.stockOnHand, 0)
    assert.deepEqual(mapped.listPrices, [{ listId: "lista-2", amount: 88 }])
    assert.equal(sqlArticleRowToSnapshot({
      id: mapped.id,
      name: mapped.name,
      description: mapped.description,
      image_url: mapped.imageUrl,
      barcode: mapped.barcode,
      sku: mapped.sku,
      item_kind: mapped.itemKind,
      category_id: mapped.categoryId,
      category_name: mapped.categoryName,
      sale_price: mapped.salePrice,
      iva: mapped.iva,
      discount_mode: mapped.discountMode,
      discount_value: mapped.discountValue,
      unit_of_measure: mapped.unitOfMeasure,
      is_sellable: 1,
      is_active: 1,
      allow_negative_stock: 0,
      stock_on_hand: mapped.stockOnHand,
      list_prices: JSON.stringify(mapped.listPrices),
    })?.listPrices[0]?.amount, 88)
  })
})
