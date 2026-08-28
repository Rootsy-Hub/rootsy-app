import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { parseSaleCatalogChrome } from "./saleCatalogPreference"

describe("sale catalog chrome", () => {
  it("lee lista de precios y modo de vista, e ignora basura", () => {
    assert.deepEqual(
      parseSaleCatalogChrome({ priceListId: "pl-1", modoVista: "lista" }),
      { priceListId: "pl-1", modoVista: "lista" },
    )
    assert.deepEqual(parseSaleCatalogChrome({ modoVista: "mosaico" }), {})
    assert.deepEqual(parseSaleCatalogChrome(null), {})
  })
})
