import assert from "node:assert/strict"
import { describe, it } from "node:test"
import {
  chatRootsyDevActorLabel,
  chatRootsyDevCall,
  fillChatRootsyDevStations,
  formatChatRootsyDevHttpWire,
  formatChatRootsyDevWireJson,
  mergeChatRootsyDevTraces,
  redactChatRootsyDevUrl,
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

  it("siempre deja los 3 pasos, vacíos si no hay dato", () => {
    const filled = fillChatRootsyDevStations({
      calls: [
        chatRootsyDevCall({
          id: "call:rootsy:apertura",
          actor: "rootsy",
          phase: "Apertura",
          userMessage: "si el aceite de cocina ponelo a 3500",
          sent: '{"messages":[]}',
          received: '{"reply":"voy a actualizar"}',
        }),
      ],
    })
    assert.equal(filled.calls.length, 3)
    assert.equal(filled.calls[0]?.phase, "Apertura")
    assert.equal(filled.calls[1]?.actor, "planner")
    assert.equal(filled.calls[1]?.sent, "")
    assert.equal(filled.calls[1]?.received, "")
    assert.equal(filled.calls[2]?.phase, "Cierre")
    assert.equal(filled.calls[2]?.sent, "")
    assert.equal(filled.calls[2]?.received, "")
  })

  it("pone aclaración en el tercer paso si no hubo cierre", () => {
    const filled = fillChatRootsyDevStations({
      calls: [
        chatRootsyDevCall({
          id: "call:rootsy:apertura",
          actor: "rootsy",
          phase: "Apertura",
          sent: "a",
          received: "b",
        }),
        chatRootsyDevCall({
          id: "call:rootsy:aclaracion",
          actor: "rootsy",
          phase: "Aclaración",
          sent: "pregunta",
          received: "¿cuál aceite?",
        }),
      ],
    })
    assert.equal(filled.calls[2]?.phase, "Aclaración")
    assert.equal(filled.calls[2]?.received, "¿cuál aceite?")
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

  it("pretty-printa el JSON de red y deja el texto crudo si no parsea", () => {
    assert.equal(
      formatChatRootsyDevWireJson('{"prompt":{"id":"pmpt_x"}}'),
      JSON.stringify({ prompt: { id: "pmpt_x" } }, null, 2),
    )
    assert.equal(formatChatRootsyDevWireJson("no es json"), "no es json")
  })

  it("arma el enviado HTTP con URL y body, sin API keys", () => {
    const wire = formatChatRootsyDevHttpWire({
      url: "https://generativelanguage.googleapis.com/v1beta/models/gemini-x:generateContent?key=secret-token",
      body: { prompt: { id: "pmpt_rootsy" }, input: [{ role: "user", content: "hola" }] },
    })
    assert.match(wire, /pmpt_rootsy/)
    assert.match(wire, /v1beta\/models\/gemini-x:generateContent/)
    assert.equal(wire.includes("secret-token"), false)
    assert.equal(
      redactChatRootsyDevUrl(
        "https://api.example/v1?key=abc&other=1",
      ).includes("abc"),
      false,
    )
  })
})
