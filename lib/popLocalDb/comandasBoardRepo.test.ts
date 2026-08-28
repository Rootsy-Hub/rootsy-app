import assert from "node:assert/strict"
import { describe, it } from "node:test"
import type { ComandaTicket } from "@/app/[siteId]/[popId]/comandas/comandasTypes"
import { createPopLocalDatabase } from "./engine"
import {
  deleteComandaTicket,
  deleteComandaTicketsBySendId,
  listComandaTicketsByStation,
  replaceComandaTickets,
  upsertComandaTicket,
} from "./comandasBoardRepo"

function ticket(
  partial: Partial<ComandaTicket> & Pick<ComandaTicket, "id" | "stationId">,
): ComandaTicket {
  return {
    status: "sent",
    sourceKind: "table",
    sourceId: "session-1",
    cartLineId: "line-1",
    recipeId: "recipe-1",
    recipeName: "Milanesa",
    quantity: 1,
    comment: "",
    originLabel: "Mesa 4",
    customerName: "",
    createdAt: "2026-01-01T20:00:00.000Z",
    updatedAt: "2026-01-01T20:00:00.000Z",
    statusChangedAt: "2026-01-01T20:00:00.000Z",
    sentAt: "2026-01-01T20:00:00.000Z",
    preparingAt: null,
    readyAt: null,
    deliveredAt: null,
    sendId: "send-1",
    sendKind: "order",
    sendComment: "",
    ...partial,
  }
}

describe("comandas board sqlite", () => {
  it("persiste el ticket completo y lo lista por estación", async () => {
    const db = await createPopLocalDatabase()
    replaceComandaTickets(db, [
      ticket({
        id: "t1",
        stationId: "bar",
        comment: "sin hielo",
        quantity: 2,
      }),
      ticket({ id: "t2", stationId: "cocina", recipeName: "Ensalada" }),
    ])
    const bar = listComandaTicketsByStation(db, "bar")
    assert.equal(bar.length, 1)
    assert.equal(bar[0]?.comment, "sin hielo")
    assert.equal(bar[0]?.quantity, 2)
    assert.equal(bar[0]?.recipeName, "Milanesa")
    assert.equal(listComandaTicketsByStation(db, "cocina").length, 1)
  })

  it("no guarda pending ni voided y los saca del tablero", async () => {
    const db = await createPopLocalDatabase()
    replaceComandaTickets(db, [
      ticket({ id: "t1", stationId: "bar" }),
      ticket({ id: "t2", stationId: "bar", status: "pending" }),
    ])
    assert.deepEqual(
      listComandaTicketsByStation(db, "bar").map((row) => row.id),
      ["t1"],
    )
    upsertComandaTicket(db, ticket({ id: "t1", stationId: "bar", status: "voided" }))
    assert.equal(listComandaTicketsByStation(db, "bar").length, 0)
  })

  it("borra por sendId y deja el resto", async () => {
    const db = await createPopLocalDatabase()
    replaceComandaTickets(db, [
      ticket({ id: "t1", stationId: "bar", sendId: "send-a" }),
      ticket({ id: "t2", stationId: "bar", sendId: "send-a", cartLineId: "line-2" }),
      ticket({ id: "t3", stationId: "bar", sendId: "send-b" }),
    ])
    deleteComandaTicketsBySendId(db, "send-a")
    assert.deepEqual(
      listComandaTicketsByStation(db, "bar").map((row) => row.id),
      ["t3"],
    )
    deleteComandaTicket(db, "t3")
    assert.equal(listComandaTicketsByStation(db, "bar").length, 0)
  })
})
