import assert from "node:assert/strict"
import { describe, it } from "node:test"
import {
  resolveOperateOpenCashSession,
  saleOpenCashFromOperate,
} from "./saleOpenCashSession"

const operate = {
  sessionId: "sess-1",
  cashRegisterId: "reg-1",
  openedAt: "2026-01-01T00:00:00.000Z",
  salePoint: null,
}

const catalog = {
  sessionId: "sess-old",
  cashRegisterId: "reg-old",
  registerName: "Caja 1",
  cashTreasuryAccountId: "acc-1",
}

describe("resolveOperateOpenCashSession", () => {
  it("si operate resolvió, gana aunque el catálogo tenga otra sesión", () => {
    const next = resolveOperateOpenCashSession(true, operate, catalog, "acc-pay")
    assert.deepEqual(next, saleOpenCashFromOperate(operate, "acc-pay"))
  })

  it("si operate resolvió vacío, apaga la caja aunque el catálogo tenga sesión", () => {
    assert.equal(
      resolveOperateOpenCashSession(true, null, catalog, "acc-pay"),
      null,
    )
  })

  it("si operate todavía no resolvió, usa el embed del catálogo", () => {
    assert.equal(
      resolveOperateOpenCashSession(false, undefined, catalog, "acc-pay"),
      catalog,
    )
  })
})
