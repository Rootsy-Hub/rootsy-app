import assert from "node:assert/strict"
import { describe, it } from "node:test"
import {
  applyChatRootsyWriteRecovery,
  followUpFromArticleResult,
  readChatRootsyMoneyAr,
  readChatRootsyProductQuery,
} from "@/lib/chat/chatRootsyWriteRecover"
import { parseChatRootsyPlannerPlan } from "@/lib/chat/tools/chatRootsyToolPlanner"

describe("recuperación de cambios de precio", () => {
  it("lee el precio argentino y el nombre del producto", () => {
    const text =
      "Cambiar el precio del producto Agua mineral de $2.500 a $3.750, equivalente a un aumento del 50%"
    assert.equal(readChatRootsyMoneyAr(text), 3750)
    assert.equal(readChatRootsyProductQuery(text), "Agua mineral")
  })

  it("arma GET + PATCH cuando el planificador dice que no hay herramientas", () => {
    const parsed = parseChatRootsyPlannerPlan(
      '{"queries":[],"clarifyingQuestion":"No es posible realizar modificaciones de precios con las herramientas disponibles."}',
    )
    assert.equal(parsed?.queries.length, 0)
    const recovered = applyChatRootsyWriteRecovery(
      {
        objective:
          "Cambiar el precio del producto Agua mineral de $2.500 a $3.750, equivalente a un aumento del 50% sobre el precio actual",
      },
      { proposals: [], discarded: 1, clarifyingQuestion: parsed?.clarifyingQuestion },
    )
    assert.equal(recovered.proposals[0]?.method, "GET")
    assert.equal(recovered.proposals[0]?.path, "/v1/pops/:popId/articles")
    assert.equal(recovered.proposals[0]?.filters.q, "Agua mineral")
    assert.equal(recovered.proposals[0]?.next?.method, "PATCH")
    assert.deepEqual(recovered.proposals[0]?.next?.body, { salePrice: 3750 })
    assert.equal(recovered.clarifyingQuestion, undefined)

    const patch = followUpFromArticleResult(
      recovered.proposals[0]!.next!,
      [{ rank: 1, id: "art-1", name: "Agua mineral" }],
      "Agua mineral",
    )
    assert.equal(patch?.method, "PATCH")
    assert.equal(patch?.filters.articleId, "art-1")
    assert.equal(patch?.body?.salePrice, 3750)
  })
})
