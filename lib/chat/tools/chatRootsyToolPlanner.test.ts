import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { getChatRootsyRegistryEntry } from "@/lib/chat/tools/chatRootsyToolRegistry"
import {
  buildChatRootsyPlannerIndex,
  buildChatRootsyPlannerUserPayload,
  CHAT_ROOTSY_MISSING_SALES_MARGINS_RANGE,
  CHAT_ROOTSY_PLANNER_AUGUST_MARGIN_QUERY,
  eligibleChatRootsyPlannerTools,
  isChatRootsyIsoDate,
  orderChatRootsyProposals,
  parseChatRootsyPlannerPlan,
  plannerIndexSupportsDateRange,
  validateChatRootsyPlannerCall,
  validateChatRootsyPlannerPlan,
} from "@/lib/chat/tools/chatRootsyToolPlanner"

describe("consultora de consultas Rootsy", () => {
  it("arma un catálogo compacto solo con consultas habilitadas", () => {
    const index = buildChatRootsyPlannerIndex(eligibleChatRootsyPlannerTools())
    const ids = index.map((row) => row.id)
    assert.deepEqual(ids.sort(), [
      "product_margins",
      "supplier_upcoming_payments",
      "top_sold_products",
    ])
    assert.equal(plannerIndexSupportsDateRange(index), false)
    for (const row of index) {
      assert.ok(row.purpose)
      assert.ok(row.params.length)
      assert.equal(
        "endpoint" in row || "url" in row || "token" in row || "name" in row,
        false,
      )
    }
  })

  it("parsea JSON de queries y acepta el formato viejo toolCalls", () => {
    const parsed = parseChatRootsyPlannerPlan(
      'listo {"queries":[{"id":"top_sold_products","filters":{"period":"this_month","limit":5}}]}',
    )
    assert.ok(parsed)
    assert.equal(parsed?.queries[0]?.id, "top_sold_products")
    assert.equal(parsed?.queries[0]?.filters.limit, 5)

    const legacy = parseChatRootsyPlannerPlan(
      '{"toolCalls":[{"tool":"supplier_upcoming_payments","filters":{"direction":"payable"}}]}',
    )
    assert.equal(legacy?.queries[0]?.id, "supplier_upcoming_payments")

    const stored = parseChatRootsyPlannerPlan(
      '{"status":"ok","queries":[{"id":"reports_totals","params":{"kind":"sales"}}]}',
    )
    assert.equal(stored?.queries[0]?.id, "reports_totals")
    assert.equal(stored?.queries[0]?.filters.kind, "sales")
    const accepted = validateChatRootsyPlannerPlan(stored!)
    assert.equal(accepted.proposals[0]?.tool, "reports_totals")
    assert.equal(accepted.discarded, 0)

    const byPath = parseChatRootsyPlannerPlan(
      '{"status":"ok","queries":[{"method":"GET","path":"/v1/pops/:popId/statistics/products/details","params":{"from":"2026-08-01","to":"2026-08-23"}}]}',
    )
    assert.equal(byPath?.queries[0]?.path, "/v1/pops/:popId/statistics/products/details")
    const fromPath = validateChatRootsyPlannerPlan(byPath!)
    assert.equal(fromPath.proposals[0]?.tool, "statistics_details")
    assert.equal(fromPath.proposals[0]?.filters.section, "products")
    assert.match(
      fromPath.proposals[0]?.request ?? "",
      /GET \/v1\/pops\/:popId\/statistics\/products\/details/,
    )

    const write = parseChatRootsyPlannerPlan(
      '{"status":"ok","queries":[{"method":"POST","path":"/v1/pops/:popId/articles","body":{"name":"Coca 500","sale_price":1200}}]}',
    )
    assert.equal(write?.queries[0]?.method, "POST")
    const written = validateChatRootsyPlannerPlan(write!)
    assert.equal(written.proposals[0]?.tool, "post_articles")
    assert.equal(written.proposals[0]?.method, "POST")
    assert.equal(written.proposals[0]?.body?.name, "Coca 500")
    assert.match(written.proposals[0]?.request ?? "", /POST \/v1\/pops\/:popId\/articles/)

    const ask = parseChatRootsyPlannerPlan(
      '{"status":"needs_clarification","question":"¿De qué mes?"}',
    )
    assert.equal(ask?.queries.length, 0)
    assert.equal(ask?.clarifyingQuestion, "¿De qué mes?")

    const withAction = parseChatRootsyPlannerPlan(
      '{"status":"ok","queries":[{"method":"GET","path":"/v1/pops/:popId/articles","params":{"q":"Agua"},"action":"Buscar artículos que coincidan con Agua","confirm":"confirm_one"}]}',
    )
    assert.equal(withAction?.queries[0]?.action, "Buscar artículos que coincidan con Agua")
    assert.equal(withAction?.queries[0]?.confirm, "confirm_one")
    const offered = validateChatRootsyPlannerPlan(withAction!)
    assert.equal(offered.proposals[0]?.action, "Buscar artículos que coincidan con Agua")
    assert.equal(offered.proposals[0]?.confirm, "confirm_one")

    const many = parseChatRootsyPlannerPlan(
      '{"status":"ok","queries":[{"method":"GET","path":"/v1/pops/:popId/articles","params":{"q":"coca"},"action":"Buscar artículos que coincidan con coca","confirm":"confirm_many"}]}',
    )
    assert.equal(many?.queries[0]?.confirm, "confirm_many")

    const done = parseChatRootsyPlannerPlan('{"status":"done"}')
    assert.equal(done?.done, true)
    assert.equal(done?.queries.length, 0)
    assert.equal(done?.informe, undefined)

    const informe = parseChatRootsyPlannerPlan(
      '{"status":"done","respuesta":"El rol Mozos no tiene permiso para eliminar artículos.","acciones":["Listé los roles y tomé Mozos","Leí la matriz de permisos de inventario"]}',
    )
    assert.equal(informe?.done, true)
    assert.equal(
      informe?.informe?.respuesta,
      "El rol Mozos no tiene permiso para eliminar artículos.",
    )
    assert.deepEqual(informe?.informe?.acciones, [
      "Listé los roles y tomé Mozos",
      "Leí la matriz de permisos de inventario",
    ])
  })

  it("conserva los tres flujos actuales con filtros seguros", () => {
    const top = validateChatRootsyPlannerCall({
      tool: "top_sold_products",
      filters: { period: "this_month", limit: 5 },
    })
    assert.equal(top?.tool, "top_sold_products")

    const margins = validateChatRootsyPlannerCall(
      { tool: "product_margins", filters: { period: "this_month", limit: 5 } },
      { recent: [{ tool: "top_sold_products", items: [{ name: "Pan" }] }] },
      { enforceRecent: true },
    )
    assert.equal(margins?.tool, "product_margins")

    const payables = validateChatRootsyPlannerCall({
      tool: "supplier_upcoming_payments",
      filters: { direction: "payable", pageSize: 99 },
    })
    assert.equal(payables?.filters.pageSize, 5)

    const totals = validateChatRootsyPlannerCall({
      tool: "reports_totals",
      filters: { kind: "sales", from: "2026-08-01", pageSize: 99 },
    })
    assert.equal(totals?.tool, "reports_totals")
    assert.equal(totals?.filters.kind, "sales")
    assert.equal(totals?.filters.pageSize, 50)
  })

  it("no ofrece margen sin resultado reciente de más vendidos", () => {
    const margins = validateChatRootsyPlannerCall(
      { tool: "product_margins", filters: { period: "this_month" } },
      { recent: [] },
      { enforceRecent: true },
    )
    assert.equal(margins, null)
  })

  it("rechaza escrituras, consultas documentadas y filtros inventados", () => {
    assert.equal(
      validateChatRootsyPlannerCall({ tool: "settle_supplier_account", filters: {} }),
      null,
    )
    assert.equal(
      validateChatRootsyPlannerCall({
        tool: CHAT_ROOTSY_MISSING_SALES_MARGINS_RANGE.name,
        filters: { from: "2026-08-05", to: "2026-08-08", limit: 5 },
      }),
      null,
    )
    assert.equal(
      validateChatRootsyPlannerCall({
        tool: "top_sold_products",
        filters: { period: "this_month", from: "2026-08-05", to: "2026-08-08" },
      }),
      null,
    )
  })

  it("documenta el hueco de la consulta del 5 al 8 de agosto", () => {
    const index = buildChatRootsyPlannerIndex(eligibleChatRootsyPlannerTools())
    const planned = validateChatRootsyPlannerPlan({
      queries: [
        {
          id: "top_sold_products",
          filters: { from: "2026-08-05", to: "2026-08-08", limit: 5 },
        },
        {
          id: "product_margins",
          filters: { from: "2026-08-05", to: "2026-08-08" },
        },
      ],
      clarifyingQuestion: "¿Querés el ranking de este mes?",
    })

    assert.equal(CHAT_ROOTSY_PLANNER_AUGUST_MARGIN_QUERY.includes("agosto"), true)
    assert.equal(plannerIndexSupportsDateRange(index), false)
    assert.equal(planned.proposals.length, 0)
    assert.ok(planned.clarifyingQuestion)
    assert.ok(planned.discarded >= 2)

    const missing = getChatRootsyRegistryEntry(
      CHAT_ROOTSY_MISSING_SALES_MARGINS_RANGE.name,
    )
    assert.ok(missing)
    assert.equal(missing?.status, "documented")
    assert.equal(missing?.kind, "read")
    assert.ok(missing?.params.some((param) => param.name === "from" && param.type === "date"))
    assert.ok(missing?.params.some((param) => param.name === "to" && param.type === "date"))
    assert.equal(
      missing?.endpoint,
      CHAT_ROOTSY_MISSING_SALES_MARGINS_RANGE.endpoint,
    )
    assert.match(CHAT_ROOTSY_MISSING_SALES_MARGINS_RANGE.reason, /from\/to/)
  })

  it("deja lista la validación para cuando se habilite products_sales_margins_range", () => {
    assert.equal(isChatRootsyIsoDate("2026-08-05"), true)
    assert.equal(isChatRootsyIsoDate("2026-08-32"), false)
    const documented = getChatRootsyRegistryEntry("products_sales_margins_range")
    assert.ok(documented)
    const from = documented?.params.find((param) => param.name === "from")
    const to = documented?.params.find((param) => param.name === "to")
    assert.equal(from?.type, "date")
    assert.equal(to?.type, "date")
    assert.equal(from?.required, true)
    assert.equal(documented?.status, "documented")
  })

  it("el payload de la consultora incluye today, data_request y catálogo", () => {
    const payload = JSON.parse(
      buildChatRootsyPlannerUserPayload({
        today: "2026-08-23",
        dataRequest: {
          objective: "más vendidos del mes",
          time: { period: "this_month" },
          filters: { limit: 5 },
        },
        index: buildChatRootsyPlannerIndex(eligibleChatRootsyPlannerTools()),
      }),
    ) as {
      today: string
      catalog: unknown
      data_request: { objective: string }
      message?: string
    }

    assert.equal(payload.today, "2026-08-23")
    assert.equal(payload.data_request.objective, "más vendidos del mes")
    assert.equal("message" in payload, false)
    assert.ok(payload.catalog)
    assert.equal("paso" in payload, false)
  })

  it("acepta margen en el mismo lote si también pide más vendidos", () => {
    const planned = validateChatRootsyPlannerPlan({
      queries: [
        { id: "product_margins", filters: { period: "this_month", limit: 5 } },
        { id: "top_sold_products", filters: { period: "this_month", limit: 5 } },
      ],
    })
    assert.deepEqual(
      planned.proposals.map((row) => row.tool),
      ["product_margins", "top_sold_products"],
    )
  })

  it("ordena margen después de más vendidos en el mismo lote", () => {
    const ordered = orderChatRootsyProposals([
      { tool: "product_margins", filters: { period: "this_month" } },
      { tool: "top_sold_products", filters: { period: "this_month" } },
    ])
    assert.deepEqual(
      ordered.map((row) => row.tool),
      ["top_sold_products", "product_margins"],
    )
  })
})
