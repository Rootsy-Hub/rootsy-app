"use client"

import type { SaleCatalogArticle } from "@/app/[siteId]/[popId]/sale/actions"
import { useCatalogItemCache } from "@/hooks/useCatalogItemCache"
import { useOpenCashSession } from "@/hooks/useOpenCashSession"
import { resolveOperateOpenCashSession } from "@/lib/saleOpenCashSession"
import { saleCatalogKnownArticlesQueryKey } from "@/lib/queryKeys"
import { fetchSaleCatalogArticlesByIds } from "@/lib/rootsyApi/saleClient"
import { DEFAULT_SALE_SITE_ID } from "@/lib/saleInvoiceTypes"
import { useSalePriceListId } from "@/lib/salePriceListSession"
import {
  saleCatalogQueryOptions,
  saleComprobantesQueryOptions,
  salePaymentContextQueryOptions,
} from "@/lib/saleWorkspaceQuery"
import { useQuery } from "@tanstack/react-query"
import { useCallback, useMemo } from "react"

type UseSaleCatalogLoaderOptions = {
  enabled?: boolean
}

export function useSaleCatalogLoader(
  popId: string | undefined,
  options?: UseSaleCatalogLoaderOptions,
) {
  const enabled = (options?.enabled ?? true) && Boolean(popId)

  const catalogQuery = useQuery({
    ...saleCatalogQueryOptions(popId ?? ""),
    enabled,
  })

  const paymentQuery = useQuery({
    ...salePaymentContextQueryOptions(popId ?? ""),
    enabled,
  })

  const comprobantesQuery = useQuery({
    ...saleComprobantesQueryOptions(popId ?? ""),
    enabled,
  })

  const data = catalogQuery.data
  const operateCash = useOpenCashSession(popId, { enabled })
  const openCashSession = useMemo(
    () =>
      resolveOperateOpenCashSession(
        operateCash.isSuccess,
        operateCash.data,
        data?.openCashSession ?? null,
        paymentQuery.data?.defaultCashTreasuryAccountId,
      ),
    [
      data?.openCashSession,
      operateCash.data,
      operateCash.isSuccess,
      paymentQuery.data?.defaultCashTreasuryAccountId,
    ],
  )
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
    openCashSession,
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
    comprobanteEmitter: comprobantesQuery.data?.emitter ?? null,
    comprobantesLoaded: comprobantesQuery.isSuccess,
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
