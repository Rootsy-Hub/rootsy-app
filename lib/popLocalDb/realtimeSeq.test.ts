import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { nextPersistedRealtimeSeq, parseRealtimeLastSeq } from "./realtimeSeq"

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

  it("no deja bajar el seq durable", () => {
    assert.equal(nextPersistedRealtimeSeq(null, 4), 4)
    assert.equal(nextPersistedRealtimeSeq(10, 12), 12)
    assert.equal(nextPersistedRealtimeSeq(10, 10), 10)
    assert.equal(nextPersistedRealtimeSeq(10, 7), 10)
  })
})
