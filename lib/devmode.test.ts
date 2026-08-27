import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { isDevModeEnabled } from "./devmode"
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
    assert.ok(
      SALE_QUERY_SPEC.every((place) => place.domains.length > 0),
    )
    assert.ok(
      SALE_QUERY_SPEC.every((place) =>
        place.domains.every((domain) =>
          domain.moments.every(
            (moment) =>
              moment.calls.length > 0 &&
              moment.calls.every((call) => Boolean(call.cache)),
          ),
        ),
      ),
    )
    assert.ok(
      SALE_QUERY_SPEC[0]?.domains[0]?.moments[0]?.calls[0]?.endpoint.includes(
        "/cash-registers/open-session",
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
})
