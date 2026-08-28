import type {
  MenuCatalogArticle,
  MenuCatalogRecipe,
} from "@/app/[siteId]/[popId]/menu-catalog/actions"
import { getArticleById } from "@/lib/popLocalDb/articlesRepo"
import type { PopLocalDatabase } from "@/lib/popLocalDb/database"
import { recipeSnapshotToMenuCatalogRecipe } from "@/lib/popLocalDb/mapRecipe"
import { getRecipeById } from "@/lib/popLocalDb/recipesRepo"
import { articleSnapshotToSaleCatalogArticle } from "@/lib/saleCatalogArticleMap"

export function missingCatalogIds(
  requested: string[],
  knownIds: Iterable<string>,
): string[] {
  const known = new Set(knownIds)
  return [...new Set(requested.filter(Boolean))].filter((id) => !known.has(id))
}

export function resolveCatalogItemsFromLocalDb(
  db: PopLocalDatabase,
  articleIds: string[],
  recipeIds: string[],
  priceListId?: string,
): { articles: MenuCatalogArticle[]; recipes: MenuCatalogRecipe[] } {
  const articles: MenuCatalogArticle[] = []
  for (const id of articleIds) {
    const row = getArticleById(db, id)
    if (row) articles.push(articleSnapshotToSaleCatalogArticle(row, priceListId))
  }
  const recipes: MenuCatalogRecipe[] = []
  for (const id of recipeIds) {
    const row = getRecipeById(db, id)
    if (row) recipes.push(recipeSnapshotToMenuCatalogRecipe(row, priceListId))
  }
  return { articles, recipes }
}

export function catalogEnsureInflightKey(
  popId: string,
  priceListId: string | undefined,
  articleIds: string[],
  recipeIds: string[],
): string {
  const list = priceListId?.trim() || "principal"
  return `${popId}|${list}|a:${[...articleIds].sort().join(",")}|r:${[...recipeIds].sort().join(",")}`
}
