import {
  beginCatalogArticleHydrate,
  catalogHydrateEpochIsCurrent,
  endCatalogArticleHydrate,
} from "@/lib/catalogRealtime/hydrateGate"
import {
  clearRecipeBomHydratedMark,
  isRecipeBomHydrated,
  markRecipeBomHydrated,
} from "@/lib/popLocalDb/hydrateMarks"
import { articleListItemToSnapshot } from "@/lib/popLocalDb/mapArticle"
import { listAllRecipes } from "@/lib/popLocalDb/recipesRepo"
import { replaceAllRecipeIngredients } from "@/lib/popLocalDb/recipeIngredientsRepo"
import { upsertArticleSnapshots } from "@/lib/popLocalDb/articlesRepo"
import { getOpenedPopLocalDb } from "@/lib/popLocalDb/store"
import type { RecipeIngredientSnapshot } from "@/lib/popLocalDb/types"
import { fetchPopArticlesByIds } from "@/lib/rootsyApi/articlesClient"
import { fetchAllPopRecipeBom } from "@/lib/rootsyApi/recipesClient"

const hydrateLocks = new Map<string, Promise<void>>()

export async function hydratePopRecipeBomFromNetwork(
  popId: string,
  options?: { onProgress?: () => void },
): Promise<void> {
  const pending = hydrateLocks.get(popId)
  if (pending) return pending

  const run = (async () => {
    const handle = await getOpenedPopLocalDb(popId)
    if (isRecipeBomHydrated(handle.database)) return
    const startedEpoch = beginCatalogArticleHydrate()
    try {
      const bomRows = await fetchAllPopRecipeBom(popId)
      if (!catalogHydrateEpochIsCurrent(startedEpoch)) return
      const ingredients: RecipeIngredientSnapshot[] = bomRows.map((row) => ({
        recipeId: row.recipeId,
        articleId: row.articleId,
        quantity: row.quantity,
        wastePct: row.wastePct,
        articleDefaultWastePct: row.articleDefaultWastePct,
        sortOrder: row.sortOrder,
      }))
      handle.database.transaction(() => {
        replaceAllRecipeIngredients(handle.database, ingredients)
      })
      handle.markDirty()
      options?.onProgress?.()

      const articleIds = new Set<string>()
      for (const row of ingredients) articleIds.add(row.articleId)
      for (const recipe of listAllRecipes(handle.database)) {
        if (recipe.outputArticleId) articleIds.add(recipe.outputArticleId)
      }
      if (articleIds.size > 0) {
        const articles = await fetchPopArticlesByIds(popId, [...articleIds])
        if (!catalogHydrateEpochIsCurrent(startedEpoch)) return
        upsertArticleSnapshots(
          handle.database,
          articles.map(articleListItemToSnapshot),
        )
        handle.markDirty()
        options?.onProgress?.()
      }

      if (!catalogHydrateEpochIsCurrent(startedEpoch)) return
      const hydratedAt = new Date().toISOString()
      handle.database.setMeta("recipe_bom_last_hydrated_at", hydratedAt)
      markRecipeBomHydrated(handle.database, hydratedAt)
      handle.markDirty()
      await handle.flush()
    } finally {
      endCatalogArticleHydrate(startedEpoch)
    }
  })()

  hydrateLocks.set(popId, run)
  try {
    await run
  } finally {
    hydrateLocks.delete(popId)
  }
}

export async function clearPopLocalRecipeBomHydrateMark(popId: string) {
  const handle = await getOpenedPopLocalDb(popId)
  clearRecipeBomHydratedMark(handle.database)
  handle.markDirty()
  await handle.flush()
}
