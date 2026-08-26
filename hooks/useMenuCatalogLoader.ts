"use client"

import type {
  MenuCatalogArticle,
  MenuCatalogRecipe,
} from "@/app/[siteId]/[popId]/menu-catalog/actions"
import { useCatalogItemCache } from "@/hooks/useCatalogItemCache"
import {
  menuCatalogKnownArticlesQueryKey,
  menuCatalogKnownRecipesQueryKey,
  menuCatalogQueryKey,
  saleComprobantesQueryKey,
  salePaymentContextQueryKey,
} from "@/lib/queryKeys"
import { sessionListQueryOptions } from "@/lib/queryStaleTimes"
import {
  fetchMenuCatalog,
  fetchMenuCatalogItemsByIds,
} from "@/lib/rootsyApi/menuCatalogClient"
import {
  fetchSaleComprobantes,
  fetchSalePaymentContext,
} from "@/lib/rootsyApi/saleClient"
import { DEFAULT_SALE_SITE_ID } from "@/lib/saleInvoiceTypes"
import { useSalePriceListId } from "@/lib/salePriceListSession"
import { useQuery } from "@tanstack/react-query"
import { useCallback, useState } from "react"

type UseMenuCatalogLoaderOptions = {
  /** Catálogo (categorías, promos, caps, caja). */
  enabled?: boolean
  /** Toolbox (pago y comprobantes). Default: mismo que `enabled`. */
  toolboxEnabled?: boolean
}

export function useMenuCatalogLoader(
  popId: string | undefined,
  options?: UseMenuCatalogLoaderOptions,
) {
  const catalogEnabled = (options?.enabled ?? true) && Boolean(popId)
  const toolboxEnabled =
    (options?.toolboxEnabled ?? options?.enabled ?? true) && Boolean(popId)

  const catalogQuery = useQuery({
    queryKey: menuCatalogQueryKey(popId ?? ""),
    queryFn: async () => {
      const res = await fetchMenuCatalog(popId!)
      if (!res.success) throw new Error(res.error)
      return res
    },
    enabled: catalogEnabled,
    ...sessionListQueryOptions,
  })

  const paymentQuery = useQuery({
    queryKey: salePaymentContextQueryKey(popId ?? ""),
    queryFn: async () => {
      const res = await fetchSalePaymentContext(popId!)
      if (!res.success) throw new Error(res.error)
      return res.context
    },
    enabled: toolboxEnabled,
    ...sessionListQueryOptions,
  })

  const comprobantesQuery = useQuery({
    queryKey: saleComprobantesQueryKey(popId ?? ""),
    queryFn: async () => {
      const res = await fetchSaleComprobantes(popId!)
      if (!res.success) throw new Error(res.error)
      return res
    },
    enabled: toolboxEnabled,
    ...sessionListQueryOptions,
  })

  const data = catalogQuery.data
  const priceListId = useSalePriceListId(popId)
  const articleCache = useCatalogItemCache<MenuCatalogArticle>(
    menuCatalogKnownArticlesQueryKey(popId ?? "", priceListId),
  )
  const recipeCache = useCatalogItemCache<MenuCatalogRecipe>(
    menuCatalogKnownRecipesQueryKey(popId ?? "", priceListId),
  )
  const [catalogItemsEnsuring, setCatalogItemsEnsuring] = useState(false)

  const reloadCatalog = useCallback(async () => {
    await Promise.all([
      catalogQuery.refetch(),
      paymentQuery.refetch(),
      comprobantesQuery.refetch(),
    ])
  }, [catalogQuery, comprobantesQuery, paymentQuery])

  const mergeArticles = articleCache.merge
  const mergeRecipes = recipeCache.merge
  const knownArticles = articleCache.items
  const knownRecipes = recipeCache.items

  const ensureCatalogItems = useCallback(
    async (articleIds: string[], recipeIds: string[]) => {
      if (!popId) return
      const knownArticleSet = new Set(knownArticles.map((row) => row.id))
      const knownRecipeSet = new Set(knownRecipes.map((row) => row.id))
      const missingArticles = [...new Set(articleIds.filter(Boolean))].filter(
        (id) => !knownArticleSet.has(id),
      )
      const missingRecipes = [...new Set(recipeIds.filter(Boolean))].filter(
        (id) => !knownRecipeSet.has(id),
      )
      if (missingArticles.length === 0 && missingRecipes.length === 0) return

      setCatalogItemsEnsuring(true)
      try {
        const res = await fetchMenuCatalogItemsByIds(
          popId,
          missingArticles,
          missingRecipes,
          priceListId,
        )
        if (!res.success) return
        mergeArticles(res.articles)
        mergeRecipes(res.recipes)
      } finally {
        setCatalogItemsEnsuring(false)
      }
    },
    [
      knownArticles,
      knownRecipes,
      mergeArticles,
      mergeRecipes,
      popId,
      priceListId,
    ],
  )

  return {
    mergeCatalogArticles: mergeArticles,
    mergeCatalogRecipes: mergeRecipes,
    ensureCatalogItems,
    menuCategorySections: data?.categorySections ?? [],
    menuRecipes: recipeCache.items,
    menuArticles: articleCache.items,
    menuPromotions: data?.promotions ?? [],
    menuQuantityDeals: data?.quantityDeals ?? [],
    treasuryPaymentContext: paymentQuery.data ?? null,
    canReadClients: data?.canReadClients ?? false,
    canCreateSale: data?.canCreateSale ?? false,
    canReadCashRegisters: data?.canReadCashRegisters ?? false,
    openCashSession: data?.openCashSession ?? null,
    invoiceTypeSiteId:
      comprobantesQuery.data?.invoiceTypeSiteId ??
      data?.invoiceTypeSiteId ??
      DEFAULT_SALE_SITE_ID,
    hasValidPopFiscalCuit:
      comprobantesQuery.data?.hasValidFiscalCuit ?? false,
    popEmisorIvaCondition:
      comprobantesQuery.data?.emisorIvaCondition ?? "responsable_inscripto",
    comprobanteOptions: comprobantesQuery.data?.options ?? [],
    comprobanteEmitter: comprobantesQuery.data?.emitter ?? null,
    comprobantesLoaded: comprobantesQuery.isSuccess,
    catalogLoading: catalogQuery.isLoading,
    catalogItemsEnsuring,
    catalogError:
      catalogQuery.error instanceof Error
        ? catalogQuery.error.message
        : catalogQuery.error
          ? String(catalogQuery.error)
          : null,
    catalogLoadAttempted: catalogQuery.isFetched,
    toolboxLoading: paymentQuery.isLoading || comprobantesQuery.isLoading,
    reloadCatalog,
  }
}
