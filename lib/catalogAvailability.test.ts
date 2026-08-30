import assert from "node:assert/strict"
import { describe, it } from "node:test"
import {
  applyAvailabilityToProduct,
  consumptionQuantity,
  isCatalogStockStale,
  projectArticleAvailability,
  projectComboAvailability,
  projectRecipeAvailability,
} from "./catalogAvailability"

describe("catalogAvailability", () => {
  it("aplica merma como el cobro", () => {
    assert.ok(Math.abs(consumptionQuantity(0.4, 10, null, 1) - 0.44) < 1e-9)
  })

  it("bloquea un artículo sin stock", () => {
    const avail = projectArticleAvailability({
      stockOnHand: 0,
      allowNegativeStock: false,
    })
    assert.equal(avail.status, "unavailable")
    assert.equal(avail.blocked, true)
  })

  it("proyecta porciones por el insumo limitante", () => {
    const stock = new Map([
      ["harina", { stockOnHand: 1.32, allowNegativeStock: false }],
      ["huevo", { stockOnHand: 12, allowNegativeStock: false }],
    ])
    const avail = projectRecipeAvailability(
      {
        allowNegative: false,
        outputArticleId: null,
        ingredients: [
          { articleId: "harina", quantity: 0.4, wastePct: 10, defaultWastePct: null },
          { articleId: "huevo", quantity: 2, wastePct: null, defaultWastePct: null },
        ],
      },
      stock,
    )
    assert.equal(avail.servings, 3)
    assert.equal(avail.status, "limited")
    assert.equal(avail.blocked, false)
  })

  it("una receta fabricable usa el artículo producido", () => {
    const stock = new Map([
      ["torta", { stockOnHand: 2, allowNegativeStock: false }],
      ["harina", { stockOnHand: 0, allowNegativeStock: false }],
    ])
    const avail = projectRecipeAvailability(
      {
        allowNegative: false,
        outputArticleId: "torta",
        ingredients: [
          { articleId: "harina", quantity: 1, wastePct: null, defaultWastePct: null },
        ],
      },
      stock,
    )
    assert.equal(avail.servings, 2)
    assert.equal(avail.blocked, false)
  })

  it("sin BOM no bloquea la receta", () => {
    const avail = projectRecipeAvailability(
      { allowNegative: false, outputArticleId: null, ingredients: [] },
      new Map(),
    )
    assert.equal(avail.status, "unknown")
    assert.equal(avail.blocked, false)
  })

  it("un combo toma el mínimo de slots y el mejor option", () => {
    const stock = new Map([
      ["coca", { stockOnHand: 8, allowNegativeStock: false }],
      ["agua", { stockOnHand: 1, allowNegativeStock: false }],
    ])
    const recipes = new Map([
      [
        "burger",
        {
          allowNegative: false,
          outputArticleId: null,
          ingredients: [
            { articleId: "agua", quantity: 1, wastePct: null, defaultWastePct: null },
          ],
        },
      ],
    ])
    const avail = projectComboAvailability(
      [
        { quantity: 1, options: [{ kind: "recipe", refId: "burger" }] },
        {
          quantity: 1,
          options: [
            { kind: "article", refId: "coca" },
            { kind: "article", refId: "agua" },
          ],
        },
      ],
      stock,
      recipes,
    )
    assert.equal(avail.servings, 1)
    assert.equal(avail.blocked, false)
  })

  it("marca stale si el hydrate es viejo", () => {
    assert.equal(isCatalogStockStale(null), true)
    assert.equal(
      isCatalogStockStale(new Date(Date.now() - 20 * 60 * 1000).toISOString()),
      true,
    )
    assert.equal(isCatalogStockStale(new Date().toISOString()), false)
  })

  it("no pisa stockOnHand si la proyección es unknown", () => {
    const product = applyAvailabilityToProduct(
      { id: "r1", kind: "recipe" as const, stockOnHand: undefined as number | undefined },
      projectRecipeAvailability(null, new Map()),
    )
    assert.equal(product.stockOnHand, undefined)
  })
})
