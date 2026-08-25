import type { GetPopArticlesTableInput } from "@/app/[siteId]/[popId]/articles/actions"
import {
  deleteMerchandiseNotInCategory,
  upsertArticleSnapshots,
} from "@/lib/popLocalDb/articlesRepo"
import {
  backfillArticlesHydratedMarks,
  clearArticlesHydratedMarks,
  isArticlesCategoryHydrated,
  markArticlesCategoryHydrated,
} from "@/lib/popLocalDb/hydrateMarks"
import { articleListItemToSnapshot } from "@/lib/popLocalDb/mapArticle"
import { getOpenedPopLocalDb } from "@/lib/popLocalDb/store"
import type { ArticleSnapshot } from "@/lib/popLocalDb/types"
import { fetchPopArticlesTable } from "@/lib/rootsyApi/articlesClient"

export const POP_LOCAL_ARTICLES_PAGE_SIZE = 100

export function popLocalArticlesHydrateInput(
  page: number,
  categoryId: string,
): GetPopArticlesTableInput {
  return {
    page,
    pageSize: POP_LOCAL_ARTICLES_PAGE_SIZE,
    search: "",
    soloActivos: true,
    soloInactivos: false,
    conDescuento: false,
    sinDescuento: false,
    conStock: false,
    sinStock: false,
    stockNegativo: false,
    ventaSinStock: false,
    categoryId,
    itemKinds: ["merchandise"],
    sort: "name",
    ord: "asc",
  }
}

const hydrateLocks = new Map<string, Promise<void>>()

function hydrateLockKey(popId: string, categoryId: string) {
  return `${popId}:${categoryId}`
}

export async function hydratePopArticlesFromNetwork(
  popId: string,
  options: { categoryId: string; onProgress?: () => void },
): Promise<void> {
  const categoryId = options.categoryId.trim()
  if (!categoryId) return

  const lockKey = hydrateLockKey(popId, categoryId)
  const pending = hydrateLocks.get(lockKey)
  if (pending) return pending

  const run = (async () => {
    const handle = await getOpenedPopLocalDb(popId)
    const backfilled = backfillArticlesHydratedMarks(handle.database)
    if (isArticlesCategoryHydrated(handle.database, categoryId)) {
      if (backfilled) {
        handle.markDirty()
        await handle.flush()
      }
      return
    }
    const seenIds: string[] = []
    let page = 1
    for (;;) {
      const res = await fetchPopArticlesTable(
        popId,
        popLocalArticlesHydrateInput(page, categoryId),
      )
      if (!res.success) throw new Error(res.error)
      const snapshots: ArticleSnapshot[] = res.articles.map(
        articleListItemToSnapshot,
      )
      upsertArticleSnapshots(handle.database, snapshots)
      for (const row of snapshots) seenIds.push(row.id)
      handle.markDirty()
      options.onProgress?.()
      if (page * POP_LOCAL_ARTICLES_PAGE_SIZE >= res.totalCount) break
      page += 1
    }
    handle.database.transaction(() => {
      deleteMerchandiseNotInCategory(handle.database, categoryId, seenIds)
    })
    const hydratedAt = new Date().toISOString()
    handle.database.setMeta("articles_last_hydrated_at", hydratedAt)
    markArticlesCategoryHydrated(handle.database, categoryId, hydratedAt)
    handle.markDirty()
    await handle.flush()
    options.onProgress?.()
  })()

  hydrateLocks.set(lockKey, run)
  try {
    await run
  } finally {
    hydrateLocks.delete(lockKey)
  }
}

/** Tras invalidar el catálogo (p. ej. venta cobrada) hay que volver a hidratar. */
export async function clearPopLocalArticlesHydrateMarks(popId: string) {
  const handle = await getOpenedPopLocalDb(popId)
  clearArticlesHydratedMarks(handle.database)
  handle.markDirty()
  await handle.flush()
}
