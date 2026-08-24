import assert from "node:assert/strict"
import { describe, it } from "node:test"
import {
  collectChatRootsyAppliedActions,
  formatChatRootsySessionActionsMessage,
} from "@/lib/chat/chatRootsySessionActions"
import type { ChatMessageRow } from "@/app/[siteId]/[popId]/chat/chatTypes"

function row(partial: Partial<ChatMessageRow>): ChatMessageRow {
  return {
    id: partial.id ?? "m1",
    authorUserId: "rootsy",
    authorName: "Rootsy",
    body: partial.body ?? "",
    createdAt: "2026-08-23T16:00:00.000Z",
    mine: false,
    ...partial,
  }
}

describe("acciones aplicadas de la sesión", () => {
  it("lee las escrituras usadas aunque el cierre haya nombrado una sola", () => {
    const acciones = collectChatRootsyAppliedActions([
      row({
        id: "offers",
        toolOffers: [
          {
            tool: "patch_articles_articleId",
            label: "Actualizar Agua mineral",
            status: "used",
            method: "PATCH",
            path: "/v1/pops/:popId/articles/:articleId",
            filters: { articleId: "art-1" },
            body: { salePrice: 3750 },
            action: "Actualizar el precio de Agua mineral a $3750",
            preview: {
              subject: "Agua mineral",
              changes: [
                {
                  field: "Precio",
                  before: "$2.500",
                  after: "$3.750",
                  key: "salePrice",
                  beforeValue: 2500,
                  afterValue: 3750,
                },
              ],
              previous: { salePrice: 2500 },
            },
          },
          {
            tool: "patch_articles_articleId",
            label: "Actualizar Agua 2 L",
            status: "used",
            method: "PATCH",
            path: "/v1/pops/:popId/articles/:articleId",
            filters: { articleId: "art-2" },
            body: { salePrice: 6300 },
            action: "Actualizar el precio de Agua 2 L a $6300",
            preview: {
              subject: "Agua mineral 2 L x6",
              changes: [
                {
                  field: "Precio",
                  before: "$4.200",
                  after: "$6.300",
                  key: "salePrice",
                  beforeValue: 4200,
                  afterValue: 6300,
                },
              ],
              previous: { salePrice: 4200 },
            },
          },
        ],
      }),
    ])

    assert.equal(acciones.length, 2)
    assert.equal(acciones[0]?.sujeto, "Agua mineral")
    assert.equal(acciones[1]?.sujeto, "Agua mineral 2 L x6")
    const note = formatChatRootsySessionActionsMessage(acciones)
    assert.match(note ?? "", /Agua mineral 2 L x6/)
    assert.match(note ?? "", /TODAS/)
    assert.match(note ?? "", /Peso 20%/)
  })

  it("no toma lecturas ni ofertas sin usar", () => {
    const acciones = collectChatRootsyAppliedActions([
      row({
        toolOffers: [
          {
            tool: "get_articles",
            label: "Buscar aguas",
            status: "used",
            method: "GET",
            path: "/v1/pops/:popId/articles",
            action: "Buscar artículos que coincidan con Agua mineral",
          },
          {
            tool: "patch_articles_articleId",
            label: "Actualizar",
            status: "offered",
            method: "PATCH",
            path: "/v1/pops/:popId/articles/:articleId",
            filters: { articleId: "art-1" },
            body: { salePrice: 3750 },
            preview: {
              subject: "Agua mineral",
              changes: [
                { field: "Precio", before: "$2.500", after: "$3.750" },
              ],
            },
          },
        ],
      }),
    ])
    assert.equal(acciones.length, 0)
  })

  it("no toma escrituras de una corrida que cerró con error", () => {
    const acciones = collectChatRootsyAppliedActions([
      row({
        id: "offers",
        toolError: "No se puede eliminar Huevo: tiene movimientos de stock.",
        toolOffers: [
          {
            tool: "delete_articles_articleId",
            label: "Eliminar Huevo",
            status: "used",
            method: "DELETE",
            path: "/v1/pops/:popId/articles/:articleId",
            filters: { articleId: "art-1" },
            action: "Eliminar el artículo Huevo del catálogo",
            preview: {
              subject: "Huevo",
              changes: [],
            },
          },
        ],
      }),
      row({
        id: "close",
        body: "No pude borrar Huevo.",
        closeBrief: {
          pedido: "Borrá Huevo",
          estado: "no_aplicado",
          error: "No se puede eliminar Huevo: tiene movimientos de stock.",
          hechos: [{ accion: "Eliminar Huevo", sujeto: "Huevo" }],
        },
      }),
    ])
    assert.equal(acciones.length, 0)
  })
})
