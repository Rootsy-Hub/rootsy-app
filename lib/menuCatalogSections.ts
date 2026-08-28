import type { SaleCatalogCategory } from "@/app/[siteId]/[popId]/sale/actions"
import type { MenuCatalogCategorySection } from "@/app/[siteId]/[popId]/menu-catalog/actions"
import type {
  CategorySnapshot,
  PromotionSnapshot,
  RecipeCategorySnapshot,
} from "@/lib/popLocalDb/types"

export function categorySnapshotToRail(
  row: Pick<CategorySnapshot, "id" | "name" | "sortOrder">,
): SaleCatalogCategory {
  return {
    id: row.id,
    name: row.name,
    sortOrder: row.sortOrder,
  }
}

export function recipeCategorySnapshotToRail(
  row: Pick<RecipeCategorySnapshot, "id" | "name" | "sortOrder">,
): SaleCatalogCategory {
  return {
    id: row.id,
    name: row.name,
    sortOrder: row.sortOrder,
  }
}

export function hasVisibleMenuComboPromotions(
  rows: PromotionSnapshot[],
): boolean {
  return rows.some(
    (row) =>
      row.isActive && row.promotionType === "combo" && row.showInMenu,
  )
}

export function buildMenuCatalogSections(input: {
  recipeCategories: SaleCatalogCategory[]
  productCategories: SaleCatalogCategory[]
  hasPromotions: boolean
}): MenuCatalogCategorySection[] {
  const sections: MenuCatalogCategorySection[] = []
  if (input.hasPromotions) {
    sections.push({
      id: "promotions",
      label: "Promociones",
      categories: [{ id: "all", name: "Promociones", sortOrder: 0 }],
    })
  }
  if (input.recipeCategories.length > 0) {
    sections.push({
      id: "recipes",
      label: "Recetas",
      categories: input.recipeCategories,
    })
  }
  if (input.productCategories.length > 0) {
    sections.push({
      id: "products",
      label: "Productos",
      categories: input.productCategories,
    })
  }
  return sections
}
