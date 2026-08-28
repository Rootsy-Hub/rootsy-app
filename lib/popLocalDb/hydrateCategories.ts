import {
  clearCategoriesHydratedMark,
  isCategoriesHydrated,
  markCategoriesHydrated,
} from "@/lib/popLocalDb/hydrateMarks"
import { replaceAllCategories } from "@/lib/popLocalDb/categoriesRepo"
import { dtoToCategorySnapshot } from "@/lib/popLocalDb/mapCategory"
import { getOpenedPopLocalDb } from "@/lib/popLocalDb/store"
import { fetchPopCategoryDtos } from "@/lib/rootsyApi/categoriesClient"

const hydrateLocks = new Map<string, Promise<void>>()

export async function hydratePopCategoriesFromNetwork(popId: string): Promise<void> {
  const pending = hydrateLocks.get(popId)
  if (pending) return pending

  const run = (async () => {
    const handle = await getOpenedPopLocalDb(popId)
    if (isCategoriesHydrated(handle.database)) return
    const rows = await fetchPopCategoryDtos(popId)
    replaceAllCategories(
      handle.database,
      rows.map(dtoToCategorySnapshot),
    )
    markCategoriesHydrated(handle.database)
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

export async function clearPopLocalCategoriesHydrateMark(popId: string) {
  const handle = await getOpenedPopLocalDb(popId)
  clearCategoriesHydratedMark(handle.database)
  handle.markDirty()
  await handle.flush()
}
