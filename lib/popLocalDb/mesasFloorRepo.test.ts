import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { createPopLocalDatabase } from "./engine"
import {
  deleteMesasSessionSlim,
  listMesasLayout,
  listMesasReservationsSlim,
  listMesasReservationSettings,
  listMesasSessionsSlim,
  patchMesasTablePosition,
  replaceMesasFloorSnapshot,
  upsertMesasReservationSlim,
  upsertMesasSessionSlim,
} from "./mesasFloorRepo"

describe("mesas floor sqlite", () => {
  it("persiste layout y no guarda checkout en sesiones", async () => {
    const db = await createPopLocalDatabase()
    replaceMesasFloorSnapshot(db, {
      layout: {
        salons: [{ id: "s1", name: "Salón", sortOrder: 1, isActive: true }],
        tables: [
          {
            id: "t1",
            salonId: "s1",
            label: "1",
            shape: { kind: "round", size: "m" },
            x: 40,
            y: 48,
            rotation: 0,
            seats: 4,
            sortOrder: 1,
            isActive: true,
          },
        ],
        decors: [],
      },
      sessions: [
        {
          id: "sess-1",
          tableIds: ["t1"],
          waiterId: "w1",
          guestCount: 2,
          note: "ventana",
          openedAt: "2026-01-01T20:00:00.000Z",
          updatedAt: "2026-01-01T20:05:00.000Z",
          checkout: {
            carrito: [
              {
                productoId: "a1",
                cantidad: 1,
              },
            ],
          } as never,
          floorStatus: "open",
        },
      ],
      reservations: [
        {
          id: "r1",
          tableId: "t1",
          tableIds: ["t1"],
          clientId: null,
          clientName: "Ana",
          guestCount: 2,
          arrivalAt: "2026-01-01T21:00:00.000Z",
          status: "confirmed",
          note: "",
          updatedAt: "2026-01-01T18:00:00.000Z",
        },
      ],
      settings: {
        settings: { floorBufferMinutes: 30, graceMinutes: 10 },
        operationalDayCloseTime: "06:00",
      },
    })

    const layout = listMesasLayout(db)
    assert.equal(layout.salons[0]?.name, "Salón")
    assert.equal(layout.tables[0]?.label, "1")

    const sessions = listMesasSessionsSlim(db)
    assert.equal(sessions.length, 1)
    assert.equal(sessions[0]?.checkout, null)
    assert.deepEqual(sessions[0]?.tableIds, ["t1"])

    const reservations = listMesasReservationsSlim(db)
    assert.equal(reservations[0]?.clientName, "Ana")

    const settings = listMesasReservationSettings(db)
    assert.equal(settings.settings.floorBufferMinutes, 30)
    assert.equal(settings.operationalDayCloseTime, "06:00")
  })

  it("mueve una mesa y borra una sesión slim", async () => {
    const db = await createPopLocalDatabase()
    replaceMesasFloorSnapshot(db, {
      layout: {
        salons: [{ id: "s1", name: "Salón", sortOrder: 1, isActive: true }],
        tables: [
          {
            id: "t1",
            salonId: "s1",
            label: "1",
            shape: { kind: "round", size: "m" },
            x: 10,
            y: 12,
            rotation: 0,
            seats: 2,
            sortOrder: 1,
            isActive: true,
          },
        ],
        decors: [],
      },
      sessions: [
        {
          id: "sess-1",
          tableIds: ["t1"],
          waiterId: "",
          guestCount: null,
          note: "",
          openedAt: "2026-01-01T20:00:00.000Z",
          updatedAt: "2026-01-01T20:00:00.000Z",
          checkout: null,
          floorStatus: "paying",
        },
      ],
      reservations: [],
      settings: {
        settings: { floorBufferMinutes: 45, graceMinutes: 20 },
        operationalDayCloseTime: "06:00",
      },
    })

    patchMesasTablePosition(db, "t1", { x: 80, y: 90 })
    assert.deepEqual(
      listMesasLayout(db).tables[0] ? { x: listMesasLayout(db).tables[0].x, y: listMesasLayout(db).tables[0].y } : null,
      { x: 80, y: 90 },
    )

    upsertMesasSessionSlim(db, {
      id: "sess-1",
      tableIds: ["t1"],
      waiterId: "w2",
      guestCount: 3,
      note: "",
      openedAt: "2026-01-01T20:00:00.000Z",
      updatedAt: "2026-01-01T20:10:00.000Z",
      checkout: null,
      floorStatus: "paying",
    })
    assert.equal(listMesasSessionsSlim(db)[0]?.waiterId, "w2")

    deleteMesasSessionSlim(db, "sess-1")
    assert.equal(listMesasSessionsSlim(db).length, 0)

    upsertMesasReservationSlim(db, {
      id: "r2",
      tableId: "t1",
      tableIds: ["t1"],
      clientId: null,
      clientName: "Luis",
      guestCount: 4,
      arrivalAt: "2026-01-02T21:00:00.000Z",
      status: "pending",
      note: "cumple",
      updatedAt: "2026-01-02T10:00:00.000Z",
    })
    assert.equal(listMesasReservationsSlim(db)[0]?.clientName, "Luis")
  })
})
