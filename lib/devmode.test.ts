import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { isDevModeEnabled } from "./devmode"
import { MESAS_QUERY_SPEC } from "./devmode/mesasQuerySpec"
import { MOSTRADOR_QUERY_SPEC } from "./devmode/mostradorQuerySpec"
import { querySpecIsComplete } from "./devmode/querySpec"
import { SALE_QUERY_SPEC } from "./devmode/saleQuerySpec"

describe("devmode", () => {
  it("prende con NEXT_PUBLIC_DEVMODE=1", () => {
    const prev = process.env.NEXT_PUBLIC_DEVMODE
    process.env.NEXT_PUBLIC_DEVMODE = "1"
    delete process.env.DEVMODE
    delete process.env.devmode
    assert.equal(isDevModeEnabled(), true)
    if (prev === undefined) delete process.env.NEXT_PUBLIC_DEVMODE
    else process.env.NEXT_PUBLIC_DEVMODE = prev
  })

  it("la spec de Vender lista lugares, después dominios", () => {
    assert.deepEqual(
      SALE_QUERY_SPEC.map((place) => place.place),
      ["Página", "Header", "Tablero", "Toolbox", "Resumen"],
    )
    assert.ok(querySpecIsComplete(SALE_QUERY_SPEC))
    assert.ok(
      SALE_QUERY_SPEC[0]?.domains[0]?.moments[0]?.calls[0]?.endpoint.includes(
        "/cash-registers/open-session",
      ),
    )
    assert.ok(
      SALE_QUERY_SPEC.some((place) =>
        place.domains.some((domain) =>
          domain.moments.some((moment) =>
            moment.calls.some((call) =>
              call.endpoint.includes("WS resource:cajas:{userId}"),
            ),
          ),
        ),
      ),
    )
    assert.ok(
      SALE_QUERY_SPEC.some((place) =>
        place.domains.some(
          (domain) => domain.domain === "categories",
        ),
      ),
    )
    assert.ok(
      SALE_QUERY_SPEC.some((place) =>
        place.domains.some((domain) =>
          domain.moments.some((moment) =>
            moment.calls.some((call) =>
              call.endpoint.includes("/articles?itemKinds=merchandise"),
            ),
          ),
        ),
      ),
    )
    assert.ok(
      SALE_QUERY_SPEC.some((place) =>
        place.domains.some((domain) =>
          domain.moments.some((moment) =>
            moment.calls.some((call) =>
              call.endpoint.includes("sale_cart_lines"),
            ),
          ),
        ),
      ),
    )
    assert.ok(
      SALE_QUERY_SPEC.some((place) =>
        place.domains.some((domain) =>
          domain.moments.some((moment) =>
            moment.calls.some((call) =>
              call.endpoint.includes("SELECT articles WHERE barcode"),
            ),
          ),
        ),
      ),
    )
  })

  it("la spec de Mesas lista lugares y el piso en TanStack + WS", () => {
    assert.deepEqual(
      MESAS_QUERY_SPEC.map((place) => place.place),
      ["Página", "Header", "Tablero", "Toolbox", "Resumen"],
    )
    assert.ok(querySpecIsComplete(MESAS_QUERY_SPEC))
    assert.ok(
      MESAS_QUERY_SPEC.some((place) =>
        place.domains.some((domain) =>
          domain.moments.some((moment) =>
            moment.calls.some((call) =>
              call.endpoint.includes("/mesas/layout"),
            ),
          ),
        ),
      ),
    )
    assert.ok(
      MESAS_QUERY_SPEC.some((place) =>
        place.domains.some((domain) =>
          domain.moments.some((moment) =>
            moment.calls.some((call) => call.endpoint.includes("WS domain:mesas")),
          ),
        ),
      ),
    )
    assert.ok(
      MESAS_QUERY_SPEC.some((place) =>
        place.domains.some((domain) =>
          domain.moments.some((moment) =>
            moment.calls.some((call) =>
              call.endpoint.includes("WS resource:cajas:{userId}"),
            ),
          ),
        ),
      ),
    )
    assert.ok(
      MESAS_QUERY_SPEC.some((place) =>
        place.domains.some((domain) =>
          domain.moments.some((moment) =>
            moment.calls.some((call) =>
              call.endpoint.includes("POST /v1/pops/:popId/sales"),
            ),
          ),
        ),
      ),
    )
  })

  it("la spec de Mostrador lista lugares y pedidos en TanStack + WS", () => {
    assert.deepEqual(
      MOSTRADOR_QUERY_SPEC.map((place) => place.place),
      ["Página", "Header", "Tablero", "Toolbox", "Resumen"],
    )
    assert.ok(querySpecIsComplete(MOSTRADOR_QUERY_SPEC))
    assert.ok(
      MOSTRADOR_QUERY_SPEC.some((place) =>
        place.domains.some((domain) =>
          domain.moments.some((moment) =>
            moment.calls.some((call) =>
              call.endpoint.includes("/mostrador/orders"),
            ),
          ),
        ),
      ),
    )
    assert.ok(
      MOSTRADOR_QUERY_SPEC.some((place) =>
        place.domains.some((domain) =>
          domain.moments.some((moment) =>
            moment.calls.some((call) =>
              call.endpoint.includes("WS domain:mostrador"),
            ),
          ),
        ),
      ),
    )
    assert.ok(
      MOSTRADOR_QUERY_SPEC.some((place) =>
        place.domains.some((domain) =>
          domain.moments.some((moment) =>
            moment.calls.some((call) =>
              call.endpoint.includes("WS resource:cajas:{userId}"),
            ),
          ),
        ),
      ),
    )
    assert.ok(
      MOSTRADOR_QUERY_SPEC.some((place) =>
        place.domains.some((domain) =>
          domain.moments.some((moment) =>
            moment.calls.some((call) =>
              call.detail.includes("completeSale"),
            ),
          ),
        ),
      ),
    )
  })
})
