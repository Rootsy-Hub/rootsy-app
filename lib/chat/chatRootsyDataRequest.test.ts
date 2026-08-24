import assert from "node:assert/strict"
import { describe, it } from "node:test"
import {
  fallbackChatRootsyFirstTurn,
  parseChatRootsyFirstTurn,
  shouldCallChatRootsyPlanner,
  validateChatRootsyDataRequest,
} from "@/lib/chat/chatRootsyDataRequest"
import {
  buildChatRootsyPlannerIndex,
  buildChatRootsyPlannerUserPayload,
  CHAT_ROOTSY_PLANNER_AUGUST_MARGIN_QUERY,
  eligibleChatRootsyPlannerTools,
  validateChatRootsyPlannerPlan,
} from "@/lib/chat/tools/chatRootsyToolPlanner"

describe("data_request de Rootsy", () => {
  it("valida una necesidad de negocio y rechaza URLs o fechas invertidas", () => {
    const ok = validateChatRootsyDataRequest({
      objective: "ver los más vendidos de este mes",
      time: { period: "this_month" },
      filters: { limit: 5 },
    })
    assert.ok(ok)
    assert.equal(ok?.objective, "ver los más vendidos de este mes")
    assert.equal(ok?.time?.period, "this_month")
    assert.equal(ok?.filters?.limit, 5)

    const fromFilters = validateChatRootsyDataRequest({
      objective: "ventas de un tramo",
      filters: { from: "2026-08-05", to: "2026-08-08" },
    })
    assert.equal(fromFilters?.time?.from, "2026-08-05")
    assert.equal(fromFilters?.time?.to, "2026-08-08")

    assert.equal(
      validateChatRootsyDataRequest({
        objective: "mirá https://api.example.com/v1/sales",
        time: { period: "this_month" },
      }),
      null,
    )
    assert.equal(
      validateChatRootsyDataRequest({
        objective: "   ",
      }),
      null,
    )
    assert.equal(
      validateChatRootsyDataRequest({
        objective: "rango inválido",
        time: { from: "2026-08-08", to: "2026-08-05" },
      }),
      null,
    )
  })

  it("parsea el primer turno y no llama a la consultora sin data_request", () => {
    const withData = parseChatRootsyFirstTurn(
      'listo {"reply":"Necesito mirar las ventas de este mes, ¿me das permiso?","data_request":{"objective":"más vendidos","time":{"period":"this_month"}}}',
    )
    assert.ok(withData)
    assert.equal(shouldCallChatRootsyPlanner(withData!), true)
    assert.equal(withData?.data_request?.objective, "más vendidos")

    const withoutData = parseChatRootsyFirstTurn(
      '{"reply":"Estoy por acá, mirando el parque.","data_request":null}',
    )
    assert.ok(withoutData)
    assert.equal(shouldCallChatRootsyPlanner(withoutData!), false)

    const invalidRequest = parseChatRootsyFirstTurn(
      '{"reply":"Lo vemos juntos.","data_request":{"objective":"","time":{"period":"this_month"}}}',
    )
    assert.ok(invalidRequest)
    assert.equal(invalidRequest?.data_request, null)
    assert.equal(shouldCallChatRootsyPlanner(invalidRequest!), false)

    const fallback = fallbackChatRootsyFirstTurn("Una respuesta suelta.")
    assert.equal(shouldCallChatRootsyPlanner(fallback), false)
  })

  it("parsea task_title solo si hay data_request, y lo descarta si es URL", () => {
    const named = parseChatRootsyFirstTurn(
      '{"reply":"Puedo eliminar Huevo, ¿me das permiso?","task_title":"Eliminar Huevo.","data_request":{"objective":"borrar el artículo Huevo"}}',
    )
    assert.equal(named?.task_title, "Eliminar Huevo")
    assert.equal(named?.data_request?.objective, "borrar el artículo Huevo")

    const ignored = parseChatRootsyFirstTurn(
      '{"reply":"Estoy por acá, mirando el parque.","task_title":"Eliminar Huevo","data_request":null}',
    )
    assert.equal(ignored?.task_title, undefined)
    assert.equal(ignored?.data_request, null)

    const url = parseChatRootsyFirstTurn(
      '{"reply":"Puedo mirar eso.","task_title":"https://api.example.com/v1/articles","data_request":{"objective":"listar artículos"}}',
    )
    assert.equal(url?.task_title, undefined)
    assert.equal(url?.data_request?.objective, "listar artículos")
  })

  it("arma el payload de la consultora con data_request y sin personalidad", () => {
    const request = validateChatRootsyDataRequest({
      objective: "artículos con menos margen más vendidos",
      time: { from: "2026-08-05", to: "2026-08-08", note: "5 al 8 de agosto" },
    })
    assert.ok(request)
    const payload = JSON.parse(
      buildChatRootsyPlannerUserPayload({
        today: "2026-08-23",
        dataRequest: request!,
        index: buildChatRootsyPlannerIndex(eligibleChatRootsyPlannerTools()),
      }),
    ) as {
      catalog: Array<{ id: string; purpose: string }>
      data_request: { objective: string }
      message?: string
    }

    assert.equal("message" in payload, false)
    assert.equal(payload.data_request.objective, "artículos con menos margen más vendidos")
    assert.ok(payload.catalog.every((row) => row.id && row.purpose))
    assert.equal(JSON.stringify(payload).includes("parque"), false)
    assert.equal(JSON.stringify(payload).includes("/v1/"), false)
    assert.equal(JSON.stringify(payload).includes("task_title"), false)
  })

  it("con el data_request del 5 al 8 de agosto el catálogo habilitado no cubre el pedido", () => {
    const request = validateChatRootsyDataRequest({
      objective: "artículos con menos margen que más se vendieron",
      time: { from: "2026-08-05", to: "2026-08-08", note: "5 al 8 de agosto" },
      filters: { limit: 5 },
    })
    assert.ok(request)
    assert.equal(
      shouldCallChatRootsyPlanner({
        reply: "Puedo mirar ese tramo si me das permiso.",
        data_request: request,
      }),
      true,
    )

    const planned = validateChatRootsyPlannerPlan({
      queries: [
        {
          id: "top_sold_products",
          filters: {
            from: request!.time?.from,
            to: request!.time?.to,
            limit: 5,
          },
        },
      ],
      clarifyingQuestion: "¿Lo vemos de este mes?",
    })
    assert.equal(planned.proposals.length, 0)
    assert.ok(planned.clarifyingQuestion)
  })
})
