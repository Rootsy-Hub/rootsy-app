import assert from "node:assert/strict"
import { describe, it } from "node:test"
import {
  catalogEnsureInflightKey,
  missingCatalogIds,
} from "./menuCatalogEnsureFromLocal"

describe("missingCatalogIds", () => {
  it("deduplica y omite los que ya están en cache", () => {
    assert.deepEqual(missingCatalogIds(["a", "a", "", "b", "c"], ["b"]), [
      "a",
      "c",
    ])
  })
})

describe("catalogEnsureInflightKey", () => {
  it("es estable aunque cambie el orden de ids", () => {
    assert.equal(
      catalogEnsureInflightKey("pop", "list-1", ["b", "a"], ["r2", "r1"]),
      catalogEnsureInflightKey("pop", "list-1", ["a", "b"], ["r1", "r2"]),
    )
  })
})
