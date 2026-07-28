"use client"

import { getMenuCatalog } from "@/app/[siteId]/[popId]/menu-catalog/actions"
import type {
  MenuCatalogArticle,
  MenuCatalogCategorySection,
  MenuCatalogPromotion,
  MenuCatalogRecipe,
} from "@/app/[siteId]/[popId]/menu-catalog/actions"
import type { SaleCatalogClient, SaleOpenCashSession } from "@/app/[siteId]/[popId]/sale/actions"
import { usePopWorkspaceOptional } from "@/context/PopWorkspaceContext"
import {
  menuCatalogPayloadFromResponse,
  readMenuCatalogCache,
  writeMenuCatalogCache,
} from "@/lib/menuCatalogClientCache"
import { DEFAULT_SALE_SITE_ID } from "@/lib/saleInvoiceTypes"
import type { TreasuryPaymentContext } from "@/lib/treasuryPaymentOptions"
import { useCallback, useEffect, useRef, useState } from "react"

type UseMenuCatalogLoaderOptions = {
  /** Si false, no pide el catálogo hasta que haga falta (lazy). */
  enabled?: boolean
}

export function useMenuCatalogLoader(
  popId: string | undefined,
  options?: UseMenuCatalogLoaderOptions,
) {
  const enabled = options?.enabled !== false
  const workspace = usePopWorkspaceOptional()
  const catalogRev = workspace?.cacheRevisions?.catalogRev ?? 1
  const permissionsRev = workspace?.cacheRevisions?.permissionsRev ?? 1

  const [menuCategorySections, setMenuCategorySections] = useState<
    MenuCatalogCategorySection[]
  >([])
  const [menuRecipes, setMenuRecipes] = useState<MenuCatalogRecipe[]>([])
  const [menuArticles, setMenuArticles] = useState<MenuCatalogArticle[]>([])
  const [menuPromotions, setMenuPromotions] = useState<MenuCatalogPromotion[]>([])
  const [menuQuantityDeals, setMenuQuantityDeals] = useState<MenuCatalogPromotion[]>([])
  const [saleClients, setSaleClients] = useState<SaleCatalogClient[]>([])
  const [treasuryPaymentContext, setTreasuryPaymentContext] =
    useState<TreasuryPaymentContext | null>(null)
  const [canReadClients, setCanReadClients] = useState(false)
  const [canCreateSale, setCanCreateSale] = useState(false)
  const [canReadCashRegisters, setCanReadCashRegisters] = useState(false)
  const [openCashSession, setOpenCashSession] = useState<SaleOpenCashSession | null>(
    null,
  )
  const [invoiceTypeSiteId, setInvoiceTypeSiteId] = useState<string>(
    DEFAULT_SALE_SITE_ID,
  )
  const [catalogLoading, setCatalogLoading] = useState(false)
  const [catalogError, setCatalogError] = useState<string | null>(null)
  const [catalogLoadAttempted, setCatalogLoadAttempted] = useState(false)

  const fetchGenRef = useRef(0)

  const applyPayload = useCallback(
    (payload: ReturnType<typeof menuCatalogPayloadFromResponse>) => {
      setMenuCategorySections(payload.categorySections)
      setMenuRecipes(payload.recipes)
      setMenuArticles(payload.articles)
      setMenuPromotions(payload.promotions)
      setMenuQuantityDeals(payload.quantityDeals)
      setSaleClients(payload.clients)
      setTreasuryPaymentContext(payload.treasuryPaymentContext)
      setCanReadClients(payload.canReadClients)
      setCanCreateSale(payload.canCreateSale)
      setCanReadCashRegisters(payload.canReadCashRegisters)
      setOpenCashSession(payload.openCashSession)
      setInvoiceTypeSiteId(payload.invoiceTypeSiteId)
    },
    [],
  )

  const clearCatalog = useCallback(() => {
    setMenuCategorySections([])
    setMenuRecipes([])
    setMenuArticles([])
    setMenuPromotions([])
    setMenuQuantityDeals([])
    setSaleClients([])
    setTreasuryPaymentContext(null)
    setCanReadClients(false)
    setCanCreateSale(false)
    setCanReadCashRegisters(false)
    setOpenCashSession(null)
    setInvoiceTypeSiteId(DEFAULT_SALE_SITE_ID)
  }, [])

  const loadCatalog = useCallback(async () => {
    if (!popId) {
      clearCatalog()
      setCatalogError(null)
      setCatalogLoading(false)
      return
    }

    const gen = ++fetchGenRef.current
    setCatalogLoadAttempted(true)

    const cached = readMenuCatalogCache(popId, catalogRev, permissionsRev)
    if (cached) {
      applyPayload(cached)
      setCatalogError(null)
      setCatalogLoading(false)
    } else {
      setCatalogLoading(true)
    }

    const res = await getMenuCatalog(popId)
    if (gen !== fetchGenRef.current) return

    if (!res.success) {
      if (!cached) {
        clearCatalog()
        setCatalogError(res.error)
      }
      setCatalogLoading(false)
      return
    }

    const payload = menuCatalogPayloadFromResponse(res)
    applyPayload(payload)
    writeMenuCatalogCache(popId, catalogRev, permissionsRev, payload)
    setCatalogError(null)
    setCatalogLoading(false)
  }, [
    popId,
    catalogRev,
    permissionsRev,
    applyPayload,
    clearCatalog,
  ])

  useEffect(() => {
    if (!enabled) {
      setCatalogLoading(false)
      return
    }
    void loadCatalog()
  }, [enabled, loadCatalog])

  return {
    menuCategorySections,
    menuRecipes,
    menuArticles,
    menuPromotions,
    menuQuantityDeals,
    saleClients,
    treasuryPaymentContext,
    canReadClients,
    canCreateSale,
    canReadCashRegisters,
    openCashSession,
    invoiceTypeSiteId,
    catalogLoading,
    catalogError,
    catalogLoadAttempted,
    reloadCatalog: loadCatalog,
  }
}
