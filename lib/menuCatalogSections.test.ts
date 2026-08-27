import assert from "node:assert/strict"
import { describe, it } from "node:test"
import {
  buildMenuCatalogSections,
  hasVisibleMenuComboPromotions,
} from "./menuCatalogSections"
import type { PromotionSnapshot } from "./popLocalDb/types"

function promo(
  partial: Partial<PromotionSnapshot> & Pick<PromotionSnapshot, "id" | "name">,
): PromotionSnapshot {
  return {
    description: "",
    imageUrl: null,
    promotionType: "combo",
    pricingMode: "fixed_total",
    fixedPrice: 1000,
    discountMode: null,
    discountValue: null,
    buyQuantity: null,
    benefitQuantity: null,
    benefitDiscountPct: null,
    applyBenefitTo: null,
    autoApply: false,
    showInMenu: true,
    isActive: true,
    sortOrder: 0,
    validFrom: null,
    validUntil: null,
    validTimeStart: null,
    validTimeEnd: null,
    scheduleDays: [],
    slots: [],
    ...partial,
  }
}

describe("menu catalog sections", () => {
  it("arma Recetas y Productos y pone Promociones adelante si hay combo visible", () => {
    const sections = buildMenuCatalogSections({
      recipeCategories: [{ id: "r1", name: "Cocina", sortOrder: 1 }],
      productCategories: [{ id: "p1", name: "Bebidas", sortOrder: 0 }],
      hasPromotions: true,
    })
    assert.deepEqual(
      sections.map((section) => section.id),
      ["promotions", "recipes", "products"],
    )
  })

  it("omite secciones vacías", () => {
    const sections = buildMenuCatalogSections({
      recipeCategories: [],
      productCategories: [{ id: "p1", name: "Bebidas", sortOrder: 0 }],
      hasPromotions: false,
    })
    assert.deepEqual(
      sections.map((section) => section.id),
      ["products"],
    )
  })

  it("un combo activo de menú enciende el rail de promociones", () => {
    assert.equal(
      hasVisibleMenuComboPromotions([
        promo({ id: "p1", name: "Combo", showInMenu: false }),
        promo({ id: "p2", name: "Combo menú" }),
      ]),
      true,
    )
    assert.equal(
      hasVisibleMenuComboPromotions([
        promo({ id: "p1", name: "Combo", isActive: false }),
      ]),
      false,
    )
  })
})
