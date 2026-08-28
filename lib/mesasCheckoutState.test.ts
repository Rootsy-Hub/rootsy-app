import assert from "node:assert/strict"
import { describe, it } from "node:test"
import {
  checkoutPersistFingerprint,
  emptyTableSessionCheckout,
} from "../app/[siteId]/[popId]/mesas/mesasCheckoutState"

describe("checkoutPersistFingerprint", () => {
  it("trata records vacíos igual que omitidos", () => {
    const empty = emptyTableSessionCheckout("A")
    assert.equal(
      checkoutPersistFingerprint(empty),
      checkoutPersistFingerprint({
        ...empty,
        itemDescuentoModo: {},
        itemDescuentoDraft: {},
        itemDescuentoSuprimido: {},
        itemComentarios: {},
        paidPartialUnits: {},
        totalPagadoAcumulado: 0,
        descuentoGeneralBloqueado: false,
      }),
    )
  })
})
