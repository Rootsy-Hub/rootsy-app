import assert from "node:assert/strict"
import { describe, it } from "node:test"
import type { QueryClient } from "@tanstack/react-query"
import { applyCajasRealtimeEvent } from "./apply"
import { cashRegisterOpenSessionQueryKey } from "../queryKeys"
import type { DomainEvent } from "../realtime/protocol"

function fakeQueryClient() {
  const data = new Map<string, unknown>()
  return {
    data,
    client: {
      setQueryData(key: unknown, value: unknown) {
        data.set(JSON.stringify(key), value)
      },
      invalidateQueries() {
        return Promise.resolve()
      },
    } as unknown as QueryClient,
  }
}

function event(type: string, payload: Record<string, unknown>): DomainEvent {
  return {
    id: "e1",
    seq: 1,
    type,
    popId: "pop-1",
    actorId: "u1",
    occurredAt: "2026-01-01T00:00:00.000Z",
    resource: { type: "cajas", id: "u1" },
    payload,
  }
}

describe("applyCajasRealtimeEvent", () => {
  it("al cerrar deja open-session en null", () => {
    const { client, data } = fakeQueryClient()
    applyCajasRealtimeEvent(client, "pop-1", event("cajas.session_closed", {}))
    assert.equal(data.get(JSON.stringify(cashRegisterOpenSessionQueryKey("pop-1"))), null)
  })

  it("al abrir parchea el snapshot slim", () => {
    const { client, data } = fakeQueryClient()
    const session = {
      sessionId: "sess-1",
      cashRegisterId: "reg-1",
      openedAt: "2026-01-01T00:00:00.000Z",
      salePoint: null,
    }
    applyCajasRealtimeEvent(client, "pop-1", event("cajas.session_opened", session))
    assert.deepEqual(
      data.get(JSON.stringify(cashRegisterOpenSessionQueryKey("pop-1"))),
      session,
    )
  })
})
