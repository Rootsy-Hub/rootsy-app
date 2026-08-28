import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { createPopLocalDatabase } from "./engine"
import {
  deleteMostradorOrderSlim,
  listMostradorOrdersSlim,
  replaceMostradorOrdersSlim,
  upsertMostradorOrderSlim,
} from "./mostradorBoardRepo"
import type { CounterOrder } from "@/app/[siteId]/[popId]/mostrador/mostradorTypes"

function order(partial: Partial<CounterOrder> & Pick<CounterOrder, "id">): CounterOrder {
  return {
    orderDay: "2026-01-01",
    orderNumber: 1,
    status: "preparing",
    fulfillmentType: "pickup",
    deliveryAddress: "",
    phone: "",
    driverName: "",
    estimatedMinutes: 20,
    notes: "",
    immediateFulfillment: false,
    saleId: null,
    isPaid: false,
    openedAt: "2026-01-01T20:00:00.000Z",
    updatedAt: "2026-01-01T20:00:00.000Z",
    deliveredAt: null,
    checkout: null,
    ...partial,
  }
}

describe("mostrador board sqlite", () => {
  it("persiste el tablero slim y no guarda checkout", async () => {
    const db = await createPopLocalDatabase()
    replaceMostradorOrdersSlim(db, [
      order({
        id: "o1",
        notes: "sin cebolla",
        checkout: { carrito: [{ productoId: "a1", cantidad: 1 }] } as never,
      }),
    ])
    const listed = listMostradorOrdersSlim(db)
    assert.equal(listed.length, 1)
    assert.equal(listed[0]?.notes, "sin cebolla")
    assert.equal(listed[0]?.checkout, null)
  })

  it("saca del tablero un pedido cobrado o cancelado", async () => {
    const db = await createPopLocalDatabase()
    replaceMostradorOrdersSlim(db, [order({ id: "o1" }), order({ id: "o2", orderNumber: 2 })])
    upsertMostradorOrderSlim(db, order({ id: "o1", saleId: "sale-1", isPaid: true }))
    assert.deepEqual(
      listMostradorOrdersSlim(db).map((row) => row.id),
      ["o2"],
    )
    deleteMostradorOrderSlim(db, "o2")
    assert.equal(listMostradorOrdersSlim(db).length, 0)
  })
})
