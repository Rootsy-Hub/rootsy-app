import assert from "node:assert/strict"
import { describe, it } from "node:test"
import {
  buildChatRootsyPlannerStoredPayload,
  canContinueChatRootsyPlanner,
  completeChatRootsyPlannerInforme,
  pickChatRootsyPlannerSelectedResponse,
  compactChatRootsyPlannerChoiceResponse,
  looksLikeChatRootsyPluralPedido,
  looksLikeChatRootsyWritePedido,
  readChatRootsyPlannerConfirm,
  resolveChatRootsyPlannerPickConfirm,
  readChatRootsyPlannerInforme,
  sanitizeChatRootsyPlannerAction,
} from "@/lib/chat/chatRootsyPlannerStep"

describe("pasos del planificador Rootsy", () => {
  it("lee confirm, confirm_one y confirm_many", () => {
    assert.equal(readChatRootsyPlannerConfirm("confirm_one"), "confirm_one")
    assert.equal(readChatRootsyPlannerConfirm("choose_one"), "confirm_one")
    assert.equal(readChatRootsyPlannerConfirm("confirm_many"), "confirm_many")
    assert.equal(readChatRootsyPlannerConfirm("choose_many"), "confirm_many")
    assert.equal(readChatRootsyPlannerConfirm("confirm"), "confirm")
    assert.equal(readChatRootsyPlannerConfirm(undefined), "confirm")
  })

  it("sube confirm_one a confirm_many si el pedido es plural", () => {
    assert.equal(
      looksLikeChatRootsyPluralPedido("quiero aumentar un 10% al precio de las cocas"),
      true,
    )
    assert.equal(
      looksLikeChatRootsyPluralPedido("aumentá la coca un 10%"),
      false,
    )
    assert.equal(
      resolveChatRootsyPlannerPickConfirm({
        confirm: "confirm_one",
        message: "aumentá un 10% las cocas",
        itemCount: 3,
      }),
      "confirm_many",
    )
    assert.equal(
      resolveChatRootsyPlannerPickConfirm({
        confirm: "confirm_one",
        message: "eliminá Huevo",
        itemCount: 3,
      }),
      "confirm_one",
    )
  })

  it("en una consulta no pide elegir: sigue con todos los resultados", () => {
    assert.equal(
      looksLikeChatRootsyWritePedido("en que precio estan ahora?"),
      false,
    )
    assert.equal(
      looksLikeChatRootsyWritePedido(
        "quiero cambiar el precio de las aguas y aumentarle un 10%",
      ),
      true,
    )
    assert.equal(looksLikeChatRootsyWritePedido("eliminá Huevo"), true)
    assert.equal(
      resolveChatRootsyPlannerPickConfirm({
        confirm: "confirm_one",
        message: "en que precio estan ahora?",
        objective: "precios de las aguas",
        itemCount: 5,
      }),
      "confirm",
    )
    assert.equal(
      resolveChatRootsyPlannerPickConfirm({
        confirm: "confirm_many",
        message: "en que precio estan ahora?",
        objective: "consultar precios de las aguas",
        itemCount: 5,
      }),
      "confirm",
    )
    assert.equal(
      resolveChatRootsyPlannerPickConfirm({
        confirm: "confirm_one",
        message: "en que precio estan ahora?",
        objective: "cambiar el precio de las aguas un 10%",
        itemCount: 5,
      }),
      "confirm_many",
    )
  })

  it("limpia action y no deja endpoints", () => {
    assert.equal(
      sanitizeChatRootsyPlannerAction(
        "Buscar artículos que coincidan con Agua mineral",
        "Consultar esos datos",
      ),
      "Buscar artículos que coincidan con Agua mineral",
    )
    assert.equal(
      sanitizeChatRootsyPlannerAction(
        "GET /v1/pops/:popId/articles",
        "Buscar artículos",
      ),
      "Buscar artículos",
    )
  })

  it("arma el payload de ChatGPT con paso y resultados", () => {
    const payload = JSON.parse(
      buildChatRootsyPlannerStoredPayload({
        today: "2026-08-23",
        message: "subí el agua 50%",
        dataRequest: { objective: "aumentar 50% el precio del agua mineral" },
        paso: 2,
        resultados: [
          {
            method: "GET",
            path: "/v1/pops/:popId/articles",
            action: "Buscar artículos que coincidan con Agua mineral",
            confirm: "confirm_one",
            response: { id: "art-1", name: "Agua mineral 500", salePrice: 2500 },
          },
        ],
      }),
    ) as {
      paso: number
      pasos_max: number
      resultados: Array<{ confirm: string; response: { id: string } }>
      data_request: { objective: string }
    }

    assert.equal(payload.paso, 2)
    assert.equal(payload.pasos_max, 4)
    assert.equal(payload.resultados[0]?.confirm, "confirm_one")
    assert.equal(payload.resultados[0]?.response.id, "art-1")
    assert.equal(
      payload.data_request.objective,
      "aumentar 50% el precio del agua mineral",
    )
    assert.equal("hint" in payload, false)
    assert.equal("acciones_sesion" in payload, false)
  })

  it("incluye acciones_sesion cuando hay escrituras previas", () => {
    const payload = JSON.parse(
      buildChatRootsyPlannerStoredPayload({
        today: "2026-08-23",
        message: "revertí las aguas",
        dataRequest: { objective: "volver las aguas al precio anterior" },
        accionesSesion: [
          {
            accion: "Actualizar Agua mineral",
            sujeto: "Agua mineral",
            id: "art-1",
            cambios: [
              {
                campo: "Precio",
                antes: "$2.500",
                despues: "$3.750",
                clave: "salePrice",
                valorAntes: 2500,
                valorDespues: 3750,
              },
            ],
          },
          {
            accion: "Actualizar Agua 2 L",
            sujeto: "Agua mineral 2 L x6",
            id: "art-2",
          },
        ],
      }),
    ) as {
      acciones_sesion: Array<{ sujeto?: string; id?: string }>
      nota_acciones_sesion?: string
    }

    assert.equal(payload.acciones_sesion.length, 2)
    assert.equal(payload.acciones_sesion[1]?.sujeto, "Agua mineral 2 L x6")
    assert.match(payload.nota_acciones_sesion ?? "", /todos/i)
  })

  it("elige la fila del payload cuando confirm_one", () => {
    const selected = pickChatRootsyPlannerSelectedResponse(
      {
        data: [
          { id: "a", name: "Agua 500", salePrice: 2500 },
          { id: "b", name: "Agua 1.5", salePrice: 1800 },
        ],
      },
      { id: "b", name: "Agua 1.5" },
    ) as { id: string; salePrice: number }

    assert.equal(selected.id, "b")
    assert.equal(selected.salePrice, 1800)

    const many = compactChatRootsyPlannerChoiceResponse(
      { confirm: "confirm_many", payload: { data: [
        { id: "a", name: "Agua 500", salePrice: 2500 },
        { id: "b", name: "Agua 1.5", salePrice: 1800 },
      ] } },
      [
        { id: "a", name: "Agua 500" },
        { id: "b", name: "Agua 1.5" },
      ],
    ) as Array<{ id: string }>
    assert.equal(many.length, 2)
    assert.equal(many[0]?.id, "a")
    assert.equal(many[1]?.id, "b")
  })

  it("corta a 4 pasos", () => {
    assert.equal(canContinueChatRootsyPlanner(1), true)
    assert.equal(canContinueChatRootsyPlanner(3), true)
    assert.equal(canContinueChatRootsyPlanner(4), false)
  })

  it("lee el informe de cierre y completa acciones desde resultados", () => {
    const parsed = readChatRootsyPlannerInforme({
      status: "done",
      respuesta:
        "El rol Mozos no tiene permiso para eliminar artículos.",
      acciones: ["Listé los roles"],
    })
    assert.equal(
      parsed?.respuesta,
      "El rol Mozos no tiene permiso para eliminar artículos.",
    )
    assert.deepEqual(parsed?.acciones, ["Listé los roles"])

    const completed = completeChatRootsyPlannerInforme(
      { respuesta: "El rol Mozos puede vender.", acciones: [] },
      [
        {
          method: "GET",
          path: "/v1/pops/:popId/roles",
          action: "Listar los roles del negocio",
          confirm: "confirm",
          response: {},
        },
      ],
    )
    assert.equal(completed?.respuesta, "El rol Mozos puede vender.")
    assert.deepEqual(completed?.acciones, ["Listar los roles del negocio"])
  })
})
