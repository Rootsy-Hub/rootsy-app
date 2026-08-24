import assert from "node:assert/strict"
import { describe, it } from "node:test"
import {
  getChatRootsyApiEndpoint,
  matchChatRootsyApiPath,
} from "@/lib/chat/apiDocumentacion"
import {
  buildChatRootsyApiCall,
  buildChatRootsyApiRequestPath,
  capChatRootsyPaginationFilters,
  chatRootsyApiQueryTitle,
  compactChatRootsyApiPayload,
  itemsFromChatRootsyApiPayload,
  readChatRootsyPlannerBody,
  readChatRootsyPlannerFilters,
} from "@/lib/chat/chatRootsyApiQuery"

describe("consultas de API del planificador", () => {
  it("recorta pageSize y limit por encima de 50", () => {
    const capped = capChatRootsyPaginationFilters({
      kind: "sales",
      pageSize: 99,
      limit: "80",
      page: 3,
    })
    assert.equal(capped.pageSize, 50)
    assert.equal(capped.limit, 50)
    assert.equal(capped.page, 3)
    assert.equal(capped.kind, "sales")
  })

  it("arma el path con popId, params de ruta y query", () => {
    const endpoint = getChatRootsyApiEndpoint("reports_totals")
    assert.ok(endpoint)
    const built = buildChatRootsyApiRequestPath("pop-1", endpoint!, {
      kind: "sales",
      from: "2026-08-01",
      to: "2026-08-23",
    })
    assert.equal(built.ok, true)
    if (built.ok) {
      assert.equal(
        built.path,
        "/v1/pops/pop-1/reports/totals?kind=sales&from=2026-08-01&to=2026-08-23",
      )
    }

    const section = getChatRootsyApiEndpoint("statistics_details")
    assert.ok(section)
    const withColon = buildChatRootsyApiRequestPath("pop-1", section!, {
      ":section": "products",
      from: "2026-08-01",
    })
    assert.equal(withColon.ok, true)
    if (withColon.ok) {
      assert.equal(
        withColon.path,
        "/v1/pops/pop-1/statistics/products/details?from=2026-08-01",
      )
    }

    const withSection = buildChatRootsyApiRequestPath("pop-1", section!, {
      section: "products",
      from: "2026-08-01",
    })
    assert.equal(withSection.ok, true)
    if (withSection.ok) {
      assert.equal(
        withSection.path,
        "/v1/pops/pop-1/statistics/products/details?from=2026-08-01",
      )
    }
  })

  it("reconoce el path interpolado de statistics/products", () => {
    const matched = matchChatRootsyApiPath(
      "/v1/pops/:popId/statistics/products/details?from=2026-08-01",
    )
    assert.equal(matched?.endpoint.id, "statistics_details")
    assert.equal(matched?.pathParams.section, "products")
    assert.equal(matchChatRootsyApiPath("https://evil.test/v1/pops/x"), null)
    const scan = matchChatRootsyApiPath("/v1/pops/:popId/sale/catalog/scan")
    assert.equal(scan?.endpoint.path, "/v1/pops/:popId/sale/catalog/scan")
    const created = matchChatRootsyApiPath("/v1/pops/:popId/articles", "POST")
    assert.equal(created?.endpoint.method, "POST")
    assert.equal(created?.endpoint.id, "post_articles")
    assert.equal(matchChatRootsyApiPath("/v1/pops/:popId/articles", "DELETE"), null)
    assert.equal(matchChatRootsyApiPath("https://evil.test/v1/pops/x", "POST"), null)
  })

  it("manda el resto de un POST en el body, no en query", () => {
    const matched = matchChatRootsyApiPath("/v1/pops/:popId/articles", "POST")
    assert.ok(matched)
    const built = buildChatRootsyApiCall("pop-1", matched!.endpoint, {}, {
      name: "Coca 500",
      sale_price: 1200,
    })
    assert.equal(built.ok, true)
    if (built.ok) {
      assert.equal(built.method, "POST")
      assert.equal(built.path, "/v1/pops/pop-1/articles")
      assert.deepEqual(built.body, { name: "Coca 500", sale_price: 1200 })
    }
    const body = readChatRootsyPlannerBody({
      name: "Coca 500",
      extras: [{ sku: "c1" }],
    })
    assert.equal(body?.name, "Coca 500")
  })

  it("normaliza :section a section", () => {
    const filters = readChatRootsyPlannerFilters({
      ":section": "products",
      from: "2026-08-01",
    })
    assert.equal(filters.section, "products")
    assert.equal(filters[":section"], undefined)
  })

  it("falla si falta un param de ruta", () => {
    const endpoint = getChatRootsyApiEndpoint("treasury_get")
    assert.ok(endpoint)
    const built = buildChatRootsyApiRequestPath("pop-1", endpoint!, {})
    assert.equal(built.ok, false)
  })

  it("arma personas desde el hub de RRHH", () => {
    const items = itemsFromChatRootsyApiPayload({
      success: true,
      data: {
        members: [
          {
            userId: "u-activo",
            firstName: "Noel",
            lastName: "Pérez",
            isActive: true,
            roleDisplayName: "Cajero",
          },
          {
            userId: "u-inactivo",
            firstName: "Noel",
            lastName: "Gómez",
            isActive: false,
            roleDisplayName: "Mozos",
          },
        ],
        employees: [{ id: "emp-1", firstName: "Otra", lastName: "Persona" }],
      },
    })
    assert.equal(items.length, 2)
    assert.equal(items[0]?.id, "u-activo")
    assert.equal(items[0]?.name, "Noel Pérez")
    assert.equal(items[1]?.name, "Noel Gómez · inactivo")
  })

  it("compacta el hub de RRHH a members y roles", () => {
    const compact = compactChatRootsyApiPayload({
      success: true,
      data: {
        popName: "Bar",
        permissionKeys: ["hr:read"],
        members: [
          {
            userId: "u-1",
            firstName: "Noel",
            lastName: "Pérez",
            isActive: true,
            roleId: "role-mozos",
            roleDisplayName: "Mozos",
          },
        ],
        roles: [{ id: "role-mozos", name: "waiters", displayName: "Mozos" }],
        employees: [],
      },
    }) as {
      members?: Array<{ id: string; name: string; isActive: boolean }>
      roles?: Array<{ id: string; displayName: string }>
    }
    assert.equal(compact.members?.[0]?.name, "Noel Pérez")
    assert.equal(compact.members?.[0]?.isActive, true)
    assert.equal(compact.roles?.[0]?.displayName, "Mozos")
  })

  it("usa el enunciado corto del endpoint como título", () => {
    assert.match(chatRootsyApiQueryTitle("ledger_totals"), /Saldo/)
  })

  it("arma filas simples desde un total", () => {
    const items = itemsFromChatRootsyApiPayload({
      success: true,
      data: { kind: "sales", count: 12, total: 4500 },
    })
    assert.equal(items[0]?.name, "sales")
    assert.equal(items[0]?.sales, 4500)
  })

  it("lee rankings de estadísticas", () => {
    const items = itemsFromChatRootsyApiPayload({
      success: true,
      data: {
        rankings: [{ rank: 1, id: "a1", label: "Coca 500", value: 800 }],
      },
    })
    assert.equal(items[0]?.name, "Coca 500")
    assert.equal(items[0]?.id, "a1")
  })

  it("incluye un producto que no está en el top 10", () => {
    const payload = {
      success: true,
      data: {
        rankings: [{ rank: 1, id: "pan", label: "Pan", value: 9000 }],
        productTrendOptions: [
          { key: "pan", label: "Pan" },
          { key: "coca", label: "Coca 500" },
        ],
        productTrendByKey: {
          pan: [{ value: 10000, profit: 4000, count: 50 }],
          coca: [{ value: 1200, profit: 300, count: 8 }],
        },
      },
    }
    const compact = compactChatRootsyApiPayload(payload) as {
      products?: Array<{ id: string; name: string; sales: number; cost: number }>
      productCount?: number
    }
    assert.equal(compact.productCount, 2)
    const coca = compact.products?.find((row) => row.id === "coca")
    assert.equal(coca?.name, "Coca 500")
    assert.equal(coca?.sales, 1200)
    assert.equal(coca?.cost, 900)

    const items = itemsFromChatRootsyApiPayload(payload)
    assert.equal(items.some((row) => row.id === "coca"), true)
  })
})
