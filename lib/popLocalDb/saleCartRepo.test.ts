import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { applyPopLocalSchema } from "./database"
import { createPopLocalDatabase } from "./engine"
import {
  findSaleBoardArticleByScan,
  getArticleById,
  upsertArticleSnapshots,
} from "./articlesRepo"
import { listSaleCart, replaceSaleCart } from "./saleCartRepo"
import type { ArticleSnapshot } from "./types"

function article(
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
    salePrice: 1000,
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

describe("sale cart sqlite", () => {
  it("persiste líneas con snapshot y no las reescribe si cambia el artículo", async () => {
    const db = await createPopLocalDatabase()
    upsertArticleSnapshots(db, [
      article({ id: "a1", name: "Artículo A", salePrice: 1000, barcode: "7791" }),
    ])
    replaceSaleCart(
      db,
      [
        {
          lineId: "line-1",
          productoId: "a1",
          cantidad: 2,
          kind: "article",
          snapshot: {
            nombre: "Artículo A",
            precio: 1000,
            iva: 21,
            categoria: "Bebidas",
          },
        },
      ],
      {
        itemDescuentoModo: {},
        itemDescuentoDraft: {},
        itemDescuentoSuprimido: {},
        itemComentarios: { "line-1": "sin hielo" },
      },
    )

    upsertArticleSnapshots(db, [
      article({ id: "a1", name: "Artículo AB", salePrice: 1500, barcode: "7791" }),
    ])
    db.run("DELETE FROM articles WHERE id = ?", ["a1"])

    const loaded = listSaleCart(db)
    assert.equal(loaded.carrito.length, 1)
    assert.equal(loaded.carrito[0]?.snapshot?.nombre, "Artículo A")
    assert.equal(loaded.carrito[0]?.snapshot?.precio, 1000)
    assert.equal(loaded.carrito[0]?.cantidad, 2)
    assert.equal(loaded.overrides.itemComentarios["line-1"], "sin hielo")
    assert.equal(getArticleById(db, "a1"), null)
  })
})

describe("sale board article scan", () => {
  it("encuentra por barcode exacto y no por inactivo", async () => {
    const db = await createPopLocalDatabase()
    upsertArticleSnapshots(db, [
      article({ id: "a1", name: "Coca", barcode: "7790001", sku: "SKU-COCA" }),
      article({
        id: "a2",
        name: "Coca zero",
        barcode: "7790002",
        isActive: false,
      }),
      article({
        id: "a3",
        name: "Agua",
        sku: "SKU-AGUA",
        isSellable: false,
      }),
    ])
    assert.equal(findSaleBoardArticleByScan(db, "7790001")?.id, "a1")
    assert.equal(findSaleBoardArticleByScan(db, "SKU-COCA")?.id, "a1")
    assert.equal(findSaleBoardArticleByScan(db, "7790002"), null)
    assert.equal(findSaleBoardArticleByScan(db, "SKU-AGUA"), null)
    assert.equal(findSaleBoardArticleByScan(db, "Coca")?.id, "a1")
    assert.equal(findSaleBoardArticleByScan(db, "inexistente"), null)
  })

  it("migra schema v2 a v3 sin borrar artículos", async () => {
    const db = await createPopLocalDatabase()
    upsertArticleSnapshots(db, [article({ id: "a1", name: "Coca" })])
    db.exec("DROP TABLE IF EXISTS sale_cart_lines")
    db.setMeta("schema_version", "2")
    applyPopLocalSchema(db)
    assert.equal(getArticleById(db, "a1")?.name, "Coca")
    replaceSaleCart(
      db,
      [
        {
          lineId: "line-1",
          productoId: "a1",
          cantidad: 1,
          kind: "article",
          snapshot: { nombre: "Coca", precio: 1000 },
        },
      ],
      {
        itemDescuentoModo: {},
        itemDescuentoDraft: {},
        itemDescuentoSuprimido: {},
        itemComentarios: {},
      },
    )
    assert.equal(listSaleCart(db).carrito[0]?.productoId, "a1")
  })
})
