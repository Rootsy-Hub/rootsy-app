import assert from "node:assert/strict"
import { describe, it } from "node:test"
import {
  buildChatRootsyDeletePreview,
  chatRootsyDeleteNeedsTypedConfirm,
  chatRootsyResourceDeletePhrase,
  resolveChatRootsyDeleteName,
  withChatRootsyDeleteConfirmBody,
} from "@/lib/chat/chatRootsyDeleteConfirm"

describe("confirmación de DELETE del chat Rootsy", () => {
  it("marca los DELETE que la API pide por nombre", () => {
    assert.equal(
      chatRootsyDeleteNeedsTypedConfirm(
        "DELETE",
        "/v1/pops/:popId/articles/:articleId",
      ),
      true,
    )
    assert.equal(
      chatRootsyDeleteNeedsTypedConfirm(
        "DELETE",
        "/v1/pops/:popId/categories/:categoryId",
      ),
      false,
    )
    assert.equal(
      chatRootsyDeleteNeedsTypedConfirm(
        "PATCH",
        "/v1/pops/:popId/articles/:articleId",
      ),
      false,
    )
  })

  it("arma la frase que espera la API", () => {
    assert.equal(
      chatRootsyResourceDeletePhrase("[Ejemplo] Artículo de muestra"),
      "Eliminar [Ejemplo] Artículo de muestra",
    )
  })

  it("lee el nombre de resultados del GET y no pisa un body ya confirmado", () => {
    const proposal = {
      method: "DELETE",
      path: "/v1/pops/:popId/articles/:articleId",
      filters: { articleId: "art-1" },
      action: "Eliminar el artículo de muestra",
    }
    const resultados = [
      {
        method: "GET",
        path: "/v1/pops/:popId/articles",
        action: "Buscar ejemplo",
        confirm: "confirm" as const,
        response: {
          data: {
            articles: [
              { id: "art-1", name: "[Ejemplo] Artículo de muestra" },
              { id: "art-2", name: "Otro" },
            ],
          },
        },
      },
    ]
    const name = resolveChatRootsyDeleteName(proposal, { resultados })
    assert.equal(name, "[Ejemplo] Artículo de muestra")
    assert.deepEqual(withChatRootsyDeleteConfirmBody(undefined, name!), {
      confirmationTyped: "Eliminar [Ejemplo] Artículo de muestra",
    })
    assert.deepEqual(
      withChatRootsyDeleteConfirmBody(
        { confirmationTyped: "Eliminar Otro" },
        name!,
      ),
      { confirmationTyped: "Eliminar Otro" },
    )
  })

  it("arma el preview del DELETE con el sujeto", () => {
    const preview = buildChatRootsyDeletePreview(
      {
        method: "DELETE",
        path: "/v1/pops/:popId/articles/art-1",
        filters: { articleId: "art-1" },
      },
      [
        {
          method: "GET",
          path: "/v1/pops/:popId/articles",
          action: "Buscar",
          confirm: "confirm",
          response: { articles: [{ id: "art-1", name: "Agua mineral" }] },
        },
      ],
    )
    assert.equal(preview?.subject, "Agua mineral")
    assert.deepEqual(preview?.changes, [])
  })
})
