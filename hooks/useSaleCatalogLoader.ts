"use client"

import {
  getSaleCatalog,
  getSaleCatalogArticlesByIds,
  type SaleCatalogArticle,
} from "@/app/[siteId]/[popId]/sale/actions"
import { useCatalogItemCache } from "@/hooks/useCatalogItemCache"
import {
  saleCatalogKnownArticlesQueryKey,
  saleCatalogQueryKey,
} from "@/lib/queryKeys"
import { sessionListQueryOptions } from "@/lib/queryStaleTimes"
import { useSalePriceListId } from "@/lib/salePriceListSession"
import { DEFAULT_SALE_SITE_ID } from "@/lib/saleInvoiceTypes"
import { useQuery } from "@tanstack/react-query"
import { useCallback } from "react"

type UseSaleCatalogLoaderOptions = {
  enabled?: boolean
}

export function useSaleCatalogLoader(
  popId: string | undefined,
  options?: UseSaleCatalogLoaderOptions,
) {
  const enabled = (options?.enabled ?? true) && Boolean(popId)

  const catalogQuery = useQuery({
    queryKey: saleCatalogQueryKey(popId ?? ""),
    queryFn: async () => {
      const res = await getSaleCatalog(popId!)
      if (!res.success) {
        throw new Error(res.error)
      }
      return res
    },
    enabled,
    ...sessionListQueryOptions,
  })

  const data = catalogQuery.data
  const priceListId = useSalePriceListId(popId)
  const articleCache = useCatalogItemCache<SaleCatalogArticle>(
    saleCatalogKnownArticlesQueryKey(popId ?? "", priceListId),
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
      const res = await getSaleCatalogArticlesByIds(popId, missing, priceListId)
      if (res.success) mergeArticles(res.articles)
    },
    [knownArticles, mergeArticles, popId, priceListId],
  )

  return {
    mergeCatalogArticles: mergeArticles,
    ensureCatalogArticles,
    catalogArticles: articleCache.items,
    catalogPromotions: data?.promotions ?? [],
    catalogQuantityDeals: data?.quantityDeals ?? [],
    treasuryPaymentContext: data?.treasuryPaymentContext ?? null,
    canReadClients: data?.canReadClients ?? false,
    canReadPaymentMethods: data?.canReadPaymentMethods ?? false,
    canCreateSale: data?.canCreateSale ?? false,
    canReadCashRegisters: data?.canReadCashRegisters ?? false,
    openCashSession: data?.openCashSession ?? null,
    invoiceTypeSiteId: data?.invoiceTypeSiteId ?? DEFAULT_SALE_SITE_ID,
    saleCategories: data?.categories ?? [],
    saleCategorySections: data?.categorySections ?? [],
    catalogLoading: catalogQuery.isLoading,
    catalogError:
      catalogQuery.error instanceof Error
        ? catalogQuery.error.message
        : catalogQuery.error
          ? String(catalogQuery.error)
          : null,
    reloadCatalog,
  }
}
