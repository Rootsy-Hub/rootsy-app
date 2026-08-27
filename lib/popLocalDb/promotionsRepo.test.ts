import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { createPopLocalDatabase } from "./engine"
import { splitLocalPromotionsForSale } from "./mapPromotion"
import {
  deletePromotionById,
  deletePromotionsNotIn,
  listAllPromotions,
  upsertPromotionSnapshots,
} from "./promotionsRepo"
import type { PromotionSnapshot } from "./types"

function snap(
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
    slots: [
      {
        id: `${partial.id}-slot`,
        label: "Producto",
        quantity: 1,
        sortOrder: 0,
        options: [
          {
            id: `${partial.id}-opt`,
            kind: "article",
            refId: "art-1",
            name: "Coca",
            salePrice: 500,
            iva: 21,
          },
        ],
      },
    ],
    ...partial,
  }
}

describe("pop local db promotions", () => {
  it("guarda inactivas pero Vender solo lista combo en menú y 2x1 auto", async () => {
    const db = await createPopLocalDatabase()
    upsertPromotionSnapshots(db, [
      snap({ id: "p1", name: "Combo visible" }),
      snap({ id: "p2", name: "Combo oculta", showInMenu: false }),
      snap({ id: "p3", name: "Combo inactiva", isActive: false }),
      snap({
        id: "p4",
        name: "2x1 auto",
        promotionType: "quantity_deal",
        autoApply: true,
        showInMenu: false,
        buyQuantity: 2,
        benefitQuantity: 1,
        benefitDiscountPct: 100,
        applyBenefitTo: "cheapest",
      }),
      snap({
        id: "p5",
        name: "2x1 manual",
        promotionType: "quantity_deal",
        autoApply: false,
        showInMenu: true,
        buyQuantity: 2,
        benefitQuantity: 1,
        benefitDiscountPct: 100,
        applyBenefitTo: "cheapest",
      }),
    ])
    assert.equal(listAllPromotions(db).length, 5)
    const sale = splitLocalPromotionsForSale(listAllPromotions(db))
    assert.deepEqual(
      sale.combos.map((row) => row.id),
      ["p1"],
    )
    assert.deepEqual(
      sale.quantityDeals.map((row) => row.id),
      ["p4"],
    )
  })

  it("tira combos con receta al filtrar para Vender", async () => {
    const db = await createPopLocalDatabase()
    upsertPromotionSnapshots(db, [
      snap({
        id: "p1",
        name: "Mixto",
        slots: [
          {
            id: "s1",
            label: "Producto",
            quantity: 1,
            sortOrder: 0,
            options: [
              {
                id: "o1",
                kind: "article",
                refId: "art-1",
                name: "Coca",
                salePrice: 500,
                iva: 21,
              },
            ],
          },
          {
            id: "s2",
            label: "Receta",
            quantity: 1,
            sortOrder: 1,
            options: [
              {
                id: "o2",
                kind: "recipe",
                refId: "rec-1",
                name: "Burger",
                salePrice: 2000,
                iva: 21,
              },
            ],
          },
        ],
      }),
    ])
    const sale = splitLocalPromotionsForSale(listAllPromotions(db))
    assert.deepEqual(sale.combos, [])
  })

  it("el replace borra las que ya no vienen en el dump", async () => {
    const db = await createPopLocalDatabase()
    upsertPromotionSnapshots(db, [
      snap({ id: "p1", name: "Keep" }),
      snap({ id: "p2", name: "Drop" }),
    ])
    deletePromotionsNotIn(db, ["p1"])
    assert.deepEqual(
      listAllPromotions(db).map((row) => row.id),
      ["p1"],
    )
    deletePromotionById(db, "p1")
    assert.deepEqual(listAllPromotions(db), [])
  })
})
