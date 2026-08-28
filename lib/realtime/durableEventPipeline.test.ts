import assert from "node:assert/strict"
import { describe, it } from "node:test"
import type { DomainEvent } from "./protocol"
import {
  createDurableEventPipeline,
  RealtimeHydrateSupersededError,
} from "./durableEventPipeline"

function event(seq: number, id = `e${seq}`): DomainEvent {
  return {
    id,
    seq,
    type: "articles.updated",
    popId: "pop-1",
    actorId: "u1",
    occurredAt: new Date().toISOString(),
    payload: { articleId: id },
  }
}

describe("durable event pipeline", () => {
  it("no persiste lastSeq hasta que el apply termina", async () => {
    const persisted: number[] = []
    let release!: () => void
    const gate = new Promise<void>((resolve) => {
      release = resolve
    })
    const pipeline = createDurableEventPipeline({
      persistSeq: (seq) => {
        persisted.push(seq)
      },
    })
    void pipeline.push(event(4), () => gate)
    await Promise.resolve()
    assert.deepEqual(persisted, [])
    release()
    await pipeline.wait()
    assert.deepEqual(persisted, [4])
    assert.equal(pipeline.getDurableSeq(), 4)
  })

  it("espera el aviso anterior antes de confirmar el siguiente", async () => {
    const order: string[] = []
    let releaseFirst!: () => void
    const firstGate = new Promise<void>((resolve) => {
      releaseFirst = resolve
    })
    const pipeline = createDurableEventPipeline({
      persistSeq: (seq) => {
        order.push(`persist:${seq}`)
      },
    })
    void pipeline.push(event(1), async () => {
      order.push("apply:1")
      await firstGate
    })
    void pipeline.push(event(2), () => {
      order.push("apply:2")
    })
    await Promise.resolve()
    assert.deepEqual(order, ["apply:1"])
    releaseFirst()
    await pipeline.wait()
    assert.deepEqual(order, ["apply:1", "persist:1", "apply:2", "persist:2"])
  })

  it("no confirma un aviso superseded por hidratar de nuevo", async () => {
    const persisted: number[] = []
    const pipeline = createDurableEventPipeline({
      persistSeq: (seq) => {
        persisted.push(seq)
      },
    })
    void pipeline.push(event(8), async () => {
      throw new RealtimeHydrateSupersededError()
    })
    await pipeline.wait()
    assert.deepEqual(persisted, [])
    assert.equal(pipeline.getDurableSeq(), null)
  })

  it("tras un fallo aplica recovery y después confirma el seq", async () => {
    const persisted: number[] = []
    const recovered: number[] = []
    const pipeline = createDurableEventPipeline({
      persistSeq: (seq) => {
        persisted.push(seq)
      },
      onApplyFailure: (next) => {
        recovered.push(next.seq)
      },
    })
    void pipeline.push(event(3), async () => {
      throw new Error("sqlite")
    })
    await pipeline.wait()
    assert.deepEqual(recovered, [3])
    assert.deepEqual(persisted, [3])
    assert.equal(pipeline.getDurableSeq(), 3)
  })
})
