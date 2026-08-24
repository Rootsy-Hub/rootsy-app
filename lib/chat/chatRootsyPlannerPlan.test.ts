import assert from "node:assert/strict"
import { describe, it } from "node:test"
import {
  advanceChatRootsyPlannerRun,
  extractChatRootsyPlannerSlot,
  instantiateChatRootsyPlanOferta,
  parseChatRootsyPlanBinding,
  readChatRootsyExecutionPlan,
  resolveChatRootsyPlanValue,
  selectChatRootsyPlannerSlotRows,
} from "@/lib/chat/chatRootsyPlannerPlan"
import { parseChatRootsyPlannerPlan } from "@/lib/chat/tools/chatRootsyToolPlanner"
import type { ChatRootsyPlannerRun } from "@/lib/chat/chatRootsyPlannerStep"

describe("plan de ejecución del planificador", () => {
  it("lee bindings de un valor y de una colección", () => {
    assert.deepEqual(parseChatRootsyPlanBinding("$1[0].id"), {
      paso: 1,
      oferta: 0,
      field: "id",
      items: false,
    })
    assert.deepEqual(parseChatRootsyPlanBinding("$1[0].items[].salePrice"), {
      paso: 1,
      oferta: 0,
      field: "salePrice",
      items: true,
    })
    assert.equal(parseChatRootsyPlanBinding("art-1"), null)
  })

  it("parsea un plan completo y aplana el primer GET", () => {
    const parsed = parseChatRootsyPlannerPlan(
      JSON.stringify({
        status: "ok",
        plan: [
          {
            paso: 1,
            action: "Buscar las aguas",
            confirm: "confirm_many",
            ofertas: [
              {
                method: "GET",
                path: "/v1/pops/:popId/articles",
                params: { q: "agua", pageSize: 20 },
              },
            ],
            demandas: ["id", "name", "salePrice"],
          },
          {
            paso: 2,
            action: "Actualizar el precio un 10%",
            confirm: "confirm",
            ofertas: [
              {
                method: "PATCH",
                path: "/v1/pops/:popId/articles/:articleId",
                params: { articleId: "$1[0].items[].id" },
                body: {
                  salePrice: { from: "$1[0].items[].salePrice", factor: 1.1 },
                },
              },
            ],
          },
        ],
      }),
    )
    assert.ok(parsed)
    assert.equal(parsed?.steps?.length, 2)
    assert.equal(parsed?.queries[0]?.path, "/v1/pops/:popId/articles")
    assert.equal(parsed?.queries[0]?.filters.q, "agua")
    assert.equal(parsed?.queries[0]?.action, "Buscar las aguas")
    assert.equal(parsed?.steps?.[0]?.ofertas[0]?.action, "Buscar las aguas")
    assert.equal(parsed?.steps?.[0]?.confirm, "confirm_many")
    assert.equal(parsed?.steps?.[1]?.confirm, "confirm")
  })

  it("expande una plantilla del mismo endpoint por fila", () => {
    const slots = [
      extractChatRootsyPlannerSlot({
        paso: 1,
        oferta: 0,
        tool: "articles",
        method: "GET",
        path: "/v1/pops/:popId/articles",
        action: "Buscar",
        demandas: ["id", "salePrice"],
        items: [
          { rank: 1, name: "Agua 500", id: "a1", sales: 1000 },
          { rank: 2, name: "Agua 2L", id: "a2", sales: 2000 },
        ],
        payload: [
          { id: "a1", name: "Agua 500", salePrice: 1000 },
          { id: "a2", name: "Agua 2L", salePrice: 2000 },
        ],
      }),
    ]
    const expanded = instantiateChatRootsyPlanOferta(
      {
        method: "PATCH",
        path: "/v1/pops/:popId/articles/:articleId",
        params: { articleId: "$1[0].items[].id" },
        body: {
          salePrice: { from: "$1[0].items[].salePrice", factor: 1.1 },
        },
        action: "Actualizar",
      },
      slots,
    )
    assert.equal(expanded.length, 2)
    assert.equal(expanded[0]?.params.articleId, "a1")
    assert.equal(expanded[0]?.body?.salePrice, 1100)
    assert.equal(expanded[1]?.params.articleId, "a2")
    assert.equal(expanded[1]?.body?.salePrice, 2200)
  })

  it("no clona un endpoint distinto sobre las filas de otro", () => {
    const plan = readChatRootsyExecutionPlan({
      plan: [
        {
          paso: 1,
          ofertas: [
            {
              method: "GET",
              path: "/v1/pops/:popId/articles",
              params: { q: "agua" },
            },
            {
              method: "GET",
              path: "/v1/pops/:popId/promotions",
              params: { q: "agua" },
            },
          ],
        },
      ],
    })
    assert.equal(plan[0]?.ofertas.length, 2)
    assert.equal(plan[0]?.ofertas[1]?.path.includes("promotions"), true)
  })

  it("después del GET pide confirm_many y no vuelve a llamar al modelo", () => {
    const slot = extractChatRootsyPlannerSlot({
      paso: 1,
      oferta: 0,
      tool: "articles",
      method: "GET",
      path: "/v1/pops/:popId/articles",
      action: "Buscar",
      demandas: ["id", "name"],
      items: [
        { rank: 1, name: "Agua 500", id: "a1", sales: 1000 },
        { rank: 2, name: "Agua 2L", id: "a2", sales: 2000 },
      ],
    })
    const run: ChatRootsyPlannerRun = {
      message: "aumentales un 10%",
      dataRequest: {
        objective: "aumentar un 10% el precio de todas las aguas",
      },
      paso: 1,
      plan: [
        {
          paso: 1,
          action: "Buscar",
          confirm: "confirm_many",
          ofertas: [
            {
              method: "GET",
              path: "/v1/pops/:popId/articles",
              params: { q: "agua" },
              action: "Buscar",
            },
          ],
          demandas: ["id", "name", "salePrice"],
        },
        {
          paso: 2,
          action: "Actualizar",
          confirm: "confirm",
          ofertas: [
            {
              method: "PATCH",
              path: "/v1/pops/:popId/articles/:articleId",
              params: { articleId: "$1[0].items[].id" },
              action: "Actualizar",
            },
          ],
          demandas: [],
        },
      ],
      slots: [slot],
      resultados: [],
    }
    const advanced = advanceChatRootsyPlannerRun({ run })
    assert.equal(advanced.kind, "pick")
    if (advanced.kind !== "pick") return
    assert.equal(advanced.choice.confirm, "confirm_many")
    assert.equal(advanced.choice.items.length, 2)
    assert.equal(advanced.run.paso, 1)
    const picked = selectChatRootsyPlannerSlotRows(slot, [
      { id: "a1", name: "Agua 500" },
    ])
    assert.equal(picked.rows.length, 1)
    assert.equal(picked.rows[0]?.id, "a1")
    const afterPick = advanceChatRootsyPlannerRun({
      run: { ...run, slots: [picked] },
      afterPick: true,
    })
    assert.equal(afterPick.kind, "offers")
    if (afterPick.kind !== "offers") return
    assert.equal(afterPick.run.paso, 2)
    assert.equal(afterPick.queries[0]?.method, "PATCH")
    assert.equal(afterPick.queries.length, 1)
  })

  it("una consulta GET no pide elegir", () => {
    const slot = extractChatRootsyPlannerSlot({
      paso: 1,
      oferta: 0,
      tool: "articles",
      method: "GET",
      path: "/v1/pops/:popId/articles",
      action: "Buscar",
      demandas: ["id", "name", "salePrice"],
      items: [
        { rank: 1, name: "Agua 500", id: "a1", sales: 1000 },
        { rank: 2, name: "Agua 2L", id: "a2", sales: 2000 },
      ],
    })
    const advanced = advanceChatRootsyPlannerRun({
      run: {
        message: "en qué precio están las aguas",
        dataRequest: { objective: "consultar precios de las aguas" },
        paso: 1,
        plan: [
          {
            paso: 1,
            action: "Consultar precios",
            confirm: "confirm",
            ofertas: [
              {
                method: "GET",
                path: "/v1/pops/:popId/articles",
                params: { q: "agua" },
                action: "Consultar",
              },
            ],
            demandas: ["id", "name", "salePrice"],
          },
        ],
        slots: [slot],
        resultados: [],
      },
    })
    assert.equal(advanced.kind, "done")
  })

  it("si el GET vino con confirm y el write es el siguiente, igual pide elegir", () => {
    const slot = extractChatRootsyPlannerSlot({
      paso: 1,
      oferta: 0,
      tool: "articles",
      method: "GET",
      path: "/v1/pops/:popId/articles",
      action: "Buscar",
      demandas: ["id", "name"],
      items: [
        { rank: 1, name: "Agua 500", id: "a1" },
        { rank: 2, name: "Agua 2L", id: "a2" },
      ],
    })
    const advanced = advanceChatRootsyPlannerRun({
      run: {
        message: "aumentales un 10%",
        dataRequest: {
          objective: "aumentar un 10% el precio de todas las aguas",
        },
        paso: 1,
        plan: [
          {
            paso: 1,
            action: "Buscar",
            confirm: "confirm",
            ofertas: [
              {
                method: "GET",
                path: "/v1/pops/:popId/articles",
                params: { q: "agua" },
                action: "Buscar",
              },
            ],
            demandas: ["id", "name"],
          },
          {
            paso: 2,
            action: "Actualizar",
            confirm: "confirm",
            ofertas: [
              {
                method: "PATCH",
                path: "/v1/pops/:popId/articles/:articleId",
                params: { articleId: "$1[0].items[].id" },
                action: "Actualizar",
              },
            ],
            demandas: [],
          },
        ],
        slots: [slot],
        resultados: [],
      },
    })
    assert.equal(advanced.kind, "pick")
    if (advanced.kind !== "pick") return
    assert.equal(advanced.choice.confirm, "confirm_many")
    assert.equal(advanced.run.paso, 1)
  })

  it("resuelve un literal y un from+factor", () => {
    const slots = [
      extractChatRootsyPlannerSlot({
        paso: 1,
        oferta: 0,
        tool: "articles",
        method: "GET",
        path: "/articles",
        action: "Buscar",
        demandas: ["salePrice"],
        items: [{ rank: 1, name: "Agua", id: "a1", sales: 2500 }],
        payload: [{ id: "a1", salePrice: 2500 }],
      }),
    ]
    assert.equal(
      resolveChatRootsyPlanValue("$1[0].items[].id", slots, { id: "a1" }),
      "a1",
    )
    assert.equal(
      resolveChatRootsyPlanValue(
        { from: "$1[0].items[].salePrice", factor: 1.1 },
        slots,
        { id: "a1", salePrice: 2500 },
      ),
      2750,
    )
  })
})
