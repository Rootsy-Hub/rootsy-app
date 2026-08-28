import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { buildInitialSaleCheckout } from "./saleCheckoutDefaults"

describe("buildInitialSaleCheckout", () => {
  it("nace vacío con efectivo de caja", () => {
    const snap = buildInitialSaleCheckout("pop-1", {
      cashTreasuryAccountId: "acc-caja",
      fiscal: {
        invoiceTypeSiteId: "site",
        popEmisorIvaCondition: "responsable_inscripto",
        hasValidPopFiscalCuit: true,
      },
    })
    assert.equal(snap.carrito.length, 0)
    assert.equal(snap.metodoPagoSeleccionado?.kind, "cash")
    assert.equal(snap.metodoPagoSeleccionado?.treasuryAccountId, "acc-caja")
  })

  it("sin caja deja el pago vacío", () => {
    const snap = buildInitialSaleCheckout("pop-1", {
      fiscal: {
        invoiceTypeSiteId: "site",
        popEmisorIvaCondition: "responsable_inscripto",
        hasValidPopFiscalCuit: false,
      },
    })
    assert.equal(snap.metodoPagoSeleccionado, null)
  })
})
