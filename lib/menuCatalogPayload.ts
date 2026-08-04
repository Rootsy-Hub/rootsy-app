import type {
  MenuCatalogArticle,
  MenuCatalogCategorySection,
  MenuCatalogPromotion,
  MenuCatalogRecipe,
} from "@/app/[siteId]/[popId]/menu-catalog/actions"
import type { SaleCatalogClient, SaleOpenCashSession } from "@/app/[siteId]/[popId]/sale/actions"
import type { TreasuryPaymentContext } from "@/lib/treasuryPaymentOptions"

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
