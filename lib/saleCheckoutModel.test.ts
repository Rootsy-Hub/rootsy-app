import assert from "node:assert/strict"
import { describe, it } from "node:test"
import {
  buildSaleCheckoutModel,
  resolveSaleCheckoutConfirmTitle,
} from "./saleCheckoutModel"

const noop = () => undefined

describe("sale checkout model", () => {
  it("pide confirmación por riesgo y no duplica el slot de pago", () => {
    const model = buildSaleCheckoutModel({
      hasItems: true,
      total: 1000,
      subtotal: 1000,
      discountAmount: 0,
      paymentReady: true,
      payOnClientAccount: true,
      party: { id: "c1", name: "Ana", currentAccountEnabled: true },
      partyTaxId: "20123456789",
      comprobanteLabel: null,
      comprobanteDisplayLabel: "Sin comprobante",
      canReadClients: true,
      canCreateSale: true,
      canReadCashRegisters: true,
      cashOpen: true,
      submitting: false,
      clienteLabel: "Ana",
      clienteIvaLabel: "RI",
      pagoLabel: "Cuenta corriente",
      pagoSubLabel: "A 30 días",
      onOpenClient: noop,
      onOpenComprobante: noop,
      onOpenPago: noop,
      onDiscard: noop,
      onConfirm: noop,
    })
    assert.equal(model.risk, "client_account")
    assert.equal(model.canCommit, true)
    assert.equal(model.toolbox.pagoLabel, "Cuenta corriente")
    assert.equal(model.actions.confirmLabel?.startsWith("Vender"), true)
  })

  it("con caja cerrada no usa «Requiere caja abierta» como valor de pago", () => {
    const model = buildSaleCheckoutModel({
      hasItems: false,
      total: 0,
      subtotal: 0,
      discountAmount: 0,
      paymentReady: false,
      payOnClientAccount: false,
      party: null,
      comprobanteLabel: null,
      comprobanteDisplayLabel: "Sin comprobante",
      canReadClients: true,
      canCreateSale: true,
      canReadCashRegisters: true,
      cashOpen: false,
      submitting: false,
      clienteLabel: "Elegir cliente",
      clienteIvaLabel: "RI",
      pagoLabel: "Elegir forma de pago",
      pagoSubLabel: null,
      onOpenClient: noop,
      onOpenComprobante: noop,
      onOpenPago: noop,
      onDiscard: noop,
      onConfirm: noop,
    })
    assert.equal(model.toolbox.pagoLabel, "Elegir forma de pago")
    assert.equal(model.toolbox.pagoDisabled, true)
    assert.equal(model.actions.discardDisabled, true)
  })

  it("explica por qué no se puede cobrar", () => {
    assert.equal(
      resolveSaleCheckoutConfirmTitle({
        hasItems: false,
        paymentReady: true,
        payOnClientAccount: false,
        party: null,
        canCreateSale: true,
        canReadCashRegisters: true,
        cashOpen: true,
      }),
      "Agregá productos al pedido.",
    )
  })
})
