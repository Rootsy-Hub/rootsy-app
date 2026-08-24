import assert from "node:assert/strict"
import { describe, it } from "node:test"
import {
  OPENAI_RESPONSES_URL,
  buildOpenAiStoredPromptRequestBody,
  withJsonKeyword,
} from "@/lib/chat/openaiStoredPromptBody"
import { formatChatRootsyDevHttpWire } from "@/lib/chat/chatRootsyDevTrace"

describe("body exacto del prompt guardado de ChatGPT", () => {
  it("es el POST a /v1/responses con prompt.id e input", () => {
    const body = buildOpenAiStoredPromptRequestBody({
      promptId: "pmpt_planificador",
      messages: [{ role: "user", content: '{"today":"2026-08-24"}' }],
    })
    assert.deepEqual(body.prompt, { id: "pmpt_planificador" })
    assert.equal(body.input[0]?.role, "user")
    assert.match(body.input[0]?.content ?? "", /today/)
    const wire = formatChatRootsyDevHttpWire({
      url: OPENAI_RESPONSES_URL,
      body,
    })
    assert.match(wire, /api\.openai\.com\/v1\/responses/)
    assert.match(wire, /pmpt_planificador/)
    assert.equal(wire.includes("Authorization"), false)
  })

  it("pega el keyword JSON si el input no lo trae", () => {
    const withKeyword = withJsonKeyword([
      { role: "user", content: "subí el aceite a 3500" },
    ])
    assert.match(withKeyword[0]?.content ?? "", /Respondé solo JSON/)
    const alreadyJson = withJsonKeyword([
      { role: "user", content: "Acá va el json del pedido" },
    ])
    assert.equal(alreadyJson[0]?.content.includes("Respondé solo JSON"), false)
  })
})
