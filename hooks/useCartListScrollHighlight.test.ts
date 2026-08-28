import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { isCartScrollPinnedToBottom } from "./useCartListScrollHighlight"

describe("isCartScrollPinnedToBottom", () => {
  it("está anclado si queda dentro del umbral", () => {
    assert.equal(
      isCartScrollPinnedToBottom({
        scrollHeight: 800,
        scrollTop: 740,
        clientHeight: 60,
      }),
      true,
    )
  })

  it("se suelta si el usuario subió más del umbral", () => {
    assert.equal(
      isCartScrollPinnedToBottom({
        scrollHeight: 800,
        scrollTop: 200,
        clientHeight: 400,
      }),
      false,
    )
  })
})
