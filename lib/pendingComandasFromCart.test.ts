import assert from "node:assert/strict"
import { describe, it } from "node:test"
import {
  pendingComandaItemsFromCart,
  planOptimisticComandaSend,
} from "./pendingComandasFromCart"

describe("pendingComandaItemsFromCart", () => {
  it("arma recetas pending desde el carrito, sin GET", () => {
    const items = pendingComandaItemsFromCart({
      carrito: [
        {
          lineId: "line-1",
          productoId: "r1",
          kind: "recipe",
          cantidad: 2,
          comandaStatus: "pending",
          snapshot: { nombre: "Milanesa" },
        },
        {
          lineId: "line-2",
          productoId: "r2",
          kind: "recipe",
          cantidad: 1,
          comandaStatus: "sent",
          snapshot: { nombre: "Ya enviada" },
        },
      ],
      productosByKey: new Map([
        ["recipe:r1", { nombre: "Milanesa", stationId: "st-1" }],
        ["recipe:r2", { nombre: "Ya enviada", stationId: "st-1" }],
      ]),
      comments: { "line-1": "sin sal" },
      stationNames: new Map([["st-1", "Cocina"]]),
    })
    assert.equal(items.length, 1)
    assert.equal(items[0]?.cartLineId, "line-1")
    assert.equal(items[0]?.quantity, 2)
    assert.equal(items[0]?.comment, "sin sal")
    assert.equal(items[0]?.stationName, "Cocina")
  })

  it("expande slots de promo comandables", () => {
    const items = pendingComandaItemsFromCart({
      carrito: [
        {
          lineId: "promo-1",
          productoId: "p1",
          kind: "promotion",
          cantidad: 1,
          comandaStatus: "pending",
          promotionSelections: [
            {
              slotId: "slot-a",
              kind: "recipe",
              refId: "r1",
              name: "Burger",
              slotQuantity: 2,
            },
            { slotId: "slot-b", kind: "article", refId: "a1", name: "Gaseosa" },
          ],
        },
      ],
      productosByKey: new Map([
        ["recipe:r1", { nombre: "Burger", stationId: "st-1" }],
      ]),
    })
    assert.equal(items.length, 1)
    assert.equal(items[0]?.cartLineId, "promo-1:slot-a")
    assert.equal(items[0]?.quantity, 2)
  })

  it("omite recetas sin estación", () => {
    const items = pendingComandaItemsFromCart({
      carrito: [
        {
          lineId: "line-1",
          productoId: "r1",
          kind: "recipe",
          cantidad: 1,
          comandaStatus: "pending",
        },
      ],
      productosByKey: new Map([["recipe:r1", { nombre: "Agua" }]]),
    })
    assert.equal(items.length, 0)
  })
})

describe("planOptimisticComandaSend", () => {
  it("manda la línea entera sin peel", () => {
    const plan = planOptimisticComandaSend({
      items: [
        {
          id: "line-1",
          cartLineId: "line-1",
          recipeName: "Milanesa",
          quantity: 2,
          comment: "",
          stationId: "st-1",
          stationName: "Cocina",
        },
      ],
      quantities: { "line-1": 2 },
    })
    assert.deepEqual(plan.sentCartLineIds, ["line-1"])
    assert.equal(plan.peels.length, 0)
  })

  it("pela si se manda menos que el pending", () => {
    const plan = planOptimisticComandaSend({
      items: [
        {
          id: "line-1",
          cartLineId: "line-1",
          recipeName: "Milanesa",
          quantity: 3,
          comment: "",
          stationId: "st-1",
          stationName: "Cocina",
        },
      ],
      quantities: { "line-1": 1 },
    })
    assert.equal(plan.peels.length, 1)
    assert.equal(plan.peels[0]?.sentQuantity, 1)
    assert.equal(plan.peels[0]?.remainderQuantity, 2)
    assert.equal(plan.sentCartLineIds[0], plan.peels[0]?.sentCartLineId)
  })
})
