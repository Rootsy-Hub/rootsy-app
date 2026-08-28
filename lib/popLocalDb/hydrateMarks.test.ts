import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { upsertArticleSnapshots } from "./articlesRepo"
import { createPopLocalDatabase } from "./engine"
import {
  clearArticlesHydratedMarks,
  clearCategoriesHydratedMark,
  clearPromotionsHydratedMark,
  clearMesasFloorHydratedMark,
  clearComandasBoardHydratedMark,
  clearMostradorBoardHydratedMark,
  clearRecipeCategoriesHydratedMark,
  clearRecipesHydratedMark,
  isArticlesHydrated,
  isCategoriesHydrated,
  isMesasFloorHydrated,
  isComandasBoardHydrated,
  isMostradorBoardHydrated,
  isPromotionsHydrated,
  isRecipeCategoriesHydrated,
  isRecipesHydrated,
  markArticlesHydrated,
  markCategoriesHydrated,
  markPromotionsHydrated,
  markMesasFloorHydrated,
  markComandasBoardHydrated,
  markMostradorBoardHydrated,
  markRecipeCategoriesHydrated,
  markRecipesHydrated,
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
  it("las marcas viejas por categoría no cuentan como dump completo", async () => {
    const db = await createPopLocalDatabase()
    upsertArticleSnapshots(db, [
      snap({ id: "a1", name: "Coca", categoryId: "cat-1" }),
    ])
    db.setMeta("articles_hydrated:cat-1", new Date().toISOString())
    assert.equal(isArticlesHydrated(db), false)
  })

  it("al invalidar borra la marca global y las viejas por categoría", async () => {
    const db = await createPopLocalDatabase()
    markArticlesHydrated(db, "2026-01-01T00:00:00.000Z")
    db.setMeta("articles_hydrated:cat-1", "2026-01-01T00:00:00.000Z")
    assert.equal(isArticlesHydrated(db), true)
    clearArticlesHydratedMarks(db)
    assert.equal(isArticlesHydrated(db), false)
    assert.equal(db.getMeta("articles_hydrated:cat-1"), null)
  })

  it("la marca de categorías es una sola por pop", async () => {
    const db = await createPopLocalDatabase()
    assert.equal(isCategoriesHydrated(db), false)
    markCategoriesHydrated(db, "2026-01-01T00:00:00.000Z")
    assert.equal(isCategoriesHydrated(db), true)
    clearCategoriesHydratedMark(db)
    assert.equal(isCategoriesHydrated(db), false)
  })

  it("la marca de promociones es una sola por pop", async () => {
    const db = await createPopLocalDatabase()
    assert.equal(isPromotionsHydrated(db), false)
    markPromotionsHydrated(db, "2026-01-01T00:00:00.000Z")
    assert.equal(isPromotionsHydrated(db), true)
    clearPromotionsHydratedMark(db)
    assert.equal(isPromotionsHydrated(db), false)
  })

  it("la marca de recetas es una sola por pop", async () => {
    const db = await createPopLocalDatabase()
    assert.equal(isRecipesHydrated(db), false)
    markRecipesHydrated(db, "2026-01-01T00:00:00.000Z")
    assert.equal(isRecipesHydrated(db), true)
    clearRecipesHydratedMark(db)
    assert.equal(isRecipesHydrated(db), false)
  })

  it("la marca de categorías de receta es una sola por pop", async () => {
    const db = await createPopLocalDatabase()
    assert.equal(isRecipeCategoriesHydrated(db), false)
    markRecipeCategoriesHydrated(db, "2026-01-01T00:00:00.000Z")
    assert.equal(isRecipeCategoriesHydrated(db), true)
    clearRecipeCategoriesHydratedMark(db)
    assert.equal(isRecipeCategoriesHydrated(db), false)
  })

  it("la marca del piso de mesas es una sola por pop", async () => {
    const db = await createPopLocalDatabase()
    assert.equal(isMesasFloorHydrated(db), false)
    markMesasFloorHydrated(db, "2026-01-01T00:00:00.000Z")
    assert.equal(isMesasFloorHydrated(db), true)
    clearMesasFloorHydratedMark(db)
    assert.equal(isMesasFloorHydrated(db), false)
  })

  it("la marca del tablero de mostrador es una sola por pop", async () => {
    const db = await createPopLocalDatabase()
    assert.equal(isMostradorBoardHydrated(db), false)
    markMostradorBoardHydrated(db, "2026-01-01T00:00:00.000Z")
    assert.equal(isMostradorBoardHydrated(db), true)
    clearMostradorBoardHydratedMark(db)
    assert.equal(isMostradorBoardHydrated(db), false)
  })

  it("la marca del tablero de comandas es una sola por pop", async () => {
    const db = await createPopLocalDatabase()
    assert.equal(isComandasBoardHydrated(db), false)
    markComandasBoardHydrated(db, "2026-01-01T00:00:00.000Z")
    assert.equal(isComandasBoardHydrated(db), true)
    clearComandasBoardHydratedMark(db)
    assert.equal(isComandasBoardHydrated(db), false)
  })
})
