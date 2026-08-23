"use client"

import type { SaleCatalogArticle } from "@/app/[siteId]/[popId]/sale/actions"
import { useCatalogItemCache } from "@/hooks/useCatalogItemCache"
import {
  saleCatalogKnownArticlesQueryKey,
  saleCatalogQueryKey,
  saleComprobantesQueryKey,
  salePaymentContextQueryKey,
} from "@/lib/queryKeys"
import { sessionListQueryOptions } from "@/lib/queryStaleTimes"
import {
  fetchSaleCatalog,
  fetchSaleCatalogArticlesByIds,
  fetchSaleComprobantes,
  fetchSalePaymentContext,
} from "@/lib/rootsyApi/saleClient"
import { DEFAULT_SALE_SITE_ID } from "@/lib/saleInvoiceTypes"
import { useSalePriceListId } from "@/lib/salePriceListSession"
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
      const res = await fetchSaleCatalog(popId!)
      if (!res.success) throw new Error(res.error)
      return res
    },
    enabled,
    ...sessionListQueryOptions,
  })

  const paymentQuery = useQuery({
    queryKey: salePaymentContextQueryKey(popId ?? ""),
    queryFn: async () => {
      const res = await fetchSalePaymentContext(popId!)
      if (!res.success) throw new Error(res.error)
      return res.context
    },
    enabled,
    ...sessionListQueryOptions,
  })

  const comprobantesQuery = useQuery({
    queryKey: saleComprobantesQueryKey(popId ?? ""),
    queryFn: async () => {
      const res = await fetchSaleComprobantes(popId!)
      if (!res.success) throw new Error(res.error)
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
    await Promise.all([
      catalogQuery.refetch(),
      paymentQuery.refetch(),
      comprobantesQuery.refetch(),
    ])
  }, [catalogQuery, comprobantesQuery, paymentQuery])

  const knownArticles = articleCache.items
  const mergeArticles = articleCache.merge
  const ensureCatalogArticles = useCallback(
    async (ids: string[]) => {
      if (!popId) return
      const known = new Set(knownArticles.map((row) => row.id))
      const missing = [...new Set(ids)].filter((id) => id && !known.has(id))
      if (missing.length === 0) return
      const res = await fetchSaleCatalogArticlesByIds(popId, missing, priceListId)
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
    treasuryPaymentContext: paymentQuery.data ?? null,
    canReadClients: data?.canReadClients ?? false,
    canReadPaymentMethods: data?.canReadPaymentMethods ?? false,
    canCreateSale: data?.canCreateSale ?? false,
    canReadCashRegisters: data?.canReadCashRegisters ?? false,
    openCashSession: data?.openCashSession ?? null,
    invoiceTypeSiteId:
      comprobantesQuery.data?.invoiceTypeSiteId ??
      data?.invoiceTypeSiteId ??
      DEFAULT_SALE_SITE_ID,
    saleCategories: data?.categories ?? [],
    saleCategorySections: data?.categorySections ?? [],
    hasValidPopFiscalCuit:
      comprobantesQuery.data?.hasValidFiscalCuit ?? false,
    popEmisorIvaCondition:
      comprobantesQuery.data?.emisorIvaCondition ?? "responsable_inscripto",
    comprobanteOptions: comprobantesQuery.data?.options ?? [],
    comprobantesLoaded: comprobantesQuery.isSuccess,
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
