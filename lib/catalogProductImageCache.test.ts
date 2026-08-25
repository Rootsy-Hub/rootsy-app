import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { isCatalogProductPhotoUrl } from "./catalogProductImageCache"

describe("catalog product image url", () => {
  it("acepta una foto pública", () => {
    assert.equal(
      isCatalogProductPhotoUrl(
        "https://example.supabase.co/storage/v1/object/public/rootsy_catalog_public/p/a.webp",
      ),
      true,
    )
  })

  it("rechaza vacío y placeholder", () => {
    assert.equal(isCatalogProductPhotoUrl(""), false)
    assert.equal(isCatalogProductPhotoUrl(null), false)
    assert.equal(
      isCatalogProductPhotoUrl(
        "https://api.dicebear.com/7.x/shapes/svg?seed=a1",
      ),
      false,
    )
  })
})
