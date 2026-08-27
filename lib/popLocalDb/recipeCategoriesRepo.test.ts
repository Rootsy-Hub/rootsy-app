import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { applyPopLocalSchema } from "./database"
import { createPopLocalDatabase } from "./engine"
import {
  deleteRecipeCategoryById,
  getRecipeCategoryById,
  listAllRecipeCategories,
  listMenuRecipeCategories,
  replaceAllRecipeCategories,
  upsertRecipeCategorySnapshots,
} from "./recipeCategoriesRepo"
import { getRecipeById, upsertRecipeSnapshots } from "./recipesRepo"
import type { RecipeCategorySnapshot, RecipeSnapshot } from "./types"

function cat(
  partial: Partial<RecipeCategorySnapshot> &
    Pick<RecipeCategorySnapshot, "id" | "name">,
): RecipeCategorySnapshot {
  return {
    sortOrder: 0,
    showInMenu: true,
    isActive: true,
    stationId: null,
    ...partial,
  }
}

function recipe(
  partial: Partial<RecipeSnapshot> & Pick<RecipeSnapshot, "id" | "name">,
): RecipeSnapshot {
  return {
    description: "",
    imageUrl: null,
    categoryId: "cat-1",
    categoryName: "Cocina",
    salePrice: 1000,
    iva: 21,
    isActive: true,
    allowNegativeStock: false,
    stationId: "st-1",
    listPrices: [],
    ...partial,
  }
}

describe("pop local db recipe categories", () => {
  it("el menú solo lista activas visibles, ordenadas", async () => {
    const db = await createPopLocalDatabase()
    replaceAllRecipeCategories(db, [
      cat({ id: "c2", name: "Postres", sortOrder: 2 }),
      cat({ id: "c1", name: "Entradas", sortOrder: 1, stationId: "st-1" }),
      cat({ id: "c3", name: "Oculta", showInMenu: false }),
      cat({ id: "c4", name: "Inactiva", isActive: false }),
    ])

    const menu = listMenuRecipeCategories(db)
    assert.deepEqual(
      menu.map((row) => row.id),
      ["c1", "c2"],
    )
    assert.equal(getRecipeCategoryById(db, "c1")?.stationId, "st-1")
    assert.equal(listAllRecipeCategories(db).length, 4)
  })

  it("upsert y delete mantienen el resto", async () => {
    const db = await createPopLocalDatabase()
    upsertRecipeCategorySnapshots(db, [
      cat({ id: "c1", name: "Entradas", sortOrder: 1 }),
    ])
    upsertRecipeCategorySnapshots(db, [
      cat({ id: "c1", name: "Entradas frías", sortOrder: 1 }),
      cat({ id: "c2", name: "Platos", sortOrder: 2 }),
    ])
    assert.equal(getRecipeCategoryById(db, "c1")?.name, "Entradas frías")
    deleteRecipeCategoryById(db, "c2")
    assert.equal(listAllRecipeCategories(db).length, 1)
  })

  it("migra schema v3 a v4 sin borrar recetas y agrega station_id", async () => {
    const db = await createPopLocalDatabase()
    upsertRecipeSnapshots(db, [recipe({ id: "r1", name: "Milanesa" })])
    db.exec("DROP TABLE IF EXISTS recipe_categories")
    db.exec("DROP INDEX IF EXISTS recipes_station_id")
    db.exec(`
      CREATE TABLE recipes_v3 (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        image_url TEXT,
        category_id TEXT,
        category_name TEXT NOT NULL DEFAULT '',
        sale_price REAL NOT NULL,
        iva REAL NOT NULL DEFAULT 0,
        is_active INTEGER NOT NULL DEFAULT 1,
        allow_negative_stock INTEGER NOT NULL DEFAULT 0,
        list_prices TEXT NOT NULL DEFAULT '[]',
        updated_at TEXT NOT NULL
      )
    `)
    db.exec(`
      INSERT INTO recipes_v3 (
        id, name, description, image_url, category_id, category_name,
        sale_price, iva, is_active, allow_negative_stock, list_prices, updated_at
      )
      SELECT
        id, name, description, image_url, category_id, category_name,
        sale_price, iva, is_active, allow_negative_stock, list_prices, updated_at
      FROM recipes
    `)
    db.exec("DROP TABLE recipes")
    db.exec("ALTER TABLE recipes_v3 RENAME TO recipes")
    db.setMeta("schema_version", "3")
    applyPopLocalSchema(db)

    assert.equal(getRecipeById(db, "r1")?.name, "Milanesa")
    assert.equal(getRecipeById(db, "r1")?.stationId, null)
    assert.equal(listAllRecipeCategories(db).length, 0)
    upsertRecipeCategorySnapshots(db, [
      cat({ id: "c1", name: "Cocina", stationId: "st-1" }),
    ])
    assert.equal(listMenuRecipeCategories(db)[0]?.stationId, "st-1")
  })
})
