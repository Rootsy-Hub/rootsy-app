import assert from "node:assert/strict"
import { describe, it } from "node:test"
import {
  parseMesasWorkspacePreference,
  reconcileMesasWorkspaceView,
  tableHasOpenSession,
} from "./mesasWorkspacePreference"

describe("mesas workspace preference", () => {
  it("parsea un blob válido y descarta tabs inventados", () => {
    assert.deepEqual(
      parseMesasWorkspacePreference({
        tableId: "t1",
        salonId: "s1",
        rightView: "cart",
        mobileStage: "catalog",
      }),
      {
        tableId: "t1",
        salonId: "s1",
        rightView: "cart",
        mobileStage: "catalog",
      },
    )
    assert.equal(
      parseMesasWorkspacePreference({ tableId: "t1", rightView: "foo" }),
      undefined,
    )
  })

  it("si Pedido no tiene sesión abierta, cae a Mesa", () => {
    assert.deepEqual(
      reconcileMesasWorkspaceView({
        rightView: "cart",
        mobileStage: "catalog",
        tableExists: true,
        tableHasOpenSession: false,
      }),
      { rightView: "session", mobileStage: "ticket" },
    )
    assert.deepEqual(
      reconcileMesasWorkspaceView({
        rightView: "cart",
        tableExists: false,
        tableHasOpenSession: false,
      }),
      { rightView: "session", mobileStage: undefined },
    )
  })

  it("respeta Agenda y Mesa aunque la mesa esté ocupada", () => {
    assert.deepEqual(
      reconcileMesasWorkspaceView({
        rightView: "agenda",
        mobileStage: "home",
        tableExists: true,
        tableHasOpenSession: true,
      }),
      { rightView: "agenda", mobileStage: "home" },
    )
    assert.deepEqual(
      reconcileMesasWorkspaceView({
        rightView: "session",
        tableExists: true,
        tableHasOpenSession: true,
      }),
      { rightView: "session", mobileStage: undefined },
    )
  })

  it("restaura Pedido solo si la mesa sigue abierta", () => {
    assert.deepEqual(
      reconcileMesasWorkspaceView({
        rightView: "cart",
        mobileStage: "catalog",
        tableExists: true,
        tableHasOpenSession: true,
      }),
      { rightView: "cart", mobileStage: "catalog" },
    )
    assert.equal(
      tableHasOpenSession({ sessionId: "s1", status: "open" }),
      true,
    )
    assert.equal(
      tableHasOpenSession({ sessionId: "s1", status: "reserved" }),
      false,
    )
  })
})
