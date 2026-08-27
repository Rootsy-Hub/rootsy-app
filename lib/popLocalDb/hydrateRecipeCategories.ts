import {
  clearRecipeCategoriesHydratedMark,
  isRecipeCategoriesHydrated,
  markRecipeCategoriesHydrated,
} from "@/lib/popLocalDb/hydrateMarks"
import { dtoToRecipeCategorySnapshot } from "@/lib/popLocalDb/mapRecipeCategory"
import { replaceAllRecipeCategories } from "@/lib/popLocalDb/recipeCategoriesRepo"
import { getOpenedPopLocalDb } from "@/lib/popLocalDb/store"
import { fetchPopRecipeCategories } from "@/lib/rootsyApi/recipeCategoriesClient"

const hydrateLocks = new Map<string, Promise<void>>()

export async function hydratePopRecipeCategoriesFromNetwork(
  popId: string,
): Promise<void> {
  const pending = hydrateLocks.get(popId)
  if (pending) return pending

  const run = (async () => {
    const handle = await getOpenedPopLocalDb(popId)
    if (isRecipeCategoriesHydrated(handle.database)) return
    const rows = await fetchPopRecipeCategories(popId)
    replaceAllRecipeCategories(
      handle.database,
      rows.map(dtoToRecipeCategorySnapshot),
    )
    markRecipeCategoriesHydrated(handle.database)
    handle.markDirty()
    await handle.flush()
  })()

  hydrateLocks.set(popId, run)
  try {
    await run
  } finally {
    hydrateLocks.delete(popId)
  }
}

export async function clearPopLocalRecipeCategoriesHydrateMark(popId: string) {
  const handle = await getOpenedPopLocalDb(popId)
  clearRecipeCategoriesHydratedMark(handle.database)
  handle.markDirty()
  await handle.flush()
}
