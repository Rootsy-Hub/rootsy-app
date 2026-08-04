"use client"

import { getMenuCatalog } from "@/app/[siteId]/[popId]/menu-catalog/actions"
import {
  menuCatalogPayloadFromResponse,
  type MenuCatalogPayload,
} from "@/lib/menuCatalogPayload"
import { menuCatalogQueryKey } from "@/lib/queryKeys"
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
      const res = await getMenuCatalog(popId!)
      if (!res.success) {
        throw new Error(res.error)
      }
      return menuCatalogPayloadFromResponse(res)
    },
    enabled,
  })

  const payload = catalogQuery.data ?? emptyPayload

  const reloadCatalog = useCallback(async () => {
    await catalogQuery.refetch()
  }, [catalogQuery])

  return {
    menuCategorySections: payload.categorySections,
    menuRecipes: payload.recipes,
    menuArticles: payload.articles,
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
