import type { MenuCatalogPromotion } from "@/app/[siteId]/[popId]/menu-catalog/actions"

/** Combos vendibles sin opciones de receta (Vender no usa recetas). */
export function filterPromotionForSale(
  promotion: MenuCatalogPromotion,
): MenuCatalogPromotion | null {
  const slots = promotion.slots
    .map((slot) => ({
      ...slot,
      options: slot.options.filter((o) => o.kind === "article"),
    }))
    .filter((slot) => slot.options.length > 0)
  if (slots.length !== promotion.slots.length) return null
  return { ...promotion, slots }
}

export function filterComboPromotionsForSale(
  promotions: MenuCatalogPromotion[],
): MenuCatalogPromotion[] {
  return promotions
    .map(filterPromotionForSale)
    .filter((p): p is MenuCatalogPromotion => p != null)
}
