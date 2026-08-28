import type { GetPopRecipesTableInput } from "@/app/[siteId]/[popId]/recipes/actions"
import {
  beginCatalogArticleHydrate,
  catalogHydrateEpochIsCurrent,
  endCatalogArticleHydrate,
} from "@/lib/catalogRealtime/hydrateGate"
import {
  clearRecipesHydratedMark,
  isRecipesHydrated,
  markRecipesHydrated,
} from "@/lib/popLocalDb/hydrateMarks"
import { recipeDumpRowToSnapshot } from "@/lib/popLocalDb/mapRecipe"
import {
  deleteRecipesNotIn,
  upsertRecipeSnapshots,
} from "@/lib/popLocalDb/recipesRepo"
import { getOpenedPopLocalDb } from "@/lib/popLocalDb/store"
import type { RecipeSnapshot } from "@/lib/popLocalDb/types"
import { fetchPopRecipesTable } from "@/lib/rootsyApi/recipesClient"

export const POP_LOCAL_RECIPES_PAGE_SIZE = 100

export function popLocalRecipesHydrateInput(
  page: number,
): GetPopRecipesTableInput {
  return {
    page,
    pageSize: POP_LOCAL_RECIPES_PAGE_SIZE,
    q: "",
    soloActivos: false,
    categoryId: "",
    sort: "name",
    ord: "asc",
  }
}

export async function fetchOperateRecipePages(
  popId: string,
  onPage?: (rows: RecipeSnapshot[]) => void,
): Promise<RecipeSnapshot[]> {
  const recipes: RecipeSnapshot[] = []
  let page = 1
  for (;;) {
    const res = await fetchPopRecipesTable(
      popId,
      popLocalRecipesHydrateInput(page),
    )
    if (!res.success) throw new Error(res.error)
    const snapshots = res.recipes.map((row) => recipeDumpRowToSnapshot(row))
    recipes.push(...snapshots)
    onPage?.(snapshots)
    if (page * POP_LOCAL_RECIPES_PAGE_SIZE >= res.totalCount) break
    page += 1
  }
  return recipes
}

const hydrateLocks = new Map<string, Promise<void>>()

export async function hydratePopRecipesFromNetwork(
  popId: string,
  options?: { onProgress?: () => void },
): Promise<void> {
  const pending = hydrateLocks.get(popId)
  if (pending) return pending

  const run = (async () => {
    const handle = await getOpenedPopLocalDb(popId)
    if (isRecipesHydrated(handle.database)) return
    const startedEpoch = beginCatalogArticleHydrate()
    try {
      const seenIds: string[] = []
      await fetchOperateRecipePages(popId, (pageRows) => {
        upsertRecipeSnapshots(handle.database, pageRows)
        for (const row of pageRows) seenIds.push(row.id)
        handle.markDirty()
        options?.onProgress?.()
      })
      if (!catalogHydrateEpochIsCurrent(startedEpoch)) return
      handle.database.transaction(() => {
        deleteRecipesNotIn(handle.database, seenIds)
      })
      if (!catalogHydrateEpochIsCurrent(startedEpoch)) return
      const hydratedAt = new Date().toISOString()
      handle.database.setMeta("recipes_last_hydrated_at", hydratedAt)
      markRecipesHydrated(handle.database, hydratedAt)
      handle.markDirty()
      await handle.flush()
      options?.onProgress?.()
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

export async function clearPopLocalRecipesHydrateMark(popId: string) {
  const handle = await getOpenedPopLocalDb(popId)
  clearRecipesHydratedMark(handle.database)
  handle.markDirty()
  await handle.flush()
}
