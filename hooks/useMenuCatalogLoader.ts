"use client"

import {
  getMenuCatalog,
  getMenuCatalogItemsByIds,
  type MenuCatalogArticle,
  type MenuCatalogRecipe,
} from "@/app/[siteId]/[popId]/menu-catalog/actions"
import {
  menuCatalogPayloadFromResponse,
  type MenuCatalogPayload,
} from "@/lib/menuCatalogPayload"
import { menuCatalogQueryKey } from "@/lib/queryKeys"
import { operateCatalogQueryOptions } from "@/lib/queryStaleTimes"
import { useSalePriceListId } from "@/lib/salePriceListSession"
import { DEFAULT_SALE_SITE_ID } from "@/lib/saleInvoiceTypes"
import { useQuery } from "@tanstack/react-query"
import { useCallback, useEffect, useRef, useState } from "react"

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

function mergeById<T extends { id: string }>(prev: T[], rows: T[]): T[] {
  if (rows.length === 0) return prev
  const map = new Map(prev.map((row) => [row.id, row]))
  let changed = false
  for (const row of rows) {
    if (map.get(row.id) !== row) {
      map.set(row.id, row)
      changed = true
    }
  }
  return changed ? [...map.values()] : prev
}

export function useMenuCatalogLoader(
  popId: string | undefined,
  options?: UseMenuCatalogLoaderOptions,
) {
  const enabled = options?.enabled !== false && Boolean(popId)
  const priceListId = useSalePriceListId(popId)

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
    ...operateCatalogQueryOptions,
  })

  const payload = catalogQuery.data ?? emptyPayload
  const [knownArticles, setKnownArticles] = useState<MenuCatalogArticle[]>([])
  const [knownRecipes, setKnownRecipes] = useState<MenuCatalogRecipe[]>([])
  const [catalogItemsEnsuring, setCatalogItemsEnsuring] = useState(false)
  const knownArticleIdsRef = useRef(new Set<string>())
  const knownRecipeIdsRef = useRef(new Set<string>())
  const lookedUpArticleIdsRef = useRef(new Set<string>())
  const lookedUpRecipeIdsRef = useRef(new Set<string>())

  useEffect(() => {
    knownArticleIdsRef.current = new Set(knownArticles.map((row) => row.id))
  }, [knownArticles])

  useEffect(() => {
    knownRecipeIdsRef.current = new Set(knownRecipes.map((row) => row.id))
  }, [knownRecipes])

  useEffect(() => {
    setKnownArticles([])
    setKnownRecipes([])
    knownArticleIdsRef.current = new Set()
    knownRecipeIdsRef.current = new Set()
    lookedUpArticleIdsRef.current = new Set()
    lookedUpRecipeIdsRef.current = new Set()
  }, [popId, priceListId])

  const mergeArticles = useCallback((rows: MenuCatalogArticle[]) => {
    setKnownArticles((prev) => mergeById(prev, rows))
  }, [])

  const mergeRecipes = useCallback((rows: MenuCatalogRecipe[]) => {
    setKnownRecipes((prev) => mergeById(prev, rows))
  }, [])

  const reloadCatalog = useCallback(async () => {
    await catalogQuery.refetch()
  }, [catalogQuery])

  const ensureCatalogItems = useCallback(
    async (articleIds: string[], recipeIds: string[]) => {
      if (!popId) return
      const missingArticles = [...new Set(articleIds.filter(Boolean))].filter(
        (id) =>
          !knownArticleIdsRef.current.has(id) &&
          !lookedUpArticleIdsRef.current.has(id),
      )
      const missingRecipes = [...new Set(recipeIds.filter(Boolean))].filter(
        (id) =>
          !knownRecipeIdsRef.current.has(id) &&
          !lookedUpRecipeIdsRef.current.has(id),
      )
      if (missingArticles.length === 0 && missingRecipes.length === 0) return

      setCatalogItemsEnsuring(true)
      try {
        const res = await getMenuCatalogItemsByIds(
          popId,
          missingArticles,
          missingRecipes,
          priceListId,
        )
        if (!res.success) return
        for (const id of missingArticles) lookedUpArticleIdsRef.current.add(id)
        for (const id of missingRecipes) lookedUpRecipeIdsRef.current.add(id)
        mergeArticles(res.articles)
        mergeRecipes(res.recipes)
      } finally {
        setCatalogItemsEnsuring(false)
      }
    },
    [mergeArticles, mergeRecipes, popId, priceListId],
  )

  return {
    mergeCatalogArticles: mergeArticles,
    mergeCatalogRecipes: mergeRecipes,
    ensureCatalogItems,
    menuCategorySections: payload.categorySections,
    menuRecipes: knownRecipes,
    menuArticles: knownArticles,
    menuPromotions: payload.promotions,
    menuQuantityDeals: payload.quantityDeals,
    treasuryPaymentContext: payload.treasuryPaymentContext,
    canReadClients: payload.canReadClients,
    canCreateSale: payload.canCreateSale,
    canReadCashRegisters: payload.canReadCashRegisters,
    openCashSession: payload.openCashSession,
    invoiceTypeSiteId: payload.invoiceTypeSiteId,
    catalogLoading: catalogQuery.isLoading,
    catalogItemsEnsuring,
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
