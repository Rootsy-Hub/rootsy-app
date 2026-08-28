import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { createPopLocalDatabase } from "./engine"
import {
  deleteRecipeById,
  deleteRecipesNotIn,
  getRecipeById,
  listAllRecipes,
  listMenuRecipes,
  renameRecipesCategory,
  updateRecipesStationForCategory,
  upsertRecipeSnapshots,
} from "./recipesRepo"
import type { RecipeSnapshot } from "./types"

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

describe("pop local db recipes", () => {
  it("upsert, listado y delete", async () => {
    const db = await createPopLocalDatabase()
    upsertRecipeSnapshots(db, [
      recipe({ id: "r2", name: "Ensalada" }),
      recipe({ id: "r1", name: "Milanesa", stationId: "st-2" }),
    ])
    const listed = listAllRecipes(db)
    assert.deepEqual(
      listed.map((row) => row.id),
      ["r2", "r1"],
    )
    assert.equal(getRecipeById(db, "r1")?.stationId, "st-2")
    deleteRecipeById(db, "r2")
    assert.equal(listAllRecipes(db).length, 1)
  })

  it("deleteRecipesNotIn deja solo las vistas en el dump", async () => {
    const db = await createPopLocalDatabase()
    upsertRecipeSnapshots(db, [
      recipe({ id: "r1", name: "Milanesa" }),
      recipe({ id: "r2", name: "Ensalada" }),
    ])
    deleteRecipesNotIn(db, ["r1"])
    assert.deepEqual(
      listAllRecipes(db).map((row) => row.id),
      ["r1"],
    )
  })

  it("lista recetas activas por categoría y búsqueda", async () => {
    const db = await createPopLocalDatabase()
    upsertRecipeSnapshots(db, [
      recipe({ id: "r1", name: "Milanesa", categoryId: "cat-1" }),
      recipe({ id: "r2", name: "Ensalada", categoryId: "cat-2" }),
      recipe({ id: "r3", name: "Inactiva", categoryId: "cat-1", isActive: false }),
    ])
    const page = listMenuRecipes(db, {
      categoryId: "cat-1",
      page: 1,
      pageSize: 50,
    })
    assert.deepEqual(
      page.recipes.map((row) => row.id),
      ["r1"],
    )
    const search = listMenuRecipes(db, {
      search: "ensa",
      page: 1,
      pageSize: 50,
    })
    assert.deepEqual(
      search.recipes.map((row) => row.id),
      ["r2"],
    )
  })

  it("renombra categoría y actualiza estación denormalizada", async () => {
    const db = await createPopLocalDatabase()
    upsertRecipeSnapshots(db, [
      recipe({ id: "r1", name: "Milanesa", categoryId: "cat-1" }),
    ])
    assert.equal(renameRecipesCategory(db, "cat-1", "Platos"), true)
    assert.equal(getRecipeById(db, "r1")?.categoryName, "Platos")
    assert.equal(updateRecipesStationForCategory(db, "cat-1", "st-9"), true)
    assert.equal(getRecipeById(db, "r1")?.stationId, "st-9")
  })
})
