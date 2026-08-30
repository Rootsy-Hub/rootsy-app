import assert from "node:assert/strict"
import { describe, it } from "node:test"
import {
  derivePopOperateCapabilities,
  moduleKeysFromPopAccess,
} from "./popOperateCapabilities"

describe("derivePopOperateCapabilities", () => {
  it("un comercio no hidrata recetas ni BOM", () => {
    const caps = derivePopOperateCapabilities(["sale", "inventory", "promotions"])
    assert.equal(caps.inventoryControl, true)
    assert.equal(caps.hydrateRecipes, false)
    assert.equal(caps.hydrateBom, false)
    assert.equal(caps.recipeAvailability, false)
    assert.equal(caps.hydratePromotions, true)
  })

  it("un restaurant proyecta disponibilidad de recetas", () => {
    const caps = derivePopOperateCapabilities([
      "mostrador",
      "mesas",
      "comandas",
      "recipes",
      "inventory",
    ])
    assert.equal(caps.hydrateRecipes, true)
    assert.equal(caps.hydrateBom, true)
    assert.equal(caps.recipeAvailability, true)
    assert.equal(caps.tables, true)
  })

  it("fábrica hidrata recetas pero no BOM de venta", () => {
    const caps = derivePopOperateCapabilities([
      "sale",
      "manufacturing",
      "recipes",
    ])
    assert.equal(caps.hydrateRecipes, true)
    assert.equal(caps.hydrateBom, false)
    assert.equal(caps.recipeAvailability, false)
    assert.equal(caps.manufacturing, true)
  })

  it("lee keys desde módulos de acceso", () => {
    assert.deepEqual(
      moduleKeysFromPopAccess([{ key: "recipes" }, { key: "inventory" }]),
      ["recipes", "inventory"],
    )
  })
})
