"use client"

import {
  getMenuCatalog,
  getMenuCatalogItemsByIds,
  type MenuCatalogArticle,
  type MenuCatalogRecipe,
} from "@/app/[siteId]/[popId]/menu-catalog/actions"
import { useCatalogItemCache } from "@/hooks/useCatalogItemCache"
import {
  menuCatalogPayloadFromResponse,
  type MenuCatalogPayload,
} from "@/lib/menuCatalogPayload"
import {
  menuCatalogKnownArticlesQueryKey,
  menuCatalogKnownRecipesQueryKey,
  menuCatalogQueryKey,
} from "@/lib/queryKeys"
import { sessionListQueryOptions } from "@/lib/queryStaleTimes"
import { useSalePriceListId } from "@/lib/salePriceListSession"
import { DEFAULT_SALE_SITE_ID } from "@/lib/saleInvoiceTypes"
import { useQuery } from "@tanstack/react-query"
import { useCallback } from "react"

type UseMenuCatalogLoaderOptions = {
  /** Si false, no pide el catálogo hasta que haga falta (lazy). */
  enabled?: boolean
}

const emptyPayload: MenuCatalogPayload = {
  popName: "",
  categorySections: [],
  recipes: [],
  articles: [],
  promotions: [],
  quantityDeals: [],
  clients: [],
  treasuryPaymentContext: null,
  canReadClients: false,
  canReadPaymentMethods: false,
  canCreateSale: false,
  canReadCashRegisters: false,
  openCashSession: null,
  invoiceTypeSiteId: DEFAULT_SALE_SITE_ID,
}

export function useMenuCatalogLoader(
  popId: string | undefined,
  options?: UseMenuCatalogLoaderOptions,
) {
  const enabled = options?.enabled !== false && Boolean(popId)

  const catalogQuery = useQuery({
    queryKey: menuCatalogQueryKey(popId ?? ""),
    queryFn: async () => {
      const res = await getMenuCatalog(popId!, { items: "none" })
      if (!res.success) {
        throw new Error(res.error)
      }
      return menuCatalogPayloadFromResponse(res)
    },
    enabled,
    ...sessionListQueryOptions,
  })

  const payload = catalogQuery.data ?? emptyPayload
  const priceListId = useSalePriceListId(popId)
  const articleCache = useCatalogItemCache<MenuCatalogArticle>(
    menuCatalogKnownArticlesQueryKey(popId ?? "", priceListId),
  )
  const recipeCache = useCatalogItemCache<MenuCatalogRecipe>(
    menuCatalogKnownRecipesQueryKey(popId ?? "", priceListId),
  )

  const reloadCatalog = useCallback(async () => {
    await catalogQuery.refetch()
  }, [catalogQuery])

  const knownArticles = articleCache.items
  const knownRecipes = recipeCache.items
  const mergeArticles = articleCache.merge
  const mergeRecipes = recipeCache.merge
  const ensureCatalogItems = useCallback(
    async (articleIds: string[], recipeIds: string[]) => {
      if (!popId) return
      const knownArticleIds = new Set(knownArticles.map((row) => row.id))
      const knownRecipeIds = new Set(knownRecipes.map((row) => row.id))
      const missingArticles = [...new Set(articleIds)].filter(
        (id) => id && !knownArticleIds.has(id),
      )
      const missingRecipes = [...new Set(recipeIds)].filter(
        (id) => id && !knownRecipeIds.has(id),
      )
      if (missingArticles.length === 0 && missingRecipes.length === 0) return
      const res = await getMenuCatalogItemsByIds(
        popId,
        missingArticles,
        missingRecipes,
        priceListId,
      )
      if (!res.success) return
      mergeArticles(res.articles)
      mergeRecipes(res.recipes)
    },
    [knownArticles, knownRecipes, mergeArticles, mergeRecipes, popId, priceListId],
  )

  return {
    mergeCatalogArticles: mergeArticles,
    mergeCatalogRecipes: mergeRecipes,
    ensureCatalogItems,
    menuCategorySections: payload.categorySections,
    menuRecipes: recipeCache.items,
    menuArticles: articleCache.items,
    menuPromotions: payload.promotions,
    menuQuantityDeals: payload.quantityDeals,
    treasuryPaymentContext: payload.treasuryPaymentContext,
    canReadClients: payload.canReadClients,
    canCreateSale: payload.canCreateSale,
    canReadCashRegisters: payload.canReadCashRegisters,
    openCashSession: payload.openCashSession,
    invoiceTypeSiteId: payload.invoiceTypeSiteId,
    catalogLoading: catalogQuery.isLoading,
    catalogError:
      catalogQuery.error instanceof Error
        ? catalogQuery.error.message
        : catalogQuery.error
          ? String(catalogQuery.error)
          : null,
    catalogLoadAttempted: catalogQuery.isFetched,
    reloadCatalog,
  }
}
