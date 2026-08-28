import assert from "node:assert/strict"
import { describe, it } from "node:test"
import {
  parseMostradorWorkspacePreference,
  reconcileMostradorWorkspaceView,
} from "./mostradorWorkspacePreference"

describe("mostrador workspace preference", () => {
  it("parsea un blob válido y descarta tabs inventados", () => {
    assert.deepEqual(
      parseMostradorWorkspacePreference({
        orderId: "o1",
        rightView: "cart",
        mobileStage: "catalog",
      }),
      { orderId: "o1", rightView: "cart", mobileStage: "catalog" },
    )
    assert.equal(
      parseMostradorWorkspacePreference({ orderId: "o1", rightView: "agenda" }),
      undefined,
    )
  })

  it("si Pedido no tiene pedido abierto, cae a Datos", () => {
    assert.deepEqual(
      reconcileMostradorWorkspaceView({
        rightView: "cart",
        mobileStage: "catalog",
        orderExists: false,
      }),
      { rightView: "detail", mobileStage: "ticket" },
    )
  })

  it("respeta Datos aunque el pedido siga abierto", () => {
    assert.deepEqual(
      reconcileMostradorWorkspaceView({
        rightView: "detail",
        mobileStage: "home",
        orderExists: true,
      }),
      { rightView: "detail", mobileStage: "home" },
    )
  })

  it("restaura Pedido solo si el pedido sigue en el tablero", () => {
    assert.deepEqual(
      reconcileMostradorWorkspaceView({
        rightView: "cart",
        mobileStage: "catalog",
        orderExists: true,
      }),
      { rightView: "cart", mobileStage: "catalog" },
    )
  })
})
