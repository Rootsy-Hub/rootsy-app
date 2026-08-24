import assert from "node:assert/strict"
import { describe, it } from "node:test"
import {
  buildChatRootsyOfferPreview,
  readPlannerTargetId,
} from "@/lib/chat/chatRootsyOfferPreview"

describe("preview de confirmación del planificador", () => {
  it("lee el id del PATCH y arma antes → después", () => {
    const preview = buildChatRootsyOfferPreview(
      {
        method: "PATCH",
        path: "/v1/pops/:popId/articles/:articleId",
        filters: { articleId: "art-1" },
        body: { salePrice: 3750 },
        action: "Actualizar el precio de Agua mineral a $3750",
      },
      [
        {
          method: "GET",
          path: "/v1/pops/:popId/articles",
          action: "Buscar aguas",
          confirm: "confirm",
          response: {
            data: {
              articles: [
                { id: "art-1", name: "Agua mineral", salePrice: 2500 },
                { id: "art-2", name: "Agua 2 L", salePrice: 4200 },
              ],
            },
          },
        },
      ],
    )

    assert.ok(preview)
    assert.equal(preview?.subject, "Agua mineral")
    assert.equal(preview?.changes.length, 1)
    assert.equal(preview?.changes[0]?.field, "Precio")
    assert.match(preview?.changes[0]?.before ?? "", /2[.\s]?500/)
    assert.match(preview?.changes[0]?.after ?? "", /3[.\s]?750/)
  })

  it("resuelve el rol a un nombre y no muestra el uuid", () => {
    const preview = buildChatRootsyOfferPreview(
      {
        method: "PATCH",
        path: "/v1/pops/:popId/hr/members/:memberUserId/role",
        filters: { memberUserId: "u-1" },
        body: { roleId: "role-mozos" },
        action: "Cambiar el rol de Noel a Mozos",
      },
      [
        {
          method: "GET",
          path: "/v1/pops/:popId/hr",
          action: "Buscar el usuario Noel y el rol mozos",
          confirm: "confirm",
          response: {
            members: [
              {
                userId: "u-1",
                firstName: "Noel",
                lastName: "Pérez",
                roleId: "role-cajero",
                roleDisplayName: "Cajero",
                isActive: true,
              },
            ],
            roles: [
              { id: "role-cajero", displayName: "Cajero" },
              { id: "role-mozos", displayName: "Mozos" },
            ],
          },
        },
      ],
    )
    assert.ok(preview)
    assert.equal(preview?.subject, "Noel Pérez")
    assert.equal(preview?.changes[0]?.field, "Rol")
    assert.equal(preview?.changes[0]?.before, "Cajero")
    assert.equal(preview?.changes[0]?.after, "Mozos")
    assert.equal(/[0-9a-f-]{36}/i.test(JSON.stringify(preview?.changes)), false)
  })

  it("saca el uuid del path si no vino en filters", () => {
    assert.equal(
      readPlannerTargetId({
        path: "/v1/pops/:popId/articles/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
        filters: {},
      }),
      "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    )
  })
})
