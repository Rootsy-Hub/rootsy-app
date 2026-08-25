import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { isSaleBoardPersistedQueryKey } from "./queryPersist"
import {
  saleBoardArticlesQueryKey,
  saleBoardCategoriesQueryKey,
} from "./queryKeys"

describe("sale board persist", () => {
  it("persiste categorías del tablero", () => {
    assert.equal(
      isSaleBoardPersistedQueryKey(saleBoardCategoriesQueryKey("pop-1")),
      true,
    )
  })

  it("persiste artículos por categoría y no la búsqueda", () => {
    assert.equal(
      isSaleBoardPersistedQueryKey(
        saleBoardArticlesQueryKey("pop-1", "cat-1"),
      ),
      true,
    )
    assert.equal(
      isSaleBoardPersistedQueryKey(
        saleBoardArticlesQueryKey("pop-1", "cat-1", "coca"),
      ),
      false,
    )
  })

  it("no persiste otras queries", () => {
    assert.equal(isSaleBoardPersistedQueryKey(["sale-catalog", "pop-1"]), false)
    assert.equal(
      isSaleBoardPersistedQueryKey(["pop-article-categories", "pop-1"]),
      false,
    )
  })
})
