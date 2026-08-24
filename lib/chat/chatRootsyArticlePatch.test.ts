import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { chatRootsyOfferKey } from "@/lib/chat/chatRootsyPlannerStep"
import { orderChatRootsyProposals } from "@/lib/chat/tools/chatRootsyToolPlanner"

describe("patch de artículos en el chat", () => {
  it("no pisa dos PATCH del mismo endpoint", () => {
    const ordered = orderChatRootsyProposals([
      {
        tool: "patch_articles_articleId",
        method: "PATCH",
        path: "/v1/pops/:popId/articles/:articleId",
        filters: { articleId: "a1" },
        body: { salePrice: 6000 },
      },
      {
        tool: "patch_articles_articleId",
        method: "PATCH",
        path: "/v1/pops/:popId/articles/:articleId",
        filters: { articleId: "a2" },
        body: { salePrice: 4800 },
      },
    ])
    assert.equal(ordered.length, 2)
    assert.notEqual(
      chatRootsyOfferKey(ordered[0]!),
      chatRootsyOfferKey(ordered[1]!),
    )
  })
})
