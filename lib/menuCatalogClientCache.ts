import type {
  MenuCatalogArticle,
  MenuCatalogCategorySection,
  MenuCatalogPromotion,
  MenuCatalogRecipe,
} from "@/app/[siteId]/[popId]/menu-catalog/actions"
import type { SaleCatalogClient, SaleOpenCashSession } from "@/app/[siteId]/[popId]/sale/actions"
import type { TreasuryPaymentContext } from "@/lib/treasuryPaymentOptions"

const STORAGE_PREFIX = "rootsy:menu-catalog:v1:"

export type MenuCatalogPayload = {
  popName: string
  categorySections: MenuCatalogCategorySection[]
  recipes: MenuCatalogRecipe[]
  articles: MenuCatalogArticle[]
  promotions: MenuCatalogPromotion[]
  quantityDeals: MenuCatalogPromotion[]
  clients: SaleCatalogClient[]
  treasuryPaymentContext: TreasuryPaymentContext | null
  canReadClients: boolean
  canReadPaymentMethods: boolean
  canCreateSale: boolean
  canReadCashRegisters: boolean
  openCashSession: SaleOpenCashSession | null
  invoiceTypeSiteId: string
}

type MenuCatalogCacheEntry = {
  catalogRev: number
  permissionsRev: number
  cachedAt: number
  data: MenuCatalogPayload
}

function storageKey(
  popId: string,
  catalogRev: number,
  permissionsRev: number,
) {
  return `${STORAGE_PREFIX}${popId}:${catalogRev}:${permissionsRev}`
}

function canUseSessionStorage() {
  return typeof window !== "undefined" && typeof window.sessionStorage !== "undefined"
}

export function readMenuCatalogCache(
  popId: string,
  catalogRev: number,
  permissionsRev: number,
): MenuCatalogPayload | null {
  if (!canUseSessionStorage()) return null
  try {
    const raw = window.sessionStorage.getItem(
      storageKey(popId, catalogRev, permissionsRev),
    )
    if (!raw) return null
    const parsed = JSON.parse(raw) as MenuCatalogCacheEntry
    if (
      parsed?.data &&
      parsed.catalogRev === catalogRev &&
      parsed.permissionsRev === permissionsRev
    ) {
      return parsed.data
    }
    return null
  } catch {
    return null
  }
}

export function writeMenuCatalogCache(
  popId: string,
  catalogRev: number,
  permissionsRev: number,
  data: MenuCatalogPayload,
): void {
  if (!canUseSessionStorage()) return
  try {
    const entry: MenuCatalogCacheEntry = {
      catalogRev,
      permissionsRev,
      cachedAt: Date.now(),
      data,
    }
    window.sessionStorage.setItem(
      storageKey(popId, catalogRev, permissionsRev),
      JSON.stringify(entry),
    )
  } catch {
    /* quota / private mode */
  }
}

export function clearMenuCatalogCache(popId: string): void {
  if (!canUseSessionStorage()) return
  try {
    const prefix = `${STORAGE_PREFIX}${popId}:`
    const keys: string[] = []
    for (let i = 0; i < window.sessionStorage.length; i++) {
      const key = window.sessionStorage.key(i)
      if (key?.startsWith(prefix)) keys.push(key)
    }
    for (const key of keys) {
      window.sessionStorage.removeItem(key)
    }
  } catch {
    /* ignore */
  }
}

export function menuCatalogPayloadFromResponse(res: {
  popName: string
  categorySections: MenuCatalogCategorySection[]
  recipes: MenuCatalogRecipe[]
  articles: MenuCatalogArticle[]
  promotions: MenuCatalogPromotion[]
  quantityDeals: MenuCatalogPromotion[]
  clients: SaleCatalogClient[]
  treasuryPaymentContext: TreasuryPaymentContext | null
  canReadClients: boolean
  canReadPaymentMethods: boolean
  canCreateSale: boolean
  canReadCashRegisters: boolean
  openCashSession: SaleOpenCashSession | null
  invoiceTypeSiteId: string
}): MenuCatalogPayload {
  return {
    popName: res.popName,
    categorySections: res.categorySections,
    recipes: res.recipes,
    articles: res.articles,
    promotions: res.promotions,
    quantityDeals: res.quantityDeals,
    clients: res.clients,
    treasuryPaymentContext: res.treasuryPaymentContext,
    canReadClients: res.canReadClients,
    canReadPaymentMethods: res.canReadPaymentMethods,
    canCreateSale: res.canCreateSale,
    canReadCashRegisters: res.canReadCashRegisters,
    openCashSession: res.openCashSession,
    invoiceTypeSiteId: res.invoiceTypeSiteId,
  }
}
