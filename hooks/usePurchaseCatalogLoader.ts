"use client"

import {
  getPurchaseCatalogArticlesByIds,
  type PurchaseCatalogArticle,
} from "@/app/[siteId]/[popId]/purchases/actions"
import { useCatalogItemCache } from "@/hooks/useCatalogItemCache"
import { purchaseCatalogQueryOptions } from "@/lib/purchaseWorkspaceQuery"
import { purchaseCatalogKnownArticlesQueryKey } from "@/lib/queryKeys"
import { useQuery } from "@tanstack/react-query"
import { useCallback } from "react"

type UsePurchaseCatalogLoaderOptions = {
  enabled?: boolean
}

export function usePurchaseCatalogLoader(
  popId: string | undefined,
  options?: UsePurchaseCatalogLoaderOptions,
) {
  const enabled = (options?.enabled ?? true) && Boolean(popId)

  const catalogQuery = useQuery({
    ...purchaseCatalogQueryOptions(popId ?? ""),
    enabled,
  })

  const data = catalogQuery.data
  const articleCache = useCatalogItemCache<PurchaseCatalogArticle>(
    purchaseCatalogKnownArticlesQueryKey(popId ?? ""),
  )
  const reloadCatalog = useCallback(async () => {
    await catalogQuery.refetch()
  }, [catalogQuery])

  const knownArticles = articleCache.items
  const mergeArticles = articleCache.merge
  const ensureCatalogArticles = useCallback(
    async (ids: string[]) => {
      if (!popId) return
      const known = new Set(knownArticles.map((row) => row.id))
      const missing = [...new Set(ids)].filter((id) => id && !known.has(id))
      if (missing.length === 0) return
      const res = await getPurchaseCatalogArticlesByIds(popId, missing)
      if (res.success) mergeArticles(res.articles)
    },
    [knownArticles, mergeArticles, popId],
  )

  return {
    mergeCatalogArticles: mergeArticles,
    ensureCatalogArticles,
    catalogArticles: articleCache.items,
    catalogCategorySections: data?.categorySections ?? [],
    popName: data?.popName ?? "",
    canCreate: data?.canCreate ?? false,
    canUpdateArticles: data?.canUpdateArticles ?? false,
    treasuryPaymentContext: data?.treasuryPaymentContext ?? null,
    canReadPaymentMethods: data?.canReadPaymentMethods ?? false,
    catalogLoading: catalogQuery.isLoading,
    catalogPending: catalogQuery.isPending && !catalogQuery.data,
    catalogError:
      catalogQuery.error instanceof Error
        ? catalogQuery.error.message
        : catalogQuery.error
          ? String(catalogQuery.error)
          : null,
    reloadCatalog,
  }
}
