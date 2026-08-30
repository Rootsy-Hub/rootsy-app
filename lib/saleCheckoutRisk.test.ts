import assert from "node:assert/strict"
import { describe, it } from "node:test"
import {
  isLargeSaleCheckoutDiscount,
  resolveSaleCheckoutRisk,
} from "./saleCheckoutRisk"

describe("resolveSaleCheckoutRisk", () => {
  const safe = {
    payOnClientAccount: false,
    paymentKind: "cash" as const,
    discountAmount: 0,
    subtotal: 10_000,
    comprobanteLabel: "Sin comprobante",
    partyTaxId: null,
  }

  it("efectivo default sin fiscal es seguro", () => {
    assert.equal(resolveSaleCheckoutRisk(safe), null)
  })

  it("cuenta corriente es riesgo", () => {
    assert.equal(
      resolveSaleCheckoutRisk({ ...safe, payOnClientAccount: true }),
      "client_account",
    )
  })

  it("cheque es riesgo", () => {
    assert.equal(
      resolveSaleCheckoutRisk({ ...safe, paymentKind: "check" }),
      "check",
    )
  })

  it("descuento grande es riesgo", () => {
    assert.equal(isLargeSaleCheckoutDiscount(1_499, 10_000), false)
    assert.equal(isLargeSaleCheckoutDiscount(1_500, 10_000), true)
    assert.equal(
      resolveSaleCheckoutRisk({ ...safe, discountAmount: 2_000 }),
      "large_discount",
    )
  })

  it("factura legal sin CUIT es riesgo", () => {
    assert.equal(
      resolveSaleCheckoutRisk({
        ...safe,
        comprobanteLabel: "Factura B",
      }),
      "legal_without_tax_id",
    )
  })

  it("factura legal con CUIT es segura", () => {
    assert.equal(
      resolveSaleCheckoutRisk({
        ...safe,
        comprobanteLabel: "Factura B",
        partyTaxId: "20123456789",
      }),
      null,
    )
  })
})
