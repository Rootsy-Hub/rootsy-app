import assert from "node:assert/strict"
import { describe, it } from "node:test"
import {
  chatRootsyDevLaneLabel,
  chatRootsyDevStep,
  mergeChatRootsyDevTraces,
} from "@/lib/chat/chatRootsyDevTrace"

describe("historial DEV del chat Rootsy", () => {
  it("arma un paso con lane y JSON", () => {
    const step = chatRootsyDevStep({
      lane: "planner",
      title: "Paso 2 · input",
      note: "Siguiente turno",
      body: { paso: 2, resultados: [] },
    })
    assert.equal(step.lane, "planner")
    assert.match(step.body ?? "", /"paso": 2/)
    assert.equal(chatRootsyDevLaneLabel("planner"), "Planificador")
  })

  it("concatena el ida y vuelta de una corrida", () => {
    const open = {
      steps: [
        chatRootsyDevStep({
          lane: "rootsy",
          title: "Apertura · parseado",
          body: { data_request: { objective: "cambiar rol" } },
        }),
        chatRootsyDevStep({
          lane: "planner",
          title: "Paso 1 · input",
          body: '{"paso":1}',
        }),
      ],
    }
    const next = {
      steps: [
        chatRootsyDevStep({
          lane: "api",
          title: "Paso 1 · consultas",
          body: { ok: true },
        }),
        chatRootsyDevStep({
          lane: "planner",
          title: "Paso 2 · crudo",
          body: '{"status":"ok"}',
        }),
      ],
    }
    const merged = mergeChatRootsyDevTraces([open, next])
    assert.ok(merged)
    assert.equal(merged!.steps.length, 4)
    assert.equal(merged!.steps[0]?.lane, "rootsy")
    assert.equal(merged!.steps[3]?.title, "Paso 2 · crudo")
  })

  it("se queda con el último error", () => {
    const merged = mergeChatRootsyDevTraces([
      {
        error: "primero",
        steps: [chatRootsyDevStep({ lane: "api", title: "Consultas", body: {} })],
      },
      {
        error: "Esa persona no tiene acceso activo a Rootsy.",
        steps: [chatRootsyDevStep({ lane: "api", title: "Reintento", body: {} })],
      },
    ])
    assert.equal(
      merged?.error,
      "Esa persona no tiene acceso activo a Rootsy.",
    )
  })
})
