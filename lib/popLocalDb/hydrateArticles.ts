import type { GetPopArticlesTableInput } from "@/app/[siteId]/[popId]/articles/actions"
import {
  beginCatalogArticleHydrate,
  catalogHydrateEpochIsCurrent,
  endCatalogArticleHydrate,
} from "@/lib/catalogRealtime/hydrateGate"
import { deleteMerchandiseNotIn, upsertArticleSnapshots } from "@/lib/popLocalDb/articlesRepo"
import {
  clearArticlesHydratedMarks,
  isArticlesHydrated,
  markArticlesHydrated,
} from "@/lib/popLocalDb/hydrateMarks"
import { prefetchCatalogProductImages } from "@/lib/catalogProductImageCache"
import { articleListItemToSnapshot } from "@/lib/popLocalDb/mapArticle"
import { getOpenedPopLocalDb } from "@/lib/popLocalDb/store"
import type { ArticleSnapshot } from "@/lib/popLocalDb/types"
import {
  fetchPopArticlesTable,
  type ArticleListItem,
} from "@/lib/rootsyApi/articlesClient"

export const POP_LOCAL_ARTICLES_PAGE_SIZE = 100

export function popLocalArticlesHydrateInput(
  page: number,
): GetPopArticlesTableInput {
  return {
    page,
    pageSize: POP_LOCAL_ARTICLES_PAGE_SIZE,
    search: "",
    soloActivos: false,
    soloInactivos: false,
    conDescuento: false,
    sinDescuento: false,
    conStock: false,
    sinStock: false,
    stockNegativo: false,
    ventaSinStock: false,
    includeStock: false,
    categoryId: "",
    itemKinds: ["merchandise"],
    sort: "name",
    ord: "asc",
  }
}

export async function fetchSaleBoardMerchandisePages(
  popId: string,
  onPage?: (articles: ArticleListItem[]) => void,
): Promise<ArticleListItem[]> {
  const articles: ArticleListItem[] = []
  let page = 1
  for (;;) {
    const res = await fetchPopArticlesTable(
      popId,
      popLocalArticlesHydrateInput(page),
    )
    if (!res.success) throw new Error(res.error)
    articles.push(...res.articles)
    onPage?.(res.articles)
    if (page * POP_LOCAL_ARTICLES_PAGE_SIZE >= res.totalCount) break
    page += 1
  }
  return articles
}

const hydrateLocks = new Map<string, Promise<void>>()

export async function hydratePopArticlesFromNetwork(
  popId: string,
  options?: { onProgress?: () => void },
): Promise<void> {
  const pending = hydrateLocks.get(popId)
  if (pending) return pending

  const run = (async () => {
    const handle = await getOpenedPopLocalDb(popId)
    if (isArticlesHydrated(handle.database)) return
    const startedEpoch = beginCatalogArticleHydrate()
    try {
      const seenIds: string[] = []
      await fetchSaleBoardMerchandisePages(popId, (pageRows) => {
        const snapshots: ArticleSnapshot[] = pageRows.map(
          articleListItemToSnapshot,
        )
        upsertArticleSnapshots(handle.database, snapshots)
        prefetchCatalogProductImages(snapshots.map((row) => row.imageUrl))
        for (const row of snapshots) seenIds.push(row.id)
        handle.markDirty()
        options?.onProgress?.()
      })
      if (!catalogHydrateEpochIsCurrent(startedEpoch)) return
      handle.database.transaction(() => {
        deleteMerchandiseNotIn(handle.database, seenIds)
      })
      if (!catalogHydrateEpochIsCurrent(startedEpoch)) return
      const hydratedAt = new Date().toISOString()
      handle.database.setMeta("articles_last_hydrated_at", hydratedAt)
      markArticlesHydrated(handle.database, hydratedAt)
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

/** Tras invalidar el catálogo (p. ej. venta cobrada) hay que volver a hidratar. */
export async function clearPopLocalArticlesHydrateMarks(popId: string) {
  const handle = await getOpenedPopLocalDb(popId)
  clearArticlesHydratedMarks(handle.database)
  handle.markDirty()
  await handle.flush()
}
