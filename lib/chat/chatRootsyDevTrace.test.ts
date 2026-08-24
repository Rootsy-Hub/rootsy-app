import assert from "node:assert/strict"
import { describe, it } from "node:test"
import {
  chatRootsyDevActorLabel,
  chatRootsyDevCall,
  mergeChatRootsyDevTraces,
} from "@/lib/chat/chatRootsyDevTrace"

describe("historial DEV del chat Rootsy", () => {
  it("arma una llamada con enviado y recibido", () => {
    const call = chatRootsyDevCall({
      actor: "planner",
      phase: "Plan",
      sent: '{"today":"2026-08-24"}',
      received: '{"status":"ok"}',
    })
    assert.equal(call.actor, "planner")
    assert.equal(chatRootsyDevActorLabel("planner"), "Planificador")
    assert.match(call.sent, /today/)
    assert.match(call.received, /status/)
  })

  it("concatena Rootsy, Planificador y Rootsy otra vez", () => {
    const open = {
      calls: [
        chatRootsyDevCall({
          id: "call:rootsy:apertura",
          actor: "rootsy",
          phase: "Apertura",
          userMessage: "subí las aguas",
          sent: '{"messages":[]}',
          received: '{"reply":"voy a mirar"}',
        }),
      ],
    }
    const next = {
      calls: [
        chatRootsyDevCall({
          id: "call:planner",
          actor: "planner",
          sent: '{"data_request":{}}',
          received: '{"status":"ok"}',
        }),
        chatRootsyDevCall({
          id: "call:rootsy:cierre",
          actor: "rootsy",
          phase: "Cierre",
          sent: '{"messages":[]}',
          received: "Listo, las aguas quedaron.",
        }),
      ],
    }
    const merged = mergeChatRootsyDevTraces([open, next])
    assert.ok(merged)
    assert.equal(merged!.calls.length, 3)
    assert.equal(merged!.calls[0]?.actor, "rootsy")
    assert.equal(merged!.calls[1]?.actor, "planner")
    assert.equal(merged!.calls[2]?.phase, "Cierre")
  })

  it("se queda con el último error", () => {
    const merged = mergeChatRootsyDevTraces([
      {
        error: "primero",
        calls: [chatRootsyDevCall({ actor: "planner", sent: "a", received: "b" })],
      },
      {
        error: "Esa persona no tiene acceso activo a Rootsy.",
        calls: [chatRootsyDevCall({ actor: "planner", sent: "c", received: "d" })],
      },
    ])
    assert.equal(
      merged?.error,
      "Esa persona no tiene acceso activo a Rootsy.",
    )
  })
})
