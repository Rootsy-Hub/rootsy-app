"use client"

import type {
  MenuCatalogArticle,
  MenuCatalogRecipe,
} from "@/app/[siteId]/[popId]/menu-catalog/actions"
import { useCatalogItemCache } from "@/hooks/useCatalogItemCache"
import { useOpenCashSession } from "@/hooks/useOpenCashSession"
import { resolveOperateOpenCashSession } from "@/lib/saleOpenCashSession"
import {
  catalogEnsureInflightKey,
  missingCatalogIds,
  resolveCatalogItemsFromLocalDb,
} from "@/lib/menuCatalogEnsureFromLocal"
import {
  getOpenedPopLocalDb,
  peekPopLocalDb,
} from "@/lib/popLocalDb/store"
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
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useCallback, useMemo, useRef, useState } from "react"

const catalogEnsureInflight = new Map<string, Promise<void>>()

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
  const operateCash = useOpenCashSession(popId, { enabled: Boolean(popId) })
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
      paymentQuery.data,
    ],
  )
  const queryClient = useQueryClient()
  const priceListId = useSalePriceListId(popId)
  const articleCache = useCatalogItemCache<MenuCatalogArticle>(
    menuCatalogKnownArticlesQueryKey(popId ?? "", priceListId),
  )
  const recipeCache = useCatalogItemCache<MenuCatalogRecipe>(
    menuCatalogKnownRecipesQueryKey(popId ?? "", priceListId),
  )
  const [catalogItemsEnsuring, setCatalogItemsEnsuring] = useState(false)
  const ensuringCountRef = useRef(0)

  const reloadCatalog = useCallback(async () => {
    await Promise.all([
      catalogQuery.refetch(),
      paymentQuery.refetch(),
      comprobantesQuery.refetch(),
    ])
  }, [catalogQuery, comprobantesQuery, paymentQuery])

  const mergeArticles = articleCache.merge
  const mergeRecipes = recipeCache.merge

  const ensureCatalogItems = useCallback(
    async (articleIds: string[], recipeIds: string[]) => {
      if (!popId) return
      const uniqueArticles = [...new Set(articleIds.filter(Boolean))]
      const uniqueRecipes = [...new Set(recipeIds.filter(Boolean))]
      if (uniqueArticles.length === 0 && uniqueRecipes.length === 0) return

      const inflightKey = catalogEnsureInflightKey(
        popId,
        priceListId,
        uniqueArticles,
        uniqueRecipes,
      )
      const existing = catalogEnsureInflight.get(inflightKey)
      if (existing) {
        await existing
        return
      }

      const work = (async () => {
        const knownArticles =
          queryClient.getQueryData<MenuCatalogArticle[]>(
            menuCatalogKnownArticlesQueryKey(popId, priceListId),
          ) ?? []
        const knownRecipes =
          queryClient.getQueryData<MenuCatalogRecipe[]>(
            menuCatalogKnownRecipesQueryKey(popId, priceListId),
          ) ?? []
        let missingArticles = missingCatalogIds(
          uniqueArticles,
          knownArticles.map((row) => row.id),
        )
        let missingRecipes = missingCatalogIds(
          uniqueRecipes,
          knownRecipes.map((row) => row.id),
        )
        if (missingArticles.length === 0 && missingRecipes.length === 0) return

        const handlePromise = peekPopLocalDb(popId) ?? getOpenedPopLocalDb(popId)
        try {
          const handle = await handlePromise
          const local = resolveCatalogItemsFromLocalDb(
            handle.database,
            missingArticles,
            missingRecipes,
            priceListId,
          )
          if (local.articles.length) mergeArticles(local.articles)
          if (local.recipes.length) mergeRecipes(local.recipes)
          const localArticleIds = new Set(local.articles.map((row) => row.id))
          const localRecipeIds = new Set(local.recipes.map((row) => row.id))
          missingArticles = missingArticles.filter((id) => !localArticleIds.has(id))
          missingRecipes = missingRecipes.filter((id) => !localRecipeIds.has(id))
        } catch {
          // OPFS no disponible: seguir con HTTP solo si falta de verdad.
        }

        if (missingArticles.length === 0 && missingRecipes.length === 0) return

        ensuringCountRef.current += 1
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
          ensuringCountRef.current = Math.max(0, ensuringCountRef.current - 1)
          setCatalogItemsEnsuring(ensuringCountRef.current > 0)
        }
      })()

      catalogEnsureInflight.set(inflightKey, work)
      try {
        await work
      } finally {
        catalogEnsureInflight.delete(inflightKey)
      }
    },
    [
      mergeArticles,
      mergeRecipes,
      popId,
      priceListId,
      queryClient,
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
    openCashSession,
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
