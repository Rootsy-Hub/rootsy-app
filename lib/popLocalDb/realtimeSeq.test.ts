import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { parseRealtimeLastSeq } from "./realtimeSeq"

describe("realtime lastSeq", () => {
  it("parsea seq válido", () => {
    assert.equal(parseRealtimeLastSeq("12"), 12)
    assert.equal(parseRealtimeLastSeq("0"), 0)
  })

  it("rechaza vacío o inválido", () => {
    assert.equal(parseRealtimeLastSeq(null), null)
    assert.equal(parseRealtimeLastSeq(""), null)
    assert.equal(parseRealtimeLastSeq("-1"), null)
    assert.equal(parseRealtimeLastSeq("no"), null)
  })
})
