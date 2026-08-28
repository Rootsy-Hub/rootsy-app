import assert from "node:assert/strict"
import { describe, it } from "node:test"
import {
  hasActiveCommandedLines,
  isComandaVoidable,
} from "./comandaCartLine"

describe("hasActiveCommandedLines", () => {
  it("no bloquea pending ni voided", () => {
    assert.equal(
      hasActiveCommandedLines([
        { comandaStatus: "pending" },
        { comandaStatus: "voided" },
      ]),
      false,
    )
  })

  it("bloquea sent, preparing, ready y delivered", () => {
    for (const status of ["sent", "preparing", "ready", "delivered"] as const) {
      assert.equal(isComandaVoidable(status), true)
      assert.equal(hasActiveCommandedLines([{ comandaStatus: status }]), true)
    }
  })

  it("bloquea un mixto aunque haya pending", () => {
    assert.equal(
      hasActiveCommandedLines([
        { comandaStatus: "pending" },
        { comandaStatus: "sent" },
      ]),
      true,
    )
  })
})
