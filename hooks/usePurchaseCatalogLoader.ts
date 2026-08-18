"use client"

import {
  getPurchaseCatalog,
  getPurchaseCatalogArticlesByIds,
  type PurchaseCatalogArticle,
} from "@/app/[siteId]/[popId]/purchases/actions"
import { useCatalogItemCache } from "@/hooks/useCatalogItemCache"
import { usePopCatalogRev } from "@/hooks/usePopCatalogRev"
import {
  purchaseCatalogKnownArticlesQueryKey,
  purchaseCatalogQueryKey,
} from "@/lib/queryKeys"
import { sessionListQueryOptions } from "@/lib/queryStaleTimes"
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
  const revQuery = usePopCatalogRev(popId, enabled)
  const catalogRev = revQuery.data

  const catalogQuery = useQuery({
    queryKey: purchaseCatalogQueryKey(popId ?? "", catalogRev),
    queryFn: async () => {
      const res = await getPurchaseCatalog(popId!, { items: "none" })
      if (!res.success) {
        throw new Error(res.error)
      }
      return res
    },
    enabled: enabled && catalogRev != null,
    ...sessionListQueryOptions,
  })

  const data = catalogQuery.data
  const articleCache = useCatalogItemCache<PurchaseCatalogArticle>(
    purchaseCatalogKnownArticlesQueryKey(popId ?? "", catalogRev),
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
    catalogRev,
    mergeCatalogArticles: mergeArticles,
    ensureCatalogArticles,
    catalogArticles: articleCache.items,
    catalogCategorySections: data?.categorySections ?? [],
    popName: data?.popName ?? "",
    canCreate: data?.canCreate ?? false,
    canUpdateArticles: data?.canUpdateArticles ?? false,
    treasuryPaymentContext: data?.treasuryPaymentContext ?? null,
    canReadPaymentMethods: data?.canReadPaymentMethods ?? false,
    catalogLoading: revQuery.isLoading || catalogQuery.isLoading,
    catalogError:
      revQuery.error instanceof Error
        ? revQuery.error.message
        : revQuery.error
          ? String(revQuery.error)
          : catalogQuery.error instanceof Error
            ? catalogQuery.error.message
            : catalogQuery.error
              ? String(catalogQuery.error)
              : null,
    reloadCatalog,
  }
}
