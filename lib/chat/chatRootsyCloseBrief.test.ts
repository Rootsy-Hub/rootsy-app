import assert from "node:assert/strict"
import { describe, it } from "node:test"
import {
  buildChatRootsyCloseBrief,
  fallbackChatRootsyCloseReply,
  readChatRootsyCloseReply,
} from "@/lib/chat/chatRootsyCloseBrief"

describe("cierre de Rootsy", () => {
  it("arma hechos aplicados con antes y después", () => {
    const brief = buildChatRootsyCloseBrief({
      pedido: "aumentá las aguas un 50%",
      proposals: [
        {
          tool: "patch_articles_articleId",
          method: "PATCH",
          path: "/v1/pops/:popId/articles/:articleId",
          filters: { articleId: "art-1" },
          body: { salePrice: 3750 },
          action: "Actualizar el precio de Agua mineral a $3750",
        },
        {
          tool: "patch_articles_articleId",
          method: "PATCH",
          path: "/v1/pops/:popId/articles/:articleId",
          filters: { articleId: "art-2" },
          body: { salePrice: 6300 },
          action: "Actualizar el precio de Agua 2 L a $6300",
        },
      ],
      resultados: [
        {
          method: "GET",
          path: "/v1/pops/:popId/articles",
          action: "Buscar aguas",
          confirm: "confirm",
          response: {
            articles: [
              { id: "art-1", name: "Agua mineral", salePrice: 2500 },
              { id: "art-2", name: "Agua mineral 2 L x6", salePrice: 4200 },
            ],
          },
        },
      ],
    })

    assert.equal(brief.estado, "aplicado")
    assert.equal(brief.hechos.length, 2)
    assert.equal(brief.hechos[0]?.sujeto, "Agua mineral")
    assert.equal(brief.hechos[0]?.cambios?.[0]?.campo, "Precio")
    const fallback = fallbackChatRootsyCloseReply(brief)
    assert.match(fallback, /Listo/)
    assert.match(fallback, /Agua mineral/)
    assert.match(fallback, /2[.\s]?500/)
    assert.match(fallback, /3[.\s]?750/)
  })

  it("junta escrituras de pasos previos con las de este paso", () => {
    const brief = buildChatRootsyCloseBrief({
      pedido: "aumentá las aguas",
      proposals: [
        {
          tool: "patch_articles_articleId",
          method: "PATCH",
          path: "/v1/pops/:popId/articles/:articleId",
          filters: { articleId: "art-2" },
          body: { salePrice: 6300 },
          action: "Actualizar el precio de Agua 2 L a $6300",
        },
      ],
      resultados: [
        {
          method: "GET",
          path: "/v1/pops/:popId/articles",
          action: "Buscar aguas",
          confirm: "confirm",
          response: {
            articles: [
              { id: "art-1", name: "Agua mineral", salePrice: 2500 },
              { id: "art-2", name: "Agua 2 L", salePrice: 4200 },
            ],
          },
        },
      ],
      previos: [
        {
          accion: "Actualizar Agua mineral",
          sujeto: "Agua mineral",
          id: "art-1",
          cambios: [
            { campo: "Precio", antes: "$2.500", despues: "$3.750" },
          ],
        },
      ],
    })

    assert.equal(brief.hechos.length, 2)
    assert.equal(brief.hechos[0]?.sujeto, "Agua mineral")
    assert.equal(brief.hechos[1]?.sujeto, "Agua 2 L")
  })

  it("usa el informe del planificador y no arma listado de filas", () => {
    const brief = buildChatRootsyCloseBrief({
      pedido: "qué puede hacer Mozos",
      proposals: [],
      toolResults: [
        {
          tool: "get_roles",
          periodLabel: "Ahora",
          title: "Listar roles",
          items: [
            { rank: 1, name: "Mozos", id: "role-1" },
            { rank: 2, name: "Caja", id: "role-2" },
          ],
        },
      ],
      informe: {
        respuesta:
          "El rol Mozos no tiene permiso para eliminar artículos. Puede consultar el catálogo y vender.",
        acciones: [
          "Listé los roles y tomé Mozos",
          "Leí la matriz de permisos de inventario",
        ],
      },
    })

    assert.equal(brief.estado, "consultado")
    assert.equal(brief.hechos.length, 0)
    assert.match(brief.informe?.respuesta ?? "", /Mozos/)
    assert.equal(
      fallbackChatRootsyCloseReply(brief),
      brief.informe?.respuesta,
    )
  })

  it("cierra como no_aplicado y no usa el informe de consulta", () => {
    const brief = buildChatRootsyCloseBrief({
      pedido: "borrá Huevo",
      proposals: [
        {
          tool: "delete_articles_articleId",
          method: "DELETE",
          path: "/v1/pops/:popId/articles/:articleId",
          filters: { articleId: "art-1" },
          action: "Eliminar el artículo Huevo del catálogo",
          subject: "Huevo",
        },
      ],
      resultados: [
        {
          method: "GET",
          path: "/v1/pops/:popId/articles",
          action: "Buscar Huevo",
          confirm: "confirm",
          response: {
            articles: [{ id: "art-1", name: "Huevo" }],
          },
        },
      ],
      informe: {
        respuesta: "Encontré Huevo en el catálogo.",
        acciones: ["Busqué Huevo"],
      },
      error: "No se puede eliminar Huevo: tiene movimientos de stock.",
    })

    assert.equal(brief.estado, "no_aplicado")
    assert.equal(brief.hechos[0]?.sujeto, "Huevo")
    assert.equal(
      fallbackChatRootsyCloseReply(brief),
      "No se puede eliminar Huevo: tiene movimientos de stock.",
    )
  })

  it("saca el reply si la IA cierra en JSON de primer turno", () => {
    assert.equal(
      readChatRootsyCloseReply(
        '{"reply":"Listo, las aguas ya quedaron al nuevo precio.","data_request":null}',
      ),
      "Listo, las aguas ya quedaron al nuevo precio.",
    )
  })
})
